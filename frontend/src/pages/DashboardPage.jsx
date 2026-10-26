import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Calculator, 
  Calendar, 
  GitCompare, 
  BookmarkCheck, 
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowUpCircle,
  FileText,
  Sliders,
  ShieldAlert,
  PiggyBank,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';
import { formatINR, formatPercent } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { exportFullFinancialReport } from '../utils/reportGenerator';
import { generateAmortizationSchedule, calculateEMI } from '../utils/loanCalculations';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    profile, 
    loanParams, 
    updateLoanParams, 
    activeEmiData, 
    activeAffordability, 
    activeSolvency,
    savedScenarios, 
    loadScenarioIntoActive,
    showToast
  } = useLoan();

  // Quick on-dashboard what-if simulator state
  const [quickPrincipal, setQuickPrincipal] = useState(loanParams.principal);
  const [quickRate, setQuickRate] = useState(loanParams.annualRate);
  const [quickTenure, setQuickTenure] = useState(loanParams.tenureMonths);
  const [simError, setSimError] = useState('');
  const [simSuccess, setSimSuccess] = useState('');

  const quickEmi = calculateEMI(quickPrincipal || 0, quickRate || 0, quickTenure || 1);
  const quickSurplus = profile.monthlyIncome - (profile.monthlyExpenses + activeAffordability.totalExistingEmis + quickEmi.emi);

  const handleRunQuickSim = () => {
    if (!quickPrincipal || quickPrincipal <= 0) {
      setSimError('Please enter a valid loan principal amount greater than 0.');
      setSimSuccess('');
      return;
    }
    if (quickRate < 0) {
      setSimError('Interest rate cannot be negative.');
      setSimSuccess('');
      return;
    }
    if (!quickTenure || quickTenure <= 0) {
      setSimError('Loan tenure must be at least 1 month.');
      setSimSuccess('');
      return;
    }
    setSimError('');
    setSimSuccess(`Simulation calculated! Estimated EMI: ${formatINR(quickEmi.emi)}/mo.`);
  };

  const handleActivePlan = () => {
    if (!quickPrincipal || quickPrincipal <= 0) {
      setSimError('Please enter a valid loan principal amount before activating.');
      setSimSuccess('');
      return;
    }
    if (quickRate < 0) {
      setSimError('Interest rate cannot be negative.');
      setSimSuccess('');
      return;
    }
    if (!quickTenure || quickTenure <= 0) {
      setSimError('Loan tenure must be at least 1 month.');
      setSimSuccess('');
      return;
    }

    setSimError('');
    updateLoanParams({
      principal: Number(quickPrincipal),
      annualRate: Number(quickRate),
      tenureMonths: Number(quickTenure),
      tenureUnit: quickTenure % 12 === 0 ? 'years' : 'months'
    });

    const msg = `Active loan plan updated: ${formatINR(quickPrincipal)} at ${quickRate}% for ${quickTenure} mos (${formatINR(quickEmi.emi)}/mo).`;
    setSimSuccess(msg);
    if (showToast) showToast(msg, 'success');
  };

  const handleLoadActivePlan = () => {
    setQuickPrincipal(loanParams.principal);
    setQuickRate(loanParams.annualRate);
    setQuickTenure(loanParams.tenureMonths);
    setSimError('');
    const msg = `Loaded current active plan: ${formatINR(loanParams.principal)} at ${loanParams.annualRate}%.`;
    setSimSuccess(msg);
    if (showToast) showToast(msg, 'info');
  };

  const handleDownloadReport = () => {
    const { schedule } = generateAmortizationSchedule(
      loanParams.principal,
      loanParams.annualRate,
      loanParams.tenureMonths
    );
    exportFullFinancialReport(profile, loanParams, activeEmiData, activeSolvency, schedule, { savedScenarios, user });
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">
              Welcome back, {user?.name || 'Borrower'}
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadReport} className="btn btn-secondary">
            <FileText size={16} />
            <span>Full Report</span>
          </button>
          <Link to="/calculator" className="btn btn-primary">
            <Calculator size={16} />
            <span>New Calculation</span>
          </Link>
        </div>
      </div>

      {/* Empty Profile Onboarding for Authenticated Users with no income recorded yet */}
      {profile.monthlyIncome === 0 && (
        <div className="cl-card" style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          borderLeft: '5px solid var(--primary)',
          padding: '22px 26px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
              Action Required: Set Up Your Financial Profile
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '680px' }}>
              Your profile is currently empty. Enter your actual monthly income, living expenses, and any existing loans to unlock live solvency analysis and your maximum borrowing capacity.
            </p>
          </div>
          <Link to="/profile" className="btn btn-primary">
            Complete Profile Now
          </Link>
        </div>
      )}

      {/* CORE FEATURE: Solvency & Payability Hero Card */}
      <div className="cl-card" style={{
        backgroundColor: activeSolvency.verdictColor === 'emerald' ? 'var(--status-comfortable-bg)' : (activeSolvency.verdictColor === 'rose' ? 'var(--status-risky-bg)' : 'var(--status-tight-bg)'),
        borderColor: activeSolvency.verdictColor === 'emerald' ? 'var(--status-comfortable-border)' : (activeSolvency.verdictColor === 'rose' ? 'var(--status-risky-border)' : 'var(--status-tight-border)'),
        borderLeftWidth: '6px',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            {activeSolvency.isMonthlyPayable ? (
              <CheckCircle2 size={32} color={activeSolvency.verdictColor === 'emerald' ? '#10b981' : '#f59e0b'} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertTriangle size={32} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Loan Payability Verdict: {activeSolvency.verdict}
                </h3>
                <HelpTooltip text="Solvency assessment evaluating whether your current income and surplus cashflow can service the proposed loan." placement="right" />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '750px', lineHeight: 1.5 }}>
                {activeSolvency.verdictSummary}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/affordability" className="btn btn-primary btn-sm">
              In-depth Analysis
            </Link>
          </div>
        </div>

        {/* 3 Core Payability Checks */}
        <div className="grid-3" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>1. Monthly EMI Servicing</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: activeSolvency.isMonthlyPayable ? '#10b981' : '#ef4444', marginTop: '2px' }}>
              {activeSolvency.isMonthlyPayable ? `✓ Payable (${formatINR(activeSolvency.monthlyCashflowSurplus)} surplus)` : `✗ Deficit (${formatINR(Math.abs(activeSolvency.monthlyCashflowSurplus))})`}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>2. Total Outlay vs Projected Income</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: activeSolvency.isTotalPayable ? '#10b981' : '#ef4444', marginTop: '2px' }}>
              {activeSolvency.isTotalPayable ? `✓ Solvent (${formatINR(activeSolvency.totalPayment)} covered)` : '✗ Insolvent Outlay'}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>3. Monthly Savings Goal ({formatINR(profile.monthlySavingsTarget || 0)})</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: activeSolvency.isSavingsGoalMet ? '#10b981' : '#f59e0b', marginTop: '2px' }}>
              {activeSolvency.isSavingsGoalMet ? '✓ Goal Achieved' : `△ Short by ${formatINR(Math.abs(activeSolvency.surplusAfterSavingsGoal))}`}
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Financial Snapshot KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {/* Income */}
        <div className="kpi-stat-card kpi-emerald">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Monthly Income</div>
            </div>
            <div className="kpi-icon-container kpi-icon-emerald">
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatINR(profile.monthlyIncome)}
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill progress-emerald" style={{ width: '100%' }}></div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald-text)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <ArrowUpRight size={14} />
            <span>Primary take-home cashflow</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="kpi-stat-card kpi-amber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Living Expenses</div>
            </div>
            <div className="kpi-icon-container kpi-icon-amber">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatINR(profile.monthlyExpenses)}
          </div>
          {(() => {
            const expenseRatio = Math.min(100, Math.round(((profile.monthlyExpenses || 0) / (profile.monthlyIncome || 1)) * 100));
            return (
              <>
                <div className="stat-progress-bar">
                  <div className="stat-progress-fill progress-amber" style={{ width: `${expenseRatio}%` }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber-text)', fontWeight: '600', marginTop: '8px' }}>
                  {expenseRatio}% of monthly income
                </div>
              </>
            );
          })()}
        </div>

        {/* Existing EMIs */}
        <div className="kpi-stat-card kpi-rose">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Existing Loan EMIs</div>
            </div>
            <div className="kpi-icon-container kpi-icon-rose">
              <PieChart size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatINR(activeAffordability.totalExistingEmis)}
          </div>
          {(() => {
            const emiRatio = Math.min(100, Math.round(((activeAffordability.totalExistingEmis || 0) / (profile.monthlyIncome || 1)) * 100));
            return (
              <>
                <div className="stat-progress-bar">
                  <div className="stat-progress-fill progress-rose" style={{ width: `${emiRatio}%` }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose-text)', fontWeight: '600', marginTop: '8px' }}>
                  {profile.existingEmis.length} active loan commitment{profile.existingEmis.length !== 1 ? 's' : ''} ({emiRatio}%)
                </div>
              </>
            );
          })()}
        </div>

        {/* Net Available Cashflow */}
        <div className={`kpi-stat-card ${activeAffordability.remainingBalance >= 0 ? 'kpi-indigo' : 'kpi-rose'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Net Available Cash</div>
            </div>
            <div className={`kpi-icon-container ${activeAffordability.remainingBalance >= 0 ? 'kpi-icon-indigo' : 'kpi-icon-rose'}`}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: activeAffordability.remainingBalance >= 0 ? 'var(--text-primary)' : 'var(--accent-rose)', letterSpacing: '-0.02em' }}>
            {formatINR(activeAffordability.remainingBalance)}
          </div>
          {(() => {
            const freeRatio = Math.max(0, Math.min(100, Math.round(((activeAffordability.remainingBalance || 0) / (profile.monthlyIncome || 1)) * 100)));
            return (
              <>
                <div className="stat-progress-bar">
                  <div className={`stat-progress-fill ${activeAffordability.remainingBalance >= 0 ? 'progress-indigo' : 'progress-rose'}`} style={{ width: `${freeRatio}%` }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: activeAffordability.remainingBalance >= 0 ? 'var(--accent-indigo-text)' : 'var(--accent-rose-text)', fontWeight: '600', marginTop: '8px' }}>
                  {activeAffordability.remainingBalance >= 0 ? 'Surplus after living costs & proposed loan' : 'Cashflow deficit — high debt stress'}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Interactive What-If Loan Simulator & Advanced Tools Launchpad */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Real-time What-If Simulator on Dashboard */}
        <div className="cl-card cl-card-colored cl-card-indigo">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <Sliders size={18} />
              </div>
              <span>Loan Simulator</span>
              <HelpTooltip text="Test hypothetical loan amounts, interest rates, and tenures to preview immediate cashflow impacts." placement="top" />
            </div>
          </div>

          {simError && (
            <div style={{
              backgroundColor: 'var(--status-risky-bg)',
              color: 'var(--status-risky-text)',
              border: '1px solid var(--status-risky-border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '14px'
            }}>
              {simError}
            </div>
          )}

          {/* 1. Loan Principal Input & Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Loan Principal Amount (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-indigo)', fontSize: '1.05rem' }}>{formatINR(quickPrincipal)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-indigo">₹</span>
              <input
                type="number"
                min="1000"
                step="25000"
                value={quickPrincipal}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                  setQuickPrincipal(val === '' ? 0 : val);
                  setSimError('');
                }}
                className="form-input has-prefix-pill input-indigo"
                placeholder="Enter principal amount"
              />
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="25000"
              value={Math.min(5000000, Math.max(50000, quickPrincipal || 0))}
              onChange={(e) => {
                setQuickPrincipal(Number(e.target.value));
                setSimError('');
              }}
              className="range-slider range-slider-indigo"
            />
            <div className="preset-chips">
              {[200000, 500000, 1000000, 2500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setQuickPrincipal(preset);
                    setSimError('');
                  }}
                  className={`preset-chip preset-chip-indigo ${quickPrincipal === preset ? 'active' : ''}`}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Annual Interest Rate Input & Slider */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Annual Interest Rate (% p.a.)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-amber)', fontSize: '1.05rem' }}>{quickRate}% p.a.</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-amber">%</span>
              <input
                type="number"
                min="0"
                max="36"
                step="0.05"
                value={quickRate}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, Math.min(100, Number(e.target.value)));
                  setQuickRate(val === '' ? 0 : val);
                  setSimError('');
                }}
                className="form-input has-prefix-pill input-amber"
                placeholder="e.g. 8.75"
              />
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.25"
              value={Math.min(20, Math.max(0, quickRate || 0))}
              onChange={(e) => {
                setQuickRate(Number(e.target.value));
                setSimError('');
              }}
              className="range-slider range-slider-amber"
            />
            <div className="preset-chips">
              {[6.5, 8.5, 9.5, 12.0].map((ratePreset) => (
                <button
                  key={ratePreset}
                  type="button"
                  onClick={() => {
                    setQuickRate(ratePreset);
                    setSimError('');
                  }}
                  className={`preset-chip preset-chip-amber ${quickRate === ratePreset ? 'active' : ''}`}
                >
                  {ratePreset}%
                </button>
              ))}
            </div>
          </div>

          {/* 3. Loan Tenure Input & Slider */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Loan Tenure (Months)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-sky)', fontSize: '1.05rem' }}>
                {quickTenure} Months ({Math.round((quickTenure / 12) * 10) / 10} yrs)
              </span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-sky">⏱</span>
              <input
                type="number"
                min="1"
                max="360"
                step="1"
                value={quickTenure}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(1, Math.min(480, Math.round(Number(e.target.value))));
                  setQuickTenure(val === '' ? 1 : val);
                  setSimError('');
                }}
                className="form-input has-prefix-pill input-sky"
                placeholder="Enter tenure in months"
              />
            </div>
            <input
              type="range"
              min="6"
              max="240"
              step="6"
              value={Math.min(240, Math.max(6, quickTenure || 6))}
              onChange={(e) => {
                setQuickTenure(Number(e.target.value));
                setSimError('');
              }}
              className="range-slider range-slider-sky"
            />
          </div>

          {simSuccess && (
            <div style={{
              backgroundColor: 'var(--status-comfortable-bg)',
              color: 'var(--status-comfortable-text)',
              border: '1px solid var(--status-comfortable-border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginTop: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{simSuccess}</span>
            </div>
          )}

          {/* Action buttons: Calculate / Simulate & Active Plan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '14px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handleRunQuickSim}
              className="btn btn-secondary btn-sm"
              id="btn-simulate-loan"
            >
              <Calculator size={14} />
              <span>Simulate Loan</span>
            </button>
            <button
              type="button"
              onClick={handleActivePlan}
              className="btn btn-primary btn-sm"
              id="btn-active-plan"
              title="Apply simulated parameters as the active loan plan"
            >
              <CheckCircle2 size={14} />
              <span>Active Plan</span>
            </button>
            <button
              type="button"
              onClick={handleLoadActivePlan}
              className="btn btn-secondary btn-sm"
              id="btn-load-active-plan"
              title="Reload current active plan values into simulator"
            >
              <span>Load Active</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleActivePlan();
                navigate('/calculator');
              }}
              className="btn btn-secondary btn-sm"
              id="btn-open-calc"
              title="Apply plan and open full EMI Calculator"
            >
              <span>Calculator</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Results Summary Box */}
          <div style={{
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '14px'
          }}>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Monthly EMI</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
                {formatINR(quickEmi.emi)}<span style={{ fontSize: '0.75rem', fontWeight: '500' }}>/mo</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Interest</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
                {formatINR(quickEmi.totalInterest)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Repayment</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {formatINR(quickEmi.totalPayment)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Monthly Surplus</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: quickSurplus >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {formatINR(quickSurplus)}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Launchpad */}
        <div className="cl-card cl-card-colored cl-card-purple">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-purple" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <Sparkles size={18} />
              </div>
              <span>Simulators</span>
              <HelpTooltip text="Interactive simulation engines for borrowing capacity, early repayments, emergency funds, and loan comparisons." placement="top" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <Link 
              to="/max-loan" 
              className="sim-launch-card sim-indigo" 
              id="card-max-loan-capacity"
              aria-label="Open Max Loan Capacity Simulator"
            >
              <div>
                <div className="kpi-icon-container kpi-icon-indigo" style={{ marginBottom: '12px' }}>
                  <Zap size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>Loan Capacity</span>
                  <HelpTooltip text="Reverse budget calculation based on disposable income" placement="top" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-indigo)' }}>
                <span>Launch Tool</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link 
              to="/prepayment" 
              className="sim-launch-card sim-emerald" 
              id="card-prepayment-simulator"
              aria-label="Open Prepayment Simulator"
            >
              <div>
                <div className="kpi-icon-container kpi-icon-emerald" style={{ marginBottom: '12px' }}>
                  <ArrowUpCircle size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>Prepayment</span>
                  <HelpTooltip text="Early principal payoff & massive interest savings" placement="top" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                <span>Launch Tool</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link 
              to="/emergency-fund" 
              className="sim-launch-card sim-amber" 
              id="card-emergency-fund"
              aria-label="Open Emergency Fund Simulator"
            >
              <div>
                <div className="kpi-icon-container kpi-icon-amber" style={{ marginBottom: '12px' }}>
                  <ShieldAlert size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>Emergency Fund</span>
                  <HelpTooltip text="3–6 month liquidity cushion to protect loan solvency" placement="top" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-amber)' }}>
                <span>Launch Tool</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link 
              to="/compare" 
              className="sim-launch-card sim-purple" 
              id="card-compare-scenarios"
              aria-label="Open Compare Scenarios Simulator"
            >
              <div>
                <div className="kpi-icon-container kpi-icon-purple" style={{ marginBottom: '12px' }}>
                  <GitCompare size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>Compare Loans</span>
                  <HelpTooltip text="Side-by-side tenor & rate comparison with charts" placement="top" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-purple)' }}>
                <span>Launch Tool</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Scenarios Quick List */}
      <div className="cl-card cl-card-colored cl-card-sky" style={{ marginBottom: '28px' }}>
        <div className="cl-card-header">
          <div className="cl-card-title">
            <div className="kpi-icon-container kpi-icon-sky" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
              <BookmarkCheck size={18} />
            </div>
            <span>Saved Scenarios ({savedScenarios.length})</span>
            <HelpTooltip text="Review and reload previously saved hypothetical loan scenarios stored in your account." placement="top" />
          </div>
          <Link to="/saved-scenarios" className="btn btn-secondary btn-sm">
            View All Scenarios
          </Link>
        </div>

        {savedScenarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            No saved scenarios yet. Use the EMI Calculator to save hypothetical loans.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="cl-table">
              <thead>
                <tr>
                  <th>Scenario Name</th>
                  <th>Principal</th>
                  <th>Interest Rate</th>
                  <th>Tenure</th>
                  <th>Monthly EMI</th>
                  <th>Total Repayment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedScenarios.slice(0, 3).map((scen) => (
                  <tr key={scen.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {scen.name}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{scen.notes}</div>
                    </td>
                    <td>{formatINR(scen.principal)}</td>
                    <td>{scen.annualRate}%</td>
                    <td>{scen.tenureMonths} mos ({Math.round(scen.tenureMonths / 12 * 10) / 10} yrs)</td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatINR(scen.emi)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          loadScenarioIntoActive(scen);
                          navigate('/calculator');
                        }}
                        className="btn btn-outline-primary btn-sm"
                        id={`dash-load-scenario-${scen.id}`}
                      >
                        Load Scenario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
};
