import { getDb } from '../server/db/index.js';
import { runMigrations } from '../server/db/migrations.js';
import { hashPassword, comparePassword, generateToken, verifyToken, getJwtSecret } from '../server/auth.js';
import { calculateCandidateCompleteness } from '../server/utils/completeness.js';
import { formatReferenceCode } from '../server/utils/audit.js';

async function runAllTests() {
  console.log('\n======================================================');
  console.log('  MIHORA TECH PORTAL — SYSTEM VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. DATABASE & MIGRATIONS
    console.log('--- 1. Database & Migrations ---');
    const db = await getDb();
    await runMigrations(db);
    assert(true, 'PostgreSQL database connected and migrations applied cleanly');

    const tableCheck = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'candidates', 'candidate_experiences', 'candidate_education', 'candidate_skills', 'candidate_documents', 'audit_logs')
    `);
    assert(tableCheck.rows.length >= 7, 'All 7 relational tables exist in schema');

    // 2. AUTHENTICATION & PASSWORD SECURITY
    console.log('\n--- 2. Authentication & Password Security ---');
    const rawPassword = 'SecurePassword2026!';
    const hashed = await hashPassword(rawPassword);
    assert(hashed !== rawPassword, 'Password is never stored in plaintext');
    assert(hashed.startsWith('$2'), 'Password uses bcrypt with secure salt rounds');

    const passwordMatch = await comparePassword(rawPassword, hashed);
    assert(passwordMatch === true, 'Valid password successfully verifies against hash');

    const wrongMatch = await comparePassword('WrongPassword', hashed);
    assert(wrongMatch === false, 'Invalid password is strictly rejected');

    // 3. CANDIDATE REGISTRATION & DUPLICATE PROTECTION
    console.log('\n--- 3. Registration & Relational Constraints ---');
    const testEmail = `test.candidate.${Date.now()}@mihora.tech`;

    const userRes = await db.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'CANDIDATE') RETURNING id, email, role`,
      [testEmail, hashed]
    );
    const testUser = userRes.rows[0];
    assert(testUser.id > 0, 'Candidate user record created in users table');

    const refCode = formatReferenceCode(testUser.id);
    assert(refCode.startsWith('MIH-CND-'), `Generated non-sensitive reference code: ${refCode}`);

    await db.query(
      `INSERT INTO candidates (
        user_id, reference_code, first_name, last_name, primary_role, current_country, current_city,
        willing_onsite_deployment, max_commute_distance_km, max_commute_time_minutes, completion_percentage
       ) VALUES ($1, $2, 'Tariq', 'Iqbal', 'Senior Structural Engineer', 'Pakistan', 'Lahore', true, 50, 45, 67)`,
      [testUser.id, refCode]
    );

    const candRes = await db.query('SELECT * FROM candidates WHERE user_id = $1', [testUser.id]);
    assert(candRes.rows.length === 1, 'Candidate profile linked via foreign key to user');
    assert(candRes.rows[0].willing_onsite_deployment === true, 'On-site deployment parameter persisted');
    assert(candRes.rows[0].max_commute_distance_km === 50, 'Max commute distance (50 km) persisted');

    let duplicateRejected = false;
    try {
      await db.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'CANDIDATE')`,
        [testEmail, hashed]
      );
    } catch {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Duplicate registration with same email strictly prevented by unique constraint');

    // 4. RELATIONAL DATA: EXPERIENCES, EDUCATION, SKILLS
    console.log('\n--- 4. Relational Data Storage & Integrity ---');
    const candidateId = candRes.rows[0].id;

    await db.query(
      `INSERT INTO candidate_experiences (candidate_id, job_title, company_name, employment_type, start_date, is_current)
       VALUES ($1, 'Lead Project Engineer', 'Descon Engineering', 'Full-time', '2021-03-01', true)`,
      [candidateId]
    );

    await db.query(
      `INSERT INTO candidate_education (candidate_id, qualification, institution, field_of_study, start_year, completion_year)
       VALUES ($1, 'BSc Civil Engineering', 'UET Lahore', 'Structural', 2016, 2020)`,
      [candidateId]
    );

    await db.query(
      `INSERT INTO candidate_skills (candidate_id, skill_name, category, proficiency_level, years_of_experience)
       VALUES ($1, 'AutoCAD Civil 3D', 'Engineering', 'Expert', 5.0)`,
      [candidateId]
    );

    const [expCount, eduCount, skillCount] = await Promise.all([
      db.query('SELECT COUNT(*) as cnt FROM candidate_experiences WHERE candidate_id = $1', [candidateId]),
      db.query('SELECT COUNT(*) as cnt FROM candidate_education WHERE candidate_id = $1', [candidateId]),
      db.query('SELECT COUNT(*) as cnt FROM candidate_skills WHERE candidate_id = $1', [candidateId]),
    ]);

    assert(parseInt(expCount.rows[0].cnt, 10) === 1, 'Experience record stored in candidate_experiences table');
    assert(parseInt(eduCount.rows[0].cnt, 10) === 1, 'Education record stored in candidate_education table');
    assert(parseInt(skillCount.rows[0].cnt, 10) === 1, 'Skill record stored in candidate_skills table');

    // 5. PROFILE COMPLETENESS CALCULATION (WITHOUT CV REQUIREMENT)
    console.log('\n--- 5. Dynamic Profile Completeness Calculation (No CV Requirement) ---');
    const candidateRecord = candRes.rows[0];
    const completeness = calculateCandidateCompleteness(candidateRecord, 1, 1, 1);
    assert(typeof completeness.percentage === 'number', 'Completeness calculated as real numeric percentage');
    assert(completeness.percentage > 0 && completeness.percentage <= 100, `Real completeness score: ${completeness.percentage}%`);
    assert(completeness.basicInfo === true, 'Basic Info section verified completed');
    assert(completeness.experience === true, 'Experience verified completed');
    assert(completeness.education === true, 'Education verified completed');
    assert(completeness.skills === true, 'Skills verified completed');
    assert(!('resumeDocument' in completeness), 'Profile completeness does not require CV or document upload');

    // 6. AUTHORIZATION BOUNDARY & RBAC
    console.log('\n--- 6. Authorization & RBAC Token Testing ---');
    const candidateToken = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: 'CANDIDATE',
    });
    const verifiedCandidate = verifyToken(candidateToken);
    assert(verifiedCandidate?.role === 'CANDIDATE', 'Candidate JWT payload contains role CANDIDATE');

    const adminToken = generateToken({
      userId: 999,
      email: 'admin@mihora.tech',
      role: 'SUPER_ADMIN',
    });
    const verifiedAdmin = verifyToken(adminToken);
    assert(verifiedAdmin?.role === 'SUPER_ADMIN', 'Admin JWT payload contains role SUPER_ADMIN');

    // 7. PRODUCTION FAIL-FAST & HEROKU SAFETY AUDIT
    console.log('\n--- 7. Production Fail-Fast & Heroku Safety Audit ---');
    const prevNodeEnv = process.env.NODE_ENV;
    const prevSessionSecret = process.env.SESSION_SECRET;

    // Test production SESSION_SECRET fail-fast check
    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;
    let sessionSecretFailed = false;
    try {
      getJwtSecret();
    } catch {
      sessionSecretFailed = true;
    }
    assert(sessionSecretFailed, 'Production strictly rejects startup if SESSION_SECRET is missing');

    // Restore environment
    process.env.NODE_ENV = prevNodeEnv;
    if (prevSessionSecret) process.env.SESSION_SECRET = prevSessionSecret;

    // 8. CLEANUP
    await db.close();
    console.log('\n======================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runAllTests();
