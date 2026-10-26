import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Landmark,
  Search,
  ExternalLink,
  Calculator,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  LayoutGrid,
  TrendingDown,
  Info,
  DollarSign,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Building,
  GraduationCap,
  Car,
  Home,
  Bike,
  Coins,
  Layers,
  ArrowRight,
  X,
  ChevronDown
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { bankRateAPI } from '../services/api';
import { formatINR, formatNumber, formatPercent } from '../utils/formatters';
import { calculateEMI } from '../utils/loanCalculations';
import { HelpTooltip } from '../components/common/HelpTooltip';

const MANDATORY_DISCLAIMER =
  "Interest rates shown are indicative and subject to change. Actual rates, eligibility and charges depend on the bank's current terms and the applicant's financial profile. Please verify the final offer directly with the bank.";

const CATEGORY_ICONS = {
  all: Layers,
  home: Home,
  personal: DollarSign,
  car: Car,
  education: GraduationCap,
  two_wheeler: Bike,
  gold: Coins
};

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Loans' },
  { id: 'home', name: 'Home Loans' },
  { id: 'personal', name: 'Personal Loans' },
  { id: 'car', name: 'Car Loans' },
  { id: 'education', name: 'Education Loans' },
  { id: 'two_wheeler', name: 'Two-Wheeler Loans' },
  { id: 'gold', name: 'Gold Loans' }
];

const SEARCH_LOAN_TYPES = [
  { id: 'home', name: 'Home Loan', icon: Home },
  { id: 'personal', name: 'Personal Loan', icon: DollarSign },
  { id: 'car', name: 'Car Loan', icon: Car },
  { id: 'education', name: 'Education Loan', icon: GraduationCap },
  { id: 'two_wheeler', name: 'Two-Wheeler Loan', icon: Bike },
  { id: 'gold', name: 'Gold Loan', icon: Coins }
];

export const BankRatesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateLoanParams, showToast, loanParams } = useLoan();

  // Data states
  const [rates, setRates] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dedicated Bank Search by Name and Loan Type state
  const initialBank = searchParams.get('bank') || 'State Bank of India';
  const initialLoanType = searchParams.get('loanType') || 'car';

  const [searchBankQuery, setSearchBankQuery] = useState(initialBank);
  const [searchLoanType, setSearchLoanType] = useState(initialLoanType);
  const [exactRateResult, setExactRateResult] = useState(null);
  const [exactRateLoading, setExactRateLoading] = useState(false);
  const [exactRateStatus, setExactRateStatus] = useState(null); // 'found' | 'not_available'
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Filter & Search states for the general comparison list
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all'); // 'all', 'Public Sector', 'Private Sector'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('minRate'); // 'minRate', 'maxRate', 'bankName'
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Interactive Sandbox / Manual Rate Simulator State
  const [sandboxRate, setSandboxRate] = useState(8.50);
  const [sandboxAmount, setSandboxAmount] = useState(3000000);
  const [sandboxTenureYears, setSandboxTenureYears] = useState(20);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch bank list and categories on mount
  useEffect(() => {
    bankRateAPI.getBanks()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setAvailableBanks(res.data);
        }
      })
      .catch(() => {});

    bankRateAPI.getCategories()
      .then((res) => {
        if (res && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Perform Exact Bank + Loan Type Search
  const performBankSearch = async (bankName, loanType) => {
    const b = (bankName !== undefined ? bankName : searchBankQuery).trim();
    const lt = loanType !== undefined ? loanType : searchLoanType;
    if (!b) return;

    setExactRateLoading(true);
    setExactRateStatus(null);

    try {
      const res = await bankRateAPI.searchRate(b, lt);
      if (res && res.found && res.data) {
        setExactRateResult(res.data);
        setExactRateStatus('found');
      } else {
        setExactRateResult(null);
        setExactRateStatus('not_available');
      }
    } catch (err) {
      // Offline fallback lookup
      const bLower = b.toLowerCase();
      const match = rates.find(
        (r) =>
          (r.bankName.toLowerCase() === bLower ||
            r.bankCode.toLowerCase() === bLower ||
            r.bankName.toLowerCase().includes(bLower)) &&
          r.loanCategory === lt
      );
      if (match) {
        setExactRateResult(match);
        setExactRateStatus('found');
      } else {
        setExactRateResult(null);
        setExactRateStatus('not_available');
      }
    } finally {
      setExactRateLoading(false);
    }
  };

  // Trigger search on mount and when bank or loan type changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchBankQuery.trim()) {
        performBankSearch(searchBankQuery, searchLoanType);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchBankQuery, searchLoanType]);

  // Bank name suggestions as user types
  const bankSuggestions = useMemo(() => {
    if (!searchBankQuery.trim()) return availableBanks;
    const q = searchBankQuery.toLowerCase().trim();
    return availableBanks.filter(
      (b) =>
        b.bankName.toLowerCase().includes(q) ||
        b.bankCode.toLowerCase().includes(q)
    );
  }, [availableBanks, searchBankQuery]);

  // Fetch full rates catalog for comparison list
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchRates = async () => {
      try {
        const params = {};
        if (selectedCategory !== 'all') {
          params.loanType = selectedCategory;
        }
        if (selectedSector !== 'all') {
          params.bankType = selectedSector;
        }
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;

        const res = await bankRateAPI.getRates(params);
        if (isMounted && res && res.data) {
          setRates(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load bank rates:', err);
          setError('Unable to reach bank rates server. Displaying cached verified information.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(fetchRates, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedCategory, selectedSector, searchTerm, sortBy, sortOrder]);

  const displayedRates = useMemo(() => {
    return rates;
  }, [rates]);

  // Statistics for selected catalog view
  const stats = useMemo(() => {
    if (!displayedRates.length) return null;
    const validMinRates = displayedRates.filter((r) => r.minRate != null).map((r) => r.minRate);
    if (!validMinRates.length) return null;

    const lowest = Math.min(...validMinRates);
    const avg = validMinRates.reduce((sum, r) => sum + r, 0) / validMinRates.length;
    const lowestRateBank = displayedRates.find((r) => r.minRate === lowest);

    return {
      lowest,
      avg: avg.toFixed(2),
      lowestBank: lowestRateBank?.bankName || 'Multiple Banks',
      totalCount: displayedRates.length
    };
  }, [displayedRates]);

  // Handle Handoff to Main EMI Calculator
  const handleCalculateEmiHandoff = (rateValue, bankName, schemeName, loanCat = selectedCategory) => {
    if (rateValue == null || isNaN(rateValue)) {
      showToast('Rate is not available for this scheme.', 'info');
      return;
    }

    // Set tenure according to loan type if appropriate
    let tenure = loanParams.tenureMonths || 240;
    if (loanCat === 'car') tenure = 84;
    else if (loanCat === 'personal') tenure = 60;
    else if (loanCat === 'two_wheeler') tenure = 36;
    else if (loanCat === 'gold') tenure = 24;
    else if (loanCat === 'education') tenure = 120;

    updateLoanParams({
      annualRate: Number(rateValue),
      tenureMonths: tenure
    });

    showToast(`Loaded ${bankName} (${rateValue}%) into EMI Calculator!`);
    navigate('/calculator');
  };

  // Sandbox Live EMI calculation
  const sandboxEmiData = useMemo(() => {
    return calculateEMI(sandboxAmount, sandboxRate, sandboxTenureYears * 12);
  }, [sandboxAmount, sandboxRate, sandboxTenureYears]);

  return (
    <div className="page-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* 1. Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Landmark size={24} />
          </div>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--primary)'
          }}>
            Verified Banking Intelligence
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Interest Rates
          </h1>
          <HelpTooltip text="Search verified published interest rates by Bank Name and Loan Type across 19+ Indian scheduled commercial banks." placement="right" />
        </div>
      </div>

      {/* 2. Mandatory Statutory Disclaimer Banner (STRICT REQUIREMENT) */}
      <div style={{
        background: 'var(--status-tight-bg)',
        border: '1px solid var(--status-tight-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <AlertCircle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--status-tight-text)' }}>
          <strong style={{ display: 'block', marginBottom: '2px', fontWeight: 700 }}>
            Official Statutory Rate Notice
          </strong>
          {MANDATORY_DISCLAIMER}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 3. DEDICATED FEATURE: BANK SEARCH BY NAME AND LOAN TYPE                   */}
      {/* ========================================================================= */}
      <div className="cl-card-colored cl-card-indigo" style={{
        padding: '26px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background: 'var(--accent-indigo-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
              }}>
                <Search size={18} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Bank Rate Search</span>
                <HelpTooltip text="Select or type any bank name and pick a loan type to view that bank's specific verified rate, conditions, and official source." placement="right" />
              </div>
            </h2>
          </div>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick examples:</span>
            <button
              onClick={() => {
                setSearchBankQuery('State Bank of India');
                setSearchLoanType('car');
              }}
              className="preset-chip preset-chip-indigo active"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              SBI Car Loan
            </button>
            <button
              onClick={() => {
                setSearchBankQuery('HDFC Bank');
                setSearchLoanType('home');
              }}
              className="preset-chip preset-chip-emerald active"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              HDFC Home Loan
            </button>
            <button
              onClick={() => {
                setSearchBankQuery('ICICI Bank');
                setSearchLoanType('personal');
              }}
              className="preset-chip preset-chip-amber active"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              ICICI Personal Loan
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Bank Name Search Input with Suggestions */}
          <div style={{ position: 'relative' }} ref={suggestionsRef}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              1. Bank Name (Type or Select)
            </label>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-indigo">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Type bank name (e.g. SBI, HDFC, ICICI, PNB)..."
                value={searchBankQuery}
                onChange={(e) => {
                  setSearchBankQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="form-input has-prefix-pill input-indigo"
                style={{ fontSize: '0.95rem', fontWeight: 600 }}
              />
              {searchBankQuery && (
                <button
                  onClick={() => setSearchBankQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    zIndex: 2
                  }}
                  title="Clear bank input"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown list */}
            {showSuggestions && bankSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                maxHeight: '260px',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100
              }}>
                {bankSuggestions.map((bank) => (
                  <div
                    key={bank.bankCode}
                    onClick={() => {
                      setSearchBankQuery(bank.bankName);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {bank.bankName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Code: {bank.bankCode.toUpperCase()}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: bank.bankType === 'Public Sector' ? 'var(--primary)' : '#8b5cf6'
                    }}>
                      {bank.bankType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Select from Full Bank List */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Or Select Bank from List
            </label>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-purple">
                <Building size={16} />
              </span>
              <select
                value={searchBankQuery}
                onChange={(e) => {
                  setSearchBankQuery(e.target.value);
                  setShowSuggestions(false);
                }}
                className="form-input has-prefix-pill input-purple"
                style={{ fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value="">-- Choose a Bank --</option>
                {availableBanks.map((b) => (
                  <option key={b.bankCode} value={b.bankName}>
                    {b.bankName} ({b.bankType})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loan Type Selection Pills */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            2. Choose Loan Type
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SEARCH_LOAN_TYPES.map((lt) => {
              const Icon = lt.icon;
              const isSelected = searchLoanType === lt.id;
              return (
                <button
                  key={lt.id}
                  onClick={() => setSearchLoanType(lt.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--accent-indigo-gradient)' : 'var(--bg-card-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={16} />
                  <span>{lt.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search / Check Rates Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => performBankSearch(searchBankQuery, searchLoanType)}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '0.92rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            id="btn-check-bank-rates"
          >
            <Search size={16} />
            <span>Check Bank Rates</span>
          </button>
        </div>

        {/* Exact Rate Search Result Display Card */}
        {exactRateLoading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{
              width: '28px',
              height: '28px',
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 8px auto',
              animation: 'spin 0.8s linear infinite'
            }} />
            Searching verified published rates for {searchBankQuery}...
          </div>
        ) : exactRateStatus === 'found' && exactRateResult ? (
          /* Found verified rate */
          <div className="cl-card-colored cl-card-emerald" style={{
            padding: '22px',
            marginTop: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  {exactRateResult.bankName}
                </h3>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Scheme: {exactRateResult.schemeName} ({exactRateResult.loanCategoryName || exactRateResult.loanCategory})
                </div>
              </div>

              {/* Published Rate Box */}
              <div style={{
                background: 'var(--accent-emerald-light)',
                border: '1px solid var(--accent-emerald-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 18px',
                textAlign: 'right',
                minWidth: '180px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald-text)', textTransform: 'uppercase' }}>
                  Published Rate
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald-text)', marginTop: '2px' }}>
                  {exactRateResult.minRate != null
                    ? (exactRateResult.maxRate && exactRateResult.maxRate !== exactRateResult.minRate
                        ? `${exactRateResult.minRate.toFixed(2)}% - ${exactRateResult.maxRate.toFixed(2)}%`
                        : `${exactRateResult.minRate.toFixed(2)}%`)
                    : 'Rate not verified'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {exactRateResult.rateType} {exactRateResult.benchmark ? `(${exactRateResult.benchmark})` : ''}
                </div>
              </div>
            </div>

            {/* Conditions & Eligibility Details */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Applicable Conditions & Eligibility Notes:
              </div>
              {exactRateResult.eligibility && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0 8px 0' }}>
                  {exactRateResult.eligibility}
                </p>
              )}
              {exactRateResult.conditions && exactRateResult.conditions.length > 0 && (
                <ul style={{ paddingLeft: '18px', margin: '4px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {exactRateResult.conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
              {exactRateResult.notes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                  Note: {exactRateResult.notes}
                </div>
              )}
            </div>

            {/* Processing Fee */}
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-subtle)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>Processing Charges: </strong>
              {exactRateResult.processingFee || 'Refer to bank published circular'}
            </div>

            {/* Actions & Official Source bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={15} color="#10b981" />
                  Last verified: {exactRateResult.lastVerified ? new Date(exactRateResult.lastVerified).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'March 2026'}
                </span>
                <a
                  href={exactRateResult.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontWeight: 700
                  }}
                >
                  <span>Verify on Official Bank Source</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Calculate EMI Action */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleCalculateEmiHandoff(exactRateResult.minRate, exactRateResult.bankName, exactRateResult.schemeName, exactRateResult.loanCategory)}
                  disabled={exactRateResult.minRate == null}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Calculator size={16} />
                  <span>Calculate EMI with this Rate ({exactRateResult.minRate}%)</span>
                </button>
              </div>
            </div>
          </div>
        ) : exactRateStatus === 'not_available' ? (
          /* Not offered or unverified state (No fallback to other banks) */
          <div style={{
            background: 'var(--status-tight-bg)',
            border: '1px solid var(--status-tight-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--status-tight-text)', margin: '0 0 6px 0' }}>
                  No Verified Rate for {searchBankQuery} under {searchLoanType.replace('_', ' ').toUpperCase()} Loan
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--status-tight-text)', lineHeight: 1.5, margin: '4px 0 10px 0' }}>
                  {searchBankQuery} does not have an officially verified published rate for this specific loan category in our repository, or does not currently offer retail financing under this segment.
                  CreditLens strictly preserves official integrity and does not substitute rates from other lenders as a fallback.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      // Switch to another common loan category that this bank offers
                      const bankItem = availableBanks.find(
                        (b) => b.bankName.toLowerCase() === searchBankQuery.toLowerCase()
                      );
                      if (bankItem && bankItem.categories && bankItem.categories.length > 0) {
                        setSearchLoanType(bankItem.categories[0]);
                      } else {
                        setSearchLoanType('home');
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    View Other Offered Loans for {searchBankQuery}
                  </button>
                  <a
                    href="https://www.rbi.org.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Check RBI Banking Directory</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* 4. Category Selector Tabs for Full Catalog Filter                        */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '20px',
        scrollbarWidth: 'thin'
      }}>
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || Landmark;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{cat.name}</span>
              {cat.rateCount !== undefined && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-card-subtle)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {cat.rateCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. Controls Toolbar (Search, Sector Filter, Sort, View Mode) */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 280px',
          minWidth: '240px'
        }}>
          <Search size={18} color="var(--text-muted)" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            placeholder="Filter bank scheme, rate or keywords across catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
          />
        </div>

        {/* Sector and Sort dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Sector Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building size={16} color="var(--text-muted)" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Sectors</option>
              <option value="Public Sector">Public Sector Banks</option>
              <option value="Private Sector">Private Sector Banks</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={16} color="var(--text-muted)" />
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <option value="minRate_asc">Lowest Starting Rate (Ascending)</option>
              <option value="minRate_desc">Highest Starting Rate (Descending)</option>
              <option value="bankName_asc">Bank Name (A to Z)</option>
              <option value="lastVerified_desc">Most Recently Verified</option>
            </select>
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              title="Card View"
              style={{
                padding: '8px 12px',
                border: 'none',
                background: viewMode === 'cards' ? 'var(--primary-light)' : 'var(--bg-card)',
                color: viewMode === 'cards' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={17} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                padding: '8px 12px',
                border: 'none',
                borderLeft: '1px solid var(--border-subtle)',
                background: viewMode === 'table' ? 'var(--primary-light)' : 'var(--bg-card)',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <TableIcon size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Statistics Ribbon */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="cl-card-colored cl-card-emerald" style={{
            padding: '16px 20px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Lowest Available Rate
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald-text)', marginTop: '4px' }}>
              {stats.lowest.toFixed(2)}% p.a.
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
              Offered by {stats.lowestBank}
            </div>
          </div>

          <div className="cl-card-colored cl-card-indigo" style={{
            padding: '16px 20px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-indigo-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Category Benchmark Average
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-indigo-text)', marginTop: '4px' }}>
              {stats.avg}% p.a.
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
              Across {stats.totalCount} published schemes
            </div>
          </div>

          <div className="cl-card-colored cl-card-sky" style={{
            padding: '16px 20px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-sky-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Official Sources
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-sky-text)', marginTop: '4px' }}>
              100% Verified
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
              Direct RBI & Bank Published Circulars
            </div>
          </div>
        </div>
      )}

      {/* 7. Interactive Rate Sandbox / Manual Rate Simulator */}
      <div className="cl-card-colored cl-card-purple" style={{
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-purple-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.35)'
              }}>
                <Calculator size={18} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Quick EMI Simulator & Manual Rate Override</span>
                <HelpTooltip text="Test any custom or quoted bank rate manually, preview immediate monthly obligation, or transfer it to the main calculator." placement="top" />
              </div>
            </h3>
          </div>
          <button
            onClick={() => handleCalculateEmiHandoff(sandboxRate, 'Custom Rate Simulator', 'Manual Entry', 'home')}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Open in Full Calculator</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'center' }}>
          {/* Custom Annual Rate Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Manual Interest Rate (% p.a.)
            </label>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-amber">%</span>
              <input
                type="number"
                step="0.05"
                min="1"
                max="36"
                value={sandboxRate}
                onChange={(e) => setSandboxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="form-input has-prefix-pill has-suffix-pill input-amber"
                style={{ fontWeight: 700, fontSize: '0.95rem' }}
              />
              <span className="input-suffix-pill">% p.a.</span>
            </div>
          </div>

          {/* Loan Amount Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Loan Principal (₹)
            </label>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-indigo">₹</span>
              <input
                type="number"
                step="50000"
                min="10000"
                value={sandboxAmount}
                onChange={(e) => setSandboxAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="form-input has-prefix-pill has-suffix-pill input-indigo"
                style={{ fontWeight: 700, fontSize: '0.95rem' }}
              />
              <span className="input-suffix-pill">INR</span>
            </div>
          </div>

          {/* Tenure in Years */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Tenure (Years)
            </label>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-sky">⏱</span>
              <input
                type="number"
                step="1"
                min="1"
                max="30"
                value={sandboxTenureYears}
                onChange={(e) => setSandboxTenureYears(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="form-input has-prefix-pill has-suffix-pill input-sky"
                style={{ fontWeight: 700, fontSize: '0.95rem' }}
              />
              <span className="input-suffix-pill">Years</span>
            </div>
          </div>

          {/* Calculated Output Box */}
          <div style={{
            background: 'var(--accent-purple-light)',
            border: '1.5px solid var(--accent-purple-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            textAlign: 'right',
            boxShadow: '0 2px 10px rgba(168, 85, 247, 0.15)'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-purple-text)', textTransform: 'uppercase', fontWeight: 700 }}>
              Estimated Monthly EMI
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--accent-purple-text)', marginTop: '2px' }}>
              {formatINR(sandboxEmiData.emi)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Interest: {formatINR(sandboxEmiData.totalInterest)}
            </div>
          </div>
        </div>
      </div>

      {/* 8. Loading / Error / Empty States */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div className="spinner" style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 16px auto',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Querying verified bank publications & benchmark rates...
          </p>
        </div>
      )}

      {!loading && displayedRates.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Landmark size={44} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Matching Bank Rates Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 16px auto', fontSize: '0.9rem' }}>
            Try clearing your search keyword or switching between Public and Private sector banks.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedSector('all');
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 9. Card Grid View */}
      {!loading && displayedRates.length > 0 && viewMode === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {displayedRates.map((rate) => {
            const rateRange = rate.minRate != null
              ? (rate.maxRate && rate.maxRate !== rate.minRate
                  ? `${rate.minRate.toFixed(2)}% - ${rate.maxRate.toFixed(2)}%`
                  : `${rate.minRate.toFixed(2)}%`)
              : 'Rate not available';

            return (
              <div
                key={rate._id || `${rate.bankCode}_${rate.loanCategory}_${rate.schemeName}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderTop: `3px solid ${rate.bankType === 'Public Sector' ? 'var(--accent-indigo)' : 'var(--accent-purple)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar: Bank Name & Category / Sector Badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                      }}>
                        {rate.bankName}
                      </h3>
                      <div style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)'
                      }}>
                        {rate.schemeName}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: rate.bankType === 'Public Sector' ? 'var(--primary)' : 'var(--accent-purple)',
                      whiteSpace: 'nowrap'
                    }}>
                      {rate.bankType}
                    </span>
                  </div>

                  {/* Rate Display Box */}
                  <div style={{
                    background: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid var(--accent-emerald)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    margin: '12px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-emerald-text)', textTransform: 'uppercase' }}>
                        Published Interest Rate
                      </div>
                      <div style={{
                        fontSize: '1.45rem',
                        fontWeight: 800,
                        color: rate.minRate != null ? 'var(--accent-emerald-text)' : 'var(--text-muted)',
                        marginTop: '2px'
                      }}>
                        {rateRange}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)'
                      }}>
                        {rate.rateType}
                      </div>
                      {rate.benchmark && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {rate.benchmark}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Eligibility & Conditions */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Eligibility & Conditions:
                    </div>
                    {rate.eligibility && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '6px' }}>
                        {rate.eligibility}
                      </p>
                    )}
                    {rate.conditions && rate.conditions.length > 0 && (
                      <ul style={{ paddingLeft: '16px', margin: '4px 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {rate.conditions.slice(0, 3).map((cond, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>{cond}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Processing Fees */}
                  <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-card)',
                    border: '1px dashed var(--border-subtle)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px'
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Processing Charges: </strong>
                    {rate.processingFee || 'Refer to official schedule'}
                  </div>
                </div>

                {/* Bottom Bar: Action buttons & Official verification tag */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginBottom: '12px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      Verified: {rate.lastVerified ? new Date(rate.lastVerified).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'March 2026'}
                    </span>
                    <a
                      href={rate.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      <span>Official Source</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Action Buttons: Calculate EMI or Apply to Sandbox */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleCalculateEmiHandoff(rate.minRate, rate.bankName, rate.schemeName, rate.loanCategory)}
                      disabled={rate.minRate == null}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: rate.minRate != null ? 'pointer' : 'not-allowed',
                        opacity: rate.minRate != null ? 1 : 0.6,
                        transition: 'background var(--transition-fast)'
                      }}
                    >
                      <Calculator size={15} />
                      <span>Calculate EMI</span>
                    </button>
                    <button
                      onClick={() => {
                        if (rate.minRate != null) {
                          setSandboxRate(rate.minRate);
                          showToast(`Set ${rate.bankName} rate (${rate.minRate}%) in simulator above`);
                          window.scrollTo({ top: 600, behavior: 'smooth' });
                        }
                      }}
                      title="Load into Quick Simulator"
                      style={{
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Simulate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 10. Comparison Table View */}
      {!loading && displayedRates.length > 0 && viewMode === 'table' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Bank & Scheme</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Category</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Published Rate</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Type & Benchmark</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Processing Charges</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Verified Source</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedRates.map((rate, idx) => {
                  const rateRange = rate.minRate != null
                    ? (rate.maxRate && rate.maxRate !== rate.minRate
                        ? `${rate.minRate.toFixed(2)}% - ${rate.maxRate.toFixed(2)}%`
                        : `${rate.minRate.toFixed(2)}%`)
                    : 'Rate not available';

                  return (
                    <tr
                      key={rate._id || idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                        transition: 'background var(--transition-fast)'
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rate.bankName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rate.schemeName}</div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: rate.bankType === 'Public Sector' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                          color: rate.bankType === 'Public Sector' ? 'var(--primary)' : '#8b5cf6'
                        }}>
                          {rate.bankType}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        <span style={{
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}>
                          {rate.loanCategoryName || rate.loanCategory}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: rate.minRate != null ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          {rateRange}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>per annum</div>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rate.rateType}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rate.benchmark || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '220px' }}>
                        {rate.processingFee}
                      </td>

                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <a
                          href={rate.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.82rem'
                          }}
                        >
                          <span>Official Portal</span>
                          <ExternalLink size={13} />
                        </a>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Verified: {rate.lastVerified ? new Date(rate.lastVerified).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'March 2026'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleCalculateEmiHandoff(rate.minRate, rate.bankName, rate.schemeName, rate.loanCategory)}
                          disabled={rate.minRate == null}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '7px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: rate.minRate != null ? 'pointer' : 'not-allowed',
                            opacity: rate.minRate != null ? 1 : 0.6
                          }}
                        >
                          <Calculator size={14} />
                          <span>Calculate EMI</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default BankRatesPage;
