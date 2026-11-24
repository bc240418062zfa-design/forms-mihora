import React, { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
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
import { AnimatedNumber } from '../ui/MotionPrimitives';
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  FileCheck,
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
  Copy,
  Check,
  ShieldCheck,
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
  initialCompleteness,
  onProfileUpdated,
}) => {
  const [candidate, setCandidate] = useState<Candidate>(initialCandidate);
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [completeness, setCompleteness] = useState<CompletenessBreakdown>(initialCompleteness);

  const [activeStep, setActiveStep] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('mihora_portal_active_step');
      if (saved) {
        const val = parseInt(saved, 10);
        if (val >= 1 && val <= 8) return val;
      }
    } catch {}
    return 1;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const [newEdu, setNewEdu] = useState<{
    qualification: string;
    institution: string;
    field_of_study: string;
    country: string;
    start_year: string;
    completion_year: string;
    is_current: boolean;
    grade_gpa: string;
  }>({
    qualification: "Bachelor's Degree",
    institution: '',
    field_of_study: '',
    country: '',
    start_year: '2020',
    completion_year: '2024',
    is_current: false,
    grade_gpa: '',
  });
  const [showAddEdu, setShowAddEdu] = useState(false);

  const [newSkill, setNewSkill] = useState<{
    name: string;
    category: string;
    level: string;
    years: string;
  }>({
    name: '',
    category: 'Engineering / Software',
    level: 'Intermediate',
    years: '3',
  });

  const goToStep = (stepNumber: number) => {
    setErrorMessage(null);
    setActiveStep(stepNumber);
    try {
      sessionStorage.setItem('mihora_portal_active_step', String(stepNumber));
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 1:
        return completeness.basicInfo && completeness.location && completeness.contact;
      case 2:
        return completeness.roleAndLevel;
      case 3:
        return completeness.experience;
      case 4:
        return completeness.education;
      case 5:
        return completeness.skills;
      case 6:
        return completeness.workPreferences;
      case 7:
        return completeness.compensationAvailability;
      case 8:
        return completeness.percentage >= 80;
      default:
        return false;
    }
  };

  const steps = [
    { id: 1, label: 'Basic Info', icon: MapPin },
    { id: 2, label: 'Role & Seniority', icon: Briefcase },
    { id: 3, label: 'Experience', icon: Building },
    { id: 4, label: 'Education', icon: GraduationCap },
    { id: 5, label: 'Skills', icon: Sparkles },
    { id: 6, label: 'Commute & Site', icon: Car },
    { id: 7, label: 'Compensation', icon: Clock },
    { id: 8, label: 'Review & PDF', icon: FileCheck },
  ];

  const activeStepMeta = steps.find((s) => s.id === activeStep) || steps[0];

  const handleInputChange = (field: keyof Candidate, value: any) => {
    if (errorMessage) setErrorMessage(null);
    setCandidate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProfileData = async (silent = false): Promise<boolean> => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    try {
      const payload: Partial<Candidate> = {
        ...candidate,
        country_calling_code: candidate.country_calling_code ?? '+92',
      };
      const res = await api.updateCandidateProfile(payload);
      setCandidate(res.candidate);
      setCompleteness(res.completeness);
      if (!silent) {
        setSaveSuccess('Candidate profile saved successfully.');
        window.setTimeout(() => setSaveSuccess(null), 4000);
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      }
      return true;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async (nextStep: number) => {
    if (isSaving) return;
    const ok = await saveProfileData(true);
    if (ok) {
      goToStep(nextStep);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.job_title?.trim() || !newExp.company_name?.trim()) {
      setErrorMessage('Please provide both Job Title and Company Name.');
      return;
    }

    try {
      const res = await api.addExperience({
        ...newExp,
        end_date: newExp.is_current ? null : newExp.end_date || null,
      });
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
    if (!newEdu.qualification.trim() || !newEdu.institution.trim()) {
      setErrorMessage('Please provide both Qualification and Institution.');
      return;
    }

    try {
      const parsedStart = newEdu.start_year.trim() ? parseInt(newEdu.start_year, 10) : null;
      const parsedCompletion =
        !newEdu.is_current && newEdu.completion_year.trim()
          ? parseInt(newEdu.completion_year, 10)
          : null;

      const res = await api.addEducation({
        qualification: newEdu.qualification.trim(),
        institution: newEdu.institution.trim(),
        field_of_study: newEdu.field_of_study.trim() || null,
        country: newEdu.country.trim() || null,
        start_year: parsedStart && !isNaN(parsedStart) ? parsedStart : null,
        completion_year: parsedCompletion && !isNaN(parsedCompletion) ? parsedCompletion : null,
        is_current: newEdu.is_current,
        grade_gpa: newEdu.grade_gpa.trim() || null,
      });

      setEducation((prev) => [res.education, ...prev]);
      setShowAddEdu(false);
      setNewEdu({
        qualification: "Bachelor's Degree",
        institution: '',
        field_of_study: '',
        country: '',
        start_year: '2020',
        completion_year: '2024',
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

    const yearsNum = parseFloat(newSkill.years);
    try {
      const res = await api.addSkill({
        skill_name: newSkill.name.trim(),
        category: newSkill.category,
        proficiency_level: newSkill.level,
        years_of_experience: !isNaN(yearsNum) && yearsNum > 0 ? yearsNum : 1,
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

  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';
  const reqStar = <span className="text-[#B47B2B] ml-0.5">*</span>;
  const subFormCardClass = 'mb-6 p-5 sm:p-6 bg-[#FAF9F6] rounded-xl border border-[#E4E2DA]';
  const primaryCtaClass =
    'px-5 py-2.5 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs';
  const secondaryCtaClass =
    'px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-[#FAF9F6] border border-[#CBD5E1] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer';

  const tileClass = (active: boolean) =>
    `min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
      active
        ? 'bg-[#143A7B] border-[#143A7B] text-white'
        : 'bg-[#FAF9F6] border-[#CBD5E1] text-slate-700 hover:border-[#143A7B]/45 hover:text-slate-900'
    }`;

  const isVerifiedReady = completeness.percentage >= 80;

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Summary Header */}
        <div className="enterprise-card p-6 sm:p-7 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mb-1.5">
                <span>Reference ID</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(candidate.reference_code || '');
                    setCopiedCode(true);
                    window.setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="font-mono font-semibold text-[#143A7B] bg-[#EEF3FA] px-2 py-0.5 rounded-md hover:bg-[#E1EAF7] inline-flex items-center gap-1 cursor-pointer"
                  title="Copy reference code"
                >
                  <span>{candidate.reference_code}</span>
                  {copiedCode ? (
                    <Check className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-80" />
                  )}
                </button>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">Profile Active</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {candidate.first_name || candidate.last_name
                  ? `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim()
                  : 'Candidate Professional Profile'}
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Complete each section in sequence. Your progress saves automatically as you advance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="flex flex-col sm:items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-slate-500">Completeness</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    <AnimatedNumber value={completeness.percentage} suffix="%" />
                  </span>
                </div>
                <div className="w-44 bg-[#EFECE6] rounded-full h-2 mt-1.5 overflow-hidden">
                  <div
                    className="bg-[#143A7B] h-full rounded-full transition-all duration-400"
                    style={{ width: `${completeness.percentage}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => saveProfileData(false)}
                disabled={isSaving}
                className={primaryCtaClass}
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div
              role="status"
              className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">{saveSuccess}</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Mobile Progress Header & Stepper */}
          <div className="lg:hidden enterprise-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-slate-900">
                Section {activeStep} of 8
              </span>
              <span className="font-medium text-slate-500">{activeStepMeta.label}</span>
            </div>
            <div className="w-full bg-[#EFECE6] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#143A7B] h-full rounded-full transition-all duration-300"
                style={{ width: `${(activeStep / 8) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {steps.map((step) => {
                const isActive = activeStep === step.id;
                const isDone = isStepComplete(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 cursor-pointer border ${
                      isActive
                        ? 'bg-[#143A7B] text-white border-[#143A7B]'
                        : isDone
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-slate-600 bg-[#FAF9F6] border-[#E4E2DA] hover:text-slate-900'
                    }`}
                  >
                    <span className="font-mono text-xs">
                      {isDone && !isActive ? '✓' : `0${step.id}`}
                    </span>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Sticky Left Rail */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-4">
            <div className="enterprise-card overflow-hidden">
              <div className="px-4 py-3.5 bg-[#FAF9F6] border-b border-[#E4E2DA] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Profile Sections
              </div>
              <nav aria-label="Profile Sections" className="p-2 space-y-1">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.id;
                  const isDone = isStepComplete(step.id);
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => goToStep(step.id)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EEF3FA] text-[#143A7B] font-semibold'
                          : 'text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-[#143A7B]'
                              : isDone
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="text-sm truncate">{step.label}</span>
                      </span>
                      <span
                        className={`font-mono text-xs shrink-0 ${
                          isDone
                            ? 'text-emerald-600 font-semibold'
                            : isActive
                            ? 'text-[#143A7B] font-semibold'
                            : 'text-slate-400'
                        }`}
                      >
                        {isDone ? '✓' : `0${step.id}`}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="enterprise-card p-4 bg-[#FAF9F6]">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Profile Status</span>
                <span
                  className={`font-semibold ${
                    isVerifiedReady ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isVerifiedReady ? 'Verified Ready' : 'Draft'}
                </span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-900">
                {candidate.reference_code}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {experiences.length} experience · {education.length} education · {skills.length}{' '}
                skills
              </div>
            </div>
          </aside>

          {/* Active Step Form Panel */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={
                  isSaving
                    ? 'opacity-80 transition-opacity duration-150'
                    : 'transition-opacity duration-150'
                }
              >
                {/* STEP 1: BASIC INFORMATION */}
                {activeStep === 1 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                      Section 01 of 08
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Basic Personal &amp; Contact Information
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 mb-6">
                      Legal identification, active phone numbers, and current residential location.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className={labelClass}>
                          First Name {reqStar}
                        </label>
                        <input
                          type="text"
                          value={candidate.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          placeholder="e.g. Muhammad"
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Middle Name</label>
                        <input
                          type="text"
                          value={candidate.middle_name || ''}
                          onChange={(e) => handleInputChange('middle_name', e.target.value)}
                          placeholder="Optional"
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Last Name {reqStar}
                        </label>
                        <input
                          type="text"
                          value={candidate.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          placeholder="e.g. Ali"
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Preferred / Display Name</label>
                        <input
                          type="text"
                          value={candidate.preferred_name || ''}
                          onChange={(e) => handleInputChange('preferred_name', e.target.value)}
                          placeholder="How you like to be addressed"
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Date of Birth (Optional)</label>
                        <input
                          type="date"
                          value={
                            candidate.date_of_birth ? candidate.date_of_birth.substring(0, 10) : ''
                          }
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Country Calling Code {reqStar}
                        </label>
                        <input
                          type="text"
                          value={candidate.country_calling_code ?? '+92'}
                          onChange={(e) =>
                            handleInputChange('country_calling_code', e.target.value)
                          }
                          placeholder="+92, +971, +1"
                          className="field-input font-mono"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Primary Phone / Mobile {reqStar}
                        </label>
                        <input
                          type="tel"
                          value={candidate.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="e.g. 03001234567"
                          className="field-input font-mono"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Alternate / WhatsApp Phone</label>
                        <input
                          type="tel"
                          value={candidate.alternate_phone || ''}
                          onChange={(e) => handleInputChange('alternate_phone', e.target.value)}
                          placeholder="Optional"
                          className="field-input font-mono"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Current Country {reqStar}
                        </label>
                        <input
                          type="text"
                          value={candidate.current_country || ''}
                          onChange={(e) => handleInputChange('current_country', e.target.value)}
                          placeholder="e.g. Pakistan, UAE, UK"
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>State / Province / Region</label>
                        <input
                          type="text"
                          value={candidate.current_state || ''}
                          onChange={(e) => handleInputChange('current_state', e.target.value)}
                          placeholder="e.g. Punjab, Sindh"
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Current City {reqStar}
                        </label>
                        <input
                          type="text"
                          value={candidate.current_city || ''}
                          onChange={(e) => handleInputChange('current_city', e.target.value)}
                          placeholder="e.g. Lahore, Karachi, Islamabad"
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Locality / Area</label>
                        <input
                          type="text"
                          value={candidate.current_locality || ''}
                          onChange={(e) => handleInputChange('current_locality', e.target.value)}
                          placeholder="e.g. Gulberg, DHA"
                          className="field-input"
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E4E2DA] flex justify-end">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleContinue(2)}
                        className={primaryCtaClass}
                      >
                        <span>{isSaving ? 'Saving...' : 'Continue to Role & Seniority'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 2: ROLES & SENIORITY */}
                {activeStep === 2 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                      Section 02 of 08
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Position, Role &amp; Professional Level
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 mb-6">
                      Specify your primary engineering discipline and multi-role flexibility.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>
                          Primary Role {reqStar}
                        </label>
                        <input
                          type="text"
                          value={candidate.primary_role || ''}
                          onChange={(e) => handleInputChange('primary_role', e.target.value)}
                          placeholder="e.g. Software Engineer, Civil Engineer"
                          className="field-input"
                        />
                        <span className="text-xs text-slate-500 mt-1.5 block">
                          Examples: Full Stack Engineer, Site Engineer, Project Engineer, QA/QC Engineer
                        </span>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Seniority Level {reqStar}
                        </label>
                        <select
                          value={candidate.seniority_level || 'Mid-Level'}
                          onChange={(e) => handleInputChange('seniority_level', e.target.value)}
                          className="field-input"
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
                        <label className={labelClass}>Professional Category</label>
                        <select
                          value={candidate.professional_category || 'Software & Technology'}
                          onChange={(e) =>
                            handleInputChange('professional_category', e.target.value)
                          }
                          className="field-input"
                        >
                          <option value="Software & Technology">Software &amp; Technology</option>
                          <option value="Civil & Structural">
                            Civil &amp; Structural Engineering
                          </option>
                          <option value="Electrical & Power">
                            Electrical &amp; Power Engineering
                          </option>
                          <option value="Mechanical & Mechatronics">
                            Mechanical &amp; Mechatronics
                          </option>
                          <option value="Project Management">
                            Project Management &amp; Planning
                          </option>
                          <option value="Quality Assurance / QC">Quality Assurance / QC</option>
                          <option value="Operations & Logistics">Operations &amp; Logistics</option>
                        </select>
                      </div>

                      <div>
                        <span className={labelClass}>Multi-Role Capability</span>
                        <div
                          role="group"
                          aria-label="Multi-Role Capability"
                          className="grid grid-cols-2 gap-2.5"
                        >
                          <button
                            type="button"
                            aria-pressed={candidate.can_multi_role === true}
                            onClick={() => handleInputChange('can_multi_role', true)}
                            className={tileClass(candidate.can_multi_role === true)}
                          >
                            {candidate.can_multi_role === true && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>Multi-role capable</span>
                          </button>
                          <button
                            type="button"
                            aria-pressed={candidate.can_multi_role !== true}
                            onClick={() => handleInputChange('can_multi_role', false)}
                            className={tileClass(candidate.can_multi_role !== true)}
                          >
                            {candidate.can_multi_role !== true && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>Single specialized role</span>
                          </button>
                        </div>
                      </div>

                      {candidate.can_multi_role && (
                        <div className="md:col-span-2">
                          <label className={labelClass}>
                            Secondary / Additional Roles (Comma Separated)
                          </label>
                          <input
                            type="text"
                            value={candidate.secondary_roles || ''}
                            onChange={(e) => handleInputChange('secondary_roles', e.target.value)}
                            placeholder="e.g. Backend Engineer, Cloud Infrastructure, DBA"
                            className="field-input"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          Professional Summary &amp; Career Overview
                        </label>
                        <textarea
                          rows={4}
                          value={candidate.professional_summary || ''}
                          onChange={(e) =>
                            handleInputChange('professional_summary', e.target.value)
                          }
                          placeholder="Summarize your core engineering expertise, project deliveries, and domain focus..."
                          className="field-input"
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E4E2DA] flex justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className={secondaryCtaClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleContinue(3)}
                        className={primaryCtaClass}
                      >
                        <span>{isSaving ? 'Saving...' : 'Continue to Experience'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 3: WORK EXPERIENCE */}
                {activeStep === 3 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                          Section 03 of 08
                        </div>
                        <h2 className="font-display text-xl font-bold text-slate-900">
                          Career Experience History
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          Record employment history and relevant engineering engagements.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddExp((prev) => !prev)}
                        className={primaryCtaClass}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{showAddExp ? 'Close Form' : 'Add Position'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6 mb-6 border-b border-[#E4E2DA]">
                      <div>
                        <label className={labelClass}>Total Experience (Years)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={candidate.total_experience_years ?? 0}
                          onChange={(e) =>
                            handleInputChange('total_experience_years', e.target.value)
                          }
                          className="field-input font-mono"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Relevant Experience (Years)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={candidate.relevant_experience_years ?? 0}
                          onChange={(e) =>
                            handleInputChange('relevant_experience_years', e.target.value)
                          }
                          className="field-input font-mono"
                        />
                      </div>
                    </div>

                    {showAddExp && (
                      <form onSubmit={handleAddExperience} className={subFormCardClass}>
                        <h3 className="font-display text-base font-bold text-slate-900 mb-4">
                          New Employment Record
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className={labelClass}>
                              Job Title {reqStar}
                            </label>
                            <input
                              type="text"
                              required
                              value={newExp.job_title || ''}
                              onChange={(e) => setNewExp({ ...newExp, job_title: e.target.value })}
                              placeholder="e.g. Lead Structural Engineer"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>
                              Company / Organization {reqStar}
                            </label>
                            <input
                              type="text"
                              required
                              value={newExp.company_name || ''}
                              onChange={(e) =>
                                setNewExp({ ...newExp, company_name: e.target.value })
                              }
                              placeholder="e.g. Allied Engineering Ltd"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Employment Type</label>
                            <select
                              value={newExp.employment_type || 'Full-time'}
                              onChange={(e) =>
                                setNewExp({ ...newExp, employment_type: e.target.value })
                              }
                              className="field-input"
                            >
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Contract">Contract</option>
                              <option value="Freelance">Freelance</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Location</label>
                            <input
                              type="text"
                              value={newExp.location || ''}
                              onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                              placeholder="e.g. Lahore, Pakistan"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Start Date</label>
                            <input
                              type="date"
                              value={newExp.start_date || ''}
                              onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })}
                              className="field-input font-mono"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>End Date</label>
                            <input
                              type="date"
                              disabled={Boolean(newExp.is_current)}
                              value={newExp.is_current ? '' : newExp.end_date || ''}
                              onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })}
                              className="field-input font-mono"
                            />
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(newExp.is_current)}
                                onChange={(e) =>
                                  setNewExp({ ...newExp, is_current: e.target.checked })
                                }
                              />
                              <span>Currently employed here</span>
                            </label>
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Responsibilities &amp; Achievements</label>
                            <textarea
                              rows={2}
                              value={newExp.responsibilities || ''}
                              onChange={(e) =>
                                setNewExp({ ...newExp, responsibilities: e.target.value })
                              }
                              placeholder="Key project deliverables and scope..."
                              className="field-input"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Technologies &amp; Tools Used</label>
                            <input
                              type="text"
                              value={newExp.technologies || ''}
                              onChange={(e) =>
                                setNewExp({ ...newExp, technologies: e.target.value })
                              }
                              placeholder="e.g. AutoCAD, Revit, Python, PostgreSQL"
                              className="field-input"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setShowAddExp(false)}
                            className={secondaryCtaClass}
                          >
                            Cancel
                          </button>
                          <button type="submit" className={primaryCtaClass}>
                            Save Position
                          </button>
                        </div>
                      </form>
                    )}

                    {experiences.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-[#CBD5E1] rounded-xl text-slate-500 text-sm bg-[#FAF9F6]">
                        No employment records added yet. Click &ldquo;Add Position&rdquo; above to add your work history.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E4E2DA] border-t border-b border-[#E4E2DA]">
                        {experiences.map((exp) => (
                          <div
                            key={exp.id}
                            className="py-4 flex items-start justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <h4 className="font-display text-sm font-bold text-slate-900">
                                {exp.job_title}
                              </h4>
                              <div className="text-sm text-slate-700 font-medium mt-0.5">
                                {exp.company_name}
                                {exp.employment_type ? ` · ${exp.employment_type}` : ''}
                              </div>
                              <div className="font-mono text-xs text-slate-500 mt-1">
                                {exp.start_date || 'Start'} —{' '}
                                {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                                {exp.location ? ` · ${exp.location}` : ''}
                              </div>
                              {exp.responsibilities && (
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                  {exp.responsibilities}
                                </p>
                              )}
                              {exp.technologies && (
                                <div className="text-xs text-slate-500 mt-1.5 font-mono">
                                  Tools: {exp.technologies}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                              aria-label={`Remove ${exp.job_title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-[#E4E2DA] flex justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className={secondaryCtaClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleContinue(4)}
                        className={primaryCtaClass}
                      >
                        <span>{isSaving ? 'Saving...' : 'Continue to Education'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 4: EDUCATION */}
                {activeStep === 4 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                          Section 04 of 08
                        </div>
                        <h2 className="font-display text-xl font-bold text-slate-900">
                          Education &amp; Academic Qualifications
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          Degrees, engineering diplomas, and accredited academic records.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddEdu((prev) => !prev)}
                        className={primaryCtaClass}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{showAddEdu ? 'Close Form' : 'Add Degree / Diploma'}</span>
                      </button>
                    </div>

                    {showAddEdu && (
                      <form onSubmit={handleAddEducation} className={subFormCardClass}>
                        <h3 className="font-display text-base font-bold text-slate-900 mb-4">
                          New Academic Credential
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className={labelClass}>
                              Qualification / Degree {reqStar}
                            </label>
                            <input
                              type="text"
                              required
                              value={newEdu.qualification}
                              onChange={(e) =>
                                setNewEdu({ ...newEdu, qualification: e.target.value })
                              }
                              placeholder="e.g. BSc Civil Engineering"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>
                              Institution / University {reqStar}
                            </label>
                            <input
                              type="text"
                              required
                              value={newEdu.institution}
                              onChange={(e) =>
                                setNewEdu({ ...newEdu, institution: e.target.value })
                              }
                              placeholder="e.g. UET, NUST, FAST"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Field of Study</label>
                            <input
                              type="text"
                              value={newEdu.field_of_study}
                              onChange={(e) =>
                                setNewEdu({ ...newEdu, field_of_study: e.target.value })
                              }
                              placeholder="e.g. Structural Engineering"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Country</label>
                            <input
                              type="text"
                              value={newEdu.country}
                              onChange={(e) => setNewEdu({ ...newEdu, country: e.target.value })}
                              placeholder="e.g. Pakistan"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Start Year</label>
                            <input
                              type="number"
                              min="1960"
                              max="2035"
                              value={newEdu.start_year}
                              onChange={(e) =>
                                setNewEdu({ ...newEdu, start_year: e.target.value })
                              }
                              className="field-input font-mono"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Completion Year</label>
                            <input
                              type="number"
                              min="1960"
                              max="2040"
                              disabled={newEdu.is_current}
                              value={newEdu.is_current ? '' : newEdu.completion_year}
                              onChange={(e) =>
                                setNewEdu({ ...newEdu, completion_year: e.target.value })
                              }
                              className="field-input font-mono"
                            />
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newEdu.is_current}
                                onChange={(e) =>
                                  setNewEdu({ ...newEdu, is_current: e.target.checked })
                                }
                              />
                              <span>Currently enrolled / in progress</span>
                            </label>
                          </div>
                          <div>
                            <label className={labelClass}>Grade / CGPA (Optional)</label>
                            <input
                              type="text"
                              value={newEdu.grade_gpa}
                              onChange={(e) => setNewEdu({ ...newEdu, grade_gpa: e.target.value })}
                              placeholder="e.g. 3.6 / 4.0"
                              className="field-input font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setShowAddEdu(false)}
                            className={secondaryCtaClass}
                          >
                            Cancel
                          </button>
                          <button type="submit" className={primaryCtaClass}>
                            Save Education
                          </button>
                        </div>
                      </form>
                    )}

                    {education.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-[#CBD5E1] rounded-xl text-slate-500 text-sm bg-[#FAF9F6]">
                        No education records added yet. Click &ldquo;Add Degree / Diploma&rdquo; above.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E4E2DA] border-t border-b border-[#E4E2DA]">
                        {education.map((edu) => (
                          <div
                            key={edu.id}
                            className="py-4 flex items-start justify-between gap-4"
                          >
                            <div>
                              <h4 className="font-display text-sm font-bold text-slate-900">
                                {edu.qualification}
                                {edu.field_of_study ? ` — ${edu.field_of_study}` : ''}
                              </h4>
                              <div className="text-sm text-slate-700 font-medium mt-0.5">
                                {edu.institution}
                                {edu.country ? ` · ${edu.country}` : ''}
                              </div>
                              <div className="font-mono text-xs text-slate-500 mt-1">
                                {edu.start_year || ''} —{' '}
                                {edu.is_current ? 'Present' : edu.completion_year || 'Present'}
                                {edu.grade_gpa ? ` · Grade: ${edu.grade_gpa}` : ''}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteEducation(edu.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                              aria-label={`Remove ${edu.qualification}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-[#E4E2DA] flex justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className={secondaryCtaClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleContinue(5)}
                        className={primaryCtaClass}
                      >
                        <span>{isSaving ? 'Saving...' : 'Continue to Skills'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 5: SKILLS */}
                {activeStep === 5 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                      Section 05 of 08
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Technical &amp; Domain Skills
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 mb-6">
                      Add structured technical skills with calibrated proficiency and years of practice.
                    </p>

                    <form onSubmit={handleAddSkill} className={subFormCardClass}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                        <div>
                          <label className={labelClass}>
                            Skill Name {reqStar}
                          </label>
                          <input
                            type="text"
                            required
                            value={newSkill.name}
                            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                            placeholder="e.g. AutoCAD, Python, React"
                            className="field-input"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Category</label>
                          <select
                            value={newSkill.category}
                            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                            className="field-input"
                          >
                            <option value="Engineering / Software">Engineering / Software</option>
                            <option value="Civil & Structural">Civil &amp; Structural</option>
                            <option value="Electrical / Electronics">
                              Electrical / Electronics
                            </option>
                            <option value="CAD / BIM / Modeling">CAD / BIM / Modeling</option>
                            <option value="Project Management">Project Management</option>
                            <option value="Field & Site Supervision">
                              Field &amp; Site Supervision
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>Proficiency</label>
                          <select
                            value={newSkill.level}
                            onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                            className="field-input"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>

                        <div className="flex items-end gap-2">
                          <div className="grow">
                            <label className={labelClass}>Years</label>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={newSkill.years}
                              onChange={(e) => setNewSkill({ ...newSkill, years: e.target.value })}
                              className="field-input font-mono"
                            />
                          </div>
                          <button type="submit" className={primaryCtaClass}>
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </form>

                    {skills.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-[#CBD5E1] rounded-xl text-slate-500 text-sm bg-[#FAF9F6]">
                        No skills added yet. Add your primary engineering tools and technologies above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 divide-y sm:divide-y-0 border-t border-b border-[#E4E2DA]">
                        {skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="py-3.5 border-b border-[#E4E2DA] flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {skill.skill_name}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 font-mono">
                                <span className="text-emerald-700 font-semibold">
                                  {skill.proficiency_level}
                                </span>{' '}
                                · {skill.years_of_experience} yrs
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1.5 cursor-pointer"
                              aria-label={`Remove ${skill.skill_name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-[#E4E2DA] flex justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(4)}
                        className={secondaryCtaClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleContinue(6)}
                        className={primaryCtaClass}
                      >
                        <span>{isSaving ? 'Saving...' : 'Continue to Commute & Site'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 6: WORK PREFERENCES, ON-SITE DEPLOYMENT & COMMUTE */}
                {activeStep === 6 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                      Section 06 of 08
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Work Preferences, Commute &amp; Accommodation
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 mb-6">
                      Specify on-site deployment willingness, commute limits, and housing parameters.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className={labelClass}>Preferred Work Modes</span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {['Remote', 'Hybrid', 'On-Site', 'Flexible'].map((mode) => {
                            const currentModes = (candidate.work_modes || '')
                              .split(',')
                              .map((m) => m.trim().toLowerCase())
                              .filter(Boolean);
                            const isChecked = currentModes.includes(mode.toLowerCase());

                            return (
                              <button
                                key={mode}
                                type="button"
                                aria-pressed={isChecked}
                                onClick={() => {
                                  const updated = !isChecked
                                    ? Array.from(new Set([...currentModes, mode.toLowerCase()]))
                                    : currentModes.filter((m) => m !== mode.toLowerCase());
                                  handleInputChange('work_modes', updated.join(', '));
                                }}
                                className={`min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                  isChecked
                                    ? 'bg-[#143A7B] border-[#143A7B] text-white'
                                    : 'bg-[#FAF9F6] border-[#CBD5E1] text-slate-700 hover:border-[#143A7B]/45 hover:text-slate-900'
                                }`}
                              >
                                <span>{mode}</span>
                                {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span className={labelClass}>On-Site Engineering Deployment</span>
                        <div
                          role="group"
                          aria-label="On-Site Engineering Deployment"
                          className="grid grid-cols-2 gap-2.5"
                        >
                          <button
                            type="button"
                            aria-pressed={candidate.willing_onsite_deployment === true}
                            onClick={() => handleInputChange('willing_onsite_deployment', true)}
                            className={tileClass(candidate.willing_onsite_deployment === true)}
                          >
                            {candidate.willing_onsite_deployment === true && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>Willing to deploy on-site</span>
                          </button>
                          <button
                            type="button"
                            aria-pressed={candidate.willing_onsite_deployment === false}
                            onClick={() => handleInputChange('willing_onsite_deployment', false)}
                            className={tileClass(candidate.willing_onsite_deployment === false)}
                          >
                            {candidate.willing_onsite_deployment === false && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>Remote only</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Max Comfortable Commute Distance (km)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={candidate.max_commute_distance_km ?? ''}
                          onChange={(e) =>
                            handleInputChange('max_commute_distance_km', e.target.value)
                          }
                          placeholder="e.g. 25"
                          className="field-input font-mono"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Max Comfortable Commute Time (Minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={candidate.max_commute_time_minutes ?? ''}
                          onChange={(e) =>
                            handleInputChange('max_commute_time_minutes', e.target.value)
                          }
                          placeholder="e.g. 45"
                          className="field-input font-mono"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Accommodation Requirement Status {reqStar}
                        </label>
                        <select
                          value={candidate.accommodation_status || 'not_required'}
                          onChange={(e) =>
                            handleInputChange('accommodation_status', e.target.value)
                          }
                          className="field-input"
                        >
                          <option value="not_required">Accommodation Not Required</option>
                          <option value="required">Accommodation Required</option>
                          <option value="depends_on_location">
                            Depends on Project Site Location
                          </option>
                          <option value="required_beyond_distance">
                            Required Beyond Specific Distance
                          </option>
                        </select>
                      </div>

                      {candidate.accommodation_status === 'required_beyond_distance' && (
                        <div>
                          <label className={labelClass}>
                            Accommodation Required Beyond Distance (km)
                          </label>
                          <input
                            type="number"
                            min="5"
                            value={candidate.accommodation_beyond_km ?? 50}
                            onChange={(e) =>
                              handleInputChange('accommodation_beyond_km', e.target.value)
                            }
                            placeholder="e.g. 50"
                            className="field-input font-mono"
                          />
                        </div>
                      )}

                      <div>
                        <label className={labelClass}>Transportation Arrangement</label>
                        <select
                          value={candidate.transportation_status || 'own_transport'}
                          onChange={(e) =>
                            handleInputChange('transportation_status', e.target.value)
                          }
                          className="field-input"
                        >
                          <option value="own_transport">Own Personal Vehicle / Transport</option>
                          <option value="public_transport">Public Transport</option>
                          <option value="company_transport_required">
                            Company Transportation Required
                          </option>
                          <option value="fuel_allowance_required">Fuel Allowance Required</option>
                          <option value="travel_allowance_required">
                            Travel Allowance Required
                          </option>
                          <option value="other">Other Practical Arrangement</option>
                        </select>
                      </div>

                      <div>
                        <span className={labelClass}>Willing to Relocate?</span>
                        <div
                          role="group"
                          aria-label="Willing to Relocate"
                          className="grid grid-cols-2 gap-2.5"
                        >
                          <button
                            type="button"
                            aria-pressed={candidate.willing_to_relocate === true}
                            onClick={() => handleInputChange('willing_to_relocate', true)}
                            className={tileClass(candidate.willing_to_relocate === true)}
                          >
                            {candidate.willing_to_relocate === true && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>Willing to relocate</span>
                          </button>
                          <button
                            type="button"
                            aria-pressed={candidate.willing_to_relocate !== true}
                            onClick={() => handleInputChange('willing_to_relocate', false)}
                            className={tileClass(candidate.willing_to_relocate !== true)}
                          >
                            {candidate.willing_to_relocate !== true && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>Current region only</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E4E2DA] flex justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(5)}
                        className={secondaryCtaClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleContinue(7)}
                        className={primaryCtaClass}
                      >
                        <span>{isSaving ? 'Saving...' : 'Continue to Compensation'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 7: COMPENSATION & AVAILABILITY */}
                {activeStep === 7 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                      Section 07 of 08
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Compensation Expectations &amp; Availability
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 mb-6">
                      Remuneration benchmarks, joining notice period, shift flexibility, and portfolio links.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className={labelClass}>
                          Expected Amount {reqStar}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={candidate.expected_compensation_amount ?? ''}
                          onChange={(e) =>
                            handleInputChange('expected_compensation_amount', e.target.value)
                          }
                          placeholder="e.g. 250000"
                          className="field-input font-mono"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Currency</label>
                        <select
                          value={candidate.compensation_currency || 'PKR'}
                          onChange={(e) =>
                            handleInputChange('compensation_currency', e.target.value)
                          }
                          className="field-input font-mono"
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
                        <label className={labelClass}>Period Basis</label>
                        <select
                          value={candidate.compensation_period || 'monthly'}
                          onChange={(e) => handleInputChange('compensation_period', e.target.value)}
                          className="field-input"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="annual">Annual</option>
                          <option value="hourly">Hourly</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Employment Status {reqStar}
                        </label>
                        <select
                          value={candidate.employment_status || 'currently_available'}
                          onChange={(e) => handleInputChange('employment_status', e.target.value)}
                          className="field-input"
                        >
                          <option value="currently_available">
                            Currently Available (Immediate)
                          </option>
                          <option value="employed">Employed (Exploring)</option>
                          <option value="serving_notice">Serving Notice Period</option>
                          <option value="unemployed">Unemployed / Available Immediately</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Notice Period (Days)</label>
                        <input
                          type="number"
                          min="0"
                          value={candidate.notice_period_days ?? 0}
                          onChange={(e) => handleInputChange('notice_period_days', e.target.value)}
                          placeholder="e.g. 30"
                          className="field-input font-mono"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Earliest Joining Date</label>
                        <input
                          type="date"
                          value={
                            candidate.earliest_joining_date
                              ? candidate.earliest_joining_date.substring(0, 10)
                              : ''
                          }
                          onChange={(e) =>
                            handleInputChange('earliest_joining_date', e.target.value)
                          }
                          className="field-input font-mono"
                        />
                      </div>

                      <div className="md:col-span-3 pt-2">
                        <span className={labelClass}>Shift &amp; Working Time Availability</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                          {[
                            { key: 'shift_day', label: 'Day Shift' },
                            { key: 'shift_evening', label: 'Evening Shift' },
                            { key: 'shift_night', label: 'Night Shift' },
                            { key: 'shift_rotating', label: 'Rotating' },
                            { key: 'shift_weekend', label: 'Weekends' },
                            { key: 'shift_overtime', label: 'Overtime' },
                          ].map(({ key, label }) => {
                            const isChecked = Boolean((candidate as any)[key]);
                            return (
                              <button
                                key={key}
                                type="button"
                                aria-pressed={isChecked}
                                onClick={() =>
                                  handleInputChange(key as keyof Candidate, !isChecked)
                                }
                                className={`min-h-[42px] px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-1.5 ${
                                  isChecked
                                    ? 'bg-[#143A7B] border-[#143A7B] text-white'
                                    : 'bg-[#FAF9F6] border-[#CBD5E1] text-slate-700 hover:border-[#143A7B]/45 hover:text-slate-900'
                                }`}
                              >
                                <span className="truncate">{label}</span>
                                {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="md:col-span-3 pt-6 border-t border-[#E4E2DA]">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                          Professional Profiles &amp; Portfolio Links (Optional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>LinkedIn URL</label>
                            <input
                              type="url"
                              value={candidate.linkedin_url || ''}
                              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                              placeholder="https://linkedin.com/in/username"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>GitHub URL</label>
                            <input
                              type="url"
                              value={candidate.github_url || ''}
                              onChange={(e) => handleInputChange('github_url', e.target.value)}
                              placeholder="https://github.com/username"
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Portfolio / Website URL</label>
                            <input
                              type="url"
                              value={candidate.portfolio_url || ''}
                              onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                              placeholder="https://your-portfolio.dev"
                              className="field-input"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E4E2DA] flex justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(6)}
                        className={secondaryCtaClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleContinue(8)}
                        className={primaryCtaClass}
                      >
                        <span>{isSaving ? 'Saving...' : 'Review Complete Profile'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 8: REVIEW & DOSSIER EXPORT */}
                {activeStep === 8 && (
                  <section className="enterprise-card p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DA]">
                      <div>
                        <div className="text-xs font-semibold text-[#143A7B] uppercase tracking-wider mb-1">
                          Section 08 of 08
                        </div>
                        <h2 className="font-display text-xl font-bold text-slate-900">
                          Profile Review &amp; Confirmation
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          Verify all details below before confirming. Updates remain editable at any time.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => generateCandidatePdf(candidate, experiences, education, skills)}
                        className={secondaryCtaClass}
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                        <span>Download PDF Dossier</span>
                      </button>
                    </div>

                    <div className="divide-y divide-[#E4E2DA] text-sm">
                      <div className="py-5">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          01 · Candidate Identity
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-slate-500 block text-xs">Full Name</span>
                            <span className="font-semibold text-slate-900 mt-0.5 block">
                              {candidate.first_name} {candidate.last_name}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Role &amp; Level</span>
                            <span className="font-semibold text-slate-900 mt-0.5 block">
                              {candidate.primary_role || 'Not set'} (
                              {candidate.seniority_level || 'Mid-Level'})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Location</span>
                            <span className="font-semibold text-slate-900 mt-0.5 block">
                              {candidate.current_city || '—'}, {candidate.current_country || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Reference ID</span>
                            <span className="font-mono font-bold text-[#143A7B] mt-0.5 block">
                              {candidate.reference_code}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="py-5">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          02 · Deployment &amp; Commute Preferences
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-slate-500 block text-xs">
                              On-Site Deployment
                            </span>
                            <span className="font-semibold text-slate-900 mt-0.5 block">
                              {candidate.willing_onsite_deployment ? 'Willing' : 'Remote Only'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Max Commute</span>
                            <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                              {candidate.max_commute_distance_km
                                ? `${candidate.max_commute_distance_km} km`
                                : 'Flexible'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Accommodation</span>
                            <span className="font-semibold text-slate-900 capitalize mt-0.5 block">
                              {candidate.accommodation_status?.replace(/_/g, ' ') || 'Not required'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Transportation</span>
                            <span className="font-semibold text-slate-900 capitalize mt-0.5 block">
                              {candidate.transportation_status?.replace(/_/g, ' ') ||
                                'None specified'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="py-5">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          03 · Compensation &amp; Joining Readiness
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-slate-500 block text-xs">
                              Expected Remuneration
                            </span>
                            <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                              {candidate.expected_compensation_amount
                                ? `${Number(
                                    candidate.expected_compensation_amount
                                  ).toLocaleString()} ${candidate.compensation_currency} / ${
                                    candidate.compensation_period
                                  }`
                                : 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Employment Status</span>
                            <span className="font-semibold text-slate-900 capitalize mt-0.5 block">
                              {candidate.employment_status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Notice Period</span>
                            <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                              {candidate.notice_period_days || 0} days
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">
                              Profile Completeness
                            </span>
                            <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                              {completeness.percentage}% Complete
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Portfolio Summary Card */}
                    <div className="mt-6 bg-[#FAF9F6] rounded-xl border border-[#E4E2DA] p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E4E2DA]">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            MIHORA Tech Careers · Candidate Portfolio Summary
                          </div>
                          <div className="font-display text-lg font-bold tracking-tight text-slate-900 mt-1">
                            {candidate.first_name || candidate.last_name
                              ? `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim()
                              : 'Unnamed Engineering Candidate'}
                          </div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            {candidate.reference_code} · {candidate.primary_role || 'Role Unassigned'}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${
                            isVerifiedReady
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>
                            {isVerifiedReady
                              ? 'Verified Ready'
                              : `Draft · ${completeness.percentage}%`}
                          </span>
                        </span>
                      </div>
                      <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="block text-slate-500">Experience</span>
                          <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                            {experiences.length} record(s)
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Education</span>
                          <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                            {education.length} degree(s)
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Skills</span>
                          <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                            {skills.length} verified
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Readiness</span>
                          <span className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5 block">
                            {completeness.percentage}% Complete
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#E4E2DA] flex justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(7)}
                        className={secondaryCtaClass}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveProfileData(false)}
                        className={primaryCtaClass}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSaving ? 'Confirming...' : 'Confirm & Save Profile'}</span>
                      </button>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
};
