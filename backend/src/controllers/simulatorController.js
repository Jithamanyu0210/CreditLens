import {
  calculateMaxLoanCapacity,
  calculatePrepayment,
  calculateEmergencyFund,
  compareLoanScenarios
} from '../services/simulatorService.js';
import { FinancialProfile } from '../models/FinancialProfile.js';
import { LoanScenario } from '../models/LoanScenario.js';

export const getMaxLoanCapacity = async (req, res, next) => {
  try {
    let {
      monthlyIncome,
      monthlyExpenses,
      otherExpenses,
      existingEmis,
      monthlySavingsTarget,
      annualRate,
      tenureMonths
    } = req.body;

    // Use user profile if logged in and profile fields missing
    if ((monthlyIncome === undefined || monthlyExpenses === undefined) && req.user) {
      try {
        const profile = await FinancialProfile.findOne({ userId: req.user._id });
        if (profile) {
          monthlyIncome = monthlyIncome ?? profile.monthlyIncome;
          monthlyExpenses = monthlyExpenses ?? profile.monthlyExpenses;
          otherExpenses = otherExpenses ?? profile.otherExpenses;
          existingEmis = existingEmis ?? profile.existingEmis;
          monthlySavingsTarget = monthlySavingsTarget ?? profile.monthlySavingsTarget;
        }
      } catch {}
    }

    const result = calculateMaxLoanCapacity(
      monthlyIncome,
      monthlyExpenses,
      otherExpenses,
      existingEmis,
      monthlySavingsTarget,
      annualRate,
      tenureMonths
    );

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

export const getPrepaymentAnalysis = (req, res, next) => {
  try {
    const {
      principal,
      annualRate,
      tenureMonths,
      extraMonthlyPayment,
      lumpSumPayment,
      lumpSumMonth
    } = req.body;

    const result = calculatePrepayment(
      principal,
      annualRate,
      tenureMonths,
      extraMonthlyPayment,
      lumpSumPayment,
      lumpSumMonth
    );

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyFundAnalysis = async (req, res, next) => {
  try {
    let {
      monthlyIncome,
      monthlyExpenses,
      otherExpenses,
      existingEmis,
      proposedEmi,
      currentSavings,
      targetMonths
    } = req.body;

    if ((monthlyIncome === undefined || monthlyExpenses === undefined) && req.user) {
      try {
        const profile = await FinancialProfile.findOne({ userId: req.user._id });
        if (profile) {
          monthlyIncome = monthlyIncome ?? profile.monthlyIncome;
          monthlyExpenses = monthlyExpenses ?? profile.monthlyExpenses;
          otherExpenses = otherExpenses ?? profile.otherExpenses;
          existingEmis = existingEmis ?? profile.existingEmis;
          currentSavings = currentSavings ?? profile.currentSavings;
        }
      } catch {}
    }

    const result = calculateEmergencyFund(
      monthlyIncome,
      monthlyExpenses,
      otherExpenses,
      existingEmis,
      proposedEmi,
      currentSavings,
      targetMonths
    );

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

export const compareScenariosAnalysis = async (req, res, next) => {
  try {
    const { scenarioIds, scenarios } = req.body;
    let listToCompare = [];

    if (Array.isArray(scenarios) && scenarios.length > 0) {
      listToCompare = scenarios;
    } else if (Array.isArray(scenarioIds) && scenarioIds.length > 0) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to compare saved scenarios by ID.'
        });
      }

      // Verify scenario ownership strictly
      let savedDocs = [];
      if (mongoose.connection.readyState === 1) {
        savedDocs = await LoanScenario.find({
          _id: { $in: scenarioIds },
          userId: req.user._id
        });
      }

      if (savedDocs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'None of the requested scenario IDs belong to your account.'
        });
      }

      listToCompare = savedDocs;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either scenarioIds or an array of scenario objects to compare.'
      });
    }

    let profile = null;
    if (req.user) {
      try {
        profile = await FinancialProfile.findOne({ userId: req.user._id });
      } catch {}
    }

    const result = compareLoanScenarios(listToCompare, profile);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};
