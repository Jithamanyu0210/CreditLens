/**
 * Report Generation Utility for CreditLens.
 * Exports comprehensive financial summaries, amortization schedules, and comparison models
 * into clean CSV and authentic downloadable PDF formats.
 */

import { jsPDF } from 'jspdf';
import { formatNumber } from './formatters.js';

const formatPdfCurrency = (val) => {
  const num = Number(val || 0);
  return 'Rs. ' + formatNumber(num);
};

export const exportAmortizationCSV = (schedule, loanParams) => {
  const headers = ['Month', 'Monthly EMI (INR)', 'Principal Component (INR)', 'Interest Component (INR)', 'Outstanding Balance (INR)'];
  const csvRows = [headers.join(',')];

  (schedule || []).forEach((row) => {
    csvRows.push([row.month, row.emi, row.principal, row.interest, row.balance].join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `CreditLens_Amortization_${loanParams?.principal || 0}_${loanParams?.tenureMonths || 0}M.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFullFinancialReport = (profile, loanParams, emiData, solvency, schedule, extraData = {}) => {
  try {
    // 1. Resilient argument unpacking in case caller inverted order
    let actualSolvency = solvency;
    let actualSchedule = schedule;
    if (Array.isArray(actualSolvency) && !Array.isArray(actualSchedule)) {
      actualSchedule = solvency;
      actualSolvency = schedule;
    }

    const prof = profile || {};
    const loan = loanParams || { principal: 0, annualRate: 0, tenureMonths: 0 };
    const emi = emiData || { emi: 0, totalInterest: 0, totalPayment: 0 };
    const solv = actualSolvency || {
      verdict: 'Evaluation Complete',
      verdictSummary: 'Financial assessment generated from available parameters.',
      verdictColor: 'emerald',
      dtiRatio: 0,
      totalExistingEmis: 0,
      monthlyCashflowSurplus: 0,
      surplusAfterSavingsGoal: 0
    };
    const sched = Array.isArray(actualSchedule) ? actualSchedule : [];

    // Retrieve saved scenarios if available
    let savedScenarios = extraData?.savedScenarios;
    if (!savedScenarios && typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('creditlens_scenarios');
        if (stored) savedScenarios = JSON.parse(stored);
      } catch {
        savedScenarios = [];
      }
    }
    if (!Array.isArray(savedScenarios)) savedScenarios = [];

    // Retrieve user name
    let userName = extraData?.user?.name;
    if (!userName && typeof window !== 'undefined' && window.localStorage) {
      try {
        const u = JSON.parse(localStorage.getItem('creditlens_user') || '{}');
        userName = u?.name;
      } catch {
        userName = 'Borrower / Planner';
      }
    }
    if (!userName) userName = 'Borrower';

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const refCode = `CL-${Date.now().toString().slice(-6)}`;

    // 2. Initialize jsPDF instance (A4 Portrait: 595.28 x 841.89 points)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // Color definitions
    const cPrimaryDark = [15, 23, 42];     // #0f172a
    const cEmerald = [5, 150, 105];        // #059669
    const cMuted = [100, 116, 139];        // #64748b
    const cBorder = [226, 232, 240];       // #e2e8f0
    const cCardBg = [248, 250, 252];       // #f8fafc

    // ==========================================
    // PAGE 1: Executive Overview & Metrics
    // ==========================================
    // Top Brand Accent Stripe
    doc.setFillColor(...cEmerald);
    doc.rect(0, 0, 595.28, 6, 'F');

    // Header Logo & Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...cPrimaryDark);
    doc.text('Credit', 40, 44);
    doc.setTextColor(...cEmerald);
    doc.text('Lens', 104, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...cMuted);
    doc.text('FinTech Intelligence • Comprehensive Loan Affordability & Assessment Report', 40, 58);

    // Header Metadata (Right-aligned)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...cPrimaryDark);
    doc.text(`Date: ${dateStr}`, 410, 40);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...cMuted);
    doc.text(`Reference: ${refCode}`, 410, 53);
    doc.text(`User: ${userName}`, 410, 66);

    // Divider Line
    doc.setDrawColor(...cBorder);
    doc.setLineWidth(1);
    doc.line(40, 78, 555, 78);

    // Solvency Verdict Banner
    let vBg = [236, 253, 245];
    let vBorder = [167, 243, 208];
    let vText = [6, 95, 70];
    if (solv.verdictColor === 'amber') {
      vBg = [255, 251, 235];
      vBorder = [253, 230, 138];
      vText = [146, 64, 14];
    } else if (solv.verdictColor === 'rose') {
      vBg = [254, 242, 242];
      vBorder = [254, 202, 202];
      vText = [153, 27, 27];
    }

    doc.setFillColor(...vBg);
    doc.setDrawColor(...vBorder);
    doc.roundedRect(40, 90, 515, 52, 6, 6, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...vText);
    doc.text(`Solvency & Payability Verdict: ${solv.verdict || 'Standard Assessment'}`, 52, 108);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...cPrimaryDark);
    const summaryLines = doc.splitTextToSize(solv.verdictSummary || 'Assessment based on current income and liability calculations.', 490);
    doc.text(summaryLines, 52, 124);

    let curY = 160;

    // Helper: Draw Section Title
    const drawSectionTitle = (title, y) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...cPrimaryDark);
      doc.text(title, 40, y);
      doc.setDrawColor(...cBorder);
      doc.line(40, y + 5, 555, y + 5);
      return y + 16;
    };

    // Helper: Draw 4 KPI Cards in a row
    const drawKpiRow = (items, y) => {
      const cardWidth = 122;
      const cardHeight = 46;
      const gap = 8;
      items.forEach((item, idx) => {
        const x = 40 + idx * (cardWidth + gap);
        doc.setFillColor(...cCardBg);
        doc.setDrawColor(...cBorder);
        doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...cMuted);
        doc.text(item.label.toUpperCase(), x + 8, y + 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...(item.highlight ? cEmerald : cPrimaryDark));
        doc.text(item.value, x + 8, y + 33);
      });
      return y + cardHeight + 10;
    };

    // Section 1: Monthly Cashflow & Financial Profile
    curY = drawSectionTitle('1. Monthly Cashflow & Financial Profile', curY);
    curY = drawKpiRow([
      { label: 'Monthly Income', value: formatPdfCurrency(prof.monthlyIncome) },
      { label: 'Living Expenses', value: formatPdfCurrency(prof.monthlyExpenses) },
      { label: 'Other Expenses', value: formatPdfCurrency(prof.otherExpenses || 0) },
      { label: 'Existing EMIs', value: formatPdfCurrency(solv.totalExistingEmis || 0) }
    ], curY);

    curY = drawKpiRow([
      { label: 'Savings Target/Mo', value: formatPdfCurrency(prof.monthlySavingsTarget || 0) },
      { label: 'Current Savings', value: formatPdfCurrency(prof.currentSavings || 0) },
      { label: 'Total Obligations', value: formatPdfCurrency((prof.monthlyExpenses || 0) + (prof.otherExpenses || 0) + (solv.totalExistingEmis || 0)) },
      { label: 'Net Monthly Margin', value: formatPdfCurrency(prof.monthlyIncome - ((prof.monthlyExpenses || 0) + (prof.otherExpenses || 0) + (solv.totalExistingEmis || 0))), highlight: true }
    ], curY);

    curY += 8;

    // Section 2: Proposed Loan Parameters & Borrowing Costs
    curY = drawSectionTitle('2. Proposed Loan Parameters & Borrowing Cost', curY);
    curY = drawKpiRow([
      { label: 'Principal Amount', value: formatPdfCurrency(loan.principal) },
      { label: 'Interest Rate', value: `${loan.annualRate}% p.a.` },
      { label: 'Loan Tenure', value: `${loan.tenureMonths} Mos (${Math.round((loan.tenureMonths / 12) * 10) / 10} yrs)` },
      { label: 'Calculated Monthly EMI', value: formatPdfCurrency(emi.emi), highlight: true }
    ], curY);

    curY = drawKpiRow([
      { label: 'Total Interest Payable', value: formatPdfCurrency(emi.totalInterest) },
      { label: 'Total Repayment Outlay', value: formatPdfCurrency(emi.totalPayment) },
      { label: 'Principal Ratio', value: emi.totalPayment > 0 ? `${Math.round((loan.principal / emi.totalPayment) * 100)}%` : '100%' },
      { label: 'Interest Ratio', value: emi.totalPayment > 0 ? `${Math.round((emi.totalInterest / emi.totalPayment) * 100)}%` : '0%' }
    ], curY);

    curY += 8;

    // Section 3: Debt-to-Income (DTI) & Cashflow Buffers
    curY = drawSectionTitle('3. Debt-to-Income (DTI) & Surplus Buffers', curY);
    curY = drawKpiRow([
      { label: 'Total Debt Servicing', value: `${formatPdfCurrency((solv.totalExistingEmis || 0) + (emi.emi || 0))}/mo` },
      { label: 'DTI Ratio', value: `${solv.dtiRatio}% (Safe: <=40%)`, highlight: solv.dtiRatio <= 40 },
      { label: 'Surplus After EMI', value: formatPdfCurrency(solv.monthlyCashflowSurplus) },
      { label: 'Surplus After Savings', value: formatPdfCurrency(solv.surplusAfterSavingsGoal), highlight: solv.surplusAfterSavingsGoal >= 0 }
    ], curY);

    curY += 8;

    // Section 4: Saved Scenarios Portfolio
    curY = drawSectionTitle('4. Saved Scenarios Portfolio', curY);
    if (savedScenarios.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...cMuted);
      doc.text('No additional saved loan scenarios recorded in user portfolio.', 40, curY + 6);
      curY += 20;
    } else {
      // Small scenario table
      const sHeaders = ['Scenario Name', 'Principal', 'Rate', 'Tenure', 'Monthly EMI'];
      const colWidths = [150, 95, 70, 95, 105];
      let tableY = curY + 4;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(40, tableY, 515, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...cPrimaryDark);
      let colX = 46;
      sHeaders.forEach((h, i) => {
        doc.text(h, colX, tableY + 12);
        colX += colWidths[i];
      });
      tableY += 18;

      savedScenarios.slice(0, 4).forEach((scen, rIdx) => {
        if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(40, tableY, 515, 16, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...cPrimaryDark);

        colX = 46;
        doc.text(String(scen.name || 'Scenario').slice(0, 24), colX, tableY + 11);
        colX += colWidths[0];
        doc.text(formatPdfCurrency(scen.principal), colX, tableY + 11);
        colX += colWidths[1];
        doc.text(`${scen.annualRate}%`, colX, tableY + 11);
        colX += colWidths[2];
        doc.text(`${scen.tenureMonths} Mos`, colX, tableY + 11);
        colX += colWidths[3];
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...cEmerald);
        doc.text(formatPdfCurrency(scen.emi), colX, tableY + 11);

        tableY += 16;
      });
      curY = tableY + 10;
    }

    // Page 1 Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...cMuted);
    doc.text('Page 1 of 2 • CreditLens Executive Financial Report', 40, 815);
    doc.text('Confidential Personal Planning Record', 390, 815);

    // ==========================================
    // PAGE 2: Amortization Schedule & Disclaimers
    // ==========================================
    doc.addPage();

    // Top Stripe
    doc.setFillColor(...cEmerald);
    doc.rect(0, 0, 595.28, 6, 'F');

    // Mini Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...cPrimaryDark);
    doc.text('CreditLens Amortization Schedule & Breakdown', 40, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...cMuted);
    doc.text(`Principal: ${formatPdfCurrency(loan.principal)} | Rate: ${loan.annualRate}% p.a. | Tenure: ${loan.tenureMonths} Months | EMI: ${formatPdfCurrency(emi.emi)}`, 40, 50);

    doc.setDrawColor(...cBorder);
    doc.line(40, 60, 555, 60);

    // Section 5: Month-by-Month Amortization Schedule Table
    let sY = drawSectionTitle('5. Amortization Schedule (Initial 24 Installments Sample)', 78);

    const schedHeaders = ['Month', 'Monthly EMI', 'Principal Paid', 'Interest Paid', 'Outstanding Balance'];
    const sColWidths = [65, 110, 110, 110, 120];

    // Table Header Row
    doc.setFillColor(241, 245, 249);
    doc.rect(40, sY, 515, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cPrimaryDark);
    let sColX = 46;
    schedHeaders.forEach((h, i) => {
      doc.text(h, sColX, sY + 12);
      sColX += sColWidths[i];
    });
    sY += 18;

    // Up to 24 rows
    const rowsToShow = sched.slice(0, 24);
    rowsToShow.forEach((row, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(40, sY, 515, 15, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...cPrimaryDark);

      sColX = 46;
      doc.text(`Month ${row.month}`, sColX, sY + 10.5);
      sColX += sColWidths[0];
      doc.text(formatPdfCurrency(row.emi), sColX, sY + 10.5);
      sColX += sColWidths[1];
      doc.text(formatPdfCurrency(row.principal), sColX, sY + 10.5);
      sColX += sColWidths[2];
      doc.text(formatPdfCurrency(row.interest), sColX, sY + 10.5);
      sColX += sColWidths[3];
      doc.text(formatPdfCurrency(row.balance), sColX, sY + 10.5);

      sY += 15;
    });

    if (sched.length > 24) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...cMuted);
      doc.text(`* Displaying initial 24 installments of ${sched.length} total months. The complete schedule is available via the CSV Export option.`, 40, sY + 14);
      sY += 24;
    } else {
      sY += 14;
    }

    // Essential Educational & Regulatory Disclaimer Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...cBorder);
    doc.roundedRect(40, sY, 515, 64, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...cPrimaryDark);
    doc.text('Educational & Regulatory Disclaimer', 50, sY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...cMuted);
    const disclaimerText = [
      'CreditLens is a self-directed financial calculation and decision-support simulation tool.',
      'All calculations are mathematical projections using standard reducing-balance and debt-to-income models.',
      'Calculations do not constitute formal lending offers, loan approval guarantees, or credit underwriting commitments.',
      'Interest rates, processing fees, and terms are subject to formal underwriting by respective commercial banks and NBFCs.'
    ];
    disclaimerText.forEach((line, lIdx) => {
      doc.text(`• ${line}`, 50, sY + 28 + (lIdx * 10));
    });

    // Page 2 Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...cMuted);
    doc.text('Page 2 of 2 • CreditLens Executive Financial Report', 40, 815);
    doc.text(`© ${new Date().getFullYear()} CreditLens Financial Planner • Personal Copy`, 350, 815);

    // 3. Save the PDF directly to the browser
    doc.save('CreditLens_Financial_Report.pdf');
    return true;
  } catch (error) {
    console.error('[CreditLens Report Generation Error]:', error);
    if (typeof window !== 'undefined' && window.alert) {
      alert(`Report generation failed: ${error.message || 'Unknown error occurred while generating PDF.'}`);
    }
    return false;
  }
};
