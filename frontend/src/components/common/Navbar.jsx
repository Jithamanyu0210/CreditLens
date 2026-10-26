import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calculator, 
  PieChart, 
  Calendar, 
  GitCompare, 
  BookmarkCheck, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Zap,
  ShieldAlert,
  ArrowUpCircle,
  FileText,
  Landmark,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLoan } from '../../context/LoanContext';
import { exportFullFinancialReport } from '../../utils/reportGenerator';
import { generateAmortizationSchedule } from '../../utils/loanCalculations';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { profile, loanParams, activeEmiData, activeSolvency } = useLoan();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const toolsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
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

  const handlePrintReport = () => {
    const schedule = generateAmortizationSchedule(
      loanParams.principal,
      loanParams.annualRate,
      loanParams.tenureMonths
    );
    exportFullFinancialReport(profile, loanParams, activeEmiData, activeSolvency, schedule);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Bank Rates', path: '/bank-rates', icon: Landmark },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Affordability', path: '/affordability', icon: PieChart },
    { name: 'Financial Profile', path: '/profile', icon: User }
  ];

  const simulatorOptions = [
    {
      name: 'Max Loan Capacity',
      path: '/max-loan',
      desc: 'Calculate borrowing ceiling based on income and DTI',
      icon: Zap,
      bg: 'var(--accent-indigo-light)',
      color: 'var(--accent-indigo-text)',
      border: 'var(--accent-indigo-border)'
    },
    {
      name: 'Prepayment Simulator',
      path: '/prepayment',
      desc: 'Simulate tenure reduction and interest savings',
      icon: ArrowUpCircle,
      bg: 'var(--accent-emerald-light)',
      color: 'var(--accent-emerald-text)',
      border: 'var(--accent-emerald-border)'
    },
    {
      name: 'Emergency Fund',
      path: '/emergency-fund',
      desc: 'Estimate liquidity runway against total debt outflow',
      icon: ShieldAlert,
      bg: 'var(--accent-amber-light)',
      color: 'var(--accent-amber-text)',
      border: 'var(--accent-amber-border)'
    },
    {
      name: 'Compare Scenarios',
      path: '/compare',
      desc: 'Side-by-side trade-off analysis of up to 5 loans',
      icon: GitCompare,
      bg: 'var(--accent-purple-light)',
      color: 'var(--accent-purple-text)',
      border: 'var(--accent-purple-border)'
    },
    {
      name: 'Saved Scenarios',
      path: '/saved-scenarios',
      desc: 'Review and load custom loan configurations',
      icon: BookmarkCheck,
      bg: 'var(--accent-sky-light)',
      color: 'var(--accent-sky-text)',
      border: 'var(--accent-sky-border)'
    }
  ];

  const isSimulatorActive = simulatorOptions.some((opt) => location.pathname === opt.path);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 20px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/login'} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--primary-glow)'
          }}>
            <Landmark size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '1.2rem',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              Credit<span style={{ color: 'var(--primary)' }}>Lens</span>
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              FinTech Intelligence
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Only shown when authenticated) */}
        {isAuthenticated && (
          <div style={{ display: 'none', alignItems: 'center', gap: '4px' }} className="desktop-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 13px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  })}
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            {/* Simulators Dropdown */}
            <div ref={toolsDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 13px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isSimulatorActive || toolsDropdownOpen ? '700' : '500',
                  color: isSimulatorActive || toolsDropdownOpen ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isSimulatorActive || toolsDropdownOpen ? 'var(--primary-light)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Zap size={16} />
                <span>Simulators</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: toolsDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition-fast)'
                  }}
                />
              </button>

              {toolsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '320px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 1100,
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <div style={{
                    padding: '8px 12px 6px',
                    fontSize: '0.725rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)'
                  }}>
                    Financial Simulators
                  </div>
                  {simulatorOptions.map((tool) => {
                    const ToolIcon = tool.icon;
                    const active = location.pathname === tool.path;
                    return (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setToolsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                          transition: 'background-color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: tool.bg,
                          border: `1px solid ${tool.border}`,
                          color: tool.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <ToolIcon size={16} />
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: active ? '700' : '600',
                            color: active ? 'var(--primary)' : 'var(--text-primary)'
                          }}>
                            {tool.name}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                            lineHeight: 1.3
                          }}>
                            {tool.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div style={{ display: 'none', alignItems: 'center', gap: '10px' }} className="desktop-auth">
          {isAuthenticated && (
            <button
              onClick={handlePrintReport}
              className="btn btn-secondary btn-sm"
              title="Export complete financial report"
            >
              <FileText size={15} />
              <span>Report</span>
            </button>
          )}

          {/* Theme Toggle Pill */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'all var(--transition-fast)'
            }}
            aria-label="Toggle dark/light theme"
          >
            {isDark ? (
              <>
                <Sun size={15} color="#f59e0b" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} color="#6366f1" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div ref={profileDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '4px 12px 4px 5px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {user?.name || 'Account'}
                  </span>
                  <span style={{ fontSize: '0.675rem', color: 'var(--status-comfortable)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={11} /> Verified
                  </span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '230px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 1100,
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', marginTop: '2px' }}>
                      {user?.email}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '4px',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User size={16} />
                    <span>Financial Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--status-risky)',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-risky-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-only-header">
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: 'var(--text-primary)'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: 'calc(100vh - 70px)',
          overflowY: 'auto'
        }}>
          {isAuthenticated ? (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '4px 8px' }}>
                Main Pages
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
                    })}
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '8px 0' }} />

              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '4px 8px' }}>
                Simulators
              </div>
              {simulatorOptions.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <NavLink
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
                    })}
                  >
                    <ToolIcon size={18} />
                    <span>{tool.name}</span>
                  </NavLink>
                );
              })}

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '8px 0' }} />

              <button
                onClick={() => {
                  handlePrintReport();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <FileText size={18} />
                <span>Export Printable Report</span>
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'flex-start', marginTop: '8px' }}
              >
                <LogOut size={18} />
                <span>Sign Out ({user?.name})</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-outline-primary"
                style={{ width: '100%' }}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <UserPlus size={18} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 960px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-only-header { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
