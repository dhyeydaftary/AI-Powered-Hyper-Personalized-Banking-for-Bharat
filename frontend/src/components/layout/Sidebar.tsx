import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './nav-items';
import { useTranslation } from '@/i18n';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const t = useTranslation();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-canvas px-sm py-lg lg:flex">
      <div className="mb-lg flex items-center gap-2 px-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-sm font-bold text-on-primary">
          B
        </div>
        <span className="text-sm font-semibold text-ink">Bharat Bank</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-sm px-sm py-2.5 text-sm font-medium text-body transition-colors',
                  'hover:bg-surface-soft hover:text-ink',
                  isActive && 'bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary'
                )
              }
            >
              <Icon size={18} />
              {t.nav[item.labelKey]}
            </NavLink>
          );
        })}
      </nav>

      <p className="px-sm text-xs leading-relaxed text-muted-soft">
        Secure banking &middot; Privacy &middot; Support
      </p>
    </aside>
  );
}
