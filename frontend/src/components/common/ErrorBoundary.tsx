import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Catches render-time errors so one broken screen doesn't blank the app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-base text-center">
          <AlertTriangle size={28} className="text-down" aria-hidden />
          <p className="text-base font-semibold text-ink">Something went wrong</p>
          <p className="max-w-sm text-sm text-muted">
            This page ran into an unexpected problem. Reloading usually fixes it.
          </p>
          <Button onClick={() => window.location.reload()} size="sm">
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
