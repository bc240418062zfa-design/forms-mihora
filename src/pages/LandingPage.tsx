import React from 'react';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { Reveal } from '../components/ui/MotionPrimitives';
import { useScrollProgress } from '../utils/useScrollProgress';
import { ArrowRight, ArrowUpRight, Cpu, Building, Layers, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const DOSSIER_INDEX = [
  { code: '01', label: 'Identity & Residential Locality', detail: 'Verified contact & region' },
  { code: '02', label: 'Engineering Role & Seniority', detail: 'Primary & multi-role tracks' },
  { code: '03', label: 'Career Experience Ledger', detail: 'Structured project history' },
  { code: '04', label: 'Academic Qualifications', detail: 'Degrees, GPAs & institutions' },
  { code: '05', label: 'Technical Skill Matrix', detail: 'Proficiency & tenure years' },
  { code: '06', label: 'Commute & Site Deployment', detail: 'Distance, time & housing' },
  { code: '07', label: 'Remuneration & Availability', detail: 'Notice period & shift modes' },
];

const DISCIPLINES = [
  {
    code: 'DISC-01',
    title: 'Software & Cloud',
    summary: 'Full-stack systems, backend APIs, DevOps, and cloud infrastructure.',
    icon: Cpu,
  },
  {
    code: 'DISC-02',
    title: 'Civil & Structural',
    summary: 'Site supervision, structural analysis, CAD/BIM, and field execution.',
    icon: Building,
  },
  {
    code: 'DISC-03',
    title: 'Electrical & Power',
    summary: 'Power distribution, instrumentation, industrial automation, and grid systems.',
    icon: Layers,
  },
  {
    code: 'DISC-04',
    title: 'QA/QC & Supervision',
    summary: 'Quality inspection, compliance verification, testing, and project controls.',
    icon: ShieldCheck,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { scrollY } = useScrollProgress();
  const subtleShift = Math.min(18, scrollY * 0.04);

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] flex flex-col justify-between">
      {/* Hero Section — Asymmetric 12-col Architectural Layout */}
      <section className="border-b border-[var(--border-hairline)] bg-instrument-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
            {/* Left 7 Columns: Editorial Thesis & Primary Actions */}
            <div className="lg:col-span-7">
              <div className="text-[11px] font-mono font-medium uppercase tracking-[0.14em] text-[var(--accent-primary)] mb-5">
                MIHORA TECH · OFFICIAL CANDIDATE REGISTRY · CAREER.FORMS.MIHORA.TECH
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-bold text-[var(--ink-primary)] leading-[1.08] tracking-[-0.03em] text-balance max-w-2xl">
                Build Your Persistent Technical Dossier for MIHORA Tech.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[var(--ink-secondary)] leading-relaxed max-w-xl">
                A structured candidate registry for engineers, field specialists, and technical leads. Record your competencies once, calibrate deployment and commute tolerances, and keep your availability current.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-md)] transition-colors inline-flex items-center justify-center gap-2 group cursor-pointer whitespace-nowrap"
                >
                  <span>Create Candidate Account</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('signin')}
                  className="px-6 py-3.5 text-sm font-semibold text-[var(--ink-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] border border-[var(--border-strong)] rounded-[var(--radius-md)] transition-colors inline-flex items-center justify-center cursor-pointer whitespace-nowrap"
                >
                  Sign In to Existing Profile
                </button>
              </div>

              <div className="mt-9 pt-6 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-[var(--ink-muted)]">
                <span>PostgreSQL Relational Persistence</span>
                <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
                <span>Encrypted Session Auth</span>
                <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
                <span>PDF Dossier Export Ready</span>
              </div>
            </div>

            {/* Right 5 Columns: Architectural Dossier Schema Specification */}
            <div
              className="lg:col-span-5"
              style={{ transform: `translate3d(0, ${subtleShift}px, 0)` }}
            >
              <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-5 py-4 bg-[var(--surface-ink)] text-white flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-slate-300">
                      RECORD ARCHITECTURE
                    </div>
                    <div className="font-display text-sm font-semibold mt-0.5">
                      MIHORA Candidate Dossier Schema
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-300 tabular-nums">
                    7 MODULES
                  </span>
                </div>

                <div className="divide-y divide-[var(--border-hairline)]">
                  {DOSSIER_INDEX.map((item) => (
                    <div
                      key={item.code}
                      className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[var(--surface-subtle)]/60 transition-colors"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="font-mono text-[11px] font-semibold text-[var(--accent-primary)] shrink-0">
                          {item.code}
                        </span>
                        <span className="text-xs font-semibold text-[var(--ink-primary)] truncate">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--ink-muted)] shrink-0 hidden sm:inline">
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3.5 bg-[var(--surface-subtle)] border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                  <span className="text-[var(--ink-muted)] font-mono">
                    Auto-scored completeness engine
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>Begin Entry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Value Ledger (Replaces Symmetrical 3-Card Triad) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-b border-[var(--border-hairline)] pb-16">
            <div className="lg:col-span-4">
              <div className="text-[11px] font-mono font-medium uppercase tracking-[0.14em] text-[var(--ink-muted)] mb-2">
                OPERATIONAL DESIGN
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink-primary)] text-balance">
                Structured for engineering review, not generic applications.
              </h2>
              <p className="mt-3 text-sm text-[var(--ink-secondary)] leading-relaxed">
                Every field maps directly to project staffing criteria used by MIHORA technical leads and regional coordinators.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-[var(--border-hairline)] border-t lg:border-t-0 border-[var(--border-hairline)]">
              <div className="py-5 first:pt-0 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                <span className="font-mono text-xs font-semibold text-[var(--accent-primary)] shrink-0 w-16">
                  01 / DATA
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
                    Persistent Technical Identity
                  </h3>
                  <p className="text-sm text-[var(--ink-secondary)] mt-1 leading-relaxed">
                    Maintain an updatable career dossier covering experience history, academic credentials, and structured proficiency ratings over time.
                  </p>
                </div>
              </div>

              <div className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                <span className="font-mono text-xs font-semibold text-[var(--accent-primary)] shrink-0 w-16">
                  02 / SITE
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
                    Commute &amp; Deployment Calibration
                  </h3>
                  <p className="text-sm text-[var(--ink-secondary)] mt-1 leading-relaxed">
                    Specify exact on-site willingness, commute distance in kilometers, travel time thresholds, transportation mode, and accommodation rules.
                  </p>
                </div>
              </div>

              <div className="py-5 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                <span className="font-mono text-xs font-semibold text-[var(--accent-primary)] shrink-0 w-16">
                  03 / SYNC
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
                    Real-Time Administrative Visibility
                  </h3>
                  <p className="text-sm text-[var(--ink-secondary)] mt-1 leading-relaxed">
                    Profile updates stream immediately to authorized MIHORA project directors with automated reference codes and downloadable PDF dossiers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Engineering Disciplines Matrix */}
        <Reveal delayMs={80}>
          <div className="pt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-[11px] font-mono font-medium uppercase tracking-[0.14em] text-[var(--ink-muted)] mb-1.5">
                  ACTIVE TRACKS
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink-primary)]">
                  Target Disciplines &amp; Engineering Specialties
                </h2>
              </div>
              <p className="text-xs text-[var(--ink-muted)] max-w-sm">
                Profiles are indexed across internal infrastructure delivery and client deployment programs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[var(--border-hairline)] rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)] overflow-hidden">
              {DISCIPLINES.map((disc) => {
                const Icon = disc.icon;
                return (
                  <div
                    key={disc.code}
                    className="p-6 hover:bg-[var(--surface-subtle)]/55 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-medium text-[var(--ink-muted)]">
                        {disc.code}
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
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--surface-elevated)] py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[var(--ink-muted)]">
            <MihoraLogo size="sm" variant="mark" />
            <span className="font-semibold text-[var(--ink-primary)]">MIHORA Tech</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Candidate Profile Portal</span>
          </div>

          <div className="text-xs font-mono text-[var(--ink-muted)]">
            © {new Date().getFullYear()} MIHORA Tech · career.forms.mihora.tech
          </div>

          <div className="flex items-center gap-5 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('admin_login')}
              className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
            >
              Admin Access
            </button>
            <a
              href="https://mihora.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ink-muted)] hover:text-[var(--accent-primary)] inline-flex items-center gap-1 transition-colors"
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
