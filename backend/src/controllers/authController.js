import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

// In-memory store used exclusively for isolated unit testing in NODE_ENV === 'test'
const testMemoryUsers = new Map();

const generateToken = (id, name, email) => {
  return jwt.sign(
    { id: id.toString(), name, email },
    process.env.JWT_SECRET || 'super_secret_creditlens_fintech_key_change_in_production',
    { expiresIn: '30d' }
  );
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user account with this email address already exists.'
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password
      });

      const token = generateToken(user._id, user.name, user.email);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: user.toPublicJSON(),
        token
      });
    }

    // If database is unavailable, never silently fake registration in production/development
    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable. Registration requires an active database connection. Please ensure your current IP address is whitelisted in MongoDB Atlas Network Access.'
      });
    }

    // Isolated unit test fallback only (NODE_ENV === 'test')
    if (testMemoryUsers.has(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = `usr_test_${Date.now()}`;
    const userObj = {
      _id: userId,
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    };
    testMemoryUsers.set(normalizedEmail, userObj);

    const token = generateToken(userId, userObj.name, userObj.email);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: userId, _id: userId, name: userObj.name, email: userObj.email },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user._id, user.name, user.email);
      return res.json({
        success: true,
        message: 'Logged in successfully',
        user: user.toPublicJSON(),
        token
      });
    }

    // If database is unavailable, do not silently fake login in production/development
    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable. Authentication requires an active database connection.'
      });
    }

    // Isolated unit test fallback only
    const userObj = testMemoryUsers.get(normalizedEmail);
    if (!userObj || !(await bcrypt.compare(password, userObj.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(userObj.id, userObj.name, userObj.email);
    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: { id: userObj.id, _id: userObj._id, name: userObj.name, email: userObj.email },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User session not found.'
        });
      }

      return res.json({
        success: true,
        user: user.toPublicJSON()
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline.'
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name.'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      // Ensure email is not already taken by another registered user
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use by another account.'
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.'
        });
      }

      user.name = name.trim();
      user.email = normalizedEmail;
      await user.save();

      const token = generateToken(user._id, user.name, user.email);
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user.toPublicJSON(),
        token
      });
    }

    if (process.env.NODE_ENV !== 'test') {
      return res.status(503).json({
        success: false,
        error: 'DatabaseUnavailable',
        message: 'MongoDB Atlas is currently offline or unreachable. Profile changes cannot be saved.'
      });
    }

    // Isolated unit test fallback only
    const userObj = testMemoryUsers.get(req.user.email) || {
      id: req.user.id || req.user._id,
      name: req.user.name,
      email: req.user.email
    };
    userObj.name = name.trim();
    userObj.email = normalizedEmail;
    testMemoryUsers.set(normalizedEmail, userObj);

    const token = generateToken(userObj.id, userObj.name, userObj.email);
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { id: userObj.id, _id: userObj.id, name: userObj.name, email: userObj.email },
      token
    });
  } catch (error) {
    next(error);
  }
};
