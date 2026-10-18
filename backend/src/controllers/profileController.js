import mongoose from 'mongoose';
import { FinancialProfile } from '../models/FinancialProfile.js';

// In-memory profile store used exclusively for isolated unit testing in NODE_ENV === 'test'
const testMemoryProfiles = new Map();

export const getProfile = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      let profile = await FinancialProfile.findOne({ userId: req.user._id });

      if (!profile) {
        // Clean initial state for a new user without fabricating dummy numbers
        return res.json({
          success: true,
          isNewProfile: true,
          profile: {
            userId: req.user._id,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            otherExpenses: 0,
            monthlySavingsTarget: 0,
            currentSavings: 0,
            existingEmis: []
          }
        });
      }

      if (profile.otherExpenses === undefined || profile.otherExpenses === null) {
        profile.otherExpenses = 0;
      }

      return res.json({
        success: true,
        isNewProfile: false,
        profile
      });
    }

    // If database is unavailable, never silently fake profile data in production/development
    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable. Financial profile cannot be loaded from the database.'
      });
    }

    // Isolated unit test fallback only (NODE_ENV === 'test')
    let profile = testMemoryProfiles.get(userIdStr);
    if (!profile) {
      profile = {
        userId: userIdStr,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        otherExpenses: 0,
        monthlySavingsTarget: 0,
        currentSavings: 0,
        existingEmis: []
      };
      testMemoryProfiles.set(userIdStr, profile);
    }

    res.json({
      success: true,
      isNewProfile: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

export const saveOrUpdateProfile = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();
    const {
      monthlyIncome,
      monthlyExpenses,
      otherExpenses,
      monthlySavingsTarget,
      currentSavings,
      existingEmis
    } = req.body;

    const updateFields = {};
    if (monthlyIncome !== undefined) updateFields.monthlyIncome = Math.max(0, Number(monthlyIncome) || 0);
    if (monthlyExpenses !== undefined) updateFields.monthlyExpenses = Math.max(0, Number(monthlyExpenses) || 0);
    if (otherExpenses !== undefined) updateFields.otherExpenses = Math.max(0, Number(otherExpenses) || 0);
    if (monthlySavingsTarget !== undefined) updateFields.monthlySavingsTarget = Math.max(0, Number(monthlySavingsTarget) || 0);
    if (currentSavings !== undefined) updateFields.currentSavings = Math.max(0, Number(currentSavings) || 0);
    if (existingEmis !== undefined && Array.isArray(existingEmis)) updateFields.existingEmis = existingEmis;

    if (mongoose.connection.readyState === 1) {
      const setOnInsertFields = {
        userId: req.user._id
      };
      if (updateFields.monthlyIncome === undefined) setOnInsertFields.monthlyIncome = 0;
      if (updateFields.monthlyExpenses === undefined) setOnInsertFields.monthlyExpenses = 0;
      if (updateFields.otherExpenses === undefined) setOnInsertFields.otherExpenses = 0;
      if (updateFields.monthlySavingsTarget === undefined) setOnInsertFields.monthlySavingsTarget = 0;
      if (updateFields.currentSavings === undefined) setOnInsertFields.currentSavings = 0;
      if (updateFields.existingEmis === undefined) setOnInsertFields.existingEmis = [];

      const profile = await FinancialProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: updateFields,
          $setOnInsert: setOnInsertFields
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );

      return res.json({
        success: true,
        message: 'Financial profile saved successfully to MongoDB',
        profile
      });
    }

    // If database is unavailable, never silently pretend persistence succeeded
    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable. Profile changes cannot be saved to the database.'
      });
    }

    // Isolated unit test fallback only (NODE_ENV === 'test')
    const existing = testMemoryProfiles.get(userIdStr) || { userId: userIdStr };
    const merged = { ...existing, ...updateFields, userId: userIdStr };
    testMemoryProfiles.set(userIdStr, merged);

    res.json({
      success: true,
      message: 'Financial profile saved successfully',
      profile: merged
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const userIdStr = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      await FinancialProfile.findOneAndDelete({ userId: req.user._id });
      return res.json({
        success: true,
        message: 'Financial profile reset successfully in MongoDB'
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline.'
      });
    }

    testMemoryProfiles.delete(userIdStr);
    res.json({
      success: true,
      message: 'Financial profile reset to default'
    });
  } catch (error) {
    next(error);
  }
};
