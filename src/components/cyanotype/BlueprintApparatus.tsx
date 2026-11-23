import React, { useEffect, useState } from 'react';
import { useScrollProgress } from '../../utils/useScrollProgress';

/**
 * Corner registration crosses (Theme 064 §4 & §6.7)
 * Precision 1.5px alignment marks inset on every cyanotype sheet.
 */
export const RegistrationCrosses: React.FC = () => {
  const positions = [
    'top-3 left-3',
    'top-3 right-3',
    'bottom-3 left-3',
    'bottom-3 right-3',
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none">
      {positions.map((pos) => (
        <svg
          key={pos}
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 absolute ${pos} text-[var(--chalk)] opacity-60`}
        >
          <line x1="8" y1="1" x2="8" y2="15" stroke="currentColor" strokeWidth="1.25" />
          <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </div>
  );
};

interface TitleBlockProps {
  drawingNo: string;
  scale?: string;
  date?: string;
  drawnBy?: string;
  checkedBy?: string;
  className?: string;
}

/**
 * Ruled Drawing Title Block (Theme 064 §4 & §6.5)
 * Semantic definition list functioning as each sheet's identity papers.
 */
export const TitleBlock: React.FC<TitleBlockProps> = ({
  drawingNo,
  scale = '1:50',
  date = '2026-11',
  drawnBy = 'MIH',
  checkedBy = 'ENG',
  className = '',
}) => {
  return (
    <dl
      className={`border border-[rgba(244,247,245,0.34)] bg-[var(--edge)]/90 font-mono text-[11px] leading-tight grid grid-cols-3 sm:w-[300px] ${className}`}
    >
      <div className="col-span-2 px-2.5 py-2 border-b border-r border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">DRG NO.</dt>
        <dd className="text-[var(--exposure)] font-semibold tracking-wider mt-0.5">{drawingNo}</dd>
      </div>
      <div className="px-2.5 py-2 border-b border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">SCALE</dt>
        <dd className="text-[var(--exposure)] font-semibold mt-0.5">{scale}</dd>
      </div>
      <div className="px-2.5 py-2 border-r border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">DATE</dt>
        <dd className="text-[var(--chalk)] mt-0.5">{date}</dd>
      </div>
      <div className="px-2.5 py-2 border-r border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">DRN</dt>
        <dd className="text-[var(--chalk)] mt-0.5">{drawnBy}</dd>
      </div>
      <div className="px-2.5 py-2">
        <dt className="text-[var(--chalk-dim)] text-[10px]">CHK</dt>
        <dd className="text-[var(--exposure)] font-semibold mt-0.5">{checkedBy}</dd>
      </div>
    </dl>
  );
};

/**
 * Left-Edge Scroll Millimeter Dimension Line (Theme 064 §5)
 * Driven by the single shared lerped rAF scroll loop.
 */
export const EdgeDimensionRuler: React.FC = () => {
  const { progress } = useScrollProgress();
  const currentMm = Math.round(progress * 480);

  return (
    <aside
      aria-hidden="true"
      className="hidden 2xl:flex fixed left-4 top-24 bottom-10 w-10 pointer-events-none z-20 flex-col justify-between items-center text-[10px] font-mono text-[var(--chalk-dim)]"
    >
      <span>0</span>
      <div className="relative w-px flex-1 my-2 bg-[rgba(185,204,224,0.16)]">
        <div
          className="absolute top-0 left-0 w-full bg-[var(--chalk)] origin-top transition-transform duration-75"
          style={{ height: '100%', transform: `scaleY(${Math.max(0.02, progress)})` }}
        />
        {[0.25, 0.5, 0.75].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 w-2 h-px bg-[rgba(185,204,224,0.35)] -translate-x-[3px]"
            style={{ top: `${tick * 100}%` }}
          />
        ))}
      </div>
      <span className="tabular-nums text-[var(--chalk)]">{currentMm} mm</span>
    </aside>
  );
};

/**
 * Single Red Checker's Mark (Theme 064 §6.2)
 * Rationed strictly to ONE mark per sheet.
 */
export const SingleRedMark: React.FC<{ variant?: 'circle' | 'tick'; className?: string }> = ({
  variant = 'circle',
  className = '',
}) => {
  if (variant === 'tick') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 36 28"
        className={`w-7 h-5 text-[var(--red)] pointer-events-none ${className}`}
      >
        <path
          d="M4 15.5 C9 19.5, 11.5 22, 13.5 24 C18.5 16, 25 8.5, 32 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 110 44"
      className={`w-24 h-10 text-[var(--red)] pointer-events-none ${className}`}
    >
      <path
        d="M12 24 C10 10, 46 5, 86 9 C104 12, 105 31, 79 36 C49 41, 14 37, 11 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Hero Architectural Cyanotype Elevation & UV Light Sweep (Theme 064 §6.1)
 * Pure inline architectural vector diagram + 1600ms UV sweep + 3000ms watchdog.
 */
export const BlueprintHeroSchematic: React.FC = () => {
  const [exposed, setExposed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    try {
      return sessionStorage.getItem('mihora_vault_hero_exposed') === '1';
    } catch {
      return false;
    }
  });
  const [sweeping, setSweeping] = useState<boolean>(false);

  const triggerExposure = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setExposed(true);
      setSweeping(false);
      return;
    }
    setExposed(false);
    setSweeping(true);
  };

  useEffect(() => {
    if (!exposed && !sweeping) {
      setSweeping(true);
    }
  }, [exposed, sweeping]);

  useEffect(() => {
    if (!sweeping) return;
    const finishTimer = window.setTimeout(() => {
      setExposed(true);
      setSweeping(false);
      try {
        sessionStorage.setItem('mihora_vault_hero_exposed', '1');
      } catch {}
    }, 1500);

    // Watchdog ceiling (Theme 064 §6.1): guarantees content never remains unexposed
    const watchdogTimer = window.setTimeout(() => {
      setExposed(true);
      setSweeping(false);
    }, 3000);

    return () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(watchdogTimer);
    };
  }, [sweeping]);

  return (
    <div className="relative border border-[rgba(244,247,245,0.28)] bg-[var(--edge)]/70 p-4 sm:p-6 overflow-hidden">
      {/* UV Exposure Light Sweep Bar */}
      {sweeping && (
        <div
          aria-hidden="true"
          className="uv-exposure-bar pointer-events-none absolute inset-x-0 top-0 h-16 z-20"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(244,247,245,0.16) 80%, rgba(244,247,245,0.82) 100%)',
          }}
        />
      )}

      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[var(--chalk)] mb-3">
        <span>SHEET MHR-01 · STRUCTURAL &amp; SYSTEMS DOSSIER ELEVATION</span>
        <button
          type="button"
          onClick={triggerExposure}
          className="text-[11px] font-mono text-[var(--chalk)] hover:text-[var(--exposure)] underline decoration-[rgba(185,204,224,0.4)] underline-offset-4 cursor-pointer shrink-0"
        >
          Re-expose
        </button>
      </div>

      {/* Inline Vector Cyanotype Blueprint (Zero AI Stock Photos) */}
      <div
        className={`transition-[opacity,filter] duration-700 ${
          exposed ? 'opacity-100 blur-0' : 'opacity-45 blur-[2px]'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.2, 1)' }}
      >
        <svg
          role="img"
          aria-label="MIHORA engineering structural frame and 7-module candidate dossier blueprint schematic drawn at 1:50 scale"
          viewBox="0 0 560 280"
          className="w-full h-auto block"
        >
          {/* Outer Drafting Frame */}
          <rect
            x="16"
            y="14"
            width="528"
            height="218"
            fill="none"
            stroke="#B9CCE0"
            strokeOpacity="0.35"
            strokeWidth="1"
          />

          {/* Subtle Construction Grid Axes */}
          <g stroke="#B9CCE0" strokeOpacity="0.14" strokeDasharray="3 4" strokeWidth="1">
            <line x1="96" y1="14" x2="96" y2="232" />
            <line x1="216" y1="14" x2="216" y2="232" />
            <line x1="344" y1="14" x2="344" y2="232" />
            <line x1="464" y1="14" x2="464" y2="232" />
            <line x1="16" y1="100" x2="544" y2="100" />
            <line x1="16" y1="176" x2="544" y2="176" />
          </g>

          {/* Portal Structural Truss & Bay Frame */}
          <g stroke="#F4F7F5" strokeWidth="1.5" fill="none">
            {/* Columns */}
            <line x1="96" y1="48" x2="96" y2="196" />
            <line x1="216" y1="48" x2="216" y2="196" />
            <line x1="344" y1="48" x2="344" y2="196" />
            <line x1="464" y1="48" x2="464" y2="196" />

            {/* Top Chord & Lower Truss */}
            <polygon points="82,48 280,26 478,48 478,66 82,66" />
            <line x1="96" y1="48" x2="156" y2="66" strokeOpacity="0.7" />
            <line x1="156" y1="66" x2="216" y2="48" strokeOpacity="0.7" />
            <line x1="216" y1="48" x2="280" y2="66" strokeOpacity="0.7" />
            <line x1="280" y1="66" x2="344" y2="48" strokeOpacity="0.7" />
            <line x1="344" y1="48" x2="404" y2="66" strokeOpacity="0.7" />
            <line x1="404" y1="66" x2="464" y2="48" strokeOpacity="0.7" />

            {/* Foundation Datum */}
            <line x1="58" y1="196" x2="502" y2="196" strokeWidth="2" />
          </g>

          {/* 7-Module Dossier Architecture Nodes Inside Frame */}
          <g>
            {[
              { x: 112, y: 84, code: '01', label: 'IDENTITY' },
              { x: 232, y: 84, code: '02', label: 'ROLE TRACK' },
              { x: 360, y: 84, code: '03', label: 'EXPERIENCE' },
              { x: 112, y: 136, code: '04', label: 'ACADEMICS' },
              { x: 232, y: 136, code: '05', label: 'SKILLS' },
              { x: 360, y: 136, code: '06', label: 'COMMUTE' },
            ].map((node) => (
              <g key={node.code}>
                <rect
                  x={node.x}
                  y={node.y}
                  width="96"
                  height="34"
                  fill="#1B3A5C"
                  stroke="#F4F7F5"
                  strokeOpacity="0.75"
                  strokeWidth="1.2"
                />
                <text
                  x={node.x + 8}
                  y={node.y + 14}
                  fill="#B9CCE0"
                  fontSize="8.5"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  MOD {node.code}
                </text>
                <text
                  x={node.x + 8}
                  y={node.y + 26}
                  fill="#F4F7F5"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {node.label}
                </text>
              </g>
            ))}

            {/* Module 07 Output Bus */}
            <rect
              x="166"
              y="180"
              width="228"
              height="32"
              fill="#0F2740"
              stroke="#F4F7F5"
              strokeWidth="1.4"
            />
            <text
              x="280"
              y="200"
              textAnchor="middle"
              fill="#F4F7F5"
              fontSize="10"
              fontWeight="600"
              fontFamily="IBM Plex Mono, monospace"
            >
              07 · REMUNERATION &amp; PDF DOSSIER
            </text>
          </g>

          {/* Witness Ticks & Exterior Dimension Line (24px outside frame per §4) */}
          <g stroke="#B9CCE0" strokeWidth="1" fill="none">
            <line x1="96" y1="240" x2="96" y2="262" />
            <line x1="464" y1="240" x2="464" y2="262" />
            <line x1="96" y1="252" x2="464" y2="252" />
            <polygon points="96,252 104,249 104,255" fill="#B9CCE0" />
            <polygon points="464,252 456,249 456,255" fill="#B9CCE0" />
          </g>
          <rect x="210" y="242" width="140" height="18" fill="#0F2740" />
          <text
            x="280"
            y="255"
            textAnchor="middle"
            fill="#F4F7F5"
            fontSize="10.5"
            fontWeight="600"
            fontFamily="IBM Plex Mono, monospace"
          >
            7 MODULES · 100%
          </text>

          {/* Single Red Checker's Pencil Circle Around Total Datum (Theme 064 §6.2) */}
          <path
            d="M214 251 C214 240, 246 237, 282 238 C326 239, 349 243, 347 253 C344 263, 306 266, 272 265 C235 264, 212 259, 215 249"
            fill="none"
            stroke="#C0392B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

/**
 * Interactive Site & Commute Triangulation Blueprint (Sheet MHR-02)
 */
export const CommuteCalibrationDiagram: React.FC = () => {
  const [selectedRadius, setSelectedRadius] = useState<'25' | '50' | 'relocate'>('25');

  const config = {
    '25': {
      label: '25 km · 45 min Local Site Threshold',
      circleRadius: 56,
      housingNote: 'Local Daily Commute — Housing Not Required',
      metric: '25 km MAX',
    },
    '50': {
      label: '50 km+ · Extended Regional Corridor',
      circleRadius: 84,
      housingNote: 'Accommodation Triggered Beyond 50 km',
      metric: '50 km LIMIT',
    },
    relocate: {
      label: 'Multi-Region · Project Site Deployment',
      circleRadius: 102,
      housingNote: 'Full Relocation & Company Transport Calibration',
      metric: 'MULTI-REGION',
    },
  }[selectedRadius];

  return (
    <div className="border border-[rgba(244,247,245,0.26)] bg-[var(--edge)]/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-mono text-[var(--chalk)]">
          COMMUTE &amp; SITE RADIUS SCHEMATIC
        </span>
        <span className="text-[11px] font-mono font-semibold text-[var(--exposure)]">
          {config.metric}
        </span>
      </div>

      <svg
        role="img"
        aria-label={`Site commute calibration diagram showing ${config.label}`}
        viewBox="0 0 360 230"
        className="w-full h-auto block"
      >
        {/* Crosshair Axes */}
        <line x1="20" y1="115" x2="340" y2="115" stroke="#B9CCE0" strokeOpacity="0.24" strokeDasharray="3 4" />
        <line x1="180" y1="12" x2="180" y2="218" stroke="#B9CCE0" strokeOpacity="0.24" strokeDasharray="3 4" />

        {/* Concentric Threshold Rings */}
        <circle cx="180" cy="115" r="56" fill="none" stroke="#B9CCE0" strokeOpacity="0.28" strokeDasharray="4 3" />
        <circle cx="180" cy="115" r="84" fill="none" stroke="#B9CCE0" strokeOpacity="0.22" strokeDasharray="4 3" />
        <circle cx="180" cy="115" r="102" fill="none" stroke="#B9CCE0" strokeOpacity="0.16" strokeDasharray="2 4" />

        {/* Active Calibration Ring */}
        <circle
          cx="180"
          cy="115"
          r={config.circleRadius}
          fill="rgba(244,247,245,0.06)"
          stroke="#F4F7F5"
          strokeWidth="1.75"
          className="transition-all duration-300"
        />

        {/* Origin Candidate Residence Node */}
        <circle cx="180" cy="115" r="5" fill="#F4F7F5" />
        <text
          x="180"
          y="102"
          textAnchor="middle"
          fill="#F4F7F5"
          fontSize="9.5"
          fontWeight="600"
          fontFamily="IBM Plex Mono, monospace"
        >
          BASE SECTOR
        </text>

        {/* Project Site Target Node */}
        <line
          x1="180"
          y1="115"
          x2={180 + config.circleRadius * 0.82}
          y2={115 - config.circleRadius * 0.56}
          stroke="#F4F7F5"
          strokeWidth="1.4"
        />
        <rect
          x={180 + config.circleRadius * 0.82 - 5}
          y={115 - config.circleRadius * 0.56 - 5}
          width="10"
          height="10"
          fill="#1B3A5C"
          stroke="#F4F7F5"
          strokeWidth="1.5"
        />

        {/* Red Checker Mark on Site Deployment Pin */}
        <circle
          cx={180 + config.circleRadius * 0.82}
          cy={115 - config.circleRadius * 0.56}
          r="11"
          fill="none"
          stroke="#C0392B"
          strokeWidth="1.8"
        />
      </svg>

      {/* Interactive Threshold Controls */}
      <div className="mt-3 pt-3 border-t border-[rgba(185,204,224,0.2)] space-y-2.5">
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
              className={`py-2 px-2 text-[11px] font-mono rounded-[var(--radius-xs)] border transition-colors cursor-pointer ${
                selectedRadius === btn.id
                  ? 'bg-[var(--exposure)] text-[var(--edge)] border-[var(--exposure)] font-semibold'
                  : 'bg-[var(--prussian)] text-[var(--chalk)] border-[rgba(185,204,224,0.28)] hover:border-[var(--exposure)]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-mono text-[var(--chalk)]">{config.housingNote}</p>
      </div>
    </div>
  );
};

/**
 * Synchronized 7-Layer Dossier Stack Blueprint (Sheet MHR-03)
 */
export const DossierLayerDiagram: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const layers = [
    '01 · IDENTITY & REGION',
    '02 · ROLE & SENIORITY',
    '03 · WORK LEDGER',
    '04 · ACADEMICS',
    '05 · SKILL MATRIX',
    '06 · SITE & COMMUTE',
    '07 · REMUNERATION',
  ];

  return (
    <div className="border border-[rgba(244,247,245,0.28)] bg-[var(--edge)]/70 p-4 sm:p-5">
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--chalk)] mb-3">
        <span>RELATIONAL SCHEMA STACK</span>
        <span className="text-[var(--exposure)] font-semibold">MODULE 0{activeIndex + 1} / 07</span>
      </div>

      <svg
        role="img"
        aria-label={`Dossier relational schema stack with module ${activeIndex + 1} highlighted`}
        viewBox="0 0 360 250"
        className="w-full h-auto block"
      >
        {layers.map((label, idx) => {
          const y = 14 + idx * 32;
          const isActive = idx === activeIndex;
          return (
            <g key={label}>
              <rect
                x={isActive ? 22 : 34}
                y={y}
                width={isActive ? 316 : 292}
                height="24"
                fill={isActive ? '#F4F7F5' : '#1B3A5C'}
                stroke={isActive ? '#F4F7F5' : '#B9CCE0'}
                strokeOpacity={isActive ? 1 : 0.45}
                strokeWidth="1.2"
                className="transition-all duration-200"
              />
              <text
                x="48"
                y={y + 15.5}
                fill={isActive ? '#0F2740' : '#B9CCE0'}
                fontSize="10"
                fontWeight={isActive ? '600' : '400'}
                fontFamily="IBM Plex Mono, monospace"
              >
                {label}
              </text>
              {isActive && (
                <circle cx="320" cy={y + 12} r="4" fill="#C0392B" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
