/**
 * Report Generation Utility for CreditLens.
 * Exports comprehensive financial summaries, amortization schedules, and comparison models
 * into clean CSV and printable PDF/Report formats.
 */

import { formatINR, formatPercent } from './formatters';

export const exportAmortizationCSV = (schedule, loanParams) => {
  const headers = ['Month', 'Monthly EMI (INR)', 'Principal Component (INR)', 'Interest Component (INR)', 'Outstanding Balance (INR)'];
  const csvRows = [headers.join(',')];

  schedule.forEach((row) => {
    csvRows.push([row.month, row.emi, row.principal, row.interest, row.balance].join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `CreditLens_Amortization_${loanParams.principal}_${loanParams.tenureMonths}M.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFullFinancialReport = (profile, loanParams, emiData, solvency, schedule) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download/print your comprehensive financial report.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CreditLens Executive Loan Report - ${dateStr}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; font-size: 13px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 800; color: #0f172a; }
        .logo span { color: #2563eb; }
        .section-title { font-size: 16px; font-weight: 700; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
        .kpi-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .kpi-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
        .verdict-box { padding: 14px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; }
        .verdict-emerald { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
        .verdict-amber { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        .verdict-rose { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
        th { background: #f1f5f9; text-align: left; padding: 6px 10px; border: 1px solid #cbd5e1; }
        td { padding: 6px 10px; border: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center; }
        @media print {
          body { margin: 15mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Credit<span>Lens</span></div>
          <div style="font-size: 12px; color: #64748b;">Comprehensive Loan Affordability & Repayment Assessment</div>
        </div>
        <div style="text-align: right;">
          <div><strong>Date:</strong> ${dateStr}</div>
          <div style="color: #64748b;">Reference: CL-${Date.now().toString().slice(-6)}</div>
        </div>
      </div>

      <div class="verdict-box verdict-${solvency.verdictColor}">
        <strong>Solvency & Payability Verdict:</strong> ${solvency.verdict} — ${solvency.verdictSummary}
      </div>

      <div class="section-title">1. Monthly Cashflow & Savings Overview</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Monthly Income</div>
          <div class="kpi-val">${formatINR(profile.monthlyIncome)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Living Expenses</div>
          <div class="kpi-val">${formatINR(profile.monthlyExpenses)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Existing EMIs</div>
          <div class="kpi-val">${formatINR(solvency.totalExistingEmis)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Target Savings/Mo</div>
          <div class="kpi-val">${formatINR(profile.monthlySavingsTarget || 0)}</div>
        </div>
      </div>

      <div class="section-title">2. Proposed Loan Parameters & Borrowing Cost</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Principal Amount</div>
          <div class="kpi-val">${formatINR(loanParams.principal)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Interest Rate</div>
          <div class="kpi-val">${loanParams.annualRate}% p.a.</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Monthly EMI</div>
          <div class="kpi-val" style="color: #2563eb;">${formatINR(emiData.emi)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Outlay</div>
          <div class="kpi-val">${formatINR(emiData.totalPayment)}</div>
        </div>
      </div>

      <div class="section-title">3. Debt-to-Income (DTI) & Residual Cashflow</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Debt Obligations</div>
          <div class="kpi-val">${formatINR(solvency.totalExistingEmis + emiData.emi)}/mo</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">DTI Ratio</div>
          <div class="kpi-val">${solvency.dtiRatio}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Net Monthly Buffer</div>
          <div class="kpi-val">${formatINR(solvency.monthlyCashflowSurplus)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Surplus After Savings</div>
          <div class="kpi-val">${formatINR(solvency.surplusAfterSavingsGoal)}</div>
        </div>
      </div>

      <div class="section-title">4. Amortization Summary (First 24 Installments Sample)</div>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Monthly EMI</th>
            <th>Principal Component</th>
            <th>Interest Component</th>
            <th>Outstanding Balance</th>
          </tr>
        </thead>
        <tbody>
          ${schedule.slice(0, 24).map(r => `
            <tr>
              <td>Month ${r.month}</td>
              <td>${formatINR(r.emi)}</td>
              <td>${formatINR(r.principal)}</td>
              <td>${formatINR(r.interest)}</td>
              <td>${formatINR(r.balance)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${schedule.length > 24 ? `<p style="font-size: 11px; color: #64748b; margin-top: 6px;">*Showing initial 24 months. Complete ${schedule.length}-month schedule available in CSV export.</p>` : ''}

      <div class="footer">
        <p><strong>Educational Disclaimer:</strong> CreditLens is a financial self-planning simulation tool. All calculations are mathematical estimates and do not represent loan approval, credit rating guarantees, or formal banking offers.</p>
        <p>&copy; ${new Date().getFullYear()} CreditLens Financial Planner. Generated for personal record-keeping.</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
