const express = require('express');
const router = express.Router();
const {
  getCharities,
  getCharityById,
} = require('../controllers/charity.controller');

router.get('/', getCharities);
router.get('/:id', getCharityById);

module.exports = router;