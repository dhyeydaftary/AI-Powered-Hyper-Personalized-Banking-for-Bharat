import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { DemoCustomerProvider } from '@/state/demo-customer-context';
import { ToastProvider } from '@/state/toast-context';
import { TooltipProvider } from '@/components/ui/Tooltip';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <DemoCustomerProvider>
            <TooltipProvider>
              <ToastProvider>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
              </ToastProvider>
            </TooltipProvider>
          </DemoCustomerProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper }), queryClient };
}

type RouteHandler = (url: URL, init?: RequestInit) => unknown | { status: number; body: unknown };

/**
 * Mocks global fetch against a map of path-suffix -> handler, matching the
 * standard { success, data, error } / paginated envelope the real backend
 * returns, so hooks and pages exercise the exact same unwrapping logic they
 * use against the live API.
 */
export function mockFetch(handlers: Record<string, RouteHandler | unknown>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input.toString());
    const match = Object.entries(handlers).find(([path]) => url.pathname.endsWith(path));

    if (!match) {
      return jsonResponse(404, { success: false, data: null, error: { code: 'NOT_FOUND', message: 'No mock for ' + url.pathname } });
    }

    const [, handler] = match;
    const result = typeof handler === 'function' ? (handler as RouteHandler)(url, init) : handler;

    if (result && typeof result === 'object' && 'status' in result && 'body' in result) {
      const { status, body } = result as { status: number; body: unknown };
      return jsonResponse(status, body);
    }

    return jsonResponse(200, result);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

export function successEnvelope<T>(data: T) {
  return { success: true, data, error: null };
}

export function paginatedEnvelope<T>(data: T[], page = 1, limit = 20, total = data.length) {
  return { success: true, data, pagination: { page, limit, total }, error: null };
}

export function errorEnvelope(code: string, message: string) {
  return { success: false, data: null, error: { code, message } };
}
