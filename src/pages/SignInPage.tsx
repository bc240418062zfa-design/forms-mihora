import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { ArchitecturalFrame } from '../components/ui/ArchitecturalFrame';
import academicCredentialsImg from '../assets/images/model_academic_credentials_1795489147053.jpg';
import {
  RegistrationCrosses,
  SingleRedMark,
  TitleBlock,
} from '../components/cyanotype/BlueprintApparatus';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SignInPageProps {
  onNavigate: (view: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loggedUser = await login({ email: email.trim(), password });
      if (loggedUser && ['SUPER_ADMIN', 'ADMIN', 'VIEWER'].includes(loggedUser.role)) {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cyanotype-table py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full cyanotype-sheet p-6 sm:p-10 lg:p-12">
        <RegistrationCrosses />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Candidate Credentials Studio Showcase */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between border border-[var(--rule-hairline)] bg-[var(--edge)]/85 overflow-hidden">
            <div className="p-7 pb-5">
              <p className="text-[11px] font-mono text-[var(--chalk)] tracking-wider">
                MIHORA CAREERS · CANDIDATE ACCESS
              </p>
              <h2 className="font-display text-2xl font-bold text-[var(--exposure)] leading-tight mt-3">
                Keep your professional and academic profile up to date.
              </h2>
              <p className="mt-3 text-xs font-mono text-[var(--chalk)] leading-relaxed">
                Update academic credentials, project experience, and site commute availability, or download your formal A4 portfolio anytime.
              </p>
            </div>

            <ArchitecturalFrame
              src={academicCredentialsImg}
              alt="Precision brushed-steel engineering instruments, glass prism, and bound academic portfolio on deep Prussian surface"
              className="mx-7 h-56"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B2E]/85 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[10px] font-mono text-[var(--exposure)]">
                <span>MIHORA CAREERS</span>
                <span className="text-[var(--status-verified)] font-semibold">VERIFIED RECORD</span>
              </div>
            </ArchitecturalFrame>

            <div className="px-7 py-4 mt-5 border-t border-[var(--rule-hairline)] flex items-center justify-between text-[11px] font-mono text-[var(--chalk)]">
              <span>Confidential Candidate Access</span>
              <SingleRedMark variant="tick" className="w-5 h-4" />
            </div>
          </div>

          {/* Right Ruled Sign-In Form */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
                <div>
                  <div className="lg:hidden mb-4">
                    <MihoraLogo size="md" variant="full" theme="dark" />
                  </div>
                  <p className="text-[11px] font-mono text-[var(--chalk)] tracking-wider mb-1">
                    CANDIDATE PORTAL · SIGN IN
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--exposure)]">
                    Sign In to Your Profile
                  </h1>
                  <p className="mt-1.5 text-xs font-mono text-[var(--chalk)]">
                    Access your engineering dossier, update deployment availability, or download PDF records.
                  </p>
                </div>
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
                    htmlFor="signin-email"
                    className="block text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider mb-1.5"
                  >
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--chalk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="your.email@example.com"
                      className="field-input field-input-icon"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signin-password"
                    className="block text-[11px] font-mono font-semibold text-[var(--chalk)] tracking-wider mb-1.5"
                  >
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--chalk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your password"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-5 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dossier'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[var(--rule-hairline)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[var(--chalk)]">
                <span>New to MIHORA Careers?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="pencil-link font-semibold text-[var(--exposure)] cursor-pointer"
                >
                  Create Candidate Account
                </button>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--rule-hairline)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <button
                type="button"
                onClick={() => onNavigate('admin_login')}
                className="pencil-link text-xs font-mono text-[var(--chalk)] hover:text-[var(--exposure)] transition-colors cursor-pointer self-start"
              >
                MIHORA Administrator? Open Admin Console →
              </button>
              <TitleBlock drawingNo="MEMBER ACCESS" scale="ACTIVE" date="2026" drawnBy="TALENT" checkedBy="VERIFIED" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
