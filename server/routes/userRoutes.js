const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken, requireRoles('ADMIN'));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id/permanent', userController.deleteUserPermanently);
router.delete('/:id', userController.disableUser);

module.exports = router;
