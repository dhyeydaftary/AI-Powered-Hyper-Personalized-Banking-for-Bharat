import React, { useState } from 'react';
import { Customer, Decision } from '../types';
import { DecisionBadge } from '../components/Decision/DecisionBadge';
import { formatCurrency, formatConfidence } from '../utils/formatters';
import { Search, Eye, Filter, Lock } from 'lucide-react';

interface Props {
  customers: Customer[];
  decisions: Record<string, Decision>;
  onSelectCustomer: (customerId: string) => void;
}

export const CustomersPage: React.FC<Props> = ({ customers, decisions, onSelectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('ALL');

  const filteredCustomers = customers.filter((c) => {
    // Search
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Decision filter
    const dec = decisions[c.customer_id];
    if (decisionFilter !== 'ALL') {
      if (!dec || dec.decision !== decisionFilter) return false;
    }

    // Confidence filter
    if (confidenceFilter !== 'ALL') {
      if (!dec) return false;
      if (confidenceFilter === 'HIGH' && dec.confidence < 0.85) return false;
      if (confidenceFilter === 'MEDIUM' && (dec.confidence < 0.7 || dec.confidence >= 0.85)) return false;
      if (confidenceFilter === 'LOW' && dec.confidence >= 0.7) return false;
    }

    return true;
  });

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Customer Intelligence Directory</h1>
          <p className="page-subtitle">
            Enterprise index of all customers, decision outcomes, confidence scores, and consent parameters.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="select-control"
              style={{ paddingLeft: 32, width: '100%' }}
              placeholder="Search customer name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Decision:</span>
            <select
              className="select-control"
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
            >
              <option value="ALL">All Decisions</option>
              <option value="RECOMMEND">RECOMMEND</option>
              <option value="INTERVENE">INTERVENE</option>
              <option value="VERIFY">VERIFY</option>
              <option value="NO_ACTION">NO_ACTION</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Confidence:</span>
            <select
              className="select-control"
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
            >
              <option value="ALL">All Confidence Levels</option>
              <option value="HIGH">High (≥ 85%)</option>
              <option value="MEDIUM">Medium (70% - 84%)</option>
              <option value="LOW">Low (&lt; 70% / Review Required)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Language</th>
              <th>Monthly Income</th>
              <th>Latest Decision</th>
              <th>Confidence</th>
              <th>Primary Reason</th>
              <th>Consent Scope</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-title">No customers match your filter criteria</div>
                    <div className="empty-state-text">Try clearing or adjusting search term and filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                const dec = decisions[c.customer_id];
                const conf = dec ? formatConfidence(dec.confidence) : null;
                const activeConsentCount = [
                  c.consent.behavioral_trend_analysis,
                  c.consent.anomaly_analysis,
                  c.consent.vernacular_assistance,
                ].filter(Boolean).length;

                return (
                  <tr key={c.customer_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="mono-id">{c.customer_id}</div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600 }} className="reason-pill">
                        {c.preferred_language}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{formatCurrency(c.monthly_income)}</td>
                    <td>{dec ? <DecisionBadge decision={dec.decision} /> : 'No decision'}</td>
                    <td>
                      {conf ? (
                        <div className="confidence-bar-wrapper">
                          <span style={{ fontWeight: 600, fontSize: 12, width: 36 }}>{conf.percent}</span>
                          <div className="confidence-bar">
                            <div className={conf.badgeClass} style={{ width: conf.percent }} />
                          </div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {dec && dec.reason_codes.length > 0 ? (
                        <span className="reason-pill">{dec.reason_codes[0]}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                        <Lock size={12} color="var(--status-recommend)" />
                        <span>{activeConsentCount}/3 Authorized</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onSelectCustomer(c.customer_id)}
                      >
                        <Eye size={12} />
                        Inspect Detail
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
