import React, { useEffect, useState } from 'react';
import { Sidebar, NavItemKey } from './components/Shell/Sidebar';
import { Header } from './components/Shell/Header';
import { OverviewPage } from './pages/OverviewPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { SuppressedPage } from './pages/SuppressedPage';
import { ConsentPage } from './pages/ConsentPage';
import { AuditPage } from './pages/AuditPage';
import { PolicyPage } from './pages/PolicyPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { Customer, Decision, SystemAnalytics } from './types';
import { api } from './api/client';
import './styles/index.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItemKey>('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([api.getCustomers(), api.getAnalytics()]);

      if (cRes.data) {
        setCustomers(cRes.data);
        // Load decisions for each customer
        const decMap: Record<string, Decision> = {};
        for (const c of cRes.data) {
          const dRes = await api.getDecision(c.customer_id);
          if (dRes.data) decMap[c.customer_id] = dRes.data;
        }
        setDecisions(decMap);
      }

      if (aRes.data) {
        setAnalytics(aRes.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toLowerCase();
    const match = customers.find(
      (c) => c.customer_id.toLowerCase() === query || c.name.toLowerCase().includes(query)
    );
    if (match) {
      setSelectedCustomerId(match.customer_id);
    } else {
      setActiveTab('customers');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedCustomerId(null);
        }}
        reviewCount={analytics?.review_queue_count || 3}
        noActionCount={analytics?.decision_counts.NO_ACTION || 2}
      />

      <div className="main-container">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        <main className="page-content">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              Connecting to Bharat Bank Decision Intelligence API...
            </div>
          ) : selectedCustomerId ? (
            <CustomerDetailPage
              customerId={selectedCustomerId}
              onBack={() => setSelectedCustomerId(null)}
            />
          ) : (
            <>
              {activeTab === 'overview' && analytics && (
                <OverviewPage
                  customers={customers}
                  decisions={decisions}
                  analytics={analytics}
                  onSelectCustomer={handleSelectCustomer}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersPage
                  customers={customers}
                  decisions={decisions}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {activeTab === 'review' && (
                <ReviewQueuePage
                  customers={customers}
                  decisions={decisions}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {activeTab === 'suppressed' && (
                <SuppressedPage
                  customers={customers}
                  decisions={decisions}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {activeTab === 'consent' && (
                <ConsentPage
                  customers={customers}
                  decisions={decisions}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {activeTab === 'audit' && (
                <AuditPage onSelectCustomer={handleSelectCustomer} />
              )}

              {activeTab === 'policy' && <PolicyPage />}

              {activeTab === 'analytics' && analytics && (
                <AnalyticsPage analytics={analytics} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
