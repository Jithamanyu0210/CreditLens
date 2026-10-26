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

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

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

/**
 * 3. Generate Overall Financial Insights (Feature A)
 */
export const generateFinancialInsights = async ({ profile = {}, calculations = {} }) => {
  const income = calculations.monthlyIncome ?? profile.monthlyIncome ?? 0;
  const livingExp = calculations.monthlyExpenses ?? profile.monthlyExpenses ?? 0;
  const otherExp = calculations.otherExpenses ?? profile.otherExpenses ?? 0;
  const totalEmis = calculations.totalExistingEmis ?? 0;
  const remaining = calculations.remainingBalance ?? 0;
  const savingsTarget = calculations.savingsTarget ?? profile.monthlySavingsTarget ?? 0;
  const dti = calculations.dti ?? 0;

  const fallback = {
    summary: income > 0
      ? `Your monthly net inflow is ₹${income.toLocaleString('en-IN')}, with total commitments of ₹${(livingExp + otherExp + totalEmis).toLocaleString('en-IN')}, leaving a disposable monthly cashflow of ₹${remaining.toLocaleString('en-IN')}. Your debt-to-income (DTI) ratio is ${dti}%.`
      : 'Please set up your financial profile to receive complete financial insights.',
    concerns: remaining < 0
      ? ['Your monthly cashflow is in a deficit. Total expenses and EMIs exceed your current income.']
      : dti > 40
      ? [`Existing debt commitments consume ${dti}% of income, which exceeds the conservative 35% banking guideline.`]
      : remaining < savingsTarget
      ? [`Disposable surplus (₹${remaining.toLocaleString('en-IN')}) is currently below your savings target (₹${savingsTarget.toLocaleString('en-IN')}).`]
      : ['No immediate cashflow distress detected; baseline commitments remain within safe parameters.'],
    cashflowSuggestions: [
      'Prioritize paying down the highest-interest loan to free up recurring monthly cashflow.',
      'Audit discretionary expenses to protect a minimum 20% liquid surplus each month.',
      'Establish automated savings deposits right after payday to meet your savings goals.'
    ],
    loanConsiderations: [
      `Any new loan will add to your current debt obligations of ₹${totalEmis.toLocaleString('en-IN')}/month.`,
      `Ensure that any new EMI does not push your total DTI beyond 40% (max recommended EMI is ~₹${Math.max(0, Math.round(income * 0.4 - totalEmis)).toLocaleString('en-IN')}).`,
      'Maintain an emergency liquidity cushion of 3 to 6 months before taking on new debt.'
    ]
  };

  const ai = getGeminiClient();
  if (!ai) {
    return { success: true, fallback: true, source: 'rule-based-engine', insight: fallback };
  }

  try {
    const prompt = `You are a certified senior financial analyst for CreditLens FinTech.
Analyze the user's financial standing and provide concise, professional, plain-English guidance.

AUTHENTICATED USER FINANCIAL DATA:
- Monthly Income: ₹${income.toLocaleString('en-IN')}
- Living Expenses: ₹${livingExp.toLocaleString('en-IN')}
- Other Discretionary Expenses: ₹${otherExp.toLocaleString('en-IN')}
- Existing EMIs: ₹${totalEmis.toLocaleString('en-IN')}
- Monthly Savings Target: ₹${savingsTarget.toLocaleString('en-IN')}
- Remaining Monthly Balance: ₹${remaining.toLocaleString('en-IN')}
- Debt-to-Income (DTI): ${dti}%

RULES:
- Base your analysis STRICTLY on the figures above. Never invent different numbers.
- Provide a clear, empowering, yet objective evaluation.
- Output ONLY valid JSON matching this schema:
{
  "summary": "Plain-English summary of current financial situation (2-3 sentences)",
  "concerns": ["Potential affordability or cash-flow concern 1", "Concern 2"],
  "cashflowSuggestions": ["Practical suggestion 1 to improve monthly cash flow", "Suggestion 2"],
  "loanConsiderations": ["Important consideration 1 before taking an additional loan", "Consideration 2"]
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
      insight: parsed
    };
  } catch (error) {
    return {
      success: true,
      fallback: true,
      source: 'rule-based-engine',
      insight: fallback,
      notice: 'Gemini service temporarily busy; served via CreditLens deterministic financial engine.'
    };
  }
};

/**
 * 4. Generate Monthly Budget Insights (Feature B)
 */
export const generateBudgetInsights = async ({ profile = {}, calculations = {}, emergencyFund = {} }) => {
  const income = calculations.monthlyIncome ?? profile.monthlyIncome ?? 0;
  const livingExp = calculations.monthlyExpenses ?? profile.monthlyExpenses ?? 0;
  const otherExp = calculations.otherExpenses ?? profile.otherExpenses ?? 0;
  const totalBaseExpenses = livingExp + otherExp;
  const totalEmis = calculations.totalExistingEmis ?? 0;
  const remaining = calculations.remainingBalance ?? 0;
  const savings = calculations.currentSavings ?? profile.currentSavings ?? 0;
  const emergencyTarget = emergencyFund.targetEmergencyFund ?? (totalBaseExpenses + totalEmis) * 6;
  const monthsCovered = emergencyFund.monthsCoveredCurrently ?? (totalBaseExpenses + totalEmis > 0 ? (savings / (totalBaseExpenses + totalEmis)).toFixed(1) : 0);

  const fallback = {
    incomeVsExpenses: `You earn ₹${income.toLocaleString('en-IN')} monthly and spend ₹${totalBaseExpenses.toLocaleString('en-IN')} on living/discretionary needs plus ₹${totalEmis.toLocaleString('en-IN')} on debt obligations, retaining ₹${remaining.toLocaleString('en-IN')} as net surplus.`,
    attentionItems: [
      totalEmis > 0 ? `Recurring loan payments of ₹${totalEmis.toLocaleString('en-IN')}/mo require strict timely budgeting.` : 'No active debt commitments.',
      otherExp > livingExp * 0.4 ? 'Discretionary spending is relatively high compared to basic needs.' : 'Basic necessities are well balanced against total expenses.'
    ],
    budgetingSuggestions: [
      'Apply the 50/30/20 budget framework: 50% for Needs, 30% for Wants, 20% for Debt payoff & Savings.',
      'Track unexpected monthly outflows to prevent balance erosion.'
    ],
    savingsTips: [
      'Set an automatic recurring transfer on salary day to lock away savings.',
      'Direct any bonuses or tax refunds toward building liquid reserves.'
    ],
    emergencyFundConsiderations: [
      `Your current liquid savings of ₹${savings.toLocaleString('en-IN')} cover approximately ${monthsCovered} months of essential burn rate.`,
      `Target a minimum 6-month safety buffer of ₹${Math.round(emergencyTarget).toLocaleString('en-IN')} before considering major new liabilities.`
    ]
  };

  const ai = getGeminiClient();
  if (!ai) {
    return { success: true, fallback: true, source: 'rule-based-engine', insight: fallback };
  }

  try {
    const prompt = `You are a certified budget planner for CreditLens.
Explain the following monthly budget and cashflow metrics for the user in clear, practical terms.

USER BUDGET FIGURES:
- Monthly Income: ₹${income.toLocaleString('en-IN')}
- Basic Living Expenses: ₹${livingExp.toLocaleString('en-IN')}
- Other Expenses: ₹${otherExp.toLocaleString('en-IN')}
- Total Existing EMIs: ₹${totalEmis.toLocaleString('en-IN')}
- Remaining Monthly Cashflow: ₹${remaining.toLocaleString('en-IN')}
- Current Liquid Savings: ₹${savings.toLocaleString('en-IN')}
- 6-Month Emergency Target: ₹${Math.round(emergencyTarget).toLocaleString('en-IN')}
- Essential Months Covered: ${monthsCovered} months

RULES:
- Base analysis strictly on these numbers.
- Provide objective, realistic budgeting suggestions.
- Output ONLY valid JSON:
{
  "incomeVsExpenses": "Clear 2-sentence summary of income versus total outflows",
  "attentionItems": ["Specific commitment or expense requiring attention 1", "Item 2"],
  "budgetingSuggestions": ["Realistic budgeting suggestion 1", "Suggestion 2"],
  "savingsTips": ["Potential way to improve savings and monthly cash flow 1", "Tip 2"],
  "emergencyFundConsiderations": ["Actionable consideration for maintaining an emergency fund 1", "Consideration 2"]
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
      insight: parsed
    };
  } catch (error) {
    return {
      success: true,
      fallback: true,
      source: 'rule-based-engine',
      insight: fallback,
      notice: 'Gemini service temporarily busy; served via CreditLens deterministic financial engine.'
    };
  }
};

/**
 * 5. Generate Conversational Chat Response (Feature C)
 */
export const generateChatResponse = async ({ message, history = [], profile = {}, calculations = {} }) => {
  const income = calculations.monthlyIncome ?? profile.monthlyIncome ?? 0;
  const livingExp = calculations.monthlyExpenses ?? profile.monthlyExpenses ?? 0;
  const otherExp = calculations.otherExpenses ?? profile.otherExpenses ?? 0;
  const totalEmis = calculations.totalExistingEmis ?? 0;
  const remaining = calculations.remainingBalance ?? 0;
  const savings = calculations.currentSavings ?? profile.currentSavings ?? 0;
  const dti = calculations.dti ?? 0;

  const disclaimerNote = '\n\n*Educational Financial Planning: CreditLens AI responses are solely for informational purposes and do not constitute formal certified financial advice.*';

  // Smart rule-based fallback for starter questions or general financial questions
  const getFallbackReply = (msg) => {
    const q = (msg || '').toLowerCase();
    if (q.includes('improve') && q.includes('saving')) {
      return `To improve your monthly savings:\n\n1. **Automate on Payday**: Set up a recurring transfer of ₹${Math.round(income * 0.15).toLocaleString('en-IN')} (15% of your ₹${income.toLocaleString('en-IN')} income) immediately after salary credit.\n2. **Audit Discretionary Spend**: Your other expenses are ₹${otherExp.toLocaleString('en-IN')}/month. Cutting non-essential subscriptions and impulse purchases by 20% releases ~₹${Math.round(otherExp * 0.2).toLocaleString('en-IN')} monthly.\n3. **Debt Payoff**: As your ₹${totalEmis.toLocaleString('en-IN')} existing EMIs are retired, reallocate that cash directly to high-yield savings rather than lifestyle inflation.${disclaimerNote}`;
    }
    if (q.includes('afford another loan') || q.includes('can i afford')) {
      const maxRecommendedEmi = Math.max(0, Math.round(income * 0.4 - totalEmis));
      return `Based on your verified CreditLens profile:\n\n- **Monthly Income**: ₹${income.toLocaleString('en-IN')}\n- **Existing EMIs**: ₹${totalEmis.toLocaleString('en-IN')} (Current DTI: ${dti}%)\n- **Remaining Disposable Cashflow**: ₹${remaining.toLocaleString('en-IN')}/month\n\n**Affordability Assessment**:\n${remaining < 0 ? '❌ Taking another loan is **not recommended** right now because your monthly cashflow is in a deficit.' : dti >= 40 ? `⚠️ Caution: Your DTI is already ${dti}%, reaching the standard 40% banking safety ceiling.` : `✅ You can theoretically service an additional EMI of up to ~₹${maxRecommendedEmi.toLocaleString('en-IN')}/month while keeping your DTI within the safe 40% limit and preserving a ₹${Math.max(0, remaining - maxRecommendedEmi).toLocaleString('en-IN')} cash buffer.`}${disclaimerNote}`;
    }
    if (q.includes('reduce') && (q.includes('burden') || q.includes('debt'))) {
      return `Here are three proven steps to reduce your monthly financial burden:\n\n1. **Prepay High-Interest Debt**: Use the CreditLens Prepayment Simulator to see how small lump-sums reduce your tenure and save interest.\n2. **Consolidation / Refinancing**: Compare lender rates on our Interest Rates page. If current rates are lower than your ongoing loan rates, balance transfer could reduce your monthly EMI.\n3. **Trim Discretionary Outflows**: Review your ₹${otherExp.toLocaleString('en-IN')} monthly miscellaneous expenses to increase breathing room.${disclaimerNote}`;
    }
    if (q.includes('explain') && q.includes('situation')) {
      return `Here is a plain-English summary of your CreditLens financial profile:\n\n- **Income Inflow**: ₹${income.toLocaleString('en-IN')} per month.\n- **Living Outflows**: ₹${(livingExp + otherExp).toLocaleString('en-IN')} (₹${livingExp.toLocaleString('en-IN')} basic needs + ₹${otherExp.toLocaleString('en-IN')} other).\n- **Debt Commitments**: ₹${totalEmis.toLocaleString('en-IN')} per month across your ongoing loans.\n- **Remaining Cashflow**: ₹${remaining.toLocaleString('en-IN')} disposable surplus.\n- **Financial Health**: ${remaining > 0 && dti <= 35 ? 'Healthy and stable with comfortable debt serviceability.' : remaining > 0 ? 'Manageable, but monitor debt commitments carefully.' : 'Under pressure; monthly commitments exceed inflow.'}${disclaimerNote}`;
    }
    if (q.includes('consider before taking a loan') || q.includes('before taking a loan')) {
      return `Key factors to consider before taking on a new loan:\n\n1. **Debt-to-Income (DTI) Limit**: Ensure total monthly loan EMIs do not exceed 35–40% of income.\n2. **Tenure vs. Total Interest**: Shorter tenures mean higher monthly EMIs but drastically lower total interest paid.\n3. **Emergency Cushion**: Keep at least 3–6 months of living expenses plus EMI in liquid savings.\n4. **Fixed vs. Floating Rates**: Floating rates may rise during RBI benchmark rate hikes.\n5. **Foreclosure Terms**: Check for zero prepayment penalties on floating retail loans.${disclaimerNote}`;
    }
    return `Thank you for your question. Based on your CreditLens finances (Income: ₹${income.toLocaleString('en-IN')}, EMIs: ₹${totalEmis.toLocaleString('en-IN')}, Remaining Cashflow: ₹${remaining.toLocaleString('en-IN')}), maintaining strict DTI discipline under 40% and keeping an emergency cushion will keep your financial profile healthy.${disclaimerNote}`;
  };

  const ai = getGeminiClient();
  if (!ai) {
    return {
      success: true,
      fallback: true,
      reply: getFallbackReply(message)
    };
  }

  try {
    const formattedHistory = (history || []).slice(-6).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const systemInstruction = `You are "Ask CreditLens", the intelligent AI Financial Assistant for the CreditLens Loan Affordability & Repayment Planner.
Your role is to assist the authenticated borrower with budgeting, loan affordability, debt repayment strategies, EMIs, and financial planning.

USER VERIFIED FINANCIAL PROFILE:
- Monthly Net Income: ₹${income.toLocaleString('en-IN')}
- Living Expenses: ₹${livingExp.toLocaleString('en-IN')}
- Other Discretionary Expenses: ₹${otherExp.toLocaleString('en-IN')}
- Existing EMIs: ₹${totalEmis.toLocaleString('en-IN')}
- Net Remaining Monthly Balance: ₹${remaining.toLocaleString('en-IN')}
- Liquid Savings: ₹${savings.toLocaleString('en-IN')}
- Debt-to-Income Ratio: ${dti}%

CORE DIRECTIVES:
1. Always base financial answers on the user's verified figures above.
2. Never fabricate bank rates, personal data, or calculations.
3. If data is unconfigured (e.g. 0 or missing), clearly mention that the profile value is not set.
4. Provide structured, empathetic, and prudent financial guidance.
5. Do NOT claim to have modified, updated, or written to database records.
6. Always end your response with:
"\n\n*Educational Financial Planning: CreditLens AI responses are solely for informational purposes and do not constitute formal certified financial advice.*"`;

    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction,
        temperature: 0.4
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({ message });
    return {
      success: true,
      fallback: false,
      reply: response.text
    };
  } catch (error) {
    return {
      success: true,
      fallback: true,
      reply: getFallbackReply(message)
    };
  }
};
