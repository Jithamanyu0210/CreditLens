import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Layers,
  Calculator,
  Calendar,
  Landmark,
  PieChart,
  Zap,
  ArrowUpCircle,
  ShieldAlert,
  GitCompare,
  ChevronDown,
  X,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HelpTooltip } from './HelpTooltip';

/**
 * Left Sidebar Navigation Component for CreditLens.
 * Features:
 * 1. Main Features navigation list (simplified names).
 * 2. Simulators: Collapsible accordion group (collapsed by default).
 * 3. Saved Items navigation entries removed from sidebar (persisted in app).
 * 4. Explanatory descriptions shown on hover over the (?) icon.
 */
export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Collapsible state for Simulators group (default collapsed)
  const [simulatorsOpen, setSimulatorsOpen] = useState(false);

  // Navigation Group 1: Main Features (Simplified Names)
  const mainFeatures = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      altPaths: ['/'],
      icon: Layers,
      desc: 'Live financial overview, debt solvency verdict, and monthly cashflow summary'
    },
    {
      name: 'EMI Calculator',
      path: '/calculator',
      altPaths: [],
      icon: Calculator,
      desc: 'Calculate monthly installments, total interest, and reducing-balance repayment plans'
    },
    {
      name: 'Repayment Plan',
      path: '/schedule',
      altPaths: [],
      icon: Calendar,
      desc: 'Detailed month-by-month amortization breakdown of principal, interest, and loan balance'
    },
    {
      name: 'Interest Rates',
      path: '/bank-rates',
      altPaths: ['/rates'],
      icon: Landmark,
      desc: 'Live interest rates, benchmark spreads, and retail loan categories from 19+ top Indian banks'
    },
    {
      name: 'Loan Affordability',
      path: '/affordability',
      altPaths: [],
      icon: PieChart,
      desc: 'Evaluate debt-to-income ratio, disposable surplus buffer, and bank underwriting safety limits'
    }
  ];

  // Navigation Group 2: Simulators (Simplified Names)
  const financialSimulators = [
    {
      name: 'Loan Capacity',
      path: '/max-loan',
      altPaths: ['/maxloan', '/max-capacity', '/simulator/capacity'],
      icon: Zap,
      desc: 'Reverse-engineer your borrowing limit from monthly income, living expenses, and target savings'
    },
    {
      name: 'Prepayment',
      path: '/prepayment',
      altPaths: ['/prepay', '/simulator/prepayment'],
      icon: ArrowUpCircle,
      desc: 'Simulate tenure reduction and substantial interest savings from lump-sum or recurring prepayments'
    },
    {
      name: 'Emergency Fund',
      path: '/emergency-fund',
      altPaths: ['/emergency', '/simulator/emergency'],
      icon: ShieldAlert,
      desc: 'Estimate required 3-6 month liquidity cushion to protect loan solvency against income shocks'
    },
    {
      name: 'Compare Loans',
      path: '/compare',
      altPaths: ['/compare-scenarios', '/simulator/compare'],
      icon: GitCompare,
      desc: 'Side-by-side comparison of loan terms, interest rates, total outlays, and monthly EMIs'
    }
  ];

  const isLinkActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.altPaths && item.altPaths.includes(location.pathname)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="cl-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`cl-sidebar ${isOpen ? 'mobile-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="cl-sidebar-header">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="cl-sidebar-brand"
            aria-label="CreditLens Home"
          >
            <div className="cl-sidebar-logo-icon">
              <Landmark size={20} />
            </div>
            <div className="cl-sidebar-brand-text">
              <span className="cl-brand-title">
                Credit<span className="cl-brand-accent">Lens</span>
              </span>
              <span className="cl-brand-tagline">FinTech Intelligence</span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="cl-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="cl-sidebar-content">
          {/* Main Features */}
          <div className="cl-sidebar-group">
            <div className="cl-sidebar-group-header">
              <span className="cl-sidebar-group-title">Main Features</span>
              <HelpTooltip
                text="Primary loan assessment calculators, live bank interest rates, and debt affordability tools"
                placement="right"
                size={13}
              />
            </div>
            <nav className="cl-sidebar-nav-list" aria-label="Main Features">
              {mainFeatures.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);
                return (
                  <div key={item.path} className="cl-sidebar-nav-item-wrapper">
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={`cl-sidebar-nav-link ${active ? 'active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="cl-sidebar-nav-icon">
                        <Icon size={18} />
                      </span>
                      <span className="cl-sidebar-nav-label">{item.name}</span>
                    </NavLink>
                    <div className="cl-sidebar-nav-help">
                      <HelpTooltip
                        text={item.desc}
                        placement="right"
                        size={13}
                        ariaLabel={`Info about ${item.name}`}
                      />
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Collapsible Simulators Group */}
          <div className="cl-sidebar-group">
            <button
              type="button"
              className="cl-sidebar-group-toggle"
              onClick={() => setSimulatorsOpen((prev) => !prev)}
              aria-expanded={simulatorsOpen}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="cl-sidebar-group-title">Simulators</span>
                  <ChevronDown
                    size={14}
                    className={`cl-sidebar-chevron ${simulatorsOpen ? 'open' : ''}`}
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <HelpTooltip
                    text="Advanced simulation engines for borrowing capacity, early repayments, emergency funds, and loan comparisons."
                    placement="right"
                    size={13}
                  />
                </div>
              </div>
            </button>

            {simulatorsOpen && (
              <nav className="cl-sidebar-nav-list cl-sidebar-subnav-list" aria-label="Simulators">
                {financialSimulators.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item);
                  return (
                    <div key={item.path} className="cl-sidebar-nav-item-wrapper">
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={`cl-sidebar-nav-link cl-sidebar-subnav-link ${active ? 'active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="cl-sidebar-nav-icon">
                          <Icon size={16} />
                        </span>
                        <span className="cl-sidebar-nav-label">{item.name}</span>
                      </NavLink>
                      <div className="cl-sidebar-nav-help">
                        <HelpTooltip
                          text={item.desc}
                          placement="right"
                          size={13}
                          ariaLabel={`Info about ${item.name}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Separate Navigation Section: AI Financial Assistant */}
          <div className="cl-sidebar-group" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="cl-sidebar-group-header">
              <span className="cl-sidebar-group-title">AI Assistant</span>
              <HelpTooltip
                text="Intelligent AI financial guidance, budget intelligence, and conversational assistance powered by Gemini"
                placement="right"
                size={13}
              />
            </div>
            <nav className="cl-sidebar-nav-list" aria-label="AI Financial Assistant">
              <div className="cl-sidebar-nav-item-wrapper">
                <NavLink
                  to="/ai-assistant"
                  onClick={onClose}
                  className={`cl-sidebar-nav-link ${location.pathname === '/ai-assistant' || location.pathname === '/ai' ? 'active' : ''}`}
                  aria-current={location.pathname === '/ai-assistant' ? 'page' : undefined}
                >
                  <span className="cl-sidebar-nav-icon" style={{ color: 'var(--accent-indigo)' }}>
                    <Bot size={18} />
                  </span>
                  <span className="cl-sidebar-nav-label">AI Financial Assistant</span>
                </NavLink>
                <div className="cl-sidebar-nav-help">
                  <HelpTooltip
                    text="Dedicated AI Assistant: Financial Insights, Monthly Budget Diagnostics, and Ask CreditLens"
                    placement="right"
                    size={13}
                    ariaLabel="Info about AI Financial Assistant"
                  />
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* User Status Footer */}
        <div className="cl-sidebar-footer">
          <Link to="/profile" onClick={onClose} className="cl-sidebar-user-card" aria-label="Open Profile">
            <div className="cl-sidebar-user-avatar">
              {user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="cl-sidebar-user-info">
              <span className="cl-sidebar-user-name">{user?.name || 'Borrower'}</span>
              <span className="cl-sidebar-user-role">
                <ShieldCheck size={11} /> Verified Account
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
};
