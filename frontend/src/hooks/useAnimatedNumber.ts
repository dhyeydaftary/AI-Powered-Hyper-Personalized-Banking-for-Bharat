import { useEffect, useRef, useState } from 'react';

/**
 * Animates a numeric value toward `target` over `durationMs` using an
 * ease-out curve (no overshoot — matches the apple-design guidance to
 * default UI transitions to a critically-damped feel), so a before/after
 * comparison (e.g. the What-if simulator's current vs. hypothetical
 * metrics) reads as a continuous change rather than an instant snap.
 *
 * Falls back to jumping straight to `target` under prefers-reduced-motion,
 * and on the very first value seen (nothing to animate *from* yet).
 */
export function useAnimatedNumber(target: number | null, reducedMotion: boolean, durationMs = 500): number | null {
  const [display, setDisplay] = useState<number | null>(target);
  const fromRef = useRef<number | null>(target);

  useEffect(() => {
    if (target === null) {
      fromRef.current = null;
      setDisplay(null);
      return;
    }

    const from = fromRef.current;
    if (reducedMotion || from === null) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const startTime = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reducedMotion, durationMs]);

  return display;
}
