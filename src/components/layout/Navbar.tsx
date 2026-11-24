import React, { useState, useEffect } from 'react';
import { MihoraLogo } from '../brand/MihoraLogo';
import { useAuth } from '../../context/AuthContext';
import { useScrollProgress } from '../../utils/useScrollProgress';
import { ScrollProgressBar } from '../ui/MotionPrimitives';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { isScrolled } = useScrollProgress();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (view: string) => {
    setMobileOpen(false);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [currentView]);

  const navLinkClass = (active: boolean) =>
    `text-sm whitespace-nowrap shrink-0 transition-colors py-1.5 cursor-pointer nav-link-underline ${
      active
        ? 'text-[#143A7B] font-semibold'
        : 'text-slate-600 font-medium hover:text-slate-900'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 border-b border-[#E4E2DA] ${
        isScrolled
          ? 'bg-white/92 backdrop-blur-md shadow-[0_4px_20px_rgba(15,23,42,0.06)]'
          : 'bg-white'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8 relative">
        {/* Zone 1: Clean Brand Wordmark */}
        <div className="flex items-center min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('landing')}
            className="cursor-pointer transition-opacity hover:opacity-85 flex items-center shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 rounded-md"
            aria-label="MIHORA Tech Home"
          >
            <MihoraLogo size="sm" variant="full" theme="light" />
          </button>
        </div>

        {/* Zone 2: Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7"
        >
          <button
            type="button"
            onClick={() => handleNav('landing')}
            aria-current={currentView === 'landing' ? 'page' : undefined}
            className={navLinkClass(currentView === 'landing')}
          >
            Overview
          </button>

          {isAuthenticated && !isAdmin && (
            <>
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                aria-current={currentView === 'dashboard' ? 'page' : undefined}
                className={navLinkClass(currentView === 'dashboard')}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleNav('profile')}
                aria-current={currentView === 'profile' ? 'page' : undefined}
                className={navLinkClass(currentView === 'profile')}
              >
                Edit Profile
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNav('admin')}
              aria-current={currentView === 'admin' ? 'page' : undefined}
              className={navLinkClass(currentView === 'admin')}
            >
              Console
            </button>
          )}

          {!isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => handleNav('signin')}
                aria-current={currentView === 'signin' ? 'page' : undefined}
                className={navLinkClass(currentView === 'signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleNav('admin_login')}
                aria-current={currentView === 'admin_login' ? 'page' : undefined}
                className={navLinkClass(currentView === 'admin_login' || currentView === 'admin')}
              >
                Admin
              </button>
            </>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => logout()}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 transition-colors py-1.5 cursor-pointer nav-link-underline"
            >
              Sign Out
            </button>
          )}

          <a
            href="https://mihora.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 py-1.5 transition-colors nav-link-underline"
          >
            MIHORA Site
          </a>
        </nav>

        {/* Zone 3: Single High-Contrast Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            isAdmin ? (
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Admin Console
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNav(currentView === 'profile' ? 'dashboard' : 'profile')}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {currentView === 'profile' ? 'View Dossier' : 'Edit Profile'}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => handleNav('register')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#143A7B] hover:bg-[#0E2B5C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Create Profile
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <ScrollProgressBar />

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E4E2DA] bg-white px-4 py-4 space-y-1.5">
          <button
            type="button"
            onClick={() => handleNav('landing')}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Overview
          </button>

          {isAuthenticated && !isAdmin && (
            <>
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#143A7B] hover:bg-slate-50 rounded-lg"
              >
                Edit Profile
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#143A7B] hover:bg-slate-50 rounded-lg"
            >
              Admin Console
            </button>
          )}

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => handleNav('admin_login')}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Admin Portal
            </button>
          )}

          <a
            href="https://mihora.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            MIHORA Main Site
          </a>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Sign Out
            </button>
          ) : (
            <div className="pt-2 border-t border-[#E4E2DA] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleNav('signin')}
                className="px-3 py-2.5 text-xs font-semibold text-slate-800 border border-[#CBD5E1] rounded-lg"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleNav('register')}
                className="px-3 py-2.5 text-xs font-semibold text-white bg-[#143A7B] rounded-lg"
              >
                Create Profile
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
