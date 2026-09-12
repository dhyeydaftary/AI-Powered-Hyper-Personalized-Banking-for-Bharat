import React, { useEffect, useState } from 'react';
import { AuditEntry } from '../types';
import { api } from '../api/client';
import { formatDateTime } from '../utils/formatters';
import { Lock } from 'lucide-react';

interface Props {
  onSelectCustomer: (customerId: string) => void;
}

export const AuditPage: React.FC<Props> = ({ onSelectCustomer }) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then((res) => {
      if (res.data) setLogs(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">System Decision Audit Trail & Governance Log</h1>
          <p className="page-subtitle">
            Read-only, immutable audit log of all financial intelligence decision runs, reason codes, confidence scores, and policy versions.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>
          <Lock size={18} color="var(--status-recommend)" />
          Immutability Assurance: Audit log entries are append-only. Decision history cannot be modified or deleted by bank users.
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Audit ID</th>
              <th>Customer ID</th>
              <th>Decision State</th>
              <th>Confidence</th>
              <th>Reason Codes</th>
              <th>Policy Version</th>
              <th>Timestamp</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No audit records available.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <td className="mono-id">{log.id || `AUD-00${idx + 1}`}</td>
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => onSelectCustomer(log.customer_id)}
                    >
                      {log.customer_id}
                    </button>
                  </td>
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
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.reviewed_by || 'System Intelligence'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
