import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { FinancialProfile } from '../src/models/FinancialProfile.js';
import { LoanScenario } from '../src/models/LoanScenario.js';
import { calculateEMI } from '../src/services/emiService.js';

describe('CreditLens MongoDB Atlas Live Integration Tests', () => {
  let testUser = null;
  let testProfile = null;
  let testScenario = null;
  let dbAvailable = false;

  before(async () => {
    const conn = await connectDB();
    dbAvailable = !!conn && mongoose.connection.readyState === 1;

    if (!dbAvailable) {
      console.warn('\n⚠️  [Atlas Live Test Advisory] MongoDB Atlas is currently unreachable from this IP.');
      console.warn('   [Root Cause] MongoDB Atlas Network Access restricts connections. TLS handshake rejected (Alert 80).');
      console.warn('   [Action] Whitelist machine IP or 0.0.0.0/0 in MongoDB Atlas -> Security -> Network Access to run live queries.\n');
    }
  });

  after(async () => {
    if (dbAvailable && testUser && testUser._id) {
      await LoanScenario.deleteMany({ userId: testUser._id });
      await FinancialProfile.deleteMany({ userId: testUser._id });
      await User.deleteOne({ _id: testUser._id });
    }
    await disconnectDB();
  });

  test('1. Verify Atlas connection and database name', (t) => {
    if (!dbAvailable) {
      t.skip('Skipped: MongoDB Atlas is offline or machine IP is not in Atlas Network Access whitelist.');
      return;
    }
    assert.strictEqual(mongoose.connection.readyState, 1);
    assert.ok(mongoose.connection.host.includes('mongodb.net') || mongoose.connection.host.includes('127.0.0.1'));
    console.log(`   [Test Log] Connected to cluster host: ${mongoose.connection.host}, database: ${mongoose.connection.name}`);
  });

  test('2. User registration and authentication model in Atlas', async (t) => {
    if (!dbAvailable) {
      t.skip('Skipped: MongoDB Atlas is offline.');
      return;
    }
    const uniqueEmail = `atlas_verify_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@creditlens.demo`;
    testUser = await User.create({
      name: 'Atlas Test User',
      email: uniqueEmail,
      password: 'SecurePassword123!'
    });

    assert.ok(testUser._id, 'User must have a MongoDB ObjectId');
    assert.strictEqual(testUser.email, uniqueEmail);

    // Verify password hashing
    assert.notStrictEqual(testUser.password, 'SecurePassword123!');
    const isMatch = await testUser.matchPassword('SecurePassword123!');
    assert.strictEqual(isMatch, true, 'Password match check must return true');

    const publicJson = testUser.toPublicJSON();
    assert.strictEqual(publicJson.password, undefined, 'Password must not be in public JSON');
  });

  test('3. Connect and save Financial Profile with monthly expenses in Atlas', async (t) => {
    if (!dbAvailable) {
      t.skip('Skipped: MongoDB Atlas is offline.');
      return;
    }
    assert.ok(testUser && testUser._id, 'Prerequisite user must exist');

    testProfile = await FinancialProfile.create({
      userId: testUser._id,
      monthlyIncome: 95000,
      monthlyExpenses: 34000,
      otherExpenses: 4500,
      monthlySavingsTarget: 20000,
      currentSavings: 250000,
      existingEmis: [
        {
          name: 'Vehicle Loan',
          amount: 4500,
          balance: 60000,
          annualRate: 10.5,
          remainingMonths: 14
        }
      ]
    });

    assert.ok(testProfile._id, 'Profile must have a MongoDB ObjectId');
    assert.strictEqual(testProfile.monthlyIncome, 95000);
    assert.strictEqual(testProfile.monthlyExpenses, 34000);
    assert.strictEqual(testProfile.otherExpenses, 4500);
    assert.strictEqual(testProfile.totalLivingAndOtherExpenses, 38500);
    assert.strictEqual(testProfile.totalExistingEmisAmount, 4500);
  });

  test('4. Update monthly expenses in Atlas and verify persistence', async (t) => {
    if (!dbAvailable) {
      t.skip('Skipped: MongoDB Atlas is offline.');
      return;
    }
    const updated = await FinancialProfile.findOneAndUpdate(
      { userId: testUser._id },
      { $set: { monthlyExpenses: 36500 } },
      { new: true }
    );

    assert.strictEqual(updated.monthlyExpenses, 36500);
    assert.strictEqual(updated.totalLivingAndOtherExpenses, 41000);

    // Query fresh from Atlas to confirm persistence
    const fetched = await FinancialProfile.findOne({ userId: testUser._id });
    assert.strictEqual(fetched.monthlyExpenses, 36500);
  });

  test('5. Create, calculate EMI, and save Loan Scenario in Atlas', async (t) => {
    if (!dbAvailable) {
      t.skip('Skipped: MongoDB Atlas is offline.');
      return;
    }
    const principal = 1200000;
    const rate = 8.75;
    const tenure = 60;
    const emiCalc = calculateEMI(principal, rate, tenure);

    testScenario = await LoanScenario.create({
      userId: testUser._id,
      name: 'Atlas Test Scenario - New Car',
      principal,
      annualRate: rate,
      tenureMonths: tenure,
      tenureUnit: 'years',
      emi: emiCalc.emi,
      totalInterest: emiCalc.totalInterest,
      totalPayment: emiCalc.totalPayment,
      notes: 'Testing live Atlas scenario persistence',
      tags: ['Automobile', 'Personal']
    });

    assert.ok(testScenario._id, 'Scenario must have a MongoDB ObjectId');
    assert.strictEqual(testScenario.principal, 1200000);
    assert.ok(testScenario.emi > 0, 'EMI must be positive and computed');
    assert.strictEqual(testScenario.name, 'Atlas Test Scenario - New Car');

    // Query scenarios for user
    const scenarios = await LoanScenario.find({ userId: testUser._id }).sort({ createdAt: -1 });
    assert.strictEqual(scenarios.length, 1);
    assert.strictEqual(scenarios[0].name, 'Atlas Test Scenario - New Car');
  });

  test('6. Duplicate and delete scenario in Atlas', async (t) => {
    if (!dbAvailable) {
      t.skip('Skipped: MongoDB Atlas is offline.');
      return;
    }
    const emiCalc = calculateEMI(testScenario.principal, testScenario.annualRate, testScenario.tenureMonths);
    const copy = await LoanScenario.create({
      userId: testUser._id,
      name: `${testScenario.name} (Copy)`,
      principal: testScenario.principal,
      annualRate: testScenario.annualRate,
      tenureMonths: testScenario.tenureMonths,
      tenureUnit: testScenario.tenureUnit,
      emi: emiCalc.emi,
      totalInterest: emiCalc.totalInterest,
      totalPayment: emiCalc.totalPayment,
      notes: testScenario.notes,
      tags: testScenario.tags
    });

    assert.ok(copy._id);
    assert.strictEqual(copy.name, 'Atlas Test Scenario - New Car (Copy)');

    const countAfterCopy = await LoanScenario.countDocuments({ userId: testUser._id });
    assert.strictEqual(countAfterCopy, 2);

    await LoanScenario.deleteOne({ _id: copy._id });
    const countAfterDelete = await LoanScenario.countDocuments({ userId: testUser._id });
    assert.strictEqual(countAfterDelete, 1);
  });
});
