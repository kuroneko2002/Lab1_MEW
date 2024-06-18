const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const authenticateToken = require('../../utils/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
// router.post('/doSth', authenticateToken, userController.doSth);

module.exports = router;
