import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Disclaimer = ({ compact = false }) => {
  return (
    <div className="disclaimer-banner">
      <AlertCircle size={compact ? 16 : 18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div className="disclaimer-banner-text">
        <strong>Educational Financial Planning Tool: </strong>
        CreditLens is designed solely for informational, illustrative, and self-planning purposes. Calculations, affordability ratings, and amortization schedules are hypothetical mathematical estimates based on reducing-balance formulas. They do not constitute an official credit-score evaluation, loan eligibility determination, or formal financial advice from any lending institution.
      </div>
    </div>
  );
};
