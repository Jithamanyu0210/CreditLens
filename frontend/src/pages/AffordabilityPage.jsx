import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PieChart, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  Info,
  DollarSign,
  HelpCircle,
  Lightbulb,
  Sparkles,
  ArrowRightCircle,
  Compass
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useLoan } from '../context/LoanContext';
import { calculateEMI, calculateAffordability, generateFinancialRecommendations, assessLoanSolvency } from '../utils/loanCalculations';
import { formatINR, formatPercent } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';
import { aiAPI } from '../services/api';

export const AffordabilityPage = () => {
  const { profile, loanParams, updateLoanParams } = useLoan();

  // Allow what-if adjustments directly on this page
  const [testPrincipal, setTestPrincipal] = useState(loanParams.principal);
  const [testRate, setTestRate] = useState(loanParams.annualRate);
  const [testTenure, setTestTenure] = useState(loanParams.tenureMonths);

  // Gemini AI Explanation State
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Compute what-if EMI
  const testEmiResult = calculateEMI(testPrincipal, testRate, testTenure);

  // Compute live affordability with otherExpenses
  const affordability = calculateAffordability(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    testEmiResult.emi,
    profile.otherExpenses || 0
  );

  // Solvency check with otherExpenses
  const solvency = assessLoanSolvency(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    testPrincipal,
    testRate,
    testTenure,
    profile.monthlySavingsTarget || 15000,
    profile.otherExpenses || 0
  );

  // Tailored smart financial recommendations with otherExpenses
  const { recommendations } = generateFinancialRecommendations(
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.existingEmis,
    testPrincipal,
    testRate,
    testTenure,
    profile.monthlySavingsTarget || 15000,
    profile.otherExpenses || 0
  );

  // Stacked Bar Chart data comparing Monthly Income to Outflow Allocations
  const stackChartData = [
    {
      category: 'Monthly Budget Distribution',
      'Living Expenses': profile.monthlyExpenses,
      'Other Expenses': profile.otherExpenses || 0,
      'Existing EMIs': affordability.totalExistingEmis,
      'Proposed New EMI': affordability.newEmi,
      'Remaining Surplus': Math.max(0, affordability.remainingBalance)
    }
  ];

  // Gemini AI Explanation Fetcher
  const handleGenerateAiExplanation = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await aiAPI.explainAffordability({
        profile: {
          monthlyIncome: profile.monthlyIncome,
          monthlyExpenses: profile.monthlyExpenses,
          otherExpenses: profile.otherExpenses || 0,
          existingEmis: profile.existingEmis || []
        },
        loan: {
          principal: testPrincipal,
          annualRate: testRate,
          tenureMonths: testTenure,
          emi: testEmiResult.emi,
          totalInterest: testEmiResult.totalInterest,
          totalPayment: testEmiResult.totalPayment
        },
        affordability
      });
      if (res && res.insight) {
        setAiInsight(res.insight);
      }
    } catch (err) {
      setAiError(err.message || 'Unable to generate AI explanation.');
    } finally {
      setAiLoading(false);
    }
  };

  // Helper for status alert
  const renderStatusCard = () => {
    switch (affordability.status) {
      case 'Comfortable':
        return (
          <div style={{
            backgroundColor: 'var(--status-comfortable-bg)',
            border: '1px solid var(--status-comfortable-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--status-comfortable-text)' }}>
                  Affordability Rating: Comfortable
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--status-comfortable-text)' }}>
                  Debt Obligations: {affordability.dtiRatio}% of Income &bull; Net Surplus: {formatINR(affordability.remainingBalance)}/month
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
              {affordability.description} {affordability.recommendation}
            </p>
          </div>
        );

      case 'Tight':
        return (
          <div style={{
            backgroundColor: 'var(--status-tight-bg)',
            border: '1px solid var(--status-tight-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f59e0b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--status-tight-text)' }}>
                  Affordability Rating: Tight Budget
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--status-tight-text)' }}>
                  Debt Obligations: {affordability.dtiRatio}% of Income &bull; Net Surplus: {formatINR(affordability.remainingBalance)}/month
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
              {affordability.description} {affordability.recommendation}
            </p>
          </div>
        );

      case 'Risky':
      default:
        return (
          <div style={{
            backgroundColor: 'var(--status-risky-bg)',
            border: '1px solid var(--status-risky-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertOctagon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--status-risky-text)' }}>
                  Affordability Rating: High Financial Risk
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--status-risky-text)' }}>
                  Debt Obligations: {affordability.dtiRatio}% of Income &bull; Net Surplus: {formatINR(affordability.remainingBalance)}/month
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
              {affordability.description} {affordability.recommendation}
            </p>
          </div>
        );
    }
  };

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 className="page-title">Loan Affordability Analysis & Financial Insights</h1>
          <p className="page-subtitle">
            Evaluating monthly living cashflow, debt payability, and personalized recommendations to improve your affordability status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/max-loan" className="btn btn-secondary">
            Max Loan Capacity
          </Link>
          <Link to="/profile" className="btn btn-primary">
            Update Profile
          </Link>
        </div>
      </div>

      {/* Main Status Hero Banner */}
      {renderStatusCard()}

      {/* Gemini AI Financial Explanation Card */}
      <div className="cl-card cl-card-colored cl-card-purple" style={{ marginBottom: '28px' }}>
        <div className="cl-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="cl-card-title">
            <div className="kpi-icon-container kpi-icon-purple" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
              <Sparkles size={18} />
            </div>
            <span>AI Loan Affordability Explanation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="cl-badge" style={{ backgroundColor: 'var(--accent-purple-light)', color: 'var(--accent-purple-text)', border: '1px solid var(--accent-purple-border)' }}>
              {aiInsight?.source === 'gemini-ai' ? 'Gemini 3.8 Flash' : 'AI-Powered'}
            </span>
            <button
              onClick={handleGenerateAiExplanation}
              disabled={aiLoading}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} color="var(--accent-purple)" />
              <span>{aiLoading ? 'Analyzing...' : aiInsight ? 'Refresh Analysis' : 'Explain with Gemini AI'}</span>
            </button>
          </div>
        </div>

        {aiLoading && (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-purple)', fontWeight: '700' }}>
              Analyzing your cashflow, debt ratio, and living expense buffer with Gemini AI...
            </p>
          </div>
        )}

        {aiError && (
          <div style={{ padding: '16px', backgroundColor: 'var(--accent-rose-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-rose-border)', color: 'var(--accent-rose-text)', fontSize: '0.85rem' }}>
            {aiError}
          </div>
        )}

        {!aiLoading && !aiInsight && !aiError && (
          <div style={{ padding: '20px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--accent-purple-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Want an AI-powered breakdown of your affordability status?
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Gemini analyzes your ₹{testPrincipal.toLocaleString('en-IN')} loan request against your income and living expenses to explain your approval outlook and safety margin.
              </div>
            </div>
            <button
              onClick={handleGenerateAiExplanation}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>Generate AI Explanation</span>
            </button>
          </div>
        )}

        {!aiLoading && aiInsight && (
          <div>
            <div style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {aiInsight.summary}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {/* Strengths */}
              {Array.isArray(aiInsight.strengths) && aiInsight.strengths.length > 0 && (
                <div style={{
                  backgroundColor: 'var(--accent-emerald-light)',
                  border: '1px solid var(--accent-emerald-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-emerald-text)', fontWeight: '700', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} />
                    <span>Financial Strengths</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {aiInsight.strengths.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {Array.isArray(aiInsight.risks) && aiInsight.risks.length > 0 && (
                <div style={{
                  backgroundColor: 'var(--accent-amber-light)',
                  border: '1px solid var(--accent-amber-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-amber-text)', fontWeight: '700', fontSize: '0.9rem' }}>
                    <AlertTriangle size={16} />
                    <span>Watchouts & Risks</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {aiInsight.risks.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actionable Tips */}
            {Array.isArray(aiInsight.actionableTips) && aiInsight.actionableTips.length > 0 && (
              <div style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-purple)', fontWeight: '700', fontSize: '0.9rem' }}>
                  <Lightbulb size={16} />
                  <span>AI Actionable Recommendations</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {aiInsight.actionableTips.map((tip, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actionable Financial Recommendations Engine */}
      <div className="cl-card cl-card-colored cl-card-sky" style={{ marginBottom: '28px' }}>
        <div className="cl-card-header">
          <div className="cl-card-title">
            <div className="kpi-icon-container kpi-icon-sky" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
              <Compass size={18} />
            </div>
            <span>Actionable Financial Insights & Practical Alternatives</span>
          </div>
          <span className="cl-badge" style={{ backgroundColor: 'var(--accent-sky-light)', color: 'var(--accent-sky-text)', border: '1px solid var(--accent-sky-border)' }}>
            Personalized Engine
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
            Your current loan setup already sits comfortably within all standard debt guidelines.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {rec.title}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '6px' }}>
                    {rec.benefit}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Tradeoff: {rec.tradeoff}
                  </div>
                </div>

                {rec.actionType === 'extend_tenure' && (
                  <button
                    onClick={() => {
                      setTestTenure(rec.newTenure);
                      updateLoanParams({ tenureMonths: rec.newTenure });
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '14px', width: '100%' }}
                  >
                    Apply {rec.newTenure} Mos Tenure
                  </button>
                )}

                {rec.actionType === 'reduce_principal' && (
                  <button
                    onClick={() => {
                      setTestPrincipal(rec.targetPrincipal);
                      updateLoanParams({ principal: rec.targetPrincipal });
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '14px', width: '100%' }}
                  >
                    Set Principal to {formatINR(rec.targetPrincipal)}
                  </button>
                )}

                {rec.actionType === 'lower_rate' && (
                  <button
                    onClick={() => {
                      setTestRate(rec.targetRate);
                      updateLoanParams({ annualRate: rec.targetRate });
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '14px', width: '100%' }}
                  >
                    Simulate {rec.targetRate.toFixed(1)}% Rate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4 Affordability Indicator Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="kpi-stat-card kpi-rose">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Existing EMIs</span>
            <div className="kpi-icon-container kpi-icon-rose" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <PieChart size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {formatINR(affordability.totalExistingEmis)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose-text)', fontWeight: '600', marginTop: '4px' }}>
            {profile.existingEmis.length} ongoing loan{profile.existingEmis.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="kpi-stat-card kpi-indigo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Proposed New EMI</span>
            <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
            {formatINR(affordability.newEmi)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-indigo-text)', fontWeight: '600', marginTop: '4px' }}>
            New monthly commitment
          </div>
        </div>

        <div className={`kpi-stat-card ${affordability.dtiRatio > 50 ? 'kpi-rose' : (affordability.dtiRatio > 35 ? 'kpi-amber' : 'kpi-emerald')}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Debt-to-Income (DTI)</span>
            <div className={`kpi-icon-container ${affordability.dtiRatio > 50 ? 'kpi-icon-rose' : (affordability.dtiRatio > 35 ? 'kpi-icon-amber' : 'kpi-icon-emerald')}`} style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: '800',
            color: affordability.dtiRatio > 50 ? 'var(--accent-rose)' : (affordability.dtiRatio > 35 ? 'var(--accent-amber)' : 'var(--accent-emerald)')
          }}>
            {affordability.dtiRatio}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Guideline: &le; 35% safe
          </div>
        </div>

        <div className={`kpi-stat-card ${affordability.remainingBalance >= 0 ? 'kpi-emerald' : 'kpi-rose'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Remaining Cash Buffer</span>
            <div className={`kpi-icon-container ${affordability.remainingBalance >= 0 ? 'kpi-icon-emerald' : 'kpi-icon-rose'}`} style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: '800',
            color: affordability.remainingBalance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
          }}>
            {formatINR(affordability.remainingBalance)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Surplus after all expenses
          </div>
        </div>
      </div>

      {/* Middle Layout: What-if Sliders & Cashflow Stacked Bar */}
      <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '28px' }}>
        {/* Left: What-if Loan Parameters */}
        <div className="cl-card cl-card-colored cl-card-indigo">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <Sliders size={18} />
              </div>
              <span>Simulate What-If Scenarios</span>
            </div>
            <span className="cl-badge" style={{ backgroundColor: 'var(--accent-indigo-light)', color: 'var(--accent-indigo-text)', border: '1px solid var(--accent-indigo-border)' }}>
              Real-time
            </span>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Proposed Loan Principal</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-indigo)', fontSize: '1.05rem' }}>{formatINR(testPrincipal)}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="25000"
              value={testPrincipal}
              onChange={(e) => setTestPrincipal(Number(e.target.value))}
              className="range-slider range-slider-indigo"
            />
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Interest Rate (% p.a.)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-amber)', fontSize: '1.05rem' }}>{testRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="0.25"
              value={testRate}
              onChange={(e) => setTestRate(Number(e.target.value))}
              className="range-slider range-slider-amber"
            />
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Repayment Tenure (Months)</label>
              <span style={{ fontWeight: '800', color: 'var(--accent-sky)', fontSize: '1.05rem' }}>{testTenure} mos ({Math.round(testTenure / 12 * 10) / 10} yrs)</span>
            </div>
            <input
              type="range"
              min="6"
              max="240"
              step="6"
              value={testTenure}
              onChange={(e) => setTestTenure(Number(e.target.value))}
              className="range-slider range-slider-sky"
            />
          </div>

          <button
            onClick={() => {
              updateLoanParams({
                principal: testPrincipal,
                annualRate: testRate,
                tenureMonths: testTenure,
                tenureUnit: 'months'
              });
            }}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '14px', padding: '12px' }}
          >
            Apply to Global Active Loan
          </button>
        </div>

        {/* Right: Cashflow Stacked Bar Chart */}
        <div className="cl-card cl-card-colored cl-card-emerald">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-emerald" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <PieChart size={18} />
              </div>
              <span>Monthly Income Allocation</span>
            </div>
            <span className="cl-badge" style={{ backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald-text)', border: '1px solid var(--accent-emerald-border)' }}>
              Income: {formatINR(profile.monthlyIncome)}
            </span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackChartData} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <XAxis type="number" tickFormatter={(val) => `₹${val / 1000}k`} />
                <YAxis type="category" dataKey="category" hide />
                <Tooltip formatter={(value) => [formatINR(value), '']} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="Living Expenses" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]} />
                <Bar dataKey="Existing EMIs" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Proposed New EMI" stackId="a" fill="#2563eb" />
                <Bar dataKey="Remaining Surplus" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lightbulb size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Threshold Rule of Thumb:</strong>
            </div>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Comfortable:</strong> Total obligations &le; 35% and remaining balance buffer &gt; 20%.<br />
              <strong>Tight:</strong> Obligations between 35% and 50% or buffer under 20%.<br />
              <strong>Risky:</strong> Obligations exceed 50% or net balance turns negative.
            </p>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};
