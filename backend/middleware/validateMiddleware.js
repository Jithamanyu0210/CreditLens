/**
 * Server-side Boundary Validation Middleware for CreditLens.
 * Enforces positive principals, rate boundaries (0-100%), and positive tenures.
 */

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
  const { monthlyIncome, monthlyExpenses } = req.body;

  if (monthlyIncome !== undefined) {
    const inc = Number(monthlyIncome);
    if (isNaN(inc) || inc <= 0) {
      return res.status(400).json({ success: false, message: 'Monthly income must be a positive number greater than 0.' });
    }
  }

  if (monthlyExpenses !== undefined) {
    const exp = Number(monthlyExpenses);
    if (isNaN(exp) || exp < 0) {
      return res.status(400).json({ success: false, message: 'Monthly expenses cannot be negative.' });
    }
  }

  next();
};
