import React from 'react';
import { Customer, Decision } from '../types';
import { ShieldCheck, Eye } from 'lucide-react';

interface Props {
  customers: Customer[];
  decisions: Record<string, Decision>;
  onSelectCustomer: (customerId: string) => void;
}

export const ConsentPage: React.FC<Props> = ({ customers, decisions, onSelectCustomer }) => {
  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Consent & Privacy Governance Matrix</h1>
          <p className="page-subtitle">
            Customer-granted data access authorizations and analysis scope enforcement.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#166534', fontWeight: 600, fontSize: 13 }}>
          <ShieldCheck size={18} />
          Strict Privacy & Consent Policy: AI engines evaluate only data categories explicitly authorized by the customer. Disabling scope reduces decision confidence gracefully.
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Behavioral Trend Analysis</th>
              <th>Anomaly Detection Scope</th>
              <th>Vernacular Assistance</th>
              <th>Overall Consent Status</th>
              <th>Confidence Impact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const dec = decisions[c.customer_id];
              const { behavioral_trend_analysis, anomaly_analysis, vernacular_assistance } = c.consent;
              const authorizedCount = [behavioral_trend_analysis, anomaly_analysis, vernacular_assistance].filter(Boolean).length;

              return (
                <tr key={c.customer_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="mono-id">{c.customer_id}</div>
                  </td>
                  <td>
                    <span style={{ color: behavioral_trend_analysis ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 12 }}>
                      {behavioral_trend_analysis ? '✓ Authorized' : '✗ Disabled'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: anomaly_analysis ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 12 }}>
                      {anomaly_analysis ? '✓ Authorized' : '✗ Disabled'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: vernacular_assistance ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 12 }}>
                      {vernacular_assistance ? '✓ Authorized' : '✗ Disabled'}
                    </span>
                  </td>
                  <td>
                    <span className="reason-pill" style={{ backgroundColor: authorizedCount === 3 ? '#ecfdf5' : '#fffbeb' }}>
                      {authorizedCount}/3 Scopes Active
                    </span>
                  </td>
                  <td>
                    {dec ? (
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {Math.round(dec.confidence * 100)}% {dec.confidence < 0.7 ? '(Reduced)' : '(Full)'}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => onSelectCustomer(c.customer_id)}>
                      <Eye size={12} />
                      Inspect Customer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
