import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Download, 
  TrendingDown, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useLoan } from '../context/LoanContext';
import { generateAmortizationSchedule } from '../utils/loanCalculations';
import { formatINR, formatNumber } from '../utils/formatters';
import { Disclaimer } from '../components/common/Disclaimer';
import { exportAmortizationCSV, exportFullFinancialReport } from '../utils/reportGenerator';
import { BackButton } from '../components/common/BackButton';

export const SchedulePage = () => {
  const { profile, loanParams, activeEmiData, activeSolvency } = useLoan();
  const [selectedYear, setSelectedYear] = useState('all');
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Compute full amortization schedule
  const { schedule, summary } = generateAmortizationSchedule(
    loanParams.principal,
    loanParams.annualRate,
    loanParams.tenureMonths
  );

  // Total years in schedule
  const totalYears = Math.ceil(schedule.length / 12);
  const yearOptions = Array.from({ length: totalYears }, (_, i) => i + 1);

  // Filter schedule based on year selection
  const filteredSchedule = selectedYear === 'all'
    ? schedule
    : schedule.filter((row) => Math.ceil(row.month / 12) === Number(selectedYear));

  // Pagination on filtered list
  const totalFilteredRows = filteredSchedule.length;
  const totalPages = Math.ceil(totalFilteredRows / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = filteredSchedule.slice(startIndex, startIndex + pageSize);

  // Chart data sampled for smooth visualization
  const chartInterval = Math.max(1, Math.floor(schedule.length / 24));
  const chartData = schedule.filter((_, idx) => idx % chartInterval === 0 || idx === schedule.length - 1).map((row) => ({
    Month: `M${row.month}`,
    'Remaining Balance': row.balance,
    'Cumulative Principal': row.cumPrincipal,
    'Cumulative Interest': row.cumInterest
  }));

  const handleExportCSV = () => {
    exportAmortizationCSV(schedule, loanParams);
  };

  const handlePrintReport = () => {
    exportFullFinancialReport(profile, loanParams, activeEmiData, activeSolvency, schedule);
  };

  return (
    <div>
      <BackButton fallbackPath="/dashboard" />
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 className="page-title">Loan Amortization Schedule & Report</h1>
          <p className="page-subtitle">
            Month-by-month repayment breakdown: observe your outstanding balance decrease to zero as principal accumulates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handlePrintReport} className="btn btn-secondary">
            <FileText size={16} />
            <span>Printable Report (PDF)</span>
          </button>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <Link to="/calculator" className="btn btn-primary">
            <span>Adjust Loan</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="kpi-stat-card kpi-indigo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Principal Borrowed</span>
            <div className="kpi-icon-container kpi-icon-indigo" style={{ width: '32px', height: '32px' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {formatINR(summary.totalPrincipal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Interest rate: {loanParams.annualRate}% p.a.
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill progress-indigo" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="kpi-stat-card kpi-amber">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Total Interest</span>
            <div className="kpi-icon-container kpi-icon-amber" style={{ width: '32px', height: '32px' }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-amber-text)' }}>
            {formatINR(summary.totalInterest)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Borrowing cost over tenure
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill progress-amber"
              style={{ width: `${Math.min(100, Math.round((summary.totalInterest / (summary.totalPaid || 1)) * 100))}%` }}
            />
          </div>
        </div>

        <div className="kpi-stat-card kpi-sky">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Total Outlay</span>
            <div className="kpi-icon-container kpi-icon-sky" style={{ width: '32px', height: '32px' }}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-sky-text)' }}>
            {formatINR(summary.totalPaid)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Principal + Total Interest
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill progress-sky" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="kpi-stat-card kpi-emerald">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Tenure Horizon</span>
            <div className="kpi-icon-container kpi-icon-emerald" style={{ width: '32px', height: '32px' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-emerald-text)' }}>
            {summary.tenureMonths} Months
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ending balance: ₹0
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill progress-emerald" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Amortization Chart */}
      <div className="cl-card-colored cl-card-indigo" style={{ marginBottom: '28px' }}>
        <div className="cl-card-header">
          <div className="cl-card-title">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-indigo-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
            }}>
              <TrendingDown size={18} />
            </div>
            <span>Balance Payoff & Principal Progression</span>
          </div>
          <span className="cl-badge cl-badge-blue">Amortization Curve</span>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="Month" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `₹${val >= 100000 ? (val / 100000).toFixed(1) + 'L' : (val / 1000) + 'k'}`} />
              <Tooltip formatter={(value) => [formatINR(value), '']} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }} />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="Remaining Balance" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#balanceGrad)" />
              <Area type="monotone" dataKey="Cumulative Principal" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#principalGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Month-Wise Data Table */}
      <div className="cl-card-colored cl-card-sky" style={{ marginBottom: '28px' }}>
        <div className="cl-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="cl-card-title">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-sky-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)'
            }}>
              <Calendar size={18} />
            </div>
            <span>Monthly Installments Table</span>
          </div>

          {/* Filter & Page Size Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} color="var(--text-muted)" />
              <label htmlFor="schedule-year-filter" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Year:</label>
              <select
                id="schedule-year-filter"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.825rem', width: 'auto' }}
              >
                <option value="all">All Years ({totalYears} yrs)</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>Year {y} (M{(y - 1) * 12 + 1} - M{Math.min(y * 12, schedule.length)})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="schedule-page-size" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rows:</label>
              <select
                id="schedule-page-size"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.825rem', width: 'auto' }}
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={60}>60 per page</option>
                <option value={120}>120 per page</option>
                <option value={999}>All rows</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="cl-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Monthly EMI</th>
                <th>Principal Component</th>
                <th>Interest Component</th>
                <th>Outstanding Balance</th>
                <th>Payoff Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row.month}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    Month {row.month}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      (Yr {Math.ceil(row.month / 12)})
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    {formatINR(row.emi)}
                  </td>
                  <td style={{ color: '#10b981', fontWeight: '600' }}>
                    {formatINR(row.principal)}
                  </td>
                  <td style={{ color: '#d97706', fontWeight: '600' }}>
                    {formatINR(row.interest)}
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {formatINR(row.balance)}
                  </td>
                  <td>
                    {row.balance === 0 ? (
                      <span className="cl-badge cl-badge-emerald">Fully Repaid 🎉</span>
                    ) : (
                      <span className="cl-badge cl-badge-gray">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem'
          }}>
            <div style={{ color: 'var(--text-secondary)' }}>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalFilteredRows)} of {totalFilteredRows} months
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-secondary btn-sm"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
};
