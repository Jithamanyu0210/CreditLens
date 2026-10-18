/**
 * Initial empty schemas and calculator default settings for CreditLens.
 * Demo accounts and sample financial data have been removed.
 */

export const INITIAL_EMPTY_PROFILE = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  otherExpenses: 0,
  monthlySavingsTarget: 0,
  currentSavings: 0,
  existingEmis: []
};

export const DEFAULT_PROFILE = INITIAL_EMPTY_PROFILE;

export const DEFAULT_LOAN_PARAMS = {
  principal: 1000000, // ₹10,00,000 standard starting principal
  annualRate: 8.5,    // 8.5% default benchmark rate
  tenureMonths: 60,   // 5 years
  tenureUnit: 'years' // 'years' or 'months'
};

export const DEFAULT_SAVED_SCENARIOS = [];
