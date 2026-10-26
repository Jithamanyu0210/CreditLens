import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Send,
  RefreshCw,
  Wallet,
  PieChart,
  HelpCircle,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';
import { aiAPI } from '../services/api';
import { formatINR } from '../utils/formatters';
import { BackButton } from '../components/common/BackButton';
import { HelpTooltip } from '../components/common/HelpTooltip';

const STARTER_QUESTIONS = [
  'How can I improve my monthly savings?',
  'Can I afford another loan based on my current finances?',
  'How can I reduce my monthly financial burden?',
  'Explain my current financial situation in simple words.',
  'What should I consider before taking a loan?'
];

export const AiAssistantPage = () => {
  const { user } = useAuth();
  const { profile } = useLoan();

  // Feature A State: Financial Insights
  const [financialInsights, setFinancialInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [insightsMissing, setInsightsMissing] = useState(false);

  // Feature B State: Budget Insights
  const [budgetInsights, setBudgetInsights] = useState(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState(null);
  const [budgetMissing, setBudgetMissing] = useState(false);

  // Feature C State: Ask CreditLens Chat Assistant
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am **Ask CreditLens**, your dedicated AI Financial Assistant. I can help analyze your monthly budget, evaluate loan affordability, explore debt payoff strategies, and answer questions about your CreditLens finances. Select a starter question below or ask anything!'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const chatBottomRef = useRef(null);

  // Auto-scroll chat window when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Load Financial Insights
  const handleGenerateFinancialInsights = async () => {
    setLoadingInsights(true);
    setInsightsError(null);
    setInsightsMissing(false);
    try {
      const res = await aiAPI.getFinancialInsights();
      if (res && res.missingData) {
        setInsightsMissing(true);
        setFinancialInsights(null);
      } else if (res && res.insight) {
        setFinancialInsights({
          ...res.insight,
          profileData: res.profileData,
          source: res.source
        });
      }
    } catch (err) {
      setInsightsError(err.message || 'Unable to generate financial insights at this time.');
    } finally {
      setLoadingInsights(false);
    }
  };

  // Load Budget Insights
  const handleGenerateBudgetInsights = async () => {
    setLoadingBudget(true);
    setBudgetError(null);
    setBudgetMissing(false);
    try {
      const res = await aiAPI.getBudgetInsights();
      if (res && res.missingData) {
        setBudgetMissing(true);
        setBudgetInsights(null);
      } else if (res && res.insight) {
        setBudgetInsights({
          ...res.insight,
          budgetData: res.budgetData,
          source: res.source
        });
      }
    } catch (err) {
      setBudgetError(err.message || 'Unable to generate monthly budget insights at this time.');
    } finally {
      setLoadingBudget(false);
    }
  };

  // Automatically attempt first load of insights if profile has income
  useEffect(() => {
    if (profile && profile.monthlyIncome > 0) {
      handleGenerateFinancialInsights();
      handleGenerateBudgetInsights();
    } else {
      setInsightsMissing(true);
      setBudgetMissing(true);
    }
  }, [profile?.monthlyIncome]);

  // Handle Send Chat Message
  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!messageText || chatLoading) return;

    setChatError(null);
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: messageText
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const history = chatMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await aiAPI.chat(messageText, history);
      if (res && res.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: res.reply
          }
        ]);
      } else {
        throw new Error('Received empty response from assistant.');
      }
    } catch (err) {
      setChatError(err.message || 'Connection to CreditLens AI Assistant timed out. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleStarterClick = (question) => {
    handleSendMessage(question);
  };

  // Baseline figures from profile for display
  const income = profile.monthlyIncome || 0;
  const livingExp = profile.monthlyExpenses || 0;
  const otherExp = profile.otherExpenses || 0;
  const existingEmisList = profile.existingEmis || [];
  const totalEmis = existingEmisList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingCashflow = income - (livingExp + otherExp + totalEmis);

  return (
    <div className="ai-assistant-page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <BackButton fallbackPath="/dashboard" />

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--accent-indigo-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--accent-indigo-glow)'
          }}>
            <Bot size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>AI Financial Assistant</h1>
              <HelpTooltip
                text="Powered by Google Gemini and CreditLens deterministic financial calculation engines"
                placement="right"
              />
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Personalized Financial Insights, Budget Intelligence &amp; Interactive AI Advisory
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory / Educational Disclaimer */}
      <div style={{
        backgroundColor: 'var(--bg-card-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: '26px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Educational Financial Planning:</strong> CreditLens AI responses are designed for self-planning and informational purposes. Deterministic calculations serve as the foundation of truth; AI provides natural-language guidance and is not guaranteed financial advice.
        </span>
      </div>

      {/* =========================================================================
          FEATURE A: AI Financial Insights
         ========================================================================= */}
      <section className="cl-card cl-card-colored cl-card-indigo" style={{ marginBottom: '28px', padding: '24px' }}>
        <div className="cl-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="cl-card-title">
            <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
              <Sparkles size={18} />
            </div>
            <span>AI Financial Insights</span>
          </div>

          <button
            id="btn-generate-financial-insights"
            type="button"
            onClick={handleGenerateFinancialInsights}
            disabled={loadingInsights}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loadingInsights ? 'spin-icon' : ''} />
            <span>{loadingInsights ? 'Analyzing Data...' : financialInsights ? 'Regenerate Financial Insights' : 'Generate Financial Insights'}</span>
          </button>
        </div>

        {/* Missing Data State */}
        {insightsMissing && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Financial Profile Configuration Required
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Please set up your monthly income and expenses in the Profile section so the assistant can analyze your real financial data.
              </div>
            </div>
            <Link to="/profile" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Configure Profile</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Error State */}
        {insightsError && (
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'var(--status-risky-bg)',
            color: 'var(--status-risky-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{insightsError}</span>
          </div>
        )}

        {/* Loading State */}
        {loadingInsights && (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div className="kova-pulse-ring" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontWeight: '600', color: 'var(--accent-indigo)', fontSize: '0.95rem' }}>
              Synthesizing financial profile and computing solvency metrics...
            </div>
          </div>
        )}

        {/* Results Presentation */}
        {!loadingInsights && financialInsights && (
          <div>
            {/* Executive Summary Box */}
            <div style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} />
                <span>Executive Financial Assessment</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                {financialInsights.summary}
              </p>
            </div>

            {/* Deterministic Financial Overview Numbers */}
            <div className="grid-4" style={{ gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Monthly Inflow</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>
                  {formatINR(financialInsights.profileData?.monthlyIncome ?? income)}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Living Expenses</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {formatINR(financialInsights.profileData?.monthlyExpenses ?? livingExp)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Other: {formatINR(financialInsights.profileData?.otherExpenses ?? otherExp)}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Existing EMIs</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '2px' }}>
                  {formatINR(financialInsights.profileData?.totalExistingEmis ?? totalEmis)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  DTI: {financialInsights.profileData?.dti ?? 0}%
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Remaining Surplus</span>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  color: (financialInsights.profileData?.remainingBalance ?? remainingCashflow) >= 0 ? '#10b981' : '#ef4444',
                  marginTop: '2px'
                }}>
                  {formatINR(financialInsights.profileData?.remainingBalance ?? remainingCashflow)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Target: {formatINR(financialInsights.profileData?.savingsTarget ?? profile.monthlySavingsTarget ?? 0)}
                </div>
              </div>
            </div>

            {/* Three Analytical Pillars */}
            <div className="grid-3" style={{ gap: '16px' }}>
              {/* Potential Concerns */}
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#ef4444', fontWeight: '700', fontSize: '0.875rem' }}>
                  <AlertTriangle size={16} />
                  <span>Affordability Concerns</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {financialInsights.concerns?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Cashflow Suggestions */}
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#10b981', fontWeight: '700', fontSize: '0.875rem' }}>
                  <TrendingUp size={16} />
                  <span>Cash Flow Suggestions</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {financialInsights.cashflowSuggestions?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Loan Considerations */}
              <div style={{
                backgroundColor: 'rgba(79, 70, 229, 0.04)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-indigo)', fontWeight: '700', fontSize: '0.875rem' }}>
                  <Lightbulb size={16} />
                  <span>Loan Considerations</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {financialInsights.loanConsiderations?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          FEATURE B: AI Monthly Budget Insights
         ========================================================================= */}
      <section className="cl-card cl-card-colored cl-card-emerald" style={{ marginBottom: '28px', padding: '24px' }}>
        <div className="cl-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="cl-card-title">
            <div className="kpi-icon-container kpi-icon-emerald" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
              <Wallet size={18} />
            </div>
            <span>Monthly Budget Insights</span>
          </div>

          <button
            id="btn-generate-budget-insights"
            type="button"
            onClick={handleGenerateBudgetInsights}
            disabled={loadingBudget}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loadingBudget ? 'spin-icon' : ''} />
            <span>{loadingBudget ? 'Analyzing Budget...' : budgetInsights ? 'Refresh Budget Insights' : 'Analyze Monthly Budget'}</span>
          </button>
        </div>

        {/* Missing Profile State */}
        {budgetMissing && (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>
            Please enter your monthly living expenses and savings target in your Profile to unlock detailed budget diagnostics.
          </div>
        )}

        {/* Error State */}
        {budgetError && (
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'var(--status-risky-bg)',
            color: 'var(--status-risky-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{budgetError}</span>
          </div>
        )}

        {/* Loading State */}
        {loadingBudget && (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div className="kova-pulse-ring" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.95rem' }}>
              Evaluating spending categories and runway metrics...
            </div>
          </div>
        )}

        {/* Results Presentation */}
        {!loadingBudget && budgetInsights && (
          <div>
            {/* Income vs Expenses Summary */}
            <div style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '0.875rem' }}>
                <PieChart size={16} />
                <span>Income vs. Outflow Breakdown</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {budgetInsights.incomeVsExpenses}
              </p>
            </div>

            {/* Four Budget Tiles */}
            <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
              {/* Commitments Requiring Attention */}
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#d97706', fontWeight: '700', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} />
                  <span>Commitments Needing Attention</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {budgetInsights.attentionItems?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Realistic Budgeting Suggestions */}
              <div style={{
                backgroundColor: 'rgba(5, 150, 105, 0.05)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Realistic Budgeting Rules</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {budgetInsights.budgetingSuggestions?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '16px' }}>
              {/* Ways to Improve Savings */}
              <div style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.875rem' }}>
                  <TrendingUp size={16} color="var(--primary)" />
                  <span>Ways to Improve Savings</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {budgetInsights.savingsTips?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Emergency Fund Considerations */}
              <div style={{
                backgroundColor: 'rgba(2, 132, 199, 0.05)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284c7', fontWeight: '700', fontSize: '0.875rem' }}>
                  <ShieldCheck size={16} />
                  <span>Emergency Fund Cushion</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {budgetInsights.emergencyFundConsiderations?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          FEATURE C: Ask CreditLens — AI Chat Assistant
         ========================================================================= */}
      <section className="cl-card cl-card-colored cl-card-purple" style={{ padding: '24px' }}>
        <div className="cl-card-header" style={{ marginBottom: '16px' }}>
          <div className="cl-card-title">
            <div className="kpi-icon-container kpi-icon-purple" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
              <MessageSquare size={18} />
            </div>
            <span>Ask CreditLens: AI Chat Assistant</span>
          </div>
        </div>

        {/* Starter Questions Pills */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.775rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
            Suggested Starter Questions:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {STARTER_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleStarterClick(q)}
                disabled={chatLoading}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: chatLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div style={{
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          height: '420px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--accent-purple-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    <Bot size={18} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  backgroundColor: isUser ? 'var(--primary)' : 'var(--bg-card)',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {chatLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <Bot size={18} />
              </div>
              <div style={{
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 2px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="spin-icon">⏳</span>
                <span>Ask CreditLens is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Error Notice */}
        {chatError && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--status-risky-bg)',
            color: 'var(--status-risky-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{chatError}</span>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          <input
            id="input-ai-chat"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about savings, affordability, EMIs, or loan strategies..."
            disabled={chatLoading}
            className="form-input"
            style={{ flex: 1, fontSize: '0.9rem', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
          />
          <button
            id="btn-ai-chat-send"
            type="submit"
            disabled={!inputMessage.trim() || chatLoading}
            className="btn btn-primary"
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '700'
            }}
          >
            <span>Send</span>
            <Send size={15} />
          </button>
        </form>
      </section>
    </div>
  );
};
