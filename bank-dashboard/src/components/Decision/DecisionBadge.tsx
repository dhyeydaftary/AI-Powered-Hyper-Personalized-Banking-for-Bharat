import React from 'react';
import { DecisionType } from '../../types';
import { CheckCircle2, AlertTriangle, ShieldAlert, MinusCircle } from 'lucide-react';

interface Props {
  decision: DecisionType;
  showIcon?: boolean;
}

export const DecisionBadge: React.FC<Props> = ({ decision, showIcon = true }) => {
  const getIcon = () => {
    switch (decision) {
      case 'RECOMMEND':
        return <CheckCircle2 style={{ width: 14, height: 14 }} />;
      case 'INTERVENE':
        return <AlertTriangle style={{ width: 14, height: 14 }} />;
      case 'VERIFY':
        return <ShieldAlert style={{ width: 14, height: 14 }} />;
      case 'NO_ACTION':
        return <MinusCircle style={{ width: 14, height: 14 }} />;
    }
  };

  return (
    <span className={`decision-badge ${decision}`}>
      {showIcon && getIcon()}
      {decision}
    </span>
  );
};
