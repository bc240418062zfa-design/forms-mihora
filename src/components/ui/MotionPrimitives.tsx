import React, { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../../utils/useScrollProgress';

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

/**
 * Theme 064 §6.3 Sliding Sheet Arrival:
 * - Sections slide onto the light table from the vault drawer (~32px horizontal settle).
 * - Content is NEVER stranded invisible: settles via IntersectionObserver plus a
 *   strict 450ms failsafe timeout, and renders immediately under prefers-reduced-motion.
 */
export const SheetArrival: React.FC<RevealProps> = ({
  children,
  delayMs = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    const failsafe = window.setTimeout(() => setVisible(true), 450 + delayMs);

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return () => window.clearTimeout(failsafe);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            window.clearTimeout(failsafe);
          }
        }
      },
      { threshold: 0.04, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delayMs, visible]);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: visible ? `${delayMs}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 0.9, 0.28, 1)',
      }}
      className={`transition-[opacity,transform] duration-500 will-change-transform ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-7'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Reveal = SheetArrival;

interface BlankSheetLoaderProps {
  label?: string;
  compact?: boolean;
  lightPaper?: boolean;
  className?: string;
}

/**
 * Theme 064 §6.15 Blank-Sheet Shimmer Loader:
 * Replaces generic circular spinners with a ruled cyanotype sheet swept by a UV light band.
 */
export const BlankSheetLoader: React.FC<BlankSheetLoaderProps> = ({
  label = 'LOADING RECORD...',
  compact = false,
  lightPaper = false,
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden border ${
        lightPaper
          ? 'bg-[var(--exposure)] border-[var(--rule-paper)] text-[var(--edge)]'
          : 'cyanotype-sheet border-[var(--rule-hairline)] text-[var(--exposure)]'
      } ${compact ? 'p-6' : 'p-8 sm:p-10'} ${className}`}
    >
      {/* Sweeping UV Shimmer Band */}
      <div
        aria-hidden="true"
        className="blank-sheet-shimmer pointer-events-none absolute inset-x-0 top-0 h-28 z-10"
        style={{
          background: lightPaper
            ? 'linear-gradient(to bottom, transparent, rgba(27,58,92,0.08), transparent)'
            : 'linear-gradient(to bottom, transparent, rgba(244,247,245,0.12), transparent)',
        }}
      />

      <div className="relative z-0 space-y-3">
        <div
          className={`text-[11px] font-mono tracking-wider font-semibold ${
            lightPaper ? 'text-[var(--prussian)]' : 'text-[var(--chalk)]'
          }`}
        >
          {label}
        </div>
        <div
          className={`h-3 w-3/4 rounded-[var(--radius-xs)] ${
            lightPaper ? 'bg-[rgba(15,39,64,0.1)]' : 'bg-[var(--prussian-raise)]/80'
          }`}
        />
        <div
          className={`h-2.5 w-1/2 rounded-[var(--radius-xs)] ${
            lightPaper ? 'bg-[rgba(15,39,64,0.07)]' : 'bg-[var(--edge)]/90'
          }`}
        />
        {!compact && (
          <div className="pt-3 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((slot) => (
              <div
                key={slot}
                className={`h-12 border rounded-[var(--radius-xs)] ${
                  lightPaper
                    ? 'border-[var(--rule-paper)] bg-[rgba(15,39,64,0.04)]'
                    : 'border-[var(--rule-hairline)] bg-[var(--edge)]/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix = '',
  durationMs = 520,
  className = '',
}) => {
  const [display, setDisplay] = useState<number>(value);
  const prevRef = useRef<number>(value);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplay(value);
      prevRef.current = value;
      return;
    }

    const startVal = prevRef.current === value ? 0 : prevRef.current;
    const startTime = performance.now();
    let frameId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(startVal + (value - startVal) * eased);
      setDisplay(next);
      if (t < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        prevRef.current = value;
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, durationMs]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {display}
      {suffix}
    </span>
  );
};

export const ScrollProgressBar: React.FC = () => {
  const { progress } = useScrollProgress();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1.5px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-[var(--exposure)] origin-left transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};
