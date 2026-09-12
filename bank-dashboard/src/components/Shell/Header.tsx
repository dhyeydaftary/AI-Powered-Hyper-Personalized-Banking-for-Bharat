import React from 'react';
import { Search, UserCheck, Shield } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
}

export const Header: React.FC<Props> = ({ searchQuery, onSearchChange, onSearchSubmit }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-search">
          <Search className="header-search-icon" />
          <input
            type="text"
            placeholder="Search Customer ID or Name (e.g. C1001, Aarav)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="env-badge">
          <Shield size={12} color="#2563eb" />
          Policy Engine: v1.0
        </div>
        <div className="user-profile">
          <UserCheck size={16} color="#64748b" />
          <span>Senior Governance Officer</span>
        </div>
      </div>
    </header>
  );
};
