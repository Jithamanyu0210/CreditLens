import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookmarkCheck, 
  Trash2, 
  ArrowRight, 
  Plus, 
  Calendar, 
  Calculator, 
  RotateCcw,
  Sparkles,
  PieChart,
  Edit2,
  Check,
  X,
  Tag,
  Search,
  Filter
} from 'lucide-react';
import { useLoan } from '../context/LoanContext';
import { formatINR } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { BackButton } from '../components/common/BackButton';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const SavedScenariosPage = () => {
  const { savedScenarios, deleteScenario, updateScenario, loadScenarioIntoActive, saveScenario } = useLoan();
  const navigate = useNavigate();

  // Search & Tag filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Create new scenario modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenureMonths, setTenureMonths] = useState(60);
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('Home');

  // Edit existing scenario inline state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleCreateScenario = (e) => {
    e.preventDefault();
    saveScenario(
      name,
      { principal: Number(principal), annualRate: Number(rate), tenureMonths: Number(tenureMonths) },
      notes,
      [tagInput || 'General']
    );
    setModalOpen(false);
    setName('');
    setNotes('');
  };

  const startEdit = (scen) => {
    setEditingId(scen.id);
    setEditName(scen.name);
    setEditNotes(scen.notes || '');
  };

  const handleSaveEdit = (id) => {
    updateScenario(id, {
      name: editName.trim() || 'Scenario',
      notes: editNotes.trim()
    });
    setEditingId(null);
  };

  const handleLoadAndNavigate = (scenario, targetPage) => {
    loadScenarioIntoActive(scenario);
    navigate(targetPage);
  };

  // Filtered scenarios
  const filtered = savedScenarios.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === 'all' || (s.tags && s.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">Saved Scenarios</h1>
            <HelpTooltip text="Review, edit, and reload previously modeled borrowing scenarios. Tag and compare them side by side." placement="right" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Custom Scenario</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cl-card-colored cl-card-sky" style={{ padding: '18px 22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="form-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <span className="input-prefix-pill input-prefix-sky">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search scenarios by title or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input has-prefix-pill input-sky"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="form-input-wrapper">
              <span className="input-prefix-pill input-prefix-indigo">
                <Filter size={16} />
              </span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="form-input has-prefix-pill input-indigo"
                style={{ width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="all">All Categories ({savedScenarios.length})</option>
                <option value="Home">Home Loans</option>
                <option value="Auto">Auto Loans</option>
                <option value="Education">Education Loans</option>
                <option value="General">General Financing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="cl-card" style={{ textAlign: 'center', padding: '60px 20px', margin: '20px 0' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <BookmarkCheck size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>
            {savedScenarios.length === 0 ? 'No Saved Scenarios Yet' : 'No Matching Scenarios Found'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 24px' }}>
            {savedScenarios.length === 0
              ? 'Calculate custom loans using the EMI Calculator or Simulators and save them to your account to track and compare.'
              : 'Try clearing your search query or switching category filters.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {savedScenarios.length === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Create First Scenario</span>
                </button>
                <Link to="/calculator" className="btn btn-secondary">
                  <Calculator size={16} />
                  <span>Open Calculator</span>
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('all');
                }}
                className="btn btn-secondary"
              >
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {filtered.map((scen) => (
            <div key={scen.id} className="cl-card-colored cl-card-indigo" style={{ display: 'flex', flexDirection: 'column' }}>
              {editingId === scen.id ? (
                /* Edit Mode */
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="form-input input-indigo"
                    style={{ marginBottom: '8px', fontWeight: '700' }}
                  />
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="form-input"
                    style={{ resize: 'none', fontSize: '0.825rem' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button onClick={() => handleSaveEdit(scen.id)} className="btn btn-primary btn-sm">
                      <Check size={14} />
                      <span>Save</span>
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm">
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular View */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                        {scen.name}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Created: {new Date(scen.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => startEdit(scen)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                      title="Edit scenario details"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => deleteScenario(scen.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                      title={`Delete ${scen.name}`}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}

              {scen.notes && editingId !== scen.id && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  {scen.notes}
                </p>
              )}

              {/* Loan Key Figures Box */}
              <div style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderLeft: '3px solid var(--accent-indigo)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px',
                flex: 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Principal Amount:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formatINR(scen.principal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interest Rate:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{scen.annualRate}% p.a.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Repayment Tenure:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {scen.tenureMonths} Months ({Math.round(scen.tenureMonths / 12 * 10) / 10} yrs)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-indigo-text)' }}>Monthly EMI:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-indigo-text)' }}>{formatINR(scen.emi)}</span>
                </div>
              </div>

              {/* Total Interest & Outlay */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', padding: '0 4px' }}>
                <span>Interest: <strong style={{ color: 'var(--accent-amber-text)' }}>{formatINR(scen.totalInterest)}</strong></span>
                <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{formatINR(scen.totalPayment)}</strong></span>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleLoadAndNavigate(scen, '/calculator')}
                  className="btn btn-primary btn-sm"
                  id={`load-scenario-${scen.id}`}
                  style={{ flex: 1, minWidth: '130px' }}
                  title="Load scenario into EMI Calculator"
                >
                  <Calculator size={14} />
                  <span>Load Scenario</span>
                </button>
                <button
                  onClick={() => handleLoadAndNavigate(scen, '/schedule')}
                  className="btn btn-secondary btn-sm"
                  title="View scenario amortization schedule"
                >
                  <Calendar size={14} />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Scenario Modal */}
      {modalOpen && (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>
              Create Custom Scenario
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Save a hypothetical loan model to compare or revisit at any time.
            </p>

            <form onSubmit={handleCreateScenario}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-name">Scenario Name</label>
                <input
                  id="modal-name"
                  type="text"
                  placeholder="e.g. Electric Vehicle Loan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-category">Category / Tag</label>
                <select
                  id="modal-category"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="form-input"
                >
                  <option value="Home">Home Loan</option>
                  <option value="Auto">Auto Loan</option>
                  <option value="Education">Education Loan</option>
                  <option value="General">General Personal</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-principal">Principal Amount (₹)</label>
                <div className="form-input-wrapper">
                  <span className="input-prefix-pill input-prefix-indigo">₹</span>
                  <input
                    id="modal-principal"
                    type="number"
                    min="10000"
                    step="10000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="form-input has-prefix-pill has-suffix-pill input-indigo"
                    required
                  />
                  <span className="input-suffix-pill">INR</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-rate">Interest Rate (% p.a.)</label>
                <div className="form-input-wrapper">
                  <span className="input-prefix-pill input-prefix-amber">%</span>
                  <input
                    id="modal-rate"
                    type="number"
                    min="0"
                    max="36"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="form-input has-prefix-pill has-suffix-pill input-amber"
                    required
                  />
                  <span className="input-suffix-pill">% p.a.</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-tenure">Tenure in Months</label>
                <div className="form-input-wrapper">
                  <span className="input-prefix-pill input-prefix-sky">⏱</span>
                  <input
                    id="modal-tenure"
                    type="number"
                    min="1"
                    max="360"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="form-input has-prefix-pill has-suffix-pill input-sky"
                    required
                  />
                  <span className="input-suffix-pill">Months</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-notes">Notes (Optional)</label>
                <textarea
                  id="modal-notes"
                  rows={2}
                  placeholder="e.g. Special interest rate discount for green vehicles"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Scenario
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
