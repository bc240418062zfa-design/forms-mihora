import React, { useState } from 'react';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { SheetArrival } from '../components/ui/MotionPrimitives';
import { EngineeringCampusModel } from '../components/three/EngineeringCampusModel';
import {
  RegionalMobilityShowcase,
  TechnicalEvaluationShowcase,
} from '../components/showcase/EnterpriseModels';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const EVALUATION_PILLARS = [
  {
    code: '01',
    label: 'Academic Foundation & Accreditation',
    detail:
      'Verified university degrees, engineering diplomas, honors, and ongoing technical specialization.',
  },
  {
    code: '02',
    label: 'Applied Engineering & Project Leadership',
    detail:
      'Hands-on employment history, field execution scope, supervisory roles, and engineering tooling.',
  },
  {
    code: '03',
    label: 'Domain Mastery & Technical Proficiency',
    detail:
      'Structured competency levels and verified years across civil, electrical, software, and QA disciplines.',
  },
  {
    code: '04',
    label: 'Site Mobility & Regional Calibration',
    detail:
      'Daily travel limits, site deployment readiness, and project housing or relocation preferences.',
  },
  {
    code: '05',
    label: 'Executive Portfolio & Hiring Review',
    detail:
      'Standardized competency readiness and an instant exportable A4 dossier for MIHORA hiring directors.',
  },
];

const DISCIPLINES_SCHEDULE = [
  {
    code: 'TRK-01',
    title: 'Software & Cloud Systems',
    scope:
      'Enterprise TypeScript web platforms, scalable APIs, distributed data systems, and cloud infrastructure.',
    mode: 'Remote / Hybrid / On-Site',
  },
  {
    code: 'TRK-02',
    title: 'Civil & Structural Engineering',
    scope:
      'Site execution, structural drawings, CAD/BIM coordination, rebar detailing, and field supervision.',
    mode: 'On-Site / Regional Corridor',
  },
  {
    code: 'TRK-03',
    title: 'Electrical & Power Systems',
    scope:
      'Grid distribution, industrial controls, substation instrumentation, and commissioning protocols.',
    mode: 'On-Site Deployment',
  },
  {
    code: 'TRK-04',
    title: 'QA/QC & Field Supervision',
    scope:
      'Inspection checklists, compliance documentation, testing sign-offs, and handover verification.',
    mode: 'Project Site / Hybrid',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [selectedPillar, setSelectedPillar] = useState(0);

  const jumpToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-slate-900 flex flex-col justify-between">
      {/* SECTION 01: LUMINOUS ARCHITECTURAL HERO + 3D CAMPUS MAQUETTE */}
      <section
        id="overview"
        aria-labelledby="hero-heading"
        className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 sm:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#143A7B] mb-4">
                MIHORA Engineering &amp; Academic Talent Network
              </p>

              <h1
                id="hero-heading"
                className="font-display text-4xl sm:text-5xl xl:text-[54px] font-extrabold text-slate-900 leading-[1.06] tracking-tight text-balance"
              >
                Advance Your Engineering &amp;{' '}
                <span className="font-editorial italic font-semibold text-[#143A7B]">
                  Academic Career
                </span>{' '}
                with MIHORA.
              </h1>

              <p className="mt-6 text-base text-slate-600 leading-relaxed max-w-lg">
                The executive talent portal for software architects, civil and structural leads, electrical engineers, and QA directors. Present verified credentials, leadership history, and site mobility in one authoritative portfolio.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-xl transition-colors inline-flex items-center justify-center gap-2 group cursor-pointer shadow-sm whitespace-nowrap"
                >
                  <span>Create Candidate Profile</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('signin')}
                  className="px-5 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-[#CBD5E1] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  Candidate Sign In
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E4E2DA] grid grid-cols-3 gap-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Career Tracks
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">04</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Placement
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">Global</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Portfolio
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">A4 PDF</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <EngineeringCampusModel />

            <div className="flex flex-wrap items-center justify-between gap-4 px-1">
              <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
                {[
                  { id: 'mobility', label: 'Regional Mobility' },
                  { id: 'evaluation', label: 'Evaluation Pillars' },
                  { id: 'tracks', label: 'Engineering Tracks' },
                ].map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => jumpToSection(section.id)}
                    className="nav-link-underline hover:text-[#143A7B] cursor-pointer"
                  >
                    {section.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400">Interactive 3D Campus Model</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02: WORKFORCE MOBILITY & REGIONAL PLACEMENT */}
      <section
        id="mobility"
        aria-labelledby="mobility-heading"
        className="bg-white border-y border-[#E4E2DA] py-16 sm:py-24 scroll-mt-16"
      >
        <SheetArrival className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <RegionalMobilityShowcase />
            </div>

            <div className="lg:col-span-6 space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#143A7B] mb-2">
                  Workforce Mobility &amp; Placement
                </p>
                <h2
                  id="mobility-heading"
                  className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight text-balance"
                >
                  Precision matching for academic specialists and field leaders.
                </h2>
              </div>

              <div className="divide-y divide-[#E4E2DA] border-t border-b border-[#E4E2DA]">
                <div className="py-6">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#143A7B]">
                    <span>01 · Verified Credentials</span>
                    <span className="font-mono text-slate-400">CANDIDATE ID</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-1.5">
                    Authoritative Academic &amp; Career Portfolio
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Every applicant receives a permanent MIHORA candidate ID uniting university qualifications, honors, leadership history, and technical proficiencies in one record.
                  </p>
                </div>

                <div className="py-6">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#143A7B]">
                    <span>02 · Site Calibration</span>
                    <span className="font-mono text-slate-400">COMMUTE &amp; HOUSING</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-1.5">
                    Clear Commute &amp; Relocation Preferences
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Specify comfortable daily travel distances, commute times, transport arrangements, and housing preferences so project directors match you accurately to active assignments.
                  </p>
                </div>

                <div className="py-6">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#143A7B]">
                    <span>03 · Hiring Review</span>
                    <span className="font-mono text-slate-400">EXECUTIVE PDF</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-1.5">
                    Direct Evaluation &amp; Formal Dossier
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Profile updates reflect immediately for MIHORA recruitment directors and generate a clean, executive A4 PDF portfolio you can download anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetArrival>
      </section>

      {/* SECTION 03: FIVE-PILLAR EVALUATION FRAMEWORK */}
      <section
        id="evaluation"
        aria-labelledby="evaluation-heading"
        className="py-16 sm:py-24 scroll-mt-16"
      >
        <SheetArrival className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#143A7B] mb-2">
                Credential Standards
              </p>
              <h2
                id="evaluation-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight text-balance mb-8"
              >
                Five evaluation pillars from academic foundation to placement.
              </h2>

              <div className="space-y-3">
                {EVALUATION_PILLARS.map((item, idx) => {
                  const active = selectedPillar === idx;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setSelectedPillar(idx)}
                      className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-white border-[#143A7B] shadow-[0_8px_24px_-12px_rgba(20,58,123,0.22)]'
                          : 'bg-white/60 border-[#E4E2DA] hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold flex items-center justify-center shrink-0 ${
                              active
                                ? 'bg-[#143A7B] text-white'
                                : 'bg-[#EFECE6] text-slate-600'
                            }`}
                          >
                            {item.code}
                          </span>
                          <span className="font-display text-base font-bold text-slate-900 truncate">
                            {item.label}
                          </span>
                        </div>
                        {active && <Check className="w-4 h-4 text-[#143A7B] shrink-0" />}
                      </div>
                      {active && (
                        <p className="text-sm text-slate-600 mt-3 pl-10 leading-relaxed">
                          {item.detail}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <TechnicalEvaluationShowcase activeIndex={selectedPillar} />

              <div className="enterprise-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Ready to present your credentials?
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Initialize your verified MIHORA candidate profile in under a minute.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-5 py-3 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-xl transition-colors inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Start Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </SheetArrival>
      </section>

      {/* SECTION 04: ACTIVE ENGINEERING TRACKS */}
      <section
        id="tracks"
        aria-labelledby="tracks-heading"
        className="bg-white border-t border-[#E4E2DA] py-16 sm:py-24 scroll-mt-16"
      >
        <SheetArrival className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#143A7B] mb-2">
                Engineering &amp; Technical Opportunities
              </p>
              <h2
                id="tracks-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-slate-900"
              >
                Active Engineering Tracks Across MIHORA Projects
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-sm font-semibold text-[#143A7B] hover:text-[#0E2B5C] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Apply to open tracks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:block enterprise-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">
                MIHORA active engineering career tracks schedule
              </caption>
              <thead>
                <tr className="border-b border-[#E4E2DA] bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="py-4 px-6">
                    Track
                  </th>
                  <th scope="col" className="py-4 px-6">
                    Discipline
                  </th>
                  <th scope="col" className="py-4 px-6">
                    Focus &amp; Responsibilities
                  </th>
                  <th scope="col" className="py-4 px-6 text-right">
                    Work Mode
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DA] text-sm">
                {DISCIPLINES_SCHEDULE.map((row) => (
                  <tr key={row.code} className="hover:bg-[#F7F6F2]/80 transition-colors">
                    <td className="py-5 px-6 font-mono text-xs font-semibold text-[#143A7B] whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="py-5 px-6 font-display font-bold text-slate-900 whitespace-nowrap">
                      {row.title}
                    </td>
                    <td className="py-5 px-6 text-slate-600 leading-relaxed">{row.scope}</td>
                    <td className="py-5 px-6 text-right font-medium text-slate-800 whitespace-nowrap">
                      {row.mode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {DISCIPLINES_SCHEDULE.map((row) => (
              <div key={row.code} className="enterprise-panel p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-[#143A7B]">{row.code}</span>
                  <span className="font-medium text-slate-500">{row.mode}</span>
                </div>
                <div className="text-base font-display font-bold text-slate-900">{row.title}</div>
                <p className="text-sm text-slate-600 leading-relaxed">{row.scope}</p>
              </div>
            ))}
          </div>
        </SheetArrival>
      </section>

      {/* ENTERPRISE CAREERS FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
          <div className="space-y-2.5">
            <MihoraLogo size="sm" variant="full" theme="dark" />
            <p className="text-slate-400 text-xs pt-2 leading-relaxed max-w-xs">
              Enterprise talent acquisition and engineering credential portal for MIHORA projects worldwide.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="text-white font-semibold uppercase tracking-wider mb-2">
              Career Programs
            </div>
            <p>04 Core Engineering &amp; Technical Tracks</p>
            <p>Global Remote, Hybrid &amp; Site Placement</p>
            <p>Direct Hiring Committee Evaluation</p>
          </div>

          <div className="flex flex-col md:items-end justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-6 text-slate-200 font-medium">
              <button
                type="button"
                onClick={() => onNavigate('admin_login')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Admin Access
              </button>
              <a
                href="https://mihora.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <span>mihora.tech</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-slate-500">
              © {new Date().getFullYear()} MIHORA Tech · career.forms.mihora.tech
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
