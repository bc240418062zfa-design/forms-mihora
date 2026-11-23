import React, { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../../utils/useScrollProgress';

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

/**
 * Calibrated instrument reveal:
 * - Content is NEVER stranded invisible: settles cleanly via IntersectionObserver
 *   plus a strict 450ms failsafe timeout, and renders immediately if reduced-motion is set.
 * - Uses compositor-only transform + opacity.
 */
export const Reveal: React.FC<RevealProps> = ({ children, delayMs = 0, className = '' }) => {
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
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
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
      className={`transition-[opacity,transform] duration-300 will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {children}
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
  durationMs = 500,
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
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-[var(--accent-primary)] origin-left transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};
