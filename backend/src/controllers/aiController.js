import {
  generateAffordabilityExplanation,
  generateComparisonExplanation
} from '../services/geminiService.js';
import { calculateEMI } from '../services/emiService.js';
import { calculateAffordability } from '../services/affordabilityService.js';
import { FinancialProfile } from '../models/FinancialProfile.js';

/**
 * Controller for CreditLens AI-powered financial explanations.
 * Strictly uses existing CreditLens calculation engines as inputs.
 */

export const explainAffordability = async (req, res, next) => {
  try {
    let profile = req.body.profile;
    const loanBody = req.body.loan || {};

    // 1. Resolve profile from authenticated user if not provided in request body
    if (!profile && req.user) {
      try {
        const dbProfile = await FinancialProfile.findOne({ userId: req.user._id });
        if (dbProfile) {
          profile = {
            monthlyIncome: dbProfile.monthlyIncome,
            monthlyExpenses: dbProfile.monthlyExpenses,
            otherExpenses: dbProfile.otherExpenses,
            monthlySavingsTarget: dbProfile.monthlySavingsTarget,
            currentSavings: dbProfile.currentSavings,
            existingEmis: dbProfile.existingEmis
          };
        }
      } catch {
        // Continue with default fallback
      }
    }

    // Default profile baseline if neither provided nor found in DB
    const resolvedProfile = {
      monthlyIncome: profile?.monthlyIncome ?? 85000,
      monthlyExpenses: profile?.monthlyExpenses ?? 32000,
      otherExpenses: profile?.otherExpenses ?? 0,
      monthlySavingsTarget: profile?.monthlySavingsTarget ?? 15000,
      currentSavings: profile?.currentSavings ?? 180000,
      existingEmis: Array.isArray(profile?.existingEmis) ? profile.existingEmis : []
    };

    // 2. Resolve loan parameters
    const principal = Math.max(0, Number(loanBody.principal ?? req.body.principal ?? 1000000));
    const annualRate = Math.max(0, Number(loanBody.annualRate ?? req.body.annualRate ?? 8.75));
    const tenureMonths = Math.max(1, Math.round(Number(loanBody.tenureMonths ?? req.body.tenureMonths ?? 60)));

    // 3. Compute deterministic calculations via CreditLens financial engines
    const emiResult = calculateEMI(principal, annualRate, tenureMonths);

    const affResult = calculateAffordability(
      resolvedProfile.monthlyIncome,
      resolvedProfile.monthlyExpenses,
      resolvedProfile.otherExpenses,
      resolvedProfile.existingEmis,
      emiResult.emi,
      resolvedProfile.monthlySavingsTarget
    );

    // 4. Generate AI financial explanation based on these exact calculations
    const aiResponse = await generateAffordabilityExplanation({
      profile: resolvedProfile,
      loan: {
        principal,
        annualRate,
        tenureMonths,
        emi: emiResult.emi,
        totalInterest: emiResult.totalInterest,
        totalPayment: emiResult.totalPayment
      },
      affordability: affResult
    });

    res.json({
      success: true,
      loan: emiResult,
      affordability: affResult,
      ...aiResponse
    });
  } catch (error) {
    next(error);
  }
};

export const explainComparison = async (req, res, next) => {
  try {
    const rawLoans = req.body.loans || req.body.options || [];
    let profile = req.body.profile;

    if (!profile && req.user) {
      try {
        const dbProfile = await FinancialProfile.findOne({ userId: req.user._id });
        if (dbProfile) {
          profile = {
            monthlyIncome: dbProfile.monthlyIncome,
            monthlyExpenses: dbProfile.monthlyExpenses,
            otherExpenses: dbProfile.otherExpenses,
            existingEmis: dbProfile.existingEmis
          };
        }
      } catch {
        // Continue with default fallback
      }
    }

    const resolvedProfile = {
      monthlyIncome: profile?.monthlyIncome ?? 85000,
      monthlyExpenses: profile?.monthlyExpenses ?? 32000,
      otherExpenses: profile?.otherExpenses ?? 0,
      existingEmis: Array.isArray(profile?.existingEmis) ? profile.existingEmis : []
    };

    const totalBaseLiving = (resolvedProfile.monthlyExpenses || 0) + (resolvedProfile.otherExpenses || 0);
    const existingDebtEmiTotal = (resolvedProfile.existingEmis || []).reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    // 1. Ensure deterministic calculations for each compared loan
    const calculatedLoans = rawLoans.map((loan, idx) => {
      const p = Math.max(0, Number(loan.principal ?? 1000000));
      const r = Math.max(0, Number(loan.annualRate ?? 8.75));
      const n = Math.max(1, Math.round(Number(loan.tenureMonths ?? 60)));

      const calc = calculateEMI(p, r, n);
      const remainingBalance = resolvedProfile.monthlyIncome - totalBaseLiving - existingDebtEmiTotal - calc.emi;
      const totalObligations = existingDebtEmiTotal + calc.emi;
      const dti = resolvedProfile.monthlyIncome > 0 ? (totalObligations / resolvedProfile.monthlyIncome) * 100 : 0;

      let affordability = 'Comfortable';
      if (dti > 50 || remainingBalance < 0) {
        affordability = 'Risky';
      } else if (dti > 35 || remainingBalance < resolvedProfile.monthlyIncome * 0.2) {
        affordability = 'Tight';
      }

      return {
        id: loan.id || `loan_${idx + 1}`,
        name: loan.name || `Option ${idx + 1}`,
        principal: p,
        annualRate: r,
        tenureMonths: n,
        emi: calc.emi,
        totalInterest: calc.totalInterest,
        totalPayment: calc.totalPayment,
        remainingBalance: Math.round(remainingBalance),
        affordability
      };
    });

    // 2. Generate AI comparison analysis
    const aiResponse = await generateComparisonExplanation({
      loans: calculatedLoans,
      profile: resolvedProfile
    });

    res.json({
      success: true,
      loans: calculatedLoans,
      ...aiResponse
    });
  } catch (error) {
    next(error);
  }
};

export const getAiStatus = (req, res) => {
  const isKeyConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  res.json({
    success: true,
    available: isKeyConfigured,
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    features: ['affordability_explanation', 'comparison_analysis'],
    timestamp: new Date().toISOString()
  });
};
