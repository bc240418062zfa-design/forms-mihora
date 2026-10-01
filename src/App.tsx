import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

const AppContent: React.FC = () => {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');

  // Handle URL path initialization (e.g. /admin, /sign-in, /register)
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin/login')) {
      setCurrentView('admin_login');
    } else if (path.startsWith('/admin')) {
      setCurrentView('admin');
    } else if (path.startsWith('/sign-in') || path.startsWith('/login')) {
      setCurrentView('signin');
    } else if (path.startsWith('/register')) {
      setCurrentView('register');
    } else if (path.startsWith('/dashboard') || path.startsWith('/profile')) {
      setCurrentView('dashboard');
    }
  }, []);

  // Sync state with path
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    let targetPath = '/';
    if (view === 'signin') targetPath = '/sign-in';
    else if (view === 'register') targetPath = '/register';
    else if (view === 'dashboard') targetPath = '/dashboard';
    else if (view === 'admin_login') targetPath = '/admin/login';
    else if (view === 'admin') targetPath = '/admin';

    window.history.pushState({}, '', targetPath);
  };

  // Redirect guard
  useEffect(() => {
    if (!isLoading) {
      if (currentView === 'dashboard' && !isAuthenticated) {
        setCurrentView('signin');
      } else if (currentView === 'admin' && !isAdmin) {
        setCurrentView('admin_login');
      }
    }
  }, [currentView, isAuthenticated, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-mono">Initializing MIHORA Tech Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="grow">
        {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentView === 'signin' && <SignInPage onNavigate={handleNavigate} />}
        {currentView === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentView === 'dashboard' && <CandidateDashboardPage />}
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
