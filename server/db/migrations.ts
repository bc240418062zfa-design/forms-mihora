import { DbClient } from './index.js';

export async function runMigrations(db: DbClient): Promise<void> {
  console.log('[DB] Running database migrations...');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'CANDIDATE',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      reference_code VARCHAR(32) NOT NULL UNIQUE,
      first_name VARCHAR(100),
      middle_name VARCHAR(100),
      last_name VARCHAR(100),
      preferred_name VARCHAR(100),
      date_of_birth DATE,
      phone VARCHAR(50),
      alternate_phone VARCHAR(50),
      country_calling_code VARCHAR(10),
      current_country VARCHAR(100),
      current_state VARCHAR(100),
      current_city VARCHAR(100),
      current_locality VARCHAR(150),
      willing_to_relocate BOOLEAN DEFAULT FALSE,
      preferred_locations TEXT,
      primary_role VARCHAR(150),
      secondary_roles TEXT,
      can_multi_role BOOLEAN DEFAULT FALSE,
      professional_category VARCHAR(100),
      seniority_level VARCHAR(50),
      seniority_other VARCHAR(100),
      professional_summary TEXT,
      total_experience_years NUMERIC(4,1) DEFAULT 0,
      relevant_experience_years NUMERIC(4,1) DEFAULT 0,
      work_modes TEXT,
      willing_onsite_deployment BOOLEAN DEFAULT TRUE,
      max_commute_distance_km INTEGER,
      max_commute_time_minutes INTEGER,
      accommodation_status VARCHAR(50) DEFAULT 'not_required',
      accommodation_beyond_km INTEGER,
      transportation_status VARCHAR(50),
      transportation_notes TEXT,
      expected_compensation_amount NUMERIC(14,2),
      compensation_currency VARCHAR(10) DEFAULT 'PKR',
      compensation_period VARCHAR(20) DEFAULT 'monthly',
      minimum_acceptable_compensation NUMERIC(14,2),
      compensation_negotiable BOOLEAN DEFAULT TRUE,
      current_compensation_amount NUMERIC(14,2),
      employment_status VARCHAR(50) DEFAULT 'currently_available',
      earliest_joining_date DATE,
      notice_period_days INTEGER DEFAULT 0,
      preferred_hours_per_week INTEGER DEFAULT 40,
      shift_day BOOLEAN DEFAULT TRUE,
      shift_evening BOOLEAN DEFAULT FALSE,
      shift_night BOOLEAN DEFAULT FALSE,
      shift_rotating BOOLEAN DEFAULT FALSE,
      shift_weekend BOOLEAN DEFAULT FALSE,
      shift_overtime BOOLEAN DEFAULT FALSE,
      seasonal_restrictions TEXT,
      linkedin_url VARCHAR(500),
      github_url VARCHAR(500),
      portfolio_url VARCHAR(500),
      other_url VARCHAR(500),
      completion_percentage INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidate_experiences (
      id SERIAL PRIMARY KEY,
      candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      job_title VARCHAR(150) NOT NULL,
      company_name VARCHAR(150) NOT NULL,
      employment_type VARCHAR(50),
      location VARCHAR(150),
      start_date DATE,
      end_date DATE,
      is_current BOOLEAN DEFAULT FALSE,
      responsibilities TEXT,
      achievements TEXT,
      technologies TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidate_education (
      id SERIAL PRIMARY KEY,
      candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      qualification VARCHAR(150) NOT NULL,
      institution VARCHAR(200) NOT NULL,
      field_of_study VARCHAR(150),
      country VARCHAR(100),
      start_year INTEGER,
      completion_year INTEGER,
      is_current BOOLEAN DEFAULT FALSE,
      grade_gpa VARCHAR(50),
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidate_certifications (
      id SERIAL PRIMARY KEY,
      candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      name VARCHAR(200) NOT NULL,
      issuing_organization VARCHAR(200) NOT NULL,
      issue_date DATE,
      expiry_date DATE,
      credential_id VARCHAR(100),
      credential_url VARCHAR(500),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidate_skills (
      id SERIAL PRIMARY KEY,
      candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      skill_name VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      proficiency_level VARCHAR(50) DEFAULT 'Intermediate',
      years_of_experience NUMERIC(3,1),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidate_documents (
      id SERIAL PRIMARY KEY,
      candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      document_type VARCHAR(50) NOT NULL DEFAULT 'CV_RESUME',
      original_filename VARCHAR(255) NOT NULL,
      stored_filename VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_size_bytes BIGINT NOT NULL,
      storage_provider VARCHAR(50) NOT NULL DEFAULT 'local_secure',
      storage_key VARCHAR(255),
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      actor_email VARCHAR(255),
      actor_role VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(100),
      target_id VARCHAR(100),
      metadata TEXT,
      ip_address VARCHAR(50),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
    CREATE INDEX IF NOT EXISTS idx_candidates_ref_code ON candidates(reference_code);
    CREATE INDEX IF NOT EXISTS idx_candidates_role ON candidates(primary_role);
    CREATE INDEX IF NOT EXISTS idx_candidates_city ON candidates(current_city);
    CREATE INDEX IF NOT EXISTS idx_candidates_completion ON candidates(completion_percentage);
    CREATE INDEX IF NOT EXISTS idx_candidates_updated ON candidates(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_experiences_cand_id ON candidate_experiences(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_education_cand_id ON candidate_education(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_skills_cand_id ON candidate_skills(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_documents_cand_id ON candidate_documents(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
  `);

  console.log('[DB] Migrations executed successfully.');
}
