const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');

router.get(
  '/',
  authenticateToken,
  requireRoles('ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'),
  schoolController.getSchools
);

router.post(
  '/',
  authenticateToken,
  requireRoles('ADMIN', 'REGISTRATION_OPERATOR'),
  schoolController.createSchool
);

router.put(
  '/:id',
  authenticateToken,
  requireRoles('ADMIN'),
  schoolController.updateSchool
);

router.delete(
  '/:id',
  authenticateToken,
  requireRoles('ADMIN'),
  schoolController.disableSchool
);

router.post(
  '/import',
  authenticateToken,
  requireRoles('ADMIN'),
  schoolController.importSchools
);

module.exports = router;
