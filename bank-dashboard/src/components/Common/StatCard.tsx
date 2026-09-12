import React from 'react';

interface Props {
  label: string;
  value: string | number;
  subtext?: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({
  label,
  value,
  subtext,
  valueColor = 'var(--text-primary)',
  icon,
}) => {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stat-label">{label}</div>
        {icon && <div style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      </div>
      <div className="stat-value" style={{ color: valueColor }}>
        {value}
      </div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
};
