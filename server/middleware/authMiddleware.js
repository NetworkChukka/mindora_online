const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'mindora_super_secret_jwt_key_exhibition_2026_change_in_prod';

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header (Bearer <token>) or cookie.
 */
async function authenticateToken(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status === 'DISABLED') {
      return res.status(401).json({
        success: false,
        message: 'Account disabled or user no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
}

/**
 * Optional Authentication Middleware
 * Loads user if valid token exists, but doesn't block if missing.
 */
async function optionalAuthenticateToken(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore token error for optional auth
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  JWT_SECRET
};
