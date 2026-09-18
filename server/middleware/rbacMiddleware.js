/**
 * Role-Based Access Control (RBAC) Middleware
 * Backend-enforces user roles (ADMIN, REGISTRATION_OPERATOR, VIEWER).
 * Never trusts role sent by frontend!
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

module.exports = {
  requireRoles
};
