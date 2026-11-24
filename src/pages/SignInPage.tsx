import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { ArchitecturalFrame } from '../components/ui/ArchitecturalFrame';
import credentialsDaylightImg from '../assets/images/studio_credentials_daylight_1795500977043.jpg';
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full enterprise-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Studio Visual Column */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between bg-[#EFECE6]">
          <ArchitecturalFrame
            src={credentialsDaylightImg}
            alt="Sunlit engineering drafting instruments, optical prism, and executive linen folio"
            className="h-full border-0 rounded-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/15" />
            <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                MIHORA Careers
              </span>

              <div className="space-y-3">
                <h2 className="font-display text-2xl font-bold leading-snug text-white">
                  Keep your academic and engineering record ready.
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Update credentials, review site deployment calibration, and download your formatted executive A4 dossier anytime.
                </p>
              </div>
            </div>
          </ArchitecturalFrame>
        </div>

        {/* Right Clean Sign-In Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="lg:hidden mb-6">
              <MihoraLogo size="md" variant="full" theme="light" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#143A7B] mb-2">
              Candidate Portal
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Sign In to Your Profile
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Access your engineering portfolio, update deployment availability, or export PDF records.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 p-3.5 rounded-lg bg-[#FEF2F2] border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    placeholder="you@domain.com"
                    className="field-input field-input-icon"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign In to Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-[#E4E2DA] flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-600">
              <span>New to MIHORA Careers?</span>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-semibold text-[#143A7B] hover:text-[#0E2B5C] cursor-pointer"
              >
                Create Candidate Account
              </button>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-[#E4E2DA] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('admin_login')}
              className="text-xs font-semibold text-slate-500 hover:text-[#143A7B] transition-colors cursor-pointer"
            >
              MIHORA Administrator? Open Admin Console →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
