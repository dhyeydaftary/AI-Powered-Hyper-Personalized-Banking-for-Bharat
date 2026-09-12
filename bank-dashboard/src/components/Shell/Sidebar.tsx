import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Ban,
  Lock,
  History,
  FileText,
  BarChart3,
  Building2,
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'customers'
  | 'review'
  | 'suppressed'
  | 'consent'
  | 'audit'
  | 'policy'
  | 'analytics';

interface Props {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  reviewCount?: number;
  noActionCount?: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  reviewCount = 3,
  noActionCount = 2,
}) => {
  const items: Array<{
    key: NavItemKey;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { key: 'customers', label: 'Customers', icon: <Users size={18} /> },
    {
      key: 'review',
      label: 'Decision Queue',
      icon: <ShieldCheck size={18} />,
      badge: reviewCount,
    },
    {
      key: 'suppressed',
      label: 'Suppressed / No Action',
      icon: <Ban size={18} />,
      badge: noActionCount,
    },
    { key: 'consent', label: 'Consent & Privacy', icon: <Lock size={18} /> },
    { key: 'audit', label: 'Audit Trail', icon: <History size={18} /> },
    { key: 'policy', label: 'Policy Transparency', icon: <FileText size={18} /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <Building2 size={20} color="#3b82f6" />
          <span>BHARAT BANK</span>
        </div>
        <div className="sidebar-subtitle">Decision Intelligence & Governance</div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.key)}
            >
              <div className="nav-item-content">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>
          Bharat RM Portal v1.0
        </div>
        <div>Policy Engine v1.0 (Demo)</div>
      </div>
    </aside>
  );
};
