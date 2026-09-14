import { HelpCircle, Bell, UserRound } from 'lucide-react';
import { DemoCustomerSwitcher } from '@/components/customer/DemoCustomerSwitcher';
import { useLanguage, useTranslation } from '@/i18n';
import { Select } from '@/components/ui/Select';

export function Header() {
  const t = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-canvas px-base sm:px-lg">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-xs font-bold text-on-primary">
          B
        </div>
        <span className="text-sm font-semibold text-ink">Bharat Bank</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <DemoCustomerSwitcher />

        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as 'en' | 'hi')}
          ariaLabel={t.language.label}
          options={[
            { value: 'en', label: t.language.en },
            { value: 'hi', label: t.language.hi },
          ]}
          className="h-9 w-[92px] text-xs"
        />

        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-full text-body hover:bg-surface-soft sm:flex"
          aria-label={t.header.notifications}
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-full text-body hover:bg-surface-soft sm:flex"
          aria-label={t.header.help}
        >
          <HelpCircle size={18} />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-strong text-body"
          aria-label={t.header.profile}
        >
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}
