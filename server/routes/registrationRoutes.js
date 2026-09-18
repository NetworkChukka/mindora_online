const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');

// Purge / Reset all registration data (Admin only)
router.post(
  '/reset',
  authenticateToken,
  requireRoles('ADMIN'),
  registrationController.resetRegistrations
);

// Student endpoints
router.post(
  '/students',
  authenticateToken,
  requireRoles('ADMIN', 'REGISTRATION_OPERATOR'),
  registrationController.registerStudent
);
router.get(
  '/students',
  authenticateToken,
  requireRoles('ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'),
  registrationController.getStudents
);
router.put(
  '/students/:id',
  authenticateToken,
  requireRoles('ADMIN'),
  registrationController.updateStudent
);
router.delete(
  '/students/:id',
  authenticateToken,
  requireRoles('ADMIN'),
  registrationController.deleteStudent
);

// Teacher endpoints
router.post(
  '/teachers',
  authenticateToken,
  requireRoles('ADMIN', 'REGISTRATION_OPERATOR'),
  registrationController.registerTeacher
);
router.get(
  '/teachers',
  authenticateToken,
  requireRoles('ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'),
  registrationController.getTeachers
);
router.put(
  '/teachers/:id',
  authenticateToken,
  requireRoles('ADMIN'),
  registrationController.updateTeacher
);
router.delete(
  '/teachers/:id',
  authenticateToken,
  requireRoles('ADMIN'),
  registrationController.deleteTeacher
);

module.exports = router;
