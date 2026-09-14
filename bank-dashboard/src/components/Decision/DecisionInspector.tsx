import React from 'react';
import { Decision } from '../../types';
import { DecisionBadge } from './DecisionBadge';
import { formatConfidence, translateReasonCode, formatCurrency, formatDateTime } from '../../utils/formatters';
import { ShieldCheck, Info, Clock, Code, Activity } from 'lucide-react';

interface Props {
  decision: Decision;
}

export const DecisionInspector: React.FC<Props> = ({ decision }) => {
  const conf = formatConfidence(decision.confidence);

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-title" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DecisionBadge decision={decision.decision} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            ID: <code className="mono-id">{decision.decision_id}</code>
          </span>
        </div>
        <span className="env-badge">Policy {decision.policy_version}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
        {/* Confidence Box */}
        <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Decision Confidence
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              {conf.percent}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: conf.level === 'low' ? 'var(--confidence-low)' : 'var(--confidence-high)' }}>
              {conf.label}
            </span>
          </div>
          <div className="confidence-bar" style={{ width: '100%', marginTop: 8 }}>
            <div className={conf.badgeClass} style={{ width: conf.percent }} />
          </div>
        </div>

        {/* Timestamp & Policy */}
        <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Governance Metadata
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
            {formatDateTime(decision.timestamp)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Code style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
            Policy Rule Engine v1.0
          </div>
        </div>
      </div>

      {/* Reason Codes */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
          Structured Reason Codes & Evidence
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {decision.reason_codes.map((code) => (
            <div key={code} style={{ padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
              <span className="reason-pill">{code}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {translateReasonCode(code)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Action (if any) */}
      {decision.action && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info style={{ width: 14, height: 14 }} />
            Recommended Action: {decision.action.title || decision.action.type}
          </div>
          {decision.action.description && (
            <div style={{ fontSize: 12, color: '#0c4a6e', marginTop: 4 }}>
              {decision.action.description}
            </div>
          )}
          {decision.action.suggested_product && (
            <div style={{ fontSize: 11, color: '#0369a1', marginTop: 4, fontWeight: 500 }}>
              Suggested Product: <strong>{decision.action.suggested_product}</strong>
              {decision.action.amount ? ` (${formatCurrency(decision.action.amount)})` : ''}
            </div>
          )}
        </div>
      )}

      {/* Supporting Signals */}
      {decision.signals && Object.keys(decision.signals).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity style={{ width: 14, height: 14 }} />
            Underlying Financial Signals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {decision.signals.emi_to_income_ratio !== undefined && (
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="stat-label">EMI / Income</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {(Number(decision.signals.emi_to_income_ratio) * 100).toFixed(1)}%
                </div>
              </div>
            )}
            {decision.signals.savings_rate !== undefined && (
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="stat-label">Savings Rate</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {(Number(decision.signals.savings_rate) * 100).toFixed(1)}%
                </div>
              </div>
            )}
            {decision.signals.unusual_amount !== undefined && (
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="stat-label">Unusual TX Amount</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--status-intervene)' }}>
                  {formatCurrency(Number(decision.signals.unusual_amount))}
                </div>
              </div>
            )}
            {decision.signals.history_months !== undefined && (
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="stat-label">History Months</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {String(decision.signals.history_months)} mo
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Governance Footer */}
      <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <ShieldCheck style={{ width: 14, height: 14, color: 'var(--status-recommend)' }} />
        AI Governance Standard: Decisions are generated by deterministic policy rules. Human relationship managers remain responsible for final actions.
      </div>
    </div>
  );
};
