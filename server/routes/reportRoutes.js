const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken, requireRoles('ADMIN'));

router.get('/excel', reportController.exportExcel);
router.get('/csv', reportController.exportCsv);
router.get('/pdf', reportController.exportPdf);

module.exports = router;
