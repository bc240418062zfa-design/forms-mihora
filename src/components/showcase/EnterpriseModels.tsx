import React, { useState } from 'react';
import { ArchitecturalFrame } from '../ui/ArchitecturalFrame';
import mobilityDaylightImg from '../../assets/images/studio_mobility_daylight_1795500976135.jpg';
import engineeringBayDaylightImg from '../../assets/images/studio_engineering_bay_daylight_1795500977090.jpg';

/**
 * Interactive Regional Mobility & Commute Range Diorama
 */
export const RegionalMobilityShowcase: React.FC = () => {
  const [selectedRadius, setSelectedRadius] = useState<'25' | '50' | 'relocate'>('25');

  const config = {
    '25': {
      label: 'Local Daily Commute · Up to 25 km',
      circleRadius: 46,
      housingNote: 'Standard daily project-site commute within local metropolitan sector.',
      metric: '25 km max',
    },
    '50': {
      label: 'Regional Corridor · 50 km+ Range',
      circleRadius: 72,
      housingNote: 'Extended regional travel with project accommodation support beyond 50 km.',
      metric: '50 km corridor',
    },
    relocate: {
      label: 'Multi-Region Deployment & Relocation',
      circleRadius: 96,
      housingNote: 'Full relocation and company transport coordination across active project hubs.',
      metric: 'Multi-region',
    },
  }[selectedRadius];

  return (
    <div className="enterprise-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2DA] bg-[#FAF9F6]">
        <span className="text-xs font-semibold text-slate-700">
          Site &amp; Corridor Placement Model
        </span>
        <span className="text-xs font-mono font-semibold text-[#143A7B]">
          {config.metric}
        </span>
      </div>

      <ArchitecturalFrame
        src={mobilityDaylightImg}
        alt={`Architectural scale diorama illustrating ${config.label}`}
        className="h-[290px] sm:h-[330px] border-0 rounded-none"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent pointer-events-none" />

        <svg
          aria-hidden="true"
          viewBox="0 0 360 220"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <circle
            cx="180"
            cy="110"
            r={config.circleRadius}
            fill="rgba(20, 58, 123, 0.14)"
            stroke="#FFFFFF"
            strokeOpacity="0.9"
            strokeWidth="1.75"
            className="transition-all duration-300"
          />
          <circle
            cx="180"
            cy="110"
            r={config.circleRadius * 0.55}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.45"
            strokeDasharray="4 4"
            className="transition-all duration-300"
          />
          <circle cx="180" cy="110" r="4.5" fill="#FFFFFF" />
          <line
            x1="180"
            y1="110"
            x2={180 + config.circleRadius * 0.78}
            y2={110 - config.circleRadius * 0.52}
            stroke="#FFFFFF"
            strokeWidth="1.4"
          />
          <circle
            cx={180 + config.circleRadius * 0.78}
            cy={110 - config.circleRadius * 0.52}
            r="5.5"
            fill="#143A7B"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
          <span className="text-xs font-semibold text-white drop-shadow-xs">
            {config.label}
          </span>
        </div>
      </ArchitecturalFrame>

      <div className="p-5 space-y-3.5 bg-white">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '25' as const, label: '25 km Local' },
            { id: '50' as const, label: '50 km Regional' },
            { id: 'relocate' as const, label: 'Relocation' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              aria-pressed={selectedRadius === btn.id}
              onClick={() => setSelectedRadius(btn.id)}
              className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                selectedRadius === btn.id
                  ? 'bg-[#143A7B] text-white border-[#143A7B]'
                  : 'bg-[#F7F6F2] text-slate-700 border-[#E4E2DA] hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {config.housingNote}
        </p>
      </div>
    </div>
  );
};

/**
 * Technical Evaluation Cutaway & 5-Pillar Synchronized Showcase
 */
export const TechnicalEvaluationShowcase: React.FC<{ activeIndex: number }> = ({
  activeIndex,
}) => {
  const pillars = [
    { code: '01', name: 'Academic Credentials', metric: 'Accredited Degrees' },
    { code: '02', name: 'Engineering Leadership', metric: 'Project Delivery' },
    { code: '03', name: 'Domain Proficiency', metric: 'Verified Tooling' },
    { code: '04', name: 'Regional Mobility Fit', metric: 'Site Calibration' },
    { code: '05', name: 'Executive Portfolio', metric: 'A4 Dossier Ready' },
  ];

  const current = pillars[activeIndex] || pillars[0];

  return (
    <div className="enterprise-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2DA] bg-[#FAF9F6]">
        <span className="text-xs font-semibold text-slate-700">
          Engineering &amp; Academic Evaluation Standard
        </span>
        <span className="text-xs font-mono font-semibold text-[#143A7B]">
          0{Math.min(pillars.length, activeIndex + 1)} / 05
        </span>
      </div>

      <ArchitecturalFrame
        src={engineeringBayDaylightImg}
        alt="Museum-grade architectural titanium bridge and electrical engineering cutaway scale model"
        className="h-[270px] sm:h-[310px] border-0 rounded-none"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Pillar {current.code}
            </div>
            <div className="font-display text-lg sm:text-xl font-bold text-white">
              {current.name}
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-300 shrink-0">
            {current.metric}
          </span>
        </div>
      </ArchitecturalFrame>

      <div className="p-5 grid grid-cols-5 gap-2 bg-white">
        {pillars.map((p, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div key={p.code} className="space-y-1.5">
              <div
                className={`h-1.5 rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#143A7B]'
                    : idx < activeIndex
                    ? 'bg-emerald-600/75'
                    : 'bg-slate-200'
                }`}
              />
              <div
                className={`text-[11px] font-mono text-center ${
                  isActive ? 'text-[#143A7B] font-semibold' : 'text-slate-400'
                }`}
              >
                {p.code}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
