import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createElement } from 'react';
import en, { type Dictionary } from './en';
import hi from './hi';
import type { PreferredLanguage } from '@/types';

const dictionaries: Record<PreferredLanguage, Dictionary> = { en, hi };

const STORAGE_KEY = 'bharat-bank.language';

function readStoredLanguage(): PreferredLanguage {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'hi' ? 'hi' : 'en';
}

interface LanguageContextValue {
  language: PreferredLanguage;
  setLanguage: (language: PreferredLanguage) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<PreferredLanguage>(readStoredLanguage);

  const setLanguage = useCallback((next: PreferredLanguage) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private browsing) — language
      // preference simply won't persist across reloads in that case.
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language, setLanguage]
  );

  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

/** Shorthand for the current dictionary — `const t = useTranslation(); t.nav.overview` */
export function useTranslation(): Dictionary {
  return useLanguage().t;
}
