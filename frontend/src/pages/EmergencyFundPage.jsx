import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  PiggyBank, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info,
  Sliders
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useLoan } from '../context/LoanContext';
import { formatINR } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const EmergencyFundPage = () => {
  const { profile, updateProfile } = useLoan();

  // Baseline essential expenses (living + other expenses)
  const defaultEssential = (profile.monthlyExpenses || 32000) + (profile.otherExpenses || 6000);
  const [essentialExpenses, setEssentialExpenses] = useState(defaultEssential);
  const [currentSavings, setCurrentSavings] = useState(profile.currentSavings || 180000);
  const [targetMonthsChoice, setTargetMonthsChoice] = useState(6);

  const [calcError, setCalcError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Calculations independent of loan eligibility
  const validExpenses = Math.max(1000, Number(essentialExpenses) || 1000);
  const validSavings = Math.max(0, Number(currentSavings) || 0);
  const recommendedFund = validExpenses * targetMonthsChoice;
  const shortfall = Math.max(0, recommendedFund - validSavings);
  const excess = Math.max(0, validSavings - recommendedFund);
  const progressPercent = Math.min(100, Math.round((validSavings / (recommendedFund || 1)) * 100));
  const monthsCovered = (validSavings / validExpenses).toFixed(1);

  const isHealthy = Number(monthsCovered) >= targetMonthsChoice;
  const isModerate = Number(monthsCovered) >= 3 && !isHealthy;
  const isLow = Number(monthsCovered) < 3;

  const target3Months = validExpenses * 3;
  const target6Months = validExpenses * 6;
  const target9Months = validExpenses * 9;
  const target12Months = validExpenses * 12;

  const chartData = [
    { name: 'Current Savings', Amount: validSavings, fill: '#3b82f6' },
    { name: '3-Month Basic', Amount: target3Months, fill: '#f59e0b' },
    { name: '6-Month Target', Amount: target6Months, fill: '#10b981' },
    { name: '12-Month Fortress', Amount: target12Months, fill: '#8b5cf6' }
  ];

  const handleCalculateRunway = () => {
    if (Number(essentialExpenses) <= 0) {
      setCalcError('Please enter essential monthly living expenses greater than zero.');
      setStatusMessage('');
      return;
    }
    setCalcError('');
    setStatusMessage(`Runway calculated: ${monthsCovered} months of living reserves (${formatINR(validSavings)} of ${formatINR(recommendedFund)} recommended).`);
  };

  const handleSaveToProfile = () => {
    updateProfile({ currentSavings: validSavings });
    setStatusMessage(`Current savings of ${formatINR(validSavings)} saved to your profile!`);
    setCalcError('');
  };

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">Emergency Fund</h1>
            <HelpTooltip text="Calculate and track your essential living safety runway. Keep family reserves protected independent of loan borrowing calculations." placement="right" />
          </div>
        </div>
        <Link to="/profile" className="btn btn-secondary">
          Profile
        </Link>
      </div>

      {/* Runway Status Hero */}
      <div style={{
        backgroundColor: isHealthy ? 'var(--status-comfortable-bg)' : (isLow ? 'var(--status-risky-bg)' : 'var(--status-tight-bg)'),
        border: `1px solid ${isHealthy ? 'var(--status-comfortable-border)' : (isLow ? 'var(--status-risky-border)' : 'var(--status-tight-border)')}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          {isHealthy ? (
            <ShieldCheck size={36} color="#10b981" />
          ) : (
            <ShieldAlert size={36} color={isLow ? '#ef4444' : '#f59e0b'} />
          )}
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Current Emergency Runway: {monthsCovered} Months
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Essential Monthly Living Burn Rate: <strong>{formatINR(validExpenses)}/month</strong> &bull; Target Goal: <strong>{targetMonthsChoice} Months</strong>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
            <span>Target Progress ({progressPercent}%)</span>
            <span>{formatINR(validSavings)} / {formatINR(recommendedFund)}</span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(0, 0, 0, 0.08)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: isHealthy ? '#10b981' : (isLow ? '#ef4444' : '#f59e0b'),
              borderRadius: '5px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '12px', marginBottom: 0 }}>
          {isHealthy 
            ? `Excellent resilience! Your liquid savings cover ${monthsCovered} months of essential expenses, fully meeting your ${targetMonthsChoice}-month safety target.`
            : (isLow
              ? `Caution: You currently have only ${monthsCovered} months of emergency runway. Financial planners strongly advise securing at least 3 to 6 months of essentials before taking on large debts.`
              : `Moderate reserve: You have ${monthsCovered} months covered. You have a shortfall of ${formatINR(shortfall)} to reach your full ${targetMonthsChoice}-month target.`)}
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '28px' }}>
        {/* Left: Inputs & Targets */}
        <div className="cl-card cl-card-colored cl-card-amber">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-amber" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <PiggyBank size={18} />
              </div>
              <span>Reserve & Essential Expenses Settings</span>
            </div>
          </div>

          {/* 1. Essential Monthly Expenses */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Essential Monthly Expenses (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-amber)', fontSize: '1.05rem' }}>{formatINR(validExpenses)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-amber">₹</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={essentialExpenses}
                onChange={(e) => setEssentialExpenses(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-amber"
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Non-negotiable baseline: rent, groceries, medicines, utilities, and mandatory bills.
            </span>
          </div>

          {/* 2. Current Liquid Savings */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Current Liquid Emergency Savings (₹)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>{formatINR(validSavings)}</span>
            </div>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-emerald">₹</span>
              <input
                type="number"
                min="0"
                step="5000"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Math.max(0, Number(e.target.value) || 0))}
                className="form-input has-prefix-pill input-emerald"
              />
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={validSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className="range-slider range-slider-emerald"
              />
            </div>
          </div>

          {/* 3. Chosen Target Runway Choice */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label" style={{ marginBottom: '8px' }}>Chosen Target Runway</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTargetMonthsChoice(m)}
                  className={`btn ${targetMonthsChoice === m ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  {m} Mos
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Box */}
          <div style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Recommended Emergency Fund:</span>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{formatINR(recommendedFund)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Reserves:</span>
              <span style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>{formatINR(validSavings)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Current Shortfall / Gap:</span>
              <span style={{ fontWeight: '800', color: shortfall === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {shortfall === 0 ? `Target Reached (+${formatINR(excess)}) 🎉` : formatINR(shortfall)}
              </span>
            </div>
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

          {statusMessage && (
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
              <span>{statusMessage}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '18px' }}>
            <button
              type="button"
              onClick={handleCalculateRunway}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Calculate Runway</span>
            </button>
            <button
              type="button"
              onClick={handleSaveToProfile}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Save to Profile</span>
            </button>
          </div>
        </div>

        {/* Right: Visual Benchmarks Chart */}
        <div className="cl-card cl-card-colored cl-card-sky">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-sky" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <Calendar size={18} />
              </div>
              <span>Runway Benchmarks Comparison</span>
            </div>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip formatter={(val) => [formatINR(val), 'Amount']} />
                <Bar dataKey="Amount" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            marginTop: '16px',
            display: 'flex',
            gap: '10px'
          }}>
            <Sparkles size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Separate Financial Discipline:</strong> An emergency fund is designed exclusively for unplanned crises (medical emergencies, sudden job loss, urgent home repairs). It should be maintained in high-liquidity instruments (savings accounts, liquid mutual funds) and kept completely distinct from loan down payments or speculative investments.
            </div>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};
