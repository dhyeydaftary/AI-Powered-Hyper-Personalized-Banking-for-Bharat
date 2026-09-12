import React from 'react';
import { SystemAnalytics } from '../types';
import { StatCard } from '../components/Common/StatCard';
import { DecisionBadge } from '../components/Decision/DecisionBadge';
import { BarChart3, PieChart, Activity } from 'lucide-react';

interface Props {
  analytics: SystemAnalytics;
}

export const AnalyticsPage: React.FC<Props> = ({ analytics }) => {
  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Operational Analytics & Intelligence Monitoring</h1>
          <p className="page-subtitle">
            System performance metrics, confidence distribution, reason code frequency, and feedback analysis.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="metrics-grid">
        <StatCard
          label="Total Analyzed Customers"
          value={analytics.total_customers}
          subtext="Seeded personas C1001-C1007"
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          label="High Confidence (&ge;85%)"
          value={analytics.confidence_buckets.high}
          subtext={`${Math.round((analytics.confidence_buckets.high / analytics.total_customers) * 100)}% of decision volume`}
          valueColor="var(--status-recommend)"
        />
        <StatCard
          label="Low Confidence (&lt;70%)"
          value={analytics.confidence_buckets.low}
          subtext="Requires human review"
          valueColor="var(--status-intervene)"
        />
        <StatCard
          label="Deliberate No Action Rate"
          value={`${analytics.no_action_percentage}%`}
          subtext="Avoids unnecessary nudges"
          valueColor="var(--status-noaction)"
        />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column: Decision Breakdown */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieChart size={16} />
              Decision State Frequency
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <DecisionBadge decision="RECOMMEND" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>{analytics.decision_counts.RECOMMEND || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <DecisionBadge decision="INTERVENE" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>{analytics.decision_counts.INTERVENE || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <DecisionBadge decision="VERIFY" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>{analytics.decision_counts.VERIFY || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <DecisionBadge decision="NO_ACTION" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>{analytics.decision_counts.NO_ACTION || 0}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Reason Code Frequency */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} />
              Top Triggered Reason Codes
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(analytics.reason_code_counts).map(([code, count]) => (
              <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span className="reason-pill" style={{ margin: 0 }}>{code}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
