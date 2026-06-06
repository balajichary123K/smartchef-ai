const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

// Multer configuration for memory storage (buffer is converted to base64)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit for videos
});

// @route    POST api/ai/chat
// @desc     Chat with AI Chef Assistant
// @access   Public (Optional Auth for saving history)
router.post('/chat', optionalAuth, aiController.chat);

// @route    POST api/ai/scan-image
// @desc     Identify ingredients in photo and recommend recipes
// @access   Public (Allows both file upload or JSON base64 string)
router.post('/scan-image', upload.single('image'), aiController.scanIngredients);

// @route    POST api/ai/leftovers
// @desc     Suggest recipes based on leftover inputs
// @access   Public
router.post('/leftovers', aiController.leftovers);

// @route    POST api/ai/meal-plan
// @desc     Generate weekly meal plan
// @access   Public
router.post('/meal-plan', aiController.mealPlan);

// @route    POST api/ai/diagnose
// @desc     Analyze image of cooking food for mistakes
// @access   Public
router.post('/diagnose', upload.single('image'), aiController.diagnoseImage);

// @route    POST api/ai/analyze-video
// @desc     Analyze short video of cooking techniques
// @access   Public
router.post('/analyze-video', upload.single('video'), aiController.analyzeVideo);

module.exports = router;
