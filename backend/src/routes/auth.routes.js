const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;