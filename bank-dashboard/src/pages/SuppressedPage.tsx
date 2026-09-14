import React from 'react';
import { Customer, Decision } from '../types';
import { DecisionBadge } from '../components/Decision/DecisionBadge';
import { formatCurrency, translateReasonCode } from '../utils/formatters';
import { Eye, Info } from 'lucide-react';

interface Props {
  customers: Customer[];
  decisions: Record<string, Decision>;
  onSelectCustomer: (customerId: string) => void;
}

export const SuppressedPage: React.FC<Props> = ({ customers, decisions, onSelectCustomer }) => {
  // Filter NO_ACTION decisions
  const suppressedCustomers = customers.filter((c) => {
    const dec = decisions[c.customer_id];
    return dec && dec.decision === 'NO_ACTION';
  });

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Suppressed Recommendations & Deliberate No-Action</h1>
          <p className="page-subtitle">
            Governance register of customers where the AI decision engine explicitly withheld nudges or product recommendations.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--text-primary)', fontSize: 13 }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--brand-accent)' }} />
          <div>
            <strong>Core Product Philosophy: Customer-Benefit-Oriented Decisioning</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Unlike aggressive sales engines, the Bharat Banking decision engine deliberately selects <code>NO_ACTION</code> when evidence is ambiguous, customer history is limited (cold start), or no genuine product benefit exists.
            </p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Monthly Income</th>
              <th>Decision State</th>
              <th>Confidence</th>
              <th>Suppression Reason & Code</th>
              <th>Governance Action</th>
            </tr>
          </thead>
          <tbody>
            {suppressedCustomers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-title">No suppressed recommendations found</div>
                    <div className="empty-state-text">All analyzed customers had explicit RECOMMEND, INTERVENE, or VERIFY outcomes.</div>
                  </div>
                </td>
              </tr>
            ) : (
              suppressedCustomers.map((c) => {
                const dec = decisions[c.customer_id];

                return (
                  <tr key={c.customer_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="mono-id">{c.customer_id}</div>
                    </td>
                    <td>{formatCurrency(c.monthly_income)}</td>
                    <td>{dec ? <DecisionBadge decision={dec.decision} /> : 'N/A'}</td>
                    <td>{dec ? `${Math.round(dec.confidence * 100)}%` : 'N/A'}</td>
                    <td>
                      {dec?.reason_codes.map((rc) => (
                        <div key={rc} style={{ marginBottom: 4 }}>
                          <span className="reason-pill">{rc}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {translateReasonCode(rc)}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onSelectCustomer(c.customer_id)}>
                        <Eye size={12} />
                        Inspect Case
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
