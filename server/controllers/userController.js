const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { logAudit } = require('../services/auditService');

/**
 * Get all users (Admin only)
 */
async function getUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash').lean();
    return res.json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create user (Admin creates Operator, Admin, or Viewer)
 */
async function createUser(req, res, next) {
  try {
    const { fullName, username, password, role = 'REGISTRATION_OPERATOR' } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Username, and Password are required.'
      });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      passwordHash,
      role,
      status: 'ACTIVE'
    });

    await logAudit({
      user: req.user,
      action: 'ADMIN_CREATED_USER',
      entityType: 'USER',
      entityId: user._id.toString(),
      description: `Created user ${user.username} with role ${user.role}`,
      req
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user profile, password, role or status (Admin)
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { fullName, username, role, status, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (fullName && fullName.trim()) user.fullName = fullName.trim();
    
    if (username && username.trim()) {
      const lowerUser = username.toLowerCase().trim();
      const existing = await User.findOne({ username: lowerUser, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken by another user account.'
        });
      }
      user.username = lowerUser;
    }

    if (role) user.role = role;
    if (status) user.status = status;

    if (newPassword && newPassword.trim()) {
      user.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    await user.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_UPDATED_USER',
      entityType: 'USER',
      entityId: user._id.toString(),
      description: `Updated user profile for ${user.username}`,
      req
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'User updated successfully.',
      data: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Soft Toggle Active/Disabled Status (Admin)
 */
async function disableUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot disable your own active account.'
      });
    }

    user.status = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await user.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_TOGGLED_USER_STATUS',
      entityType: 'USER',
      entityId: user._id.toString(),
      description: `User ${user.username} status set to ${user.status}`,
      req
    }).catch(() => {});

    return res.json({
      success: true,
      message: `User status changed to ${user.status}.`,
      data: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Permanently Delete User Account (Admin)
 */
async function deleteUserPermanently(req, res, next) {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active admin account.'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    await logAudit({
      user: req.user,
      action: 'ADMIN_DELETED_USER_PERMANENTLY',
      entityType: 'USER',
      entityId: id,
      description: `Permanently deleted user account "${user.username}" (${user.fullName})`,
      req
    }).catch(() => {});

    return res.json({
      success: true,
      message: `User account @${user.username} permanently deleted.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  disableUser,
  deleteUserPermanently
};
