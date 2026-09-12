import React from 'react';
import { Info } from 'lucide-react';

export const PolicyPage: React.FC = () => {
  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Policy Transparency & Rule Configuration</h1>
          <p className="page-subtitle">
            Transparent specification of deterministic threshold parameters, decision priority rules, and anomaly triggers (`v1.0`).
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1e40af', fontWeight: 600, fontSize: 13 }}>
          <Info size={18} />
          Demo Policy Configuration: The policy rules below govern how structured decisions (RECOMMEND, INTERVENE, VERIFY, NO_ACTION) are computed from financial signals.
        </div>
      </div>

      {/* Grid of Policy Rules */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Rule 1: VERIFY Anomaly Short-Circuit */}
        <div className="card">
          <div className="card-title">
            <span style={{ color: 'var(--status-verify)' }}>1. VERIFY (Unusual Transaction Priority)</span>
            <span className="env-badge">Priority 1</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Evaluates whether an isolated transaction magnitude dramatically exceeds normal customer spending patterns.
          </p>
          <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Threshold Condition:</div>
            <code className="mono-id">single_transaction_amount &gt; 0.80 * monthly_income</code>
            <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>
              Outcome: <code>VERIFY</code> | Reason Code: <code>UNUSUAL_TRANSACTION</code>
            </div>
            <div style={{ marginTop: 4, fontStyle: 'italic', color: '#4338ca' }}>
              Note: Anomaly detection flags unusual transactions for verification; it does NOT automatically brand them as fraud.
            </div>
          </div>
        </div>

        {/* Rule 2: INTERVENE Deterioration */}
        <div className="card">
          <div className="card-title">
            <span style={{ color: 'var(--status-intervene)' }}>2. INTERVENE (Financial Stress Relief)</span>
            <span className="env-badge">Priority 2</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Triggers proactive financial counseling and debt restructuring when financial stress indicators cross safety thresholds.
          </p>
          <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Threshold Condition:</div>
            <code className="mono-id">emi_to_income_ratio &gt; 0.35 OR savings_rate &lt; 0.10</code>
            <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>
              Outcome: <code>INTERVENE</code> | Reason Codes: <code>HIGH_EMI_BURDEN</code>, <code>DECLINING_SAVINGS</code>
            </div>
          </div>
        </div>

        {/* Rule 3: RECOMMEND Opportunity */}
        <div className="card">
          <div className="card-title">
            <span style={{ color: 'var(--status-recommend)' }}>3. RECOMMEND (Product Benefit)</span>
            <span className="env-badge">Priority 3</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Identifies liquid mutual fund or savings opportunities for customers with healthy savings and low EMI stress.
          </p>
          <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Threshold Condition:</div>
            <code className="mono-id">savings_rate &ge; 0.10 AND emi_to_income_ratio &le; 0.35 AND history_months &gt; 1</code>
            <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>
              Outcome: <code>RECOMMEND</code> | Reason Code: <code>HEALTHY_FINANCIAL_TREND</code>
            </div>
          </div>
        </div>

        {/* Rule 4: NO_ACTION Fallback */}
        <div className="card">
          <div className="card-title">
            <span style={{ color: 'var(--status-noaction)' }}>4. NO_ACTION (Deliberate Non-Intervention)</span>
            <span className="env-badge">Priority 4 (Default)</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Default outcome when history is thin (cold start &le; 1 month) or no actionable financial benefit exists.
          </p>
          <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Threshold Condition:</div>
            <code className="mono-id">history_months &le; 1 OR no_actionable_signal</code>
            <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>
              Outcome: <code>NO_ACTION</code> | Reason Codes: <code>INSUFFICIENT_HISTORY</code>, <code>NO_REASONABLE_BENEFIT</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
