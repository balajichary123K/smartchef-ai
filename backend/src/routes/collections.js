const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { auth } = require('../middleware/auth');

// @route    POST api/collections
// @desc     Create new recipe collection folder
// @access   Private
router.post('/', auth, collectionController.createCollection);

// @route    GET api/collections
// @desc     Get all user collections
// @access   Private
router.get('/', auth, collectionController.getCollections);

// @route    POST api/collections/:id/toggle
// @desc     Add/remove recipe to/from collection
// @access   Private
router.post('/:id/toggle', auth, collectionController.toggleRecipeInCollection);

// @route    DELETE api/collections/:id
// @desc     Delete collection
// @access   Private
router.delete('/:id', auth, collectionController.deleteCollection);

module.exports = router;
