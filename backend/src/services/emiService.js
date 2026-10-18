/**
 * Reducing-balance EMI calculation service.
 * Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * Zero-interest loans: EMI = P / n
 */
export const calculateEMI = (principal, annualRate, tenureMonths) => {
  const p = Math.max(0, Number(principal) || 0);
  const rate = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

  if (p === 0) {
    return {
      emi: 0,
      exactEmi: 0,
      totalInterest: 0,
      totalPayment: 0,
      principal: 0,
      tenureMonths: n,
      annualRate: rate
    };
  }

  // Handle 0% interest loan financing
  if (rate === 0) {
    const emi = p / n;
    return {
      emi: Math.round(emi),
      exactEmi: emi,
      totalInterest: 0,
      totalPayment: p,
      principal: p,
      tenureMonths: n,
      annualRate: 0
    };
  }

  const r = rate / 12 / 100;
  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);
  const roundedEmi = Math.round(emi);
  const totalPayment = roundedEmi * n;
  const totalInterest = Math.max(0, totalPayment - p);

  return {
    emi: roundedEmi,
    exactEmi: emi,
    totalInterest,
    totalPayment,
    principal: p,
    tenureMonths: n,
    annualRate: rate
  };
};
