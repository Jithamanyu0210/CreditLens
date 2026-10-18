import mongoose from 'mongoose';
import { LoanScenario } from '../models/LoanScenario.js';
import { calculateEMI } from '../services/emiService.js';

// In-memory scenario store used exclusively for isolated unit testing in NODE_ENV === 'test'
const testMemoryScenarios = new Map();

export const getSavedScenarios = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const scenarios = await LoanScenario.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: scenarios.length,
        scenarios
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable. Saved scenarios cannot be retrieved from the database.'
      });
    }

    // Isolated unit test fallback only (NODE_ENV === 'test')
    const userScenarios = Array.from(testMemoryScenarios.values())
      .filter((s) => s.userId === userIdStr)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: userScenarios.length,
      scenarios: userScenarios
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedScenarioById = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();
    const scenarioId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const scenario = await LoanScenario.findOne({
        _id: scenarioId,
        userId: req.user._id
      });

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Loan scenario not found or does not belong to your account.'
        });
      }

      const emiCalc = calculateEMI(scenario.principal, scenario.annualRate, scenario.tenureMonths);

      return res.json({
        success: true,
        scenario: {
          ...scenario.toObject(),
          emi: emiCalc.emi,
          totalInterest: emiCalc.totalInterest,
          totalPayment: emiCalc.totalPayment
        }
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline.'
      });
    }

    // Isolated unit test fallback only
    const scenario = testMemoryScenarios.get(scenarioId);
    if (!scenario || scenario.userId !== userIdStr) {
      return res.status(404).json({
        success: false,
        message: 'Loan scenario not found or does not belong to your account.'
      });
    }

    const emiCalc = calculateEMI(scenario.principal, scenario.annualRate, scenario.tenureMonths);
    res.json({
      success: true,
      scenario: {
        ...scenario,
        emi: emiCalc.emi,
        totalInterest: emiCalc.totalInterest,
        totalPayment: emiCalc.totalPayment
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createSavedScenario = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();
    const { name, principal, annualRate, tenureMonths, tenureUnit, notes, tags } = req.body;

    const p = Math.max(0, Number(principal) || 0);
    const r = Math.max(0, Number(annualRate) || 0);
    const n = Math.max(1, Math.round(Number(tenureMonths) || 1));

    const emiCalc = calculateEMI(p, r, n);

    if (mongoose.connection.readyState === 1) {
      const scenario = await LoanScenario.create({
        userId: req.user._id,
        name: (name || 'Loan Scenario').trim(),
        principal: p,
        annualRate: r,
        tenureMonths: n,
        tenureUnit: tenureUnit || (n % 12 === 0 ? 'years' : 'months'),
        emi: emiCalc.emi,
        totalInterest: emiCalc.totalInterest,
        totalPayment: emiCalc.totalPayment,
        notes: notes || '',
        tags: Array.isArray(tags) ? tags : ['General']
      });

      return res.status(201).json({
        success: true,
        message: 'Loan scenario saved successfully to MongoDB',
        scenario
      });
    }

    // If database is unavailable, never silently pretend persistence succeeded
    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable. Scenarios cannot be saved.'
      });
    }

    // Isolated unit test fallback only (NODE_ENV === 'test')
    const newId = `scen_test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const scenario = {
      _id: newId,
      id: newId,
      userId: userIdStr,
      name: (name || 'Loan Scenario').trim(),
      principal: p,
      annualRate: r,
      tenureMonths: n,
      tenureUnit: tenureUnit || (n % 12 === 0 ? 'years' : 'months'),
      emi: emiCalc.emi,
      totalInterest: emiCalc.totalInterest,
      totalPayment: emiCalc.totalPayment,
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : ['General'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    testMemoryScenarios.set(newId, scenario);

    res.status(201).json({
      success: true,
      message: 'Loan scenario saved successfully',
      scenario
    });
  } catch (error) {
    next(error);
  }
};

export const updateSavedScenario = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();
    const scenarioId = req.params.id;
    const { name, principal, annualRate, tenureMonths, tenureUnit, notes, tags } = req.body;

    if (mongoose.connection.readyState === 1) {
      const scenario = await LoanScenario.findOne({
        _id: scenarioId,
        userId: req.user._id
      });

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Scenario not found or access denied.'
        });
      }

      if (name !== undefined) scenario.name = name.trim();
      if (principal !== undefined) scenario.principal = Math.max(0, Number(principal));
      if (annualRate !== undefined) scenario.annualRate = Math.max(0, Number(annualRate));
      if (tenureMonths !== undefined) scenario.tenureMonths = Math.max(1, Math.round(Number(tenureMonths)));
      if (tenureUnit !== undefined) scenario.tenureUnit = tenureUnit;
      if (notes !== undefined) scenario.notes = notes;
      if (tags !== undefined && Array.isArray(tags)) scenario.tags = tags;

      const emiCalc = calculateEMI(scenario.principal, scenario.annualRate, scenario.tenureMonths);
      scenario.emi = emiCalc.emi;
      scenario.totalInterest = emiCalc.totalInterest;
      scenario.totalPayment = emiCalc.totalPayment;

      await scenario.save();

      return res.json({
        success: true,
        message: 'Loan scenario updated successfully in MongoDB',
        scenario
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable.'
      });
    }

    const scenario = testMemoryScenarios.get(scenarioId);
    if (!scenario || scenario.userId !== userIdStr) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found or access denied.'
      });
    }

    if (name !== undefined) scenario.name = name.trim();
    if (principal !== undefined) scenario.principal = Math.max(0, Number(principal));
    if (annualRate !== undefined) scenario.annualRate = Math.max(0, Number(annualRate));
    if (tenureMonths !== undefined) scenario.tenureMonths = Math.max(1, Math.round(Number(tenureMonths)));
    if (notes !== undefined) scenario.notes = notes;

    const emiCalc = calculateEMI(scenario.principal, scenario.annualRate, scenario.tenureMonths);
    scenario.emi = emiCalc.emi;
    scenario.totalInterest = emiCalc.totalInterest;
    scenario.totalPayment = emiCalc.totalPayment;
    scenario.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Loan scenario updated successfully',
      scenario
    });
  } catch (error) {
    next(error);
  }
};

export const duplicateSavedScenario = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();
    const scenarioId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const original = await LoanScenario.findOne({
        _id: scenarioId,
        userId: req.user._id
      });

      if (!original) {
        return res.status(404).json({
          success: false,
          message: 'Scenario not found or access denied.'
        });
      }

      const duplicated = await LoanScenario.create({
        userId: req.user._id,
        name: `${original.name} (Copy)`,
        principal: original.principal,
        annualRate: original.annualRate,
        tenureMonths: original.tenureMonths,
        tenureUnit: original.tenureUnit,
        emi: original.emi,
        totalInterest: original.totalInterest,
        totalPayment: original.totalPayment,
        notes: original.notes,
        tags: original.tags
      });

      return res.status(201).json({
        success: true,
        message: 'Scenario duplicated successfully in MongoDB',
        scenario: duplicated
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable.'
      });
    }

    const original = testMemoryScenarios.get(scenarioId);
    if (!original || original.userId !== userIdStr) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found or access denied.'
      });
    }

    const newId = `scen_test_${Date.now()}_copy`;
    const duplicated = {
      ...original,
      _id: newId,
      id: newId,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    testMemoryScenarios.set(newId, duplicated);

    res.status(201).json({
      success: true,
      message: 'Scenario duplicated successfully',
      scenario: duplicated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedScenario = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();
    const scenarioId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const deleted = await LoanScenario.findOneAndDelete({
        _id: scenarioId,
        userId: req.user._id
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Scenario not found or access denied.'
        });
      }

      return res.json({
        success: true,
        message: 'Loan scenario removed from MongoDB'
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable.'
      });
    }

    const exists = testMemoryScenarios.get(scenarioId);
    if (!exists || exists.userId !== userIdStr) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found or access denied.'
      });
    }

    testMemoryScenarios.delete(scenarioId);
    res.json({
      success: true,
      message: 'Loan scenario removed'
    });
  } catch (error) {
    next(error);
  }
};
