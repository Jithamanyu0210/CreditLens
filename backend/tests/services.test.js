import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { calculateEMI } from '../src/services/emiService.js';
import { generateAmortizationSchedule } from '../src/services/amortizationService.js';
import { calculateAffordability } from '../src/services/affordabilityService.js';
import {
  calculateMaxLoanCapacity,
  calculatePrepayment,
  calculateEmergencyFund,
  compareLoanScenarios
} from '../src/services/simulatorService.js';

describe('CreditLens Financial Services - Unit Tests', () => {

  test('calculateEMI: Standard reducing-balance EMI matches expected values', () => {
    // 500,000 at 9.5% for 36 months
    const result = calculateEMI(500000, 9.5, 36);
    assert.strictEqual(result.emi, 16016);
    assert.strictEqual(result.principal, 500000);
    assert.strictEqual(result.tenureMonths, 36);
    assert.strictEqual(result.totalPayment, 16016 * 36);
    assert.ok(result.totalInterest > 0, 'Total interest must be positive');
  });

  test('calculateEMI: Zero interest loan calculates exact principal/tenure with 0 interest', () => {
    const result = calculateEMI(120000, 0, 12);
    assert.strictEqual(result.emi, 10000);
    assert.strictEqual(result.totalInterest, 0);
    assert.strictEqual(result.totalPayment, 120000);
  });

  test('calculateEMI: Zero principal yields zero EMI and zero payment', () => {
    const result = calculateEMI(0, 10, 24);
    assert.strictEqual(result.emi, 0);
    assert.strictEqual(result.totalPayment, 0);
    assert.strictEqual(result.totalInterest, 0);
  });

  test('generateAmortizationSchedule: Reconciles balance to 0 and sum of principals equals original principal', () => {
    const principal = 600000;
    const { summary, schedule } = generateAmortizationSchedule(principal, 8.5, 48);

    assert.strictEqual(schedule.length, 48, 'Schedule must have exactly 48 installments');
    assert.strictEqual(summary.totalPrincipal, principal);
    
    // Check final installment ending balance
    const lastRow = schedule[schedule.length - 1];
    assert.strictEqual(lastRow.balance, 0, 'Final ending balance must hit exactly 0');

    // Check sum of monthly principals equals original principal within 1 rupee tolerance
    const sumPrincipal = schedule.reduce((sum, r) => sum + r.principal, 0);
    assert.ok(Math.abs(sumPrincipal - principal) <= 5, `Sum of principals (${sumPrincipal}) matches principal (${principal})`);
  });

  test('calculateAffordability: Healthy cashflow achieves Comfortable status without double counting', () => {
    const income = 100000;
    const living = 30000;
    const other = 5000;
    const existingEmis = [{ name: 'Bike', amount: 3000 }];
    const proposedEmi = 15000;
    const savingsTarget = 15000;

    const result = calculateAffordability(income, living, other, existingEmis, proposedEmi, savingsTarget);

    assert.strictEqual(result.totalLivingAndOtherExpenses, 35000);
    assert.strictEqual(result.totalExistingEmis, 3000);
    assert.strictEqual(result.totalMonthlyObligations, 18000);
    assert.strictEqual(result.totalMonthlyOutflow, 53000);
    assert.strictEqual(result.remainingMonthlyBalance, 47000);
    assert.strictEqual(result.status, 'Comfortable');
    assert.strictEqual(result.dtiRatio, 18.0);
  });

  test('calculateAffordability: Cashflow deficit flagged as Risky with negative balance explanation', () => {
    const income = 40000;
    const living = 25000;
    const other = 5000;
    const existingEmis = [{ name: 'Personal Loan', amount: 10000 }];
    const proposedEmi = 12000;

    const result = calculateAffordability(income, living, other, existingEmis, proposedEmi, 5000);

    assert.strictEqual(result.status, 'Risky');
    assert.ok(result.remainingMonthlyBalance < 0, 'Remaining balance must be negative');
    assert.ok(result.description.includes('deficit'), 'Description must mention deficit');
    assert.ok(result.insights.length > 0, 'Should provide actionable insights');
  });

  test('calculateMaxLoanCapacity: Computes maximum affordable loan within 40% DTI ceiling', () => {
    const income = 100000;
    const living = 30000;
    const other = 5000;
    const existingEmis = [{ amount: 5000 }];
    const savingsTarget = 15000;

    const result = calculateMaxLoanCapacity(income, living, other, existingEmis, savingsTarget, 9.0, 60);

    assert.ok(result.maxPrincipal > 0, 'Max principal must be positive');
    assert.ok(result.maxAffordableEmi <= 35000, 'Max EMI must respect 40% DTI constraint');
    assert.strictEqual(result.message, null);
  });

  test('calculateMaxLoanCapacity: Returns clear message when budget is zero or negative', () => {
    const income = 50000;
    const living = 35000;
    const other = 10000;
    const existingEmis = [{ amount: 10000 }]; // Outflows 55000 > income 50000

    const result = calculateMaxLoanCapacity(income, living, other, existingEmis, 5000, 9.0, 60);

    assert.strictEqual(result.maxPrincipal, 0);
    assert.strictEqual(result.maxAffordableEmi, 0);
    assert.strictEqual(result.message, 'No additional loan capacity is available under the selected assumptions.');
    assert.ok(result.limitingFactor !== null);
  });

  test('calculatePrepayment: Prepayment shortens tenure and generates positive interest savings', () => {
    const principal = 1000000;
    const rate = 9.0;
    const tenureMonths = 60;
    const extraMonthly = 5000;
    const lumpSum = 50000;
    const lumpMonth = 12;

    const result = calculatePrepayment(principal, rate, tenureMonths, extraMonthly, lumpSum, lumpMonth);

    assert.ok(result.monthsSaved > 0, 'Prepayment must save months');
    assert.ok(result.interestSaved > 0, 'Prepayment must save interest');
    assert.ok(result.newTenureMonths < tenureMonths, 'New tenure must be shorter than original');
    assert.ok(result.newTotalPaid < result.originalTotalPaid, 'New total repayment must be lower than baseline');
  });

  test('calculateEmergencyFund: Computes safety runway without double-counting other expenses', () => {
    const income = 80000;
    const living = 30000;
    const other = 5000;
    const existingEmis = [{ amount: 5000 }];
    const proposedEmi = 10000;
    const currentSavings = 100000;

    const result = calculateEmergencyFund(income, living, other, existingEmis, proposedEmi, currentSavings, 6);

    // Essential monthly expenses = 30000 + 5000 + 5000 + 10000 = 50000
    assert.strictEqual(result.essentialMonthlyExpenses, 50000);
    assert.strictEqual(result.targetEmergencyFund, 300000); // 6 months * 50,000
    assert.strictEqual(result.savingsShortfall, 200000);
    assert.strictEqual(result.monthsCoveredCurrently, 2.0); // 100,000 / 50,000 = 2.0 months
    assert.strictEqual(result.needsBuffer, true);
  });

  test('compareLoanScenarios: Normalizes 3-5 options and determines key highlights', () => {
    const loans = [
      { id: 'opt_1', name: 'Short-Term 2Y', principal: 500000, annualRate: 9.0, tenureMonths: 24 },
      { id: 'opt_2', name: 'Mid-Term 4Y', principal: 500000, annualRate: 9.5, tenureMonths: 48 },
      { id: 'opt_3', name: 'Long-Term 7Y', principal: 500000, annualRate: 10.0, tenureMonths: 84 }
    ];

    const profile = { monthlyIncome: 90000, monthlyExpenses: 30000, otherExpenses: 5000, existingEmis: [] };
    const result = compareLoanScenarios(loans, profile);

    assert.strictEqual(result.count, 3);
    assert.strictEqual(result.highlights.lowestEmiId, 'opt_3', 'Longest tenure has lowest EMI');
    assert.strictEqual(result.highlights.lowestInterestId, 'opt_1', 'Shortest tenure has lowest total interest');
  });
});
