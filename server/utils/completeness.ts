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

export function calculateCandidateCompleteness(
  candidate: any,
  experiencesCount: number,
  educationCount: number,
  skillsCount: number
): CompletenessBreakdown {
  const basicInfo = Boolean(candidate?.first_name?.trim() && candidate?.last_name?.trim());
  const contact = Boolean(
    candidate?.phone?.trim() || candidate?.email?.trim() || candidate?.user_email?.trim()
  );
  const location = Boolean(candidate?.current_country?.trim() && candidate?.current_city?.trim());
  const roleAndLevel = Boolean(candidate?.primary_role?.trim() && candidate?.seniority_level?.trim());
  const expYears = Number(candidate?.total_experience_years);
  const hasExpYears = !isNaN(expYears) && expYears >= 0;
  const experience = Boolean(experiencesCount > 0 || hasExpYears);
  const education = Boolean(educationCount > 0);
  const skills = Boolean(skillsCount > 0);
  const workPreferences = Boolean(
    candidate?.work_modes?.trim() || candidate?.willing_onsite_deployment !== null
  );
  const hasCompensation =
    candidate?.expected_compensation_amount !== null &&
    candidate?.expected_compensation_amount !== undefined &&
    String(candidate?.expected_compensation_amount).trim() !== '';
  const hasStatus = Boolean(candidate?.employment_status?.trim());
  const compensationAvailability = Boolean(hasCompensation || hasStatus);

  const sections = [
    basicInfo,
    contact,
    location,
    roleAndLevel,
    experience,
    education,
    skills,
    workPreferences,
    compensationAvailability,
  ];

  const completedCount = sections.filter(Boolean).length;
  const percentage = Math.round((completedCount / sections.length) * 100);

  return {
    basicInfo,
    contact,
    location,
    roleAndLevel,
    experience,
    education,
    skills,
    workPreferences,
    compensationAvailability,
    percentage,
  };
}
