import { LayoutGrid, Wallet, Receipt, Landmark, Sparkles, Calculator, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  labelKey: 'overview' | 'money' | 'activity' | 'loans' | 'copilot' | 'whatIf' | 'privacy';
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/overview', labelKey: 'overview', icon: LayoutGrid },
  { to: '/money', labelKey: 'money', icon: Wallet },
  { to: '/transactions', labelKey: 'activity', icon: Receipt },
  { to: '/loans', labelKey: 'loans', icon: Landmark },
  { to: '/copilot', labelKey: 'copilot', icon: Sparkles },
  { to: '/what-if', labelKey: 'whatIf', icon: Calculator },
  { to: '/privacy', labelKey: 'privacy', icon: ShieldCheck },
];
