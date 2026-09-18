const AuditLog = require('../models/AuditLog');

/**
 * Creates an audit log entry safely without interrupting main operations.
 */
async function logAudit({ user, action, entityType = 'SYSTEM', entityId = '', description, req = null }) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    
    await AuditLog.create({
      userId: user ? user._id : null,
      userName: user ? (user.fullName || user.username) : 'System',
      action,
      entityType,
      entityId,
      description,
      ipAddress
    });
  } catch (err) {
    console.error('Audit Log error:', err.message);
  }
}

module.exports = {
  logAudit
};
