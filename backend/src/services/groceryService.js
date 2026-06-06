const { getGenAI } = require('../config/gemini');

/**
 * Compare prices for a list of items across delivery platforms
 */
const compareGroceryPrices = async (itemsList) => {
  // itemsList is an array of { name, amount, unit }
  
  // 1. Generate realistic prices for the platforms
  const platforms = {
    blinkit: {
      name: 'Blinkit',
      deliveryTime: '12 mins',
      deliveryFee: 15,
      items: []
    },
    zepto: {
      name: 'Zepto',
      deliveryTime: '9 mins',
      deliveryFee: 20,
      items: []
    },
    instamart: {
      name: 'Swiggy Instamart',
      deliveryTime: '15 mins',
      deliveryFee: 10,
      items: []
    },
    bigbasket: {
      name: 'BigBasket (bnow)',
      deliveryTime: '30 mins',
      deliveryFee: 0,
      items: []
    }
  };

  // Base price lookup tables for calculation simulation
  const itemBasePrices = {
    chicken: 160, // per 500g
    rice: 70,    // per 1kg
    yogurt: 35,  // per 200g
    onion: 20,   // per 500g
    tomato: 30,  // per 500g
    oil: 150,    // per 1L
    egg: 6,      // per egg
    potato: 15,  // per 500g
    spices: 45,  // per pack
    paneer: 90,  // per 200g
    milk: 28,    // per 500ml
    butter: 55,  // per 100g
    garlic: 25   // per 100g
  };

  const getBasePrice = (name) => {
    const lname = name.toLowerCase();
    for (const [key, value] of Object.entries(itemBasePrices)) {
      if (lname.includes(key)) return value;
    }
    return 40; // Default estimate
  };

  // Calculate items prices with platform variations
  itemsList.forEach((item) => {
    const baseVal = getBasePrice(item.name);
    // Multiply by standard quantity scale
    const scale = item.amount ? Math.ceil(item.amount / 500) || 1 : 1;
    const finalBasePrice = baseVal * scale;

    // Platform multipliers
    // Zepto: slightly higher prices (+5%) but fastest
    // Blinkit: (+2%) moderate speed
    // Swiggy Instamart: (+0%) average
    // BigBasket: (-8%) cheapest but slower
    
    platforms.zepto.items.push({
      name: item.name,
      price: Math.round(finalBasePrice * 1.05),
      available: true
    });
    
    platforms.blinkit.items.push({
      name: item.name,
      price: Math.round(finalBasePrice * 1.02),
      available: true
    });
    
    platforms.instamart.items.push({
      name: item.name,
      // Randomly make 1 item unavailable occasionally to make it realistic
      price: Math.round(finalBasePrice * 1.00),
      available: Math.random() > 0.05
    });
    
    platforms.bigbasket.items.push({
      name: item.name,
      price: Math.round(finalBasePrice * 0.92),
      available: true
    });
  });

  // Calculate platform totals
  const resultPlatforms = [];
  for (const [key, platform] of Object.entries(platforms)) {
    const availableItems = platform.items.filter(i => i.available);
    const subtotal = availableItems.reduce((acc, curr) => acc + curr.price, 0);
    const total = subtotal + platform.deliveryFee;
    const availabilityCount = `${availableItems.length}/${platform.items.length}`;

    resultPlatforms.push({
      id: key,
      name: platform.name,
      deliveryTime: platform.deliveryTime,
      deliveryFee: platform.deliveryFee,
      items: platform.items,
      subtotal,
      total,
      availabilityCount,
      allAvailable: availableItems.length === platform.items.length
    });
  }

  // Generate AI Optimization recommendation
  let recommendation = null;
  if (process.env.USE_MOCK_AI !== 'true') {
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Analyze this comparison list of grocery items across 4 platforms:
      ${JSON.stringify(resultPlatforms, null, 2)}
      
      Suggest:
      1. Which platform offers the Best Value, Best Price, and Fastest Delivery.
      2. 3 AI Assistant suggestions (e.g. bulk buying, generic brand replacement, combo deals).
      Return output in JSON format:
      {
        "bestPricePlatform": "Platform Name",
        "fastestPlatform": "Platform Name",
        "bestValuePlatform": "Platform Name",
        "reasoning": "Quick explanation why one is best",
        "savingsTips": [
          "Buying a 1kg packet of Rice on BigBasket is 20% cheaper than two 500g packs.",
          "Substitute brand X butter with store-brand butter to save Rs.15."
        ]
      }`;
      
      const response = await model.generateContent(prompt);
      const text = (await response.response).text().replace(/```json/g, '').replace(/```/g, '').trim();
      recommendation = JSON.parse(text);
    } catch (err) {
      console.error('Gemini Grocery Optimizer failed, using local rule generator:', err.message);
    }
  }

  // Local fallback recommendation generator
  if (!recommendation) {
    // Find best price and fastest
    const sortedByPrice = [...resultPlatforms].sort((a, b) => a.total - b.total);
    const bestPrice = sortedByPrice[0].name;
    
    // Zepto is always fastest in our mocks
    const fastest = 'Zepto';
    
    // Best value (usually Instamart or BigBasket)
    const bestValue = sortedByPrice.find(p => p.allAvailable)?.name || sortedByPrice[0].name;

    const tips = [
      "Buying pantry staples in larger packs (e.g., 1kg Rice, 1L Oil) generally saves 15-22% over small sachets.",
      "Consider using loose onions and potatoes rather than pre-packed mesh bags to save up to 10% on fresh produce.",
      "Check Swiggy Instamart's 'Deals of the Day' tab; they frequently run buy-one-get-one deals on yogurt and paneer."
    ];

    // Customize tips based on items
    const itemNames = itemsList.map(i => i.name.toLowerCase());
    if (itemNames.some(n => n.includes('rice'))) {
      tips.unshift("Bulk Deal: Buying 1kg Basmati Rice on BigBasket costs Rs.70, saving Rs.15 compared to Zepto's 500g packets.");
    }
    if (itemNames.some(n => n.includes('chicken'))) {
      tips.push("Fresh Saving: Swiggy Instamart is offering a flat 10% discount on fresh chicken breast packs today.");
    }

    recommendation = {
      bestPricePlatform: bestPrice,
      fastestPlatform: fastest,
      bestValuePlatform: bestValue,
      reasoning: `${bestPrice} has the lowest total cost of Rs.${sortedByPrice[0].total} (including delivery fees), while Zepto provides sub-10 minute delivery if you are in a rush.`,
      savingsTips: tips.slice(0, 3)
    };
  }

  return {
    platforms: resultPlatforms,
    recommendation
  };
};

module.exports = {
  compareGroceryPrices
};
