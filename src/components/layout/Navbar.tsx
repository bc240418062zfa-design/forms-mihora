import React from 'react';
import { MihoraLogo } from '../brand/MihoraLogo';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, Briefcase, FileText } from 'lucide-react';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleNav = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark & Monogram */}
        <div
          onClick={() => handleNav('landing')}
          className="cursor-pointer transition-opacity hover:opacity-90 flex items-center"
        >
          <MihoraLogo size="md" variant="full" />
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNav('landing')}
            className={`transition-colors hover:text-blue-600 ${
              currentView === 'landing' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Careers Overview
          </button>
          
          {isAuthenticated && !isAdmin && (
            <>
              <button
                onClick={() => handleNav('dashboard')}
                className={`transition-colors hover:text-blue-600 ${
                  currentView === 'dashboard' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Candidate Dashboard
              </button>
              <button
                onClick={() => handleNav('profile')}
                className={`transition-colors hover:text-blue-600 ${
                  currentView === 'profile' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Edit Profile
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`transition-colors hover:text-blue-600 ${
                currentView === 'admin' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Admin Portal
            </button>
          )}

          <a
            href="https://mihora.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue-600"
          >
            About MIHORA
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                {isAdmin ? (
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-400" />
                )}
                {user?.email}
              </span>

              {isAdmin ? (
                <button
                  onClick={() => handleNav('admin')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Console
                </button>
              ) : (
                <button
                  onClick={() => handleNav('dashboard')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Dashboard
                </button>
              )}

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleNav('admin_login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1.5"
              >
                Admin Sign In
              </button>
              <button
                onClick={() => handleNav('signin')}
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5"
              >
                Candidate Sign In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Create Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
