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

const SHEET_META_BY_ID: Record<string, string> = {
  'sheet-mhr-01': '01 · TALENT PORTAL',
  'sheet-mhr-02': '02 · WORKFORCE MOBILITY',
  'sheet-mhr-03': '03 · EVALUATION',
  'sheet-mhr-04': '04 · CAREER TRACKS',
};

function resolveSheetMirror(currentView?: string, activeLandingSheet?: string): string {
  switch (currentView) {
    case 'signin':
      return 'CANDIDATE SIGN IN';
    case 'register':
      return 'CANDIDATE REGISTRATION';
    case 'dashboard':
      return 'CANDIDATE PROFILE';
    case 'profile':
      return 'PROFILE EDITOR';
    case 'admin_login':
      return 'ADMINISTRATION';
    case 'admin':
      return 'TALENT DIRECTORY';
    default:
      return SHEET_META_BY_ID[activeLandingSheet || 'sheet-mhr-01'] || '01 · TALENT PORTAL';
  }
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { isScrolled } = useScrollProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLandingSheet, setActiveLandingSheet] = useState<string>('sheet-mhr-01');

  const handleNav = (view: string) => {
    setMobileOpen(false);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [currentView]);

  // Theme 064 §6.5 & §6.11 Live Scrollspy Title-Block Mirror on Landing Page
  useEffect(() => {
    if (currentView && currentView !== 'landing') return;
    if (typeof IntersectionObserver === 'undefined') return;

    const ids = ['sheet-mhr-01', 'sheet-mhr-02', 'sheet-mhr-03', 'sheet-mhr-04'];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveLandingSheet(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0.01 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentView]);

  const navLinkClass = (active: boolean) =>
    `text-xs font-mono whitespace-nowrap shrink-0 transition-colors py-1.5 border-b-2 cursor-pointer pencil-link ${
      active
        ? 'text-[var(--exposure)] font-semibold border-[var(--red)]'
        : 'text-[var(--chalk)] font-medium border-transparent hover:text-[var(--exposure)]'
    }`;

  const activeSheetLabel = resolveSheetMirror(currentView, activeLandingSheet);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b border-[var(--rule-hairline)] ${
        isScrolled
          ? 'bg-[var(--edge)]/95 backdrop-blur-md shadow-[0_8px_24px_rgba(4,11,22,0.48)]'
          : 'bg-[var(--edge)]'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8 relative">
        {/* Zone 1: Clean Brand Wordmark */}
        <div className="flex items-center min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('landing')}
            className="cursor-pointer transition-opacity hover:opacity-85 flex items-center shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 rounded-xs"
            aria-label="MIHORA Tech Home"
          >
            <MihoraLogo size="sm" variant="full" theme="dark" />
          </button>
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
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
              className="text-xs font-mono font-medium text-[var(--chalk)] hover:text-[var(--exposure)] whitespace-nowrap shrink-0 transition-colors py-1.5 border-b-2 border-transparent cursor-pointer pencil-link"
            >
              Sign Out
            </button>
          )}

          <a
            href="https://mihora.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-medium text-[var(--chalk)] hover:text-[var(--exposure)] whitespace-nowrap shrink-0 py-1.5 border-b-2 border-transparent transition-colors pencil-link"
          >
            MIHORA Site
          </a>
        </nav>

        {/* Zone 3: Single High-Contrast Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            isAdmin ? (
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Admin Console
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNav(currentView === 'profile' ? 'dashboard' : 'profile')}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {currentView === 'profile' ? 'View Dossier' : 'Edit Profile'}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => handleNav('register')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-mono font-semibold text-[var(--edge)] bg-[var(--exposure)] hover:bg-white rounded-[var(--radius-xs)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Create Profile
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[var(--chalk)] hover:text-[var(--exposure)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <ScrollProgressBar />

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--rule-hairline)] bg-[var(--edge)] px-4 py-4 space-y-1.5 font-mono">
          <div className="px-3 pb-2 mb-2 border-b border-[var(--rule-hairline)] text-[11px] text-[var(--chalk-dim)] flex items-center justify-between">
            <span>PORTAL SECTION</span>
            <span className="text-[var(--exposure)] font-semibold">{activeSheetLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => handleNav('landing')}
            className="w-full text-left px-3 py-2.5 text-xs font-medium text-[var(--exposure)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)]"
          >
            Overview
          </button>

          {isAuthenticated && !isAdmin && (
            <>
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2.5 text-xs font-medium text-[var(--exposure)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)]"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold text-[var(--exposure)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)]"
              >
                Edit Profile
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className="w-full text-left px-3 py-2.5 text-xs font-semibold text-[var(--exposure)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)]"
            >
              Admin Console
            </button>
          )}

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => handleNav('admin_login')}
              className="w-full text-left px-3 py-2.5 text-xs font-medium text-[var(--exposure)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)]"
            >
              Admin Portal
            </button>
          )}

          <a
            href="https://mihora.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 text-xs font-medium text-[var(--chalk)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)]"
          >
            MIHORA Main Site
          </a>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className="w-full text-left px-3 py-2.5 text-xs font-medium text-[var(--chalk)] hover:bg-[var(--prussian)] rounded-[var(--radius-xs)]"
            >
              Sign Out
            </button>
          ) : (
            <div className="pt-2 border-t border-[var(--rule-hairline)] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleNav('signin')}
                className="px-3 py-2.5 text-xs font-semibold text-[var(--exposure)] border border-[var(--rule-strong)] rounded-[var(--radius-xs)]"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleNav('register')}
                className="px-3 py-2.5 text-xs font-semibold text-[var(--edge)] bg-[var(--exposure)] rounded-[var(--radius-xs)]"
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
