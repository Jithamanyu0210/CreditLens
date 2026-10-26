import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  FileText,
  User,
  LogOut,
  ChevronDown,
  BookmarkCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLoan } from '../../context/LoanContext';
import { exportFullFinancialReport } from '../../utils/reportGenerator';
import { generateAmortizationSchedule } from '../../utils/loanCalculations';

/**
 * Top Navbar Header Component.
 * Contains mobile drawer toggle, current page indicator, Full Report download button,
 * light/dark theme switch, and user profile dropdown.
 */
export const TopNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { profile, loanParams, activeEmiData, activeSolvency, savedScenarios, showToast } = useLoan();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDownloadReport = async () => {
    try {
      setIsGeneratingReport(true);
      const schedule = generateAmortizationSchedule(
        loanParams.principal,
        loanParams.annualRate,
        loanParams.tenureMonths
      );
      
      const success = exportFullFinancialReport(
        profile,
        loanParams,
        activeEmiData,
        activeSolvency,
        schedule,
        { savedScenarios, user }
      );

      if (success && showToast) {
        showToast('Financial report downloaded successfully!', 'success');
      }
    } catch (err) {
      console.error('[CreditLens Report Error]:', err);
      if (showToast) {
        showToast('Failed to download report. Please try again.', 'error');
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Determine page title based on active pathname
  const getPageTitle = (path) => {
    switch (path) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/calculator':
        return 'EMI Calculator';
      case '/schedule':
        return 'Repayment Plan';
      case '/bank-rates':
      case '/rates':
        return 'Interest Rates';
      case '/affordability':
        return 'Loan Affordability';
      case '/max-loan':
      case '/maxloan':
      case '/max-capacity':
        return 'Loan Capacity';
      case '/prepayment':
      case '/prepay':
        return 'Prepayment';
      case '/emergency-fund':
      case '/emergency':
        return 'Emergency Fund';
      case '/compare':
      case '/compare-scenarios':
        return 'Compare Loans';
      case '/saved':
      case '/saved-scenarios':
        return 'Saved Scenarios';
      case '/profile':
        return 'Profile';
      default:
        return 'CreditLens';
    }
  };

  return (
    <header className="cl-topbar">
      <div className="cl-topbar-left">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="cl-topbar-mobile-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Current View Title */}
        <div className="cl-topbar-title-wrapper">
          <span className="cl-topbar-title">{getPageTitle(location.pathname)}</span>
        </div>
      </div>

      <div className="cl-topbar-right">
        {/* Full Report Download Button */}
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={isGeneratingReport}
          className="cl-btn-report"
          id="btn-topbar-full-report"
          title="Download comprehensive PDF financial report"
          aria-label="Download Full Financial Report PDF"
        >
          {isGeneratingReport ? (
            <>
              <Loader2 size={16} className="cl-spinner" />
              <span className="cl-btn-report-text">Generating...</span>
            </>
          ) : (
            <>
              <FileText size={16} />
              <span className="cl-btn-report-text">Full Report</span>
            </>
          )}
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="cl-theme-toggle-btn"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          id="btn-theme-toggle"
        >
          {isDark ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
        </button>

        {/* User Profile Menu */}
        <div ref={dropdownRef} className="cl-profile-dropdown-container">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="cl-profile-trigger-btn"
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
            id="btn-profile-dropdown"
          >
            <div className="cl-profile-avatar-circle">
              {user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
            </div>
            <span className="cl-profile-name-text">
              {user?.name ? user.name.split(' ')[0] : 'Borrower'}
            </span>
            <ChevronDown
              size={14}
              className={`cl-dropdown-chevron ${profileDropdownOpen ? 'open' : ''}`}
            />
          </button>

          {profileDropdownOpen && (
            <div className="cl-profile-dropdown-menu" role="menu">
              <div className="cl-profile-menu-header">
                <span className="cl-menu-user-name">{user?.name || 'Borrower'}</span>
                <span className="cl-menu-user-email">{user?.email || 'user@creditlens.local'}</span>
              </div>

              <div className="cl-profile-menu-divider" />

              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="cl-profile-menu-item"
                role="menuitem"
              >
                <User size={15} />
                <span>Financial Profile</span>
              </Link>

              <Link
                to="/saved-scenarios"
                onClick={() => setProfileDropdownOpen(false)}
                className="cl-profile-menu-item"
                role="menuitem"
              >
                <BookmarkCheck size={15} />
                <span>Saved Scenarios</span>
              </Link>

              <div className="cl-profile-menu-divider" />

              <button
                type="button"
                onClick={handleLogout}
                className="cl-profile-menu-item cl-logout-item"
                role="menuitem"
                id="btn-signout"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
