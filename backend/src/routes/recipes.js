const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { auth, optionalAuth, admin } = require('../middleware/auth');

// @route    GET api/recipes
// @desc     Get all recipes (with search parameters)
// @access   Public
router.get('/', recipeController.getRecipes);

// @route    GET api/recipes/:id
// @desc     Get recipe by ID
// @access   Public (Optional Auth to track viewing history)
router.get('/:id', optionalAuth, recipeController.getRecipeById);

// @route    POST api/recipes/:id/rate
// @desc     Rate and review a recipe
// @access   Private (Optional Auth, but requires auth internally)
router.post('/:id/rate', optionalAuth, recipeController.rateRecipe);

// @route    POST api/recipes/:id/favorite
// @desc     Toggle recipe as favorite
// @access   Private
router.post('/:id/favorite', auth, recipeController.toggleFavorite);

// @route    POST api/recipes
// @desc     Create a new recipe (Admin only)
// @access   Private/Admin
router.post('/', auth, admin, recipeController.createRecipe);

module.exports = router;
