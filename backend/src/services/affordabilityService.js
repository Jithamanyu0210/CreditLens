import { calculateEMI } from './emiService.js';

/**
 * Assesses loan affordability and solvency using financial profile parameters.
 * Avoids double-counting expenses and existing debts.
 */
export const calculateAffordability = (
  monthlyIncome,
  monthlyExpenses,
  otherExpenses = 0,
  existingEmis = [],
  proposedEmi = 0,
  monthlySavingsTarget = 0
) => {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const livingExp = Math.max(0, Number(monthlyExpenses) || 0);
  const otherExp = Math.max(0, Number(otherExpenses) || 0);
  const totalLivingAndOtherExpenses = livingExp + otherExp;

  const existingEmisArray = Array.isArray(existingEmis) ? existingEmis : [];
  const totalExistingEmis = existingEmisArray.reduce(
    (sum, item) => sum + Math.max(0, Number(item.amount) || 0),
    0
  );

  const emi = Math.max(0, Number(proposedEmi) || 0);
  const totalMonthlyObligations = totalExistingEmis + emi;
  const totalMonthlyOutflow = totalLivingAndOtherExpenses + totalMonthlyObligations;
  const remainingMonthlyBalance = income - totalMonthlyOutflow;
  const savingsTarget = Math.max(0, Number(monthlySavingsTarget) || 0);
  const surplusAfterSavings = remainingMonthlyBalance - savingsTarget;

  const dtiRatio = income > 0 
    ? Number(((totalMonthlyObligations / income) * 100).toFixed(1)) 
    : 0;
  const expenseRatio = income > 0 
    ? Number(((totalLivingAndOtherExpenses / income) * 100).toFixed(1)) 
    : 0;

  // Threshold evaluations (Rule-based FinTech policies)
  let status = 'Comfortable';
  let badgeColor = 'emerald';
  let title = 'Comfortable Loan Capacity';
  let description = 'Your proposed loan leaves a healthy monthly buffer for emergencies and discretionary spending.';
  let recommendation = 'Your debt obligations are well within safe financial boundaries (under 35% of monthly income).';

  if (remainingMonthlyBalance < 0) {
    status = 'Risky';
    badgeColor = 'rose';
    title = 'High Financial Risk / Cash Deficit';
    description = `Your monthly expenses and loan commitments exceed your income by ₹${Math.abs(remainingMonthlyBalance).toLocaleString('en-IN')}, creating a monthly cash deficit.`;
    recommendation = 'Consider extending the loan tenure, increasing the down payment, or paying off existing EMIs before borrowing.';
  } else if (dtiRatio > 50) {
    status = 'Risky';
    badgeColor = 'rose';
    title = 'High Debt Stress (DTI > 50%)';
    description = `Total debt obligations consume ${dtiRatio}% of your monthly income, leaving you vulnerable to financial emergencies.`;
    recommendation = 'Lenders typically consider debt payments over 50% of income high-risk. Lower the borrowing amount or payoff existing loans.';
  } else if (dtiRatio > 35 || surplusAfterSavings < 0) {
    status = 'Tight';
    badgeColor = 'amber';
    title = 'Tight Monthly Budget';
    description = surplusAfterSavings < 0
      ? `You can manage the EMI, but you will fall short of your ₹${savingsTarget.toLocaleString('en-IN')} monthly savings target by ₹${Math.abs(surplusAfterSavings).toLocaleString('en-IN')}.`
      : 'While technically affordable, your monthly buffer is slim. Unexpected expenses could stretch your finances.';
    recommendation = 'Proceed with modest caution. Ensure an emergency fund of at least 3-6 months of essential living costs is maintained.';
  }

  // Generate actionable personalized recommendations
  const insights = [];
  if (remainingMonthlyBalance < 0 || dtiRatio > 40) {
    insights.push({
      type: 'tenure',
      message: 'Extending your loan tenure will lower your monthly EMI and restore positive cashflow, though it will increase total interest paid over time.'
    });
    insights.push({
      type: 'down_payment',
      message: 'Increasing your upfront down payment reduces the required principal, directly lowering monthly EMI.'
    });
  }
  if (totalExistingEmis > 0) {
    insights.push({
      type: 'debt_snowball',
      message: `You are currently paying ₹${totalExistingEmis.toLocaleString('en-IN')}/mo toward existing debts. Clearing smaller loans before taking a new commitment will significantly expand your borrowing safety.`
    });
  }

  return {
    income,
    livingExpenses: livingExp,
    otherExpenses: otherExp,
    totalLivingAndOtherExpenses,
    totalExistingEmis,
    proposedEmi: emi,
    totalMonthlyObligations,
    totalMonthlyOutflow,
    remainingMonthlyBalance,
    monthlySavingsTarget: savingsTarget,
    surplusAfterSavings,
    dtiRatio,
    expenseRatio,
    status,
    badgeColor,
    title,
    description,
    recommendation,
    insights,
    disclaimer: 'Illustrative planning tool assumptions only. Bank underwriting and actual credit approval may differ.'
  };
};
