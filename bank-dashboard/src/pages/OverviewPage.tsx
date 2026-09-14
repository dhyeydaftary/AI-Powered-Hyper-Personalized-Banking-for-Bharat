import React from 'react';
import { Customer, Decision, SystemAnalytics } from '../types';
import { StatCard } from '../components/Common/StatCard';
import { DecisionBadge } from '../components/Decision/DecisionBadge';
import { formatCurrency, formatConfidence } from '../utils/formatters';
import { Users, AlertTriangle, ShieldAlert, CheckCircle2, MinusCircle, Eye } from 'lucide-react';

interface Props {
  customers: Customer[];
  decisions: Record<string, Decision>;
  analytics: SystemAnalytics;
  onSelectCustomer: (customerId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewPage: React.FC<Props> = ({
  customers,
  decisions,
  analytics,
  onSelectCustomer,
  onNavigateTab,
}) => {
  const totalDecisions = Object.keys(decisions).length || 1;
  const recommendPct = Math.round(((analytics.decision_counts.RECOMMEND || 0) / totalDecisions) * 100);
  const intervenePct = Math.round(((analytics.decision_counts.INTERVENE || 0) / totalDecisions) * 100);
  const verifyPct = Math.round(((analytics.decision_counts.VERIFY || 0) / totalDecisions) * 100);
  const noActionPct = Math.round(((analytics.decision_counts.NO_ACTION || 0) / totalDecisions) * 100);

  // Review Queue preview items (low confidence or VERIFY or INTERVENE)
  const reviewItems = customers.filter((c) => {
    const dec = decisions[c.customer_id];
    return dec && (dec.confidence < 0.75 || dec.decision === 'VERIFY' || dec.decision === 'INTERVENE');
  });

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Executive Operations & AI Governance Overview</h1>
          <p className="page-subtitle">
            Real-time decision intelligence monitoring, human oversight metrics, and governance status.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab('customers')}>
          <Users size={14} />
          View All Customers ({customers.length})
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <StatCard
          label="Total Customers"
          value={analytics.total_customers}
          subtext="Seeded synthetic test personas (C1001-C1007)"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Review Queue"
          value={analytics.review_queue_count}
          subtext="Low confidence & VERIFY/INTERVENE"
          valueColor="var(--status-intervene)"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Deliberate No Action"
          value={`${analytics.no_action_percentage}%`}
          subtext="Suppressed to avoid unnecessary nudging"
          valueColor="var(--status-noaction)"
          icon={<MinusCircle size={18} />}
        />
        <StatCard
          label="Policy Engine"
          value="v1.0 Active"
          subtext="Deterministic rule-based decisioning"
          valueColor="var(--brand-accent)"
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* Decision Distribution Section */}
      <div className="card">
        <div className="card-title">
          <span>Decision Distribution Breakdown</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
            Total Decisions Analyzed: {totalDecisions}
          </span>
        </div>

        {/* Stacked bar visual */}
        <div
          style={{
            height: 12,
            width: '100%',
            backgroundColor: '#e2e8f0',
            borderRadius: 6,
            display: 'flex',
            overflow: 'hidden',
            margin: '12px 0 16px 0',
          }}
        >
          <div style={{ width: `${recommendPct}%`, backgroundColor: 'var(--status-recommend)' }} title={`RECOMMEND ${recommendPct}%`} />
          <div style={{ width: `${intervenePct}%`, backgroundColor: 'var(--status-intervene)' }} title={`INTERVENE ${intervenePct}%`} />
          <div style={{ width: `${verifyPct}%`, backgroundColor: 'var(--status-verify)' }} title={`VERIFY ${verifyPct}%`} />
          <div style={{ width: `${noActionPct}%`, backgroundColor: 'var(--status-noaction)' }} title={`NO_ACTION ${noActionPct}%`} />
        </div>

        {/* Distribution Legend Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-recommend-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <DecisionBadge decision="RECOMMEND" />
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--status-recommend)' }}>{analytics.decision_counts.RECOMMEND || 0}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
              Beneficial product opportunity identified for healthy financial profiles.
            </p>
          </div>

          <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-intervene-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <DecisionBadge decision="INTERVENE" />
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--status-intervene)' }}>{analytics.decision_counts.INTERVENE || 0}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
              Proactive assistance/counseling for high EMI or deteriorating trends.
            </p>
          </div>

          <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-verify-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <DecisionBadge decision="VERIFY" />
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--status-verify)' }}>{analytics.decision_counts.VERIFY || 0}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
              Unusual transaction or pattern requires confirmation (Anomaly ≠ Fraud).
            </p>
          </div>

          <div style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-noaction-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <DecisionBadge decision="NO_ACTION" />
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--status-noaction)' }}>{analytics.decision_counts.NO_ACTION || 0}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
              First-class outcome: no actionable signal or insufficient history (cold start).
            </p>
          </div>
        </div>
      </div>

      {/* Prioritized Review Queue Table */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} color="var(--status-intervene)" />
            Prioritized Human Review Queue ({reviewItems.length})
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab('review')}>
            View Full Queue
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Monthly Income</th>
                <th>Current Decision</th>
                <th>Confidence</th>
                <th>Primary Reason</th>
                <th>Governance Action</th>
              </tr>
            </thead>
            <tbody>
              {reviewItems.map((c) => {
                const dec = decisions[c.customer_id];
                const conf = dec ? formatConfidence(dec.confidence) : { percent: 'N/A', label: 'N/A', level: 'medium' };

                return (
                  <tr key={c.customer_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="mono-id">{c.customer_id}</div>
                    </td>
                    <td>{formatCurrency(c.monthly_income)}</td>
                    <td>{dec ? <DecisionBadge decision={dec.decision} /> : 'N/A'}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: conf.level === 'low' ? 'var(--confidence-low)' : 'var(--text-primary)' }}>
                        {conf.percent} ({conf.label})
                      </span>
                    </td>
                    <td>
                      {dec && dec.reason_codes.length > 0 ? (
                        <span className="reason-pill">{dec.reason_codes[0]}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectCustomer(c.customer_id)}
                      >
                        <Eye size={12} />
                        Inspect Decision
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
