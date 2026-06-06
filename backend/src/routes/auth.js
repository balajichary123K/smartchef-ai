const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// @route    POST api/auth/signup
// @desc     Register user
// @access   Public
router.post('/signup', authController.register);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post('/login', authController.login);

// @route    POST api/auth/google
// @desc     Google signin/signup
// @access   Public
router.post('/google', authController.googleLogin);

// @route    GET api/auth/me
// @desc     Get current user profile
// @access   Private
router.get('/me', auth, authController.getMe);

// @route    PUT api/auth/preferences
// @desc     Update culinary goals & preferences
// @access   Private
router.put('/preferences', auth, authController.updatePreferences);

// @route    POST api/auth/grocery-list
// @desc     Save/Sync grocery checklist
// @access   Private
router.post('/grocery-list', auth, authController.saveGroceryList);

module.exports = router;
