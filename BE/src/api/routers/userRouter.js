const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/balance', userController.getBalance);
router.post('/send', userController.transfer);
router.post('/history', userController.historyTransaction);
router.get('/blockchain', userController.getBlockchain);
router.post('/stake', userController.getStake);

module.exports = router;
