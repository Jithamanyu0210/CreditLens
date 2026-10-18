import React, { useState, useEffect } from 'react';
import { 
  User, 
  Wallet, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  PieChart, 
  ArrowRight,
  CreditCard,
  Info,
  Edit2,
  Check,
  X,
  PiggyBank
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatPercent } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { 
    profile, 
    profileLoading,
    updateProfile, 
    resetProfileToDefault, 
    addExistingLoan, 
    updateExistingLoan, 
    deleteExistingLoan 
  } = useLoan();

  // Baseline form state
  const [income, setIncome] = useState(profile.monthlyIncome ?? 0);
  const [expenses, setExpenses] = useState(profile.monthlyExpenses ?? 0);
  const [otherExpenses, setOtherExpenses] = useState(profile.otherExpenses ?? 0);
  const [savingsTarget, setSavingsTarget] = useState(profile.monthlySavingsTarget ?? 0);
  const [currentSavings, setCurrentSavings] = useState(profile.currentSavings ?? 0);

  // Synchronize form state whenever user's profile is loaded or updated
  useEffect(() => {
    if (profile) {
      setIncome(profile.monthlyIncome ?? 0);
      setExpenses(profile.monthlyExpenses ?? 0);
      setOtherExpenses(profile.otherExpenses ?? 0);
      setSavingsTarget(profile.monthlySavingsTarget ?? 0);
      setCurrentSavings(profile.currentSavings ?? 0);
    }
  }, [
    profile.monthlyIncome,
    profile.monthlyExpenses,
    profile.otherExpenses,
    profile.monthlySavingsTarget,
    profile.currentSavings
  ]);

  // New EMI inline state
  const [newLoanName, setNewLoanName] = useState('');
  const [newLoanEmi, setNewLoanEmi] = useState('');
  const [newLoanBalance, setNewLoanBalance] = useState('');
  const [newLoanRate, setNewLoanRate] = useState('11.0');
  const [newLoanMonths, setNewLoanMonths] = useState('12');

  // Edit EMI state
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editMonths, setEditMonths] = useState('');

  const [error, setError] = useState('');

  // Handle adding a new EMI with individual details
  const handleAddLoan = (e) => {
    e.preventDefault();
    if (!newLoanName.trim()) {
      setError('Please provide a name/label for the existing loan (e.g., Bike Loan).');
      return;
    }
    const emiNum = parseFloat(newLoanEmi);
    if (isNaN(emiNum) || emiNum < 0) {
      setError('Please enter a valid monthly EMI amount (cannot be negative).');
      return;
    }

    const balanceNum = newLoanBalance === '' ? emiNum * 12 : parseFloat(newLoanBalance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      setError('Outstanding balance cannot be negative.');
      return;
    }

    const rateNum = newLoanRate === '' ? 10 : parseFloat(newLoanRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setError('Interest rate must be between 0% and 100%.');
      return;
    }

    const monthsNum = newLoanMonths === '' ? 12 : parseInt(newLoanMonths, 10);
    if (isNaN(monthsNum) || monthsNum < 1) {
      setError('Remaining tenure must be at least 1 month.');
      return;
    }

    addExistingLoan({
      name: newLoanName.trim(),
      amount: emiNum,
      balance: balanceNum,
      annualRate: rateNum,
      remainingMonths: monthsNum
    });

    setNewLoanName('');
    setNewLoanEmi('');
    setNewLoanBalance('');
    setNewLoanRate('11.0');
    setNewLoanMonths('12');
    setError('');
  };

  const startEditLoan = (loan) => {
    setEditingLoanId(loan.id);
    setEditName(loan.name);
    setEditAmount(loan.amount);
    setEditBalance(loan.balance ?? 0);
    setEditRate(loan.annualRate ?? 10);
    setEditMonths(loan.remainingMonths ?? 12);
  };

  const handleSaveEdit = (id) => {
    const amtNum = parseFloat(editAmount);
    if (isNaN(amtNum) || amtNum < 0) {
      setError('EMI amount cannot be negative.');
      return;
    }
    const balNum = editBalance === '' ? 0 : parseFloat(editBalance);
    if (isNaN(balNum) || balNum < 0) {
      setError('Loan balance cannot be negative.');
      return;
    }
    const rateNum = editRate === '' ? 10 : parseFloat(editRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setError('Interest rate must be between 0% and 100%.');
      return;
    }
    const monthsNum = editMonths === '' ? 12 : parseInt(editMonths, 10);
    if (isNaN(monthsNum) || monthsNum < 1) {
      setError('Remaining tenure must be at least 1 month.');
      return;
    }

    updateExistingLoan(id, {
      name: editName.trim() || 'Existing Loan',
      amount: amtNum,
      balance: balNum,
      annualRate: rateNum,
      remainingMonths: monthsNum
    });
    setEditingLoanId(null);
    setError('');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const incomeNum = income === '' ? 0 : parseFloat(income);
    const expensesNum = expenses === '' ? 0 : parseFloat(expenses);
    const otherExpensesNum = otherExpenses === '' ? 0 : parseFloat(otherExpenses);
    const savingsTargetNum = savingsTarget === '' ? 0 : parseFloat(savingsTarget);
    const currentSavingsNum = currentSavings === '' ? 0 : parseFloat(currentSavings);

    if (isNaN(incomeNum) || incomeNum < 0) {
      setError('Monthly income cannot be negative.');
      return;
    }

    if (isNaN(expensesNum) || expensesNum < 0) {
      setError('Monthly living expenses cannot be negative.');
      return;
    }

    if (isNaN(otherExpensesNum) || otherExpensesNum < 0) {
      setError('Other monthly expenses cannot be negative.');
      return;
    }

    if (isNaN(savingsTargetNum) || savingsTargetNum < 0) {
      setError('Monthly savings target cannot be negative.');
      return;
    }

    if (isNaN(currentSavingsNum) || currentSavingsNum < 0) {
      setError('Current liquid savings cannot be negative.');
      return;
    }

    updateProfile({
      monthlyIncome: incomeNum,
      monthlyExpenses: expensesNum,
      otherExpenses: otherExpensesNum,
      monthlySavingsTarget: savingsTargetNum,
      currentSavings: currentSavingsNum
    });
    setError('');
  };

  const handleReset = () => {
    resetProfileToDefault();
    setIncome(0);
    setExpenses(0);
    setOtherExpenses(0);
    setSavingsTarget(0);
    setCurrentSavings(0);
    setError('');
  };

  // Calculations for summary sidebar
  const totalExistingEmis = profile.existingEmis.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalOutstandingBalance = profile.existingEmis.reduce((sum, item) => sum + (Number(item.balance) || 0), 0);
  const totalCombinedExpenses = (Number(expenses) || 0) + (Number(otherExpenses) || 0);
  const totalFixedOutflow = totalCombinedExpenses + totalExistingEmis;
  const netDisposableIncome = (Number(income) || 0) - totalFixedOutflow;
  const surplusAfterSavings = netDisposableIncome - Number(savingsTarget || 0);

  return (
    <div>
      <BackButton />
      <div className="page-header">
        <h1 className="page-title">Financial Profile & Debt Portfolio</h1>
        <p className="page-subtitle">
          Manage your monthly earnings, essential living costs, other expenses, multiple individual loans, and personal savings targets.
        </p>
      </div>

      {/* Authenticated Account Details Banner */}
      <div className="cl-card" style={{
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontWeight: '800',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {user?.name || 'Verified User'}
              </div>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <div>
          {user && (
            <button
              type="button"
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--status-risky)' }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--status-risky-bg)',
          color: 'var(--status-risky-text)',
          border: '1px solid var(--status-risky-border)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '28px' }}>
        {/* Left Column: Editable Financial Baseline & Multiple Loans */}
        <div className="cl-card cl-card-colored cl-card-emerald">
          <div className="cl-card-header">
            <div className="cl-card-title">
              <div className="kpi-icon-container kpi-icon-emerald" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                <User size={18} />
              </div>
              <span>Monthly Financial Baseline</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
              title="Reset profile to blank state"
            >
              <RotateCcw size={14} />
              <span>Clear Profile</span>
            </button>
          </div>

          <form onSubmit={handleSaveProfile} noValidate>
            {/* Monthly Income */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" htmlFor="profile-income" style={{ margin: 0 }}>
                  <span>Net Monthly Take-Home Income (₹)</span>
                </label>
                <span className="cl-badge" style={{ backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald-text)', border: '1px solid var(--accent-emerald-border)', fontSize: '0.72rem' }}>
                  Primary Inflow
                </span>
              </div>
              <div className="form-input-wrapper">
                <span className="input-prefix-pill input-prefix-emerald">₹</span>
                <input
                  id="profile-income"
                  type="number"
                  min="0"
                  step="any"
                  value={income}
                  onChange={(e) => {
                    setIncome(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input has-prefix-pill has-suffix-pill input-emerald"
                  required
                />
                <span className="input-suffix-pill">/ month</span>
              </div>
            </div>

            {/* Monthly Living Expenses */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" htmlFor="profile-expenses" style={{ margin: 0 }}>
                  <span>Monthly Living Expenses (Rent, Food, Bills)</span>
                </label>
                <span className="cl-badge" style={{ backgroundColor: 'var(--accent-amber-light)', color: 'var(--accent-amber-text)', border: '1px solid var(--accent-amber-border)', fontSize: '0.72rem' }}>
                  Essential Needs
                </span>
              </div>
              <div className="form-input-wrapper">
                <span className="input-prefix-pill input-prefix-amber">₹</span>
                <input
                  id="profile-expenses"
                  type="number"
                  min="0"
                  step="any"
                  value={expenses}
                  onChange={(e) => {
                    setExpenses(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input has-prefix-pill has-suffix-pill input-amber"
                  required
                />
                <span className="input-suffix-pill">/ month</span>
              </div>
            </div>

            {/* Other Monthly Expenses */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" htmlFor="profile-other-expenses" style={{ margin: 0 }}>
                  <span>Other Monthly Expenses (Subscriptions & Misc)</span>
                </label>
                <span className="cl-badge" style={{ backgroundColor: 'var(--accent-rose-light)', color: 'var(--accent-rose-text)', border: '1px solid var(--accent-rose-border)', fontSize: '0.72rem' }}>
                  Discretionary
                </span>
              </div>
              <div className="form-input-wrapper">
                <span className="input-prefix-pill input-prefix-rose">₹</span>
                <input
                  id="profile-other-expenses"
                  type="number"
                  min="0"
                  step="any"
                  value={otherExpenses}
                  onChange={(e) => {
                    setOtherExpenses(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input has-prefix-pill has-suffix-pill input-rose"
                  placeholder="0"
                />
                <span className="input-suffix-pill">/ month</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Separate from basic living needs: OTT, gym memberships, dining out, personal care.
              </span>
            </div>

            {/* Monthly Savings Target */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" htmlFor="profile-savings-target" style={{ margin: 0 }}>
                  <span>Protected Monthly Savings Target (₹)</span>
                </label>
                <span className="cl-badge" style={{ backgroundColor: 'var(--accent-sky-light)', color: 'var(--accent-sky-text)', border: '1px solid var(--accent-sky-border)', fontSize: '0.72rem' }}>
                  Contingency
                </span>
              </div>
              <div className="form-input-wrapper">
                <span className="input-prefix-pill input-prefix-sky">₹</span>
                <input
                  id="profile-savings-target"
                  type="number"
                  min="0"
                  step="any"
                  value={savingsTarget}
                  onChange={(e) => {
                    setSavingsTarget(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input has-prefix-pill has-suffix-pill input-sky"
                />
                <span className="input-suffix-pill">/ month</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Target amount to set aside for investments and contingency each month
              </span>
            </div>

            {/* Current Liquid Savings */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" htmlFor="profile-liquid-savings" style={{ margin: 0 }}>
                  <span>Current Liquid Emergency Reserves (₹)</span>
                </label>
                <span className="cl-badge" style={{ backgroundColor: 'var(--accent-teal-light)', color: 'var(--accent-teal-text)', border: '1px solid var(--accent-teal-border)', fontSize: '0.72rem' }}>
                  Safety Buffer
                </span>
              </div>
              <div className="form-input-wrapper">
                <span className="input-prefix-pill input-prefix-teal">₹</span>
                <input
                  id="profile-liquid-savings"
                  type="number"
                  min="0"
                  step="any"
                  value={currentSavings}
                  onChange={(e) => {
                    setCurrentSavings(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input has-prefix-pill has-suffix-pill input-teal"
                />
                <span className="input-suffix-pill">Reserves</span>
              </div>
            </div>

            <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: '10px' }}>
              <Save size={16} />
              <span>{profileLoading ? 'Loading Profile...' : 'Update Baseline Finances'}</span>
            </button>
          </form>

          {/* Multiple Existing Loans Section */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Active Existing Loans ({profile.existingEmis.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Manage individual debts, interest rates, and balances
                </p>
              </div>
              <span className="cl-badge cl-badge-amber">
                Total: {formatINR(totalExistingEmis)}/mo
              </span>
            </div>

            {/* Loan Items List */}
            {profile.existingEmis.length === 0 ? (
              <div style={{
                padding: '20px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '16px'
              }}>
                No active loans listed. You have zero existing debt!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {profile.existingEmis.map((loan) => (
                  <div
                    key={loan.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    {editingLoanId === loan.id ? (
                      /* Inline Editing View */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="form-input"
                            placeholder="Loan Name"
                            style={{ flex: 2 }}
                          />
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="form-input"
                            placeholder="EMI ₹"
                            style={{ flex: 1 }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={editBalance}
                            onChange={(e) => setEditBalance(e.target.value)}
                            className="form-input"
                            placeholder="Balance ₹"
                            style={{ flex: 1 }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={editRate}
                            onChange={(e) => setEditRate(e.target.value)}
                            className="form-input"
                            placeholder="Rate %"
                            style={{ flex: 1 }}
                          />
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={editMonths}
                            onChange={(e) => setEditMonths(e.target.value)}
                            className="form-input"
                            placeholder="Months Left"
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(loan.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLoanId(null)}
                            className="btn btn-secondary btn-sm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Regular Display View */
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {loan.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Balance: <strong>{formatINR(loan.balance || 0)}</strong> &bull; Rate: <strong>{loan.annualRate ?? 10}%</strong> &bull; Left: <strong>{loan.remainingMonths || 12} mos</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {formatINR(loan.amount)}/mo
                          </span>
                          <button
                            type="button"
                            onClick={() => startEditLoan(loan)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            title="Edit Loan Details"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteExistingLoan(loan.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            title="Delete Loan"
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Loan Form */}
            <form onSubmit={handleAddLoan} noValidate style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                + Add Another Existing Loan
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Loan Name (e.g. Car Loan)"
                  value={newLoanName}
                  onChange={(e) => setNewLoanName(e.target.value)}
                  className="form-input"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Monthly EMI (₹)"
                  value={newLoanEmi}
                  onChange={(e) => setNewLoanEmi(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Outstanding ₹"
                  value={newLoanBalance}
                  onChange={(e) => setNewLoanBalance(e.target.value)}
                  className="form-input"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="Rate % (p.a.)"
                  value={newLoanRate}
                  onChange={(e) => setNewLoanRate(e.target.value)}
                  className="form-input"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Months Left"
                  value={newLoanMonths}
                  onChange={(e) => setNewLoanMonths(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                <Plus size={15} />
                <span>Save New Loan into Portfolio</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Financial Health & Debt Portfolio Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="cl-card cl-card-colored cl-card-indigo">
            <div className="cl-card-header">
              <div className="cl-card-title">
                <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
                  <PieChart size={18} />
                </div>
                <span>Cashflow Breakdown & Reserves</span>
              </div>
              <span className="cl-badge" style={{ backgroundColor: 'var(--accent-indigo-light)', color: 'var(--accent-indigo-text)', border: '1px solid var(--accent-indigo-border)' }}>
                Live Solvency
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-emerald-light)', border: '1px solid var(--accent-emerald-border)' }}>
                <span style={{ fontWeight: '700', color: 'var(--accent-emerald-text)', fontSize: '0.85rem' }}>Monthly Take-Home:</span>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--accent-emerald-text)' }}>{formatINR(income)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Living Expenses (Needs):</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-amber)' }}>- {formatINR(expenses)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Other Discretionary Costs:</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-rose)' }}>- {formatINR(otherExpenses || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Loan EMIs ({profile.existingEmis.length} loans):</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-rose)' }}>- {formatINR(totalExistingEmis)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Protected Monthly Savings:</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-sky)' }}>- {formatINR(savingsTarget)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: surplusAfterSavings >= 0 ? 'var(--status-comfortable-bg)' : 'var(--status-risky-bg)',
                border: `1.5px solid ${surplusAfterSavings >= 0 ? 'var(--status-comfortable-border)' : 'var(--status-risky-border)'}`
              }}>
                <div>
                  <div style={{ fontWeight: '800', color: surplusAfterSavings >= 0 ? 'var(--status-comfortable-text)' : 'var(--status-risky-text)', fontSize: '0.9rem' }}>
                    Net Unallocated Surplus:
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Available headroom for new borrowing
                  </div>
                </div>
                <span style={{ fontWeight: '800', fontSize: '1.35rem', color: surplusAfterSavings >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {formatINR(surplusAfterSavings)}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Total Outstanding Debt Balance:</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                {formatINR(totalOutstandingBalance)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Principal remaining across all {profile.existingEmis.length} ongoing loans
              </div>
            </div>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};
