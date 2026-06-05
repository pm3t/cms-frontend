import React from 'react';
import type { InvoiceStatus } from '../../types/billing';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStyles()}`}>
      {status}
    </span>
  );
};

export default InvoiceStatusBadge;
