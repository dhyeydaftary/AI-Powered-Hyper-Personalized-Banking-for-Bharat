import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewPage } from '@/pages/OverviewPage';
import { MoneyPage } from '@/pages/MoneyPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { LoansPage } from '@/pages/LoansPage';
import { CopilotPage } from '@/pages/CopilotPage';
import { WhatIfPage } from '@/pages/WhatIfPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/money" element={<MoneyPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/copilot" element={<CopilotPage />} />
        <Route path="/what-if" element={<WhatIfPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
