import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ fallback = '/dashboard', fallbackPath, label = 'Back to Dashboard', style = {} }) => {
  const navigate = useNavigate();
  const target = fallbackPath || fallback || '/dashboard';

  const handleBack = (e) => {
    if (e) e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(target);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="btn btn-secondary btn-sm"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        fontSize: '0.85rem',
        fontWeight: '600',
        marginBottom: '16px',
        ...style
      }}
      title="Return to previous screen"
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
};
