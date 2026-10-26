import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  Wallet, 
  PiggyBank, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { calculateMaxAffordableLoan } from '../utils/loanCalculations';
import { formatINR, formatPercent } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const MaxLoanPage = () => {
  const { profile, updateLoanParams } = useLoan();
  const navigate = useNavigate();

  // Inputs initialized from user profile
  const [income, setIncome] = useState(profile.monthlyIncome || 85000);
  const [expenses, setExpenses] = useState(profile.monthlyExpenses || 32000);
  const [otherExpenses, setOtherExpenses] = useState(profile.otherExpenses || 6000);
  const [savingsTarget, setSavingsTarget] = useState(profile.monthlySavingsTarget || 15000);
  const [rate, setRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);

  const tenureMonths = Math.max(1, tenureYears * 12);

  // Run reverse loan calculation with otherExpenses included
  const maxLoan = calculateMaxAffordableLoan(
    income,
    expenses,
    profile.existingEmis,
    savingsTarget,
    rate,
    tenureMonths,
    otherExpenses
  );

  const totalDebtEmis = (profile.existingEmis || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalCombinedExpenses = Number(expenses) + Number(otherExpenses);
  const totalCommittedOutflow = totalCombinedExpenses + totalDebtEmis + maxLoan.maxAffordableEmi;
  const remainingMonthlyBalance = income - totalCommittedOutflow;

  const [calcError, setCalcError] = useState('');
  const [calcMessage, setCalcMessage] = useState('');

  const handleCalculateCapacity = () => {
    if (Number(income) <= 0) {
      setCalcError('Please enter a valid monthly take-home income greater than zero.');
      setCalcMessage('');
      return;
    }
    if (Number(tenureYears) <= 0) {
      setCalcError('Please enter a valid loan tenure of at least 1 year.');
      setCalcMessage('');
      return;
    }
    setCalcError('');
    setCalcMessage(`Successfully calculated maximum borrowing capacity: ${formatINR(maxLoan.maxPrincipal)}`);
  };

  const handleApplyToCalculator = () => {
    updateLoanParams({
      principal: maxLoan.maxPrincipal,
      annualRate: rate,
      tenureMonths: tenureMonths,
      tenureUnit: 'years'
    });
    navigate('/calculator');
  };

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">Loan Capacity</h1>
            <HelpTooltip text="Reverse-engineer your borrowing limit from monthly income, living expenses, other expenses, existing debt, and desired savings." placement="right" />
          </div>
        </div>
        <Link to="/calculator" className="btn btn-secondary">
          EMI Calculator
        </Link>
      </div>

      {/* Main Highlight Hero */}
      <div className="cl-card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        padding: '32px',
        marginBottom: '28px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 12px 30px -4px rgba(49, 46, 129, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className="kpi-icon-container kpi-icon-amber" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
            <Zap size={18} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe' }}>
            Estimated Maximum Affordable Borrowing Capacity
          </span>
        </div>

        <div style={{ fontSize: '2.9rem', fontWeight: '800', letterSpacing: '-0.025em', margin: '6px 0 20px', color: '#ffffff' }}>
          {formatINR(maxLoan.maxPrincipal)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#c7d2fe' }}>Estimated Monthly EMI</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>{formatINR(maxLoan.maxAffordableEmi)}/mo</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#c7d2fe' }}>Maximum Principal</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>{formatINR(maxLoan.maxPrincipal)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#c7d2fe' }}>Total Interest Payable</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fde047' }}>{formatINR(maxLoan.totalInterestAtMax)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#c7d2fe' }}>Remaining Monthly Balance</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: remainingMonthlyBalance >= 0 ? '#86efac' : '#fca5a5' }}>
              {formatINR(remainingMonthlyBalance)}/mo
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Financial Baseline Inputs vs Capacity Breakdown */}
      <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '28px' }}>
        {/* Left: Interactive Financial Inputs */}
        <div className="cl-card cl-card-colored cl-card-indigo">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <Sliders size={18} />
              </div>
              <span>Budget & Loan Parameters</span>
            </div>
          </div>

          {/* 1. Monthly Income */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Monthly Take-Home Income (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>{formatINR(income)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-emerald">₹</span>
              <input
                type="number"
                min="5000"
                step="2500"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-emerald"
              />
            </div>
            <input
              type="range"
              min="20000"
              max="300000"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="range-slider range-slider-emerald"
            />
          </div>

          {/* 2. Living Expenses */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Monthly Living Expenses (Rent, Food, Bills) (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-amber)', fontSize: '1.05rem' }}>{formatINR(expenses)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-amber">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={expenses}
                onChange={(e) => setExpenses(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-amber"
              />
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="2500"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="range-slider range-slider-amber"
            />
          </div>

          {/* 3. Other Monthly Expenses */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Other Monthly Expenses (Subscriptions, Misc) (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-rose)', fontSize: '1.05rem' }}>{formatINR(otherExpenses)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-rose">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-rose"
              />
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={otherExpenses}
              onChange={(e) => setOtherExpenses(Number(e.target.value))}
              className="range-slider range-slider-rose"
            />
          </div>

          {/* 4. Desired Monthly Savings Target */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Desired Monthly Savings Target (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-sky)', fontSize: '1.05rem' }}>{formatINR(savingsTarget)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-sky">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-sky"
              />
            </div>
            <input
              type="range"
              min="0"
              max="75000"
              step="1000"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(Number(e.target.value))}
              className="range-slider range-slider-sky"
            />
          </div>

          {/* 5. Expected Interest Rate */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Expected Interest Rate (% p.a.)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-amber)', fontSize: '1.05rem' }}>{rate}%</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-amber">%</span>
              <input
                type="number"
                min="0"
                max="36"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Math.max(0, Math.min(36, Number(e.target.value) || 0)))}
                className="form-input has-prefix-pill input-amber"
              />
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="0.25"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="range-slider range-slider-amber"
            />
          </div>

          {/* 6. Tenure */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Desired Tenure (Years)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-sky)', fontSize: '1.05rem' }}>{tenureYears} Years ({tenureMonths} mos)</span>
            </div>
            <div className="form-input-wrapper" style={{ marginBottom: '8px' }}>
              <span className="input-prefix-pill input-prefix-sky">⏱</span>
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => {
                  setTenureYears(Math.max(1, Math.min(30, Number(e.target.value) || 1)));
                  setCalcError('');
                }}
                className="form-input has-prefix-pill has-suffix-pill input-sky"
              />
              <span className="input-suffix-pill">Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => {
                setTenureYears(Math.max(1, Number(e.target.value)));
                setCalcError('');
              }}
              className="range-slider range-slider-sky"
            />
          </div>

          {calcError && (
            <div style={{
              backgroundColor: 'var(--status-risky-bg)',
              color: 'var(--status-risky-text)',
              border: '1px solid var(--status-risky-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.85rem',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{calcError}</span>
            </div>
          )}

          {calcMessage && (
            <div style={{
              backgroundColor: 'var(--status-comfortable-bg)',
              color: 'var(--status-comfortable-text)',
              border: '1px solid var(--status-comfortable-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.85rem',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{calcMessage}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '18px' }}>
            <button
              type="button"
              onClick={handleCalculateCapacity}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Calculate Capacity</span>
            </button>
            <button
              type="button"
              onClick={handleApplyToCalculator}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Apply to Calculator</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Cashflow Math & Capacity Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="cl-card cl-card-colored cl-card-purple">
            <div className="cl-card-header">
              <div className="cl-card-title">
                <div className="kpi-icon-container kpi-icon-purple" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                  <Wallet size={18} />
                </div>
                <span>Affordability Budget Breakdown</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Take-Home Income:</span>
                <span style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>{formatINR(income)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Less: Living Expenses:</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-amber)' }}>- {formatINR(expenses)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Less: Other Monthly Expenses:</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-rose)' }}>- {formatINR(otherExpenses)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Less: Existing EMIs ({profile.existingEmis.length} loans):</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-rose)' }}>- {formatINR(totalDebtEmis)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Less: Protected Monthly Savings:</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-sky)' }}>- {formatINR(savingsTarget)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-indigo-light)',
                border: '1px solid var(--accent-indigo-border)'
              }}>
                <span style={{ color: 'var(--accent-indigo-text)', fontWeight: '800' }}>Estimated Affordable Loan EMI:</span>
                <span style={{ color: 'var(--accent-indigo-text)', fontSize: '1.25rem', fontWeight: '800' }}>
                  {formatINR(maxLoan.maxAffordableEmi)}/mo
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Remaining Monthly Balance:</span>
                <span style={{ color: remainingMonthlyBalance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: '800' }}>
                  {formatINR(remainingMonthlyBalance)}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Info size={16} color="var(--accent-purple)" />
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Underlying Calculation Assumptions:</strong>
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
                <li><strong>Safe DTI Ceiling:</strong> Total monthly debt (existing EMIs + new loan) is capped at a conservative 40% of net take-home income.</li>
                <li><strong>Cashflow Balance:</strong> Living essentials, other discretionary costs, and chosen monthly savings are fully protected.</li>
                <li><strong>Reducing Balance Math:</strong> Principal capacity is computed by solving the standard compound EMI formula in reverse for the given rate and tenure.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};
