import { DEMO_CUSTOMERS, useDemoCustomer, type DemoCustomerId } from '@/state/demo-customer-context';
import { Select } from '@/components/ui/Select';
import { useTranslation } from '@/i18n';

/**
 * A prototype convenience (Section 10) — not a real identity mechanism.
 * Lets a reviewer switch between the two seeded customers to see the
 * decision surface, confidence, and available data change accordingly:
 * C1001 demonstrates RECOMMEND / INTERVENE / VERIFY across months, C1002
 * demonstrates NO_ACTION under a thin file.
 */
export function DemoCustomerSwitcher() {
  const { customerId, setCustomerId } = useDemoCustomer();
  const t = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium uppercase tracking-wide text-muted sm:inline">
        {t.header.demoCustomer}
      </span>
      <Select
        value={customerId}
        onValueChange={(value) => setCustomerId(value as DemoCustomerId)}
        ariaLabel={t.header.demoCustomer}
        options={DEMO_CUSTOMERS.map((c) => ({ value: c.id, label: `${c.name} (${c.id})` }))}
        className="h-9 text-xs"
      />
    </div>
  );
}
