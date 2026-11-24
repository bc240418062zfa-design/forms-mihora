import React, { useState, useCallback } from 'react';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { SheetArrival } from '../components/ui/MotionPrimitives';
import { EngineeringCampusModel } from '../components/three/EngineeringCampusModel';
import {
  AmbientDustField,
  RegistrationCrosses,
  TitleBlock,
  EdgeDimensionRuler,
  ScrollDimensionRule,
  CommuteCalibrationDiagram,
  DossierLayerDiagram,
  SingleRedMark,
} from '../components/cyanotype/BlueprintApparatus';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

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
  const [heroStatus, setHeroStatus] = useState('OPEN');
  const [heroStatusSettled, setHeroStatusSettled] = useState(true);

  const handleHeroStatusChange = useCallback((nextStatus: string, settled: boolean) => {
    setHeroStatus(nextStatus);
    setHeroStatusSettled(settled);
  }, []);

  const jumpToSheet = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-cyanotype-table flex flex-col justify-between relative">
      <AmbientDustField />
      <EdgeDimensionRuler />

      <div className="relative z-10 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">
        {/* SECTION 01: ENTERPRISE TALENT PORTAL HERO + REAL-TIME 3D CAMPUS MODEL */}
        <section
          id="sheet-mhr-01"
          aria-labelledby="hero-sheet-heading"
          className="cyanotype-sheet p-6 sm:p-10 lg:p-14 scroll-mt-20"
        >
          <RegistrationCrosses />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div>
                <p className="text-xs font-mono text-[var(--chalk)] tracking-wider mb-4">
                  MIHORA TECH · CAREERS &amp; ACADEMIC TALENT NETWORK
                </p>

                <h1
                  id="hero-sheet-heading"
                  className="font-display text-4xl sm:text-5xl xl:text-[54px] font-bold text-[var(--exposure)] leading-[1.03] tracking-tight text-balance"
                >
                  Advance Your Engineering &amp; Academic Career with MIHORA.
                </h1>

                <p className="mt-6 text-sm sm:text-base text-[var(--chalk)] leading-relaxed max-w-lg">
                  The executive talent portal for software architects, civil and structural leads, electrical engineers, and QA directors. Present verified academic credentials, leadership history, and site mobility in one authoritative portfolio.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="px-6 py-3.5 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors inline-flex items-center justify-center gap-2 group cursor-pointer whitespace-nowrap"
                  >
                    <span>Create Candidate Profile</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('signin')}
                    className="px-3 py-2 text-xs font-mono font-medium text-[var(--exposure)] hover:text-white pencil-link cursor-pointer whitespace-nowrap"
                  >
                    Candidate Sign In →
                  </button>
                </div>
              </div>

              <div className="pt-6 double-exposure-rule grid grid-cols-3 gap-5 text-xs font-mono">
                <div>
                  <div className="text-[var(--chalk-dim)] text-[10px] tracking-wider">
                    CAREER TRACKS
                  </div>
                  <div className="text-xl font-bold text-[var(--exposure)] tabular-nums mt-1">
                    04
                  </div>
                </div>
                <div>
                  <div className="text-[var(--chalk-dim)] text-[10px] tracking-wider">
                    PLACEMENT
                  </div>
                  <div className="text-xl font-bold text-[var(--exposure)] mt-1">GLOBAL</div>
                </div>
                <div>
                  <div className="text-[var(--chalk-dim)] text-[10px] tracking-wider">
                    PORTFOLIO
                  </div>
                  <div className="text-xl font-bold text-[var(--exposure)] mt-1">A4 PDF</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <EngineeringCampusModel onStatusChange={handleHeroStatusChange} />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-5 text-[11px] font-mono text-[var(--chalk)]">
                  {[
                    { id: 'sheet-mhr-02', label: '02 Mobility' },
                    { id: 'sheet-mhr-03', label: '03 Evaluation' },
                    { id: 'sheet-mhr-04', label: '04 Tracks' },
                  ].map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => jumpToSheet(section.id)}
                      className="pencil-link hover:text-[var(--exposure)] cursor-pointer"
                    >
                      {section.label}
                    </button>
                  ))}
                </div>

                <TitleBlock
                  drawingNo="CAREERS PORTAL"
                  scale={heroStatus}
                  scaleTick={heroStatusSettled}
                  date="2026"
                  drawnBy="MIHORA"
                  checkedBy="ACTIVE"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: WORKFORCE MOBILITY & PLACEMENT */}
        <SheetArrival>
          <section
            id="sheet-mhr-02"
            aria-labelledby="calibration-sheet-heading"
            className="cyanotype-sheet p-6 sm:p-10 lg:p-14 scroll-mt-20"
          >
            <RegistrationCrosses />

            <div className="mb-8 pb-4 border-b border-[var(--rule-hairline)]">
              <ScrollDimensionRule
                label="REGIONAL MOBILITY THRESHOLD"
                unitSuffix="km"
                targetNumber={50}
                bandStart={0.05}
                bandEnd={0.45}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <p className="text-xs font-mono text-[var(--chalk)] tracking-wider mb-2">
                    WORKFORCE MOBILITY · REGIONAL &amp; SITE PLACEMENT
                  </p>
                  <h2
                    id="calibration-sheet-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[var(--exposure)] text-balance leading-tight"
                  >
                    Precision matching for academic specialists and field leaders.
                  </h2>
                </div>

                <CommuteCalibrationDiagram />
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-8">
                <div className="divide-y divide-[var(--rule-hairline)] border-t border-b border-[var(--rule-hairline)]">
                  <div className="py-7">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--chalk)]">01 · CREDENTIALS</span>
                      <span className="font-mono text-xs text-[var(--exposure)]">CANDIDATE ID</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[var(--exposure)] mt-2">
                      Verified Academic &amp; Career Portfolio
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--chalk)] mt-2.5 leading-relaxed">
                      Every applicant receives a permanent MIHORA candidate ID connecting university qualifications, certifications, leadership history, and technical proficiencies in one authoritative record.
                    </p>
                  </div>

                  <div className="py-7">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--chalk)]">02 · MOBILITY</span>
                      <div className="relative inline-flex items-center">
                        <span className="font-mono text-xs text-[var(--exposure)] font-semibold">
                          KM / MIN PREFERENCE
                        </span>
                        <SingleRedMark variant="tick" className="ml-1.5 -mt-1" />
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[var(--exposure)] mt-2">
                      Clear Commute &amp; Housing Preferences
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--chalk)] mt-2.5 leading-relaxed">
                      Specify comfortable daily travel distances, commute times, transport arrangements, and relocation needs so regional project directors match you accurately to active assignments.
                    </p>
                  </div>

                  <div className="py-7">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--chalk)]">03 · EVALUATION</span>
                      <span className="font-mono text-xs text-[var(--exposure)]">EXECUTIVE PDF</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[var(--exposure)] mt-2">
                      Direct Hiring Review &amp; Formal Dossier
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--chalk)] mt-2.5 leading-relaxed">
                      Profile updates reflect immediately for MIHORA’s recruitment directors and generate a clean, executive A4 PDF portfolio you can download anytime.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <TitleBlock
                    drawingNo="SITE MOBILITY"
                    scale="GLOBAL"
                    date="2026"
                    drawnBy="TALENT"
                    checkedBy="OPS"
                  />
                </div>
              </div>
            </div>
          </section>
        </SheetArrival>

        {/* SECTION 03: CANDIDATE EVALUATION FRAMEWORK */}
        <SheetArrival>
          <section
            id="sheet-mhr-03"
            aria-labelledby="schema-sheet-heading"
            className="cyanotype-sheet p-6 sm:p-10 lg:p-14 scroll-mt-20"
          >
            <RegistrationCrosses />

            <div className="mb-8 pb-4 border-b border-[var(--rule-hairline)]">
              <ScrollDimensionRule
                label="EVALUATION READINESS"
                unitSuffix="%"
                targetNumber={100}
                bandStart={0.35}
                bandEnd={0.75}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-6">
                <p className="text-xs font-mono text-[var(--chalk)] tracking-wider mb-2">
                  CREDENTIAL STANDARDS · CANDIDATE EVALUATION
                </p>
                <h2
                  id="schema-sheet-heading"
                  className="font-display text-3xl sm:text-4xl font-bold text-[var(--exposure)] text-balance leading-tight mb-7"
                >
                  Five evaluation pillars from academic foundation to placement.
                </h2>

                <div className="border border-[var(--rule-hairline)] divide-y divide-[var(--rule-hairline)]">
                  {EVALUATION_PILLARS.map((item, idx) => {
                    const active = selectedPillar === idx;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setSelectedPillar(idx)}
                        className={`w-full text-left px-5 py-4 flex items-baseline justify-between gap-4 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[var(--prussian-raise)] text-[var(--exposure)]'
                            : 'bg-[var(--prussian)] hover:bg-[var(--prussian-raise)]/65 text-[var(--chalk)]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-3">
                            <span className="font-mono text-xs font-semibold text-[var(--exposure)] shrink-0">
                              {item.code}.
                            </span>
                            <span className="text-sm font-semibold text-[var(--exposure)]">
                              {item.label}
                            </span>
                          </div>
                          {active && (
                            <p className="text-xs sm:text-sm text-[var(--chalk)] mt-2 pl-7 leading-relaxed">
                              {item.detail}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-[11px] shrink-0 text-[var(--chalk)]">
                          {active ? 'SELECTED' : 'VIEW'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <DossierLayerDiagram activeIndex={selectedPillar} />

                <div className="border border-[var(--rule-hairline)] bg-[var(--edge)]/85 p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--chalk)]">
                    <span>READY TO APPLY</span>
                    <span className="text-[var(--exposure)] font-semibold">DIRECT EVALUATION</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--chalk)] leading-relaxed">
                    Create your MIHORA candidate profile in under a minute and keep your academic and engineering record ready for upcoming opportunities.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="w-full py-3 px-4 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start Candidate Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-end">
                  <TitleBlock
                    drawingNo="EVALUATION"
                    scale="MERIT"
                    date="2026"
                    drawnBy="BOARD"
                    checkedBy="VERIFIED"
                  />
                </div>
              </div>
            </div>
          </section>
        </SheetArrival>

        {/* SECTION 04: ENGINEERING DISCIPLINES SCHEDULE TABLE */}
        <SheetArrival>
          <section
            id="sheet-mhr-04"
            aria-labelledby="schedule-sheet-heading"
            className="cyanotype-sheet p-6 sm:p-10 lg:p-14 scroll-mt-20"
          >
            <RegistrationCrosses />

            <div className="pt-2 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-[var(--chalk)] tracking-wider mb-2">
                    ENGINEERING &amp; TECHNICAL OPPORTUNITIES
                  </p>
                  <h2
                    id="schedule-sheet-heading"
                    className="font-display text-3xl sm:text-4xl font-bold text-[var(--exposure)]"
                  >
                    Active Engineering Tracks Across MIHORA Projects
                  </h2>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[var(--exposure)] shrink-0">
                  <span>04 CORE TRACKS OPEN</span>
                  <SingleRedMark variant="tick" />
                </div>
              </div>

              {/* Desktop Semantic Schedule Table */}
              <div className="hidden md:block">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <caption className="sr-only">
                    MIHORA active engineering career tracks specification schedule
                  </caption>
                  <thead>
                    <tr className="border-b border-[var(--rule-strong)] text-[var(--chalk)]">
                      <th scope="col" className="py-3.5 pr-4 font-medium">
                        Track Code
                      </th>
                      <th scope="col" className="py-3.5 px-4 font-medium">
                        Discipline
                      </th>
                      <th scope="col" className="py-3.5 px-4 font-medium">
                        Focus &amp; Responsibilities
                      </th>
                      <th scope="col" className="py-3.5 pl-4 text-right font-medium">
                        Work Mode
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule-hairline)]">
                    {DISCIPLINES_SCHEDULE.map((row) => (
                      <tr
                        key={row.code}
                        className="group hover:bg-[var(--prussian-raise)]/65 transition-colors"
                      >
                        <td className="py-5 pr-4 font-semibold text-[var(--exposure)] whitespace-nowrap">
                          {row.code}
                        </td>
                        <td className="py-5 px-4 font-semibold text-[var(--exposure)] whitespace-nowrap">
                          <span className="pencil-link">{row.title}</span>
                        </td>
                        <td className="py-5 px-4 text-[var(--chalk)] leading-relaxed">
                          {row.scope}
                        </td>
                        <td className="py-5 pl-4 text-right text-[var(--exposure)] whitespace-nowrap">
                          {row.mode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="double-exposure-rule text-[var(--exposure)] font-semibold">
                      <td colSpan={3} className="py-4 pr-4">
                        ACTIVE ENGINEERING &amp; ACADEMIC TALENT TRACKS
                      </td>
                      <td className="py-4 pl-4 text-right tabular-nums">
                        04 TRACKS · OPEN INTAKE
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Stacked Schedule */}
              <div className="md:hidden divide-y divide-[var(--rule-hairline)] border-t border-b border-[var(--rule-hairline)]">
                {DISCIPLINES_SCHEDULE.map((row) => (
                  <div key={row.code} className="py-4 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-[var(--chalk)]">
                      <span className="font-semibold text-[var(--exposure)]">{row.code}</span>
                      <span>{row.mode}</span>
                    </div>
                    <div className="text-sm font-display font-bold text-[var(--exposure)]">
                      {row.title}
                    </div>
                    <p className="text-xs text-[var(--chalk)] leading-relaxed">{row.scope}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <TitleBlock
                  drawingNo="CAREER TRACKS"
                  scale="OPEN"
                  date="2026"
                  drawnBy="MIHORA"
                  checkedBy="HIRING"
                />
              </div>
            </div>
          </section>
        </SheetArrival>
      </div>

      {/* ENTERPRISE CAREERS FOOTER */}
      <footer className="relative z-10 bg-[var(--edge)] double-exposure-rule py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-mono">
          <div className="space-y-2 text-[var(--chalk)]">
            <div className="text-[var(--exposure)] font-semibold">ENTERPRISE CAREERS</div>
            <p>04 Core Engineering &amp; Technical Tracks</p>
            <p>Global Remote, Hybrid &amp; Site Placement</p>
            <p>Direct Hiring Committee Evaluation</p>
          </div>

          <div className="space-y-2.5">
            <MihoraLogo size="sm" variant="full" theme="dark" />
            <p className="text-[var(--chalk)]">
              MIHORA Tech Careers · career.forms.mihora.tech
            </p>
            <p className="text-[var(--chalk-dim)]">
              Enterprise Talent Acquisition · © {new Date().getFullYear()} MIHORA Tech
            </p>
          </div>

          <div className="flex flex-col md:items-end justify-between gap-3 text-[var(--exposure)]">
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => onNavigate('admin_login')}
                className="pencil-link cursor-pointer"
              >
                Admin Access
              </button>
              <a
                href="https://mihora.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="pencil-link inline-flex items-center gap-1"
              >
                <span>mihora.tech</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[var(--chalk)] hover:text-[var(--exposure)] pencil-link cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
