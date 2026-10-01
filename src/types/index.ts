export interface User {
  id: number;
  email: string;
  role: 'CANDIDATE' | 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  created_at?: string;
  last_login_at?: string;
}

export interface Candidate {
  id: number;
  user_id: number;
  reference_code: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  preferred_name?: string | null;
  date_of_birth?: string | null;
  phone?: string | null;
  alternate_phone?: string | null;
  country_calling_code?: string | null;
  current_country?: string | null;
  current_state?: string | null;
  current_city?: string | null;
  current_locality?: string | null;
  willing_to_relocate?: boolean;
  preferred_locations?: string | null;
  primary_role?: string | null;
  secondary_roles?: string | null;
  can_multi_role?: boolean;
  professional_category?: string | null;
  seniority_level?: string | null;
  seniority_other?: string | null;
  professional_summary?: string | null;
  total_experience_years?: number | null;
  relevant_experience_years?: number | null;
  work_modes?: string | null;
  willing_onsite_deployment?: boolean;
  max_commute_distance_km?: number | null;
  max_commute_time_minutes?: number | null;
  accommodation_status?: 'not_required' | 'required' | 'depends_on_location' | 'required_beyond_distance' | string;
  accommodation_beyond_km?: number | null;
  transportation_status?: 'own_transport' | 'public_transport' | 'company_transport_required' | 'fuel_allowance_required' | 'travel_allowance_required' | 'other' | string | null;
  transportation_notes?: string | null;
  expected_compensation_amount?: number | null;
  compensation_currency?: string;
  compensation_period?: 'monthly' | 'annual' | 'hourly';
  minimum_acceptable_compensation?: number | null;
  compensation_negotiable?: boolean;
  current_compensation_amount?: number | null;
  employment_status?: 'currently_available' | 'employed' | 'unemployed' | 'serving_notice' | string;
  earliest_joining_date?: string | null;
  notice_period_days?: number;
  preferred_hours_per_week?: number;
  shift_day?: boolean;
  shift_evening?: boolean;
  shift_night?: boolean;
  shift_rotating?: boolean;
  shift_weekend?: boolean;
  shift_overtime?: boolean;
  seasonal_restrictions?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  other_url?: string | null;
  completion_percentage: number;
  created_at?: string;
  updated_at?: string;
  email?: string;
}

export interface Experience {
  id: number;
  candidate_id: number;
  job_title: string;
  company_name: string;
  employment_type?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  responsibilities?: string | null;
  achievements?: string | null;
  technologies?: string | null;
}

export interface Education {
  id: number;
  candidate_id: number;
  qualification: string;
  institution: string;
  field_of_study?: string | null;
  country?: string | null;
  start_year?: number | null;
  completion_year?: number | null;
  is_current?: boolean;
  grade_gpa?: string | null;
}

export interface Certification {
  id: number;
  candidate_id: number;
  name: string;
  issuing_organization: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
}

export interface Skill {
  id: number;
  candidate_id: number;
  skill_name: string;
  category?: string;
  proficiency_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
  years_of_experience?: number;
  notes?: string | null;
}

export interface CandidateDocument {
  id: number;
  candidate_id: number;
  document_type: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_at: string;
}

export interface CompletenessBreakdown {
  basicInfo: boolean;
  contact: boolean;
  location: boolean;
  roleAndLevel: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  workPreferences: boolean;
  compensationAvailability: boolean;
  percentage: number;
}

export interface CandidateProfileResponse {
  candidate: Candidate;
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: Skill[];
  documents?: CandidateDocument[];
  completeness: CompletenessBreakdown;
  account: {
    email: string;
    role: string;
  };
}

export interface AdminMetrics {
  totalCandidates: number;
  completedProfiles: number;
  inProgressProfiles: number;
  readyForDeployment: number;
  recentCandidates: Array<{
    id: number;
    reference_code: string;
    first_name?: string | null;
    last_name?: string | null;
    primary_role?: string | null;
    completion_percentage: number;
    created_at: string;
    email: string;
  }>;
}

export interface AuditLog {
  id: number;
  actor_id?: number | null;
  actor_email?: string | null;
  actor_role?: string | null;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  metadata?: string | null;
  ip_address?: string | null;
  created_at: string;
}
