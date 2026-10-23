import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Access denied.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'interviewiq_jwt_secret_key_2026_super_secure'
    );

    const users = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists or session is invalid.',
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please sign in again.',
      error: error.message,
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires one of [${roles.join(', ')}] permissions.`,
      });
    }
    next();
  };
};

export const protect = verifyToken;
