import React, { useEffect, useState } from 'react';
import { Customer, Decision, Loan, FinancialHealth, AuditEntry } from '../types';
import { api } from '../api/client';
import { DecisionInspector } from '../components/Decision/DecisionInspector';
import { formatCurrency, formatPercent, formatDateTime } from '../utils/formatters';
import { ArrowLeft, CreditCard, Lock, History, RefreshCw } from 'lucide-react';

interface Props {
  customerId: string;
  onBack: () => void;
}

export const CustomerDetailPage: React.FC<Props> = ({ customerId, onBack }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [cRes, dRes, lRes, fhRes, aRes] = await Promise.all([
        api.getCustomer(customerId),
        api.getDecision(customerId),
        api.getLoans(customerId),
        api.getFinancialHealth(customerId),
        api.getAuditLogs(customerId),
      ]);

      if (cRes.data) setCustomer(cRes.data);
      if (dRes.data) setDecision(dRes.data);
      if (lRes.data) setLoans(lRes.data);
      if (fhRes.data) setFinancialHealth(fhRes.data);
      if (aRes.data) setAuditLogs(aRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setReanalyzing(true);
    try {
      const res = await api.runAnalysis(customerId);
      if (res.data?.decision) {
        setDecision(res.data.decision);
        // Refresh audit log after analysis
        const aRes = await api.getAuditLogs(customerId);
        if (aRes.data) setAuditLogs(aRes.data);
      }
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading customer governance context...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Customer Not Found</div>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: 16 }}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Header */}
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          Back to Directory
        </button>
      </div>

      {/* Customer Header Bar */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'var(--brand-navy)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {customer.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{customer.name}</h1>
                <span className="mono-id">{customer.customer_id}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                Age: {customer.age} | Preferred Language: <strong style={{ textTransform: 'uppercase' }}>{customer.preferred_language}</strong> | Monthly Income: <strong>{formatCurrency(customer.monthly_income)}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={handleRunAnalysis} disabled={reanalyzing}>
              <RefreshCw size={12} className={reanalyzing ? 'spin' : ''} />
              {reanalyzing ? 'Running Analysis...' : 'Re-Run Intelligence Engine'}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Left Column: Decision Inspector */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            Latest AI Decision & Governance Context
          </h2>
          {decision ? (
            <DecisionInspector decision={decision} />
          ) : (
            <div className="card">No decision record available.</div>
          )}
        </div>

        {/* Right Column: Financial Snapshot & Active Loans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Financial Snapshot */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title">
              <span>Financial Position & Ratios</span>
              {financialHealth && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  History: {financialHealth.history_months} month(s)
                </span>
              )}
            </div>

            {financialHealth ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">EMI / Income Ratio</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: financialHealth.emi_to_income_ratio > 0.35 ? 'var(--status-intervene)' : 'var(--text-primary)' }}>
                    {formatPercent(financialHealth.emi_to_income_ratio)}
                  </div>
                  <div className="stat-subtext">Threshold: &le; 35%</div>
                </div>

                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Savings Rate</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: financialHealth.savings_rate < 0.10 ? 'var(--status-intervene)' : 'var(--status-recommend)' }}>
                    {formatPercent(financialHealth.savings_rate)}
                  </div>
                  <div className="stat-subtext">Threshold: &ge; 10%</div>
                </div>

                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Expense / Income</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {formatPercent(financialHealth.expense_to_income_ratio)}
                  </div>
                </div>

                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Balance Trend</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: financialHealth.balance_trend === 'DETERIORATING' ? 'var(--status-intervene)' : 'var(--text-primary)' }}>
                    {financialHealth.balance_trend}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No financial health records found.</div>
            )}
          </div>

          {/* Active Loans Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={16} />
                Active Loans & Obligations ({loans.length})
              </span>
            </div>

            {loans.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Customer has no active loan liabilities.</div>
            ) : (
              loans.map((loan) => (
                <div key={loan.loan_id} style={{ padding: 12, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Loan ID: {loan.loan_id}</span>
                    <span style={{ color: 'var(--brand-accent)' }}>Monthly EMI: {formatCurrency(loan.monthly_emi)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Principal: {formatCurrency(loan.principal)} | Outstanding: {formatCurrency(loan.outstanding)} | Rate: {loan.annual_interest_rate}% | Remaining: {loan.remaining_months} mos
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Consent Scope & Authorization Section */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16} color="var(--status-recommend)" />
            Customer Data Authorization & Consent Scope
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: customer.consent.behavioral_trend_analysis ? '#f0fdf4' : '#fef2f2' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: customer.consent.behavioral_trend_analysis ? '#166534' : '#991b1b' }}>
              Behavioral Trend Analysis
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Status: <strong>{customer.consent.behavioral_trend_analysis ? 'AUTHORIZED' : 'RESTRICTED / DISABLED'}</strong>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Allows multi-month expense and savings trajectory computation.
            </p>
          </div>

          <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: customer.consent.anomaly_analysis ? '#f0fdf4' : '#fef2f2' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: customer.consent.anomaly_analysis ? '#166534' : '#991b1b' }}>
              Anomaly Detection Scope
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Status: <strong>{customer.consent.anomaly_analysis ? 'AUTHORIZED' : 'RESTRICTED / DISABLED'}</strong>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Allows isolated transaction magnitude checks (&gt;80% income).
            </p>
          </div>

          <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: customer.consent.vernacular_assistance ? '#f0fdf4' : '#fef2f2' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: customer.consent.vernacular_assistance ? '#166534' : '#991b1b' }}>
              Vernacular Assistance
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Status: <strong>{customer.consent.vernacular_assistance ? 'AUTHORIZED' : 'RESTRICTED / DISABLED'}</strong>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Allows regional language messaging generation ({customer.preferred_language.toUpperCase()}).
            </p>
          </div>
        </div>
      </div>

      {/* Immutable Audit Trail Section */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={16} />
            Immutable Decision Audit History ({auditLogs.length})
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Decision ID</th>
                <th>Decision State</th>
                <th>Confidence</th>
                <th>Reason Codes</th>
                <th>Policy Version</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No audit records available for this customer.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td className="mono-id">{log.id || `AUD-00${idx + 1}`}</td>
                    <td className="mono-id">{log.decision_id}</td>
                    <td>
                      <strong style={{ fontSize: 12 }}>{log.decision}</strong>
                    </td>
                    <td>{Math.round(log.confidence * 100)}%</td>
                    <td>
                      {log.reason_codes.map((rc) => (
                        <span key={rc} className="reason-pill">
                          {rc}
                        </span>
                      ))}
                    </td>
                    <td><span className="env-badge">{log.policy_version}</span></td>
                    <td style={{ fontSize: 12 }}>{formatDateTime(log.audit_timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
