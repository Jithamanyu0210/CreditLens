import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  PieChart as PieChartIcon, 
  Calendar, 
  BookmarkPlus, 
  ArrowRight, 
  Check, 
  Info,
  Layers,
  Sparkles,
  HelpCircle,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  FolderOpen,
  Save,
  Copy,
  Trash2,
  Clock,
  RefreshCw,
  BarChart3,
  X,
  CheckCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { useLoan } from '../context/LoanContext';
import { calculateEMI, assessLoanSolvency } from '../utils/loanCalculations';
import { formatINR, formatNumber } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const CalculatorPage = () => {
  const { 
    profile, 
    loanParams, 
    updateLoanParams, 
    savedScenarios, 
    saveScenario, 
    updateScenario, 
    deleteScenario 
  } = useLoan();
  const navigate = useNavigate();

  // Track if state update originated from current component to avoid feedback loops
  const isLocalUpdate = useRef(false);

  // Local state initialized from context
  const [principal, setPrincipal] = useState(loanParams.principal);
  const [annualRate, setAnnualRate] = useState(loanParams.annualRate);
  const [tenureUnit, setTenureUnit] = useState(loanParams.tenureUnit || 'years');
  const initialTenureVal = loanParams.tenureUnit === 'months' 
    ? loanParams.tenureMonths 
    : (loanParams.tenureMonths % 12 === 0 
        ? loanParams.tenureMonths / 12 
        : parseFloat((loanParams.tenureMonths / 12).toFixed(1)));
  const [tenureValue, setTenureValue] = useState(initialTenureVal);
  const [tenureInput, setTenureInput] = useState(String(initialTenureVal));
  const [tenureError, setTenureError] = useState('');
  const [calcError, setCalcError] = useState('');

  const handleCalculateEMI = () => {
    isLocalUpdate.current = true;
    setCalcError('');

    const p = Number(principal);
    if (isNaN(p) || p <= 0) {
      setCalcError('Please enter a valid loan principal amount greater than 0.');
      return;
    }

    const r = Number(annualRate);
    if (isNaN(r) || r < 0) {
      setCalcError('Please enter a valid interest rate (0% or higher).');
      return;
    }

    let t = Number(tenureInput);
    if (isNaN(t) || t <= 0) {
      setCalcError('Please enter a valid loan tenure greater than 0.');
      return;
    }

    const maxLimit = tenureUnit === 'years' ? 40 : 480;
    if (t > maxLimit) {
      setCalcError(`Maximum allowable tenure is ${maxLimit} ${tenureUnit}.`);
      return;
    }

    const calculatedMonths = tenureUnit === 'years' ? Math.max(1, Math.round(t * 12)) : Math.max(1, Math.round(t));

    // Calculate deterministic EMI
    const result = calculateEMI(p, r, calculatedMonths);
    if (isNaN(result.emi) || !isFinite(result.emi)) {
      setCalcError('Unable to calculate EMI with current values. Please verify loan parameters.');
      return;
    }

    // Sync to global context
    syncToContext(p, r, calculatedMonths, tenureUnit);
    if (showToast) {
      showToast('EMI calculated successfully!');
    }
  };

  // Loaded saved scenario tracking
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [savedPickerOpen, setSavedPickerOpen] = useState(false);

  // Stress test toggles
  const [rateStressActive, setRateStressActive] = useState(false);
  const [incomeStressActive, setIncomeStressActive] = useState(false);

  // Save Scenario Modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioNotes, setScenarioNotes] = useState('');

  // Save as copy modal
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyName, setCopyName] = useState('');

  // Sync state if loanParams in context changes externally (e.g. from saved scenario or navigation)
  useEffect(() => {
    if (isLocalUpdate.current) {
      isLocalUpdate.current = false;
      return;
    }
    setPrincipal(loanParams.principal);
    setAnnualRate(loanParams.annualRate);
    const unit = loanParams.tenureUnit || (loanParams.tenureMonths % 12 === 0 ? 'years' : 'months');
    setTenureUnit(unit);
    const val = unit === 'years' 
      ? (loanParams.tenureMonths % 12 === 0 
          ? loanParams.tenureMonths / 12 
          : parseFloat((loanParams.tenureMonths / 12).toFixed(1)))
      : loanParams.tenureMonths;
    setTenureValue(val);
    setTenureInput(String(val));
    setTenureError('');
  }, [loanParams.principal, loanParams.annualRate, loanParams.tenureMonths, loanParams.tenureUnit]);

  // Calculate tenure in total months safely
  const totalMonths = Math.max(1, tenureUnit === 'years' ? Math.round(Number(tenureValue) * 12) : Math.round(Number(tenureValue)));

  // Effective rate with stress test
  const effectiveRate = rateStressActive ? annualRate + 1.5 : annualRate;
  const effectiveIncome = incomeStressActive ? profile.monthlyIncome * 0.9 : profile.monthlyIncome;

  // Execute EMI calculation
  const emiResult = calculateEMI(principal, effectiveRate, totalMonths);

  // Live Solvency Assessment
  const solvency = assessLoanSolvency(
    effectiveIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    principal,
    effectiveRate,
    totalMonths,
    profile.monthlySavingsTarget || 15000,
    profile.otherExpenses || 0
  );

  // Find currently active loaded scenario object if any
  const activeScenario = savedScenarios.find((s) => s.id === activeScenarioId);

  // Sync to context helper
  const syncToContext = (newP, newR, newMonths, newUnit) => {
    updateLoanParams({
      principal: newP,
      annualRate: newR,
      tenureMonths: newMonths,
      tenureUnit: newUnit
    });
  };

  const handlePrincipalChange = (val) => {
    isLocalUpdate.current = true;
    const num = Math.max(0, Number(val));
    setPrincipal(num);
    syncToContext(num, annualRate, totalMonths, tenureUnit);
  };

  const handleRateChange = (val) => {
    isLocalUpdate.current = true;
    const num = Math.max(0, Math.min(100, Number(val)));
    setAnnualRate(num);
    syncToContext(principal, num, totalMonths, tenureUnit);
  };

  // Manual tenure update handlers (Task 2)
  const handleTenureInputChange = (rawVal) => {
    isLocalUpdate.current = true;
    setTenureInput(rawVal);

    if (rawVal === '' || rawVal === null || rawVal === undefined) {
      setTenureError('Please enter a loan tenure.');
      return;
    }

    const num = Number(rawVal);
    if (isNaN(num)) {
      setTenureError('Tenure must be a valid number.');
      return;
    }

    if (num <= 0) {
      setTenureError('Tenure must be greater than zero.');
      return;
    }

    const maxLimit = tenureUnit === 'years' ? 40 : 480;
    if (num > maxLimit) {
      setTenureError(`Maximum allowable tenure is ${maxLimit} ${tenureUnit}.`);
      return;
    }

    setTenureError('');
    setTenureValue(num);
    const calculatedMonths = tenureUnit === 'years' 
      ? Math.max(1, Math.round(num * 12)) 
      : Math.max(1, Math.round(num));
    syncToContext(principal, annualRate, calculatedMonths, tenureUnit);
  };

  const handleTenureInputBlur = () => {
    isLocalUpdate.current = true;
    if (tenureInput === '' || isNaN(Number(tenureInput)) || Number(tenureInput) <= 0) {
      const fallback = tenureUnit === 'years' ? 5 : 60;
      setTenureInput(String(fallback));
      setTenureValue(fallback);
      setTenureError('');
      const months = tenureUnit === 'years' ? fallback * 12 : fallback;
      syncToContext(principal, annualRate, months, tenureUnit);
    } else {
      const maxLimit = tenureUnit === 'years' ? 40 : 480;
      const parsed = Number(tenureInput);
      const validNum = Math.min(maxLimit, Math.max(0.1, parsed));
      const formattedNum = tenureUnit === 'years' 
        ? (Number.isInteger(validNum) ? validNum : Number(validNum.toFixed(2))) 
        : Math.round(validNum);
      setTenureInput(String(formattedNum));
      setTenureValue(formattedNum);
      setTenureError('');
      const months = tenureUnit === 'years' ? Math.max(1, Math.round(formattedNum * 12)) : Math.max(1, formattedNum);
      syncToContext(principal, annualRate, months, tenureUnit);
    }
  };

  const handleSliderTenureChange = (val) => {
    isLocalUpdate.current = true;
    const num = Math.max(1, Number(val));
    setTenureValue(num);
    setTenureInput(String(num));
    setTenureError('');
    const months = tenureUnit === 'years' ? Math.round(num * 12) : Math.round(num);
    syncToContext(principal, annualRate, months, tenureUnit);
  };

  const handleUnitToggle = (unit) => {
    if (unit === tenureUnit) return;
    isLocalUpdate.current = true;
    setTenureUnit(unit);
    let newTenureVal;
    if (unit === 'months') {
      newTenureVal = Math.round(Number(tenureValue) * 12);
    } else {
      const yrs = Number(tenureValue) / 12;
      newTenureVal = Number.isInteger(yrs) ? yrs : Number(yrs.toFixed(2));
    }
    setTenureValue(newTenureVal);
    setTenureInput(String(newTenureVal));
    setTenureError('');
    const months = unit === 'years' ? Math.round(newTenureVal * 12) : Math.round(newTenureVal);
    syncToContext(principal, annualRate, months, unit);
  };

  const applyTenureDirectly = (yearsVal) => {
    isLocalUpdate.current = true;
    setTenureUnit('years');
    setTenureValue(yearsVal);
    setTenureInput(String(yearsVal));
    setTenureError('');
    const months = Math.round(yearsVal * 12);
    syncToContext(principal, annualRate, months, 'years');
  };

  // Scenario Loading and Updating Handlers (Task 5)
  const handleOpenScenario = (scenario) => {
    setActiveScenarioId(scenario.id);
    setPrincipal(scenario.principal);
    setAnnualRate(scenario.annualRate);
    const unit = scenario.tenureMonths % 12 === 0 ? 'years' : 'months';
    setTenureUnit(unit);
    const tVal = unit === 'years' ? Math.max(1, Math.round(scenario.tenureMonths / 12)) : scenario.tenureMonths;
    setTenureValue(tVal);
    setTenureInput(String(tVal));
    setTenureError('');
    syncToContext(scenario.principal, scenario.annualRate, scenario.tenureMonths, unit);
    setSavedPickerOpen(false);
  };

  const handleUpdateActiveScenario = () => {
    if (!activeScenarioId) return;
    updateScenario(activeScenarioId, {
      principal,
      annualRate: effectiveRate,
      tenureMonths: totalMonths,
      emi: emiResult.emi,
      totalInterest: emiResult.totalInterest,
      totalPayment: emiResult.totalPayment
    });
  };

  const handleSaveCopySubmit = (e) => {
    e.preventDefault();
    saveScenario(
      copyName || `${activeScenario?.name || 'Loan'} (Copy)`,
      {
        principal,
        annualRate: effectiveRate,
        tenureMonths: totalMonths
      },
      `Copy of ${activeScenario?.name || 'scenario'}`
    );
    setCopyModalOpen(false);
    setCopyName('');
  };

  const handleDeleteActiveScenario = () => {
    if (!activeScenarioId) return;
    deleteScenario(activeScenarioId);
    setActiveScenarioId(null);
  };

  const handleSaveScenarioSubmit = (e) => {
    e.preventDefault();
    const created = saveScenario(
      scenarioName || `Loan of ${formatINR(principal)}`,
      {
        principal,
        annualRate: effectiveRate,
        tenureMonths: totalMonths
      },
      scenarioNotes
    );
    if (created) {
      setActiveScenarioId(created.id);
    }
    setSaveModalOpen(false);
    setScenarioName('');
    setScenarioNotes('');
  };

  // Chart data for Principal vs Total Interest
  const chartData = [
    { name: 'Principal Loan Amount', value: emiResult.principal, color: '#2563eb' },
    { name: 'Total Interest Payable', value: emiResult.totalInterest, color: '#f59e0b' }
  ];

  const principalRatio = emiResult.totalPayment > 0 
    ? ((emiResult.principal / emiResult.totalPayment) * 100).toFixed(1)
    : 100;
  const interestRatio = emiResult.totalPayment > 0 
    ? ((emiResult.totalInterest / emiResult.totalPayment) * 100).toFixed(1)
    : 0;

  // Task 1: Long-Term vs Short-Term Loan Scenario Analysis
  const currentTenureYears = Number((totalMonths / 12).toFixed(2));
  const baseStandardYears = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30];
  const standardTenuresYears = baseStandardYears.includes(currentTenureYears)
    ? baseStandardYears
    : [...baseStandardYears, currentTenureYears].sort((a, b) => a - b);
  const combinedLivingAndOtherExpenses = (profile.monthlyExpenses || 0) + (profile.otherExpenses || 0);
  const totalExistingDebt = (profile.existingEmis || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalBaselineOutflow = combinedLivingAndOtherExpenses + totalExistingDebt;

  const tenureComparisons = standardTenuresYears.map((years) => {
    const months = Math.round(years * 12);
    const calc = calculateEMI(principal, effectiveRate, months);
    const remainingMonthlyBalance = effectiveIncome - (totalBaselineOutflow + calc.emi);
    const emiShareOfIncome = (calc.emi / (effectiveIncome || 1)) * 100;
    
    // Budget fit determination based on financial profile
    let budgetFit = 'Comfortable';
    let budgetColor = '#10b981';
    let budgetBg = 'var(--status-comfortable-bg)';
    let fitScore = 3;

    if (remainingMonthlyBalance < 0) {
      budgetFit = 'Risky Deficit';
      budgetColor = '#ef4444';
      budgetBg = 'var(--status-risky-bg)';
      fitScore = 1;
    } else if (remainingMonthlyBalance < (profile.monthlySavingsTarget || 15000) || emiShareOfIncome > 40) {
      budgetFit = 'Tight Budget';
      budgetColor = '#d97706';
      budgetBg = 'var(--status-tight-bg)';
      fitScore = 2;
    }

    return {
      years,
      months,
      label: years % 1 === 0 ? `${years} ${years === 1 ? 'Year' : 'Years'}` : `${years} Yrs (${months} mo)`,
      emi: calc.emi,
      totalInterest: calc.totalInterest,
      totalPayment: calc.totalPayment,
      remainingMonthlyBalance,
      emiShareOfIncome: emiShareOfIncome.toFixed(1),
      budgetFit,
      budgetColor,
      budgetBg,
      fitScore,
      isCurrent: months === totalMonths
    };
  });

  // Balanced recommendation: find shortest tenure that is "Comfortable" (saving maximum interest while staying safe)
  const comfortableOption = tenureComparisons.find((t) => t.fitScore === 3);
  const tightOption = tenureComparisons.find((t) => t.fitScore === 2);
  const recommendedTenure = comfortableOption || tightOption || tenureComparisons[tenureComparisons.length - 1];

  // Recharts bar chart data for tenure comparison
  const tenureChartData = tenureComparisons.map((t) => ({
    name: `${t.years}y`,
    years: t.years,
    emi: Math.round(t.emi),
    interest: Math.round(t.totalInterest),
    remaining: Math.round(t.remainingMonthlyBalance)
  }));

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">EMI Calculator</h1>
            <HelpTooltip text="Fine-tune loan principal, annual interest rate, and tenure with real-time reducing-balance amortization and solvency payability checks." placement="right" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Saved Scenarios Selector */}
          <button
            onClick={() => setSavedPickerOpen(true)}
            className="btn btn-secondary"
            title="Open a previously saved scenario"
          >
            <FolderOpen size={16} />
            <span>Load Saved ({savedScenarios.length})</span>
          </button>

          <button
            onClick={() => {
              setScenarioName(activeScenario ? `${activeScenario.name} (Updated)` : `Loan ${formatINR(principal)} (${annualRate}%)`);
              setSaveModalOpen(true);
            }}
            className="btn btn-secondary"
          >
            <BookmarkPlus size={16} />
            <span>Save Scenario</span>
          </button>

          <Link to="/affordability" className="btn btn-primary">
            <span>Affordability Insights</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Task 5: Active Loaded Scenario Banner */}
      {activeScenario && (
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookmarkPlus size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Editing Saved Scenario
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {activeScenario.name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleUpdateActiveScenario}
              className="btn btn-primary btn-sm"
              title="Save current parameters back into this scenario"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => {
                setCopyName(`${activeScenario.name} (Copy)`);
                setCopyModalOpen(true);
              }}
              className="btn btn-secondary btn-sm"
              title="Create a duplicate copy of this scenario"
            >
              <Copy size={14} />
              <span>Save Copy</span>
            </button>
            <button
              onClick={handleDeleteActiveScenario}
              className="btn btn-secondary btn-sm"
              style={{ color: '#ef4444' }}
              title="Delete this saved scenario"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setActiveScenarioId(null)}
              className="btn btn-secondary btn-sm"
              title="Unlink and start a clean scenario"
            >
              <X size={14} />
              <span>Unlink</span>
            </button>
          </div>
        </div>
      )}

      {/* CORE FEATURE: Solvency & Payability Highlight Badge */}
      <div style={{
        backgroundColor: solvency.verdictColor === 'emerald' ? 'var(--status-comfortable-bg)' : (solvency.verdictColor === 'rose' ? 'var(--status-risky-bg)' : 'var(--status-tight-bg)'),
        border: `1px solid ${solvency.verdictColor === 'emerald' ? 'var(--status-comfortable-border)' : (solvency.verdictColor === 'rose' ? 'var(--status-risky-border)' : 'var(--status-tight-border)')}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {solvency.isMonthlyPayable ? (
            <CheckCircle2 size={24} color={solvency.verdictColor === 'emerald' ? '#10b981' : '#f59e0b'} />
          ) : (
            <AlertTriangle size={24} color="#ef4444" />
          )}
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Loan Payability Verdict: {solvency.verdict}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Monthly Net Cash Surplus: <strong>{formatINR(solvency.monthlyCashflowSurplus)}</strong> &bull; Total Repayment: <strong>{formatINR(solvency.totalPayment)}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/prepayment" className="btn btn-secondary btn-sm">
            Prepayment Simulator
          </Link>
          <Link to="/max-loan" className="btn btn-secondary btn-sm">
            Max Loan Capacity
          </Link>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '32px' }}>
        {/* Left Column: Interactive Inputs & What-If Sliders */}
        <div className="cl-card cl-card-colored cl-card-indigo">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <Calculator size={18} />
              </div>
              <span>Loan Parameters & What-If Simulator</span>
            </div>
          </div>

          {/* 1. Principal Amount */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" htmlFor="calc-principal" style={{ margin: 0 }}>
                <span>Loan Principal Amount (₹)</span>
              </label>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
                {formatINR(principal)}
              </span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-indigo">₹</span>
              <input
                id="calc-principal"
                type="number"
                min="10000"
                max="20000000"
                step="10000"
                value={principal}
                onChange={(e) => handlePrincipalChange(e.target.value)}
                className="form-input has-prefix-pill has-suffix-pill input-indigo"
              />
              <span className="input-suffix-pill">INR</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="50000"
                max="10000000"
                step="25000"
                value={principal}
                onChange={(e) => handlePrincipalChange(e.target.value)}
                className="range-slider range-slider-indigo"
              />
            </div>
            <div className="preset-chips">
              {[100000, 500000, 1000000, 2500000, 5000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePrincipalChange(preset)}
                  className={`preset-chip preset-chip-indigo ${principal === preset ? 'active' : ''}`}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Annual Interest Rate */}
          <div className="form-group" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" htmlFor="calc-rate" style={{ margin: 0 }}>
                <span>Annual Interest Rate (% p.a.)</span>
              </label>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
                {effectiveRate.toFixed(2)}% {rateStressActive && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: '600' }}>(+1.5% Stress)</span>}
              </span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-amber">%</span>
              <input
                id="calc-rate"
                type="number"
                min="0"
                max="36"
                step="0.05"
                value={annualRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="form-input has-prefix-pill has-suffix-pill input-amber"
              />
              <span className="input-suffix-pill">% p.a.</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="24"
                step="0.1"
                value={annualRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="range-slider range-slider-amber"
              />
            </div>
            <div className="preset-chips">
              {[0, 6.5, 8.5, 9.25, 11.0, 14.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleRateChange(preset)}
                  className={`preset-chip preset-chip-amber ${annualRate === preset ? 'active' : ''}`}
                >
                  {preset === 0 ? '0% (Promotional)' : `${preset}%`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tenure - TASK 2: Fully Editable Manual Updates with Strict Sync */}
          <div className="form-group" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" htmlFor="calc-tenure" style={{ margin: 0 }}>
                <span>Loan Tenure ({tenureUnit === 'years' ? 'Years' : 'Months'})</span>
              </label>
              <div style={{ display: 'flex', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('years')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.775rem',
                    fontWeight: tenureUnit === 'years' ? '800' : '600',
                    background: tenureUnit === 'years' ? 'var(--accent-sky-light)' : 'transparent',
                    color: tenureUnit === 'years' ? 'var(--accent-sky-text)' : 'var(--text-secondary)',
                    border: tenureUnit === 'years' ? '1px solid var(--accent-sky-border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  Years
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('months')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.775rem',
                    fontWeight: tenureUnit === 'months' ? '800' : '600',
                    background: tenureUnit === 'months' ? 'var(--accent-sky-light)' : 'transparent',
                    color: tenureUnit === 'months' ? 'var(--accent-sky-text)' : 'var(--text-secondary)',
                    border: tenureUnit === 'months' ? '1px solid var(--accent-sky-border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  Months
                </button>
              </div>
            </div>

            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-sky">⏱</span>
              <input
                id="calc-tenure"
                type="number"
                min="1"
                max={tenureUnit === 'years' ? 40 : 480}
                step={tenureUnit === 'years' ? "any" : "1"}
                value={tenureInput}
                onChange={(e) => handleTenureInputChange(e.target.value)}
                onBlur={handleTenureInputBlur}
                className="form-input has-prefix-pill has-suffix-pill input-sky"
                placeholder={`Enter tenure in ${tenureUnit}`}
              />
              <span className="input-suffix-pill">{tenureUnit === 'years' ? 'Years' : 'Months'}</span>
            </div>

            {tenureError && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '4px', fontWeight: '600' }}>
                {tenureError}
              </div>
            )}

            <div className="slider-container">
              <input
                id="calc-tenure-slider"
                type="range"
                min="1"
                max={tenureUnit === 'years' ? 30 : 360}
                step="1"
                value={Math.round(tenureValue) || 1}
                onChange={(e) => handleSliderTenureChange(e.target.value)}
                className="range-slider range-slider-sky"
              />
            </div>

            {/* Quick Preset Tenure Chips */}
            <div className="preset-chips" style={{ marginTop: '8px' }}>
              {(tenureUnit === 'years' 
                ? [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30] 
                : [6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 84, 120]
              ).map((preset) => (
                <button
                  key={preset}
                  id={`calc-preset-tenure-${preset}${tenureUnit === 'years' ? 'y' : 'm'}`}
                  type="button"
                  onClick={() => {
                    isLocalUpdate.current = true;
                    setTenureValue(preset);
                    setTenureInput(String(preset));
                    setTenureError('');
                    const months = tenureUnit === 'years' ? preset * 12 : preset;
                    syncToContext(principal, annualRate, months, tenureUnit);
                  }}
                  className={`preset-chip preset-chip-sky ${Number(tenureValue) === preset ? 'active' : ''}`}
                >
                  {preset} {tenureUnit === 'years' ? (preset === 1 ? 'yr' : 'yrs') : 'mo'}
                </button>
              ))}
            </div>
          </div>

          {/* Stress-Testing Toggles */}
          <div style={{
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid var(--accent-amber)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginTop: '22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              <Sparkles size={16} color="var(--accent-amber)" />
              <span>Stress-Test What-If Scenarios</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setRateStressActive(!rateStressActive)}
                className={`preset-chip ${rateStressActive ? 'preset-chip-amber active' : ''}`}
              >
                {rateStressActive ? '✓ +1.5% Interest Hike Active' : '+ What if Rate Rises 1.5%?'}
              </button>
              <button
                type="button"
                onClick={() => setIncomeStressActive(!incomeStressActive)}
                className={`preset-chip ${incomeStressActive ? 'preset-chip-amber active' : ''}`}
              >
                {incomeStressActive ? '✓ -10% Income Drop Active' : '- What if Income Drops 10%?'}
              </button>
            </div>
          </div>

          {calcError && (
            <div style={{
              backgroundColor: 'var(--status-risky-bg)',
              color: 'var(--status-risky-text)',
              border: '1px solid var(--status-risky-border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginTop: '16px'
            }}>
              {calcError}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleCalculateEMI}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
              }}
              id="btn-calculate-emi"
            >
              <Calculator size={18} />
              <span>Calculate EMI</span>
            </button>
          </div>
        </div>

        {/* Right Column: Calculated Results & Donut Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main EMI Highlight Card */}
          <div className="cl-card" style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
            color: '#ffffff',
            boxShadow: '0 12px 30px -4px rgba(49, 46, 129, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <div style={{ fontSize: '0.875rem', color: '#c7d2fe', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Calculated Monthly Payment (EMI)
            </div>
            <div style={{ fontSize: '2.75rem', fontWeight: '800', margin: '8px 0 16px', letterSpacing: '-0.025em', color: '#ffffff' }}>
              {formatINR(emiResult.emi)}
              <span style={{ fontSize: '1.05rem', fontWeight: '600', color: '#a5b4fc' }}> / month</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#c7d2fe' }}>Total Interest Payable</div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fde047' }}>
                  {formatINR(emiResult.totalInterest)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#c7d2fe' }}>Total Repayment Outlay</div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>
                  {formatINR(emiResult.totalPayment)}
                </div>
              </div>
            </div>
          </div>

          {/* Principal vs Interest Breakdown Chart */}
          <div className="cl-card cl-card-colored cl-card-purple">
            <div className="cl-card-header">
              <div className="cl-card-title">
                <div className="kpi-icon-container kpi-icon-purple" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                  <PieChartIcon size={18} />
                </div>
                <span>Payment Composition</span>
              </div>
            </div>

            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div style={{ backgroundColor: 'var(--accent-indigo-light)', border: '1px solid var(--accent-indigo-border)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-indigo-text)', fontWeight: '700' }}>Principal Share</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>{principalRatio}%</div>
              </div>
              <div style={{ backgroundColor: 'var(--accent-amber-light)', border: '1px solid var(--accent-amber-border)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber-text)', fontWeight: '700' }}>Interest Share</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-amber)' }}>{interestRatio}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Link to="/schedule" className="btn btn-secondary" style={{ flex: 1 }}>
                <Calendar size={15} />
                <span>Full Schedule</span>
              </Link>
              <Link to="/prepayment" className="btn btn-primary" style={{ flex: 1 }}>
                <span>Prepay & Save</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TASK 1: Long-Term vs Short-Term Loan Scenario Analysis */}
      <div className="cl-card cl-card-colored cl-card-sky" style={{ marginBottom: '32px' }}>
        <div className="cl-card-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-sky" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <BarChart3 size={18} />
              </div>
              <span>Tenure Analysis</span>
            </div>
          </div>
        </div>

        {/* Trade-off Explanation Banner */}
        <div style={{
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Understanding the Tenure Trade-Off
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #10b981' }}>
              <strong style={{ color: 'var(--text-primary)' }}>⚡ Shorter Tenures (1–5 Yrs):</strong>
              <div style={{ marginTop: '2px' }}>
                Higher monthly EMI, but dramatically lower total interest paid. Best if your surplus comfortably accommodates the monthly outflow.
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f59e0b' }}>
              <strong style={{ color: 'var(--text-primary)' }}>⏳ Longer Tenures (10–25 Yrs):</strong>
              <div style={{ marginTop: '2px' }}>
                Lower monthly EMI preserving emergency room in your monthly budget, but accumulates substantially higher total interest cost over time.
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #2563eb' }}>
              <strong style={{ color: 'var(--text-primary)' }}>🎯 Recommended Balance:</strong>
              <div style={{ marginTop: '2px' }}>
                <strong>{recommendedTenure.label}</strong> ({formatINR(recommendedTenure.emi)}/mo) — keeps EMI within your safe cashflow while avoiding excessive borrowing interest.
              </div>
            </div>
          </div>
        </div>

        {/* Visual Comparison Chart: EMI vs Total Interest */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Tenure Cost Progression: Monthly EMI vs Cumulative Total Interest
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureChartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  formatter={(val, name) => [
                    formatINR(val),
                    name === 'emi' ? 'Monthly EMI' : 'Total Interest'
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="emi" fill="#2563eb" name="Monthly EMI (₹)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interest" fill="#f59e0b" name="Total Interest Payable (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Tenure Options Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="cl-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Tenure</th>
                <th>Monthly EMI</th>
                <th>Total Interest</th>
                <th>Total Repayment</th>
                <th>Remaining Monthly Balance</th>
                <th>Budget Fit Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tenureComparisons.map((row) => (
                <tr
                  key={row.years}
                  style={{
                    backgroundColor: row.isCurrent ? 'var(--primary-light)' : 'transparent',
                    fontWeight: row.isCurrent ? '600' : 'normal'
                  }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong>{row.label}</strong>
                      {row.isCurrent && (
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>
                          (Current)
                        </span>
                      )}
                      {recommendedTenure.years === row.years && !row.isCurrent && (
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-emerald-text)' }}>
                          (Recommended)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {formatINR(row.emi)}
                  </td>
                  <td style={{ color: '#d97706', fontWeight: '600' }}>
                    {formatINR(row.totalInterest)}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {formatINR(row.totalPayment)}
                  </td>
                  <td style={{ color: row.remainingMonthlyBalance >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                    {formatINR(row.remainingMonthlyBalance)}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: row.budgetBg,
                      color: row.budgetColor
                    }}>
                      {row.budgetFit}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {row.isCurrent ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => applyTenureDirectly(row.years)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Apply Tenure
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task 5: Saved Scenarios Picker Modal */}
      {savedPickerOpen && (
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
          <div className="cl-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Load Saved Scenario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSavedPickerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {savedScenarios.length === 0 ? (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}>
                  No saved scenarios found. You can configure loan parameters and click "Save Scenario" to build your library.
                </div>
              ) : (
                savedScenarios.map((scen) => (
                  <div
                    key={scen.id}
                    onClick={() => handleOpenScenario(scen)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: scen.id === activeScenarioId ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: scen.id === activeScenarioId ? 'var(--primary-light)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {scen.name}
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.85rem' }}>
                        EMI: {formatINR(scen.emi)}/mo
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Principal: <strong>{formatINR(scen.principal)}</strong></span>
                      <span>Rate: <strong>{scen.annualRate}%</strong></span>
                      <span>Tenure: <strong>{scen.tenureMonths} mos ({Math.round(scen.tenureMonths / 12)} yrs)</strong></span>
                    </div>

                    {scen.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                        "{scen.notes}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setSavedPickerOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Scenario Modal */}
      {saveModalOpen && (
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
          <div className="cl-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>
              Save Loan Scenario
            </h3>

            <form onSubmit={handleSaveScenarioSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-scen-name">Scenario Name / Label</label>
                <input
                  id="modal-scen-name"
                  type="text"
                  placeholder="e.g. Dream House Mortgage"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-scen-notes">Notes / Purpose (Optional)</label>
                <textarea
                  id="modal-scen-notes"
                  rows={2}
                  placeholder="e.g. Bank offering 8.5% with zero processing fee"
                  value={scenarioNotes}
                  onChange={(e) => setScenarioNotes(e.target.value)}
                  className="form-input"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Summary: <strong>{formatINR(principal)}</strong> @ <strong>{effectiveRate}%</strong> for <strong>{totalMonths} mos</strong> &bull; EMI: <strong>{formatINR(emiResult.emi)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Copy Modal */}
      {copyModalOpen && (
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
          <div className="cl-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>
              Save Copy of Scenario
            </h3>

            <form onSubmit={handleSaveCopySubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-copy-name">Duplicate Scenario Name</label>
                <input
                  id="modal-copy-name"
                  type="text"
                  value={copyName}
                  onChange={(e) => setCopyName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setCopyModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
};
