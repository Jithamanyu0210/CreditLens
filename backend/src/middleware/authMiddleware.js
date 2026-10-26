import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No bearer token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_creditlens_fintech_key_change_in_production'
    );

    // If connected to MongoDB, query full user document
    if (mongoose.connection.readyState === 1) {
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch {
        req.user = null;
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to token could not be found'
        });
      }
      return next();
    }

    // In-memory test fallback used strictly for isolated unit tests
    if (process.env.NODE_ENV === 'test' && decoded && decoded.id) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Test User',
        email: decoded.email || 'user@creditlens.test'
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'User belonging to token could not be verified'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid, malformed, or expired authorization token'
    });
  }
};

/**
 * Optional authentication: Attaches req.user if valid bearer token is present,
 * but does not reject unauthenticated guest requests.
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_creditlens_fintech_key_change_in_production'
    );

    if (mongoose.connection.readyState === 1 && decoded?.id) {
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        req.user = await User.findById(decoded.id).select('-password');
      }
    }

    if (process.env.NODE_ENV === 'test' && !req.user && decoded?.id) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Test User',
        email: decoded.email || 'user@creditlens.test'
      };
    }
  } catch {
    // Ignore invalid or expired token for optional auth routes
  }
  next();
};
