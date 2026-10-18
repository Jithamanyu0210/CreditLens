/**
 * Financial Calculation Engine for CreditLens.
 * Pure mathematical functions for:
 * 1. Reducing-balance EMI (including 0% interest rate)
 * 2. Full Amortization Schedule with exact zero ending balance
 * 3. Affordability & DTI evaluation (Comfortable / Tight / Risky)
 * 4. Maximum Affordable Loan Calculator (Reverse Loan Capacity)
 * 5. Prepayment & Early Payoff Simulator (Extra Monthly / Lump Sum)
 * 6. Financial Goal & Emergency Fund Planner
 * 7. Comprehensive Loan Solvency & Cashflow Assessment
 * 8. Smart Financial Insights & Actionable Recommendations
 */

/**
 * Calculates monthly EMI, total interest, and total payment.
 */
export const calculateEMI = (principal, annualRate, tenureMonths) => {
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  if (p === 0) {
    return { emi: 0, exactEmi: 0, totalInterest: 0, totalPayment: 0, principal: 0, tenureMonths: n, annualRate: rate };
  }

  // Handle 0% interest rate case
  if (rate === 0) {
    const emi = p / n;
    return {
      emi: Math.round(emi),
      exactEmi: emi,
      totalInterest: 0,
      totalPayment: p,
      principal: p,
      tenureMonths: n,
      annualRate: 0
    };
  }

  const r = rate / 12 / 100;
  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);

  const roundedEmi = Math.round(emi);
  const totalPayment = roundedEmi * n;
  const totalInterest = Math.max(0, totalPayment - p);

  return {
    emi: roundedEmi,
    exactEmi: emi,
    totalInterest: totalInterest,
    totalPayment: totalPayment,
    principal: p,
    tenureMonths: n,
    annualRate: rate
  };
};

/**
 * Generates month-by-month repayment schedule with ending balance reaching strictly 0.
 */
export const generateAmortizationSchedule = (principal, annualRate, tenureMonths) => {
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  const emiData = calculateEMI(p, rate, n);
  const r = rate > 0 ? rate / 12 / 100 : 0;

  let balance = p;
  const schedule = [];
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let month = 1; month <= n; month++) {
    let interestPayment = r > 0 ? balance * r : 0;
    let principalPayment = emiData.exactEmi ? emiData.exactEmi - interestPayment : emiData.emi - interestPayment;

    // Handle final month adjustment or overpayment rounding
    if (month === n || principalPayment >= balance) {
      principalPayment = balance;
      balance = 0;
      interestPayment = Math.max(0, interestPayment);
    } else {
      balance = Math.max(0, balance - principalPayment);
    }

    const roundedPrincipal = Math.round(principalPayment);
    const roundedInterest = Math.round(interestPayment);
    const roundedEmi = roundedPrincipal + roundedInterest;

    cumPrincipal += roundedPrincipal;
    cumInterest += roundedInterest;

    schedule.push({
      month,
      emi: roundedEmi,
      principal: roundedPrincipal,
      interest: roundedInterest,
      balance: Math.round(balance),
      cumPrincipal,
      cumInterest
    });

    if (balance === 0) break;
  }

  return {
    schedule,
    summary: {
      totalPrincipal: p,
      totalInterest: cumInterest,
      totalPaid: p + cumInterest,
      tenureMonths: schedule.length
    }
  };
};

/**
 * Reverse Loan Calculator:
 * Estimates the maximum loan amount a user could manage based on income,
 * expenses, existing EMIs, and a chosen monthly savings target.
 * 
 * Formula: P = [EMI * ((1+r)^n - 1)] / [r * (1+r)^n]
 */
export const calculateMaxAffordableLoan = (
  monthlyIncome,
  monthlyExpenses,
  existingEmisList = [],
  monthlySavingsTarget = 0,
  annualRate = 8.5,
  tenureMonths = 60,
  otherExpenses = 0
) => {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const baseExpenses = Math.max(0, Number(monthlyExpenses) || 0);
  const extraExpenses = Math.max(0, Number(otherExpenses) || 0);
  const expenses = baseExpenses + extraExpenses;
  const savings = Math.max(0, Number(monthlySavingsTarget) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  const totalExistingEmis = existingEmisList.reduce(
    (sum, item) => sum + (Math.max(0, Number(item.amount) || 0)),
    0
  );

  // Maximum sustainable EMI buffer without cutting into living costs or target savings
  // Also enforce safe DTI limit of 40% of income for total debt
  const maxSafeDebtPayment = income * 0.40;
  const cashflowSurplusForLoan = Math.max(0, income - expenses - totalExistingEmis - savings);
  
  // The conservative maximum affordable EMI is the lower of surplus cashflow and safe 40% DTI
  const maxAffordableEmi = Math.min(cashflowSurplusForLoan, Math.max(0, maxSafeDebtPayment - totalExistingEmis));

  if (maxAffordableEmi <= 0) {
    return {
      maxPrincipal: 0,
      maxAffordableEmi: 0,
      actualEmiAtMax: 0,
      totalInterestAtMax: 0,
      totalPaymentAtMax: 0,
      totalExistingEmis,
      cashflowSurplusForLoan,
      rate,
      tenureMonths: n,
      limitingFactor: cashflowSurplusForLoan <= 0 ? 'Negative or zero monthly cash surplus' : 'Existing debt already exceeds safe 40% DTI cap'
    };
  }

  let maxPrincipal = 0;
  if (rate === 0) {
    maxPrincipal = maxAffordableEmi * n;
  } else {
    const r = rate / 12 / 100;
    const factor = Math.pow(1 + r, n);
    maxPrincipal = (maxAffordableEmi * (factor - 1)) / (r * factor);
  }

  const roundedPrincipal = Math.max(0, Math.floor(maxPrincipal / 1000) * 1000); // round down to nearest thousand
  const calcAtMax = calculateEMI(roundedPrincipal, rate, n);

  return {
    maxPrincipal: roundedPrincipal,
    maxAffordableEmi: Math.round(maxAffordableEmi),
    actualEmiAtMax: calcAtMax.emi,
    totalInterestAtMax: calcAtMax.totalInterest,
    totalPaymentAtMax: calcAtMax.totalPayment,
    totalExistingEmis,
    cashflowSurplusForLoan: Math.round(cashflowSurplusForLoan),
    rate,
    tenureMonths: n,
    limitingFactor: null
  };
};

/**
 * Prepayment Simulator:
 * Estimates interest savings and tenure reduction given extra monthly payments
 * or a one-time lump-sum prepayment.
 */
export const simulatePrepayment = (
  principal,
  annualRate,
  tenureMonths,
  extraMonthlyPayment = 0,
  lumpSumAmount = 0,
  lumpSumMonth = 12
) => {
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const originalTenure = Math.max(1, Math.round(Number(tenureMonths) || 1));
  const extraMonthly = Math.max(0, Number(extraMonthlyPayment) || 0);
  const lumpSum = Math.max(0, Number(lumpSumAmount) || 0);
  const lumpMonth = Math.max(1, Math.min(originalTenure, Math.round(Number(lumpSumMonth) || 1)));

  // Baseline schedule without prepayment
  const baseline = generateAmortizationSchedule(p, rate, originalTenure);
  const baseEMI = calculateEMI(p, rate, originalTenure);

  const r = rate > 0 ? rate / 12 / 100 : 0;
  let balance = p;
  const prepaySchedule = [];
  let cumInterest = 0;
  let cumPrincipal = 0;
  let month = 1;

  while (balance > 0 && month <= originalTenure * 2) {
    let interestPayment = r > 0 ? balance * r : 0;
    let scheduledPrincipal = (baseEMI.exactEmi ? baseEMI.exactEmi - interestPayment : baseEMI.emi - interestPayment);

    let totalPrincipalThisMonth = scheduledPrincipal + extraMonthly;

    // Add lump sum if this is the chosen month
    if (month === lumpMonth && lumpSum > 0) {
      totalPrincipalThisMonth += lumpSum;
    }

    if (totalPrincipalThisMonth >= balance) {
      totalPrincipalThisMonth = balance;
      balance = 0;
    } else {
      balance = balance - totalPrincipalThisMonth;
    }

    const roundedPrincipal = Math.round(totalPrincipalThisMonth);
    const roundedInterest = Math.round(interestPayment);
    const totalMonthPayment = roundedPrincipal + roundedInterest;

    cumPrincipal += roundedPrincipal;
    cumInterest += roundedInterest;

    prepaySchedule.push({
      month,
      emi: totalMonthPayment,
      regularEmi: baseEMI.emi,
      extraPaid: (month === lumpMonth ? extraMonthly + lumpSum : extraMonthly),
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
    ]
  };
};

/**
 * Emergency Fund & Financial Goal Planner:
 * Calculates target emergency fund (3, 6, 12 months), tests how the new loan affects
 * the ability to build and maintain safety reserves, and projects monthly accumulation.
 */
export const calculateEmergencyFundPlan = (
  monthlyIncome,
  monthlyExpenses,
  existingEmisList = [],
  proposedEmi = 0,
  currentSavings = 0,
  targetSavingsPerMonth = 0,
  otherExpenses = 0
) => {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const baseExpenses = Math.max(0, Number(monthlyExpenses) || 0);
  const extraExpenses = Math.max(0, Number(otherExpenses) || 0);
  const expenses = baseExpenses + extraExpenses;
  const newEmi = Math.max(0, Number(proposedEmi) || 0);
  const savings = Math.max(0, Number(currentSavings) || 0);
  const monthlySavingsGoal = Math.max(0, Number(targetSavingsPerMonth) || 0);

  const totalExistingEmis = existingEmisList.reduce(
    (sum, item) => sum + (Math.max(0, Number(item.amount) || 0)),
    0
  );

  // Essential monthly baseline obligations = Living expenses + Other expenses + all debt payments
  const essentialMonthlyExpenses = expenses + totalExistingEmis + newEmi;

  // Emergency benchmarks
  const target3Months = essentialMonthlyExpenses * 3;
  const target6Months = essentialMonthlyExpenses * 6;
  const target12Months = essentialMonthlyExpenses * 12;

  // Monthly surplus after all fixed commitments
  const monthlySurplus = income - essentialMonthlyExpenses;

  // Status of current savings coverage
  const monthsCoveredCurrently = essentialMonthlyExpenses > 0
    ? Number((savings / essentialMonthlyExpenses).toFixed(1))
    : 0;

  // How many months to reach 6-month safety buffer using surplus
  const gapTo6Months = Math.max(0, target6Months - savings);
  const actualMonthlySavingsCapacity = Math.max(0, monthlySurplus);
  const monthsToReachGoal = actualMonthlySavingsCapacity > 0
    ? Math.ceil(gapTo6Months / actualMonthlySavingsCapacity)
    : null;

  return {
    essentialMonthlyExpenses,
    monthlySurplus,
    currentSavings: savings,
    target3Months,
    target6Months,
    target12Months,
    monthsCoveredCurrently,
    gapTo6Months,
    actualMonthlySavingsCapacity,
    monthsToReachGoal,
    isHealthy: monthsCoveredCurrently >= 6,
    needsBuffer: monthsCoveredCurrently < 3
  };
};

/**
 * Solvency & Payability Assessment:
 * The central engine verifying:
 * 1) Can the monthly EMI be serviced?
 * 2) Can the total principal & interest be paid over tenure?
 * 3) What is the monthly savings capacity after servicing the loan?
 */
export const assessLoanSolvency = (
  monthlyIncome,
  monthlyExpenses,
  existingEmisList = [],
  principal,
  annualRate,
  tenureMonths,
  monthlySavingsTarget = 0,
  otherExpenses = 0
) => {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const baseExpenses = Math.max(0, Number(monthlyExpenses) || 0);
  const extraExpenses = Math.max(0, Number(otherExpenses) || 0);
  const expenses = baseExpenses + extraExpenses;
  const savingsGoal = Math.max(0, Number(monthlySavingsTarget) || 0);

  const emiData = calculateEMI(principal, annualRate, tenureMonths);
  const totalExistingEmis = existingEmisList.reduce(
    (sum, item) => sum + (Math.max(0, Number(item.amount) || 0)),
    0
  );

  const totalMonthlyOutflow = expenses + totalExistingEmis + emiData.emi;
  const monthlyCashflowSurplus = income - totalMonthlyOutflow;
  const surplusAfterSavingsGoal = monthlyCashflowSurplus - savingsGoal;

  // Total obligations & DTI
  const totalDebtObligations = totalExistingEmis + emiData.emi;
  const dtiRatio = income > 0 ? Number(((totalDebtObligations / income) * 100).toFixed(1)) : 0;

  // Cumulative earnings and feasibility over the loan tenure
  const projectedCumulativeIncome = income * emiData.tenureMonths;
  const projectedCumulativeExpenses = (expenses + totalExistingEmis) * emiData.tenureMonths;
  const projectedCumulativeDisposable = projectedCumulativeIncome - projectedCumulativeExpenses;
  const totalLoanRepayment = emiData.totalPayment; // Principal + Interest

  // Is loan payable?
  // 1. Monthly Solvency: monthlyCashflowSurplus >= 0
  // 2. Cumulative Solvency: projectedCumulativeDisposable >= totalLoanRepayment
  // 3. Goal Solvency: surplusAfterSavingsGoal >= 0
  const isMonthlyPayable = monthlyCashflowSurplus >= 0;
  const isTotalPayable = projectedCumulativeDisposable >= totalLoanRepayment;
  const isSavingsGoalMet = surplusAfterSavingsGoal >= 0;

  let verdict = 'Fully Payable & Comfortable';
  let verdictColor = 'emerald';
  let verdictSummary = 'Both the monthly EMI and total principal + interest are comfortably affordable within your current income.';

  if (!isMonthlyPayable) {
    verdict = 'Unpayable / Cash Deficit';
    verdictColor = 'rose';
    const deficit = Math.abs(monthlyCashflowSurplus);
    verdictSummary = `Monthly cash deficit of ₹${deficit.toLocaleString('en-IN')}. Current income cannot support this loan along with your existing expenses and EMIs.`;
  } else if (dtiRatio > 50) {
    verdict = 'High Debt Stress';
    verdictColor = 'rose';
    verdictSummary = 'Technically payable, but debt obligations consume over 50% of your income. High risk of default during minor financial emergencies.';
  } else if (!isSavingsGoalMet) {
    verdict = 'Payable (Savings Compromised)';
    verdictColor = 'amber';
    verdictSummary = `You can afford the monthly EMI, but you will fall short of your monthly savings target of ₹${savingsGoal.toLocaleString('en-IN')} by ₹${Math.abs(surplusAfterSavingsGoal).toLocaleString('en-IN')}.`;
  } else if (dtiRatio > 35) {
    verdict = 'Payable with Tight Budget';
    verdictColor = 'amber';
    verdictSummary = 'Loan is payable and meets your savings target, but total debt is between 35% and 50% of income. Proceed with modest caution.';
  }

  return {
    income,
    expenses,
    totalExistingEmis,
    newEmi: emiData.emi,
    totalInterest: emiData.totalInterest,
    totalPayment: emiData.totalPayment,
    totalMonthlyOutflow,
    monthlyCashflowSurplus,
    surplusAfterSavingsGoal,
    savingsGoal,
    dtiRatio,
    projectedCumulativeIncome,
    projectedCumulativeExpenses,
    projectedCumulativeDisposable,
    isMonthlyPayable,
    isTotalPayable,
    isSavingsGoalMet,
    verdict,
    verdictColor,
    verdictSummary
  };
};

/**
 * Financial Insights and Actionable Recommendations Generator:
 * Generates tailored recommendations to turn a Risky or Tight loan into a Comfortable loan.
 */
export const generateFinancialRecommendations = (
  income,
  expenses,
  existingEmisList = [],
  principal,
  annualRate,
  tenureMonths,
  monthlySavingsTarget = 0,
  otherExpenses = 0
) => {
  const solvency = assessLoanSolvency(
    income,
    expenses,
    existingEmisList,
    principal,
    annualRate,
    tenureMonths,
    monthlySavingsTarget,
    otherExpenses
  );

  const recommendations = [];

  // 1. Tenure Extension Path
  if (tenureMonths < 240) {
    const extendedTenure = Math.min(360, tenureMonths + 24);
    const extendedEmi = calculateEMI(principal, annualRate, extendedTenure);
    const emiSavings = solvency.newEmi - extendedEmi.emi;
    if (emiSavings > 500) {
      recommendations.push({
        id: 'rec_tenure',
        title: `Extend Tenure to ${Math.round(extendedTenure / 12)} Years (${extendedTenure} mos)`,
        benefit: `Reduces monthly EMI by ₹${emiSavings.toLocaleString('en-IN')}/mo to ₹${extendedEmi.emi.toLocaleString('en-IN')}.`,
        tradeoff: `Increases total interest by ₹${(extendedEmi.totalInterest - solvency.totalInterest).toLocaleString('en-IN')}.`,
        actionType: 'extend_tenure',
        newTenure: extendedTenure
      });
    }
  }

  // 2. Down Payment / Principal Reduction Path
  if (income > 0) {
    const targetEmiForComfort = Math.max(500, Math.round(income * 0.25 - solvency.totalExistingEmis));
    if (solvency.newEmi > targetEmiForComfort && targetEmiForComfort > 0) {
      const maxSafeLoan = calculateMaxAffordableLoan(
        income,
        expenses,
        existingEmisList,
        monthlySavingsTarget,
        annualRate,
        tenureMonths,
        otherExpenses
      );
      if (maxSafeLoan && maxSafeLoan.maxPrincipal > 0) {
        const actualEmi = maxSafeLoan.actualEmiAtMax || maxSafeLoan.maxAffordableEmi || 0;
        const principalToTrim = Math.max(25000, principal - maxSafeLoan.maxPrincipal);
        recommendations.push({
          id: 'rec_principal',
          title: `Increase Down Payment by ₹${principalToTrim.toLocaleString('en-IN')}`,
          benefit: `Reduces loan to ₹${maxSafeLoan.maxPrincipal.toLocaleString('en-IN')}, lowering EMI to ₹${actualEmi.toLocaleString('en-IN')}.`,
          tradeoff: 'Requires upfront liquid capital.',
          actionType: 'reduce_principal',
          targetPrincipal: maxSafeLoan.maxPrincipal
        });
      }
    }
  }

  // 3. Existing Debt Payoff Priority
  if (existingEmisList.length > 0) {
    const sortedEmis = [...existingEmisList].sort((a, b) => (b.amount || 0) - (a.amount || 0));
    const highestEmi = sortedEmis[0];
    if (highestEmi && highestEmi.amount > 0) {
      recommendations.push({
        id: 'rec_debt_consolidation',
        title: `Pay Off Existing "${highestEmi.name}" First`,
        benefit: `Frees up ₹${Number(highestEmi.amount).toLocaleString('en-IN')}/mo in cashflow, immediately lowering debt pressure.`,
        tradeoff: 'Wait until existing loan ends before borrowing.',
        actionType: 'pay_debt'
      });
    }
  }

  // 4. Rate Negotiation / Promotional Subsidies
  if (annualRate > 8.0) {
    const discountedRate = Math.max(0, annualRate - 1.0);
    const discountedEmi = calculateEMI(principal, discountedRate, tenureMonths);
    const interestSaved = solvency.totalInterest - discountedEmi.totalInterest;
    recommendations.push({
      id: 'rec_rate',
      title: `Shop for an Interest Rate 1% Lower (${discountedRate.toFixed(2)}%)`,
      benefit: `Saves ₹${interestSaved.toLocaleString('en-IN')} in total interest and ₹${(solvency.newEmi - discountedEmi.emi).toLocaleString('en-IN')}/mo.`,
      tradeoff: 'May require improving credit profile or comparing alternative lenders.',
      actionType: 'lower_rate',
      targetRate: discountedRate
    });
  }

  return {
    solvency,
    recommendations
  };
};

/**
 * Analyzes affordability based on income, living expenses, existing debts, and proposed new EMI.
 */
export const calculateAffordability = (
  monthlyIncome,
  monthlyExpenses,
  existingEmisList = [],
  proposedEmi = 0,
  otherExpenses = 0
) => {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const baseExpenses = Math.max(0, Number(monthlyExpenses) || 0);
  const extraExpenses = Math.max(0, Number(otherExpenses) || 0);
  const expenses = baseExpenses + extraExpenses;
  const newEmi = Math.max(0, Number(proposedEmi) || 0);

  const totalExistingEmis = existingEmisList.reduce((sum, item) => {
    return sum + (Math.max(0, Number(item.amount) || 0));
  }, 0);

  const totalObligations = totalExistingEmis + newEmi;
  const totalOutflow = totalObligations + expenses;
  const remainingBalance = income - totalOutflow;

  const dtiRatio = income > 0 ? Number(((totalObligations / income) * 100).toFixed(1)) : 0;
  const expenseRatio = income > 0 ? Number(((expenses / income) * 100).toFixed(1)) : 0;
  const remainingRatio = income > 0 ? Number(((remainingBalance / income) * 100).toFixed(1)) : 0;

  let status = 'Comfortable';
  let badgeColor = 'emerald';
  let title = 'Comfortable Loan Capacity';
  let description = 'Your proposed loan leaves a healthy monthly buffer for emergencies and discretionary spending.';
  let recommendation = 'Your debt obligations are well within safe financial boundaries (under 35% of monthly income).';

  if (remainingBalance < 0 || dtiRatio > 50) {
    status = 'Risky';
    badgeColor = 'rose';
    title = 'High Financial Risk';
    description = remainingBalance < 0
      ? `Your monthly expenses and loan commitments exceed your income by ₹${Math.abs(remainingBalance).toLocaleString('en-IN')}.`
      : 'Debt obligations exceed 50% of your income, leaving you vulnerable to financial emergencies.';
    recommendation = 'Consider extending the loan tenure, increasing the down payment, or paying off existing EMIs before borrowing.';
  } else if (dtiRatio > 35 || remainingBalance < income * 0.20) {
    status = 'Tight';
    badgeColor = 'amber';
    title = 'Tight Monthly Budget';
    description = 'While technically affordable, your monthly buffer is slim. Unexpected expenses could stretch your finances.';
    recommendation = 'Proceed with caution. Keep an emergency fund of at least 3-6 months of expenses before taking this loan.';
  }

  return {
    income,
    expenses,
    totalExistingEmis,
    newEmi,
    totalObligations,
    totalOutflow,
    remainingBalance,
    dtiRatio,
    expenseRatio,
    remainingRatio,
    status,
    badgeColor,
    title,
    description,
    recommendation
  };
};

/**
 * Compares two loan scenarios side-by-side.
 */
export const compareLoanScenarios = (loanA, loanB) => {
  const resultA = calculateEMI(loanA.principal, loanA.annualRate, loanA.tenureMonths);
  const resultB = calculateEMI(loanB.principal, loanB.annualRate, loanB.tenureMonths);

  const emiDiff = resultB.emi - resultA.emi;
  const interestDiff = resultB.totalInterest - resultA.totalInterest;
  const totalDiff = resultB.totalPayment - resultA.totalPayment;

  return {
    loanA: {
      ...loanA,
      ...resultA
    },
    loanB: {
      ...loanB,
      ...resultB
    },
    differences: {
      emiDiff,
      interestDiff,
      totalDiff,
      cheaperOption: resultA.totalPayment <= resultB.totalPayment ? 'Scenario A' : 'Scenario B',
      lowerEmiOption: resultA.emi <= resultB.emi ? 'Scenario A' : 'Scenario B'
    },
    chartData: [
      {
        metric: 'Monthly EMI',
        'Scenario A': resultA.emi,
        'Scenario B': resultB.emi
      },
      {
        metric: 'Total Interest',
        'Scenario A': resultA.totalInterest,
        'Scenario B': resultB.totalInterest
      },
      {
        metric: 'Total Repayment',
        'Scenario A': resultA.totalPayment,
        'Scenario B': resultB.totalPayment
      }
    ]
  };
};
