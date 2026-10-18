import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from '../src/app.js';

describe('CreditLens Gemini AI Integration Tests', () => {
  test('GET /api/ai/status returns AI engine status and model info', async () => {
    const res = await request(app).get('/api/ai/status');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(typeof res.body.available, 'boolean');
    assert.strictEqual(res.body.model, process.env.GEMINI_MODEL || 'gemini-3.8-flash');
    assert.ok(Array.isArray(res.body.features));
  });

  test('POST /api/ai/explain-affordability generates structured financial explanation', async () => {
    const payload = {
      profile: {
        monthlyIncome: 85000,
        monthlyExpenses: 32000,
        otherExpenses: 3000,
        existingEmis: [{ name: 'Bike Loan', amount: 3500 }]
      },
      loan: {
        principal: 1000000,
        annualRate: 8.75,
        tenureMonths: 60
      }
    };

    const res = await request(app)
      .post('/api/ai/explain-affordability')
      .send(payload);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.loan.emi > 0, 'EMI must be computed deterministically');
    assert.ok(res.body.affordability.status, 'Affordability status must be computed');
    assert.ok(res.body.insight, 'Must return insight object');
    assert.ok(res.body.insight.summary, 'Insight must contain summary');
    assert.ok(Array.isArray(res.body.insight.actionableTips), 'Must contain actionable tips');
  });

  test('POST /api/ai/explain-comparison generates comparative trade-off analysis', async () => {
    const payload = {
      loans: [
        { name: '5-Year Standard', principal: 1000000, annualRate: 8.75, tenureMonths: 60 },
        { name: '3-Year Accelerated', principal: 1000000, annualRate: 8.50, tenureMonths: 36 }
      ],
      profile: {
        monthlyIncome: 90000,
        monthlyExpenses: 35000
      }
    };

    const res = await request(app)
      .post('/api/ai/explain-comparison')
      .send(payload);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.loans.length, 2);
    assert.ok(res.body.insight, 'Must return insight object');
    assert.ok(res.body.insight.summary, 'Insight must contain summary');
    assert.ok(res.body.insight.recommendation, 'Insight must contain recommendation');
  });

  test('POST /api/ai/explain-comparison rejects invalid loan count (< 2)', async () => {
    const res = await request(app)
      .post('/api/ai/explain-comparison')
      .send({ loans: [{ principal: 500000, annualRate: 8, tenureMonths: 36 }] });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/ai/explain-affordability rejects negative principal', async () => {
    const res = await request(app)
      .post('/api/ai/explain-affordability')
      .send({ loan: { principal: -10000 } });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('Missing API key provides graceful rule-based fallback without crashing', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post('/api/ai/explain-affordability')
        .send({
          loan: { principal: 500000, annualRate: 9.5, tenureMonths: 36 }
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.fallback, true);
      assert.ok(res.body.insight.summary);
      assert.ok(Array.isArray(res.body.insight.actionableTips));
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });
});
