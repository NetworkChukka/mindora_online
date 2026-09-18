const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { logAudit } = require('../services/auditService');

/**
 * Check if initial setup is required (if no ADMIN exists)
 */
async function checkSetup(req, res, next) {
  try {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    return res.json({
      success: true,
      setupRequired: adminCount === 0
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Perform first admin setup
 */
async function setupAdmin(req, res, next) {
  try {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Initial setup has already been completed. Setup route is disabled.'
      });
    }

    const { fullName, username, password, confirmPassword } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Username, and Password are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      fullName,
      username: username.toLowerCase().trim(),
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    await logAudit({
      user: newAdmin,
      action: 'INITIAL_ADMIN_SETUP',
      entityType: 'USER',
      entityId: newAdmin._id.toString(),
      description: `Initial admin setup completed by ${fullName} (${username})`,
      req
    });

    const token = jwt.sign(
      { id: newAdmin._id, role: newAdmin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Initial Admin created successfully.',
      token,
      user: newAdmin.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * User Login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user || user.status === 'DISABLED') {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    await logAudit({
      user,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user._id.toString(),
      description: `User ${user.username} logged in successfully`,
      req
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user details
 */
async function getMe(req, res, next) {
  try {
    return res.json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout
 */
async function logout(req, res, next) {
  try {
    if (req.user) {
      await logAudit({
        user: req.user,
        action: 'USER_LOGOUT',
        entityType: 'USER',
        entityId: req.user._id.toString(),
        description: `User ${req.user.username} logged out`,
        req
      });
    }
    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Change Password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await logAudit({
      user,
      action: 'CHANGE_PASSWORD',
      entityType: 'USER',
      entityId: user._id.toString(),
      description: `User ${user.username} changed password`,
      req
    });

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkSetup,
  setupAdmin,
  login,
  getMe,
  logout,
  changePassword
};
