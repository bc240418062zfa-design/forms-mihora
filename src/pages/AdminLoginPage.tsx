import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { Lock, Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [setupSuccess, setSetupSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAdminExistence();
  }, []);

  const checkAdminExistence = async () => {
    try {
      const res = await api.checkAdminStatus();
      setHasAdmin(res.hasAdmin);
      if (!res.hasAdmin) {
        setIsSettingUp(true);
      }
    } catch {
      setHasAdmin(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminLogin({ email: email.trim(), password });
      onNavigate('admin');
    } catch (err: any) {
      setError(err.message || 'Administrative authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupEmail.trim() || !setupPassword) {
      setError('Please provide email and password for the primary administrator.');
      return;
    }

    if (setupPassword.length < 10) {
      setError('Admin password must be at least 10 characters in length.');
      return;
    }

    if (setupPassword !== setupConfirm) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.setupInitialAdmin({
        email: setupEmail.trim(),
        password: setupPassword,
        confirmPassword: setupConfirm,
        setupKey: setupKey || undefined,
      });

      setSetupSuccess(res.message);
      setIsSettingUp(false);
      setHasAdmin(true);
      setEmail(setupEmail.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to initialize administrator account.');
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
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--ink-primary)] mb-1.5">
            RESTRICTED ACCESS · ADMINISTRATIVE CONSOLE
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            {isSettingUp ? 'Initialize Primary Administrator' : 'Administrator Console Sign In'}
          </h1>
          <p className="mt-1.5 text-xs text-[var(--ink-muted)] leading-relaxed">
            {isSettingUp
              ? 'No administrator accounts exist yet. Establish the primary super-admin credentials below.'
              : 'Authorized MIHORA personnel only. All dossier views and exports are audit logged.'}
          </p>
        </div>

        <div className="bg-[var(--surface-elevated)] py-8 px-6 sm:px-9 border border-[var(--border-hairline)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
          {setupSuccess && (
            <div className="mb-5 p-3 rounded-[var(--radius-sm)] bg-[var(--status-success-soft)] border border-teal-200 text-[var(--status-success)] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{setupSuccess}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-[var(--radius-sm)] bg-[var(--status-danger-soft)] border border-rose-200 text-[var(--status-danger)] text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSettingUp ? (
            <form className="space-y-4" onSubmit={handleSetup}>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5">
                  Primary Admin Email <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => {
                      setSetupEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="admin@mihora.tech"
                    className="field-input field-input-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5">
                  Admin Master Password <span className="text-[var(--ink-muted)] font-normal">(min 10 chars)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={setupPassword}
                    onChange={(e) => {
                      setSetupPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Minimum 10 characters"
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
                <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5">
                  Confirm Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={setupConfirm}
                    onChange={(e) => {
                      setSetupConfirm(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Repeat password"
                    className="field-input field-input-icon"
                  />
                </div>
              </div>

              {hasAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5">
                    Setup Secret Key
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={setupKey}
                      onChange={(e) => setSetupKey(e.target.value)}
                      placeholder="ADMIN_SETUP_SECRET"
                      className="field-input field-input-icon"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-[var(--surface-ink)] hover:bg-slate-800 rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Configuring Administrator...' : 'Bootstrap Primary Administrator'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {hasAdmin && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingUp(false)}
                    className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-semibold cursor-pointer"
                  >
                    Back to Administrator Sign In
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5"
                >
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="admin@mihora.tech"
                    className="field-input field-input-icon"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter administrator password"
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
                className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-[var(--surface-ink)] hover:bg-slate-800 rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Verifying Access...' : 'Sign In to Admin Console'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[var(--border-hairline)] text-center">
            <button
              type="button"
              onClick={() => onNavigate('signin')}
              className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
            >
              Return to Candidate Portal Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
