/**
 * Request validation middleware for CreditLens API endpoints.
 * Returns consistent 400 Bad Request responses with descriptive error messages.
 */

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid full name.' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Please provide an email address.' });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email format.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
  }

  next();
};

export const validateLoanInputs = (req, res, next) => {
  const { principal, annualRate, tenureMonths } = req.body;

  if (principal !== undefined) {
    const p = Number(principal);
    if (isNaN(p) || p < 0) {
      return res.status(400).json({ success: false, message: 'Principal amount must be a non-negative number.' });
    }
  }

  if (annualRate !== undefined) {
    const r = Number(annualRate);
    if (isNaN(r) || r < 0 || r > 100) {
      return res.status(400).json({ success: false, message: 'Annual interest rate must be between 0% and 100%.' });
    }
  }

  if (tenureMonths !== undefined) {
    const n = Number(tenureMonths);
    if (isNaN(n) || n < 1 || n > 600) {
      return res.status(400).json({ success: false, message: 'Tenure must be between 1 and 600 months.' });
    }
  }

  next();
};

export const validateProfileInputs = (req, res, next) => {
  const { monthlyIncome, monthlyExpenses, otherExpenses, monthlySavingsTarget, currentSavings } = req.body;

  if (monthlyIncome !== undefined) {
    const inc = Number(monthlyIncome);
    if (isNaN(inc) || inc < 0) {
      return res.status(400).json({ success: false, message: 'Monthly income cannot be negative.' });
    }
  }

  if (monthlyExpenses !== undefined) {
    const exp = Number(monthlyExpenses);
    if (isNaN(exp) || exp < 0) {
      return res.status(400).json({ success: false, message: 'Living expenses cannot be negative.' });
    }
  }

  if (otherExpenses !== undefined) {
    const oExp = Number(otherExpenses);
    if (isNaN(oExp) || oExp < 0) {
      return res.status(400).json({ success: false, message: 'Other expenses cannot be negative.' });
    }
  }

  if (monthlySavingsTarget !== undefined) {
    const target = Number(monthlySavingsTarget);
    if (isNaN(target) || target < 0) {
      return res.status(400).json({ success: false, message: 'Savings target cannot be negative.' });
    }
  }

  if (currentSavings !== undefined) {
    const cur = Number(currentSavings);
    if (isNaN(cur) || cur < 0) {
      return res.status(400).json({ success: false, message: 'Current savings cannot be negative.' });
    }
  }

  next();
};

export const validateScenarioInputs = (req, res, next) => {
  const { name, principal, annualRate, tenureMonths } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Scenario name is required.' });
  }

  if (principal === undefined || isNaN(Number(principal)) || Number(principal) < 0) {
    return res.status(400).json({ success: false, message: 'Principal amount must be a non-negative number.' });
  }

  if (annualRate === undefined || isNaN(Number(annualRate)) || Number(annualRate) < 0 || Number(annualRate) > 100) {
    return res.status(400).json({ success: false, message: 'Annual interest rate must be between 0% and 100%.' });
  }

  if (tenureMonths === undefined || isNaN(Number(tenureMonths)) || Number(tenureMonths) < 1 || Number(tenureMonths) > 600) {
    return res.status(400).json({ success: false, message: 'Tenure must be between 1 and 600 months.' });
  }

  next();
};

export const validateAiAffordability = (req, res, next) => {
  const p = req.body.loan?.principal ?? req.body.principal;
  const r = req.body.loan?.annualRate ?? req.body.annualRate;
  const n = req.body.loan?.tenureMonths ?? req.body.tenureMonths;

  if (p !== undefined && (isNaN(Number(p)) || Number(p) < 0)) {
    return res.status(400).json({ success: false, message: 'Principal amount must be a non-negative number.' });
  }

  if (r !== undefined && (isNaN(Number(r)) || Number(r) < 0 || Number(r) > 100)) {
    return res.status(400).json({ success: false, message: 'Annual interest rate must be between 0% and 100%.' });
  }

  if (n !== undefined && (isNaN(Number(n)) || Number(n) < 1 || Number(n) > 600)) {
    return res.status(400).json({ success: false, message: 'Tenure must be between 1 and 600 months.' });
  }

  next();
};

export const validateAiComparison = (req, res, next) => {
  const loans = req.body.loans || req.body.options;

  if (!Array.isArray(loans) || loans.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of at least 2 loan options to compare.'
    });
  }

  next();
};
