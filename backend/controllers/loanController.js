/**
 * Loan Calculation Controller for CreditLens Backend.
 * Uses exact reducing-balance financial formulas.
 */

const calculateEMIHelper = (principal, annualRate, tenureMonths) => {
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  if (p === 0) return { emi: 0, totalInterest: 0, totalPayment: 0, principal: 0, tenureMonths: n, annualRate: rate };

  if (rate === 0) {
    const emi = p / n;
    return { emi: Math.round(emi), totalInterest: 0, totalPayment: p, principal: p, tenureMonths: n, annualRate: 0 };
  }

  const r = rate / 12 / 100;
  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);
  const roundedEmi = Math.round(emi);
  const totalPayment = roundedEmi * n;

  return {
    emi: roundedEmi,
    exactEmi: emi,
    totalInterest: Math.max(0, totalPayment - p),
    totalPayment,
    principal: p,
    tenureMonths: n,
    annualRate: rate
  };
};

export const calculateLoan = (req, res) => {
  const { principal, annualRate, tenureMonths } = req.body;
  const result = calculateEMIHelper(principal, annualRate, tenureMonths);
  res.json({ success: true, result });
};

export const generateSchedule = (req, res) => {
  const { principal, annualRate, tenureMonths } = req.body;
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  const emiData = calculateEMIHelper(p, rate, n);
  const r = rate > 0 ? rate / 12 / 100 : 0;

  let balance = p;
  const schedule = [];
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let month = 1; month <= n; month++) {
    let interestPayment = r > 0 ? balance * r : 0;
    let principalPayment = emiData.exactEmi ? emiData.exactEmi - interestPayment : emiData.emi - interestPayment;

    if (month === n || principalPayment >= balance) {
      principalPayment = balance;
      balance = 0;
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

  res.json({
    success: true,
    summary: {
      totalPrincipal: p,
      totalInterest: cumInterest,
      totalPaid: p + cumInterest,
      tenureMonths: schedule.length
    },
    schedule
  });
};

export const compareLoans = (req, res) => {
  const { loanA, loanB } = req.body;
  const resultA = calculateEMIHelper(loanA.principal, loanA.annualRate, loanA.tenureMonths);
  const resultB = calculateEMIHelper(loanB.principal, loanB.annualRate, loanB.tenureMonths);

  res.json({
    success: true,
    comparison: {
      loanA: { ...loanA, ...resultA },
      loanB: { ...loanB, ...resultB },
      differences: {
        emiDiff: resultB.emi - resultA.emi,
        interestDiff: resultB.totalInterest - resultA.totalInterest,
        totalDiff: resultB.totalPayment - resultA.totalPayment,
        cheaperOption: resultA.totalPayment <= resultB.totalPayment ? 'Scenario A' : 'Scenario B'
      }
    }
  });
};
