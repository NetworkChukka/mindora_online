const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');

router.get('/', authenticateToken, requireRoles('ADMIN'), auditController.getAuditLogs);

module.exports = router;
