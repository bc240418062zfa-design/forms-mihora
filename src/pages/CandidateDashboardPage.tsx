import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CandidateProfileResponse } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import { ProfileEditor } from '../components/candidate/ProfileEditor';
import {
  FileText,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface CandidateDashboardPageProps {
  onNavigateToProfile?: () => void;
}

export const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = () => {
  const [profileData, setProfileData] = useState<CandidateProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono tracking-tight">Synchronizing candidate dossier from PostgreSQL...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-white border border-rose-200/80 rounded-2xl shadow-sm text-slate-800">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Profile Unavailable</h2>
          <p className="text-xs text-slate-600 mt-1.5 mb-6">{error || 'Could not retrieve profile data.'}</p>
          <button
            onClick={() => loadProfile(false)}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
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
      <div className="min-h-screen bg-slate-50/70 pb-16">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 flex justify-between items-center">
          <button
            onClick={() => {
              setIsEditing(false);
              loadProfile(true);
            }}
            className="group text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 shadow-2xs"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Return to Dashboard Overview</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            AUTO-SAVE ENABLED
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

  const fullName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Valued Candidate';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome & Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 mb-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/60 to-transparent rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1.5">
              <span>ENGINEERING DOSSIER</span>
              <span>·</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/70">
                {candidate.reference_code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {fullName}
            </h1>
            <p className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
              <span>Account: <span className="font-mono text-slate-800">{account.email}</span></span>
              <span>·</span>
              <span>Last updated: {candidate.updated_at ? new Date(candidate.updated_at).toLocaleString() : 'Just now'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => generateCandidatePdf(candidate, experiences, education, skills)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center gap-2 shadow-2xs hover:shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download PDF Dossier</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Edit / Update Profile</span>
            </button>
          </div>
        </div>

        {/* Dynamic Completeness Tracker */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight">Profile Completeness Score</span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                PostgreSQL Verified
              </span>
            </div>
            <span className="text-sm font-extrabold font-mono text-blue-600 tabular-nums">
              {completeness.percentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/80 p-0.5">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>

          {/* Section Checklist Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mt-5">
            {[
              { label: 'Basic Info', done: completeness.basicInfo },
              { label: 'Contact', done: completeness.contact },
              { label: 'Location', done: completeness.location },
              { label: 'Role & Seniority', done: completeness.roleAndLevel },
              { label: 'Experience', done: completeness.experience },
              { label: 'Education', done: completeness.education },
              { label: 'Skills', done: completeness.skills },
              { label: 'Preferences', done: completeness.workPreferences },
              { label: 'Compensation', done: completeness.compensationAvailability },
            ].map((sec) => (
              <div
                key={sec.label}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-colors ${
                  sec.done
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950 font-medium'
                    : 'bg-slate-50/60 border-slate-200/70 text-slate-400'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${sec.done ? 'text-emerald-600' : 'text-slate-300'}`}
                />
                <span className="truncate">{sec.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Primary Role */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Current Designation
          </div>
          <div className="text-base font-bold text-slate-900">
            {candidate.primary_role || 'Not yet specified'}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            {candidate.seniority_level || 'Level Pending'} · {candidate.professional_category || 'Technical'}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Experience:</span>
            <span className="font-semibold text-slate-800">{candidate.total_experience_years || 0} Years</span>
          </div>
        </div>

        {/* Card 2: Deployment & Commute Readiness */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Deployment & Commute
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  candidate.willing_onsite_deployment ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              <span>{candidate.willing_onsite_deployment ? 'Ready for Deployment' : 'Remote Only'}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Max Commute: {candidate.max_commute_distance_km ? `${candidate.max_commute_distance_km} km` : 'Flexible'} ·{' '}
              {candidate.max_commute_time_minutes ? `${candidate.max_commute_time_minutes} min` : 'Any'}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 capitalize">
                {candidate.accommodation_status?.replace(/_/g, ' ') || 'Local Commute'}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Edit Parameters <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Availability & Remuneration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Status & Compensation
          </div>
          <div className="text-sm font-bold text-slate-900 capitalize">
            {candidate.employment_status?.replace(/_/g, ' ') || 'Availability Not Specified'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Notice: {candidate.notice_period_days || 0} days · Relocation:{' '}
            {candidate.willing_to_relocate ? 'Willing' : 'Restricted'}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Expected:</span>
            <span className="font-semibold text-slate-800">
              {candidate.expected_compensation_amount
                ? `${candidate.expected_compensation_amount.toLocaleString()} ${candidate.compensation_currency || 'PKR'}`
                : 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Structured Sections Detail View */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Complete Structured Record</h3>

        <div className="space-y-6 text-xs">
          {/* Work Experience Timeline */}
          <div>
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Career Experience ({experiences.length})
            </h4>
            {experiences.length === 0 ? (
              <p className="text-slate-400 italic">No previous experience recorded.</p>
            ) : (
              <div className="space-y-2">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{exp.job_title}</div>
                        <div className="text-blue-600 font-medium">{exp.company_name}</div>
                      </div>
                      <div className="font-mono text-slate-500 text-[11px]">
                        {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                      </div>
                    </div>
                    {exp.responsibilities && (
                      <p className="text-slate-600 mt-1.5">{exp.responsibilities}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div>
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Education & Academics ({education.length})
            </h4>
            {education.length === 0 ? (
              <p className="text-slate-400 italic">No education credentials recorded.</p>
            ) : (
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{edu.qualification}</div>
                        <div className="text-blue-600 font-medium">{edu.institution}</div>
                      </div>
                      <div className="font-mono text-slate-500 text-[11px]">
                        {edu.start_year} — {edu.completion_year || 'Present'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Tag Cloud */}
          <div>
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Verified Skills ({skills.length})
            </h4>
            {skills.length === 0 ? (
              <p className="text-slate-400 italic">No technical skills recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <div
                    key={s.id}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-slate-800 font-medium flex items-center gap-1.5"
                  >
                    <span>{s.skill_name}</span>
                    <span className="text-[10px] text-blue-600 font-mono">({s.proficiency_level})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
