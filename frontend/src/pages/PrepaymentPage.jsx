import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpCircle, 
  Sparkles, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Calendar, 
  Info,
  HelpCircle,
  Calculator,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { useLoan } from '../context/LoanContext';
import { simulatePrepayment, calculateEMI } from '../utils/loanCalculations';
import { formatINR, formatNumber } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';

export const PrepaymentPage = () => {
  const { loanParams } = useLoan();

  // Editable baseline loan parameters
  const [principal, setPrincipal] = useState(loanParams.principal || 1500000);
  const [annualRate, setAnnualRate] = useState(loanParams.annualRate || 8.5);
  const [tenureMonths, setTenureMonths] = useState(loanParams.tenureMonths || 60);

  // Prepayment parameters
  const [extraMonthly, setExtraMonthly] = useState(2500);
  const [lumpSumAmount, setLumpSumAmount] = useState(50000);
  const [lumpSumMonth, setLumpSumMonth] = useState(12);

  // Validate prepayment against principal to prevent invalid negative balances
  const validExtraMonthly = Math.max(0, Math.min(principal, Number(extraMonthly) || 0));
  const validLumpSum = Math.max(0, Math.min(principal, Number(lumpSumAmount) || 0));
  const validLumpSumMonth = Math.max(1, Math.min(tenureMonths, Number(lumpSumMonth) || 1));

  // Compute prepayment simulation
  const simulation = simulatePrepayment(
    principal,
    annualRate,
    tenureMonths,
    validExtraMonthly,
    validLumpSum,
    validLumpSumMonth
  );

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 className="page-title">Loan Prepayment & Early Payoff Simulator</h1>
          <p className="page-subtitle">
            Discover how paying an extra monthly amount or a one-time lump sum slashes total borrowing interest and accelerates your payoff date.
          </p>
        </div>
        <Link to="/calculator" className="btn btn-secondary">
          Back to EMI Calculator
        </Link>
      </div>

      {/* Hero Savings Summary Banner */}
      <div style={{
        backgroundColor: 'var(--status-comfortable-bg)',
        border: '1px solid var(--status-comfortable-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#10b981',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--status-comfortable-text)' }}>
              Total Estimated Interest Savings: {formatINR(simulation.interestSaved)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--status-comfortable-text)' }}>
              You save {simulation.percentageInterestSaved}% of total borrowing interest and finish {simulation.monthsSaved} months ({simulation.yearsSaved} years) early!
            </div>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--status-comfortable-border)' }}>
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--status-comfortable-text)', fontWeight: '600' }}>Original Tenure:</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>{simulation.originalTenure} Months</div>
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--status-comfortable-text)', fontWeight: '600' }}>New Accelerated Payoff:</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981' }}>{simulation.newTenureMonths} Months</div>
          </div>
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--status-comfortable-text)', fontWeight: '600' }}>Time Saved:</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981' }}>{simulation.monthsSaved} Months ({simulation.yearsSaved} yrs)</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Visual Comparisons */}
      <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '28px' }}>
        {/* Left: Prepayment Controls & Editable Loan */}
        <div className="cl-card cl-card-colored cl-card-emerald">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-emerald" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <ArrowUpCircle size={18} />
              </div>
              <span>Loan & Prepayment Parameters</span>
            </div>
            <span className="cl-badge" style={{ backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald-text)', border: '1px solid var(--accent-emerald-border)' }}>
              Editable Simulator
            </span>
          </div>

          {/* Editable Loan Parameters */}
          <div style={{
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid var(--accent-indigo)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              Base Loan Configuration:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Principal (₹)</label>
                <input
                  type="number"
                  min="10000"
                  step="25000"
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value) || 0))}
                  className="form-input input-indigo"
                  style={{ fontSize: '0.9rem', padding: '8px 12px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Rate (% p.a.)</label>
                <input
                  type="number"
                  min="0"
                  max="36"
                  step="0.1"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value) || 0))}
                  className="form-input input-amber"
                  style={{ fontSize: '0.9rem', padding: '8px 12px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Tenure (Mos)</label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                  className="form-input input-sky"
                  style={{ fontSize: '0.9rem', padding: '8px 12px', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* 1. Extra Monthly Payment */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Extra Monthly Principal Payment (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-indigo)', fontSize: '1.05rem' }}>+{formatINR(validExtraMonthly)}/mo</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-indigo">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={extraMonthly}
                onChange={(e) => setExtraMonthly(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-indigo"
              />
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max={Math.min(50000, principal)}
                step="500"
                value={validExtraMonthly}
                onChange={(e) => setExtraMonthly(Number(e.target.value))}
                className="range-slider range-slider-indigo"
              />
            </div>
            <div className="preset-chips">
              {[1000, 2500, 5000, 10000, 15000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setExtraMonthly(amt)}
                  className={`preset-chip preset-chip-indigo ${validExtraMonthly === amt ? 'active' : ''}`}
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. One-Time Lump Sum Prepayment */}
          <div className="form-group" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>One-Time Lump-Sum Prepayment (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>{formatINR(validLumpSum)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-emerald">₹</span>
              <input
                type="number"
                min="0"
                step="10000"
                value={lumpSumAmount}
                onChange={(e) => setLumpSumAmount(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-emerald"
              />
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max={Math.min(500000, principal)}
                step="10000"
                value={validLumpSum}
                onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                className="range-slider range-slider-emerald"
              />
            </div>
            <div className="preset-chips">
              {[0, 25000, 50000, 100000, 200000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLumpSumAmount(amt)}
                  className={`preset-chip preset-chip-emerald ${validLumpSum === amt ? 'active' : ''}`}
                >
                  {amt === 0 ? 'None' : formatINR(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Lump Sum Month */}
          {validLumpSum > 0 && (
            <div className="form-group" style={{ marginTop: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Apply Lump-Sum in Month #</label>
                <span style={{ fontWeight: '800', color: 'var(--accent-sky)', fontSize: '1.05rem' }}>Month {validLumpSumMonth} ({Math.ceil(validLumpSumMonth / 12)} yr)</span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.min(60, tenureMonths)}
                step="1"
                value={validLumpSumMonth}
                onChange={(e) => setLumpSumMonth(Number(e.target.value))}
                className="range-slider range-slider-sky"
              />
            </div>
          )}
        </div>

        {/* Right: Comparative Bar Chart & Key Takeaways */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="cl-card cl-card-colored cl-card-sky">
            <div className="cl-card-header">
              <div className="cl-card-title">
                <div className="kpi-icon-container kpi-icon-sky" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                  <TrendingDown size={18} />
                </div>
                <span>Borrowing Cost Comparison</span>
              </div>
              <span className="cl-badge" style={{ backgroundColor: 'var(--accent-sky-light)', color: 'var(--accent-sky-text)', border: '1px solid var(--accent-sky-border)' }}>
                Comparison
              </span>
            </div>

            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulation.chartComparison} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={13} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip formatter={(value) => [formatINR(value), '']} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="TotalInterest" name="Total Interest Paid" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="TotalRepayment" name="Total Repayment (P + I)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Original Total Paid</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {formatINR(simulation.originalTotalPaid)}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--status-comfortable-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--status-comfortable-text)' }}>New Total with Prepayment</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981' }}>
                  {formatINR(simulation.newTotalPaid)}
                </div>
              </div>
            </div>
          </div>

          <div className="cl-card" style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Info size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>How prepayment accelerates savings:</strong> Every rupee contributed beyond the scheduled EMI directly reduces your loan's <strong>outstanding principal balance</strong>. Because reducing balance interest charges compound against the principal, lowering it early cascades into massive interest savings and eliminates repayment months!
              </div>
            </div>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};
