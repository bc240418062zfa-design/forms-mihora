import React, { useState, useEffect } from 'react';
import { MihoraLogo } from '../brand/MihoraLogo';
import { useAuth } from '../../context/AuthContext';
import { useScrollProgress } from '../../utils/useScrollProgress';
import { ScrollProgressBar } from '../ui/MotionPrimitives';
import { LogOut, Shield, Briefcase, Menu, X, ArrowUpRight } from 'lucide-react';

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
    `text-sm whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer ${
      active
        ? 'text-[var(--ink-primary)] font-semibold border-[var(--accent-primary)]'
        : 'text-[var(--ink-muted)] font-medium border-transparent hover:text-[var(--ink-primary)]'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
        isScrolled
          ? 'bg-[var(--surface-elevated)]/95 backdrop-blur-md border-[var(--border-hairline)] shadow-[0_1px_3px_rgba(11,19,36,0.05)]'
          : 'bg-[var(--surface-elevated)] border-[var(--border-hairline)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 relative">
        {/* Zone 1: Semantic Brand Trigger */}
        <button
          type="button"
          onClick={() => handleNav('landing')}
          className="cursor-pointer transition-opacity hover:opacity-85 flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm"
          aria-label="MIHORA Tech Careers Home"
        >
          <MihoraLogo size="md" variant="full" />
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7"
        >
          <button
            type="button"
            onClick={() => handleNav('landing')}
            className={navLinkClass(currentView === 'landing')}
          >
            Overview
          </button>

          {isAuthenticated && !isAdmin && (
            <>
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className={navLinkClass(currentView === 'dashboard')}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleNav('profile')}
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
              className={navLinkClass(currentView === 'admin')}
            >
              Admin Console
            </button>
          )}

          <a
            href="https://mihora.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink-primary)] whitespace-nowrap inline-flex items-center gap-1 py-1 border-b-2 border-transparent transition-colors"
          >
            <span>MIHORA Tech</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => handleNav('admin')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--surface-ink)] hover:bg-slate-800 rounded-[var(--radius-sm)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Console</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav(currentView === 'profile' ? 'dashboard' : 'profile')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-sm)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{currentView === 'profile' ? 'Overview' : 'Edit Profile'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out"
                aria-label="Sign Out"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--status-danger)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)] transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNav('signin')}
                className="px-3.5 py-2 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)] transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleNav('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] rounded-[var(--radius-sm)] transition-colors whitespace-nowrap cursor-pointer"
              >
                Create Profile
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Scroll Reading Hairline */}
      <ScrollProgressBar />

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border-hairline)] bg-[var(--surface-elevated)] px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleNav('landing')}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)]"
          >
            Careers Overview
          </button>

          {isAuthenticated && !isAdmin && (
            <>
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)]"
              >
                Candidate Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)]"
              >
                Edit Profile
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)]"
            >
              Admin Console
            </button>
          )}

          <a
            href="https://mihora.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[var(--ink-muted)] hover:bg-[var(--surface-subtle)] rounded-[var(--radius-sm)]"
          >
            <span>MIHORA Tech Main Site</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-[var(--border-hairline)] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleNav('signin')}
                className="px-3 py-2.5 text-xs font-semibold text-[var(--ink-primary)] border border-[var(--border-strong)] rounded-[var(--radius-sm)]"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleNav('register')}
                className="px-3 py-2.5 text-xs font-semibold text-white bg-[var(--accent-primary)] rounded-[var(--radius-sm)]"
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
