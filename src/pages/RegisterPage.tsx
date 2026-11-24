import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { ArchitecturalFrame } from '../components/ui/ArchitecturalFrame';
import engineeringCampusImg from '../assets/images/model_engineering_campus_1795489145677.jpg';
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
          {/* Left Campus Architectural Showcase */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between border border-[var(--rule-hairline)] bg-[var(--edge)]/85 overflow-hidden">
            <div className="p-7 pb-5">
              <p className="text-[11px] font-mono text-[var(--chalk)] tracking-wider">
                MIHORA CAREERS · NEW CANDIDATE
              </p>
              <h2 className="font-display text-2xl font-bold text-[var(--exposure)] leading-tight mt-3">
                Create one comprehensive profile across all engineering disciplines.
              </h2>
              <p className="mt-3 text-xs font-mono text-[var(--chalk)] leading-relaxed">
                Receive an official MIHORA candidate reference ID (`MIH-CND-…`) to present your academic qualifications, engineering leadership, and site preferences.
              </p>
            </div>

            <div className="px-7 space-y-4">
              <ArchitecturalFrame
                src={engineeringCampusImg}
                alt="MIHORA architectural scale model of modern engineering and academic campus pavilion"
                className="h-52"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B2E]/88 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[10px] font-mono text-[var(--exposure)]">
                  <span>04 ENGINEERING TRACKS</span>
                  <span className="text-[var(--status-verified)] font-semibold">OPEN INTAKE</span>
                </div>
              </ArchitecturalFrame>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[var(--chalk)]">
                <div className="border border-[var(--rule-hairline)] px-2.5 py-2 bg-[var(--table)]/60">
                  <span className="text-[var(--exposure)] font-semibold block">01 · ACADEMICS</span>
                  Degrees &amp; Honors
                </div>
                <div className="border border-[var(--rule-hairline)] px-2.5 py-2 bg-[var(--table)]/60">
                  <span className="text-[var(--exposure)] font-semibold block">02 · LEADERSHIP</span>
                  Engineering Roles
                </div>
                <div className="border border-[var(--rule-hairline)] px-2.5 py-2 bg-[var(--table)]/60">
                  <span className="text-[var(--exposure)] font-semibold block">03 · MOBILITY</span>
                  Site Calibration
                </div>
                <div className="border border-[var(--rule-hairline)] px-2.5 py-2 bg-[var(--table)]/60">
                  <span className="text-[var(--exposure)] font-semibold block">04 · PORTFOLIO</span>
                  Instant A4 PDF
                </div>
              </div>
            </div>

            <div className="px-7 py-4 mt-5 border-t border-[var(--rule-hairline)] flex items-center justify-between text-[11px] font-mono text-[var(--chalk)]">
              <span>Guided Onboarding · Confidential Record</span>
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
              <TitleBlock drawingNo="REGISTRATION" scale="OPEN" date="2026" drawnBy="TALENT" checkedBy="DIRECT" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
