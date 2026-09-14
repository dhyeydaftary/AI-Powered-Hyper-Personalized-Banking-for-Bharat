import { useEffect, useState } from 'react';

/** jsdom (used in tests) does not implement `matchMedia` — guard against
 * its absence the same way the environment already stubs ResizeObserver,
 * so this hook degrades to "motion is fine" instead of throwing. */
function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/**
 * Tracks the `prefers-reduced-motion` media query so animated components
 * (charts, transitions) can fall back to a simple cross-fade instead of a
 * spring/draw-in animation, per the apple-design motion guidance.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => supportsMatchMedia() && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!supportsMatchMedia()) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return reduced;
}
