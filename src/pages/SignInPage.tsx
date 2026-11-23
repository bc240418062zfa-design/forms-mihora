import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
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
          {/* Left Cyanotype Vault Keyway Schematic */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between border border-[var(--rule-hairline)] bg-[var(--edge)]/80 p-7">
            <div>
              <p className="text-[11px] font-mono text-[var(--chalk)] tracking-wider">
                SHEET MHR-AUTH · CANDIDATE ACCESS
              </p>
              <h2 className="font-display text-2xl font-bold text-[var(--exposure)] leading-tight mt-3">
                Keep your technical dossier accurate and deployment-ready.
              </h2>
              <p className="mt-3 text-xs font-mono text-[var(--chalk)] leading-relaxed">
                Update project experience, calibrate site commute thresholds, and export your structured A4 PDF record anytime.
              </p>
            </div>

            {/* Inline Vector Blueprint Keyway Diagram (Zero AI Photos) */}
            <div className="my-6 border border-[rgba(185,204,224,0.22)] bg-[var(--table)]/60 p-4">
              <svg
                role="img"
                aria-label="Cyanotype candidate credential verification schematic"
                viewBox="0 0 280 150"
                className="w-full h-auto block"
              >
                <rect
                  x="12"
                  y="12"
                  width="256"
                  height="126"
                  fill="none"
                  stroke="#B9CCE0"
                  strokeOpacity="0.3"
                  strokeDasharray="3 4"
                />
                <circle
                  cx="92"
                  cy="75"
                  r="38"
                  fill="none"
                  stroke="#F4F7F5"
                  strokeWidth="1.4"
                />
                <circle
                  cx="92"
                  cy="75"
                  r="24"
                  fill="none"
                  stroke="#B9CCE0"
                  strokeOpacity="0.6"
                  strokeDasharray="4 3"
                />
                <circle cx="92" cy="75" r="7" fill="#F4F7F5" />
                <line x1="130" y1="75" x2="236" y2="75" stroke="#F4F7F5" strokeWidth="1.4" />
                <rect
                  x="176"
                  y="54"
                  width="68"
                  height="42"
                  fill="#1B3A5C"
                  stroke="#F4F7F5"
                  strokeWidth="1.2"
                />
                <text
                  x="210"
                  y="73"
                  textAnchor="middle"
                  fill="#B9CCE0"
                  fontSize="8.5"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  JWT VAULT
                </text>
                <text
                  x="210"
                  y="86"
                  textAnchor="middle"
                  fill="#F4F7F5"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  PG-PERSIST
                </text>
              </svg>
            </div>

            <div className="pt-4 border-t border-[var(--rule-hairline)] flex items-center justify-between text-[11px] font-mono text-[var(--chalk)]">
              <span>Encrypted Session</span>
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
                    CANDIDATE VAULT · SECTION 00
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--exposure)]">
                    Sign In to Your Dossier
                  </h1>
                  <p className="mt-1.5 text-xs font-mono text-[var(--chalk)]">
                    Access your engineering profile, update deployment availability, or download PDF records.
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
              <TitleBlock drawingNo="MHR-AUTH" scale="1:1" drawnBy="AUTH" checkedBy="TLS" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
