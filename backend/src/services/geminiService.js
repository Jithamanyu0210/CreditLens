import { GoogleGenAI } from '@google/genai';

/**
 * Dedicated Gemini Service for CreditLens.
 * Generates personalized financial explanations and insights based on
 * existing, deterministic CreditLens calculations.
 *
 * NOTE: Gemini NEVER replaces or modifies financial formulas, EMIs,
 * amortization schedules, or affordability metrics. It solely provides
 * human-readable explanations, contextual analysis, and prudent guidance.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/**
 * Returns a configured GoogleGenAI instance or null if API key is missing.
 */
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

/**
 * Cleanly parse JSON from Gemini text response with resilient markdown extraction.
 */
const safeParseJSON = (text, fallbackData) => {
  if (!text || typeof text !== 'string') return fallbackData;
  try {
    // Remove markdown code fences if present (e.g., ```json ... ```)
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return fallbackData;
  }
};

/**
 * Generates rule-based fallback explanation when Gemini is unavailable.
 */
const getRuleBasedAffordabilityFallback = ({ profile, loan, affordability }) => {
  const status = affordability?.status || 'Comfortable';
  const dti = affordability?.totalDtiPercentage ?? affordability?.dti ?? 0;
  const remaining = affordability?.remainingBalance ?? 0;
  const emi = loan?.emi ?? 0;

  let summary = '';
  let strengths = [];
  let risks = [];
  let actionableTips = [];

  if (status === 'Comfortable') {
    summary = `Your proposed EMI of ₹${emi.toLocaleString('en-IN')} fits comfortably within your monthly budget, representing a manageable ${dti}% total Debt-to-Income (DTI) ratio.`;
    strengths = [
      `Total debt obligations (${dti}%) remain comfortably below the safe 35% banking ceiling.`,
      `You retain a healthy disposable monthly buffer of ₹${Math.max(0, remaining).toLocaleString('en-IN')} for emergency savings and living expenses.`
    ];
    risks = [
      'Future interest rate revisions if choosing a floating rate loan.',
      'Potential lifestyle inflation reducing the projected monthly surplus.'
    ];
    actionableTips = [
      'Maintain an emergency fund covering at least 3-6 months of living expenses plus EMI.',
      'Consider making periodic prepayments to shorten your tenure and save on cumulative interest.',
      'Opt for automated standing instructions to avoid missed payment penalties.'
    ];
  } else if (status === 'Tight') {
    summary = `Your proposed EMI of ₹${emi.toLocaleString('en-IN')} places your budget in the Tight zone with a ${dti}% DTI ratio. While serviceable, your disposable cushion is limited.`;
    strengths = [
      'The loan is theoretically serviceable based on current income and non-discretionary expenses.',
      `A positive monthly remaining balance of ₹${remaining.toLocaleString('en-IN')} is still preserved.`
    ];
    risks = [
      'Unforeseen emergency expenses could strain your ability to service the loan smoothly.',
      `Total obligations (${dti}%) exceed the ideal 35% comfort guideline.`
    ];
    actionableTips = [
      'Explore lengthening the loan tenure to reduce monthly EMI commitments to a safer level.',
      'Audit discretionary living expenses to expand your monthly liquidity buffer.',
      'Avoid taking on any additional credit cards or consumer financing loans during this tenure.'
    ];
  } else {
    summary = `Caution: A proposed EMI of ₹${emi.toLocaleString('en-IN')} results in a Risky financial profile (${dti}% DTI or negative remaining cashflow).`;
    strengths = [
      'CreditLens has identified this bottleneck before entering into a binding lender contract.'
    ];
    risks = [
      'High probability of debt distress or payment defaults during income fluctuations.',
      'Negative or severely compressed cashflow will deplete existing emergency savings rapidly.'
    ];
    actionableTips = [
      'Reduce the requested principal amount by increasing your upfront down payment.',
      'Extend the loan tenure significantly to bring the monthly EMI within 30-35% of income.',
      'Prioritize paying down existing high-interest loans to release monthly cashflow capacity.'
    ];
  }

  return {
    source: 'rule-based-engine',
    status,
    summary,
    strengths,
    risks,
    actionableTips
  };
};

/**
 * Generates rule-based fallback explanation for loan comparisons.
 */
const getRuleBasedComparisonFallback = (loans) => {
  if (!Array.isArray(loans) || loans.length === 0) {
    return {
      source: 'rule-based-engine',
      summary: 'Insufficient loan options provided for comparative analysis.',
      keyTradeoffs: [],
      recommendation: 'Provide at least two loan options to generate comparative insights.'
    };
  }

  const sortedByCost = [...loans].sort((a, b) => (a.totalPayment || 0) - (b.totalPayment || 0));
  const sortedByEmi = [...loans].sort((a, b) => (a.emi || 0) - (b.emi || 0));

  const lowestCost = sortedByCost[0];
  const lowestEmi = sortedByEmi[0];

  const keyTradeoffs = [
    `Option "${lowestCost?.name || 'Lowest Cost'}" saves the most total interest (₹${Math.round((lowestCost?.totalInterest || 0)).toLocaleString('en-IN')} total interest), but requires a higher monthly EMI commitment of ₹${Math.round(lowestCost?.emi || 0).toLocaleString('en-IN')}.`,
    `Option "${lowestEmi?.name || 'Lowest EMI'}" offers the easiest monthly cashflow burden (₹${Math.round(lowestEmi?.emi || 0).toLocaleString('en-IN')}/month), but incurs higher cumulative interest over time.`
  ];

  const recommendation = lowestCost?.id === lowestEmi?.id
    ? `"${lowestCost?.name}" is clearly dominant, providing both the lowest EMI and the lowest total cost.`
    : `If monthly budget flexibility is your priority, consider "${lowestEmi?.name}". If minimizing total financing charges over the loan lifecycle is your priority, select "${lowestCost?.name}".`;

  return {
    source: 'rule-based-engine',
    summary: `Compared ${loans.length} loan options across monthly cashflow impact and cumulative interest expense.`,
    keyTradeoffs,
    recommendation
  };
};

/**
 * 1. Generate AI-powered Loan Affordability Explanation
 *
 * @param {Object} params
 * @param {Object} params.profile User financial profile (income, expenses, savings)
 * @param {Object} params.loan Loan parameters & calculated EMI
 * @param {Object} params.affordability Calculated affordability metrics (DTI, status, remaining balance)
 * @returns {Promise<Object>} Structured insight
 */
export const generateAffordabilityExplanation = async ({ profile = {}, loan = {}, affordability = {} }) => {
  const fallback = getRuleBasedAffordabilityFallback({ profile, loan, affordability });
  const ai = getGeminiClient();

  if (!ai) {
    return {
      success: true,
      fallback: true,
      insight: fallback,
      message: 'Generated using CreditLens financial rules engine. Set GEMINI_API_KEY in .env for live Gemini AI insights.'
    };
  }

  try {
    const prompt = `You are a certified senior financial planner and credit underwriting analyst for CreditLens FinTech.
Your role is to explain the user's loan affordability calculation results with clarity, empathy, and professional financial prudence.

CRITICAL INSTRUCTIONS:
- You MUST rely 100% on the pre-calculated financial figures below.
- Do NOT recalculate or invent different EMIs, interest rates, or percentages.
- Provide practical, unbiased educational commentary.

USER FINANCIAL PROFILE & LOAN DATA:
- Monthly Income: ₹${(profile.monthlyIncome || 0).toLocaleString('en-IN')}
- Living Expenses: ₹${(profile.monthlyExpenses || 0).toLocaleString('en-IN')}
- Other Discretionary Expenses: ₹${(profile.otherExpenses || 0).toLocaleString('en-IN')}
- Existing EMIs: ₹${(affordability.totalExistingEmis || 0).toLocaleString('en-IN')}
- Proposed Loan Principal: ₹${(loan.principal || 0).toLocaleString('en-IN')}
- Annual Interest Rate: ${loan.annualRate || 0}%
- Tenure: ${loan.tenureMonths || 0} months
- Proposed Monthly EMI: ₹${(loan.emi || 0).toLocaleString('en-IN')}
- Total Debt-to-Income (DTI) Ratio: ${affordability.totalDtiPercentage ?? affordability.dti ?? 0}%
- Remaining Monthly Cashflow: ₹${(affordability.remainingBalance || 0).toLocaleString('en-IN')}
- Rule-based Status: ${affordability.status || 'Comfortable'}

OUTPUT FORMAT:
Respond with ONLY valid JSON conforming to this schema:
{
  "summary": "2-3 sentence executive summary explaining the affordability status and cashflow health.",
  "strengths": [
    "Specific positive factor 1 from their numbers",
    "Specific positive factor 2 from their numbers"
  ],
  "risks": [
    "Specific risk or cautionary factor 1",
    "Specific risk or cautionary factor 2"
  ],
  "actionableTips": [
    "Actionable step 1 to optimize loan health or approval odds",
    "Actionable step 2 for long-term financial resilience",
    "Actionable step 3 for repayment management"
  ]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = safeParseJSON(response.text, fallback);

    return {
      success: true,
      fallback: false,
      source: 'gemini-ai',
      model: GEMINI_MODEL,
      insight: {
        ...parsed,
        source: 'gemini-ai',
        status: affordability.status || 'Comfortable'
      }
    };
  } catch (error) {
    // Graceful fallback on rate limit, quota exhaustion, or network error
    return {
      success: true,
      fallback: true,
      source: 'rule-based-engine',
      insight: fallback,
      notice: 'Gemini service temporarily unavailable; served via CreditLens deterministic financial engine.',
      errorDetails: process.env.NODE_ENV !== 'production' ? error.message : undefined
    };
  }
};

/**
 * 2. Generate AI-powered Loan Comparison Analysis
 *
 * @param {Object} params
 * @param {Array} params.loans Array of loan options with calculations
 * @param {Object} params.profile User profile context
 * @returns {Promise<Object>} Structured comparative insight
 */
export const generateComparisonExplanation = async ({ loans = [], profile = {} }) => {
  const fallback = getRuleBasedComparisonFallback(loans);
  const ai = getGeminiClient();

  if (!ai) {
    return {
      success: true,
      fallback: true,
      insight: fallback,
      message: 'Generated using CreditLens comparative rules engine. Set GEMINI_API_KEY in .env for live Gemini AI insights.'
    };
  }

  try {
    const loanSummaries = loans.map((l, i) => `Option ${i + 1} (${l.name || 'Option'}):
  - Principal: ₹${(l.principal || 0).toLocaleString('en-IN')}
  - Interest Rate: ${l.annualRate || 0}%
  - Tenure: ${l.tenureMonths || 0} months
  - Monthly EMI: ₹${(l.emi || 0).toLocaleString('en-IN')}
  - Total Interest: ₹${(l.totalInterest || 0).toLocaleString('en-IN')}
  - Total Repayment: ₹${(l.totalPayment || 0).toLocaleString('en-IN')}
  - Remaining Monthly Balance: ₹${(l.remainingBalance || 0).toLocaleString('en-IN')}
  - Budget Fit: ${l.affordability || 'N/A'}`).join('\n\n');

    const prompt = `You are a senior credit underwriting specialist for CreditLens.
Analyze and compare the following loan options for a borrower with monthly income ₹${(profile.monthlyIncome || 0).toLocaleString('en-IN')}.

LOAN OPTIONS:
${loanSummaries}

CRITICAL INSTRUCTIONS:
- You MUST base your analysis strictly on the pre-calculated numbers provided above.
- Explain the key trade-offs between lower monthly payment (longer tenure) vs lower total interest cost (shorter tenure).
- Give an objective, balanced recommendation tailored to cashflow comfort vs wealth preservation.

OUTPUT FORMAT:
Respond with ONLY valid JSON conforming to this schema:
{
  "summary": "2-3 sentence overview highlighting the central difference between these options.",
  "keyTradeoffs": [
    "Trade-off observation 1 contrasting specific options",
    "Trade-off observation 2 highlighting total interest differences",
    "Trade-off observation 3 regarding monthly budget breathing room"
  ],
  "recommendation": "Clear, practical verdict on which option best suits different borrower priorities (e.g. cashflow stability vs minimum interest paid)."
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = safeParseJSON(response.text, fallback);

    return {
      success: true,
      fallback: false,
      source: 'gemini-ai',
      model: GEMINI_MODEL,
      insight: {
        ...parsed,
        source: 'gemini-ai'
      }
    };
  } catch (error) {
    return {
      success: true,
      fallback: true,
      source: 'rule-based-engine',
      insight: fallback,
      notice: 'Gemini service temporarily unavailable; served via CreditLens deterministic financial engine.',
      errorDetails: process.env.NODE_ENV !== 'production' ? error.message : undefined
    };
  }
};
