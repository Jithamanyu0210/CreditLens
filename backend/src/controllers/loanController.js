import { calculateEMI } from '../services/emiService.js';
import { generateAmortizationSchedule } from '../services/amortizationService.js';
import { calculateAffordability } from '../services/affordabilityService.js';
import { compareLoanScenarios } from '../services/simulatorService.js';
import { FinancialProfile } from '../models/FinancialProfile.js';

export const calculateLoanEMI = (req, res, next) => {
  try {
    const { principal, annualRate, tenureMonths } = req.body;
    const result = calculateEMI(principal, annualRate, tenureMonths);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

export const assessAffordability = async (req, res, next) => {
  try {
    const {
      principal,
      annualRate,
      tenureMonths,
      monthlyIncome,
      monthlyExpenses,
      otherExpenses,
      existingEmis,
      monthlySavingsTarget
    } = req.body;

    // First calculate proposed EMI
    const emiResult = calculateEMI(principal, annualRate, tenureMonths);

    let income = monthlyIncome;
    let livingExp = monthlyExpenses;
    let otherExp = otherExpenses;
    let emis = existingEmis;
    let savingsTarget = monthlySavingsTarget;

    // If profile parameters were not passed in body and user is authenticated, query their profile
    if ((income === undefined || livingExp === undefined) && req.user) {
      try {
        const userProfile = await FinancialProfile.findOne({ userId: req.user._id });
        if (userProfile) {
          income = income ?? userProfile.monthlyIncome;
          livingExp = livingExp ?? userProfile.monthlyExpenses;
          otherExp = otherExp ?? userProfile.otherExpenses;
          emis = emis ?? userProfile.existingEmis;
          savingsTarget = savingsTarget ?? userProfile.monthlySavingsTarget;
        }
      } catch {}
    }

    // Default fallbacks if neither body nor DB profile provided
    income = income ?? 85000;
    livingExp = livingExp ?? 32000;
    otherExp = otherExp ?? 0;
    emis = emis ?? [];
    savingsTarget = savingsTarget ?? 15000;

    const affordability = calculateAffordability(
      income,
      livingExp,
      otherExp,
      emis,
      emiResult.emi,
      savingsTarget
    );

    res.json({
      success: true,
      loan: emiResult,
      affordability
    });
  } catch (error) {
    next(error);
  }
};

export const generateAmortization = (req, res, next) => {
  try {
    const { principal, annualRate, tenureMonths } = req.body;
    const { summary, schedule } = generateAmortizationSchedule(principal, annualRate, tenureMonths);

    res.json({
      success: true,
      summary,
      schedule
    });
  } catch (error) {
    next(error);
  }
};

export const compareLoans = async (req, res, next) => {
  try {
    let loans = req.body.loans || req.body.options;

    // Handle legacy { loanA, loanB } format seamlessly
    if (!loans && req.body.loanA && req.body.loanB) {
      loans = [
        { name: 'Loan Scenario A', ...req.body.loanA },
        { name: 'Loan Scenario B', ...req.body.loanB }
      ];
    }

    if (!Array.isArray(loans) || loans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of at least 2 to 5 loan options to compare.'
      });
    }

    let profile = req.body.profile || null;
    if (!profile && req.user) {
      try {
        profile = await FinancialProfile.findOne({ userId: req.user._id });
      } catch {}
    }

    const comparison = compareLoanScenarios(loans, profile);

    res.json({
      success: true,
      ...comparison
    });
  } catch (error) {
    next(error);
  }
};
