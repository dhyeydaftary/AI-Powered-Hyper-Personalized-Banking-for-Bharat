import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { LanguageProvider } from '@/i18n';
import { DemoCustomerProvider } from '@/state/demo-customer-context';
import { ToastProvider } from '@/state/toast-context';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ApiClientError } from '@/api/client';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404s (e.g. a customer that doesn't exist) — only
        // retry transient/network failures, and only a couple of times.
        if (error instanceof ApiClientError && error.status === 404) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <DemoCustomerProvider>
            <TooltipProvider>
              <ToastProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </ToastProvider>
            </TooltipProvider>
          </DemoCustomerProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
