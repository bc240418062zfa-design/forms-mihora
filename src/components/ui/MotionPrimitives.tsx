import React, { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../../utils/useScrollProgress';

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

/**
 * Clean vertical architectural reveal with 450ms visibility failsafe
 * and strict prefers-reduced-motion support.
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
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`transition-[opacity,transform] duration-500 will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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

export const BlankSheetLoader: React.FC<BlankSheetLoaderProps> = ({
  label = 'Loading profile...',
  compact = false,
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden bg-white border border-[#E4E2DA] rounded-2xl ${
        compact ? 'p-6' : 'p-8 sm:p-10'
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className="skeleton-shimmer pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-slate-100/80 to-transparent z-10"
      />

      <div className="relative z-0 space-y-3">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="h-3.5 w-3/4 rounded-md bg-slate-200/80" />
        <div className="h-3 w-1/2 rounded-md bg-slate-100" />
        {!compact && (
          <div className="pt-3 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="h-14 border border-slate-200 rounded-lg bg-slate-50"
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
    <span className={`tabular-nums ${className}`}>
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
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-[#143A7B] origin-left transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};
