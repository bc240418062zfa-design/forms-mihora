import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial admin setup state
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
      setHasAdmin(true); // default to login form on failure
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminLogin({ email, password });
      onNavigate('admin');
    } catch (err: any) {
      setError(err.message || 'Administrative authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupEmail || !setupPassword) {
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
        email: setupEmail,
        password: setupPassword,
        confirmPassword: setupConfirm,
        setupKey: setupKey || undefined,
      });

      setSetupSuccess(res.message);
      setIsSettingUp(false);
      setHasAdmin(true);
      setEmail(setupEmail);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize administrator account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-3">
          <MihoraLogo size="lg" variant="full" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-mono uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          Restricted Portal
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {isSettingUp ? 'Initialize Primary Administrator' : 'Administrator Console Sign In'}
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          {isSettingUp
            ? 'No administrator accounts exist in the database. Establish the primary super-admin credentials below.'
            : 'Authorized access only. Candidate data access is logged and audited.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {setupSuccess && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{setupSuccess}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSettingUp ? (
            /* First-time Admin Initialization */
            <form className="space-y-4" onSubmit={handleSetup}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Admin Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="admin@mihora.tech"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admin Master Password * (Min 10 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Admin Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {hasAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Setup Secret Key (Required if admin exists)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      value={setupKey}
                      onChange={(e) => setSetupKey(e.target.value)}
                      placeholder="ADMIN_SETUP_SECRET"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Configuring Administrator...' : 'Bootstrap Primary Administrator'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>

              {hasAdmin && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingUp(false)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Back to Administrator Sign In
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* Regular Admin Sign In */
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mihora.tech"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Admin Access...' : 'Sign In to Admin Console'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('signin')}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Candidate Portal Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
