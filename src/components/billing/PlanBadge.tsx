import React from 'react';

interface PlanBadgeProps {
  planName: string;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ planName }) => {
  const getStyles = () => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'basic':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pro':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'enterprise':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {planName}
    </span>
  );
};

export default PlanBadge;
