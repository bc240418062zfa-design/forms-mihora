import { Router, Response } from 'express';
import { getDb } from '../db/index.js';
import { AuthenticatedRequest, authenticateToken, requireCandidate } from '../auth.js';
import { calculateCandidateCompleteness } from '../utils/completeness.js';
import { broadcastAdminEvent } from '../realtime.js';
import { logAuditEvent, formatReferenceCode } from '../utils/audit.js';

export const candidateRouter = Router();

// Require authenticated candidate on all endpoints
candidateRouter.use(authenticateToken, requireCandidate);

// Helper to retrieve candidate record for current user
async function getCandidateByUserId(db: any, userId: number) {
  const result = await db.query(
    'SELECT * FROM candidates WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    // If not exists yet, create candidate row
    const insertResult = await db.query(
      `INSERT INTO candidates (user_id, reference_code) 
       VALUES ($1, $2) RETURNING *`,
      [userId, formatReferenceCode(userId)]
    );
    return insertResult.rows[0];
  }
  return result.rows[0];
}

// GET /api/candidate/me - Retrieve full profile with relational sub-records
candidateRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const userId = req.user!.userId;

    const candidate = await getCandidateByUserId(db, userId);

    const [expRes, eduRes, certRes, skillsRes] = await Promise.all([
      db.query('SELECT * FROM candidate_experiences WHERE candidate_id = $1 ORDER BY display_order ASC, start_date DESC', [candidate.id]),
      db.query('SELECT * FROM candidate_education WHERE candidate_id = $1 ORDER BY display_order ASC, start_year DESC', [candidate.id]),
      db.query('SELECT * FROM candidate_certifications WHERE candidate_id = $1 ORDER BY issue_date DESC', [candidate.id]),
      db.query('SELECT * FROM candidate_skills WHERE candidate_id = $1 ORDER BY id ASC', [candidate.id]),
    ]);

    const completeness = calculateCandidateCompleteness(
      candidate,
      expRes.rows.length,
      eduRes.rows.length,
      skillsRes.rows.length
    );

    // Keep database in sync with real percentage
    if (candidate.completion_percentage !== completeness.percentage) {
      await db.query('UPDATE candidates SET completion_percentage = $1 WHERE id = $2', [
        completeness.percentage,
        candidate.id,
      ]);
      candidate.completion_percentage = completeness.percentage;
    }

    res.json({
      candidate,
      experiences: expRes.rows,
      education: eduRes.rows,
      certifications: certRes.rows,
      skills: skillsRes.rows,
      documents: [],
      completeness,
      account: {
        email: req.user!.email,
        role: req.user!.role,
      },
    });
  } catch (err: any) {
    console.error('[API] Error in GET /api/candidate/me:', err);
    res.status(500).json({ error: 'Failed to retrieve candidate profile.' });
  }
});

// PUT /api/candidate/profile - Update main candidate profile information
candidateRouter.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const userId = req.user!.userId;
    const candidate = await getCandidateByUserId(db, userId);

    const {
      first_name,
      middle_name,
      last_name,
      preferred_name,
      date_of_birth,
      phone,
      alternate_phone,
      country_calling_code,
      current_country,
      current_state,
      current_city,
      current_locality,
      willing_to_relocate,
      preferred_locations,
      primary_role,
      secondary_roles,
      can_multi_role,
      professional_category,
      seniority_level,
      seniority_other,
      professional_summary,
      total_experience_years,
      relevant_experience_years,
      work_modes,
      willing_onsite_deployment,
      max_commute_distance_km,
      max_commute_time_minutes,
      accommodation_status,
      accommodation_beyond_km,
      transportation_status,
      transportation_notes,
      expected_compensation_amount,
      compensation_currency,
      compensation_period,
      minimum_acceptable_compensation,
      compensation_negotiable,
      current_compensation_amount,
      employment_status,
      earliest_joining_date,
      notice_period_days,
      preferred_hours_per_week,
      shift_day,
      shift_evening,
      shift_night,
      shift_rotating,
      shift_weekend,
      shift_overtime,
      seasonal_restrictions,
      linkedin_url,
      github_url,
      portfolio_url,
      other_url,
    } = req.body;

    // Validate URLs if provided
    const validateUrl = (url?: string) => {
      if (!url || url.trim() === '') return true;
      return url.startsWith('http://') || url.startsWith('https://');
    };

    if (!validateUrl(linkedin_url) || !validateUrl(github_url) || !validateUrl(portfolio_url) || !validateUrl(other_url)) {
      return res.status(400).json({ error: 'Professional links must begin with http:// or https://' });
    }

    await db.query(
      `UPDATE candidates SET
        first_name = $1,
        middle_name = $2,
        last_name = $3,
        preferred_name = $4,
        date_of_birth = $5,
        phone = $6,
        alternate_phone = $7,
        country_calling_code = $8,
        current_country = $9,
        current_state = $10,
        current_city = $11,
        current_locality = $12,
        willing_to_relocate = $13,
        preferred_locations = $14,
        primary_role = $15,
        secondary_roles = $16,
        can_multi_role = $17,
        professional_category = $18,
        seniority_level = $19,
        seniority_other = $20,
        professional_summary = $21,
        total_experience_years = $22,
        relevant_experience_years = $23,
        work_modes = $24,
        willing_onsite_deployment = $25,
        max_commute_distance_km = $26,
        max_commute_time_minutes = $27,
        accommodation_status = $28,
        accommodation_beyond_km = $29,
        transportation_status = $30,
        transportation_notes = $31,
        expected_compensation_amount = $32,
        compensation_currency = $33,
        compensation_period = $34,
        minimum_acceptable_compensation = $35,
        compensation_negotiable = $36,
        current_compensation_amount = $37,
        employment_status = $38,
        earliest_joining_date = $39,
        notice_period_days = $40,
        preferred_hours_per_week = $41,
        shift_day = $42,
        shift_evening = $43,
        shift_night = $44,
        shift_rotating = $45,
        shift_weekend = $46,
        shift_overtime = $47,
        seasonal_restrictions = $48,
        linkedin_url = $49,
        github_url = $50,
        portfolio_url = $51,
        other_url = $52,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $53`,
      [
        first_name || null,
        middle_name || null,
        last_name || null,
        preferred_name || null,
        date_of_birth || null,
        phone || null,
        alternate_phone || null,
        country_calling_code || null,
        current_country || null,
        current_state || null,
        current_city || null,
        current_locality || null,
        Boolean(willing_to_relocate),
        preferred_locations || null,
        primary_role || null,
        secondary_roles || null,
        Boolean(can_multi_role),
        professional_category || null,
        seniority_level || null,
        seniority_other || null,
        professional_summary || null,
        total_experience_years ? Number(total_experience_years) : 0,
        relevant_experience_years ? Number(relevant_experience_years) : 0,
        work_modes || null,
        willing_onsite_deployment !== undefined ? Boolean(willing_onsite_deployment) : true,
        max_commute_distance_km ? parseInt(max_commute_distance_km, 10) : null,
        max_commute_time_minutes ? parseInt(max_commute_time_minutes, 10) : null,
        accommodation_status || 'not_required',
        accommodation_beyond_km ? parseInt(accommodation_beyond_km, 10) : null,
        transportation_status || null,
        transportation_notes || null,
        expected_compensation_amount ? Number(expected_compensation_amount) : null,
        compensation_currency || 'PKR',
        compensation_period || 'monthly',
        minimum_acceptable_compensation ? Number(minimum_acceptable_compensation) : null,
        compensation_negotiable !== undefined ? Boolean(compensation_negotiable) : true,
        current_compensation_amount ? Number(current_compensation_amount) : null,
        employment_status || 'currently_available',
        earliest_joining_date || null,
        notice_period_days ? parseInt(notice_period_days, 10) : 0,
        preferred_hours_per_week ? parseInt(preferred_hours_per_week, 10) : 40,
        shift_day !== undefined ? Boolean(shift_day) : true,
        shift_evening !== undefined ? Boolean(shift_evening) : false,
        shift_night !== undefined ? Boolean(shift_night) : false,
        shift_rotating !== undefined ? Boolean(shift_rotating) : false,
        shift_weekend !== undefined ? Boolean(shift_weekend) : false,
        shift_overtime !== undefined ? Boolean(shift_overtime) : false,
        seasonal_restrictions || null,
        linkedin_url || null,
        github_url || null,
        portfolio_url || null,
        other_url || null,
        candidate.id,
      ]
    );

    // Fetch updated candidate and sub-counts to recalculate completeness
    const [updatedCandRes, expCount, eduCount, skillCount] = await Promise.all([
      db.query('SELECT * FROM candidates WHERE id = $1', [candidate.id]),
      db.query('SELECT count(*) as cnt FROM candidate_experiences WHERE candidate_id = $1', [candidate.id]),
      db.query('SELECT count(*) as cnt FROM candidate_education WHERE candidate_id = $1', [candidate.id]),
      db.query('SELECT count(*) as cnt FROM candidate_skills WHERE candidate_id = $1', [candidate.id]),
    ]);

    const updatedCandidate = updatedCandRes.rows[0];
    const completeness = calculateCandidateCompleteness(
      updatedCandidate,
      parseInt(expCount.rows[0].cnt, 10),
      parseInt(eduCount.rows[0].cnt, 10),
      parseInt(skillCount.rows[0].cnt, 10)
    );

    await db.query('UPDATE candidates SET completion_percentage = $1 WHERE id = $2', [
      completeness.percentage,
      candidate.id,
    ]);

    // Record audit log
    await logAuditEvent(db, {
      actorId: userId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CANDIDATE_PROFILE_UPDATED',
      targetType: 'candidate',
      targetId: String(candidate.id),
      metadata: { completionPercentage: completeness.percentage },
      ipAddress: req.ip,
    });

    // Broadcast real-time SSE event to connected admins
    broadcastAdminEvent({
      type: 'PROFILE_UPDATED',
      candidateId: candidate.id,
      referenceCode: candidate.reference_code,
      name: `${first_name || ''} ${last_name || ''}`.trim() || 'Candidate',
      primaryRole: primary_role || 'Not specified',
      completionPercentage: completeness.percentage,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Profile saved successfully.',
      candidate: updatedCandidate,
      completeness,
    });
  } catch (err: any) {
    console.error('[API] Error in PUT /api/candidate/profile:', err);
    res.status(500).json({ error: 'Failed to save candidate profile.' });
  }
});

// Experiences CRUD
candidateRouter.post('/experiences', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const candidate = await getCandidateByUserId(db, req.user!.userId);
    const { job_title, company_name, employment_type, location, start_date, end_date, is_current, responsibilities, achievements, technologies } = req.body;

    if (!job_title || !company_name) {
      return res.status(400).json({ error: 'Job title and Company name are required.' });
    }

    const result = await db.query(
      `INSERT INTO candidate_experiences (candidate_id, job_title, company_name, employment_type, location, start_date, end_date, is_current, responsibilities, achievements, technologies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        candidate.id,
        job_title.trim(),
        company_name.trim(),
        employment_type || null,
        location || null,
        start_date || null,
        end_date || null,
        Boolean(is_current),
        responsibilities || null,
        achievements || null,
        technologies || null,
      ]
    );

    res.status(201).json({ success: true, experience: result.rows[0] });
  } catch (err: any) {
    console.error('[API] Error in POST /api/candidate/experiences:', err);
    res.status(500).json({ error: 'Failed to add experience record.' });
  }
});

candidateRouter.delete('/experiences/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const candidate = await getCandidateByUserId(db, req.user!.userId);
    const expId = parseInt(req.params.id, 10);

    const deleteRes = await db.query(
      'DELETE FROM candidate_experiences WHERE id = $1 AND candidate_id = $2',
      [expId, candidate.id]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Experience record not found.' });
    }

    res.json({ success: true, message: 'Experience record removed.' });
  } catch (err: any) {
    console.error('[API] Error deleting experience:', err);
    res.status(500).json({ error: 'Failed to delete experience record.' });
  }
});

// Education CRUD
candidateRouter.post('/education', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const candidate = await getCandidateByUserId(db, req.user!.userId);
    const { qualification, institution, field_of_study, country, start_year, completion_year, is_current, grade_gpa } = req.body;

    if (!qualification || !institution) {
      return res.status(400).json({ error: 'Qualification and Institution are required.' });
    }

    const result = await db.query(
      `INSERT INTO candidate_education (candidate_id, qualification, institution, field_of_study, country, start_year, completion_year, is_current, grade_gpa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        candidate.id,
        qualification.trim(),
        institution.trim(),
        field_of_study || null,
        country || null,
        start_year ? parseInt(start_year, 10) : null,
        completion_year ? parseInt(completion_year, 10) : null,
        Boolean(is_current),
        grade_gpa || null,
      ]
    );

    res.status(201).json({ success: true, education: result.rows[0] });
  } catch (err: any) {
    console.error('[API] Error in POST /api/candidate/education:', err);
    res.status(500).json({ error: 'Failed to add education record.' });
  }
});

candidateRouter.delete('/education/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const candidate = await getCandidateByUserId(db, req.user!.userId);
    const eduId = parseInt(req.params.id, 10);

    const deleteRes = await db.query(
      'DELETE FROM candidate_education WHERE id = $1 AND candidate_id = $2',
      [eduId, candidate.id]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Education record not found.' });
    }

    res.json({ success: true, message: 'Education record removed.' });
  } catch (err: any) {
    console.error('[API] Error deleting education:', err);
    res.status(500).json({ error: 'Failed to delete education record.' });
  }
});

// Skills CRUD
candidateRouter.post('/skills', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const candidate = await getCandidateByUserId(db, req.user!.userId);
    const { skill_name, category, proficiency_level, years_of_experience, notes } = req.body;

    if (!skill_name || skill_name.trim() === '') {
      return res.status(400).json({ error: 'Skill name is required.' });
    }

    const result = await db.query(
      `INSERT INTO candidate_skills (candidate_id, skill_name, category, proficiency_level, years_of_experience, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        candidate.id,
        skill_name.trim(),
        category || 'General',
        proficiency_level || 'Intermediate',
        years_of_experience ? Number(years_of_experience) : 1,
        notes || null,
      ]
    );

    res.status(201).json({ success: true, skill: result.rows[0] });
  } catch (err: any) {
    console.error('[API] Error in POST /api/candidate/skills:', err);
    res.status(500).json({ error: 'Failed to add skill.' });
  }
});

candidateRouter.delete('/skills/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const candidate = await getCandidateByUserId(db, req.user!.userId);
    const skillId = parseInt(req.params.id, 10);

    const deleteRes = await db.query(
      'DELETE FROM candidate_skills WHERE id = $1 AND candidate_id = $2',
      [skillId, candidate.id]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Skill not found.' });
    }

    res.json({ success: true, message: 'Skill removed.' });
  } catch (err: any) {
    console.error('[API] Error deleting skill:', err);
    res.status(500).json({ error: 'Failed to delete skill.' });
  }
});
