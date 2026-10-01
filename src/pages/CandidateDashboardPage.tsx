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

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCandidateProfile();
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-mono">Loading candidate profile from PostgreSQL...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-900">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h2 className="text-base font-bold">Profile Unavailable</h2>
          <p className="text-xs text-red-700 mt-1 mb-4">{error || 'Could not retrieve profile data.'}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { candidate, experiences, education, skills, documents, completeness, account } = profileData;

  if (isEditing) {
    return (
      <div>
        <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setIsEditing(false);
              loadProfile();
            }}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            ← Back to Dashboard Overview
          </button>
        </div>
        <ProfileEditor
          initialCandidate={candidate}
          initialExperiences={experiences}
          initialEducation={education}
          initialSkills={skills}
          initialDocuments={documents}
          initialCompleteness={completeness}
          onProfileUpdated={loadProfile}
        />
      </div>
    );
  }

  const fullName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Valued Candidate';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome & Overview Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
              <span>CANDIDATE PORTAL</span>
              <span>·</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {candidate.reference_code}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {fullName}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Account email: <span className="font-mono text-slate-800">{account.email}</span> · Last updated:{' '}
              {candidate.updated_at ? new Date(candidate.updated_at).toLocaleString() : 'Just now'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => generateCandidatePdf(candidate, experiences, education, skills)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Download Dossier
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Edit / Update Profile
            </button>
          </div>
        </div>

        {/* Dynamic Completeness Tracker */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Profile Completeness Score</span>
              <span className="text-xs text-slate-400">· Database Verified</span>
            </div>
            <span className="text-sm font-extrabold font-mono text-blue-600 tabular-nums">
              {completeness.percentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>

          {/* Section Checklist Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {[
              { label: 'Basic Info', done: completeness.basicInfo },
              { label: 'Contact', done: completeness.contact },
              { label: 'Location', done: completeness.location },
              { label: 'Role & Seniority', done: completeness.roleAndLevel },
              { label: 'Experience', done: completeness.experience },
              { label: 'Education', done: completeness.education },
              { label: 'Skills', done: completeness.skills },
              { label: 'Work Preferences', done: completeness.workPreferences },
              { label: 'Compensation', done: completeness.compensationAvailability },
            ].map((sec) => (
              <div
                key={sec.label}
                className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                  sec.done
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${sec.done ? 'text-emerald-600' : 'text-slate-300'}`}
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
