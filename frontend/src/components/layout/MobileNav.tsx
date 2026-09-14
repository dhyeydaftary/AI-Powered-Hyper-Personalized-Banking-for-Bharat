import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Receipt, Landmark, Sparkles, MoreHorizontal, Wallet, Calculator, ShieldCheck, X } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cn } from '@/utils/cn';

const PRIMARY = [
  { to: '/overview', labelKey: 'overview' as const, icon: LayoutGrid },
  { to: '/transactions', labelKey: 'activity' as const, icon: Receipt },
  { to: '/loans', labelKey: 'loans' as const, icon: Landmark },
  { to: '/copilot', labelKey: 'copilot' as const, icon: Sparkles },
];

const MORE_ITEMS = [
  { to: '/money', labelKey: 'money' as const, icon: Wallet },
  { to: '/what-if', labelKey: 'whatIf' as const, icon: Calculator },
  { to: '/privacy', labelKey: 'privacy' as const, icon: ShieldCheck },
];

/** Uber-style bottom tab bar: single-focus screens, large touch targets, a
 * bottom sheet for secondary destinations rather than crowding every route
 * into the bar itself. */
export function MobileNav() {
  const t = useTranslation();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = MORE_ITEMS.some((item) => item.to === location.pathname);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-hairline bg-canvas lg:hidden"
        aria-label="Primary"
      >
        {PRIMARY.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium text-muted',
                  isActive && 'text-primary'
                )
              }
            >
              <Icon size={20} />
              {t.nav[item.labelKey]}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium text-muted',
            isMoreActive && 'text-primary'
          )}
          aria-label="More"
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-surface-dark/40" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-xl bg-canvas p-lg pb-xl animate-slide-up">
            <div className="mb-base flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">More</span>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close" className="text-muted">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-sm py-3 text-sm font-medium text-body',
                        isActive && 'bg-primary-soft text-primary'
                      )
                    }
                  >
                    <Icon size={18} />
                    {t.nav[item.labelKey]}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
