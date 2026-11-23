import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

export type AppView =
  | 'landing'
  | 'signin'
  | 'register'
  | 'dashboard'
  | 'profile'
  | 'admin_login'
  | 'admin';

function resolveViewFromPath(pathname: string): AppView {
  const path = pathname.toLowerCase();
  if (path.startsWith('/admin/login')) return 'admin_login';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/sign-in') || path.startsWith('/login')) return 'signin';
  if (path.startsWith('/register')) return 'register';
  if (path.startsWith('/profile')) return 'profile';
  if (path.startsWith('/dashboard')) return 'dashboard';
  return 'landing';
}

function resolvePathFromView(view: AppView): string {
  switch (view) {
    case 'signin':
      return '/sign-in';
    case 'register':
      return '/register';
    case 'dashboard':
      return '/dashboard';
    case 'profile':
      return '/profile';
    case 'admin_login':
      return '/admin/login';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}

const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(() =>
    resolveViewFromPath(window.location.pathname)
  );

  // Sync on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(resolveViewFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((nextView: string) => {
    const validViews: AppView[] = [
      'landing',
      'signin',
      'register',
      'dashboard',
      'profile',
      'admin_login',
      'admin',
    ];
    const resolved: AppView = validViews.includes(nextView as AppView)
      ? (nextView as AppView)
      : 'landing';
    setCurrentView(resolved);
    const targetPath = resolvePathFromView(resolved);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Auth redirect guard with URL replacement
  useEffect(() => {
    if (isLoading) return;

    let redirected: AppView | null = null;
    if ((currentView === 'dashboard' || currentView === 'profile') && !isAuthenticated) {
      redirected = 'signin';
    } else if (currentView === 'admin' && !isAdmin) {
      redirected = 'admin_login';
    } else if (currentView === 'admin_login' && isAuthenticated && isAdmin) {
      redirected = 'admin';
    } else if ((currentView === 'signin' || currentView === 'register') && isAuthenticated) {
      redirected = isAdmin ? 'admin' : 'dashboard';
    }

    if (redirected && redirected !== currentView) {
      setCurrentView(redirected);
      const targetPath = resolvePathFromView(redirected);
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({}, '', targetPath);
      }
    }
  }, [currentView, isAuthenticated, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[var(--ink-muted)] font-mono tracking-tight">
            Initializing MIHORA Tech Portal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] text-[var(--ink-primary)] flex flex-col font-sans">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="grow">
        {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentView === 'signin' && <SignInPage onNavigate={handleNavigate} />}
        {currentView === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {(currentView === 'dashboard' || currentView === 'profile') && (
          <CandidateDashboardPage
            initialEditing={currentView === 'profile'}
            onViewModeChange={(editing) => handleNavigate(editing ? 'profile' : 'dashboard')}
          />
        )}
        {currentView === 'admin_login' && <AdminLoginPage onNavigate={handleNavigate} />}
        {currentView === 'admin' && <AdminPortalPage />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
