import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MihoraLogo } from '../components/brand/MihoraLogo';
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
    <div className="min-h-[calc(100vh-4rem)] bg-instrument-grid flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-7">
          <div className="inline-block mb-4">
            <MihoraLogo size="lg" variant="full" />
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--accent-primary)] mb-1.5">
            CANDIDATE ACCESS
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            Sign In to Your Profile
          </h1>
          <p className="mt-1.5 text-xs text-[var(--ink-muted)] leading-relaxed">
            Access your engineering dossier, update deployment availability, or export your PDF record.
          </p>
        </div>

        <div className="bg-[var(--surface-elevated)] py-8 px-6 sm:px-9 border border-[var(--border-hairline)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
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
                htmlFor="signin-email"
                className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Profile'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
            <span>New to MIHORA Careers?</span>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] cursor-pointer"
            >
              Create Candidate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
