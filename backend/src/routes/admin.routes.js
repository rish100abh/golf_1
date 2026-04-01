const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');
const {
  getUsers,
  getAnalytics,
  createCharity,
  getDraws,
  verifyWinner,
} = require('../controllers/admin.controller');

router.get('/users', authenticateToken, requireAdmin, getUsers);
router.get('/analytics', authenticateToken, requireAdmin, getAnalytics);
router.post('/charities', authenticateToken, requireAdmin, createCharity);
router.get('/draws', authenticateToken, requireAdmin, getDraws);
router.put('/winners/:id/verify', authenticateToken, requireAdmin, verifyWinner);

module.exports = router;