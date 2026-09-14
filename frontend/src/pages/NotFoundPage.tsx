import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-lg font-semibold text-ink">Page not found</p>
      <p className="text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link
        to="/overview"
        className="mt-1 inline-flex h-11 items-center justify-center rounded-pill bg-primary px-base text-sm font-semibold text-on-primary hover:bg-primary-active"
      >
        Back to overview
      </Link>
    </div>
  );
}
