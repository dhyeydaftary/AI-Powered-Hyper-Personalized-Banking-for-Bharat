import React, { useState } from 'react';
import { Customer, Decision } from '../types';
import { DecisionBadge } from '../components/Decision/DecisionBadge';
import { formatCurrency, formatConfidence } from '../utils/formatters';
import { CheckSquare, Eye, AlertTriangle } from 'lucide-react';

interface Props {
  customers: Customer[];
  decisions: Record<string, Decision>;
  onSelectCustomer: (customerId: string) => void;
}

export const ReviewQueuePage: React.FC<Props> = ({ customers, decisions, onSelectCustomer }) => {
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());

  // Filter customers that need review (VERIFY, INTERVENE, or confidence < 0.75)
  const queueCustomers = customers.filter((c) => {
    const dec = decisions[c.customer_id];
    return dec && (dec.confidence < 0.75 || dec.decision === 'VERIFY' || dec.decision === 'INTERVENE');
  });

  const toggleReviewed = (id: string) => {
    const next = new Set(reviewedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setReviewedSet(next);
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Human Oversight & Decision Review Queue</h1>
          <p className="page-subtitle">
            Prioritized queue for low-confidence decisions (&lt; 75%), VERIFY anomalies, and INTERVENE cases requiring Relationship Manager review.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, backgroundColor: '#fffbeb', border: '1px solid #fde68a', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#92400e', fontWeight: 600, fontSize: 13 }}>
          <AlertTriangle size={18} />
          Responsible AI Principle: Intelligence models flag potential stress or unusual patterns; relationship managers conduct human oversight.
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Customer</th>
              <th>Income</th>
              <th>Current Decision</th>
              <th>Confidence</th>
              <th>Reason Codes & Trigger</th>
              <th>Governance Actions</th>
            </tr>
          </thead>
          <tbody>
            {queueCustomers.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-title">No pending reviews in queue</div>
                    <div className="empty-state-text">All decisions meet confidence thresholds and are in good standing.</div>
                  </div>
                </td>
              </tr>
            ) : (
              queueCustomers.map((c) => {
                const dec = decisions[c.customer_id];
                const isReviewed = reviewedSet.has(c.customer_id);
                const conf = dec ? formatConfidence(dec.confidence) : { percent: 'N/A', label: 'N/A', level: 'medium' };

                return (
                  <tr key={c.customer_id} style={{ opacity: isReviewed ? 0.6 : 1 }}>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleReviewed(c.customer_id)}
                        style={{
                          backgroundColor: isReviewed ? '#ecfdf5' : '#ffffff',
                          borderColor: isReviewed ? '#a7f3d0' : 'var(--border-strong)',
                          color: isReviewed ? '#059669' : 'var(--text-primary)',
                        }}
                      >
                        <CheckSquare size={14} />
                        {isReviewed ? 'Reviewed' : 'Mark Reviewed'}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="mono-id">{c.customer_id}</div>
                    </td>
                    <td>{formatCurrency(c.monthly_income)}</td>
                    <td>{dec ? <DecisionBadge decision={dec.decision} /> : 'N/A'}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: conf.level === 'low' ? 'var(--confidence-low)' : 'var(--text-primary)',
                        }}
                      >
                        {conf.percent} ({conf.label})
                      </span>
                    </td>
                    <td>
                      {dec?.reason_codes.map((rc) => (
                        <span key={rc} className="reason-pill">
                          {rc}
                        </span>
                      ))}
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => onSelectCustomer(c.customer_id)}>
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
