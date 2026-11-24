import React, { useState } from 'react';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { SheetArrival } from '../components/ui/MotionPrimitives';
import {
  AmbientDustField,
  RegistrationCrosses,
  TitleBlock,
  EdgeDimensionRuler,
  ScrollDimensionRule,
  BlueprintHeroSchematic,
  CommuteCalibrationDiagram,
  DossierLayerDiagram,
  SingleRedMark,
} from '../components/cyanotype/BlueprintApparatus';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const DOSSIER_INDEX = [
  { code: '01', label: 'Identity & Residential Locality', detail: 'Legal identity, calling code, mobile number, city and region' },
  { code: '02', label: 'Engineering Role & Seniority', detail: 'Primary role, seniority tier, and multi-role track options' },
  { code: '03', label: 'Career Experience Ledger', detail: 'Employment timeline, deliverables, and engineering tooling' },
  { code: '04', label: 'Academic Qualifications', detail: 'Accredited degrees, diplomas, institutions, and current enrollment' },
  { code: '05', label: 'Technical Skill Matrix', detail: 'Structured domain proficiency and verified years of practice' },
  { code: '06', label: 'Commute & Site Deployment', detail: 'On-site willingness, km/min thresholds, and accommodation logic' },
  { code: '07', label: 'Remuneration & Availability', detail: 'Expected package, notice period days, shift windows, and PDF dossier' },
];

const DISCIPLINES_SCHEDULE = [
  {
    code: 'TRK-01',
    title: 'Software & Cloud Systems',
    scope: 'Full-stack TypeScript web architecture, REST APIs, relational PostgreSQL design, and cloud infrastructure.',
    mode: 'Remote / Hybrid / On-Site',
  },
  {
    code: 'TRK-02',
    title: 'Civil & Structural Engineering',
    scope: 'Site execution, structural drawings, CAD/BIM coordination, rebar detailing, and field supervision.',
    mode: 'On-Site / Regional Corridor',
  },
  {
    code: 'TRK-03',
    title: 'Electrical & Power Systems',
    scope: 'Grid distribution, industrial controls, substation instrumentation, and commissioning protocols.',
    mode: 'On-Site Deployment',
  },
  {
    code: 'TRK-04',
    title: 'QA/QC & Field Supervision',
    scope: 'Inspection checklists, compliance documentation, testing sign-offs, and handover verification.',
    mode: 'Project Site / Hybrid',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [selectedModule, setSelectedModule] = useState(0);
  const [heroScale, setHeroScale] = useState('1:50');
  const [heroScaleSettled, setHeroScaleSettled] = useState(true);

  const jumpToSheet = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-cyanotype-table flex flex-col justify-between relative">
      <AmbientDustField />
      <EdgeDimensionRuler />

      <div className="relative z-10 max-w-[1180px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 sm:space-y-24">
        {/* SHEET MHR-01: UV EXPOSURE HERO */}
        <section
          id="sheet-mhr-01"
          aria-labelledby="hero-sheet-heading"
          className="cyanotype-sheet p-6 sm:p-10 lg:p-12 scroll-mt-20"
        >
          <RegistrationCrosses />

          {/* Sheet Index Quick-Jump Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[var(--rule-hairline)] text-[11px] font-mono">
            <span className="text-[var(--chalk)]">
              MIHORA TECH · CANDIDATE VAULT · <span className="text-[var(--exposure)]">04 SHEETS ON TABLE</span>
            </span>
            <div className="flex flex-wrap items-center gap-4 text-[var(--chalk)]">
              {[
                { id: 'sheet-mhr-01', code: 'MHR-01' },
                { id: 'sheet-mhr-02', code: 'MHR-02' },
                { id: 'sheet-mhr-03', code: 'MHR-03' },
                { id: 'sheet-mhr-04', code: 'MHR-04' },
              ].map((sheet) => (
                <button
                  key={sheet.id}
                  type="button"
                  onClick={() => jumpToSheet(sheet.id)}
                  className="pencil-link hover:text-[var(--exposure)] cursor-pointer"
                >
                  {sheet.code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs font-mono text-[var(--chalk)] mb-3">
                  career.forms.mihora.tech · Persistent Relational Intake
                </p>

                <h1
                  id="hero-sheet-heading"
                  className="font-display text-3xl sm:text-5xl font-bold text-[var(--exposure)] leading-[1.04] tracking-tight text-balance"
                >
                  Engineering Dossiers Built With Drafting Precision.
                </h1>

                <p className="mt-5 text-sm sm:text-[15px] text-[var(--chalk)] leading-relaxed max-w-xl">
                  A structured PostgreSQL talent registry for software engineers, civil leads, electrical specialists, and QA inspectors. Record credentials across 7 modules, calibrate commute boundaries, and export your A4 PDF dossier.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="px-6 py-3 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors inline-flex items-center justify-center gap-2 group cursor-pointer whitespace-nowrap"
                  >
                    <span>File Candidate Dossier</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('signin')}
                    className="px-3 py-2 text-xs font-mono font-medium text-[var(--exposure)] hover:text-white pencil-link cursor-pointer whitespace-nowrap"
                  >
                    Pull existing record →
                  </button>
                </div>
              </div>

              <div className="pt-5 double-exposure-rule grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <div className="text-[var(--chalk-dim)] text-[10px]">MODULES</div>
                  <div className="text-lg font-bold text-[var(--exposure)] tabular-nums mt-0.5">07</div>
                </div>
                <div>
                  <div className="text-[var(--chalk-dim)] text-[10px]">TRACKS</div>
                  <div className="text-lg font-bold text-[var(--exposure)] tabular-nums mt-0.5">04</div>
                </div>
                <div>
                  <div className="text-[var(--chalk-dim)] text-[10px]">OUTPUT</div>
                  <div className="text-lg font-bold text-[var(--exposure)] mt-0.5">A4 PDF</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <BlueprintHeroSchematic
                onScaleChange={(nextScale, settled) => {
                  setHeroScale(nextScale);
                  setHeroScaleSettled(settled);
                }}
              />
              <div className="flex justify-end">
                <TitleBlock
                  drawingNo="MHR-01"
                  scale={heroScale}
                  scaleTick={heroScaleSettled}
                  date="2026-11"
                  drawnBy="MIH"
                  checkedBy="ENG"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SHEET MHR-02: DEPLOYMENT & COMMUTE CALIBRATION */}
        <SheetArrival>
          <section
            id="sheet-mhr-02"
            aria-labelledby="calibration-sheet-heading"
            className="cyanotype-sheet p-6 sm:p-10 lg:p-12 scroll-mt-20"
          >
            <RegistrationCrosses />

            <div className="mb-6 pb-3 border-b border-[var(--rule-hairline)]">
              <ScrollDimensionRule
                label="CALIBRATED COMMUTE CORRIDOR"
                unitSuffix="km"
                targetNumber={50}
                bandStart={0.05}
                bandEnd={0.45}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <p className="text-xs font-mono text-[var(--chalk)] mb-1.5">
                    Operational Specification · Sheet MHR-02
                  </p>
                  <h2
                    id="calibration-sheet-heading"
                    className="font-display text-2xl sm:text-3xl font-bold text-[var(--exposure)] text-balance"
                  >
                    Measured for field deployment, not throwaway resumes.
                  </h2>
                </div>

                <CommuteCalibrationDiagram />
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-8">
                <div className="divide-y divide-[var(--rule-hairline)] border-t border-b border-[var(--rule-hairline)]">
                  <div className="py-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--chalk)]">01 · PERSISTENCE</span>
                      <span className="font-mono text-xs text-[var(--exposure)]">MIH-CND ID</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--exposure)] mt-1.5">
                      Persistent Relational Engineering Record
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--chalk)] mt-2 leading-relaxed">
                      Every candidate receives an immutable reference code linking experience history, accredited degrees, and domain proficiencies directly inside MIHORA’s PostgreSQL registry.
                    </p>
                  </div>

                  <div className="py-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--chalk)]">02 · CALIBRATION</span>
                      <div className="relative inline-flex items-center">
                        <span className="font-mono text-xs text-[var(--exposure)] font-semibold">
                          KM / MIN THRESHOLD
                        </span>
                        <SingleRedMark variant="tick" className="ml-1.5 -mt-1" />
                      </div>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--exposure)] mt-1.5">
                      Explicit Commute &amp; Housing Boundaries
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--chalk)] mt-2 leading-relaxed">
                      Declare maximum comfortable travel kilometers, minutes, transport setup, and distance-triggered accommodation rules so project directors match you accurately to active sites.
                    </p>
                  </div>

                  <div className="py-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--chalk)]">03 · REVIEW</span>
                      <span className="font-mono text-xs text-[var(--exposure)]">LIVE SSE SYNC</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--exposure)] mt-1.5">
                      Real-Time Director Console &amp; PDF Dossier
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--chalk)] mt-2 leading-relaxed">
                      Profile updates calculate real relational completeness immediately, synchronize to MIHORA engineering directors, and generate a clean A4 dossier PDF anytime.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <TitleBlock drawingNo="MHR-02" scale="1:100" date="2026-11" drawnBy="MIH" checkedBy="OPS" />
                </div>
              </div>
            </div>
          </section>
        </SheetArrival>

        {/* SHEET MHR-03: INTERACTIVE 7-MODULE DOSSIER SCHEMA */}
        <SheetArrival>
          <section
            id="sheet-mhr-03"
            aria-labelledby="schema-sheet-heading"
            className="cyanotype-sheet p-6 sm:p-10 lg:p-12 scroll-mt-20"
          >
            <RegistrationCrosses />

            <div className="mb-6 pb-3 border-b border-[var(--rule-hairline)]">
              <ScrollDimensionRule
                label="SCHEMA COVERAGE SPAN"
                unitSuffix="%"
                targetNumber={100}
                bandStart={0.35}
                bandEnd={0.75}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7">
                <p className="text-xs font-mono text-[var(--chalk)] mb-1.5">
                  Dossier Schema Blueprint · Sheet MHR-03
                </p>
                <h2
                  id="schema-sheet-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[var(--exposure)] text-balance mb-6"
                >
                  Seven structured modules from intake to deployment.
                </h2>

                <div className="border border-[var(--rule-hairline)] divide-y divide-[var(--rule-hairline)]">
                  {DOSSIER_INDEX.map((item, idx) => {
                    const active = selectedModule === idx;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setSelectedModule(idx)}
                        className={`w-full text-left px-4 sm:px-5 py-3.5 flex items-baseline justify-between gap-4 transition-colors cursor-pointer ${
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
                            <span className="text-xs sm:text-sm font-semibold text-[var(--exposure)]">
                              {item.label}
                            </span>
                          </div>
                          {active && (
                            <p className="text-xs text-[var(--chalk)] mt-1.5 pl-7 leading-relaxed">
                              {item.detail}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-[11px] shrink-0 text-[var(--chalk)]">
                          {active ? 'ACTIVE' : 'INSPECT'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <DossierLayerDiagram activeIndex={selectedModule} />

                <div className="border border-[var(--rule-hairline)] bg-[var(--edge)]/80 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--chalk)]">
                    <span>READY TO FILE</span>
                    <span className="text-[var(--exposure)] font-semibold">01 — 07 COMPLETE</span>
                  </div>
                  <p className="text-xs text-[var(--chalk)] leading-relaxed">
                    Initialize your candidate account in under a minute. Each section auto-saves directly to PostgreSQL.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="w-full py-2.5 px-4 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start Candidate Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-end">
                  <TitleBlock drawingNo="MHR-03" scale="NTS" date="2026-11" drawnBy="MIH" checkedBy="ARC" />
                </div>
              </div>
            </div>
          </section>
        </SheetArrival>

        {/* SHEET MHR-04: ENGINEERING DISCIPLINES SCHEDULE TABLE (Theme 064 §6.13) */}
        <SheetArrival>
          <section
            id="sheet-mhr-04"
            aria-labelledby="schedule-sheet-heading"
            className="cyanotype-sheet p-6 sm:p-10 lg:p-12 scroll-mt-20"
          >
            <RegistrationCrosses />

            <div className="pt-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-[var(--chalk)] mb-1.5">
                    Target Disciplines Schedule · Sheet MHR-04
                  </p>
                  <h2
                    id="schedule-sheet-heading"
                    className="font-display text-2xl sm:text-3xl font-bold text-[var(--exposure)]"
                  >
                    Active Engineering Tracks Across MIHORA Projects
                  </h2>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[var(--exposure)] shrink-0">
                  <span>04 CORE TRACKS VERIFIED</span>
                  <SingleRedMark variant="tick" />
                </div>
              </div>

              {/* Desktop Semantic Schedule Table (Stacked Cards on Mobile per §6.13) */}
              <div className="hidden md:block">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <caption className="sr-only">
                    MIHORA active engineering tracks specification schedule — Sheet MHR-04
                  </caption>
                  <thead>
                    <tr className="border-b border-[var(--rule-strong)] text-[var(--chalk)]">
                      <th scope="col" className="py-3 pr-4 font-medium">Track Code</th>
                      <th scope="col" className="py-3 px-4 font-medium">Discipline</th>
                      <th scope="col" className="py-3 px-4 font-medium">Technical Scope</th>
                      <th scope="col" className="py-3 pl-4 text-right font-medium">Deployment Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule-hairline)]">
                    {DISCIPLINES_SCHEDULE.map((row) => (
                      <tr
                        key={row.code}
                        className="group hover:bg-[var(--prussian-raise)]/65 transition-colors"
                      >
                        <td className="py-4 pr-4 font-semibold text-[var(--exposure)] whitespace-nowrap">
                          {row.code}
                        </td>
                        <td className="py-4 px-4 font-semibold text-[var(--exposure)] whitespace-nowrap">
                          <span className="pencil-link">{row.title}</span>
                        </td>
                        <td className="py-4 px-4 text-[var(--chalk)] leading-relaxed">
                          {row.scope}
                        </td>
                        <td className="py-4 pl-4 text-right text-[var(--exposure)] whitespace-nowrap">
                          {row.mode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="double-exposure-rule text-[var(--exposure)] font-semibold">
                      <td colSpan={3} className="py-4 pr-4">
                        TOTAL ENGINEERING TRACKS REGISTERED IN PORTAL
                      </td>
                      <td className="py-4 pl-4 text-right tabular-nums">
                        04 TRACKS · OPEN INTAKE
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Stacked Schedule (Zero horizontal table panning) */}
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
                <TitleBlock drawingNo="MHR-04" scale="1:1" date="2026-11" drawnBy="MIH" checkedBy="ENG" />
              </div>
            </div>
          </section>
        </SheetArrival>
      </div>

      {/* VAULT COLOPHON FOOTER (Theme 064 §6.16) */}
      <footer className="relative z-10 bg-[var(--edge)] double-exposure-rule py-10 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-mono">
          <div className="space-y-2 text-[var(--chalk)]">
            <div className="text-[var(--exposure)] font-semibold">VAULT SPECIFICATION</div>
            <p>04 Drawn Sheets (MHR-01 — MHR-04)</p>
            <p>07 Relational Candidate Dossier Modules</p>
            <p>PostgreSQL Persistence · Verified Output</p>
          </div>

          <div className="space-y-2.5">
            <MihoraLogo size="sm" variant="full" theme="dark" />
            <p className="text-[var(--chalk)]">
              MIHORA Tech Careers · career.forms.mihora.tech
            </p>
            <p className="text-[var(--chalk-dim)]">
              DRN MIH · CHK ENG · © {new Date().getFullYear()} MIHORA Tech
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
              Back to Sheet MHR-01 ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
