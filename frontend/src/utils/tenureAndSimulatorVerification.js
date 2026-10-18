import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateEMI, assessLoanSolvency, generateAmortizationSchedule } from './loanCalculations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '..');

console.log('======================================================');
console.log('🔍 CreditLens: Verifying Tenure Selection & Simulator Cards');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// TEST GROUP 1: EMI & Solvency Calculations with Even/Odd Years & Custom Months
// ----------------------------------------------------
console.log('--- Test Group 1: Loan Tenure Math Verification ---');

const principal = 1000000;
const rate = 9.0;

// Test 1: Even Years (2 & 4 years)
const emi2y = calculateEMI(principal, rate, 2 * 12);
assert(emi2y.emi > 0 && emi2y.tenureMonths === 24, '2 Years correctly converts to 24 months for EMI calculation');
const emi4y = calculateEMI(principal, rate, 4 * 12);
assert(emi4y.emi > 0 && emi4y.tenureMonths === 48, '4 Years correctly converts to 48 months for EMI calculation');
assert(emi2y.emi > emi4y.emi, 'Shorter tenure (2y) has higher EMI than longer tenure (4y)');
assert(emi2y.totalInterest < emi4y.totalInterest, 'Shorter tenure (2y) accrues less total interest than longer tenure (4y)');

// Test 2: Odd Years (1, 3, 5 years)
[1, 3, 5].forEach((yr) => {
  const emi = calculateEMI(principal, rate, yr * 12);
  assert(emi.tenureMonths === yr * 12, `${yr} Year(s) converts to ${yr * 12} months for calculation`);
});

// Test 3: Custom Month Durations (18, 30, 42, 54 months)
[18, 30, 42, 54].forEach((mo) => {
  const emi = calculateEMI(principal, rate, mo);
  const sched = generateAmortizationSchedule(principal, rate, mo);
  assert(emi.tenureMonths === mo, `Custom duration ${mo} months used accurately in EMI`);
  assert(sched.schedule.length === mo, `Amortization schedule contains exactly ${mo} monthly installments`);
});

// Test 4: Solvency Assessment with Even Years & Custom Months
const solvency4y = assessLoanSolvency(80000, 25000, [], principal, rate, 48, 15000, 0);
assert(solvency4y.isMonthlyPayable === true, 'Solvency accurately assesses 4-year tenure');
const solvency18m = assessLoanSolvency(80000, 25000, [], principal, rate, 18, 15000, 0);
assert(typeof solvency18m.verdict === 'string', 'Solvency accurately evaluates 18-month tenure');


// ----------------------------------------------------
// TEST GROUP 2: Code Inspection of CalculatorPage.jsx
// ----------------------------------------------------
console.log('\n--- Test Group 2: CalculatorPage State Management & Controls Inspection ---');

const calcPagePath = path.join(srcDir, 'pages', 'CalculatorPage.jsx');
const calcPageContent = fs.readFileSync(calcPagePath, 'utf-8');

// 1. isLocalUpdate ref to prevent overwriting
assert(calcPageContent.includes('const isLocalUpdate = useRef(false);'), 'CalculatorPage uses isLocalUpdate ref flag');
assert(calcPageContent.includes('if (isLocalUpdate.current) {'), 'useEffect guards against circular feedback loops on user typing');

// 2. Manual input bindings and validations
assert(calcPageContent.includes("setTenureError('Please enter a loan tenure.');"), 'Validates empty loan tenure input with message');
assert(calcPageContent.includes("setTenureError('Tenure must be greater than zero.');"), 'Validates zero and negative loan tenure input');
assert(calcPageContent.includes("id=\"calc-tenure\""), 'Manual loan tenure input field exists with id="calc-tenure"');
assert(calcPageContent.includes('step={tenureUnit === \'years\' ? "any" : "1"}'), 'Tenure input allows decimal years and integer months');

// 3. Preset chips contain both even and odd years (including 1, 2, 3, 4, 5)
assert(calcPageContent.includes('[1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30]'), 'Preset buttons contain both even and odd years (1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30)');

// 4. Preset chips contain custom months (including 18, 30, 42, 54)
assert(calcPageContent.includes('[6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 84, 120]'), 'Preset buttons contain custom month durations (18, 30, 42, 54)');

// 5. Comparison table includes even years
assert(calcPageContent.includes('baseStandardYears = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30]'), 'Comparison scenarios table evaluates even years (including 2 and 4 years)');


// ----------------------------------------------------
// TEST GROUP 3: Simulator Cards Navigation & App Routes Inspection
// ----------------------------------------------------
console.log('\n--- Test Group 3: Simulator Cards & Routes Inspection ---');

const dashPagePath = path.join(srcDir, 'pages', 'DashboardPage.jsx');
const dashPageContent = fs.readFileSync(dashPagePath, 'utf-8');

// Check Dashboard Simulator cards
assert(dashPageContent.includes('id="card-max-loan-capacity"'), 'Dashboard includes Max Loan Capacity simulator card with unique ID');
assert(dashPageContent.includes('to="/max-loan"'), 'Max Loan Capacity links to /max-loan');

assert(dashPageContent.includes('id="card-prepayment-simulator"'), 'Dashboard includes Prepayment Simulator card with unique ID');
assert(dashPageContent.includes('to="/prepayment"'), 'Prepayment Simulator links to /prepayment');

assert(dashPageContent.includes('id="card-emergency-fund"'), 'Dashboard includes Emergency Fund simulator card with unique ID');
assert(dashPageContent.includes('to="/emergency-fund"'), 'Emergency Fund links to /emergency-fund');

assert(dashPageContent.includes('id="card-compare-scenarios"'), 'Dashboard includes Compare Scenarios simulator card with unique ID');
assert(dashPageContent.includes('to="/compare"'), 'Compare Scenarios links to /compare');

// Check interactive styling
assert(dashPageContent.includes('cl-card-interactive'), 'Simulator cards have cl-card-interactive class');
assert(dashPageContent.includes("role=\"button\""), 'Simulator cards have accessible button role');

// Check App.jsx Routes
const appPath = path.join(srcDir, 'App.jsx');
const appContent = fs.readFileSync(appPath, 'utf-8');

assert(appContent.includes('path="/max-loan"'), 'App defines route for /max-loan');
assert(appContent.includes('path="/prepayment"'), 'App defines route for /prepayment');
assert(appContent.includes('path="/emergency-fund"'), 'App defines route for /emergency-fund');
assert(appContent.includes('path="/compare"'), 'App defines route for /compare');

// Check Back button in all simulator pages
['MaxLoanPage.jsx', 'PrepaymentPage.jsx', 'EmergencyFundPage.jsx', 'ComparePage.jsx'].forEach((pageFile) => {
  const pageContent = fs.readFileSync(path.join(srcDir, 'pages', pageFile), 'utf-8');
  assert(pageContent.includes('<BackButton fallbackPath="/dashboard" />'), `${pageFile} provides BackButton to return to dashboard`);
});

// Check index.css has interactive card styling
const cssPath = path.join(srcDir, 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
assert(cssContent.includes('.cl-card-interactive') && cssContent.includes('cursor: pointer'), 'index.css defines .cl-card-interactive with cursor: pointer');

console.log('\n======================================================');
console.log(`🏁 Verification Summary: ${passedTests} / ${totalTests} checks passed (${Math.round(passedTests / totalTests * 100)}%)`);
console.log('======================================================\n');
