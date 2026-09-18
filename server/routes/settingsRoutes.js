const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');

router.get('/', settingsController.getSettings);
router.put('/', authenticateToken, requireRoles('ADMIN'), settingsController.updateSettings);

module.exports = router;
