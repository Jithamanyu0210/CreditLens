import React, { useState } from 'react';
import { 
  GitCompare, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Sparkles, 
  Sliders,
  DollarSign,
  Plus,
  Trash2,
  Star,
  Check,
  FolderOpen,
  AlertTriangle,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { useLoan } from '../context/LoanContext';
import { calculateEMI } from '../utils/loanCalculations';
import { formatINR, formatNumber } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';
import { aiAPI } from '../services/api';

const COLOR_PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const DEFAULT_LOAN_OPTIONS = [
  {
    id: 'loan_1',
    name: 'Option 1 (Standard 5-Yr)',
    principal: 1000000,
    annualRate: 8.75,
    tenureMonths: 60,
    color: '#2563eb'
  },
  {
    id: 'loan_2',
    name: 'Option 2 (Shorter 3-Yr)',
    principal: 1000000,
    annualRate: 8.50,
    tenureMonths: 36,
    color: '#10b981'
  },
  {
    id: 'loan_3',
    name: 'Option 3 (Longer 7-Yr)',
    principal: 1000000,
    annualRate: 9.00,
    tenureMonths: 84,
    color: '#f59e0b'
  }
];

export const ComparePage = () => {
  const { profile, savedScenarios } = useLoan();

  // Multi-loan state: supports 2 to 5 loans
  const [loans, setLoans] = useState(DEFAULT_LOAN_OPTIONS);
  const [preferredId, setPreferredId] = useState(null);
  const [importModalSlot, setImportModalSlot] = useState(null);

  // Gemini AI Comparison State
  const [aiComparison, setAiComparison] = useState(null);
  const [aiCompLoading, setAiCompLoading] = useState(false);
  const [aiCompError, setAiCompError] = useState(null);

  // Financial baseline numbers for affordability
  const monthlyIncome = profile.monthlyIncome || 85000;
  const livingAndOtherExpenses = (profile.monthlyExpenses || 0) + (profile.otherExpenses || 0);
  const existingDebtEmis = (profile.existingEmis || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalBaseExpenses = livingAndOtherExpenses + existingDebtEmis;
  const savingsTarget = profile.monthlySavingsTarget || 15000;

  // Add new loan option (up to 5)
  const handleAddOption = () => {
    if (loans.length >= 5) return;
    const newIdx = loans.length + 1;
    const newLoan = {
      id: `loan_${Date.now()}`,
      name: `Option ${newIdx}`,
      principal: 1000000,
      annualRate: 8.50,
      tenureMonths: 60,
      color: COLOR_PALETTE[loans.length % COLOR_PALETTE.length]
    };
    setLoans([...loans, newLoan]);
  };

  // Remove loan option (minimum 2)
  const handleRemoveOption = (id) => {
    if (loans.length <= 2) return;
    setLoans(loans.filter((l) => l.id !== id));
    if (preferredId === id) {
      setPreferredId(null);
    }
  };

  // Update loan field
  const handleUpdateLoan = (id, field, value) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        let sanitized = value;
        if (field === 'principal') sanitized = Math.max(0, Number(value) || 0);
        if (field === 'annualRate') sanitized = Math.max(0, Math.min(100, Number(value) || 0));
        if (field === 'tenureMonths') sanitized = Math.max(1, Math.min(480, Math.round(Number(value) || 1)));
        return { ...l, [field]: sanitized };
      })
    );
  };

  // Import a saved scenario into a loan slot
  const handleImportSaved = (scenario, loanId) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          name: scenario.name,
          principal: scenario.principal,
          annualRate: scenario.annualRate,
          tenureMonths: scenario.tenureMonths
        };
      })
    );
    setImportModalSlot(null);
  };

  // Quick preset loaders
  const applyPreset = (type) => {
    if (type === 'tenure') {
      setLoans([
        { id: 'loan_1', name: '3-Year Fast Payoff', principal: 1200000, annualRate: 8.5, tenureMonths: 36, color: '#2563eb' },
        { id: 'loan_2', name: '5-Year Balanced', principal: 1200000, annualRate: 8.75, tenureMonths: 60, color: '#10b981' },
        { id: 'loan_3', name: '10-Year Low EMI', principal: 1200000, annualRate: 9.25, tenureMonths: 120, color: '#f59e0b' }
      ]);
    } else if (type === 'lender') {
      setLoans([
        { id: 'loan_1', name: 'PSU Bank (8.40%)', principal: 2500000, annualRate: 8.40, tenureMonths: 180, color: '#2563eb' },
        { id: 'loan_2', name: 'Private Bank (8.90%)', principal: 2500000, annualRate: 8.90, tenureMonths: 180, color: '#10b981' },
        { id: 'loan_3', name: 'NBFC (10.25%)', principal: 2500000, annualRate: 10.25, tenureMonths: 180, color: '#f59e0b' }
      ]);
    } else if (type === 'downpayment') {
      setLoans([
        { id: 'loan_1', name: '10% Down Payment', principal: 2700000, annualRate: 8.75, tenureMonths: 120, color: '#2563eb' },
        { id: 'loan_2', name: '20% Down Payment', principal: 2400000, annualRate: 8.75, tenureMonths: 120, color: '#10b981' },
        { id: 'loan_3', name: '30% Down Payment', principal: 2100000, annualRate: 8.75, tenureMonths: 120, color: '#f59e0b' }
      ]);
    }
  };

  // Calculate metrics for all active loan options
  const calculatedLoans = loans.map((l) => {
    const calc = calculateEMI(l.principal, l.annualRate, l.tenureMonths);
    const totalOutflow = totalBaseExpenses + calc.emi;
    const remainingBalance = monthlyIncome - totalOutflow;
    const emiShareOfIncome = (calc.emi / (monthlyIncome || 1)) * 100;

    let affordability = 'Comfortable';
    let affordabilityBg = 'var(--status-comfortable-bg)';
    let affordabilityColor = '#10b981';
    let budgetScore = 3;

    if (remainingBalance < 0) {
      affordability = 'Deficit / High Risk';
      affordabilityBg = 'var(--status-risky-bg)';
      affordabilityColor = '#ef4444';
      budgetScore = 1;
    } else if (remainingBalance < savingsTarget || emiShareOfIncome > 40) {
      affordability = 'Tight Budget';
      affordabilityBg = 'var(--status-tight-bg)';
      affordabilityColor = '#d97706';
      budgetScore = 2;
    }

    return {
      ...l,
      emi: calc.emi,
      totalInterest: calc.totalInterest,
      totalPayment: calc.totalPayment,
      remainingBalance,
      emiShareOfIncome: emiShareOfIncome.toFixed(1),
      affordability,
      affordabilityBg,
      affordabilityColor,
      budgetScore
    };
  });

  // Highlights determination
  const minEmi = Math.min(...calculatedLoans.map((l) => l.emi));
  const minInterest = Math.min(...calculatedLoans.map((l) => l.totalInterest));
  const maxSurplus = Math.max(...calculatedLoans.map((l) => l.remainingBalance));

  const lowestEmiLoan = calculatedLoans.find((l) => l.emi === minEmi);
  const lowestInterestLoan = calculatedLoans.find((l) => l.totalInterest === minInterest);
  const bestBudgetLoan = calculatedLoans.find((l) => l.remainingBalance === maxSurplus);

  // Gemini AI Comparison Fetcher
  const handleGenerateAiComparison = async () => {
    setAiCompLoading(true);
    setAiCompError(null);
    try {
      const res = await aiAPI.explainComparison({
        loans: calculatedLoans,
        profile: {
          monthlyIncome,
          monthlyExpenses: profile.monthlyExpenses,
          otherExpenses: profile.otherExpenses || 0,
          existingEmis: profile.existingEmis || []
        }
      });
      if (res && res.insight) {
        setAiComparison(res.insight);
      }
    } catch (err) {
      setAiCompError(err.message || 'Unable to generate AI comparison at this time.');
    } finally {
      setAiCompLoading(false);
    }
  };

  // Grouped comparative chart data: Metric by Metric
  const chartData = [
    {
      metric: 'Monthly EMI',
      ...calculatedLoans.reduce((acc, curr) => ({ ...acc, [curr.name]: Math.round(curr.emi) }), {})
    },
    {
      metric: 'Total Interest',
      ...calculatedLoans.reduce((acc, curr) => ({ ...acc, [curr.name]: Math.round(curr.totalInterest) }), {})
    },
    {
      metric: 'Total Repayment',
      ...calculatedLoans.reduce((acc, curr) => ({ ...acc, [curr.name]: Math.round(curr.totalPayment) }), {})
    }
  ];

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 className="page-title">Side-by-Side Loan Comparison</h1>
          <p className="page-subtitle">
            Compare 3 to 5 simultaneous loan scenarios. Evaluate monthly EMI, total interest cost, and affordability against your financial baseline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => applyPreset('tenure')} className="preset-chip preset-chip-indigo active">
            Tenure Spread
          </button>
          <button onClick={() => applyPreset('lender')} className="preset-chip preset-chip-emerald active">
            Lender Rates
          </button>
          <button onClick={() => applyPreset('downpayment')} className="preset-chip preset-chip-amber active">
            Down Payments
          </button>
          {loans.length < 5 && (
            <button onClick={handleAddOption} className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add Option ({loans.length}/5)</span>
            </button>
          )}
        </div>
      </div>

      {/* Comparative Highlights Banner */}
      <div className="cl-card-colored cl-card-indigo" style={{
        padding: '20px 22px',
        marginBottom: '26px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-indigo-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Comparison Highlights & Best-Fit Analysis
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Multi-loan trade-off evaluation based on baseline income ({formatINR(monthlyIncome)}/mo)
              </p>
            </div>
          </div>
          <span className="cl-badge cl-badge-blue" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
            Comparing {loans.length} Active Loan Options
          </span>
        </div>

        <div className="grid-3" style={{ gap: '16px' }}>
          <div style={{
            backgroundColor: 'var(--accent-emerald-light)',
            border: '1px solid var(--accent-emerald-border)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-emerald-text)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>🌟 Lowest Monthly EMI</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-emerald-text)', marginTop: '4px' }}>
              {lowestEmiLoan?.name}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '800', marginTop: '2px' }}>
              {formatINR(lowestEmiLoan?.emi)} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>/ month</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--accent-sky-light)',
            border: '1px solid var(--accent-sky-border)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-sky-text)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>💰 Lowest Total Interest</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-sky-text)', marginTop: '4px' }}>
              {lowestInterestLoan?.name}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '800', marginTop: '2px' }}>
              {formatINR(lowestInterestLoan?.totalInterest)} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>total cost</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--accent-amber-light)',
            border: '1px solid var(--accent-amber-border)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-amber-text)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>🛡️ Best Budget Fit</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-amber-text)', marginTop: '4px' }}>
              {bestBudgetLoan?.name}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '800', marginTop: '2px' }}>
              Leaves {formatINR(bestBudgetLoan?.remainingBalance)} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>monthly surplus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Option Comparison Grid (Supports 3–5 Loans) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
        gap: '18px',
        marginBottom: '28px'
      }}>
        {calculatedLoans.map((loan, idx) => {
          const isPreferred = preferredId === loan.id;
          const isLowestEmi = loan.emi === minEmi;
          const isLowestInterest = loan.totalInterest === minInterest;

          return (
            <div
              key={loan.id}
              className="cl-card"
              style={{
                borderTop: `4px solid ${loan.color}`,
                boxShadow: isPreferred
                  ? `0 0 0 2px var(--accent-amber), 0 8px 24px rgba(245, 158, 11, 0.2)`
                  : 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              {/* Card Header & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ flex: 1, marginRight: '8px' }}>
                  <input
                    type="text"
                    value={loan.name}
                    onChange={(e) => handleUpdateLoan(loan.id, 'name', e.target.value)}
                    style={{
                      fontWeight: '800',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      border: '1px solid transparent',
                      background: 'transparent',
                      padding: '2px 4px',
                      borderRadius: 'var(--radius-sm)',
                      width: '100%'
                    }}
                    onFocus={(e) => (e.target.style.border = '1px solid var(--border-subtle)')}
                    onBlur={(e) => (e.target.style.border = '1px solid transparent')}
                  />
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', paddingLeft: '4px' }}>
                    Option {idx + 1} &bull; Click title to rename
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Preferred Option Toggle */}
                  <button
                    type="button"
                    onClick={() => setPreferredId(isPreferred ? null : loan.id)}
                    style={{
                      background: isPreferred ? 'rgba(245, 158, 11, 0.15)' : 'none',
                      border: isPreferred ? '1px solid rgba(245, 158, 11, 0.3)' : 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      padding: '4px',
                      color: isPreferred ? '#f59e0b' : 'var(--text-muted)'
                    }}
                    title={isPreferred ? 'Preferred Option (Click to unset)' : 'Mark as Preferred Option'}
                  >
                    <Star size={18} fill={isPreferred ? '#f59e0b' : 'none'} />
                  </button>

                  {/* Import Saved Scenario */}
                  {savedScenarios.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImportModalSlot(loan.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--text-muted)'
                      }}
                      title="Import from Saved Scenarios"
                    >
                      <FolderOpen size={16} />
                    </button>
                  )}

                  {/* Remove Option Button */}
                  {loans.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(loan.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--text-muted)'
                      }}
                      title="Remove this option"
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Special Badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {isPreferred && (
                  <span className="cl-badge cl-badge-amber" style={{ fontSize: '0.7rem' }}>
                    ★ Preferred
                  </span>
                )}
                {isLowestEmi && (
                  <span className="cl-badge cl-badge-emerald" style={{ fontSize: '0.7rem' }}>
                    Lowest EMI
                  </span>
                )}
                {isLowestInterest && (
                  <span className="cl-badge cl-badge-blue" style={{ fontSize: '0.7rem' }}>
                    Lowest Interest
                  </span>
                )}
              </div>

              {/* Inputs */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.775rem' }}>
                  Principal Amount (₹)
                </label>
                <div className="form-input-wrapper">
                  <span className="input-prefix-pill input-prefix-indigo">₹</span>
                  <input
                    type="number"
                    min="10000"
                    step="25000"
                    value={loan.principal}
                    onChange={(e) => handleUpdateLoan(loan.id, 'principal', e.target.value)}
                    className="form-input has-prefix-pill has-suffix-pill input-indigo"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <span className="input-suffix-pill">INR</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.775rem' }}>
                  Interest Rate (% p.a.)
                </label>
                <div className="form-input-wrapper">
                  <span className="input-prefix-pill input-prefix-amber">%</span>
                  <input
                    type="number"
                    min="0"
                    max="36"
                    step="0.05"
                    value={loan.annualRate}
                    onChange={(e) => handleUpdateLoan(loan.id, 'annualRate', e.target.value)}
                    className="form-input has-prefix-pill has-suffix-pill input-amber"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <span className="input-suffix-pill">% p.a.</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.775rem' }}>
                  Tenure: {loan.tenureMonths} Months ({Math.round(loan.tenureMonths / 12 * 10) / 10} Yrs)
                </label>
                <div className="form-input-wrapper">
                  <span className="input-prefix-pill input-prefix-sky">⏱</span>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={loan.tenureMonths}
                    onChange={(e) => handleUpdateLoan(loan.id, 'tenureMonths', e.target.value)}
                    className="form-input has-prefix-pill has-suffix-pill input-sky"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <span className="input-suffix-pill">Months</span>
                </div>
                <div className="slider-container" style={{ marginTop: '8px' }}>
                  <input
                    type="range"
                    min="12"
                    max="360"
                    step="6"
                    value={loan.tenureMonths}
                    onChange={(e) => handleUpdateLoan(loan.id, 'tenureMonths', e.target.value)}
                    className="range-slider range-slider-sky"
                  />
                </div>
              </div>

              {/* Calculated Results Box */}
              <div style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderTop: `3px solid ${loan.color}`,
                padding: '14px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monthly EMI:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: loan.color }}>
                    {formatINR(loan.emi)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Interest:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {formatINR(loan.totalInterest)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Repayment:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {formatINR(loan.totalPayment)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Remaining Balance:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: loan.remainingBalance >= 0 ? '#10b981' : '#ef4444' }}>
                    {formatINR(loan.remainingBalance)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget Fit:</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    backgroundColor: loan.affordabilityBg,
                    color: loan.affordabilityColor
                  }}>
                    {loan.affordability}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Chart Comparison Across All Selected Loans */}
      <div className="cl-card-colored cl-card-purple" style={{ marginBottom: '28px' }}>
        <div className="cl-card-header">
          <div className="cl-card-title">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-purple-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <GitCompare size={18} />
            </div>
            <span>Comparative Cost Breakdown Across Loans</span>
          </div>
          <span className="cl-badge cl-badge-purple">
            Comparing EMI, Interest & Total Repayment
          </span>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="metric" stroke="var(--text-secondary)" fontSize={13} />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={12}
                tickFormatter={(val) => `₹${val >= 100000 ? (val / 100000).toFixed(1) + 'L' : (val / 1000) + 'k'}`}
              />
              <Tooltip formatter={(value) => [formatINR(value), '']} />
              <Legend verticalAlign="top" height={36} />
              {calculatedLoans.map((l) => (
                <Bar key={l.id} dataKey={l.name} fill={l.color} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gemini AI Comparative Analysis Card */}
      <div className="cl-card-colored cl-card-purple" style={{ marginBottom: '28px' }}>
        <div className="cl-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="cl-card-title">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-purple-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(168, 85, 247, 0.35)'
            }}>
              <Sparkles size={18} />
            </div>
            <span>AI Scenario Comparison Analysis</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="cl-badge cl-badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} />
              <span>{aiComparison?.source === 'gemini-ai' ? 'Gemini 3.8 Flash' : 'AI-Powered'}</span>
            </span>
            <button
              onClick={handleGenerateAiComparison}
              disabled={aiCompLoading}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} color="#8b5cf6" />
              <span>{aiCompLoading ? 'Analyzing...' : aiComparison ? 'Refresh Comparison' : 'Compare with Gemini AI'}</span>
            </button>
          </div>
        </div>

        {aiCompLoading && (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#8b5cf6', fontWeight: '600' }}>
              Evaluating interest trade-offs, budget resilience, and tenure curves with Gemini AI...
            </p>
          </div>
        )}

        {aiCompError && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.85rem' }}>
            {aiCompError}
          </div>
        )}

        {!aiCompLoading && !aiComparison && !aiCompError && (
          <div style={{ padding: '18px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Unsure which loan option fits your long-term financial goals?
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Gemini compares your {loans.length} options, contrasts total interest cost against monthly cashflow breathing room, and gives an objective verdict.
              </div>
            </div>
            <button
              onClick={handleGenerateAiComparison}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>Analyze with Gemini AI</span>
            </button>
          </div>
        )}

        {!aiCompLoading && aiComparison && (
          <div>
            <div style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {aiComparison.summary}
              </p>
            </div>

            {Array.isArray(aiComparison.keyTradeoffs) && aiComparison.keyTradeoffs.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                  <TrendingUp size={16} />
                  <span>Key Financial Trade-offs</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {aiComparison.keyTradeoffs.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiComparison.recommendation && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>
                  <Award size={16} />
                  <span>AI Recommendation</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {aiComparison.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Scenario Modal */}
      {importModalSlot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div className="cl-card" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>
              Import Saved Scenario into Option
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Select a saved scenario from your archive to populate this comparison option.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {savedScenarios.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => handleImportSaved(scen, importModalSlot)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-card)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.9rem' }}>
                    <span>{scen.name}</span>
                    <span style={{ color: 'var(--primary)' }}>{formatINR(scen.emi)}/mo</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {formatINR(scen.principal)} &bull; {scen.annualRate}% &bull; {scen.tenureMonths} mos
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setImportModalSlot(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
};
