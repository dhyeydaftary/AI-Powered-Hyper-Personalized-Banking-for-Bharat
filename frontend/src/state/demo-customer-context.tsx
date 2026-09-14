import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * The prototype's "identity" mechanism (Section 10 / 15). There is no
 * authentication in this backend — auth middleware is an explicit
 * passthrough — so the only way to demonstrate all four decision states is
 * a visible demo customer switcher. This context is the single source of
 * truth for which customer is active; do not scatter "C1001" literals
 * across components.
 */

export const DEMO_CUSTOMERS = [
  { id: 'C1001', name: 'Aarav Patel', blurb: 'Active home loan, 4 months of history' },
  { id: 'C1002', name: 'Meera Sharma', blurb: 'Thin file, no loan' },
] as const;

export type DemoCustomerId = (typeof DEMO_CUSTOMERS)[number]['id'];

export const DEFAULT_DEMO_CUSTOMER_ID: DemoCustomerId = 'C1001';

const STORAGE_KEY = 'bharat-bank.demo-customer-id';

function readStoredCustomerId(): DemoCustomerId {
  if (typeof window === 'undefined') return DEFAULT_DEMO_CUSTOMER_ID;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'C1001' || stored === 'C1002' ? stored : DEFAULT_DEMO_CUSTOMER_ID;
}

interface DemoCustomerContextValue {
  customerId: DemoCustomerId;
  setCustomerId: (id: DemoCustomerId) => void;
}

const DemoCustomerContext = createContext<DemoCustomerContextValue | null>(null);

export function DemoCustomerProvider({ children }: { children: ReactNode }) {
  const [customerId, setCustomerIdState] = useState<DemoCustomerId>(readStoredCustomerId);

  const setCustomerId = useCallback((id: DemoCustomerId) => {
    setCustomerIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // per-viewer convenience only; safe to ignore if storage is unavailable
    }
  }, []);

  const value = useMemo(() => ({ customerId, setCustomerId }), [customerId, setCustomerId]);

  return <DemoCustomerContext.Provider value={value}>{children}</DemoCustomerContext.Provider>;
}

export function useDemoCustomer(): DemoCustomerContextValue {
  const ctx = useContext(DemoCustomerContext);
  if (!ctx) throw new Error('useDemoCustomer must be used within a DemoCustomerProvider');
  return ctx;
}
