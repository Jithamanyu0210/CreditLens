process.env.NODE_ENV = 'test';

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../src/app.js';

describe('CreditLens REST API - Integration Tests', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_creditlens_fintech_key_change_in_production';

  // Helper to generate a valid test JWT token
  const createTestToken = (userId, name = 'Test User', email = 'test@creditlens.demo') => {
    return jwt.sign({ id: userId, name, email }, JWT_SECRET, { expiresIn: '1h' });
  };

  const userAToken = createTestToken('user_a_123', 'Alice User', 'alice@creditlens.demo');
  const userBToken = createTestToken('user_b_456', 'Bob User', 'bob@creditlens.demo');

  // 1. Health & Root Endpoints
  test('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  test('GET / returns educational FinTech disclaimer', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.disclaimer.includes('Educational'));
  });

  // 2. Loan Calculation APIs
  test('POST /api/loans/calculate-emi: Standard Reducing Balance EMI calculation', async () => {
    const res = await request(app)
      .post('/api/loans/calculate-emi')
      .send({ principal: 1000000, annualRate: 8.75, tenureMonths: 60 });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.result.principal, 1000000);
    assert.strictEqual(res.body.result.tenureMonths, 60);
    assert.ok(res.body.result.emi > 0, 'EMI must be positive');
    assert.ok(res.body.result.totalInterest > 0, 'Total interest must be positive');
  });

  test('POST /api/loans/calculate-emi: Zero interest loan financing', async () => {
    const res = await request(app)
      .post('/api/loans/calculate-emi')
      .send({ principal: 240000, annualRate: 0, tenureMonths: 24 });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.result.emi, 10000);
    assert.strictEqual(res.body.result.totalInterest, 0);
    assert.strictEqual(res.body.result.totalPayment, 240000);
  });

  test('POST /api/loans/calculate-emi: Rejects invalid negative principal and extreme rate', async () => {
    const res1 = await request(app)
      .post('/api/loans/calculate-emi')
      .send({ principal: -5000, annualRate: 10, tenureMonths: 12 });
    assert.strictEqual(res1.status, 400);

    const res2 = await request(app)
      .post('/api/loans/calculate-emi')
      .send({ principal: 50000, annualRate: 150, tenureMonths: 12 });
    assert.strictEqual(res2.status, 400);
  });

  test('POST /api/loans/amortization: Generates accurate month-by-month schedule', async () => {
    const res = await request(app)
      .post('/api/loans/amortization')
      .send({ principal: 500000, annualRate: 9.0, tenureMonths: 36 });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.summary.tenureMonths, 36);
    assert.strictEqual(res.body.schedule.length, 36);
    assert.strictEqual(res.body.schedule[35].balance, 0, 'Final balance must be zero');
  });

  test('POST /api/loans/affordability: Calculates DTI, remaining balance, and rule-based status', async () => {
    const res = await request(app)
      .post('/api/loans/affordability')
      .send({
        principal: 500000,
        annualRate: 8.5,
        tenureMonths: 60,
        monthlyIncome: 85000,
        monthlyExpenses: 32000,
        otherExpenses: 6000,
        existingEmis: [{ name: 'Bike', amount: 3500 }],
        monthlySavingsTarget: 15000
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.affordability.totalLivingAndOtherExpenses, 38000);
    assert.strictEqual(res.body.affordability.totalExistingEmis, 3500);
    assert.ok(res.body.affordability.remainingMonthlyBalance > 0);
    assert.ok(typeof res.body.affordability.status === 'string');
    assert.ok(Array.isArray(res.body.affordability.insights));
  });

  test('POST /api/loans/compare: Accepts 3 to 5 loan options and highlights key differences', async () => {
    const res = await request(app)
      .post('/api/loans/compare')
      .send({
        loans: [
          { id: 'l1', name: 'Option 1 (3Y)', principal: 600000, annualRate: 9.0, tenureMonths: 36 },
          { id: 'l2', name: 'Option 2 (5Y)', principal: 600000, annualRate: 9.5, tenureMonths: 60 },
          { id: 'l3', name: 'Option 3 (7Y)', principal: 600000, annualRate: 10.0, tenureMonths: 84 }
        ],
        profile: { monthlyIncome: 90000, monthlyExpenses: 35000 }
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 3);
    assert.ok(res.body.highlights.lowestEmiId);
    assert.ok(res.body.highlights.lowestInterestId);
  });

  // 3. Simulator Endpoints
  test('POST /api/simulators/max-loan: Returns maximum loan capacity within safe DTI ceiling', async () => {
    const res = await request(app)
      .post('/api/simulators/max-loan')
      .send({
        monthlyIncome: 100000,
        monthlyExpenses: 35000,
        otherExpenses: 5000,
        existingEmis: [{ amount: 5000 }],
        monthlySavingsTarget: 15000,
        annualRate: 8.5,
        tenureMonths: 60
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.result.maxPrincipal > 0);
    assert.strictEqual(res.body.result.message, null);
  });

  test('POST /api/simulators/max-loan: Returns clear message when budget is zero or negative', async () => {
    const res = await request(app)
      .post('/api/simulators/max-loan')
      .send({
        monthlyIncome: 40000,
        monthlyExpenses: 35000,
        otherExpenses: 10000, // Outflows 45,000 > income 40,000
        existingEmis: [],
        monthlySavingsTarget: 5000,
        annualRate: 9.0,
        tenureMonths: 60
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.result.maxPrincipal, 0);
    assert.ok(res.body.result.message.includes('No additional loan capacity'));
  });

  test('POST /api/simulators/prepayment: Compares original vs prepayment schedule', async () => {
    const res = await request(app)
      .post('/api/simulators/prepayment')
      .send({
        principal: 1000000,
        annualRate: 9.0,
        tenureMonths: 60,
        extraMonthlyPayment: 4000,
        lumpSumPayment: 50000,
        lumpSumMonth: 12
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.result.monthsSaved > 0);
    assert.ok(res.body.result.interestSaved > 0);
    assert.ok(Array.isArray(res.body.result.assumptions));
  });

  test('POST /api/simulators/emergency-fund: Calculates runway and shortfall without double counting', async () => {
    const res = await request(app)
      .post('/api/simulators/emergency-fund')
      .send({
        monthlyIncome: 85000,
        monthlyExpenses: 32000,
        otherExpenses: 6000,
        existingEmis: [{ amount: 4000 }],
        proposedEmi: 12000,
        currentSavings: 150000,
        targetMonths: 6
      });

    assert.strictEqual(res.status, 200);
    // Essential burn = 32000 + 6000 + 4000 + 12000 = 54000
    assert.strictEqual(res.body.result.essentialMonthlyExpenses, 54000);
    assert.strictEqual(res.body.result.targetEmergencyFund, 324000);
    assert.strictEqual(res.body.result.savingsShortfall, 174000);
  });

  // 4. Security & Protected Endpoints
  test('Protected routes reject requests without bearer token (401)', async () => {
    const res = await request(app).get('/api/profile');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('Protected routes reject requests with invalid token (401)', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid_bogus_token_123');
    assert.strictEqual(res.status, 401);
  });

  test('GET /api/profile: Successfully returns profile for authenticated user', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.profile);
    assert.strictEqual(typeof res.body.profile.otherExpenses, 'number');
  });

  test('POST /api/auth/logout: Successfully provides logout response', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  test('POST /api/auth/register: Validates input fields and rejects empty name/email/short password', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'notanemail', password: '123' });
    assert.strictEqual(res1.status, 400);

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Valid Name', email: 'valid@creditlens.demo', password: '123' }); // < 6 chars
    assert.strictEqual(res2.status, 400);
  });
});
