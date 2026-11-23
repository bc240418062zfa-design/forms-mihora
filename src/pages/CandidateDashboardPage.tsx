import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CandidateProfileResponse } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import { ProfileEditor } from '../components/candidate/ProfileEditor';
import { AnimatedNumber, Reveal } from '../components/ui/MotionPrimitives';
import {
  RegistrationCrosses,
  SingleRedMark,
  TitleBlock,
} from '../components/cyanotype/BlueprintApparatus';
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
      <div className="min-h-[calc(100vh-4rem)] bg-cyanotype-table py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6" aria-busy="true">
          <div className="cyanotype-sheet p-8">
            <div className="h-3 w-48 bg-[var(--prussian-raise)] rounded-[var(--radius-xs)] mb-4 animate-pulse" />
            <div className="h-8 w-72 bg-[var(--prussian-raise)] rounded-[var(--radius-xs)] mb-3 animate-pulse" />
            <div className="h-3 w-64 bg-[var(--edge)] rounded-[var(--radius-xs)] mb-8 animate-pulse" />
            <div className="h-2 w-full bg-[var(--edge)] rounded-[var(--radius-xs)] animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-36 cyanotype-sheet p-6 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-cyanotype-table flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full cyanotype-sheet p-8 text-center">
          <RegistrationCrosses />
          <div className="w-11 h-11 rounded-[var(--radius-xs)] bg-[var(--edge)] border border-[var(--status-warn)]/45 text-[var(--status-warn)] flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--exposure)]">
            Dossier Connection Interrupted
          </h2>
          <p className="text-xs font-mono text-[var(--chalk)] mt-1.5 mb-6 leading-relaxed">
            {error || 'Could not retrieve candidate dossier.'}
          </p>
          <button
            type="button"
            onClick={() => loadProfile(false)}
            className="w-full py-2.5 px-4 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
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
      <div className="min-h-screen bg-cyanotype-table pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-1 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={exitEditMode}
            className="pencil-link group text-xs font-mono font-semibold text-[var(--chalk)] hover:text-[var(--exposure)] transition-colors inline-flex items-center gap-2 py-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Dossier Overview</span>
          </button>

          <span className="text-[11px] font-mono text-[var(--chalk)]">
            PostgreSQL persistence · Step auto-save active
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
    <div className="min-h-[calc(100vh-4rem)] bg-cyanotype-table py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sheet 1: Primary Dossier Sheet & Completeness Calibration */}
        <Reveal>
          <section className="cyanotype-sheet p-6 sm:p-8">
            <RegistrationCrosses />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[var(--chalk)] mb-2">
                  <span className="font-semibold text-[var(--exposure)]">
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

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--exposure)] tracking-tight">
                  {fullName}
                </h1>
                <p className="text-xs sm:text-sm font-mono text-[var(--chalk)] mt-1.5">
                  {candidate.primary_role
                    ? `${candidate.primary_role} · ${candidate.seniority_level || 'Mid-Level'}`
                    : 'Complete your technical role, deployment preferences, and structured credentials.'}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={() => enterEditMode()}
                    className="px-4 py-2.5 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => generateCandidatePdf(candidate, experiences, education, skills)}
                    className="px-4 py-2.5 text-xs font-mono font-semibold text-[var(--exposure)] bg-[var(--edge)] hover:bg-[var(--prussian-raise)] border border-[var(--rule-strong)] rounded-[var(--radius-xs)] transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--chalk)]" />
                    <span>Download PDF Dossier</span>
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:items-end gap-3">
                <TitleBlock
                  drawingNo={candidate.reference_code || 'MHR-CND'}
                  scale="1:1"
                  drawnBy={
                    candidate.first_name ? candidate.first_name.slice(0, 3).toUpperCase() : 'CND'
                  }
                  checkedBy={completeness.percentage >= 80 ? 'VER' : 'DRF'}
                />
              </div>
            </div>

            {/* Calibration Completeness Meter */}
            <div className="mt-7 pt-6 double-exposure-rule">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-xs font-mono font-semibold text-[var(--exposure)] tracking-wider">
                    DOSSIER COMPLETENESS INDEX
                  </span>
                  <span className="text-xs font-mono text-[var(--status-verified)]">
                    · PostgreSQL Verified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completeness.percentage >= 80 && <SingleRedMark variant="tick" className="w-5 h-4" />}
                  <span className="text-2xl font-bold font-mono text-[var(--exposure)] tabular-nums">
                    <AnimatedNumber value={completeness.percentage} suffix="%" />
                  </span>
                </div>
              </div>

              <div className="w-full bg-[var(--edge)] border border-[var(--rule-hairline)] rounded-[var(--radius-xs)] h-2.5 overflow-hidden">
                <div
                  className="bg-[var(--exposure)] h-full transition-all duration-500 ease-out"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-[var(--chalk-dim)] mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100% READY</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-5">
                {checklistModules.map((sec) => (
                  <button
                    key={sec.label}
                    type="button"
                    onClick={() => enterEditMode(sec.step)}
                    className={`px-3 py-2 rounded-[var(--radius-xs)] border text-left text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer ${
                      sec.done
                        ? 'bg-[var(--prussian-raise)]/80 border-[var(--rule-strong)] text-[var(--exposure)] hover:border-[var(--exposure)]'
                        : 'bg-[var(--edge)]/70 border-[var(--rule-hairline)] text-[var(--chalk)] hover:border-[var(--chalk)] hover:text-[var(--exposure)]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        sec.done ? 'text-[var(--status-verified)]' : 'text-[var(--chalk-dim)]'
                      }`}
                    />
                    <span className="truncate font-medium">{sec.label}</span>
                  </button>
                ))}
              </div>

              {completeness.percentage < 100 && (
                <div className="mt-4 pt-4 border-t border-[var(--rule-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-mono text-[var(--chalk)]">
                    {nextIncompleteModule ? (
                      <>
                        Next incomplete module:{' '}
                        <span className="font-semibold text-[var(--exposure)]">
                          {nextIncompleteModule.label}
                        </span>{' '}
                        <span className="text-[var(--chalk-dim)]">
                          ({incompleteModules.length} remaining)
                        </span>
                      </>
                    ) : (
                      <span>Final dossier review ready for confirmation.</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      enterEditMode(nextIncompleteModule ? nextIncompleteModule.step : 8)
                    }
                    className="self-start sm:self-auto px-3.5 py-2 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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

        {/* Sheet 2: 3-Column Hairline-Divided Structural Snapshot */}
        <Reveal delayMs={60}>
          <section className="cyanotype-sheet grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--rule-hairline)]">
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-[var(--chalk)] mb-1.5">
                  01 · CURRENT DESIGNATION
                </div>
                <div className="font-display text-lg font-bold text-[var(--exposure)]">
                  {candidate.primary_role || 'Not yet specified'}
                </div>
                <div className="text-xs font-mono text-[var(--chalk)] mt-1">
                  {candidate.seniority_level || 'Level Pending'} ·{' '}
                  {candidate.professional_category || 'Technical'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--rule-hairline)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--chalk)]">Total Experience</span>
                <span className="font-semibold text-[var(--exposure)] tabular-nums">
                  {candidate.total_experience_years || 0} yrs
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-[var(--chalk)] mb-1.5">
                  02 · DEPLOYMENT &amp; COMMUTE
                </div>
                <div
                  className={`font-display text-lg font-bold ${
                    candidate.willing_onsite_deployment
                      ? 'text-[var(--status-verified)]'
                      : 'text-[var(--exposure)]'
                  }`}
                >
                  {candidate.willing_onsite_deployment ? 'On-Site Ready' : 'Remote Only'}
                </div>
                <div className="text-xs text-[var(--chalk)] mt-1 font-mono">
                  Max{' '}
                  {candidate.max_commute_distance_km
                    ? `${candidate.max_commute_distance_km} km`
                    : 'Flexible'}{' '}
                  ·{' '}
                  {candidate.max_commute_time_minutes
                    ? `${candidate.max_commute_time_minutes} min`
                    : 'Any'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--rule-hairline)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--chalk)] capitalize">
                  {candidate.accommodation_status?.replace(/_/g, ' ') || 'Local commute'}
                </span>
                <button
                  type="button"
                  onClick={() => enterEditMode(6)}
                  className="pencil-link font-semibold text-[var(--exposure)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Calibrate</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-[var(--chalk)] mb-1.5">
                  03 · STATUS &amp; REMUNERATION
                </div>
                <div className="font-display text-lg font-bold text-[var(--exposure)] capitalize">
                  {candidate.employment_status?.replace(/_/g, ' ') || 'Availability Unset'}
                </div>
                <div className="text-xs text-[var(--chalk)] mt-1 font-mono">
                  Notice: {candidate.notice_period_days || 0}d · Relocation:{' '}
                  {candidate.willing_to_relocate ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--rule-hairline)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--chalk)]">Expected</span>
                <span className="font-semibold text-[var(--exposure)] tabular-nums">
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

        {/* Sheet 3: Structured Candidate Record Ledger */}
        <Reveal delayMs={100}>
          <section className="cyanotype-sheet divide-y divide-[var(--rule-hairline)]">
            <RegistrationCrosses />

            <div className="px-6 py-4 flex items-center justify-between bg-[var(--edge)]/50">
              <h2 className="font-display text-base font-bold text-[var(--exposure)]">
                Structured Candidate Ledger
              </h2>
              <button
                type="button"
                onClick={() => enterEditMode(8)}
                className="pencil-link text-xs font-mono font-semibold text-[var(--exposure)] cursor-pointer"
              >
                Open Full Review →
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider">
                  CAREER EXPERIENCE ({experiences.length})
                </h3>
                <button
                  type="button"
                  onClick={() => enterEditMode(3)}
                  className="pencil-link text-xs font-mono font-medium text-[var(--exposure)] cursor-pointer"
                >
                  Manage
                </button>
              </div>
              {experiences.length === 0 ? (
                <p className="text-xs font-mono text-[var(--chalk-dim)]">
                  No previous experience recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-[var(--rule-hairline)]">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <div>
                          <span className="font-display text-sm font-semibold text-[var(--exposure)]">
                            {exp.job_title}
                          </span>
                          <span className="text-xs font-mono text-[var(--chalk)] ml-2">
                            · {exp.company_name}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-[var(--chalk)]">
                          {exp.start_date || 'Start'} —{' '}
                          {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                        </span>
                      </div>
                      {exp.responsibilities && (
                        <p className="text-xs font-mono text-[var(--chalk)] mt-1 leading-relaxed">
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
                <h3 className="text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider">
                  EDUCATION &amp; ACADEMICS ({education.length})
                </h3>
                <button
                  type="button"
                  onClick={() => enterEditMode(4)}
                  className="pencil-link text-xs font-mono font-medium text-[var(--exposure)] cursor-pointer"
                >
                  Manage
                </button>
              </div>
              {education.length === 0 ? (
                <p className="text-xs font-mono text-[var(--chalk-dim)]">
                  No education credentials recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-[var(--rule-hairline)]">
                  {education.map((edu) => (
                    <div
                      key={edu.id}
                      className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                    >
                      <div>
                        <span className="font-display text-sm font-semibold text-[var(--exposure)]">
                          {edu.qualification}
                        </span>
                        <span className="text-xs font-mono text-[var(--chalk)] ml-2">
                          · {edu.institution}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[var(--chalk)]">
                        {edu.start_year || ''} —{' '}
                        {edu.is_current ? 'Present' : edu.completion_year || 'Present'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider">
                  VERIFIED SKILLS ({skills.length})
                </h3>
                <button
                  type="button"
                  onClick={() => enterEditMode(5)}
                  className="pencil-link text-xs font-mono font-medium text-[var(--exposure)] cursor-pointer"
                >
                  Manage
                </button>
              </div>
              {skills.length === 0 ? (
                <p className="text-xs font-mono text-[var(--chalk-dim)]">
                  No technical skills recorded yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
                  {skills.map((s) => (
                    <div
                      key={s.id}
                      className="py-1.5 border-b border-[var(--rule-hairline)] flex items-baseline justify-between gap-2 text-xs font-mono"
                    >
                      <span className="font-semibold text-[var(--exposure)] truncate">
                        {s.skill_name}
                      </span>
                      <span className="text-xs text-[var(--chalk)] shrink-0">
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
