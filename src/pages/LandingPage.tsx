import React, { useState } from 'react';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { Reveal } from '../components/ui/MotionPrimitives';
import { ArchitecturalMedia } from '../components/ui/ArchitecturalMedia';
import { useScrollProgress } from '../utils/useScrollProgress';
import heroStudioImg from '../assets/images/hero_engineering_studio_1795454842220.jpg';
import fieldSiteImg from '../assets/images/field_site_supervision_1795454843496.jpg';
import systemsDeskImg from '../assets/images/precision_systems_workstation_1795454842890.jpg';
import { ArrowRight, ArrowUpRight, Cpu, Building, Layers, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const DOSSIER_INDEX = [
  { code: '01', label: 'Identity & Residential Locality', detail: 'Contact details, city, region, and calling code' },
  { code: '02', label: 'Engineering Role & Seniority', detail: 'Primary role, seniority tier, and multi-role track' },
  { code: '03', label: 'Career Experience Ledger', detail: 'Employment timeline, deliverables, and tooling' },
  { code: '04', label: 'Academic Qualifications', detail: 'Degrees, institutions, and academic standing' },
  { code: '05', label: 'Technical Skill Matrix', detail: 'Structured proficiency level and practice years' },
  { code: '06', label: 'Commute & Site Deployment', detail: 'On-site willingness, km/min limits, and housing' },
  { code: '07', label: 'Remuneration & Availability', detail: 'Expected package, notice days, and shift windows' },
];

const DISCIPLINES = [
  {
    index: '01',
    title: 'Software & Cloud',
    summary: 'Full-stack web systems, backend APIs, cloud architecture, and database engineering.',
    icon: Cpu,
  },
  {
    index: '02',
    title: 'Civil & Structural',
    summary: 'Site execution, structural engineering, CAD/BIM modeling, and project planning.',
    icon: Building,
  },
  {
    index: '03',
    title: 'Electrical & Power',
    summary: 'Power distribution, field instrumentation, industrial controls, and grid systems.',
    icon: Layers,
  },
  {
    index: '04',
    title: 'QA/QC & Supervision',
    summary: 'Quality inspection, compliance verification, testing protocols, and site supervision.',
    icon: ShieldCheck,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { scrollY } = useScrollProgress();
  const [selectedModule, setSelectedModule] = useState(0);
  const subtleParallax = Math.min(16, scrollY * 0.035);

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] flex flex-col justify-between">
      {/* 1. Hero Section — Architectural Split with High-Resolution Visual Focal Anchor */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--surface-elevated)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left 6 Columns: Headline, Value Proposition, Primary CTA */}
            <div className="lg:col-span-6 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs font-mono text-[var(--accent-primary)] font-medium mb-4">
                  MIHORA Tech · Candidate Registry · career.forms.mihora.tech
                </p>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-[var(--ink-primary)] leading-[1.06] tracking-[-0.03em] text-balance max-w-xl">
                  Build Your Persistent Technical Dossier for MIHORA Tech.
                </h1>

                <p className="mt-6 text-base text-[var(--ink-secondary)] leading-relaxed max-w-lg">
                  A structured talent portal for engineers, site leads, and technical specialists. Record your qualifications once, calibrate commute and on-site deployment thresholds, and update your availability any time.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="px-6 py-3.5 text-sm font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-md)] transition-colors inline-flex items-center justify-center gap-2 group cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Create Candidate Account</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('signin')}
                    className="px-5 py-3.5 text-sm font-semibold text-[var(--ink-primary)] hover:text-[var(--accent-primary)] transition-colors inline-flex items-center justify-center cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Sign in to existing profile →
                  </button>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--ink-muted)] font-mono">
                <span>PostgreSQL Relational Persistence</span>
                <span aria-hidden="true">·</span>
                <span>PDF Dossier Export</span>
                <span aria-hidden="true">·</span>
                <span>Direct Engineering Review</span>
              </div>
            </div>

            {/* Right 6 Columns: Full-Height Studio Image with Measured Contrast Scrim */}
            <div className="lg:col-span-6 flex">
              <ArchitecturalMedia
                src={heroStudioImg}
                alt="MIHORA engineering design studio with structural blueprints and daylight architecture"
                fallbackTitle="MIHORA Engineering Registry"
                className="w-full rounded-[var(--radius-lg)] border border-[var(--border-hairline)] min-h-[340px] lg:min-h-[450px]"
                imgClassName="w-full h-full object-cover object-center transition-transform duration-300"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0B1324]/85 via-[#0B1324]/25 to-transparent flex flex-col justify-end p-6 sm:p-8"
                  style={{ transform: `translate3d(0, ${-subtleParallax * 0.25}px, 0)` }}
                >
                  <div className="text-xs font-mono text-slate-300 mb-1.5">
                    7-Module Structured Intake · Auto-Scored Completeness
                  </div>
                  <p className="font-display text-lg sm:text-xl font-semibold text-white max-w-md leading-snug">
                    One permanent record connecting field engineers and software specialists directly to MIHORA deployment teams.
                  </p>
                </div>
              </ArchitecturalMedia>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mechanism & Operational Architecture (Asymmetric Photo + Editorial Ledger) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-mono text-[var(--ink-muted)] mb-2">
                Operational Architecture
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] text-balance mb-6">
                Structured for engineering staffing, not generic job forms.
              </h2>

              <ArchitecturalMedia
                src={fieldSiteImg}
                alt="Civil and structural engineers reviewing project schematics on site"
                fallbackTitle="Field Supervision & Deployment"
                className="rounded-[var(--radius-lg)] border border-[var(--border-hairline)] aspect-[4/3]"
              />
              <p className="mt-3 text-xs text-[var(--ink-muted)] leading-relaxed">
                On-site readiness, commute tolerances, and accommodation criteria captured upfront for practical project assignment.
              </p>
            </div>

            <div className="lg:col-span-7 divide-y divide-[var(--border-hairline)] border-t border-b border-[var(--border-hairline)]">
              <div className="py-7">
                <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                  01.
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--ink-primary)] mt-1">
                  Persistent Technical Identity
                </h3>
                <p className="text-sm text-[var(--ink-secondary)] mt-2 leading-relaxed max-w-2xl">
                  Rather than filling out throwaway applications, maintain one verified PostgreSQL dossier with structured employment history, academic degrees, and calibrated skill proficiencies.
                </p>
              </div>

              <div className="py-7">
                <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                  02.
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--ink-primary)] mt-1">
                  Commute &amp; Deployment Calibration
                </h3>
                <p className="text-sm text-[var(--ink-secondary)] mt-2 leading-relaxed max-w-2xl">
                  Define your maximum commute distance in kilometers, travel time threshold, transport arrangement, and relocation or housing conditions so leads match you only to viable sites.
                </p>
              </div>

              <div className="py-7">
                <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                  03.
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--ink-primary)] mt-1">
                  Real-Time Administrative Review &amp; PDF Export
                </h3>
                <p className="text-sm text-[var(--ink-secondary)] mt-2 leading-relaxed max-w-2xl">
                  Every update receives a unique reference code and syncs immediately to MIHORA engineering directors, with instant A4 PDF dossier generation available for your own records.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. Interactive Dossier Schema Explorer + Disciplines */}
      <section className="border-t border-[var(--border-hairline)] bg-[var(--surface-elevated)] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-mono text-[var(--ink-muted)] mb-2">
                    Dossier Schema Blueprint
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] text-balance mb-6">
                    Seven structured modules from intake to deployment readiness.
                  </h2>
                </div>

                <div className="border border-[var(--border-hairline)] rounded-[var(--radius-lg)] divide-y divide-[var(--border-hairline)] overflow-hidden">
                  {DOSSIER_INDEX.map((item, idx) => {
                    const active = selectedModule === idx;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setSelectedModule(idx)}
                        className={`w-full text-left px-5 py-3.5 flex items-baseline justify-between gap-4 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[var(--accent-primary-soft)]'
                            : 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-3">
                            <span
                              className={`font-mono text-xs font-semibold shrink-0 ${
                                active ? 'text-[var(--accent-primary)]' : 'text-[var(--ink-muted)]'
                              }`}
                            >
                              {item.code}.
                            </span>
                            <span className="text-sm font-semibold text-[var(--ink-primary)]">
                              {item.label}
                            </span>
                          </div>
                          {active && (
                            <p className="text-xs text-[var(--ink-secondary)] mt-1 pl-7">
                              {item.detail}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-[var(--ink-muted)] shrink-0">
                          {active ? 'Selected' : 'Inspect'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                <ArchitecturalMedia
                  src={systemsDeskImg}
                  alt="Dual-monitor structural CAD and systems engineering workstation"
                  fallbackTitle="Systems & CAD Disciplines"
                  className="rounded-[var(--radius-lg)] border border-[var(--border-hairline)] aspect-[4/3]"
                />

                <div className="border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 bg-[var(--surface-canvas)]">
                  <h3 className="font-display text-base font-bold text-[var(--ink-primary)] mb-1">
                    Ready to create your record?
                  </h3>
                  <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-4">
                    Registration takes under one minute and saves your progress automatically at every section.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-md)] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start Candidate Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Active Disciplines Ledger */}
          <Reveal delayMs={60}>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs font-mono text-[var(--ink-muted)] mb-1">
                    Engineering Tracks
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink-primary)]">
                    Target Disciplines Across MIHORA Projects
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[var(--border-hairline)] rounded-[var(--radius-lg)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)] overflow-hidden">
                {DISCIPLINES.map((disc) => {
                  const Icon = disc.icon;
                  return (
                    <div key={disc.index} className="p-6 flex flex-col justify-between gap-4 bg-[var(--surface-elevated)]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[var(--ink-muted)]">
                          {disc.index}.
                        </span>
                        <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-[var(--ink-primary)]">
                          {disc.title}
                        </h3>
                        <p className="text-xs text-[var(--ink-muted)] mt-1.5 leading-relaxed">
                          {disc.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--surface-canvas)] py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-muted)]">
          <div className="flex items-center gap-2.5">
            <MihoraLogo size="sm" variant="mark" />
            <span className="font-semibold text-[var(--ink-primary)]">MIHORA Tech</span>
            <span aria-hidden="true">·</span>
            <span>Candidate Profile Portal</span>
          </div>

          <div className="font-mono">
            © {new Date().getFullYear()} MIHORA Tech · career.forms.mihora.tech
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onNavigate('admin_login')}
              className="hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
            >
              Admin Access
            </button>
            <a
              href="https://mihora.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent-primary)] inline-flex items-center gap-1 transition-colors"
            >
              <span>mihora.tech</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
