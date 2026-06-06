const Collection = require('../models/Collection');

// Create a new recipe collection/folder
exports.createCollection = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCollection = new Collection({
      name,
      description,
      user: req.user.id,
      recipes: []
    });

    const collection = await newCollection.save();
    res.json(collection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all collections for authenticated user
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.id }).populate('recipes');
    res.json(collections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add or remove recipe to/from collection
exports.toggleRecipeInCollection = async (req, res) => {
  const { recipeId } = req.body;
  const collectionId = req.params.id;

  try {
    const collection = await Collection.findOne({ _id: collectionId, user: req.user.id });
    if (!collection) {
      return res.status(404).json({ msg: 'Collection not found' });
    }

    const isExist = collection.recipes.includes(recipeId);
    if (isExist) {
      // Remove
      collection.recipes = collection.recipes.filter(id => id.toString() !== recipeId);
    } else {
      // Add
      collection.recipes.push(recipeId);
    }

    await collection.save();
    const updated = await Collection.findById(collectionId).populate('recipes');
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete Collection
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });
    if (!collection) {
      return res.status(404).json({ msg: 'Collection not found' });
    }

    await collection.deleteOne();
    res.json({ msg: 'Collection removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
