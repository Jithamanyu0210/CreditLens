import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('CreditLens Bank Interest Rate Comparison Feature Tests', () => {
  const MANDATORY_DISCLAIMER =
    "Interest rates shown are indicative and subject to change. Actual rates, eligibility and charges depend on the bank's current terms and the applicant's financial profile. Please verify the final offer directly with the bank.";

  let sampleRateId = null;

  test('GET /api/bank-rates: Returns 200 with verified bank rates and mandatory disclaimer', async () => {
    const res = await request(app).get('/api/bank-rates');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.disclaimer, MANDATORY_DISCLAIMER);
    assert.ok(Array.isArray(res.body.data), 'Data should be an array of bank rates');
    assert.ok(res.body.data.length >= 19, 'Should contain at least 19 verified bank rate entries');

    // Save one rate ID for single retrieval tests
    sampleRateId = res.body.data[0]._id;
    assert.ok(sampleRateId, 'Rate must have an _id or identifier');
    assert.ok(res.body.data[0].bankName, 'Rate must have bankName');
    assert.ok(res.body.data[0].sourceUrl, 'Rate must have official sourceUrl');
    assert.ok(res.body.data[0].minRate > 0, 'Rate must have minRate');
  });

  test('GET /api/bank-rates?loanType=home: Filters strictly to home loans', async () => {
    const res = await request(app).get('/api/bank-rates?loanType=home');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0, 'Should find home loan rates');
    for (const item of res.body.data) {
      assert.strictEqual(item.loanCategory, 'home');
    }
  });

  test('GET /api/bank-rates?loanType=personal: Filters strictly to personal loans', async () => {
    const res = await request(app).get('/api/bank-rates?loanType=personal');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0, 'Should find personal loan rates');
    for (const item of res.body.data) {
      assert.strictEqual(item.loanCategory, 'personal');
    }
  });

  test('GET /api/bank-rates?bank=sbi: Filters by bank code / bank name', async () => {
    const res = await request(app).get('/api/bank-rates?bank=sbi');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0, 'Should return SBI loans');
    for (const item of res.body.data) {
      assert.ok(
        item.bankCode.toLowerCase() === 'sbi' || item.bankName.includes('State Bank'),
        'Must belong to State Bank of India'
      );
    }
  });

  test('GET /api/bank-rates?bankType=Public Sector: Filters by public sector banks', async () => {
    const res = await request(app).get('/api/bank-rates?bankType=Public Sector');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0, 'Should find public sector bank rates');
    for (const item of res.body.data) {
      assert.strictEqual(item.bankType, 'Public Sector');
    }
  });

  test('GET /api/bank-rates?search=hdfc: Searches banks by keyword', async () => {
    const res = await request(app).get('/api/bank-rates?search=hdfc');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0, 'Should return HDFC rates');
    for (const item of res.body.data) {
      assert.ok(
        item.bankName.toLowerCase().includes('hdfc') ||
        item.schemeName.toLowerCase().includes('hdfc') ||
        (item.notes && item.notes.toLowerCase().includes('hdfc')),
        'Match must relate to HDFC'
      );
    }
  });

  test('GET /api/bank-rates?sortBy=minRate&sortOrder=asc: Returns sorted ascending rates', async () => {
    const res = await request(app).get('/api/bank-rates?loanType=home&sortBy=minRate&sortOrder=asc');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length >= 2);

    for (let i = 0; i < res.body.data.length - 1; i++) {
      assert.ok(
        res.body.data[i].minRate <= res.body.data[i + 1].minRate,
        `Rates must be non-decreasing: ${res.body.data[i].minRate} <= ${res.body.data[i + 1].minRate}`
      );
    }
  });

  test('GET /api/bank-rates/categories: Returns list of retail loan categories with count', async () => {
    const res = await request(app).get('/api/bank-rates/categories');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.categories), 'Should return categories array');

    const catIds = res.body.categories.map((c) => c.id);
    assert.ok(catIds.includes('home'), 'Must include home');
    assert.ok(catIds.includes('personal'), 'Must include personal');
    assert.ok(catIds.includes('car'), 'Must include car');
    assert.ok(catIds.includes('education'), 'Must include education');
    assert.ok(catIds.includes('two_wheeler'), 'Must include two_wheeler');
    assert.ok(catIds.includes('gold'), 'Must include gold');
  });

  test('GET /api/bank-rates/:id: Returns single rate details', async () => {
    assert.ok(sampleRateId, 'Sample rate ID must be defined from earlier test');
    const res = await request(app).get(`/api/bank-rates/${sampleRateId}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(String(res.body.data._id), String(sampleRateId));
    assert.ok(res.body.data.bankName);
    assert.ok(res.body.data.sourceUrl);
  });

  test('GET /api/bank-rates/invalid_id_9999: Returns 404 for nonexistent rate', async () => {
    const res = await request(app).get('/api/bank-rates/invalid_id_9999');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/bank-rates & PUT /api/bank-rates/:id: Controlled rate entry and update', async () => {
    // 1. Create a rate
    const createRes = await request(app)
      .post('/api/bank-rates')
      .send({
        bankName: 'Test Verification Bank',
        bankCode: 'testbank',
        bankType: 'Private Sector',
        loanCategory: 'home',
        loanCategoryName: 'Home Loan',
        schemeName: 'Test Verified Housing',
        minRate: 8.45,
        maxRate: 9.20,
        rateType: 'Floating',
        sourceUrl: 'https://testbank.bank.in/rates',
        status: 'Verified',
        processingFee: '0.25% + GST'
      });

    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.body.success, true);
    const newId = createRes.body.data._id;
    assert.ok(newId);

    // 2. Update the rate
    const updateRes = await request(app)
      .put(`/api/bank-rates/${newId}`)
      .send({
        minRate: 8.35,
        notes: 'Updated rate following new RBI repo rate announcement'
      });

    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.success, true);
    assert.strictEqual(updateRes.body.data.minRate, 8.35);
  });

  test('GET /api/bank-rates/banks: Returns distinct list of 19+ Indian banks', async () => {
    const res = await request(app).get('/api/bank-rates/banks');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 19, 'Should return at least 19 banks');

    const bankCodes = res.body.data.map((b) => b.bankCode);
    assert.ok(bankCodes.includes('sbi'), 'Must include SBI');
    assert.ok(bankCodes.includes('hdfc'), 'Must include HDFC');
    assert.ok(bankCodes.includes('icici'), 'Must include ICICI');
    assert.ok(bankCodes.includes('pnb'), 'Must include PNB');
  });

  test('GET /api/bank-rates/search: Exact match for SBI Car Loan', async () => {
    const res = await request(app).get('/api/bank-rates/search?bank=sbi&loanType=car');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.found, true);
    assert.strictEqual(res.body.data.loanCategory, 'car');
    assert.strictEqual(res.body.data.bankCode, 'sbi');
    assert.ok(res.body.data.minRate >= 8.5 && res.body.data.minRate <= 9.0);
    assert.ok(res.body.data.sourceUrl.includes('sbi.bank.in'));
    assert.strictEqual(res.body.disclaimer, MANDATORY_DISCLAIMER);
  });

  test('GET /api/bank-rates/search: Exact match for HDFC Bank Home Loan', async () => {
    const res = await request(app).get('/api/bank-rates/search?bank=HDFC%20Bank&loanType=home');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.found, true);
    assert.strictEqual(res.body.data.loanCategory, 'home');
    assert.strictEqual(res.body.data.bankCode, 'hdfc');
    assert.ok(res.body.data.sourceUrl.includes('hdfc'));
  });

  test('GET /api/bank-rates/search: Returns Rate Not Available when bank does not offer category', async () => {
    const res = await request(app).get('/api/bank-rates/search?bank=Indian%20Overseas%20Bank&loanType=education');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.found, false);
    assert.strictEqual(res.body.status, 'Rate not available');
    assert.strictEqual(res.body.data, null);
    assert.ok(res.body.message.includes('Rate not available'));
  });

  test('GET /api/bank-rates/search: Rejects request with missing bank or loanType', async () => {
    const res1 = await request(app).get('/api/bank-rates/search?bank=sbi');
    assert.strictEqual(res1.status, 400);

    const res2 = await request(app).get('/api/bank-rates/search?loanType=home');
    assert.strictEqual(res2.status, 400);
  });
});
