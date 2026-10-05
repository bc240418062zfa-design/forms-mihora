import React from 'react';
import { MihoraLogo } from '../components/brand/MihoraLogo';
import {
  FileText,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Database,
  Building,
  Cpu,
  Layers,
  MapPin,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Official Candidate Registry · MIHORA Tech</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
            Build Your Persistent Technical Profile for MIHORA Tech
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A dedicated candidate portal for engineers, technical specialists, and project leads. Complete your structured profile once, verify your competencies, and update your deployment availability at any time.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-7 py-3.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Create Candidate Account</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate('signin')}
              className="w-full sm:w-auto px-7 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Existing Profile</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>PostgreSQL Persistent Data</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>End-to-End Encrypted Auth</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Third-Party Tracking</span>
            </span>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Persistent Technical Identity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No one-off generic forms that disappear into black holes. Maintain your active career dossier, certifications, and updated experience records over time.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Commute &amp; Deployment Precision
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Specify your exact on-site willingness, commute thresholds in kilometers and minutes, and accommodation parameters so you are matched only to practical deployments.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Real-Time Administrative Review
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you submit or update your profile, authorized MIHORA technical leads and project directors receive instant real-time notifications on their console.
            </p>
          </div>
        </div>

        {/* Technical Disciplines */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Target Disciplines &amp; Engineering Specialties
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            MIHORA Tech collects profiles across our active client and internal infrastructure projects.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-800">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Software &amp; Cloud</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Civil &amp; Structural</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Electrical &amp; Power</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>QA/QC &amp; Supervision</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MihoraLogo size="sm" variant="mark" />
            <span className="text-xs font-bold text-slate-800">MIHORA Tech</span>
            <span className="text-xs text-slate-400">· Candidate Profile Portal</span>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} MIHORA Tech. All rights reserved. careers.mihora.tech
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onNavigate('admin_login')}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              Admin Access
            </button>
            <a
              href="https://mihora.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-colors"
            >
              Main Site
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
