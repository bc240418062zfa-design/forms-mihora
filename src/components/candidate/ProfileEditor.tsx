import React, { useState } from 'react';
import {
  Candidate,
  Experience,
  Education,
  Skill,
  CandidateDocument,
  CompletenessBreakdown,
} from '../../types';
import { api } from '../../services/api';
import { generateCandidatePdf } from '../../utils/pdfGenerator';
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  FileCheck,
  FileText,
  Download,
  Building,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  Car,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';

interface ProfileEditorProps {
  initialCandidate: Candidate;
  initialExperiences: Experience[];
  initialEducation: Education[];
  initialSkills: Skill[];
  initialDocuments?: CandidateDocument[];
  initialCompleteness: CompletenessBreakdown;
  onProfileUpdated?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  initialCandidate,
  initialExperiences,
  initialEducation,
  initialSkills,
  initialDocuments = [],
  initialCompleteness,
  onProfileUpdated,
}) => {
  const [candidate, setCandidate] = useState<Candidate>(initialCandidate);
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [completeness, setCompleteness] = useState<CompletenessBreakdown>(initialCompleteness);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for modals/inline adding
  const [newExp, setNewExp] = useState<Partial<Experience>>({
    job_title: '',
    company_name: '',
    employment_type: 'Full-time',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    responsibilities: '',
    technologies: '',
  });
  const [showAddExp, setShowAddExp] = useState(false);

  const [newEdu, setNewEdu] = useState<Partial<Education>>({
    qualification: "Bachelor's Degree",
    institution: '',
    field_of_study: '',
    country: '',
    start_year: 2020,
    completion_year: 2024,
    is_current: false,
    grade_gpa: '',
  });
  const [showAddEdu, setShowAddEdu] = useState(false);

  const [newSkill, setNewSkill] = useState<{
    name: string;
    category: string;
    level: string;
    years: number;
  }>({
    name: '',
    category: 'Engineering / Software',
    level: 'Intermediate',
    years: 3,
  });

  const [isUploading, setIsUploading] = useState(false);

  const steps = [
    { id: 1, label: 'Basic Info', icon: UserIcon },
    { id: 2, label: 'Role & Seniority', icon: Briefcase },
    { id: 3, label: 'Experience', icon: Building },
    { id: 4, label: 'Education', icon: GraduationCap },
    { id: 5, label: 'Skills', icon: Sparkles },
    { id: 6, label: 'Preferences & Commute', icon: Car },
    { id: 7, label: 'Compensation & Links', icon: Clock },
    { id: 8, label: 'Review & Dossier', icon: FileCheck },
  ];

  function UserIcon(props: any) {
    return <MapPin {...props} />;
  }

  const handleInputChange = (field: keyof Candidate, value: any) => {
    setCandidate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProfileData = async (silent = false) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    try {
      const res = await api.updateCandidateProfile(candidate);
      setCandidate(res.candidate);
      setCompleteness(res.completeness);
      if (!silent) {
        setSaveSuccess('Profile saved successfully to PostgreSQL database.');
        setTimeout(() => setSaveSuccess(null), 4000);
      }
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.job_title?.trim() || !newExp.company_name?.trim()) {
      setErrorMessage('Please provide both Job Title and Company Name.');
      return;
    }

    try {
      const res = await api.addExperience(newExp);
      setExperiences((prev) => [res.experience, ...prev]);
      setShowAddExp(false);
      setNewExp({
        job_title: '',
        company_name: '',
        employment_type: 'Full-time',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        responsibilities: '',
        technologies: '',
      });
      await saveProfileData(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add experience.');
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await api.deleteExperience(id);
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
      await saveProfileData(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete experience.');
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdu.qualification?.trim() || !newEdu.institution?.trim()) {
      setErrorMessage('Please provide both Qualification and Institution.');
      return;
    }

    try {
      const res = await api.addEducation(newEdu);
      setEducation((prev) => [res.education, ...prev]);
      setShowAddEdu(false);
      setNewEdu({
        qualification: "Bachelor's Degree",
        institution: '',
        field_of_study: '',
        country: '',
        start_year: 2020,
        completion_year: 2024,
        is_current: false,
        grade_gpa: '',
      });
      await saveProfileData(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add education.');
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await api.deleteEducation(id);
      setEducation((prev) => prev.filter((edu) => edu.id !== id));
      await saveProfileData(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete education.');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    try {
      const res = await api.addSkill({
        skill_name: newSkill.name.trim(),
        category: newSkill.category,
        proficiency_level: newSkill.level,
        years_of_experience: Number(newSkill.years),
      });
      setSkills((prev) => [...prev, res.skill]);
      setNewSkill((prev) => ({ ...prev, name: '' }));
      await saveProfileData(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await api.deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      await saveProfileData(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove skill.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner with Profile Reference & Real Completion Gauge */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
              <span>REFERENCE CODE</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {candidate.reference_code}
              </span>
              <span>·</span>
              <span>PostgreSQL Persisted</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {candidate.first_name || candidate.last_name
                ? `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim()
                : 'Candidate Profile'}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Keep your profile comprehensive and up-to-date for direct evaluation by MIHORA engineering leads.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Completeness
                </span>
                <span className="text-xl font-extrabold font-mono tabular-nums text-slate-900">
                  {completeness.percentage}%
                </span>
              </div>
              <div className="w-36 bg-slate-100 rounded-full h-2.5 mt-1 overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => saveProfileData()}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Multi-Step Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-8 border-b border-slate-200 no-scrollbar">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">{step.id}</span>
              <Icon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: BASIC INFORMATION */}
      {activeStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">01. Basic Personal Information</h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your legal identification and primary residential details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name *</label>
              <input
                type="text"
                value={candidate.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="e.g. Muhammad"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Middle Name</label>
              <input
                type="text"
                value={candidate.middle_name || ''}
                onChange={(e) => handleInputChange('middle_name', e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name *</label>
              <input
                type="text"
                value={candidate.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="e.g. Ali"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred / Display Name</label>
              <input
                type="text"
                value={candidate.preferred_name || ''}
                onChange={(e) => handleInputChange('preferred_name', e.target.value)}
                placeholder="How you like to be addressed"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth (Optional)</label>
              <input
                type="date"
                value={candidate.date_of_birth ? candidate.date_of_birth.substring(0, 10) : ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Country *</label>
              <input
                type="text"
                value={candidate.current_country || ''}
                onChange={(e) => handleInputChange('current_country', e.target.value)}
                placeholder="e.g. Pakistan, UAE, UK"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / Province / Region</label>
              <input
                type="text"
                value={candidate.current_state || ''}
                onChange={(e) => handleInputChange('current_state', e.target.value)}
                placeholder="e.g. Punjab, Sindh"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current City *</label>
              <input
                type="text"
                value={candidate.current_city || ''}
                onChange={(e) => handleInputChange('current_city', e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Locality / Area (General)</label>
              <input
                type="text"
                value={candidate.current_locality || ''}
                onChange={(e) => handleInputChange('current_locality', e.target.value)}
                placeholder="e.g. Gulberg, DHA, Bahria Town"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                saveProfileData(true);
                setActiveStep(2);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              Continue to Roles & Seniority
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ROLES & SENIORITY */}
      {activeStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">02. Position, Role & Professional Level</h2>
          <p className="text-xs text-slate-500 mb-6">
            Detail your primary engineering or technical capabilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Role *</label>
              <input
                type="text"
                value={candidate.primary_role || ''}
                onChange={(e) => handleInputChange('primary_role', e.target.value)}
                placeholder="e.g. Software Engineer, Civil Engineer, Electrical Engineer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Examples: Full Stack Engineer, Site Engineer, Project Engineer, QA/QC Engineer, DevOps Engineer
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seniority Level *</label>
              <select
                value={candidate.seniority_level || 'Mid-Level'}
                onChange={(e) => handleInputChange('seniority_level', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Intern">Intern</option>
                <option value="Junior">Junior</option>
                <option value="L1">L1 Engineer</option>
                <option value="L2">L2 Engineer</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead Engineer</option>
                <option value="Principal">Principal / Architect</option>
                <option value="Manager">Engineering Manager / Lead</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Category</label>
              <select
                value={candidate.professional_category || 'Software & Technology'}
                onChange={(e) => handleInputChange('professional_category', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Software & Technology">Software & Technology</option>
                <option value="Civil & Structural">Civil & Structural Engineering</option>
                <option value="Electrical & Power">Electrical & Power Engineering</option>
                <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
                <option value="Project Management">Project Management & Planning</option>
                <option value="Quality Assurance / QC">Quality Assurance / QC</option>
                <option value="Operations & Logistics">Operations & Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Can You Perform Multiple Roles?
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="can_multi_role"
                    checked={candidate.can_multi_role === true}
                    onChange={() => handleInputChange('can_multi_role', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Yes, multi-role capable</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="can_multi_role"
                    checked={candidate.can_multi_role !== true}
                    onChange={() => handleInputChange('can_multi_role', false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Specialized in single role</span>
                </label>
              </div>
            </div>

            {candidate.can_multi_role && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Secondary / Additional Roles (Comma separated)
                </label>
                <input
                  type="text"
                  value={candidate.secondary_roles || ''}
                  onChange={(e) => handleInputChange('secondary_roles', e.target.value)}
                  placeholder="e.g. Backend Engineer, Cloud Infrastructure, Database Administrator"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Professional Summary & Career Overview
              </label>
              <textarea
                rows={4}
                value={candidate.professional_summary || ''}
                onChange={(e) => handleInputChange('professional_summary', e.target.value)}
                placeholder="Describe your core professional expertise, domain specialties, major projects delivered, and technical focus..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                saveProfileData(true);
                setActiveStep(3);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              Continue to Experience
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: WORK EXPERIENCE */}
      {activeStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">03. Career Experience</h2>
              <p className="text-xs text-slate-500">
                Add your previous employment and contract roles. Stored in relational tables.
              </p>
            </div>
            <button
              onClick={() => setShowAddExp(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Position
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={candidate.total_experience_years ?? 0}
                onChange={(e) => handleInputChange('total_experience_years', e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relevant Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={candidate.relevant_experience_years ?? 0}
                onChange={(e) => handleInputChange('relevant_experience_years', e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Add Experience Modal / Form */}
          {showAddExp && (
            <form onSubmit={handleAddExperience} className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Add Employment Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newExp.job_title}
                    onChange={(e) => setNewExp({ ...newExp, job_title: e.target.value })}
                    placeholder="e.g. Lead Structural Engineer"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={newExp.company_name}
                    onChange={(e) => setNewExp({ ...newExp, company_name: e.target.value })}
                    placeholder="e.g. Allied Engineering Ltd"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={newExp.employment_type || 'Full-time'}
                    onChange={(e) => setNewExp({ ...newExp, employment_type: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newExp.location || ''}
                    onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                    placeholder="e.g. Lahore, Pakistan"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newExp.start_date || ''}
                    onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    disabled={newExp.is_current}
                    value={newExp.end_date || ''}
                    onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white disabled:opacity-50"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(newExp.is_current)}
                      onChange={(e) => setNewExp({ ...newExp, is_current: e.target.checked })}
                    />
                    <span>Currently employed here</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Responsibilities & Achievements</label>
                  <textarea
                    rows={2}
                    value={newExp.responsibilities || ''}
                    onChange={(e) => setNewExp({ ...newExp, responsibilities: e.target.value })}
                    placeholder="Key project responsibilities and accomplishments..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Technologies & Tools Used</label>
                  <input
                    type="text"
                    value={newExp.technologies || ''}
                    onChange={(e) => setNewExp({ ...newExp, technologies: e.target.value })}
                    placeholder="e.g. AutoCAD, Revit, Python, PostgreSQL, Docker"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExp(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Position
                </button>
              </div>
            </form>
          )}

          {/* List of Experiences */}
          {experiences.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
              No previous experience records added yet. Click &quot;Add Position&quot; above to add your employment history.
            </div>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors flex items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{exp.job_title}</h4>
                    <div className="text-xs text-blue-600 font-medium">{exp.company_name}</div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date || 'N/A'} {exp.location && `· ${exp.location}`}
                    </div>
                    {exp.responsibilities && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{exp.responsibilities}</p>
                    )}
                    {exp.technologies && (
                      <div className="text-[11px] text-slate-500 mt-1">
                        <span className="font-semibold">Tools:</span> {exp.technologies}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                saveProfileData(true);
                setActiveStep(4);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
            >
              Continue to Education
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: EDUCATION */}
      {activeStep === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">04. Education & Qualifications</h2>
              <p className="text-xs text-slate-500">
                Degrees, diplomas, and academic credentials.
              </p>
            </div>
            <button
              onClick={() => setShowAddEdu(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Degree / Diploma
            </button>
          </div>

          {showAddEdu && (
            <form onSubmit={handleAddEducation} className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Add Academic Credential</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Qualification / Degree *</label>
                  <input
                    type="text"
                    required
                    value={newEdu.qualification}
                    onChange={(e) => setNewEdu({ ...newEdu, qualification: e.target.value })}
                    placeholder="e.g. BS in Civil Engineering, BSc Computer Science"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Institution / University *</label>
                  <input
                    type="text"
                    required
                    value={newEdu.institution}
                    onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                    placeholder="e.g. UET, NUST, FAST"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={newEdu.field_of_study || ''}
                    onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
                    placeholder="e.g. Structural Engineering, Telecommunications"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={newEdu.country || ''}
                    onChange={(e) => setNewEdu({ ...newEdu, country: e.target.value })}
                    placeholder="e.g. Pakistan"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Start Year</label>
                  <input
                    type="number"
                    value={newEdu.start_year || 2020}
                    onChange={(e) => setNewEdu({ ...newEdu, start_year: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Completion Year</label>
                  <input
                    type="number"
                    value={newEdu.completion_year || 2024}
                    onChange={(e) => setNewEdu({ ...newEdu, completion_year: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEdu(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Education
                </button>
              </div>
            </form>
          )}

          {education.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
              No education records added yet. Click &quot;Add Degree / Diploma&quot; to add your academic credentials.
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors flex items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{edu.qualification}</h4>
                    <div className="text-xs text-blue-600 font-medium">
                      {edu.institution} {edu.country && `· ${edu.country}`}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      {edu.start_year} — {edu.completion_year || 'Present'} {edu.grade_gpa && `(Grade: ${edu.grade_gpa})`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                saveProfileData(true);
                setActiveStep(5);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
            >
              Continue to Skills
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SKILLS */}
      {activeStep === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">05. Technical & Domain Skills</h2>
          <p className="text-xs text-slate-500 mb-6">
            Add structured skills with verified proficiency levels. Avoid plain unstructured text paragraphs.
          </p>

          {/* Add skill inline form */}
          <form onSubmit={handleAddSkill} className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g. AutoCAD, Python, React, Primavera"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Engineering / Software">Engineering / Software</option>
                  <option value="Civil & Structural">Civil & Structural</option>
                  <option value="Electrical / Electronics">Electrical / Electronics</option>
                  <option value="CAD / BIM / Modeling">CAD / BIM / Modeling</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Field & Site Supervision">Field & Site Supervision</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Beginner">Beginner (Working knowledge)</option>
                  <option value="Intermediate">Intermediate (Independent)</option>
                  <option value="Advanced">Advanced (Extensive)</option>
                  <option value="Expert">Expert (Subject Matter Authority)</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div className="grow">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Years</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newSkill.years}
                    onChange={(e) => setNewSkill({ ...newSkill, years: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0 h-[34px] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Render Skills Grid */}
          {skills.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
              No skills added yet. Add your core tools, technologies, and certifications above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{skill.skill_name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="text-blue-600 font-medium">{skill.proficiency_level}</span>
                      <span>·</span>
                      <span>{skill.years_of_experience} yrs</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="text-slate-300 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                saveProfileData(true);
                setActiveStep(6);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
            >
              Continue to Preferences
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: WORK PREFERENCES, ON-SITE DEPLOYMENT & COMMUTE */}
      {activeStep === 6 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">06. Work Preferences, Commute & Accommodation</h2>
          <p className="text-xs text-slate-500 mb-6">
            Specify on-site deployment willingness, maximum commute metrics, and accommodation requirements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Work Modes (Select all applicable)
              </label>
              <div className="space-y-2 mt-2">
                {['Remote', 'Hybrid', 'On-Site', 'Flexible'].map((mode) => {
                  const currentModes = (candidate.work_modes || '').split(',').map((m) => m.trim().toLowerCase());
                  const isChecked = currentModes.includes(mode.toLowerCase());

                  return (
                    <label key={mode} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          let updated: string[];
                          if (e.target.checked) {
                            updated = [...currentModes.filter(Boolean), mode.toLowerCase()];
                          } else {
                            updated = currentModes.filter((m) => m !== mode.toLowerCase());
                          }
                          handleInputChange('work_modes', updated.join(', '));
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{mode}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Willingness for On-Site Engineering Deployment
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="willing_onsite_deployment"
                    checked={candidate.willing_onsite_deployment === true}
                    onChange={() => handleInputChange('willing_onsite_deployment', true)}
                  />
                  <span>Yes, willing to deploy on-site</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="willing_onsite_deployment"
                    checked={candidate.willing_onsite_deployment === false}
                    onChange={() => handleInputChange('willing_onsite_deployment', false)}
                  />
                  <span>No, remote only</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Comfortable Commute Distance (km)
              </label>
              <input
                type="number"
                min="0"
                value={candidate.max_commute_distance_km ?? ''}
                onChange={(e) => handleInputChange('max_commute_distance_km', e.target.value)}
                placeholder="e.g. 25 km"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Comfortable Commute Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={candidate.max_commute_time_minutes ?? ''}
                onChange={(e) => handleInputChange('max_commute_time_minutes', e.target.value)}
                placeholder="e.g. 45 mins"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Accommodation Requirement Status *
              </label>
              <select
                value={candidate.accommodation_status || 'not_required'}
                onChange={(e) => handleInputChange('accommodation_status', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                <option value="not_required">Accommodation Not Required</option>
                <option value="required">Accommodation Required</option>
                <option value="depends_on_location">Depends on Project Site Location</option>
                <option value="required_beyond_distance">Required Beyond Specific Distance</option>
              </select>
            </div>

            {candidate.accommodation_status === 'required_beyond_distance' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Accommodation Required Beyond Distance (km)
                </label>
                <input
                  type="number"
                  min="5"
                  value={candidate.accommodation_beyond_km ?? 50}
                  onChange={(e) => handleInputChange('accommodation_beyond_km', e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Transportation Arrangement
              </label>
              <select
                value={candidate.transportation_status || 'own_transport'}
                onChange={(e) => handleInputChange('transportation_status', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                <option value="own_transport">Own Personal Vehicle / Transport</option>
                <option value="public_transport">Public Transport</option>
                <option value="company_transport_required">Company Transportation Required</option>
                <option value="fuel_allowance_required">Fuel Allowance Required</option>
                <option value="travel_allowance_required">Travel Allowance Required</option>
                <option value="other">Other Practical Arrangement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Willing to Relocate?
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="willing_to_relocate"
                    checked={candidate.willing_to_relocate === true}
                    onChange={() => handleInputChange('willing_to_relocate', true)}
                  />
                  <span>Yes, willing to relocate</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="willing_to_relocate"
                    checked={candidate.willing_to_relocate !== true}
                    onChange={() => handleInputChange('willing_to_relocate', false)}
                  />
                  <span>No, restricted to current area</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setActiveStep(5)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                saveProfileData(true);
                setActiveStep(7);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
            >
              Continue to Compensation & Availability
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: COMPENSATION & AVAILABILITY */}
      {activeStep === 7 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">07. Compensation Expectations & Availability</h2>
          <p className="text-xs text-slate-500 mb-6">
            Structured remuneration criteria and deployment readiness. Stored with numeric accuracy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expected Amount *</label>
              <input
                type="number"
                min="0"
                value={candidate.expected_compensation_amount ?? ''}
                onChange={(e) => handleInputChange('expected_compensation_amount', e.target.value)}
                placeholder="e.g. 250000"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Currency</label>
              <select
                value={candidate.compensation_currency || 'PKR'}
                onChange={(e) => handleInputChange('compensation_currency', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Period Basis</label>
              <select
                value={candidate.compensation_period || 'monthly'}
                onChange={(e) => handleInputChange('compensation_period', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Employment Status *</label>
              <select
                value={candidate.employment_status || 'currently_available'}
                onChange={(e) => handleInputChange('employment_status', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                <option value="currently_available">Currently Available (Immediate)</option>
                <option value="employed">Employed (Exploring)</option>
                <option value="serving_notice">Serving Notice Period</option>
                <option value="unemployed">Unemployed / Available Immediately</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notice Period (Days)</label>
              <input
                type="number"
                min="0"
                value={candidate.notice_period_days ?? 0}
                onChange={(e) => handleInputChange('notice_period_days', e.target.value)}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Earliest Joining Date</label>
              <input
                type="date"
                value={candidate.earliest_joining_date ? candidate.earliest_joining_date.substring(0, 10) : ''}
                onChange={(e) => handleInputChange('earliest_joining_date', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shift & Working Time Availability</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-2">
                {[
                  { key: 'shift_day', label: 'Day Shift' },
                  { key: 'shift_evening', label: 'Evening Shift' },
                  { key: 'shift_night', label: 'Night Shift' },
                  { key: 'shift_rotating', label: 'Rotating Shifts' },
                  { key: 'shift_weekend', label: 'Weekend Work' },
                  { key: 'shift_overtime', label: 'Overtime Ready' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean((candidate as any)[key])}
                      onChange={(e) => handleInputChange(key as keyof Candidate, e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Professional Profiles & Portfolio Links */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Professional Profiles & Portfolio Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={candidate.linkedin_url || ''}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">GitHub / Technical Portfolio</label>
                  <input
                    type="url"
                    value={candidate.github_url || ''}
                    onChange={(e) => handleInputChange('github_url', e.target.value)}
                    placeholder="https://github.com/username or portfolio link"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setActiveStep(6)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => {
                saveProfileData(true);
                setActiveStep(8);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
            >
              Review Complete Profile
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: REVIEW & DOSSIER EXPORT */}
      {activeStep === 8 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">08. Profile Review & Confirmation</h2>
              <p className="text-xs text-slate-500">
                Verify all information before concluding. You can return at any time to update your record.
              </p>
            </div>
            <button
              onClick={() => generateCandidatePdf(candidate, experiences, education, skills)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
            >
              <Download className="w-4 h-4 text-blue-400" />
              Download Official PDF Dossier
            </button>
          </div>

          {/* Structured Dossier Summary */}
          <div className="space-y-6 text-xs text-slate-700">
            {/* Box 1: Core Identification */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Primary Candidate Identity</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-semibold text-slate-800">
                    {candidate.first_name} {candidate.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Role & Level</span>
                  <span className="font-semibold text-slate-800">
                    {candidate.primary_role || 'Not set'} ({candidate.seniority_level || 'Mid-Level'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Location</span>
                  <span className="font-semibold text-slate-800">
                    {candidate.current_city}, {candidate.current_country}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reference ID</span>
                  <span className="font-mono font-bold text-blue-700">
                    {candidate.reference_code}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Commute & Accommodation */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Deployment & Accommodation Specification</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">On-Site Deployment</span>
                  <span className="font-semibold text-slate-800">
                    {candidate.willing_onsite_deployment ? 'Willing' : 'Remote Only'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Max Commute</span>
                  <span className="font-semibold text-slate-800">
                    {candidate.max_commute_distance_km ? `${candidate.max_commute_distance_km} km` : 'Flexible'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Accommodation Status</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {candidate.accommodation_status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Transportation</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {candidate.transportation_status?.replace(/_/g, ' ') || 'None specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 3: Remuneration */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Compensation & Joining Readiness</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Expected Compensation</span>
                  <span className="font-semibold text-slate-800">
                    {candidate.expected_compensation_amount
                      ? `${candidate.expected_compensation_amount.toLocaleString()} ${candidate.compensation_currency} / ${candidate.compensation_period}`
                      : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Status</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {candidate.employment_status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Notice Period</span>
                  <span className="font-semibold text-slate-800">
                    {candidate.notice_period_days || 0} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Profile Status</span>
                  <span className="font-semibold text-emerald-700">
                    Verified Relational Profile
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setActiveStep(7)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => saveProfileData()}
              className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Save Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
