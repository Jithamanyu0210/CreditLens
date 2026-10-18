import jwt from 'jsonwebtoken';
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_creditlens_fintech_key_change_in_production');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      // Allow demo user fallback token
      if (decoded.id && decoded.id.startsWith('usr_demo')) {
        req.user = { _id: decoded.id, name: 'Demo User', email: 'demo@creditlens.local' };
        return next();
      }
      return res.status(401).json({ success: false, message: 'User belonging to token not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token'
    });
  }
};
