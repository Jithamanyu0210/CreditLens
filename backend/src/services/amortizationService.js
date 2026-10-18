import { calculateEMI } from './emiService.js';

/**
 * Generates an accurate month-by-month reducing-balance amortization schedule.
 * Handles final month reconciliation so closing balance hits exactly 0 without negative balances.
 */
export const generateAmortizationSchedule = (principal, annualRate, tenureMonths) => {
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  const emiData = calculateEMI(p, rate, n);
  const r = rate > 0 ? rate / 12 / 100 : 0;

  let balance = p;
  const schedule = [];
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let month = 1; month <= n; month++) {
    const openingBalance = Math.round(balance);
    const interestPayment = r > 0 ? balance * r : 0;
    let principalPayment = emiData.exactEmi 
      ? emiData.exactEmi - interestPayment 
      : emiData.emi - interestPayment;

    // Last month or if principal repayment would exceed balance
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
      openingBalance,
      emi: roundedEmi,
      principal: roundedPrincipal,
      interest: roundedInterest,
      balance: Math.round(balance),
      cumPrincipal,
      cumInterest
    });

    if (balance === 0) break;
  }

  return {
    summary: {
      totalPrincipal: p,
      totalInterest: cumInterest,
      totalPaid: p + cumInterest,
      tenureMonths: schedule.length
    },
    schedule
  };
};
