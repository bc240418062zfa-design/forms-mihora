import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CandidateProfileResponse } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import { ProfileEditor } from '../components/candidate/ProfileEditor';
import { AnimatedNumber, BlankSheetLoader, Reveal } from '../components/ui/MotionPrimitives';
import {
  Briefcase,
  CheckCircle2,
  Download,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Wallet,
} from 'lucide-react';

interface CandidateDashboardPageProps {
  initialEditing?: boolean;
  onViewModeChange?: (editing: boolean) => void;
}

export const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = ({
  initialEditing = false,
  onViewModeChange,
}) => {
  const [profileData, setProfileData] = useState<CandidateProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(initialEditing);

  useEffect(() => {
    setIsEditing(initialEditing);
  }, [initialEditing]);

  const enterEditMode = (targetStep?: number) => {
    if (targetStep) {
      try {
        sessionStorage.setItem('mihora_portal_active_step', String(targetStep));
      } catch {}
    }
    setIsEditing(true);
    if (onViewModeChange) {
      onViewModeChange(true);
    }
  };

  const exitEditMode = () => {
    setIsEditing(false);
    loadProfile(true);
    if (onViewModeChange) {
      onViewModeChange(false);
    }
  };

  const loadProfile = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await api.getCandidateProfile();
      setProfileData(data);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Failed to load profile.');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProfile(false);
  }, []);

  if (isLoading && !profileData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto space-y-6" aria-busy="true">
          <BlankSheetLoader label="Loading candidate profile..." />
          <BlankSheetLoader compact label="Retrieving academic and career records..." />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full enterprise-card p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Unable to Load Profile
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 mb-6 leading-relaxed">
            {error || 'Could not retrieve candidate profile details.'}
          </p>
          <button
            type="button"
            onClick={() => loadProfile(false)}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const { candidate, experiences, education, skills, documents, completeness, account } =
    profileData;

  if (isEditing) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] pb-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-1 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={exitEditMode}
            className="group text-sm font-semibold text-slate-600 hover:text-[#143A7B] transition-colors inline-flex items-center gap-2 py-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Profile Overview</span>
          </button>

          <span className="text-xs font-medium text-slate-500">
            Changes save automatically as you proceed
          </span>
        </div>

        <ProfileEditor
          initialCandidate={candidate}
          initialExperiences={experiences}
          initialEducation={education}
          initialSkills={skills}
          initialDocuments={documents}
          initialCompleteness={completeness}
          onProfileUpdated={() => loadProfile(true)}
        />
      </div>
    );
  }

  const fullName =
    `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Candidate Profile';

  const checklistModules: Array<{ label: string; done: boolean; step: number }> = [
    { label: 'Basic Info', done: completeness.basicInfo, step: 1 },
    { label: 'Contact', done: completeness.contact, step: 1 },
    { label: 'Location', done: completeness.location, step: 1 },
    { label: 'Role & Level', done: completeness.roleAndLevel, step: 2 },
    { label: 'Experience', done: completeness.experience, step: 3 },
    { label: 'Education', done: completeness.education, step: 4 },
    { label: 'Skills', done: completeness.skills, step: 5 },
    { label: 'Preferences', done: completeness.workPreferences, step: 6 },
    { label: 'Compensation', done: completeness.compensationAvailability, step: 7 },
  ];

  const incompleteModules = checklistModules.filter((m) => !m.done);
  const nextIncompleteModule = incompleteModules[0];
  const isVerifiedReady = completeness.percentage >= 80;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto space-y-6">
        {/* Card 1: Candidate Executive Summary & Completeness */}
        <Reveal>
          <section className="enterprise-card p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
                  <span className="font-mono font-semibold text-[#143A7B] bg-[#EEF3FA] px-2.5 py-0.5 rounded-md">
                    {candidate.reference_code}
                  </span>
                  <span>{account.email}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Updated{' '}
                    {candidate.updated_at
                      ? new Date(candidate.updated_at).toLocaleDateString()
                      : 'Today'}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {fullName}
                </h1>
                <p className="text-sm text-slate-600 mt-1.5">
                  {candidate.primary_role
                    ? `${candidate.primary_role} · ${candidate.seniority_level || 'Mid-Level'}`
                    : 'Complete your technical discipline, deployment preferences, and structured credentials.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => enterEditMode()}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => generateCandidatePdf(candidate, experiences, education, skills)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white hover:bg-[#FAF9F6] border border-[#CBD5E1] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Download PDF Dossier</span>
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:items-end justify-between bg-[#FAF9F6] border border-[#E4E2DA] rounded-xl p-4 sm:min-w-[230px]">
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      isVerifiedReady
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isVerifiedReady ? 'Verified Ready' : 'Draft In Progress'}</span>
                  </span>
                </div>
                <div className="mt-3 sm:text-right">
                  <div className="text-xs font-medium text-slate-500">Profile Completeness</div>
                  <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                    <AnimatedNumber value={completeness.percentage} suffix="%" />
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Progress Bar & Interactive 9-Section Checklist */}
            <div className="mt-7 pt-6 border-t border-[#E4E2DA]">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                <span>Completion Progress</span>
                <span className="font-mono text-slate-700 tabular-nums">
                  {checklistModules.filter((m) => m.done).length} of {checklistModules.length}{' '}
                  sections complete
                </span>
              </div>

              <div className="w-full bg-[#EFECE6] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#143A7B] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
                {checklistModules.map((sec) => (
                  <button
                    key={sec.label}
                    type="button"
                    onClick={() => enterEditMode(sec.step)}
                    className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                      sec.done
                        ? 'bg-[#EEF3FA]/70 border-[#143A7B]/20 text-slate-900 hover:border-[#143A7B]/45'
                        : 'bg-[#FAF9F6] border-[#E4E2DA] text-slate-600 hover:border-[#CBD5E1] hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        sec.done ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <span className="truncate font-semibold">{sec.label}</span>
                  </button>
                ))}
              </div>

              {completeness.percentage < 100 && (
                <div className="mt-5 pt-4 border-t border-[#E4E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm text-slate-600">
                    {nextIncompleteModule ? (
                      <>
                        Next section to complete:{' '}
                        <span className="font-semibold text-slate-900">
                          {nextIncompleteModule.label}
                        </span>{' '}
                        <span className="text-slate-500">
                          ({incompleteModules.length} remaining)
                        </span>
                      </>
                    ) : (
                      <span>Final profile review ready for confirmation.</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      enterEditMode(nextIncompleteModule ? nextIncompleteModule.step : 8)
                    }
                    className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>
                      {nextIncompleteModule
                        ? `Complete ${nextIncompleteModule.label}`
                        : 'Review Complete Dossier'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        {/* Card 2: 3-Column Snapshot */}
        <Reveal delayMs={60}>
          <section className="enterprise-card grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E4E2DA]">
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#143A7B]" />
                  <span>Current Designation</span>
                </div>
                <div className="font-display text-lg font-bold text-slate-900">
                  {candidate.primary_role || 'Not yet specified'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {candidate.seniority_level || 'Level Pending'} ·{' '}
                  {candidate.professional_category || 'Technical'}
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E4E2DA] flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Experience</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {candidate.total_experience_years || 0} yrs
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#143A7B]" />
                  <span>Deployment &amp; Commute</span>
                </div>
                <div
                  className={`font-display text-lg font-bold ${
                    candidate.willing_onsite_deployment ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {candidate.willing_onsite_deployment ? 'On-Site Ready' : 'Remote Only'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Max{' '}
                  <span className="font-mono">
                    {candidate.max_commute_distance_km
                      ? `${candidate.max_commute_distance_km} km`
                      : 'Flexible'}
                  </span>{' '}
                  ·{' '}
                  <span className="font-mono">
                    {candidate.max_commute_time_minutes
                      ? `${candidate.max_commute_time_minutes} min`
                      : 'Any'}
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E4E2DA] flex items-center justify-between text-xs">
                <span className="text-slate-500 capitalize">
                  {candidate.accommodation_status?.replace(/_/g, ' ') || 'Local commute'}
                </span>
                <button
                  type="button"
                  onClick={() => enterEditMode(6)}
                  className="font-semibold text-[#143A7B] hover:text-[#0E2B5C] inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Adjust</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                  <Wallet className="w-3.5 h-3.5 text-[#143A7B]" />
                  <span>Status &amp; Remuneration</span>
                </div>
                <div className="font-display text-lg font-bold text-slate-900 capitalize">
                  {candidate.employment_status?.replace(/_/g, ' ') || 'Availability Unset'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Notice: <span className="font-mono">{candidate.notice_period_days || 0}d</span> ·
                  Relocation: {candidate.willing_to_relocate ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E4E2DA] flex items-center justify-between text-xs">
                <span className="text-slate-500">Expected</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {candidate.expected_compensation_amount
                    ? `${Number(candidate.expected_compensation_amount).toLocaleString()} ${
                        candidate.compensation_currency || 'PKR'
                      }`
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Card 3: Structured Career & Academic Record */}
        <Reveal delayMs={100}>
          <section className="enterprise-card divide-y divide-[#E4E2DA] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-[#FAF9F6]">
              <h2 className="font-display text-base font-bold text-slate-900">
                Career &amp; Academic Credentials
              </h2>
              <button
                type="button"
                onClick={() => enterEditMode(8)}
                className="text-xs font-semibold text-[#143A7B] hover:text-[#0E2B5C] cursor-pointer"
              >
                Open Full Review →
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Career Experience ({experiences.length})
                </h3>
                <button
                  type="button"
                  onClick={() => enterEditMode(3)}
                  className="text-xs font-semibold text-[#143A7B] hover:text-[#0E2B5C] cursor-pointer"
                >
                  Manage
                </button>
              </div>
              {experiences.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No previous experience recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-[#E4E2DA]">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <div>
                          <span className="font-display text-sm font-bold text-slate-900">
                            {exp.job_title}
                          </span>
                          <span className="text-sm text-slate-600 ml-2">
                            · {exp.company_name}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-slate-500">
                          {exp.start_date || 'Start'} —{' '}
                          {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                        </span>
                      </div>
                      {exp.responsibilities && (
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {exp.responsibilities}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Education &amp; Academics ({education.length})
                </h3>
                <button
                  type="button"
                  onClick={() => enterEditMode(4)}
                  className="text-xs font-semibold text-[#143A7B] hover:text-[#0E2B5C] cursor-pointer"
                >
                  Manage
                </button>
              </div>
              {education.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No education credentials recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-[#E4E2DA]">
                  {education.map((edu) => (
                    <div
                      key={edu.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                    >
                      <div>
                        <span className="font-display text-sm font-bold text-slate-900">
                          {edu.qualification}
                        </span>
                        <span className="text-sm text-slate-600 ml-2">
                          · {edu.institution}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-500">
                        {edu.start_year || ''} —{' '}
                        {edu.is_current ? 'Present' : edu.completion_year || 'Present'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verified Skills ({skills.length})
                </h3>
                <button
                  type="button"
                  onClick={() => enterEditMode(5)}
                  className="text-xs font-semibold text-[#143A7B] hover:text-[#0E2B5C] cursor-pointer"
                >
                  Manage
                </button>
              </div>
              {skills.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No technical skills recorded yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
                  {skills.map((s) => (
                    <div
                      key={s.id}
                      className="py-2 border-b border-[#E4E2DA] flex items-baseline justify-between gap-2 text-sm"
                    >
                      <span className="font-semibold text-slate-900 truncate">
                        {s.skill_name}
                      </span>
                      <span className="font-mono text-xs text-slate-500 shrink-0">
                        {s.proficiency_level} · {s.years_of_experience || 1}y
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
};
