const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const {
  getScores,
  addScore,
  deleteScore,
  updateCharity,
  getSubscription,
  getWinnings,
} = require('../controllers/user.controller');

router.get('/scores', authenticateToken, getScores);
router.post('/scores', authenticateToken, addScore);
router.delete('/scores/:id', authenticateToken, deleteScore);
router.put('/charity', authenticateToken, updateCharity);
router.get('/subscription', authenticateToken, getSubscription);
router.get('/winnings', authenticateToken, getWinnings);

module.exports = router;