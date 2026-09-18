const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { optionalAuthenticateToken } = require('../middleware/authMiddleware');

// Public Display Mode & Dashboard statistics (allows unauthenticated for public TV display)
router.get('/stats', optionalAuthenticateToken, dashboardController.getStats);
router.get('/grades', optionalAuthenticateToken, dashboardController.getGradeStats);
router.get('/schools', optionalAuthenticateToken, dashboardController.getSchoolStats);
router.get('/operators', optionalAuthenticateToken, dashboardController.getOperatorStats);
router.get('/hourly', optionalAuthenticateToken, dashboardController.getHourlyStats);

module.exports = router;
