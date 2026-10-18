import { calculateEMI } from './emiService.js';
import { generateAmortizationSchedule } from './amortizationService.js';

/**
 * 1. Maximum Loan Capacity Simulator
 * Calculates the maximum affordable loan principal using the inverse EMI formula.
 */
export const calculateMaxLoanCapacity = (
  monthlyIncome,
  monthlyExpenses,
  otherExpenses = 0,
  existingEmis = [],
  monthlySavingsTarget = 0,
  annualRate = 8.5,
  tenureMonths = 60
) => {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const totalLivingAndOther = Math.max(0, Number(monthlyExpenses) || 0) + Math.max(0, Number(otherExpenses) || 0);
  const savings = Math.max(0, Number(monthlySavingsTarget) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  const existingEmisArray = Array.isArray(existingEmis) ? existingEmis : [];
  const totalExistingEmis = existingEmisArray.reduce(
    (sum, item) => sum + Math.max(0, Number(item.amount) || 0),
    0
  );

  // Safety ceiling: Maximum 40% DTI for total debt
  const maxAllowedDebt = income * 0.40;
  const maxDebtBudget = Math.max(0, maxAllowedDebt - totalExistingEmis);
  const cashflowSurplus = Math.max(0, income - totalLivingAndOther - totalExistingEmis - savings);
  const availableEmiBudget = Math.min(cashflowSurplus, maxDebtBudget);

  if (availableEmiBudget <= 0) {
    const baselineOutflow = totalLivingAndOther + totalExistingEmis;
    return {
      maxPrincipal: 0,
      maxAffordableEmi: 0,
      actualEmiAtMax: 0,
      totalInterestAtMax: 0,
      totalPaymentAtMax: 0,
      totalExistingEmis,
      remainingMonthlyBalance: income - baselineOutflow,
      rate,
      tenureMonths: n,
      limitingFactor: cashflowSurplus <= 0 
        ? 'Negative or zero monthly cash surplus after living costs and savings' 
        : 'Existing debt already consumes or exceeds the safe 40% DTI ceiling',
      message: 'No additional loan capacity is available under the selected assumptions.'
    };
  }

  // Inverse EMI calculation
  let rawPrincipal = 0;
  if (rate === 0) {
    rawPrincipal = availableEmiBudget * n;
  } else {
    const r = rate / 12 / 100;
    const factor = Math.pow(1 + r, n);
    rawPrincipal = availableEmiBudget * (factor - 1) / (r * factor);
  }

  // Round down to clean thousand increments
  const maxPrincipal = Math.max(0, Math.floor(rawPrincipal / 1000) * 1000);
  const emiCalc = calculateEMI(maxPrincipal, rate, n);
  const remainingMonthlyBalance = income - (totalLivingAndOther + totalExistingEmis + emiCalc.emi);

  return {
    maxPrincipal,
    maxAffordableEmi: Math.round(availableEmiBudget),
    actualEmiAtMax: emiCalc.emi,
    totalInterestAtMax: emiCalc.totalInterest,
    totalPaymentAtMax: emiCalc.totalPayment,
    totalExistingEmis,
    remainingMonthlyBalance,
    rate,
    tenureMonths: n,
    limitingFactor: null,
    message: null
  };
};

/**
 * 2. Loan Prepayment Simulator
 * Analyzes tenure reduction and interest savings with extra monthly or one-time lump-sum principal payments.
 */
export const calculatePrepayment = (
  principal,
  annualRate,
  tenureMonths,
  extraMonthlyPayment = 0,
  lumpSumPayment = 0,
  lumpSumMonth = 12
) => {
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const originalTenure = Math.max(1, Math.round(Number(tenureMonths) || 1));
  const extraMonthly = Math.max(0, Number(extraMonthlyPayment) || 0);
  const lumpSum = Math.max(0, Number(lumpSumPayment) || 0);
  const lumpMonth = Math.max(1, Math.min(originalTenure, Math.round(Number(lumpSumMonth) || 1)));

  const baseline = generateAmortizationSchedule(p, rate, originalTenure);
  const baseEMI = calculateEMI(p, rate, originalTenure);
  const r = rate > 0 ? rate / 12 / 100 : 0;

  let balance = p;
  const prepaySchedule = [];
  let cumInterest = 0;
  let cumPrincipal = 0;
  let month = 1;

  while (balance > 0 && month <= originalTenure * 2) {
    const openingBalance = Math.round(balance);
    const interestPayment = r > 0 ? balance * r : 0;
    let basePrincipalPayment = baseEMI.exactEmi 
      ? baseEMI.exactEmi - interestPayment 
      : baseEMI.emi - interestPayment;

    let totalPrincipalPayment = basePrincipalPayment + extraMonthly;

    if (month === lumpMonth && lumpSum > 0) {
      totalPrincipalPayment += lumpSum;
    }

    if (totalPrincipalPayment >= balance) {
      totalPrincipalPayment = balance;
      balance = 0;
    } else {
      balance -= totalPrincipalPayment;
    }

    const roundedPrincipal = Math.round(totalPrincipalPayment);
    const roundedInterest = Math.round(interestPayment);
    const totalMonthPaid = roundedPrincipal + roundedInterest;

    cumPrincipal += roundedPrincipal;
    cumInterest += roundedInterest;

    prepaySchedule.push({
      month,
      openingBalance,
      emi: totalMonthPaid,
      regularEmi: baseEMI.emi,
      extraPaid: month === lumpMonth ? extraMonthly + lumpSum : extraMonthly,
      principal: roundedPrincipal,
      interest: roundedInterest,
      balance: Math.round(balance),
      cumPrincipal,
      cumInterest
    });

    if (balance === 0) break;
    month++;
  }

  const newTenureMonths = prepaySchedule.length;
  const monthsSaved = Math.max(0, originalTenure - newTenureMonths);
  const interestSaved = Math.max(0, baseline.summary.totalInterest - cumInterest);
  const percentageInterestSaved = baseline.summary.totalInterest > 0
    ? Number(((interestSaved / baseline.summary.totalInterest) * 100).toFixed(1))
    : 0;

  return {
    originalTenure,
    newTenureMonths,
    monthsSaved,
    yearsSaved: Number((monthsSaved / 12).toFixed(1)),
    originalInterest: baseline.summary.totalInterest,
    newTotalInterest: cumInterest,
    interestSaved,
    percentageInterestSaved,
    originalTotalPaid: baseline.summary.totalPaid,
    newTotalPaid: p + cumInterest,
    prepaySchedule,
    chartComparison: [
      { name: 'Standard Loan', TotalInterest: baseline.summary.totalInterest, TotalRepayment: baseline.summary.totalPaid, TenureMonths: originalTenure },
      { name: 'With Prepayment', TotalInterest: cumInterest, TotalRepayment: p + cumInterest, TenureMonths: newTenureMonths }
    ],
    assumptions: [
      'Extra payments are applied directly to reducing the outstanding principal balance.',
      'No prepayment foreclosure penalty or administrative fees are included.'
    ]
  };
};

/**
 * 3. Emergency Fund Planner
 * Calculates essential monthly burn rate and runway without double counting expenses.
 */
export const calculateEmergencyFund = (
  monthlyIncome,
  monthlyExpenses,
  otherExpenses = 0,
  existingEmis = [],
  proposedEmi = 0,
  currentSavings = 0,
  targetMonths = 6
) => {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const livingExp = Math.max(0, Number(monthlyExpenses) || 0);
  const otherExp = Math.max(0, Number(otherExpenses) || 0);
  const emi = Math.max(0, Number(proposedEmi) || 0);
  const savings = Math.max(0, Number(currentSavings) || 0);
  const monthsTarget = Math.max(1, Math.round(Number(targetMonths) || 6));

  const existingEmisArray = Array.isArray(existingEmis) ? existingEmis : [];
  const totalExistingEmis = existingEmisArray.reduce(
    (sum, item) => sum + Math.max(0, Number(item.amount) || 0),
    0
  );

  const essentialMonthlyExpenses = livingExp + otherExp + totalExistingEmis + emi;
  const targetEmergencyFund = essentialMonthlyExpenses * monthsTarget;
  const savingsShortfall = Math.max(0, targetEmergencyFund - savings);
  const percentageAchieved = targetEmergencyFund > 0 
    ? Number(Math.min(100, (savings / targetEmergencyFund) * 100).toFixed(1)) 
    : 100;
  const monthsCoveredCurrently = essentialMonthlyExpenses > 0 
    ? Number((savings / essentialMonthlyExpenses).toFixed(1)) 
    : 0;

  const monthlySurplus = income - essentialMonthlyExpenses;
  const monthsToReachGoal = monthlySurplus > 0 
    ? Math.ceil(savingsShortfall / monthlySurplus) 
    : null;

  return {
    essentialMonthlyExpenses,
    targetEmergencyFund,
    currentSavings: savings,
    savingsShortfall,
    percentageAchieved,
    monthsCoveredCurrently,
    targetMonths: monthsTarget,
    monthlySurplus,
    monthsToReachGoal,
    benchmarks: {
      target3Months: essentialMonthlyExpenses * 3,
      target6Months: essentialMonthlyExpenses * 6,
      target12Months: essentialMonthlyExpenses * 12
    },
    isHealthy: monthsCoveredCurrently >= 6,
    needsBuffer: monthsCoveredCurrently < 3
  };
};

/**
 * 4. Scenario Comparison Service
 * Compares an array of loan options (3-5 loans) side-by-side.
 */
export const compareLoanScenarios = (loans = [], profile = null) => {
  if (!Array.isArray(loans) || loans.length === 0) {
    return { success: false, message: 'Please provide an array of loan scenarios to compare.' };
  }

  const comparison = loans.map((loan, idx) => {
    const p = Math.max(0, Number(loan.principal) || 0);
    const r = Math.max(0, Number(loan.annualRate) || 0);
    const n = Math.max(1, Math.round(Number(loan.tenureMonths) || 12));
    const name = loan.name || `Option ${idx + 1}`;

    const emiData = calculateEMI(p, r, n);

    let remainingMonthlyBalance = null;
    let budgetFit = null;

    if (profile && profile.monthlyIncome) {
      const livingExp = Math.max(0, Number(profile.monthlyExpenses) || 0);
      const otherExp = Math.max(0, Number(profile.otherExpenses) || 0);
      const existingDebt = Array.isArray(profile.existingEmis)
        ? profile.existingEmis.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
        : 0;
      const totalOutflow = livingExp + otherExp + existingDebt + emiData.emi;
      remainingMonthlyBalance = profile.monthlyIncome - totalOutflow;

      if (remainingMonthlyBalance < 0) {
        budgetFit = 'Risky Deficit';
      } else if (remainingMonthlyBalance < (profile.monthlySavingsTarget || 15000)) {
        budgetFit = 'Tight';
      } else {
        budgetFit = 'Comfortable';
      }
    }

    return {
      id: loan.id || `loan_${idx + 1}`,
      name,
      principal: p,
      annualRate: r,
      tenureMonths: n,
      tenureYears: Number((n / 12).toFixed(1)),
      emi: emiData.emi,
      totalInterest: emiData.totalInterest,
      totalPayment: emiData.totalPayment,
      remainingMonthlyBalance,
      budgetFit
    };
  });

  // Determine key highlights
  const lowestEmi = [...comparison].sort((a, b) => a.emi - b.emi)[0];
  const lowestInterest = [...comparison].sort((a, b) => a.totalInterest - b.totalInterest)[0];

  return {
    count: comparison.length,
    scenarios: comparison,
    highlights: {
      lowestEmiId: lowestEmi?.id,
      lowestEmiName: lowestEmi?.name,
      lowestInterestId: lowestInterest?.id,
      lowestInterestName: lowestInterest?.name
    }
  };
};
