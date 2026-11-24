import React, { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../../utils/useScrollProgress';
import { ArchitecturalFrame } from '../ui/ArchitecturalFrame';
import mobilityCorridorImg from '../../assets/images/model_mobility_corridor_1795489146410.jpg';
import structuralElevationImg from '../../assets/images/model_structural_elevation_1795489146878.jpg';

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
        <dt className="text-[var(--chalk-dim)] text-[10px]">RECORD</dt>
        <dd className="text-[var(--exposure)] font-semibold tracking-wider mt-0.5">{drawingNo}</dd>
      </div>
      <div className="px-2.5 py-2 border-b border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">STATUS</dt>
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
        <dt className="text-[var(--chalk-dim)] text-[10px]">CYCLE</dt>
        <dd className="text-[var(--chalk)] mt-0.5">{date}</dd>
      </div>
      <div className="px-2.5 py-2 border-r border-[rgba(185,204,224,0.24)]">
        <dt className="text-[var(--chalk-dim)] text-[10px]">UNIT</dt>
        <dd className="text-[var(--chalk)] mt-0.5">{drawnBy}</dd>
      </div>
      <div className="px-2.5 py-2">
        <dt className="text-[var(--chalk-dim)] text-[10px]">REVIEW</dt>
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

const HERO_TRACKS = [
  {
    x: 112,
    y: 84,
    w: 158,
    code: '01',
    label: 'SOFTWARE & CLOUD',
    note: 'Enterprise platforms, cloud infrastructure & distributed engineering',
  },
  {
    x: 290,
    y: 84,
    w: 158,
    code: '02',
    label: 'CIVIL & STRUCTURAL',
    note: 'Structural analysis, CAD/BIM coordination & field site delivery',
  },
  {
    x: 112,
    y: 130,
    w: 158,
    code: '03',
    label: 'ELECTRICAL & POWER',
    note: 'Grid distribution, substation controls & industrial commissioning',
  },
  {
    x: 290,
    y: 130,
    w: 158,
    code: '04',
    label: 'QA/QC & SUPERVISION',
    note: 'Accredited inspection protocols, compliance & quality leadership',
  },
];

/**
 * Hero Architectural Engineering Elevation & UV Light Sweep
 * Pure inline architectural vector diagram + 1600ms UV sweep + readiness stepping + 3000ms watchdog.
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
  const [activeTrackCode, setActiveTrackCode] = useState<string>('01');
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
      onScaleChange?.('OPEN', true);
      return;
    }

    setExposed(false);
    setSweeping(true);
    setRedMarkDrawn(false);
    onScaleChange?.('2026', false);

    timersRef.current.push(
      window.setTimeout(() => {
        onScaleChange?.('ACTIVE', false);
      }, 650),
      window.setTimeout(() => {
        onScaleChange?.('OPEN', true);
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
        onScaleChange?.('OPEN', true);
      }, 3000)
    );
  };

  useEffect(() => {
    runExposureCycle();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inspectedTrack =
    HERO_TRACKS.find((t) => t.code === activeTrackCode) || HERO_TRACKS[0];

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
        <span>MIHORA ENGINEERING &amp; ACADEMIC DIVISIONS</span>
        <button
          type="button"
          onClick={runExposureCycle}
          className="pencil-link text-[11px] font-mono text-[var(--exposure)] hover:text-white cursor-pointer shrink-0"
        >
          Refresh View
        </button>
      </div>

      {/* Inline Vector Structural & Engineering Division Elevation */}
      <div
        className={`transition-[opacity,filter] duration-700 ${
          exposed ? 'opacity-100 blur-0' : 'opacity-45 blur-[2px]'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.2, 1)' }}
      >
        <svg
          role="img"
          aria-label="MIHORA engineering structural frame highlighting four active engineering career tracks"
          viewBox="0 0 560 280"
          className="w-full h-auto block"
        >
          {/* Outer Architectural Frame */}
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
            <line x1="280" y1="66" x2="280" y2="196" strokeOpacity="0.45" />
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

          {/* Interactive 4 Career Discipline Bays */}
          <g>
            {HERO_TRACKS.map((track) => {
              const isSelected = activeTrackCode === track.code;
              return (
                <g
                  key={track.code}
                  onMouseEnter={() => setActiveTrackCode(track.code)}
                  onClick={() => setActiveTrackCode(track.code)}
                  className="cursor-pointer"
                >
                  <rect
                    x={track.x}
                    y={track.y}
                    width={track.w}
                    height="36"
                    fill={isSelected ? '#F4F7F5' : '#1B3A5C'}
                    stroke="#F4F7F5"
                    strokeOpacity={isSelected ? 1 : 0.72}
                    strokeWidth={isSelected ? '1.6' : '1.2'}
                    className="transition-colors duration-150"
                  />
                  <text
                    x={track.x + 10}
                    y={track.y + 14}
                    fill={isSelected ? '#0F2740' : '#B9CCE0'}
                    fontSize="8.5"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    TRACK {track.code}
                  </text>
                  <text
                    x={track.x + 10}
                    y={track.y + 27}
                    fill={isSelected ? '#0F2740' : '#F4F7F5'}
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {track.label}
                  </text>
                </g>
              );
            })}

            {/* Foundation Placement Bar */}
            <rect
              x="146"
              y="180"
              width="268"
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
              MIHORA GLOBAL TALENT &amp; PLACEMENT
            </text>
          </g>

          {/* Witness Ticks & Exterior Span Line */}
          <g stroke="#B9CCE0" strokeWidth="1" fill="none">
            <line x1="96" y1="240" x2="96" y2="262" />
            <line x1="464" y1="240" x2="464" y2="262" />
            <line x1="96" y1="252" x2="464" y2="252" />
            <polygon points="96,252 104,249 104,255" fill="#B9CCE0" />
            <polygon points="464,252 456,249 456,255" fill="#B9CCE0" />
          </g>
          <rect x="206" y="242" width="148" height="18" fill="#0F2740" />
          <text
            x="280"
            y="255"
            textAnchor="middle"
            fill="#F4F7F5"
            fontSize="10.5"
            fontWeight="600"
            fontFamily="IBM Plex Mono, monospace"
          >
            4 TRACKS · OPEN
          </text>

          {/* Single Red Checker's Pencil Circle Around Total Datum */}
          {redMarkDrawn && (
            <path
              d="M210 251 C210 240, 246 237, 282 238 C326 239, 353 243, 351 253 C348 263, 306 266, 272 265 C235 264, 208 259, 211 249"
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

      {/* Live Inspected Discipline Annotation Footer */}
      <div className="mt-3 pt-2.5 border-t border-[rgba(185,204,224,0.2)] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <span className="text-[var(--exposure)] font-semibold">
          TRACK {inspectedTrack.code} · {inspectedTrack.label}
        </span>
        <span className="text-[var(--chalk)]">{inspectedTrack.note}</span>
      </div>
    </div>
  );
};

/**
 * Interactive Site & Commute Triangulation Model (Sheet MHR-02)
 * Merges bespoke isometric corridor diorama render with live calibrated radius ring overlay.
 */
export const CommuteCalibrationDiagram: React.FC = () => {
  const [selectedRadius, setSelectedRadius] = useState<'25' | '50' | 'relocate'>('25');

  const config = {
    '25': {
      label: '25 km · 45 min Local Site Threshold',
      circleRadius: 46,
      housingNote: 'Local Daily Commute — Housing Not Required',
      metric: '25 km MAX',
    },
    '50': {
      label: '50 km+ · Extended Regional Corridor',
      circleRadius: 72,
      housingNote: 'Accommodation Triggered Beyond 50 km',
      metric: '50 km LIMIT',
    },
    relocate: {
      label: 'Multi-Region · Project Site Deployment',
      circleRadius: 96,
      housingNote: 'Full Relocation & Company Transport Calibration',
      metric: 'MULTI-REGION',
    },
  }[selectedRadius];

  return (
    <div className="border border-[rgba(244,247,245,0.28)] bg-[var(--edge)]/85 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[rgba(185,204,224,0.2)]">
        <span className="text-[11px] font-mono text-[var(--chalk)] tracking-wider">
          REGIONAL MOBILITY DIORAMA
        </span>
        <span className="text-[11px] font-mono font-semibold text-[var(--exposure)] tabular-nums">
          {config.metric}
        </span>
      </div>

      <ArchitecturalFrame
        src={mobilityCorridorImg}
        alt={`Architectural transit corridor scale model illustrating ${config.label}`}
        className="h-[270px] sm:h-[310px] border-0"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B2E]/90 via-[#0A1B2E]/20 to-transparent pointer-events-none" />

        {/* Live Calibrated Vector Radius Overlay Merged Over Model */}
        <svg
          aria-hidden="true"
          viewBox="0 0 360 220"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <line
            x1="36"
            y1="110"
            x2="324"
            y2="110"
            stroke="#F4F7F5"
            strokeOpacity="0.18"
            strokeDasharray="3 4"
          />
          <line
            x1="180"
            y1="16"
            x2="180"
            y2="204"
            stroke="#F4F7F5"
            strokeOpacity="0.18"
            strokeDasharray="3 4"
          />

          <circle
            cx="180"
            cy="110"
            r={config.circleRadius}
            fill="rgba(10, 27, 46, 0.22)"
            stroke="#F4F7F5"
            strokeOpacity="0.88"
            strokeWidth="1.6"
            className="transition-all duration-300"
          />
          <circle
            cx="180"
            cy="110"
            r={config.circleRadius * 0.52}
            fill="none"
            stroke="#B9CCE0"
            strokeOpacity="0.45"
            strokeDasharray="4 3"
            className="transition-all duration-300"
          />

          <circle cx="180" cy="110" r="4.5" fill="#F4F7F5" />
          <line
            x1="180"
            y1="110"
            x2={180 + config.circleRadius * 0.78}
            y2={110 - config.circleRadius * 0.52}
            stroke="#F4F7F5"
            strokeWidth="1.4"
          />
          <circle
            cx={180 + config.circleRadius * 0.78}
            cy={110 - config.circleRadius * 0.52}
            r="6"
            fill="#C0392B"
            stroke="#F4F7F5"
            strokeWidth="1.2"
          />
        </svg>

        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-[11px] font-mono pointer-events-none">
          <span className="text-[var(--exposure)] font-semibold">{config.label}</span>
        </div>
      </ArchitecturalFrame>

      <div className="p-4 space-y-3">
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
              className={`py-2.5 px-2 text-[11px] font-mono rounded-[var(--radius-xs)] border transition-colors cursor-pointer ${
                selectedRadius === btn.id
                  ? 'bg-[var(--exposure)] text-[var(--edge)] border-[var(--exposure)] font-semibold'
                  : 'bg-[var(--prussian)] text-[var(--chalk)] border-[rgba(185,204,224,0.28)] hover:border-[var(--exposure)]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <p className="text-xs font-mono text-[var(--chalk)]">{config.housingNote}</p>
      </div>
    </div>
  );
};

/**
 * Upscaled Structural Cutaway & Competency Pillar Model (Sheet MHR-03)
 */
export const DossierLayerDiagram: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const pillars = [
    { code: '01', name: 'Academic Credentials', metric: 'Accredited Degrees' },
    { code: '02', name: 'Engineering Leadership', metric: 'Project Delivery' },
    { code: '03', name: 'Domain Proficiency', metric: 'Verified Tooling' },
    { code: '04', name: 'Regional Mobility Fit', metric: 'Site Calibration' },
    { code: '05', name: 'Executive Portfolio', metric: 'A4 Dossier Ready' },
  ];

  const current = pillars[activeIndex] || pillars[0];

  return (
    <div className="border border-[rgba(244,247,245,0.28)] bg-[var(--edge)]/85 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(185,204,224,0.2)] text-[11px] font-mono text-[var(--chalk)]">
        <span className="tracking-wider">TECHNICAL EVALUATION ASSEMBLY</span>
        <span className="text-[var(--exposure)] font-semibold tabular-nums">
          PILLAR 0{Math.min(pillars.length, activeIndex + 1)} / 05
        </span>
      </div>

      <ArchitecturalFrame
        src={structuralElevationImg}
        alt="Detailed architectural and electrical substation cutaway scale model representing technical engineering verification"
        className="h-[250px] sm:h-[290px] border-0"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B2E]/95 via-[#0A1B2E]/25 to-transparent pointer-events-none" />
        <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3 font-mono">
          <div>
            <div className="text-[10px] text-[var(--chalk)] tracking-wider">
              ACTIVE STANDARD · {current.code}
            </div>
            <div className="font-display text-base sm:text-lg font-bold text-[var(--exposure)]">
              {current.name}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[var(--status-verified)] shrink-0">
            {current.metric}
          </span>
        </div>
      </ArchitecturalFrame>

      {/* Synchronized Stepped Elevation Indicator */}
      <div className="p-4 grid grid-cols-5 gap-1.5 bg-[var(--edge)]">
        {pillars.map((p, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div key={p.code} className="space-y-1.5">
              <div
                className={`h-1.5 transition-colors duration-200 ${
                  isActive
                    ? 'bg-[var(--exposure)]'
                    : idx < activeIndex
                    ? 'bg-[var(--status-verified)]/75'
                    : 'bg-[var(--prussian-raise)]'
                }`}
              />
              <div
                className={`text-[10px] font-mono text-center tabular-nums ${
                  isActive ? 'text-[var(--exposure)] font-semibold' : 'text-[var(--chalk-dim)]'
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
