import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md enterprise-card p-8 sm:p-10">
        <div className="pb-6 border-b border-[#E4E2DA]">
          <MihoraLogo size="md" variant="full" theme="light" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#143A7B] mt-6">
            Authorized Personnel
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
            {isSettingUp ? 'Initialize Primary Administrator' : 'Administrator Console Sign In'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {isSettingUp
              ? 'No administrator accounts exist yet. Establish the primary super-admin credentials below.'
              : 'Authorized MIHORA personnel only. All dossier views and exports are audit logged.'}
          </p>
        </div>

        <div className="pt-6">
          {setupSuccess && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#ECFDF5] border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{setupSuccess}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-[#FEF2F2] border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSettingUp ? (
            <form className="space-y-4" onSubmit={handleSetup}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admin Master Password <span className="text-slate-400 font-normal">(min 10 chars)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Setup Secret Key
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                className="w-full mt-2 py-3 px-4 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Configuring Administrator...' : 'Initialize Primary Administrator'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {hasAdmin && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingUp(false)}
                    className="text-xs font-semibold text-[#143A7B] hover:text-[#0E2B5C] cursor-pointer"
                  >
                    Back to Administrator Sign In
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 text-sm font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Verifying Access...' : 'Sign In to Admin Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#E4E2DA]">
            <button
              type="button"
              onClick={() => onNavigate('signin')}
              className="text-xs font-semibold text-slate-500 hover:text-[#143A7B] transition-colors cursor-pointer"
            >
              ← Return to Candidate Portal Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
