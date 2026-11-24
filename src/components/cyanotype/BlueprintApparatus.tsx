import React, { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../../utils/useScrollProgress';

/**
 * Ambient Darkroom Light-Table Dust Motes (Theme 064 §5)
 * Ultra-low-cost compositor-only drift; hidden on reduced-motion & print.
 */
const DUST_PARTICLES = [
  { top: '8%', left: '12%', size: 2, delay: '0s', dur: '10s' },
  { top: '16%', left: '84%', size: 1.5, delay: '1.2s', dur: '11s' },
  { top: '24%', left: '38%', size: 2, delay: '2.5s', dur: '9s' },
  { top: '31%', left: '72%', size: 1.5, delay: '0.6s', dur: '12s' },
  { top: '42%', left: '19%', size: 2.5, delay: '3.1s', dur: '10s' },
  { top: '48%', left: '91%', size: 1.5, delay: '1.8s', dur: '11s' },
  { top: '57%', left: '54%', size: 2, delay: '4.0s', dur: '9.5s' },
  { top: '66%', left: '28%', size: 1.5, delay: '2.1s', dur: '12.5s' },
  { top: '74%', left: '82%', size: 2, delay: '0.4s', dur: '10.5s' },
  { top: '82%', left: '44%', size: 2, delay: '3.6s', dur: '11.5s' },
  { top: '89%', left: '15%', size: 1.5, delay: '1.5s', dur: '9.8s' },
  { top: '94%', left: '68%', size: 2, delay: '2.8s', dur: '10.8s' },
];

export const AmbientDustField: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden print:hidden"
    >
      {DUST_PARTICLES.map((p, idx) => (
        <span
          key={idx}
          className="cyanotype-mote absolute rounded-full bg-[var(--chalk)]"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Corner registration crosses (Theme 064 §4 & §6.7)
 * Precision 1.5px alignment marks inset on every cyanotype sheet, staggered draw.
 */
export const RegistrationCrosses: React.FC = () => {
  const positions = [
    { cls: 'top-3 left-3', delay: '0ms' },
    { cls: 'top-3 right-3', delay: '60ms' },
    { cls: 'bottom-3 left-3', delay: '120ms' },
    { cls: 'bottom-3 right-3', delay: '180ms' },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none">
      {positions.map(({ cls, delay }) => (
        <svg
          key={cls}
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 absolute ${cls} text-[var(--chalk)] opacity-65`}
        >
          <line
            x1="8"
            y1="1"
            x2="8"
            y2="15"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="16"
            strokeDashoffset="16"
            className="draw-stroke"
            style={{ animationDelay: delay }}
          />
          <line
            x1="1"
            y1="8"
            x2="15"
            y2="8"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="16"
            strokeDashoffset="16"
            className="draw-stroke"
            style={{ animationDelay: delay }}
          />
          <circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </div>
  );
};

interface TitleBlockProps {
  drawingNo: string;
  scale?: string;
  scaleTick?: boolean;
  date?: string;
  drawnBy?: string;
  checkedBy?: string;
  className?: string;
}

/**
 * Ruled Drawing Title Block (Theme 064 §4, §6.5 & §6.6)
 * Semantic definition list functioning as each sheet's identity papers.
 */
export const TitleBlock: React.FC<TitleBlockProps> = ({
  drawingNo,
  scale = '1:50',
  scaleTick = false,
  date = '2026-11',
  drawnBy = 'MIH',
  checkedBy = 'ENG',
  className = '',
}) => {
  return (
    <dl
      className={`border border-[rgba(244,247,245,0.36)] bg-[var(--edge)]/92 font-mono text-[11px] leading-tight grid grid-cols-3 sm:w-[300px] ${className}`}
    >
      <div className="col-span-2 px-2.5 py-2 border-b border-r border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">DRG NO.</dt>
        <dd className="text-[var(--exposure)] font-semibold tracking-wider mt-0.5">{drawingNo}</dd>
      </div>
      <div className="px-2.5 py-2 border-b border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">SCALE</dt>
        <dd className="text-[var(--exposure)] font-semibold mt-0.5 flex items-center gap-1 tabular-nums">
          <span>{scale}</span>
          {scaleTick && (
            <svg
              aria-hidden="true"
              viewBox="0 0 12 10"
              className="w-3 h-2.5 text-[var(--chalk)] shrink-0"
            >
              <path
                d="M1.5 5.5 L4.5 8.5 L10.5 1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </dd>
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
 * Scroll-Linked Dimension Witness Bar (Theme 064 §6.4)
 * Scrubs cleanly on the single shared lerped scroll loop.
 */
export const ScrollDimensionRule: React.FC<{
  label: string;
  unitSuffix: string;
  targetNumber: number;
  bandStart?: number;
  bandEnd?: number;
}> = ({ label, unitSuffix, targetNumber, bandStart = 0.05, bandEnd = 0.75 }) => {
  const { progress } = useScrollProgress();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  const localRatio = reduced
    ? 1
    : Math.min(1, Math.max(0.18, (progress - bandStart) / Math.max(0.05, bandEnd - bandStart)));
  const currentValue = Math.round(targetNumber * localRatio);

  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 text-[11px] font-mono text-[var(--chalk)] py-2"
    >
      <span className="shrink-0 text-[var(--chalk-dim)]">{label}</span>
      <div className="relative flex-1 h-4 flex items-center">
        <span className="w-[1.5px] h-3 bg-[var(--chalk)] shrink-0" />
        <div className="flex-1 h-px bg-[var(--rule-hairline)] relative overflow-hidden">
          <div
            className="h-full bg-[var(--exposure)] origin-left transition-transform duration-75"
            style={{ transform: `scaleX(${localRatio})` }}
          />
        </div>
        <span className="w-[1.5px] h-3 bg-[var(--chalk)] shrink-0" />
      </div>
      <span className="shrink-0 font-semibold text-[var(--exposure)] tabular-nums">
        {currentValue.toLocaleString()} {unitSuffix}
      </span>
    </div>
  );
};

/**
 * Left-Edge Scroll Millimeter Dimension Line (Theme 064 §5)
 * Driven by the single shared lerped rAF scroll loop.
 */
export const EdgeDimensionRuler: React.FC = () => {
  const { progress } = useScrollProgress();
  const currentMm = Math.round(progress * 480);

  const stops = [
    { pos: 0.02, code: '01' },
    { pos: 0.32, code: '02' },
    { pos: 0.62, code: '03' },
    { pos: 0.88, code: '04' },
  ];

  return (
    <aside
      aria-hidden="true"
      className="hidden 2xl:flex fixed left-4 top-24 bottom-10 w-11 pointer-events-none z-20 flex-col justify-between items-center text-[10px] font-mono text-[var(--chalk-dim)]"
    >
      <span>0</span>
      <div className="relative w-px flex-1 my-2 bg-[rgba(185,204,224,0.16)]">
        <div
          className="absolute top-0 left-0 w-full bg-[var(--exposure)] origin-top transition-transform duration-75"
          style={{ height: '100%', transform: `scaleY(${Math.max(0.02, progress)})` }}
        />
        {stops.map((stop) => {
          const passed = progress >= stop.pos;
          return (
            <div
              key={stop.code}
              className="absolute left-0 flex items-center gap-1.5 -translate-x-[3px]"
              style={{ top: `${stop.pos * 100}%` }}
            >
              <span
                className={`w-2 h-px transition-colors ${
                  passed ? 'bg-[var(--exposure)]' : 'bg-[rgba(185,204,224,0.35)]'
                }`}
              />
              <span
                className={`text-[9px] transition-colors ${
                  passed ? 'text-[var(--exposure)] font-semibold' : 'text-[var(--chalk-dim)]'
                }`}
              >
                {stop.code}
              </span>
            </div>
          );
        })}
      </div>
      <span className="tabular-nums text-[var(--exposure)] font-semibold">{currentMm} mm</span>
    </aside>
  );
};

/**
 * Single Red Checker's Mark (Theme 064 §6.2)
 * Rationed strictly to ONE mark per sheet. Draws cleanly in ~340ms.
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
          strokeDasharray="48"
          strokeDashoffset="48"
          className="draw-red-mark"
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
        strokeDasharray="240"
        strokeDashoffset="240"
        className="draw-red-mark"
      />
    </svg>
  );
};

const HERO_NODES = [
  { x: 112, y: 84, code: '01', label: 'IDENTITY', note: 'Legal identity, calling code, city & sector' },
  { x: 232, y: 84, code: '02', label: 'ROLE TRACK', note: 'Primary discipline, seniority tier & multi-role' },
  { x: 360, y: 84, code: '03', label: 'EXPERIENCE', note: 'Employment ledger, tooling & deliverables' },
  { x: 112, y: 136, code: '04', label: 'ACADEMICS', note: 'Degrees, institutions, enrollment status' },
  { x: 232, y: 136, code: '05', label: 'SKILLS', note: 'Domain proficiencies & verified years' },
  { x: 360, y: 136, code: '06', label: 'COMMUTE', note: 'On-site deployment, km/min limits & housing' },
];

/**
 * Hero Architectural Cyanotype Elevation & UV Light Sweep (Theme 064 §6.1 & §6.6)
 * Pure inline architectural vector diagram + 1600ms UV sweep + scale stepping + 3000ms watchdog.
 */
export const BlueprintHeroSchematic: React.FC<{
  onScaleChange?: (scale: string, settled: boolean) => void;
}> = ({ onScaleChange }) => {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [exposed, setExposed] = useState<boolean>(reducedMotion);
  const [sweeping, setSweeping] = useState<boolean>(!reducedMotion);
  const [redMarkDrawn, setRedMarkDrawn] = useState<boolean>(reducedMotion);
  const [activeNodeCode, setActiveNodeCode] = useState<string>('01');
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const runExposureCycle = () => {
    clearTimers();
    if (reducedMotion) {
      setExposed(true);
      setSweeping(false);
      setRedMarkDrawn(true);
      onScaleChange?.('1:50', true);
      return;
    }

    setExposed(false);
    setSweeping(true);
    setRedMarkDrawn(false);
    onScaleChange?.('1:200', false);

    timersRef.current.push(
      window.setTimeout(() => {
        onScaleChange?.('1:100', false);
      }, 650),
      window.setTimeout(() => {
        onScaleChange?.('1:50', true);
      }, 1300),
      window.setTimeout(() => {
        setExposed(true);
        setSweeping(false);
        setRedMarkDrawn(true);
      }, 1550),
      // Strict 3000ms watchdog safety guarantee
      window.setTimeout(() => {
        setExposed(true);
        setSweeping(false);
        setRedMarkDrawn(true);
        onScaleChange?.('1:50', true);
      }, 3000)
    );
  };

  useEffect(() => {
    runExposureCycle();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inspectedNode = HERO_NODES.find((n) => n.code === activeNodeCode) || HERO_NODES[0];

  return (
    <div className="relative border border-[rgba(244,247,245,0.3)] bg-[var(--edge)]/75 p-4 sm:p-6 overflow-hidden">
      {/* UV Exposure Light Sweep Bar */}
      {sweeping && (
        <div
          aria-hidden="true"
          className="uv-exposure-bar pointer-events-none absolute inset-x-0 top-0 h-20 z-20"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(244,247,245,0.18) 78%, rgba(244,247,245,0.88) 100%)',
          }}
        />
      )}

      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[var(--chalk)] mb-3">
        <span>SHEET MHR-01 · STRUCTURAL &amp; SYSTEMS ELEVATION</span>
        <button
          type="button"
          onClick={runExposureCycle}
          className="pencil-link text-[11px] font-mono text-[var(--exposure)] hover:text-white cursor-pointer shrink-0"
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
            <line x1="96" y1="48" x2="96" y2="196" />
            <line x1="216" y1="48" x2="216" y2="196" />
            <line x1="344" y1="48" x2="344" y2="196" />
            <line x1="464" y1="48" x2="464" y2="196" />

            <polygon points="82,48 280,26 478,48 478,66 82,66" />
            <line x1="96" y1="48" x2="156" y2="66" strokeOpacity="0.7" />
            <line x1="156" y1="66" x2="216" y2="48" strokeOpacity="0.7" />
            <line x1="216" y1="48" x2="280" y2="66" strokeOpacity="0.7" />
            <line x1="280" y1="66" x2="344" y2="48" strokeOpacity="0.7" />
            <line x1="344" y1="48" x2="404" y2="66" strokeOpacity="0.7" />
            <line x1="404" y1="66" x2="464" y2="48" strokeOpacity="0.7" />

            <line x1="58" y1="196" x2="502" y2="196" strokeWidth="2" />
          </g>

          {/* Interactive 7-Module Dossier Architecture Nodes Inside Frame */}
          <g>
            {HERO_NODES.map((node) => {
              const isSelected = activeNodeCode === node.code;
              return (
                <g
                  key={node.code}
                  onMouseEnter={() => setActiveNodeCode(node.code)}
                  onClick={() => setActiveNodeCode(node.code)}
                  className="cursor-pointer"
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width="96"
                    height="34"
                    fill={isSelected ? '#F4F7F5' : '#1B3A5C'}
                    stroke="#F4F7F5"
                    strokeOpacity={isSelected ? 1 : 0.72}
                    strokeWidth={isSelected ? '1.6' : '1.2'}
                    className="transition-colors duration-150"
                  />
                  <text
                    x={node.x + 8}
                    y={node.y + 14}
                    fill={isSelected ? '#0F2740' : '#B9CCE0'}
                    fontSize="8.5"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    MOD {node.code}
                  </text>
                  <text
                    x={node.x + 8}
                    y={node.y + 26}
                    fill={isSelected ? '#0F2740' : '#F4F7F5'}
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}

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

          {/* Witness Ticks & Exterior Dimension Line (24px outside frame) */}
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
          {redMarkDrawn && (
            <path
              d="M214 251 C214 240, 246 237, 282 238 C326 239, 349 243, 347 253 C344 263, 306 266, 272 265 C235 264, 212 259, 215 249"
              fill="none"
              stroke="#C0392B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="280"
              strokeDashoffset="280"
              className="draw-red-mark"
            />
          )}
        </svg>
      </div>

      {/* Live Inspected Node Annotation Footer */}
      <div className="mt-3 pt-2.5 border-t border-[rgba(185,204,224,0.2)] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <span className="text-[var(--exposure)] font-semibold">
          MOD {inspectedNode.code} · {inspectedNode.label}
        </span>
        <span className="text-[var(--chalk)]">{inspectedNode.note}</span>
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
    <div className="border border-[rgba(244,247,245,0.26)] bg-[var(--edge)]/75 p-4 sm:p-5">
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
        <line x1="20" y1="115" x2="340" y2="115" stroke="#B9CCE0" strokeOpacity="0.24" strokeDasharray="3 4" />
        <line x1="180" y1="12" x2="180" y2="218" stroke="#B9CCE0" strokeOpacity="0.24" strokeDasharray="3 4" />

        <circle cx="180" cy="115" r="56" fill="none" stroke="#B9CCE0" strokeOpacity="0.28" strokeDasharray="4 3" />
        <circle cx="180" cy="115" r="84" fill="none" stroke="#B9CCE0" strokeOpacity="0.22" strokeDasharray="4 3" />
        <circle cx="180" cy="115" r="102" fill="none" stroke="#B9CCE0" strokeOpacity="0.16" strokeDasharray="2 4" />

        <circle
          cx="180"
          cy="115"
          r={config.circleRadius}
          fill="rgba(244,247,245,0.06)"
          stroke="#F4F7F5"
          strokeWidth="1.75"
          className="transition-all duration-300"
        />

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

        <circle
          cx={180 + config.circleRadius * 0.82}
          cy={115 - config.circleRadius * 0.56}
          r="11"
          fill="none"
          stroke="#C0392B"
          strokeWidth="1.8"
        />
      </svg>

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
    <div className="border border-[rgba(244,247,245,0.28)] bg-[var(--edge)]/75 p-4 sm:p-5">
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
              {isActive && <circle cx="320" cy={y + 12} r="4" fill="#C0392B" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
