import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import {
  RegistrationCrosses,
  SingleRedMark,
  TitleBlock,
} from '../components/cyanotype/BlueprintApparatus';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Please provide your email address and desired password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the data processing terms to create your account.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        email: email.trim(),
        password,
        confirmPassword,
        acceptTerms,
      });
      onNavigate('profile');
    } catch (err: any) {
      setError(err.message || 'Account registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cyanotype-table py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full cyanotype-sheet p-6 sm:p-10 lg:p-12">
        <RegistrationCrosses />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Cyanotype New Dossier Schematic */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between border border-[var(--rule-hairline)] bg-[var(--edge)]/80 p-7">
            <div>
              <p className="text-[11px] font-mono text-[var(--chalk)] tracking-wider">
                SHEET MHR-NEW · DOSSIER INITIALIZATION
              </p>
              <h2 className="font-display text-2xl font-bold text-[var(--exposure)] leading-tight mt-3">
                Create one structured profile across all engineering tracks.
              </h2>
              <p className="mt-3 text-xs font-mono text-[var(--chalk)] leading-relaxed">
                Upon registration you receive a permanent MIHORA reference code (`MIH-CND-…`) and guided 7-module builder with PostgreSQL persistence.
              </p>
            </div>

            {/* Inline Vector Dossier Calibration Blueprint (Zero AI Photos) */}
            <div className="my-6 border border-[rgba(185,204,224,0.22)] bg-[var(--table)]/60 p-4">
              <svg
                role="img"
                aria-label="New candidate dossier initialization blueprint showing 7 modular tables"
                viewBox="0 0 280 156"
                className="w-full h-auto block"
              >
                {[
                  { y: 16, code: '01', name: 'IDENTITY & REGION' },
                  { y: 42, code: '02–05', name: 'ROLE · EXP · EDU · SKILLS' },
                  { y: 68, code: '06', name: 'COMMUTE & SITE CALIBRATION' },
                  { y: 94, code: '07', name: 'COMPENSATION & NOTICE' },
                  { y: 120, code: 'PDF', name: 'EXPORTABLE A4 DOSSIER' },
                ].map((row, idx) => (
                  <g key={row.code}>
                    <rect
                      x="18"
                      y={row.y}
                      width="244"
                      height="20"
                      fill={idx === 4 ? '#F4F7F5' : '#1B3A5C'}
                      stroke="#F4F7F5"
                      strokeOpacity={idx === 4 ? 1 : 0.55}
                      strokeWidth="1"
                    />
                    <text
                      x="26"
                      y={row.y + 13}
                      fill={idx === 4 ? '#0F2740' : '#B9CCE0'}
                      fontSize="8.5"
                      fontFamily="IBM Plex Mono, monospace"
                      fontWeight="600"
                    >
                      {row.code}
                    </text>
                    <text
                      x="68"
                      y={row.y + 13}
                      fill={idx === 4 ? '#0F2740' : '#F4F7F5'}
                      fontSize="8.5"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {row.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="pt-4 border-t border-[var(--rule-hairline)] flex items-center justify-between text-[11px] font-mono text-[var(--chalk)]">
              <span>Step Auto-Save · Zero Tracking</span>
              <SingleRedMark variant="tick" className="w-5 h-4" />
            </div>
          </div>

          {/* Right Registration Form */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="mb-7">
                <div className="lg:hidden mb-4">
                  <MihoraLogo size="md" variant="full" theme="dark" />
                </div>
                <p className="text-[11px] font-mono text-[var(--chalk)] tracking-wider mb-1">
                  NEW CANDIDATE REGISTRATION
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--exposure)]">
                  Create Candidate Account
                </h1>
                <p className="mt-1.5 text-xs font-mono text-[var(--chalk)]">
                  Register with MIHORA Tech to initialize your persistent engineering dossier.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-[var(--radius-xs)] bg-[var(--status-notice-bg)] border border-[var(--status-notice-border)] text-[var(--exposure)] text-xs font-mono flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[var(--status-warn)] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider mb-1.5"
                  >
                    WORK OR PERSONAL EMAIL <span className="text-[var(--chalk-dim)]">[REQ]</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--chalk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="your.email@domain.com"
                      className="field-input field-input-icon"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider mb-1.5"
                  >
                    CREATE SECURE PASSWORD <span className="text-[var(--chalk-dim)]">[REQ]</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--chalk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Minimum 8 characters"
                      className="field-input field-input-icon pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--chalk)] hover:text-[var(--exposure)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-confirm"
                    className="block text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider mb-1.5"
                  >
                    CONFIRM PASSWORD <span className="text-[var(--chalk-dim)]">[REQ]</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--chalk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Repeat password"
                      className="field-input field-input-icon"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs font-mono text-[var(--chalk)] cursor-pointer leading-relaxed">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked);
                        if (error) setError(null);
                      }}
                      className="mt-0.5 rounded-[var(--radius-xs)] border-[var(--rule-strong)] bg-[var(--prussian-raise)] text-[var(--exposure)]"
                    />
                    <span>
                      I consent to MIHORA Tech securely processing and storing my professional qualifications for recruitment evaluation.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-5 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Creating Account & Dossier...' : 'Create Candidate Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[var(--rule-hairline)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[var(--chalk)]">
                <span>Already registered?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('signin')}
                  className="pencil-link font-semibold text-[var(--exposure)] cursor-pointer"
                >
                  Sign In Instead
                </button>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--rule-hairline)] flex justify-end">
              <TitleBlock drawingNo="MHR-NEW" scale="1:1" drawnBy="INTAKE" checkedBy="PG16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
