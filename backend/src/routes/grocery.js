const express = require('express');
const router = express.Router();
const groceryController = require('../controllers/groceryController');

// @route    POST api/grocery/compare
// @desc     Compare prices for list of items across grocery delivery platforms
// @access   Public
router.post('/compare', groceryController.comparePrices);

module.exports = router;
