const { getGenAI } = require('../config/gemini');

// Helper to convert base64 image data to Generative AI Part object
function fileToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

/**
 * Chef Chat Q&A
 */
const askChef = async (question, history = []) => {
  if (process.env.USE_MOCK_AI === 'true') {
    return simulateChefResponse(question);
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Format chat history
    const chatHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const prompt = `You are SmartChef AI, an expert culinary assistant, nutritionist, and cooking mentor. 
    Answer this cooking-related question: "${question}". 
    Provide clear, professional cooking advice, suggest substitutes if asked, or help troubleshoot mistakes.`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini Chef Chat Error, falling back to mock:', err.message);
    return simulateChefResponse(question);
  }
};

/**
 * Scan ingredients from an uploaded image
 */
const scanIngredientsFromImage = async (base64Image, mimeType) => {
  if (process.env.USE_MOCK_AI === 'true') {
    return simulateImageScanner();
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const prompt = `Analyze this image of food ingredients. 
    1. Identify all visible ingredients.
    2. Suggest 3 recipes that can be made primarily using these ingredients.
    Return the output in structured JSON format like this:
    {
      "detectedIngredients": ["Tomato", "Onion", "Egg"],
      "recipes": [
        {
          "name": "Shakshuka",
          "matchPercentage": 90,
          "missingIngredients": ["Garlic", "Olive Oil"],
          "briefInstructions": "Cook sliced onions and tomatoes with spices, make wells, crack eggs inside, and cook covered until whites are set."
        }
      ]
    }`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown JSON blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini Image Scan Error, falling back to mock:', err.message);
    return simulateImageScanner();
  }
};

/**
 * Leftover food recipe assistant
 */
const suggestLeftoverRecipes = async (leftoversString) => {
  if (process.env.USE_MOCK_AI === 'true') {
    return simulateLeftoverRecipes(leftoversString);
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `I have these leftover items at home: "${leftoversString}". 
    Suggest 3 creative recipes I can cook using these leftovers to prevent food waste. 
    Return the response as a JSON array of objects:
    [
      {
        "name": "Recipe Name",
        "description": "Short description of the recipe",
        "difficulty": "easy/medium",
        "prepTime": 10,
        "cookTime": 15,
        "additionalNeeded": ["list of common items needed, e.g., oil, salt"]
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini Leftover Suggestion Error, falling back to mock:', err.message);
    return simulateLeftoverRecipes(leftoversString);
  }
};

/**
 * Meal Planner
 */
const generateMealPlan = async (goals, preferences, days = 7) => {
  if (process.env.USE_MOCK_AI === 'true') {
    return simulateMealPlanner(goals, preferences, days);
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Create a healthy, delicious meal plan for ${days} days.
    Dietary preferences/Restrictions: "${preferences || 'None'}". 
    Nutrition goals (e.g. Weight Loss, Muscle Gain, Diabetic Friendly, High Protein): "${JSON.stringify(goals)}".
    Provide structured JSON output matching this schema:
    {
      "title": "Custom Meal Plan",
      "summary": "Nutritional strategy overview",
      "days": [
        {
          "dayNumber": 1,
          "meals": {
            "breakfast": { "name": "Meal name", "calories": 400, "protein": "25g", "carbs": "45g", "fat": "12g" },
            "lunch": { "name": "Meal name", "calories": 600, "protein": "35g", "carbs": "60g", "fat": "18g" },
            "dinner": { "name": "Meal name", "calories": 500, "protein": "30g", "carbs": "40g", "fat": "15g" },
            "snacks": { "name": "Meal name", "calories": 200, "protein": "10g", "carbs": "20g", "fat": "5g" }
          }
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini Meal Plan Error, falling back to mock:', err.message);
    return simulateMealPlanner(goals, preferences, days);
  }
};

/**
 * Image Cooking Diagnosis (Texture, doneness, mistakes)
 */
const analyzeCookingQuality = async (base64Image, mimeType) => {
  if (process.env.USE_MOCK_AI === 'true') {
    return simulateQualityDiagnosis();
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const prompt = `Analyze this photo of a food dish being cooked or finished. 
    Provide assessment on:
    1. Doneness (undercooked, overcooked, perfectly cooked)
    2. Visual texture issues (too wet, dry, lumpy, flat)
    3. Color accuracy
    4. Feedback and corrections on how to fix these issues.
    Return JSON object:
    {
      "doneness": "perfectly cooked / undercooked / overcooked",
      "texture": "Description of the texture",
      "colorAssessment": "Description of color",
      "mistakesDetected": ["List of issues, e.g., heat too high, uneven cutting"],
      "improvementTips": ["Stir in a splash of cream", "Cover with a lid for 3 minutes"]
    }`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini Quality Assessment Error, falling back to mock:', err.message);
    return simulateQualityDiagnosis();
  }
};

/**
 * Video Technique Analysis
 */
const analyzeCookingVideo = async (base64Video, mimeType) => {
  if (process.env.USE_MOCK_AI === 'true') {
    return simulateVideoAnalysis();
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const videoPart = fileToGenerativePart(base64Video, mimeType);
    const prompt = `Analyze this short cooking video clip. Identify:
    1. Chef's cutting/prep technique (correct/incorrect)
    2. Speed, temperature, and timing indicators
    3. Potential recipe mistakes (e.g. burning spices, overcrowding the pan)
    Return JSON format:
    {
      "techniqueAssessment": "Detailed description of the cooking technique seen",
      "heatControl": "Assessment of pan/pot temperature",
      "mistakes": ["List of mistakes identified, e.g., knife holding style is dangerous"],
      "remedies": ["Keep fingertips curled back", "Lower the flame when adding spices"]
    }`;

    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini Video Analysis Error, falling back to mock:', err.message);
    return simulateVideoAnalysis();
  }
};

// ==========================================
// SIMULATION / MOCK FALLBACK DATA GENERATORS
// ==========================================

function simulateChefResponse(question) {
  const q = question.toLowerCase();
  
  if (q.includes('salty')) {
    return `**Too Salty? Here's How to Rescue Your Dish:**
1. **Add starch**: Throw in a raw, peeled potato slice and simmer for 10 minutes. It absorbs excess salt like a sponge!
2. **Add acid**: A squeeze of lemon juice or a splash of vinegar can balance and mask the salty flavor profile.
3. **Dilute it**: Add more water, unsalted broth, tomato sauce, or coconut milk depending on the type of curry.
4. **Dairy save**: Stir in some cream, yogurt, or sour cream. The fats bind with the salt and soften the intensity.`;
  }
  
  if (q.includes('butter') || q.includes('substitute')) {
    return `**Common Butter Substitutes for Baking and Cooking:**
- **Applesauce (1:1 ratio)**: Best for cakes and muffins, reducing fat and adding natural moisture.
- **Olive oil or vegetable oil (3/4 cup oil for every 1 cup butter)**: Great for savory cooking and quick bread.
- **Greek Yogurt (1:1 ratio)**: Excellent for adding tanginess, moisture, and protein to baked goods.
- **Margarine or Coconut Oil (1:1 ratio)**: Perfect drop-in replacement; coconut oil leaves a mild, pleasant coconut aroma.`;
  }
  
  if (q.includes('consistency') || q.includes('sauce') || q.includes('watery')) {
    return `**How to thicken watery curries and sauces:**
- **Simmer uncovered**: Let it bubble gently to evaporate water. This naturally concentrates flavors.
- **Starch slurry**: Mix 1 tsp cornstarch or flour with 1 tbsp cold water, stir it in, and boil for 2 minutes.
- **Nut pastes**: A tablespoon of cashew or almond paste adds rich body and a nutty gourmet texture.
- **Mash ingredients**: Mash a few boiled potatoes, lentils, or beans directly in the pot to thick it up instantly.`;
  }

  return `Hello! I'm your AI Chef Companion. 
Regarding your question about "${question}":
To get the best result in the kitchen, remember to focus on temperature control, seasoning in stages, and giving meats/doughs time to rest. 
Is there a specific recipe, ingredient substitute, or cooking step you would like me to troubleshoot?`;
}

function simulateImageScanner() {
  return {
    detectedIngredients: ["Fresh Tomato", "Red Onion", "Large Egg", "Coriander Leaves"],
    recipes: [
      {
        name: "Shakshuka (Poached Eggs in Spicy Tomato Sauce)",
        matchPercentage: 92,
        missingIngredients: ["Garlic", "Bell Pepper", "Cumin"],
        briefInstructions: "Sauté onions, tomatoes, and spices. Make small wells in the mixture, crack the eggs inside, cover, and simmer for 5-8 minutes until egg whites are set."
      },
      {
        name: "Masala Egg Bhurji (Indian Scrambled Eggs)",
        matchPercentage: 95,
        missingIngredients: ["Green Chillies", "Turmeric"],
        briefInstructions: "Sauté chopped onions and tomatoes with spices. Whisk the eggs and pour them into the pan, stirring continuously to scramble. Top with fresh coriander."
      },
      {
        name: "Tomato & Onion Frittata",
        matchPercentage: 85,
        missingIngredients: ["Cheese", "Butter"],
        briefInstructions: "Whisk eggs with salt and pepper. Pour over sautéed tomatoes and onions in a frying pan. Cook until edges set, then bake or flip to finish."
      }
    ]
  };
}

function simulateLeftoverRecipes(leftovers) {
  const items = leftovers.toLowerCase();
  
  if (items.includes('rice') || items.includes('chicken')) {
    return [
      {
        name: "Easy Chicken Fried Rice",
        description: "A fast, aromatic skillet dish that turns dry leftover rice and cooked chicken into a restaurant-quality meal.",
        difficulty: "easy",
        prepTime: 5,
        cookTime: 10,
        additionalNeeded: ["Soy sauce", "Oil", "Garlic", "Egg (optional)"]
      },
      {
        name: "Hearty Chicken & Rice Soup",
        description: "A warming comfort food soup packed with nutrients, perfect for cold days.",
        difficulty: "easy",
        prepTime: 5,
        cookTime: 15,
        additionalNeeded: ["Vegetable broth", "Carrots", "Celery", "Thyme"]
      },
      {
        name: "AI-Style Chicken Rice Bowls",
        description: "A modular, healthy bowl loaded with seasoned chicken, warm rice, fresh veggies, and a quick drizzle of spicy mayo.",
        difficulty: "easy",
        prepTime: 10,
        cookTime: 5,
        additionalNeeded: ["Mayonnaise", "Sriracha", "Cucumber", "Sesame seeds"]
      }
    ];
  }

  return [
    {
      name: "SmartChef Savory Stir-Fry",
      description: `A fast, custom stir-fry utilizing your leftovers: "${leftovers}".`,
      difficulty: "easy",
      prepTime: 10,
      cookTime: 10,
      additionalNeeded: ["Soy sauce", "Cooking Oil", "Garlic", "Ginger"]
    },
    {
      name: "Chef's Scrambled Skillet Hash",
      description: "Toss leftovers in a pan with diced potatoes or eggs for a wholesome breakfast hash.",
      difficulty: "easy",
      prepTime: 10,
      cookTime: 12,
      additionalNeeded: ["Eggs or Potatoes", "Salt", "Pepper", "Oil"]
    }
  ];
}

function simulateMealPlanner(goals, preferences, days) {
  const planDays = [];
  const proteinGoal = goals.highProtein ? '140g' : '75g';
  const calorieTarget = goals.weightLoss ? 1600 : (goals.muscleGain ? 2600 : 2000);
  
  for (let i = 1; i <= days; i++) {
    planDays.push({
      dayNumber: i,
      meals: {
        breakfast: {
          name: "High-Protein Oatmeal with Berries and Whey",
          calories: Math.round(calorieTarget * 0.25),
          protein: goals.highProtein ? "30g" : "15g",
          carbs: "50g",
          fat: "8g"
        },
        lunch: {
          name: "Grilled Chicken Breast (or Tofu) with Quinoa & Steamed Broccoli",
          calories: Math.round(calorieTarget * 0.35),
          protein: goals.highProtein ? "45g" : "25g",
          carbs: "60g",
          fat: "12g"
        },
        dinner: {
          name: "Baked Salmon (or Chickpea Steaks) with Roasted Sweet Potatoes & Asparagus",
          calories: Math.round(calorieTarget * 0.30),
          protein: goals.highProtein ? "40g" : "20g",
          carbs: "45g",
          fat: "15g"
        },
        snacks: {
          name: "Greek Yogurt with Mixed Nuts & Honey",
          calories: Math.round(calorieTarget * 0.10),
          protein: "15g",
          carbs: "15g",
          fat: "5g"
        }
      }
    });
  }

  return {
    title: "AI Optimized Meal Plan",
    summary: `A personalized ${days}-day nutritional program designed for goals: ${JSON.stringify(goals)}. Designed around dietary constraints: ${preferences || 'none'}.`,
    days: planDays
  };
}

function simulateQualityDiagnosis() {
  return {
    doneness: "undercooked inside, but slightly charred outside (indicates heat was too high)",
    texture: "Slightly wet or soggy dough consistency",
    colorAssessment: "Uneven browning, too pale on the edges",
    mistakesDetected: [
      "Stove heat was set to high rather than medium-low",
      "Dough had slightly too much liquid water relative to flour",
      "The pan was not pre-heated long enough"
    ],
    improvementTips: [
      "Lower the flame immediately and cover with a lid to let the steam cook the center.",
      "Add 1-2 tablespoons of flour to the edges if the dough feels sticky or runny.",
      "For an even golden color, brush the outer edges with oil or melted butter before cooking."
    ]
  };
}

function simulateVideoAnalysis() {
  return {
    techniqueAssessment: "Knife holding style: Claw grip is correct, but your dicing motion is vertical instead of circular rocking. Rocking ensures smoother cuts and saves energy.",
    heatControl: "Pan heat appears too high. The oil is smoking slightly, which will burn garlic and spices instantly.",
    mistakes: [
      "Pan overcrowding: Too much chicken added at once, causing the meat to steam rather than sear.",
      "Stirring too frequently, which prevents caramelized browning."
    ],
    remedies: [
      "Sear chicken in batches to keep pan temperature high.",
      "Lower the heat to medium before throwing in garlic and minced onion.",
      "Let the chicken sit undisturbed for 2 minutes on the hot pan to get a crisp sear before turning."
    ]
  };
}

function getFoodImage(name) {
  const lname = name.toLowerCase();
  
  if (lname.includes('okra') || lname.includes('ladies finger') || lname.includes('bhindi') || lname.includes('bendakaya')) {
    return 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=800'; // Indian Spiced Bhindi Okra Fry
  }
  if (lname.includes('biryani') || lname.includes('pulao') || lname.includes('fried rice')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800'; // Biryani/Rice
  }
  if (lname.includes('paneer') || lname.includes('tikka') || lname.includes('butter chicken') || lname.includes('curry') || lname.includes('masala')) {
    return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800'; // Curry/Indian Masala
  }
  if (lname.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800'; // Pizza
  }
  if (lname.includes('burger') || lname.includes('sandwich')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800'; // Burger
  }
  if (lname.includes('pasta') || lname.includes('spaghetti') || lname.includes('noodle')) {
    return 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=800'; // Pasta
  }
  if (lname.includes('taco') || lname.includes('quesadilla') || lname.includes('burrito')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800'; // Tacos/Mexican
  }
  if (lname.includes('salad') || lname.includes('healthy') || lname.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800'; // Salad
  }
  if (lname.includes('cake') || lname.includes('chocolate') || lname.includes('dessert') || lname.includes('sweet') || lname.includes('cookie') || lname.includes('pastry')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800'; // Chocolate Dessert/Cake
  }
  if (lname.includes('pancake') || lname.includes('waffle') || lname.includes('breakfast')) {
    return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800'; // Pancakes
  }
  if (lname.includes('egg') || lname.includes('omelette') || lname.includes('bhurji')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800'; // Eggs/Omelette
  }
  if (lname.includes('soup') || lname.includes('broth')) {
    return 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?q=80&w=800'; // Soup
  }
  if (lname.includes('fish') || lname.includes('salmon') || lname.includes('shrimp') || lname.includes('seafood')) {
    return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800'; // Seafood
  }
  if (lname.includes('chicken') || lname.includes('wing') || lname.includes('kabab')) {
    return 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=800'; // Chicken/Kabab
  }

  // General fallback - default salad plate photo
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800';
}

/**
 * Generate any recipe from around the world on-the-fly
 */
const generateRecipeOnTheFly = async (recipeName) => {
  if (process.env.USE_MOCK_AI === 'true') {
    return simulateRecipeGeneration(recipeName);
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a world-class chef and nutritionist. Generate a comprehensive, professional recipe for: "${recipeName}".
    Return the response as a valid JSON object matching this schema (do not include any markdown formatting like \`\`\`json, just return the raw string representing the JSON):
    {
      "name": "${recipeName}",
      "description": "Appetizing description of the dish",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      "prepTime": 15,
      "cookTime": 20,
      "difficulty": "easy",
      "calories": 450,
      "nutrition": {
        "protein": "25g",
        "carbs": "45g",
        "fat": "15g",
        "fiber": "4g"
      },
      "cuisine": "Country/Region style, e.g. Italian, Mexican, Japanese",
      "mealType": "Breakfast",
      "dietaryTags": ["Vegetarian", "Vegan", "High Protein", "Weight Loss"],
      "baseServings": 2,
      "ingredients": [
        { "name": "Ingredient Name", "amount": 100, "unit": "g", "substitutes": ["Alternative Ingredient"] }
      ],
      "equipment": ["Pan", "Knife"],
      "instructions": [
        { "step": 1, "text": "Step by step instructions" }
      ],
      "tips": ["Cooking tips for perfection"],
      "commonMistakes": [
        { "mistake": "Common mistake", "fix": "How to fix it" }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Strip markdown wrappers
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const recipe = JSON.parse(text);
    
    // Enrich image if it is the generic fallback
    if (!recipe.image || recipe.image.includes('photo-1546069901-ba9599a7e63c')) {
      recipe.image = getFoodImage(recipe.name);
    }
    return recipe;
  } catch (err) {
    console.error('Failed to generate recipe on the fly, using local mock:', err.message);
    return simulateRecipeGeneration(recipeName);
  }
};

function simulateRecipeGeneration(recipeName) {
  // Capitalize first letters
  const title = recipeName.replace(/\b\w/g, c => c.toUpperCase());
  return {
    name: title,
    description: `A mouthwatering, homemade preparation of ${title} crafted using fresh spices and wholesome ingredients.`,
    image: getFoodImage(title),
    prepTime: 15,
    cookTime: 25,
    difficulty: "medium",
    calories: 380,
    nutrition: {
      protein: "10g",
      carbs: "45g",
      fat: "14g",
      fiber: "6g"
    },
    cuisine: "Indian",
    mealType: "Lunch",
    dietaryTags: ["Vegetarian", "Vegan"],
    baseServings: 2,
    ingredients: [
      { name: `Fresh Okra (Ladies Finger / Bhindi)`, amount: 300, unit: "g", substitutes: ["Ivy Gourd (Tindora)"] },
      { name: "Cooking Oil / Mustard Oil", amount: 2, unit: "tbsp", substitutes: ["Sunflower Oil"] },
      { name: "Sliced Onions & Green Chillies", amount: 1, unit: "cup", substitutes: ["Shallots"] },
      { name: "Turmeric, Cumin & Garam Masala mix", amount: 1.5, unit: "tsp", substitutes: ["Salt & Pepper"] }
    ],
    equipment: ["Frying Pan or Kadai", "Chopping Board", "Stirring Spatula"],
    instructions: [
      { step: 1, text: "Wash okra thoroughly and dry completely with a towel (vital to prevent sliminess). Cut into 1-inch rounds." },
      { step: 2, text: "Heat oil in your pan until hot. Add cumin seeds, sliced onions, and chopped green chillies. Sauté until lightly golden." },
      { step: 3, text: "Add the sliced okra and cook uncovered on medium heat for 10 minutes, stirring gently occasionally." },
      { step: 4, text: "Sprinkle turmeric, masala, and salt. Cook for another 5 minutes until crispy and tender. Garnish and serve." }
    ],
    tips: [
      "Okra must be completely dry before slicing to prevent it from turning sticky/slimy in the pan.",
      "Never cover okra with a lid while cooking; steam makes it soft and slimy instead of crispy."
    ],
    commonMistakes: [
      { mistake: "Okra is slimy and sticky", fix: "Sauté on medium-high heat uncovered, and do not add salt until the okra is half-cooked." }
    ],
    ratings: [],
    averageRating: 4.6,
    isFeatured: false
  };
}

module.exports = {
  askChef,
  scanIngredientsFromImage,
  suggestLeftoverRecipes,
  generateMealPlan,
  analyzeCookingQuality,
  analyzeCookingVideo,
  generateRecipeOnTheFly
};
