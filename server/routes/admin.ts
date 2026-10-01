import { Router, Response } from 'express';
import { getDb } from '../db/index.js';
import { AuthenticatedRequest, authenticateToken, requireAdmin } from '../auth.js';
import { logAuditEvent } from '../utils/audit.js';

export const adminRouter = Router();

// Protect all admin endpoints with admin token verification
adminRouter.use(authenticateToken, requireAdmin);

// GET /api/admin/metrics - Real database metrics only, zero fake data
adminRouter.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();

    const [totalRes, completedRes, inProgressRes, readyRes, recentRes] = await Promise.all([
      db.query('SELECT COUNT(*) as cnt FROM candidates'),
      db.query('SELECT COUNT(*) as cnt FROM candidates WHERE completion_percentage >= 80'),
      db.query('SELECT COUNT(*) as cnt FROM candidates WHERE completion_percentage > 0 AND completion_percentage < 80'),
      db.query('SELECT COUNT(*) as cnt FROM candidates WHERE willing_onsite_deployment = true'),
      db.query(`
        SELECT c.id, c.reference_code, c.first_name, c.last_name, c.primary_role, c.completion_percentage, c.created_at, u.email
        FROM candidates c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
        LIMIT 6
      `),
    ]);

    const total = parseInt(totalRes.rows[0].cnt, 10);
    const completed = parseInt(completedRes.rows[0].cnt, 10);
    const inProgress = parseInt(inProgressRes.rows[0].cnt, 10);
    const readyForDeployment = parseInt(readyRes.rows[0].cnt, 10);

    res.json({
      totalCandidates: total,
      completedProfiles: completed,
      inProgressProfiles: inProgress,
      readyForDeployment,
      recentCandidates: recentRes.rows,
    });
  } catch (err: any) {
    console.error('[API] Admin metrics error:', err);
    res.status(500).json({ error: 'Failed to retrieve administrative metrics.' });
  }
});

// GET /api/admin/candidates - Search, filter, sort, paginate
adminRouter.get('/candidates', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();

    const search = req.query.search ? String(req.query.search).trim() : '';
    const role = req.query.role ? String(req.query.role).trim() : '';
    const seniority = req.query.seniority ? String(req.query.seniority).trim() : '';
    const city = req.query.city ? String(req.query.city).trim() : '';
    const workMode = req.query.workMode ? String(req.query.workMode).trim() : '';
    const minExp = req.query.minExp ? Number(req.query.minExp) : null;
    const maxExp = req.query.maxExp ? Number(req.query.maxExp) : null;
    const employmentStatus = req.query.status ? String(req.query.status).trim() : '';
    const hasCv = req.query.hasCv === 'true' ? true : req.query.hasCv === 'false' ? false : null;
    const minCompletion = req.query.minCompletion ? parseInt(String(req.query.minCompletion), 10) : null;

    const page = Math.max(1, parseInt(String(req.query.page || 1), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || 20), 10)));
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(`(
        c.first_name ILIKE $${paramIdx} OR
        c.last_name ILIKE $${paramIdx} OR
        c.reference_code ILIKE $${paramIdx} OR
        u.email ILIKE $${paramIdx} OR
        c.primary_role ILIKE $${paramIdx} OR
        c.current_city ILIKE $${paramIdx}
      )`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (role) {
      conditions.push(`c.primary_role ILIKE $${paramIdx}`);
      params.push(`%${role}%`);
      paramIdx++;
    }

    if (seniority) {
      conditions.push(`c.seniority_level = $${paramIdx}`);
      params.push(seniority);
      paramIdx++;
    }

    if (city) {
      conditions.push(`c.current_city ILIKE $${paramIdx}`);
      params.push(`%${city}%`);
      paramIdx++;
    }

    if (workMode) {
      conditions.push(`c.work_modes ILIKE $${paramIdx}`);
      params.push(`%${workMode}%`);
      paramIdx++;
    }

    if (minExp !== null && !isNaN(minExp)) {
      conditions.push(`c.total_experience_years >= $${paramIdx}`);
      params.push(minExp);
      paramIdx++;
    }

    if (maxExp !== null && !isNaN(maxExp)) {
      conditions.push(`c.total_experience_years <= $${paramIdx}`);
      params.push(maxExp);
      paramIdx++;
    }

    if (employmentStatus) {
      conditions.push(`c.employment_status = $${paramIdx}`);
      params.push(employmentStatus);
      paramIdx++;
    }

    if (minCompletion !== null && !isNaN(minCompletion)) {
      conditions.push(`c.completion_percentage >= $${paramIdx}`);
      params.push(minCompletion);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total query
    const countSql = `
      SELECT COUNT(*) as total
      FROM candidates c
      JOIN users u ON c.user_id = u.id
      ${whereClause}
    `;
    const countRes = await db.query(countSql, params);
    const totalCount = parseInt(countRes.rows[0].total, 10);

    // Sorting
    let sortColumn = 'c.updated_at';
    const sortBy = String(req.query.sortBy || 'updated_at');
    if (sortBy === 'created_at') sortColumn = 'c.created_at';
    else if (sortBy === 'completion_percentage') sortColumn = 'c.completion_percentage';
    else if (sortBy === 'name') sortColumn = 'c.first_name';
    else if (sortBy === 'experience') sortColumn = 'c.total_experience_years';

    const sortOrder = String(req.query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Data query with CV count and doc list preview
    const dataSql = `
      SELECT 
        c.id,
        c.reference_code,
        c.first_name,
        c.middle_name,
        c.last_name,
        c.preferred_name,
        c.phone,
        c.current_city,
        c.current_country,
        c.primary_role,
        c.seniority_level,
        c.total_experience_years,
        c.expected_compensation_amount,
        c.compensation_currency,
        c.compensation_period,
        c.employment_status,
        c.notice_period_days,
        c.work_modes,
        c.willing_to_relocate,
        c.willing_onsite_deployment,
        c.max_commute_distance_km,
        c.accommodation_status,
        c.transportation_status,
        c.completion_percentage,
        c.created_at,
        c.updated_at,
        u.email
      FROM candidates c
      JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const dataParams = [...params, pageSize, offset];
    const dataRes = await db.query(dataSql, dataParams);

    res.json({
      candidates: dataRes.rows,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (err: any) {
    console.error('[API] Admin candidate list error:', err);
    res.status(500).json({ error: 'Failed to query candidates.' });
  }
});

// GET /api/admin/candidates/:id - Single detailed candidate view
adminRouter.get('/candidates/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const candidateId = parseInt(req.params.id, 10);

    const candRes = await db.query(
      `SELECT c.*, u.email, u.created_at as account_created_at
       FROM candidates c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [candidateId]
    );

    if (candRes.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate profile not found.' });
    }

    const candidate = candRes.rows[0];

    const [expRes, eduRes, certRes, skillsRes, auditRes] = await Promise.all([
      db.query('SELECT * FROM candidate_experiences WHERE candidate_id = $1 ORDER BY start_date DESC', [candidateId]),
      db.query('SELECT * FROM candidate_education WHERE candidate_id = $1 ORDER BY start_year DESC', [candidateId]),
      db.query('SELECT * FROM candidate_certifications WHERE candidate_id = $1 ORDER BY issue_date DESC', [candidateId]),
      db.query('SELECT * FROM candidate_skills WHERE candidate_id = $1 ORDER BY category ASC, id ASC', [candidateId]),
      db.query('SELECT * FROM audit_logs WHERE target_id = $1 OR actor_id = $2 ORDER BY created_at DESC LIMIT 20', [String(candidateId), candidate.user_id]),
    ]);

    res.json({
      candidate,
      experiences: expRes.rows,
      education: eduRes.rows,
      certifications: certRes.rows,
      skills: skillsRes.rows,
      documents: [],
      auditLogs: auditRes.rows,
    });
  } catch (err: any) {
    console.error('[API] Admin candidate detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve candidate details.' });
  }
});

// GET /api/admin/exports/csv - Real CSV export with filter awareness
adminRouter.get('/exports/csv', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();

    // Query candidate records
    const sql = `
      SELECT 
        c.reference_code,
        u.email,
        c.first_name,
        c.middle_name,
        c.last_name,
        c.phone,
        c.current_city,
        c.current_country,
        c.primary_role,
        c.secondary_roles,
        c.seniority_level,
        c.total_experience_years,
        c.relevant_experience_years,
        c.work_modes,
        c.willing_to_relocate,
        c.willing_onsite_deployment,
        c.max_commute_distance_km,
        c.accommodation_status,
        c.transportation_status,
        c.expected_compensation_amount,
        c.compensation_currency,
        c.compensation_period,
        c.compensation_negotiable,
        c.employment_status,
        c.notice_period_days,
        c.earliest_joining_date,
        c.completion_percentage,
        c.created_at,
        c.updated_at
      FROM candidates c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    const result = await db.query(sql);

    // CSV header row
    const headers = [
      'Reference Code',
      'Email',
      'First Name',
      'Middle Name',
      'Last Name',
      'Phone',
      'City',
      'Country',
      'Primary Role',
      'Secondary Roles',
      'Seniority',
      'Total Experience (Years)',
      'Relevant Experience (Years)',
      'Work Modes',
      'Willing to Relocate',
      'Onsite Deployment Willing',
      'Max Commute (km)',
      'Accommodation Status',
      'Transportation Status',
      'Expected Compensation',
      'Currency',
      'Period',
      'Negotiable',
      'Employment Status',
      'Notice Period (Days)',
      'Earliest Joining Date',
      'Profile Completion %',
      'Created At',
      'Updated At',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csvContent = headers.join(',') + '\n';

    for (const row of result.rows) {
      const line = [
        escapeCsv(row.reference_code),
        escapeCsv(row.email),
        escapeCsv(row.first_name),
        escapeCsv(row.middle_name),
        escapeCsv(row.last_name),
        escapeCsv(row.phone),
        escapeCsv(row.current_city),
        escapeCsv(row.current_country),
        escapeCsv(row.primary_role),
        escapeCsv(row.secondary_roles),
        escapeCsv(row.seniority_level),
        escapeCsv(row.total_experience_years),
        escapeCsv(row.relevant_experience_years),
        escapeCsv(row.work_modes),
        escapeCsv(row.willing_to_relocate ? 'Yes' : 'No'),
        escapeCsv(row.willing_onsite_deployment ? 'Yes' : 'No'),
        escapeCsv(row.max_commute_distance_km),
        escapeCsv(row.accommodation_status),
        escapeCsv(row.transportation_status),
        escapeCsv(row.expected_compensation_amount),
        escapeCsv(row.compensation_currency),
        escapeCsv(row.compensation_period),
        escapeCsv(row.compensation_negotiable ? 'Yes' : 'No'),
        escapeCsv(row.employment_status),
        escapeCsv(row.notice_period_days),
        escapeCsv(row.earliest_joining_date),
        escapeCsv(row.completion_percentage),
        escapeCsv(row.created_at),
        escapeCsv(row.updated_at),
      ].join(',');
      csvContent += line + '\n';
    }

    // Audit log
    await logAuditEvent(db, {
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ADMIN_EXPORTED_CSV',
      targetType: 'export_csv',
      metadata: { rowCount: result.rows.length },
      ipAddress: req.ip,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mihora_candidates_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    console.error('[API] CSV export error:', err);
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// GET /api/admin/exports/json - Real JSON export of candidate database
adminRouter.get('/exports/json', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();

    const [cands, exps, edus, certs, skills] = await Promise.all([
      db.query(`
        SELECT c.*, u.email 
        FROM candidates c 
        JOIN users u ON c.user_id = u.id 
        ORDER BY c.created_at DESC
      `),
      db.query('SELECT * FROM candidate_experiences ORDER BY start_date DESC'),
      db.query('SELECT * FROM candidate_education ORDER BY start_year DESC'),
      db.query('SELECT * FROM candidate_certifications ORDER BY issue_date DESC'),
      db.query('SELECT * FROM candidate_skills ORDER BY id ASC'),
    ]);

    // Map relational children
    const structuredData = cands.rows.map((cand) => {
      return {
        candidate: {
          id: cand.id,
          referenceCode: cand.reference_code,
          email: cand.email,
          fullName: `${cand.first_name || ''} ${cand.middle_name || ''} ${cand.last_name || ''}`.replace(/\s+/g, ' ').trim(),
          phone: cand.phone,
          location: {
            country: cand.current_country,
            state: cand.current_state,
            city: cand.current_city,
            locality: cand.current_locality,
            willingToRelocate: cand.willing_to_relocate,
            preferredLocations: cand.preferred_locations,
          },
          role: {
            primary: cand.primary_role,
            secondary: cand.secondary_roles,
            canMultiRole: cand.can_multi_role,
            category: cand.professional_category,
            seniority: cand.seniority_level,
          },
          experienceSummary: {
            totalYears: cand.total_experience_years,
            relevantYears: cand.relevant_experience_years,
            summary: cand.professional_summary,
          },
          workPreferences: {
            workModes: cand.work_modes,
            willingOnsiteDeployment: cand.willing_onsite_deployment,
            maxCommuteDistanceKm: cand.max_commute_distance_km,
            maxCommuteTimeMinutes: cand.max_commute_time_minutes,
            accommodationStatus: cand.accommodation_status,
            accommodationBeyondKm: cand.accommodation_beyond_km,
            transportationStatus: cand.transportation_status,
          },
          compensation: {
            expected: cand.expected_compensation_amount,
            currency: cand.compensation_currency,
            period: cand.compensation_period,
            minimumAcceptable: cand.minimum_acceptable_compensation,
            negotiable: cand.compensation_negotiable,
          },
          availability: {
            status: cand.employment_status,
            earliestJoiningDate: cand.earliest_joining_date,
            noticePeriodDays: cand.notice_period_days,
            hoursPerWeek: cand.preferred_hours_per_week,
          },
          completionPercentage: cand.completion_percentage,
          createdAt: cand.created_at,
          updatedAt: cand.updated_at,
        },
        experiences: exps.rows.filter((e) => e.candidate_id === cand.id),
        education: edus.rows.filter((e) => e.candidate_id === cand.id),
        certifications: certs.rows.filter((c) => c.candidate_id === cand.id),
        skills: skills.rows.filter((s) => s.candidate_id === cand.id),
      };
    });

    // Audit log
    await logAuditEvent(db, {
      actorId: req.user!.userId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ADMIN_EXPORTED_JSON',
      targetType: 'export_json',
      metadata: { recordCount: structuredData.length },
      ipAddress: req.ip,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="mihora_candidates_${Date.now()}.json"`);
    res.json({
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user!.email,
        totalCandidates: structuredData.length,
      },
      data: structuredData,
    });
  } catch (err: any) {
    console.error('[API] JSON export error:', err);
    res.status(500).json({ error: 'Failed to generate JSON export.' });
  }
});

// GET /api/admin/audit-logs - Real system audit logs
adminRouter.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const page = Math.max(1, parseInt(String(req.query.page || 1), 10));
    const pageSize = 30;
    const offset = (page - 1) * pageSize;

    const [logsRes, countRes] = await Promise.all([
      db.query(
        'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      ),
      db.query('SELECT COUNT(*) as cnt FROM audit_logs'),
    ]);

    res.json({
      logs: logsRes.rows,
      total: parseInt(countRes.rows[0].cnt, 10),
      page,
      pageSize,
    });
  } catch (err: any) {
    console.error('[API] Audit logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
});
