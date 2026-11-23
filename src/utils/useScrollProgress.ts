import { useEffect, useState } from 'react';

export interface ScrollState {
  progress: number; // 0 to 1 normalized document scroll
  scrollY: number;  // lerped scrollY in px
  isScrolled: boolean;
}

const listeners = new Set<(state: ScrollState) => void>();
let rafId: number | null = null;
let targetY = 0;
let currentY = 0;
let started = false;
let reducedMotion = false;

function computeState(y: number): ScrollState {
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const progress = Math.min(1, Math.max(0, y / maxScroll));
  return {
    progress,
    scrollY: y,
    isScrolled: y > 12,
  };
}

function tick() {
  const diff = targetY - currentY;
  if (Math.abs(diff) < 0.25) {
    currentY = targetY;
  } else {
    currentY += diff * 0.14;
  }

  const state = computeState(currentY);
  listeners.forEach((cb) => cb(state));

  if (Math.abs(targetY - currentY) >= 0.25) {
    rafId = window.requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
}

function onScrollOrResize() {
  targetY = window.scrollY || 0;
  if (reducedMotion) {
    currentY = targetY;
    const state = computeState(currentY);
    listeners.forEach((cb) => cb(state));
    return;
  }
  if (rafId === null) {
    rafId = window.requestAnimationFrame(tick);
  }
}

function ensureStarted() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion = mq.matches;
  mq.addEventListener?.('change', (e) => {
    reducedMotion = e.matches;
    onScrollOrResize();
  });

  targetY = window.scrollY || 0;
  currentY = targetY;
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
}

export function useScrollProgress(): ScrollState {
  const [state, setState] = useState<ScrollState>(() => {
    if (typeof window === 'undefined') {
      return { progress: 0, scrollY: 0, isScrolled: false };
    }
    return computeState(window.scrollY || 0);
  });

  useEffect(() => {
    ensureStarted();
    listeners.add(setState);
    setState(computeState(window.scrollY || 0));
    return () => {
      listeners.delete(setState);
      if (listeners.size === 0 && rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, []);

  return state;
}
