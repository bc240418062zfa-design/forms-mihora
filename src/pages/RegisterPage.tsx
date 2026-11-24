import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { ArchitecturalFrame } from '../components/ui/ArchitecturalFrame';
import campusDaylightImg from '../assets/images/studio_campus_daylight_1795500975982.jpg';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full enterprise-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Studio Campus Showcase */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-[#FAF9F6] border-r border-[#E4E2DA] p-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#143A7B]">
              New Candidate Account
            </span>
            <h2 className="font-display text-2xl font-bold text-slate-900 leading-snug">
              Build one authoritative profile across all engineering tracks.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receive an official MIHORA reference ID to present your academic degrees, project leadership, and site preferences.
            </p>
          </div>

          <ArchitecturalFrame
            src={campusDaylightImg}
            alt="MIHORA architectural scale model of modern engineering and academic campus pavilion"
            className="h-52 rounded-xl my-6"
          />

          <ul className="space-y-2.5 text-xs font-medium text-slate-700">
            {[
              'Verified academic qualifications & honors',
              'Structured employment & project leadership history',
              'Regional commute & site mobility calibration',
              'Instant executive A4 PDF portfolio export',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EEF3FA] text-[#143A7B] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 bg-white">
          <div className="lg:hidden mb-6">
            <MihoraLogo size="md" variant="full" theme="light" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#143A7B] mb-2">
            Registration
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Create Candidate Account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Register with MIHORA Tech to initialize your persistent engineering dossier.
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
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work or Personal Email <span className="text-slate-400 font-normal">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  placeholder="you@domain.com"
                  className="field-input field-input-icon"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Create Secure Password <span className="text-slate-400 font-normal">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password <span className="text-slate-400 font-normal">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            <label className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 cursor-pointer leading-relaxed pt-1">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (error) setError(null);
                }}
                className="mt-1 rounded border-slate-300 text-[#143A7B] focus:ring-[#143A7B]"
              />
              <span>
                I consent to MIHORA Tech securely processing and storing my professional qualifications for recruitment evaluation.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Candidate Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#E4E2DA] flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-600">
            <span>Already registered?</span>
            <button
              type="button"
              onClick={() => onNavigate('signin')}
              className="font-semibold text-[#143A7B] hover:text-[#0E2B5C] cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
