const groceryService = require('../services/groceryService');

// Compare prices across Blinkit, Zepto, Swiggy Instamart, BigBasket
exports.comparePrices = async (req, res) => {
  const { items } = req.body; // Array of { name, amount, unit }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: 'Please provide a non-empty list of ingredients' });
  }

  try {
    const comparisonResult = await groceryService.compareGroceryPrices(items);
    res.json(comparisonResult);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
