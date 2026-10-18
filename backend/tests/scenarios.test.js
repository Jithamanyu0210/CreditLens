process.env.NODE_ENV = 'test';

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../src/app.js';

describe('CreditLens Scenarios & Multi-User Isolation Tests', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_creditlens_fintech_key_change_in_production';

  const userA = { id: '60d5ec49f1b2c8b1f8e4e1a1', name: 'User A', email: 'usera@creditlens.demo' };
  const userB = { id: '60d5ec49f1b2c8b1f8e4e1b2', name: 'User B', email: 'userb@creditlens.demo' };

  const tokenA = jwt.sign(userA, JWT_SECRET, { expiresIn: '1h' });
  const tokenB = jwt.sign(userB, JWT_SECRET, { expiresIn: '1h' });

  let savedScenarioId = null;

  test('POST /api/scenarios: Validates input fields and saves scenario for authenticated user', async () => {
    const res = await request(app)
      .post('/api/scenarios')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Dream Home Loan',
        principal: 2500000,
        annualRate: 8.5,
        tenureMonths: 180,
        notes: '15-year fixed loan'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.scenario.name, 'Dream Home Loan');
    assert.strictEqual(res.body.scenario.principal, 2500000);
    assert.ok(res.body.scenario.emi > 0, 'EMI must be calculated and saved');
    savedScenarioId = res.body.scenario._id || res.body.scenario.id;
  });

  test('POST /api/scenarios: Rejects empty name and invalid principal', async () => {
    const res1 = await request(app)
      .post('/api/scenarios')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: '', principal: 100000, annualRate: 8.5, tenureMonths: 60 });
    assert.strictEqual(res1.status, 400);

    const res2 = await request(app)
      .post('/api/scenarios')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Car Loan', principal: -100, annualRate: 8.5, tenureMonths: 60 });
    assert.strictEqual(res2.status, 400);
  });

  test('GET /api/scenarios: Authenticated user retrieves their saved scenarios', async () => {
    const res = await request(app)
      .get('/api/scenarios')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.scenarios.length >= 1);
  });

  test('POST /api/scenarios/:id/duplicate: Duplicates scenario with (Copy) label', async () => {
    assert.ok(savedScenarioId, 'Saved scenario ID must exist from previous step');
    const res = await request(app)
      .post(`/api/scenarios/${savedScenarioId}/duplicate`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.scenario.name.includes('(Copy)'));
    assert.strictEqual(res.body.scenario.principal, 2500000);
  });

  test('GET /api/scenarios: Unauthenticated requests are rejected with 401', async () => {
    const res = await request(app).get('/api/scenarios');
    assert.strictEqual(res.status, 401);
  });

  test('Cross-user isolation: User B cannot access or modify User A scenario', async () => {
    assert.ok(savedScenarioId, 'Saved scenario ID must exist');
    // User B attempts to get User A's scenario
    const resGet = await request(app)
      .get(`/api/scenarios/${savedScenarioId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert.strictEqual(resGet.status, 404, 'Must return 404 when accessed by different user');

    // User B attempts to delete User A's scenario
    const resDel = await request(app)
      .delete(`/api/scenarios/${savedScenarioId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert.strictEqual(resDel.status, 404, 'Must reject unauthorized deletion with 404');
  });

  test('DELETE /api/scenarios/:id: Owner can successfully delete their scenario', async () => {
    assert.ok(savedScenarioId, 'Saved scenario ID must exist');
    const res = await request(app)
      .delete(`/api/scenarios/${savedScenarioId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});
