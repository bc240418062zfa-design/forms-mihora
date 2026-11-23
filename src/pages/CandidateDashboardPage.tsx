import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CandidateProfileResponse } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import { ProfileEditor } from '../components/candidate/ProfileEditor';
import { AnimatedNumber, Reveal } from '../components/ui/MotionPrimitives';
import {
  Briefcase,
  CheckCircle2,
  Download,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6" aria-busy="true">
        <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-8">
          <div className="h-3 w-48 bg-[var(--surface-inset)] rounded mb-4 animate-pulse" />
          <div className="h-8 w-72 bg-[var(--surface-inset)] rounded mb-3 animate-pulse" />
          <div className="h-3 w-64 bg-[var(--surface-subtle)] rounded mb-8 animate-pulse" />
          <div className="h-2 w-full bg-[var(--surface-inset)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-[var(--surface-elevated)] border border-rose-200 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
          <div className="w-11 h-11 rounded-[var(--radius-md)] bg-[var(--status-danger-soft)] text-[var(--status-danger)] flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="font-display text-base font-bold text-[var(--ink-primary)]">
            Profile Unavailable
          </h2>
          <p className="text-xs text-[var(--ink-muted)] mt-1.5 mb-6 leading-relaxed">
            {error || 'Could not retrieve candidate dossier.'}
          </p>
          <button
            type="button"
            onClick={() => loadProfile(false)}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[var(--surface-ink)] rounded-[var(--radius-md)] hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const { candidate, experiences, education, skills, documents, completeness, account } = profileData;

  if (isEditing) {
    return (
      <div className="min-h-screen bg-[var(--surface-canvas)] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-1 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={exitEditMode}
            className="group text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--accent-primary)] transition-colors inline-flex items-center gap-2 py-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Dashboard Overview</span>
          </button>

          <span className="text-xs font-mono text-[var(--ink-muted)]">
            PostgreSQL persistence · Step auto-save
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Reveal>
        <div className="bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-hairline)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[var(--ink-muted)] mb-2">
                <span className="font-semibold text-[var(--accent-primary)]">
                  {candidate.reference_code}
                </span>
                <span aria-hidden="true">·</span>
                <span>{account.email}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Updated{' '}
                  {candidate.updated_at
                    ? new Date(candidate.updated_at).toLocaleDateString()
                    : 'Today'}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] tracking-tight">
                {fullName}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-1">
                {candidate.primary_role
                  ? `${candidate.primary_role} · ${candidate.seniority_level || 'Mid-Level'}`
                  : 'Complete your technical role, deployment preferences, and structured credentials.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => generateCandidatePdf(candidate, experiences, education, skills)}
                className="px-4 py-2.5 text-xs font-semibold text-[var(--ink-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] border border-[var(--border-strong)] rounded-[var(--radius-md)] transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                <span>Download PDF Dossier</span>
              </button>
              <button
                type="button"
                onClick={() => enterEditMode()}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-md)] transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          <div className="mt-7 pt-6 border-t border-[var(--border-hairline)]">
            <div className="flex items-baseline justify-between gap-4 mb-2.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-xs font-semibold text-[var(--ink-primary)]">
                  Dossier Completeness
                </span>
                <span className="text-xs font-mono text-[var(--status-success)]">
                  · PostgreSQL Verified
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-[var(--accent-primary)] tabular-nums">
                <AnimatedNumber value={completeness.percentage} suffix="%" />
              </div>
            </div>

            <div className="w-full bg-[var(--surface-inset)] rounded-xs h-2 overflow-hidden">
              <div
                className="bg-[var(--accent-primary)] h-full transition-all duration-500 ease-out"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-5">
              {checklistModules.map((sec) => (
                <button
                  key={sec.label}
                  type="button"
                  onClick={() => enterEditMode(sec.step)}
                  className={`px-3 py-2 rounded-[var(--radius-sm)] border text-left text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    sec.done
                      ? 'bg-[var(--surface-elevated)] border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--accent-primary)]'
                      : 'bg-[var(--surface-subtle)] border-[var(--border-hairline)] text-[var(--ink-muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      sec.done ? 'text-[var(--status-success)]' : 'text-[var(--ink-faint)]'
                    }`}
                  />
                  <span className="truncate font-medium">{sec.label}</span>
                </button>
              ))}
            </div>

            {completeness.percentage < 100 && (
              <div className="mt-4 pt-4 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[var(--ink-secondary)]">
                  {nextIncompleteModule ? (
                    <>
                      Next incomplete section:{' '}
                      <span className="font-semibold text-[var(--ink-primary)]">
                        {nextIncompleteModule.label}
                      </span>{' '}
                      <span className="font-mono text-[var(--ink-muted)]">
                        ({incompleteModules.length} remaining)
                      </span>
                    </>
                  ) : (
                    <span>Final dossier review ready for confirmation.</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => enterEditMode(nextIncompleteModule ? nextIncompleteModule.step : 8)}
                  className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-[var(--accent-primary)] bg-[var(--accent-primary-soft)] hover:bg-blue-100/70 rounded-[var(--radius-sm)] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
        </div>
      </Reveal>

      <Reveal delayMs={60}>
        <div className="bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-hairline)]">
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-medium text-[var(--ink-muted)] mb-1.5">
                Current Designation
              </div>
              <div className="font-display text-lg font-bold text-[var(--ink-primary)]">
                {candidate.primary_role || 'Not yet specified'}
              </div>
              <div className="text-xs text-[var(--accent-primary)] font-medium mt-0.5">
                {candidate.seniority_level || 'Level Pending'} ·{' '}
                {candidate.professional_category || 'Technical'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
              <span className="text-[var(--ink-muted)]">Total Experience</span>
              <span className="font-mono font-semibold text-[var(--ink-primary)] tabular-nums">
                {candidate.total_experience_years || 0} yrs
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-medium text-[var(--ink-muted)] mb-1.5">
                Deployment &amp; Commute
              </div>
              <div
                className={`font-display text-lg font-bold ${
                  candidate.willing_onsite_deployment
                    ? 'text-[var(--status-success)]'
                    : 'text-[var(--ink-primary)]'
                }`}
              >
                {candidate.willing_onsite_deployment ? 'On-Site Ready' : 'Remote Only'}
              </div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5 font-mono">
                Max {candidate.max_commute_distance_km ? `${candidate.max_commute_distance_km} km` : 'Flexible'} ·{' '}
                {candidate.max_commute_time_minutes ? `${candidate.max_commute_time_minutes} min` : 'Any'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
              <span className="text-[var(--ink-muted)] capitalize">
                {candidate.accommodation_status?.replace(/_/g, ' ') || 'Local commute'}
              </span>
              <button
                type="button"
                onClick={() => enterEditMode(6)}
                className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Calibrate</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-medium text-[var(--ink-muted)] mb-1.5">
                Status &amp; Compensation
              </div>
              <div className="font-display text-lg font-bold text-[var(--ink-primary)] capitalize">
                {candidate.employment_status?.replace(/_/g, ' ') || 'Availability Unset'}
              </div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5 font-mono">
                Notice: {candidate.notice_period_days || 0}d · Relocation:{' '}
                {candidate.willing_to_relocate ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
              <span className="text-[var(--ink-muted)]">Expected</span>
              <span className="font-mono font-semibold text-[var(--ink-primary)] tabular-nums">
                {candidate.expected_compensation_amount
                  ? `${Number(candidate.expected_compensation_amount).toLocaleString()} ${
                      candidate.compensation_currency || 'PKR'
                    }`
                  : 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delayMs={100}>
        <div className="bg-[var(--surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] divide-y divide-[var(--border-hairline)]">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[var(--ink-primary)]">
              Structured Candidate Record
            </h2>
            <button
              type="button"
              onClick={() => enterEditMode(8)}
              className="text-xs font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] cursor-pointer"
            >
              Open Full Review
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)]">
                Career Experience ({experiences.length})
              </h3>
              <button
                type="button"
                onClick={() => enterEditMode(3)}
                className="text-xs font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>
            {experiences.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">No previous experience recorded yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border-hairline)]">
                {experiences.map((exp) => (
                  <div key={exp.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <span className="text-sm font-semibold text-[var(--ink-primary)]">
                          {exp.job_title}
                        </span>
                        <span className="text-xs text-[var(--accent-primary)] font-medium ml-2">
                          · {exp.company_name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[var(--ink-muted)]">
                        {exp.start_date || 'Start'} — {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                      </span>
                    </div>
                    {exp.responsibilities && (
                      <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-relaxed">
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)]">
                Education &amp; Academics ({education.length})
              </h3>
              <button
                type="button"
                onClick={() => enterEditMode(4)}
                className="text-xs font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>
            {education.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">No education credentials recorded yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border-hairline)]">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                  >
                    <div>
                      <span className="text-sm font-semibold text-[var(--ink-primary)]">
                        {edu.qualification}
                      </span>
                      <span className="text-xs text-[var(--accent-primary)] font-medium ml-2">
                        · {edu.institution}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[var(--ink-muted)]">
                      {edu.start_year || ''} — {edu.is_current ? 'Present' : edu.completion_year || 'Present'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)]">
                Verified Skills ({skills.length})
              </h3>
              <button
                type="button"
                onClick={() => enterEditMode(5)}
                className="text-xs font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>
            {skills.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">No technical skills recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
                {skills.map((s) => (
                  <div
                    key={s.id}
                    className="py-1.5 border-b border-[var(--border-hairline)] flex items-baseline justify-between gap-2 text-xs"
                  >
                    <span className="font-semibold text-[var(--ink-primary)] truncate">
                      {s.skill_name}
                    </span>
                    <span className="font-mono text-xs text-[var(--ink-muted)] shrink-0">
                      {s.proficiency_level} · {s.years_of_experience || 1}y
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
};
