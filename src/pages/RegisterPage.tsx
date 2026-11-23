import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { ArchitecturalMedia } from '../components/ui/ArchitecturalMedia';
import systemsDeskImg from '../assets/images/precision_systems_workstation_1795454842890.jpg';
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
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Architectural Panel (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-[var(--surface-ink)]">
        <ArchitecturalMedia
          src={systemsDeskImg}
          alt="MIHORA technical workstation"
          className="w-full h-full"
          imgClassName="w-full h-full object-cover opacity-55"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1324] via-[#0B1324]/70 to-[#0B1324]/45 p-12 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono text-blue-300">
                MIHORA Tech · New Dossier Intake
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-white leading-tight text-balance">
                Create one structured profile across all engineering tracks.
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-md">
                Once registered, you receive a unique reference ID and step-by-step guidance to complete all 7 modules cleanly.
              </p>
              <div className="mt-6 pt-6 border-t border-white/15 flex items-center gap-3 text-xs font-mono text-slate-300">
                <span>Step Auto-Save</span>
                <span aria-hidden="true">·</span>
                <span>Zero Third-Party Tracking</span>
              </div>
            </div>
          </div>
        </ArchitecturalMedia>
      </div>

      {/* Right Registration Form */}
      <div className="lg:col-span-7 flex flex-col justify-center py-12 px-4 sm:px-8 lg:px-16 bg-[var(--surface-canvas)]">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-7">
            <div className="lg:hidden mb-4">
              <MihoraLogo size="md" variant="full" />
            </div>
            <p className="text-xs font-mono text-[var(--accent-primary)] font-medium mb-1">
              New Account Setup
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink-primary)]">
              Create Candidate Account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--ink-muted)]">
              Register with MIHORA Tech to initialize your persistent technical profile.
            </p>
          </div>

          <div className="bg-[var(--surface-elevated)] py-8 px-6 sm:px-8 border border-[var(--border-hairline)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
            {error && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-[var(--radius-sm)] bg-[var(--status-danger-soft)] border border-rose-200 text-[var(--status-danger)] text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5"
                >
                  Work or Personal Email <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5"
                >
                  Create Secure Password <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5"
                >
                  Confirm Password <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <label className="flex items-start gap-2.5 text-xs text-[var(--ink-secondary)] cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 rounded border-[var(--border-strong)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                  />
                  <span>
                    I consent to MIHORA Tech securely processing and storing my professional qualifications for recruitment evaluation.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Account & Dossier...' : 'Create Candidate Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => onNavigate('signin')}
                className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] cursor-pointer"
              >
                Sign In Instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
