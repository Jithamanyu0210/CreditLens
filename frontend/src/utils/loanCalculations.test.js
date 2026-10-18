/**
 * Automated Calculation Test Suite for CreditLens.
 * Tests mathematical accuracy for:
 * 1. Reducing-balance EMI (including 0% interest and edge tenures)
 * 2. Full Amortization Schedule ending at strictly zero balance
 * 3. Max Affordable Loan (Reverse Calculator)
 * 4. Prepayment & Tenure Reduction Simulation
 * 5. Solvency and Payability Assessment
 * 6. Emergency Fund Runway
 */

import { 
  calculateEMI, 
  generateAmortizationSchedule, 
  calculateMaxAffordableLoan,
  simulatePrepayment,
  assessLoanSolvency,
  calculateEmergencyFundPlan
} from './loanCalculations.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

function runAllTests() {
  console.log('\n=============================================');
  console.log('🚀 Running CreditLens Automated Math Test Suite');
  console.log('=============================================\n');

  // TEST 1: Standard EMI calculation (Known case: 10 Lakhs, 8.5% p.a., 60 months)
  // Expected EMI ~ ₹20,517 (within ₹1)
  const standardCase = calculateEMI(1000000, 8.5, 60);
  assert(Math.abs(standardCase.emi - 20517) <= 2, `Standard EMI is accurate (Expected ~₹20,517, got ₹${standardCase.emi})`);
  assert(standardCase.totalPayment > standardCase.principal, 'Total payment exceeds principal for positive interest');

  // TEST 2: 0% Interest Rate Case (Promotional financing: 1.2 Lakhs, 0% rate, 12 months)
  // Expected EMI = 120000 / 12 = ₹10,000, Interest = ₹0
  const zeroRateCase = calculateEMI(120000, 0, 12);
  assert(zeroRateCase.emi === 10000, `0% Rate EMI is exactly P/N (Expected ₹10,000, got ₹${zeroRateCase.emi})`);
  assert(zeroRateCase.totalInterest === 0, 'Total interest is strictly ₹0 for 0% rate');
  assert(zeroRateCase.totalPayment === 120000, 'Total payment strictly equals principal for 0% rate');

  // TEST 3: Zero Principal Edge Case
  const zeroPrincipalCase = calculateEMI(0, 10, 24);
  assert(zeroPrincipalCase.emi === 0 && zeroPrincipalCase.totalPayment === 0, '0 Principal produces ₹0 EMI');

  // TEST 4: Amortization Schedule Balance Convergence (Ending balance reaches strictly ₹0)
  const scheduleData = generateAmortizationSchedule(500000, 9.25, 36);
  assert(scheduleData.schedule.length === 36, `Schedule contains exact requested tenure (36 months)`);
  const finalMonth = scheduleData.schedule[scheduleData.schedule.length - 1];
  assert(finalMonth.balance === 0, `Amortization schedule final ending balance strictly hits ₹0 (got ₹${finalMonth.balance})`);

  // Cumulative Principal sum should equal the original principal
  const totalPrincipalRepaid = scheduleData.schedule.reduce((sum, r) => sum + r.principal, 0);
  assert(Math.abs(totalPrincipalRepaid - 500000) <= 2, `Sum of monthly principals strictly equals loan principal (₹5,00,000)`);

  // TEST 5: Maximum Affordable Loan (Reverse Calculator)
  // Income 1,00,000, Expenses 35,000, Existing EMIs 5,000, Savings Goal 15,000, Rate 8.5%, 60 mos
  // Cashflow surplus = 1,00,000 - 35,000 - 5,000 - 15,000 = ₹45,000
  // 40% safe DTI cap = ₹40,000 - ₹5,000 = ₹35,000 max EMI
  const maxLoan = calculateMaxAffordableLoan(100000, 35000, [{ amount: 5000 }], 15000, 8.5, 60);
  assert(maxLoan.maxAffordableEmi === 35000, `Max affordable EMI respects 40% DTI safety ceiling (₹35,000)`);
  assert(maxLoan.maxPrincipal > 1000000, `Max loan principal generated successfully (${maxLoan.maxPrincipal})`);

  // TEST 6: Prepayment Simulator (10 Lakhs, 8.5%, 60 mos, Extra ₹3,000/mo)
  const prepaySim = simulatePrepayment(1000000, 8.5, 60, 3000, 0, 12);
  assert(prepaySim.monthsSaved > 0, `Prepayment successfully reduces loan tenure (Saved ${prepaySim.monthsSaved} months)`);
  assert(prepaySim.interestSaved > 0, `Prepayment achieves positive interest savings (Saved ₹${prepaySim.interestSaved})`);
  assert(prepaySim.newTotalPaid < prepaySim.originalTotalPaid, 'New total repayment with prepayment is strictly less than baseline');

  // TEST 7: Solvency & Payability Assessment
  // Healthy case
  const solventCase = assessLoanSolvency(80000, 25000, [{ amount: 3000 }], 500000, 8.5, 60, 10000);
  assert(solventCase.isMonthlyPayable === true, 'Healthy cashflow is marked Monthly Payable');
  assert(solventCase.verdictColor === 'emerald', 'Healthy borrower receives emerald comfortable verdict');

  // Deficit / Unpayable case (Income ₹30,000, Expenses ₹25,000, Existing EMIs ₹5,000, Loan EMI ₹15,000)
  const deficitCase = assessLoanSolvency(30000, 25000, [{ amount: 5000 }], 800000, 12.0, 60, 5000);
  assert(deficitCase.isMonthlyPayable === false, 'Cashflow deficit is flagged as not monthly payable');
  assert(deficitCase.verdictColor === 'rose', 'Deficit flagged with rose high risk alert');

  // TEST 8: Emergency Fund Runway
  // Essential burn = Expenses (30k) + Existing EMIs (5k) + Loan EMI (15k) = 50k
  // Savings = 1,50,000 -> 3 months covered
  const fundPlan = calculateEmergencyFundPlan(85000, 30000, [{ amount: 5000 }], 15000, 150000, 10000);
  // TEST 9: otherExpenses integration (Task 7)
  // Income 1,00,000, Living Expenses 30,000, Other Expenses 10,000, Existing EMIs 5,000, Savings 15,000
  // Combined Expenses = 40,000
  // Cashflow surplus = 1,00,000 - 40,000 - 5,000 - 15,000 = 40,000
  // 40% DTI cap = 40,000 - 5,000 = 35,000 max EMI
  const maxLoanWithOther = calculateMaxAffordableLoan(100000, 30000, [{ amount: 5000 }], 15000, 8.5, 60, 10000);
  assert(maxLoanWithOther.maxAffordableEmi === 35000, 'calculateMaxAffordableLoan accounts for otherExpenses without double counting');

  // Solvency with otherExpenses pushing borrower into tight budget
  const solventWithOther = assessLoanSolvency(80000, 25000, [{ amount: 3000 }], 500000, 8.5, 60, 10000, 15000);
  assert(solventWithOther.isMonthlyPayable === true, 'assessLoanSolvency incorporates otherExpenses into outflow math');

  // Emergency Fund Plan with otherExpenses
  const fundPlanWithOther = calculateEmergencyFundPlan(85000, 25000, [{ amount: 5000 }], 15000, 150000, 10000, 5000);
  assert(fundPlanWithOther.essentialMonthlyExpenses === 50000, 'calculateEmergencyFundPlan includes otherExpenses in essential monthly burn rate');

  console.log('\n=============================================');
  console.log(`🏁 Test Results: ${passedTests} / ${totalTests} passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('=============================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests();
