const Recipe = require('../models/Recipe');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

// Hardcoded initial/mock recipe database for offline fallback
const mockRecipes = [
  {
    _id: "60c72b2f9b1d8b2a1c8b4001",
    name: "Classic Chicken Biryani",
    description: "An elegant, flavorful rice dish made with aromatic basmati rice, tender spiced chicken, and caramelized onions.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800",
    prepTime: 20,
    cookTime: 40,
    difficulty: "medium",
    calories: 650,
    nutrition: {
      protein: "38g",
      carbs: "75g",
      fat: "22g",
      fiber: "4g"
    },
    cuisine: "Indian",
    mealType: "Lunch",
    dietaryTags: ["High Protein"],
    baseServings: 2,
    ingredients: [
      { name: "Basmati Rice", amount: 200, unit: "g", substitutes: ["Jasmine Rice", "Brown Rice"] },
      { name: "Chicken Thighs", amount: 350, unit: "g", substitutes: ["Paneer", "Tofu", "Mushroom"] },
      { name: "Yogurt", amount: 100, unit: "g", substitutes: ["Coconut Yogurt", "Sour Cream"] },
      { name: "Onions (sliced)", amount: 2, unit: "pieces", substitutes: ["Shallots"] },
      { name: "Biryani Masala", amount: 2, unit: "tbsp", substitutes: ["Garam Masala + Coriander powder"] },
      { name: "Ghee / Oil", amount: 2, unit: "tbsp", substitutes: ["Coconut Oil"] },
      { name: "Fresh Mint & Coriander", amount: 1, unit: "handful", substitutes: ["Parsley"] }
    ],
    equipment: ["Heavy bottom pot with lid", "Rice strainer", "Mixing bowl"],
    instructions: [
      { step: 1, text: "Marinate chicken in yogurt, biryani masala, and salt for at least 30 minutes." },
      { step: 2, text: "Wash and soak basmati rice in water for 25 minutes. Then boil in salted water until 70% cooked (about 7-8 mins). Drain and set aside." },
      { step: 3, text: "Heat ghee in a pot, fry sliced onions until golden brown and crispy. Remove half for garnishing." },
      { step: 4, text: "In the same pot, add marinated chicken and cook for 10 minutes until chicken releases juices and thickens." },
      { step: 5, text: "Layer the parboiled rice over the cooked chicken. Top with fried onions, mint, and coriander." },
      { step: 6, text: "Seal the pot tight with foil/lid and cook on low heat (Dum) for 15-20 minutes. Serve hot." }
    ],
    tips: [
      "Always soak basmati rice; it helps the grains expand and stay fluffy.",
      "Cooking biryani on a heavy bottom pot ensures the rice at the bottom does not burn."
    ],
    commonMistakes: [
      { mistake: "Rice gets mushy", fix: "Make sure you boil the rice only to 70% (it should still have a bite) before layering." },
      { mistake: "Dry Biryani", fix: "Make sure the chicken has a thick gravy base before you layer the rice." }
    ],
    ratings: [
      { userName: "Anjali", rating: 5, comment: "Absolutely delicious recipe! My family loved the rich aroma." },
      { userName: "Rohan", rating: 4, comment: "Good instructions, but I needed a bit more spice." }
    ],
    averageRating: 4.5,
    isFeatured: true
  },
  {
    _id: "60c72b2f9b1d8b2a1c8b4002",
    name: "Paneer Tikka Masala",
    description: "Tandoori-spiced paneer cubes cooked in a rich, creamy, and mildly spicy tomato-based onion gravy.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800",
    prepTime: 15,
    cookTime: 25,
    difficulty: "medium",
    calories: 480,
    nutrition: {
      protein: "18g",
      carbs: "14g",
      fat: "32g",
      fiber: "3g"
    },
    cuisine: "Indian",
    mealType: "Dinner",
    dietaryTags: ["Vegetarian"],
    baseServings: 2,
    ingredients: [
      { name: "Paneer (cubed)", amount: 200, unit: "g", substitutes: ["Extra Firm Tofu", "Tempeh"] },
      { name: "Heavy Cream", amount: 50, unit: "ml", substitutes: ["Coconut Cream", "Cashew Cream"] },
      { name: "Tomato Puree", amount: 1.5, unit: "cups", substitutes: ["Fresh Pureed Tomatoes"] },
      { name: "Bell Peppers (diced)", amount: 1, unit: "piece", substitutes: ["Zucchini"] },
      { name: "Garam Masala", amount: 1, unit: "tsp", substitutes: ["Curry Powder"] },
      { name: "Kashmiri Red Chilli Powder", amount: 1, unit: "tsp", substitutes: ["Paprika"] },
      { name: "Butter", amount: 20, unit: "g", substitutes: ["Vegan Butter", "Olive Oil"] }
    ],
    equipment: ["Skillet or Frying Pan", "Spatula", "Blender"],
    instructions: [
      { step: 1, text: "Marinate paneer cubes with a spoonful of yogurt, spices, and salt, then grill/sear on a pan until golden. Set aside." },
      { step: 2, text: "Melt butter in a pan, sauté diced bell peppers and onions for 3 minutes, then set aside." },
      { step: 3, text: "In the same pan, simmer tomato puree with garlic, ginger, and masala powders until the oil separates." },
      { step: 4, text: "Pour in cream and stir well. Add grilled paneer, peppers, and onions back into the gravy." },
      { step: 5, text: "Simmer for 5 minutes, garnish with kasuri methi (dried fenugreek) or coriander. Serve with Naan." }
    ],
    tips: [
      "Soak paneer in warm water for 10 minutes before marinating to make it super soft.",
      "Kashmiri chilli gives the signature bright red color without making the gravy overly hot."
    ],
    commonMistakes: [
      { mistake: "Paneer becomes rubbery", fix: "Do not over-fry the paneer cubes; just sear them for 1-2 minutes per side." }
    ],
    ratings: [
      { userName: "Deepak", rating: 5, comment: "Better than restaurant style! Softest paneer ever." }
    ],
    averageRating: 4.8,
    isFeatured: true
  },
  {
    _id: "60c72b2f9b1d8b2a1c8b4003",
    name: "Mediterranean Chickpea Salad",
    description: "A refreshing, high-fiber, and low-calorie salad tossing crisp cucumbers, juicy tomatoes, and chickpeas in an olive oil-lemon dressing.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800",
    prepTime: 10,
    cookTime: 0,
    difficulty: "easy",
    calories: 280,
    nutrition: {
      protein: "12g",
      carbs: "34g",
      fat: "11g",
      fiber: "9g"
    },
    cuisine: "Italian",
    mealType: "Breakfast",
    dietaryTags: ["Vegetarian", "Vegan", "Weight Loss"],
    baseServings: 2,
    ingredients: [
      { name: "Canned Chickpeas (drained)", amount: 400, unit: "g", substitutes: ["Boiled Black Beans", "Lentils"] },
      { name: "Cucumber (diced)", amount: 1, unit: "piece", substitutes: ["Zucchini"] },
      { name: "Cherry Tomatoes (halved)", amount: 150, unit: "g", substitutes: ["Sun-dried Tomatoes"] },
      { name: "Olive Oil", amount: 2, unit: "tbsp", substitutes: ["Avocado Oil"] },
      { name: "Lemon Juice", amount: 1, unit: "tbsp", substitutes: ["Apple Cider Vinegar"] },
      { name: "Feta Cheese (crumbled)", amount: 50, unit: "g", substitutes: ["Vegan Feta", "Olives"] }
    ],
    equipment: ["Large mixing bowl", "Salad tongs"],
    instructions: [
      { step: 1, text: "In a small cup, whisk olive oil, fresh lemon juice, salt, pepper, and dried oregano." },
      { step: 2, text: "In a large bowl, combine drained chickpeas, diced cucumber, tomatoes, and parsley." },
      { step: 3, text: "Drizzle dressing over the salad and toss well." },
      { step: 4, text: "Top with crumbled feta cheese before serving. Best enjoyed chilled." }
    ],
    tips: [
      "Let the salad sit in the fridge for 20 minutes before serving. It lets the chickpeas absorb the dressing flavor.",
      "Rub chickpeas with a clean kitchen towel to remove outer skins for a smoother texture."
    ],
    commonMistakes: [
      { mistake: "Soggy cucumbers", fix: "If preparing ahead, don't add the dressing until right before serving." }
    ],
    ratings: [
      { userName: "Emily", rating: 5, comment: "Healthy, easy, and satisfying! Makes a great lunch prep." }
    ],
    averageRating: 4.7,
    isFeatured: false
  }
];

// Helper to get recipes (from MongoDB or fallbacks)
const getRecipeSource = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    return mockRecipes;
  }
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      // Seed DB if empty
      await Recipe.insertMany(mockRecipes);
    }
    return Recipe;
  } catch (err) {
    console.warn('Falling back to local mock recipes due to DB error:', err.message);
    return mockRecipes;
  }
};

// Get all recipes with search filter
exports.getRecipes = async (req, res) => {
  const { search, cuisine, mealType, dietary, maxTime } = req.query;

  try {
    const source = await getRecipeSource();

    if (Array.isArray(source)) {
      // Handle mock filtering in-memory
      let filtered = [...source];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.name.toLowerCase().includes(query) || 
          r.description.toLowerCase().includes(query) ||
          r.ingredients.some(i => i.name.toLowerCase().includes(query))
        );

        // If no matches found, generate recipe on the fly via Gemini AI
        if (filtered.length === 0) {
          console.log(`🔍 Recipe not found locally. Generating "${search}" on-the-fly using Gemini...`);
          try {
            const generated = await geminiService.generateRecipeOnTheFly(search);
            if (generated) {
              generated._id = `mock_gen_${Date.now()}`;
              mockRecipes.push(generated);
              filtered = [generated];
            }
          } catch (genErr) {
            console.error('Failed to generate recipe on-the-fly:', genErr.message);
          }
        }
      }

      if (cuisine) {
        filtered = filtered.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
      }

      if (mealType) {
        filtered = filtered.filter(r => r.mealType.toLowerCase() === mealType.toLowerCase());
      }

      if (dietary) {
        // e.g., dietary=Vegetarian
        filtered = filtered.filter(r => r.dietaryTags.some(t => t.toLowerCase() === dietary.toLowerCase()));
      }

      if (maxTime) {
        const limit = parseInt(maxTime);
        filtered = filtered.filter(r => (r.prepTime + r.cookTime) <= limit);
      }

      return res.json(filtered);
    } else {
      // Mongo Query
      let query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'ingredients.name': { $regex: search, $options: 'i' } }
        ];
      }

      if (cuisine) {
        query.cuisine = cuisine;
      }

      if (mealType) {
        query.mealType = mealType;
      }

      if (dietary) {
        query.dietaryTags = dietary;
      }

      if (maxTime) {
        const limit = parseInt(maxTime);
        query.$expr = { $lte: [ { $add: ["$prepTime", "$cookTime"] }, limit ] };
      }

      let recipes = await Recipe.find(query);

      // If no matches found in MongoDB, generate recipe via Gemini AI and save it!
      if (recipes.length === 0 && search) {
        console.log(`🔍 Recipe "${search}" not found in MongoDB. Generating on-the-fly using Gemini...`);
        try {
          const generatedData = await geminiService.generateRecipeOnTheFly(search);
          if (generatedData) {
            const newRecipe = new Recipe(generatedData);
            await newRecipe.save();
            recipes = [newRecipe];
          }
        } catch (genErr) {
          console.error('Failed to generate and save recipe on-the-fly:', genErr.message);
        }
      }

      return res.json(recipes);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const source = await getRecipeSource();
    let recipe;

    if (Array.isArray(source)) {
      recipe = source.find(r => r._id === req.params.id);
    } else {
      recipe = await Recipe.findById(req.params.id);
    }

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Log user cooking history if logged in
    if (req.user && req.user.id) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          // Prevent duplicates in history
          user.history = user.history.filter(h => h.recipe.toString() !== req.params.id);
          user.history.unshift({ recipe: req.params.id, viewedAt: new Date() });
          // Limit history size to 20
          if (user.history.length > 20) user.history.pop();
          await user.save();
        }
      } catch (historyErr) {
        console.warn('Could not log recipe to user history:', historyErr.message);
      }
    }

    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add rating & reviews
exports.rateRecipe = async (req, res) => {
  const { rating, comment, userName } = req.body;

  try {
    if (process.env.USE_MOCK_DB === 'true') {
      // Mock review save simulation
      const recipe = mockRecipes.find(r => r._id === req.params.id);
      if (!recipe) return res.status(404).json({ msg: 'Recipe not found' });

      const newReview = {
        user: req.user ? req.user.id : null,
        userName: userName || 'Anonymous Cook',
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };

      recipe.ratings.push(newReview);
      const totalRatings = recipe.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      recipe.averageRating = Number((totalRatings / recipe.ratings.length).toFixed(1));

      return res.json(recipe);
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    const newReview = {
      user: req.user.id,
      userName: userName || 'Registered Cook',
      rating: Number(rating),
      comment
    };

    recipe.ratings.push(newReview);
    
    // Calculate average rating
    const totalRatings = recipe.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    recipe.averageRating = Number((totalRatings / recipe.ratings.length).toFixed(1));

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Toggle Favorite Recipe
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const recipeId = req.params.id;
    const isFavorite = user.favorites.includes(recipeId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== recipeId);
    } else {
      // Add to favorites
      user.favorites.push(recipeId);
    }

    await user.save();
    res.json({ favorites: user.favorites, isFavorite: !isFavorite });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin create recipe
exports.createRecipe = async (req, res) => {
  const { name, description, prepTime, cookTime, difficulty, cuisine, mealType, dietaryTags, ingredients, instructions, calories, nutrition, equipment, tips, commonMistakes } = req.body;

  try {
    if (process.env.USE_MOCK_DB === 'true') {
      const newRecipe = {
        _id: `mock_${Date.now()}`,
        name, description, prepTime, cookTime, difficulty, cuisine, mealType, dietaryTags, ingredients, instructions, calories, nutrition, equipment, tips, commonMistakes,
        ratings: [],
        averageRating: 5.0,
        createdAt: new Date()
      };
      mockRecipes.push(newRecipe);
      return res.json(newRecipe);
    }

    const newRecipe = new Recipe({
      name, description, prepTime, cookTime, difficulty, cuisine, mealType, dietaryTags, ingredients, instructions, calories, nutrition, equipment, tips, commonMistakes,
      createdBy: req.user.id
    });

    const recipe = await newRecipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
