import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useLoan } from '../../context/LoanContext';

export const Toast = () => {
  const { toast } = useLoan();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'info':
      default:
        return <Info size={18} color="#3b82f6" />;
    }
  };

  return (
    <div className="cl-toast" role="alert">
      {getIcon()}
      <span>{toast.message}</span>
    </div>
  );
};
