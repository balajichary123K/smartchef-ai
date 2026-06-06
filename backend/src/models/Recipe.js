const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
  },
  prepTime: {
    type: Number, // in minutes
    required: true
  },
  cookTime: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  calories: {
    type: Number
  },
  nutrition: {
    protein: { type: String, default: '0g' },
    carbs: { type: String, default: '0g' },
    fat: { type: String, default: '0g' },
    fiber: { type: String, default: '0g' }
  },
  cuisine: {
    type: String,
    required: true,
    index: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'],
    required: true,
    index: true
  },
  dietaryTags: {
    type: [String],
    default: [],
    index: true // vegetarian, vegan, high-protein, weight-loss, keto
  },
  baseServings: {
    type: Number,
    default: 2
  },
  ingredients: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }, // Numerical base quantity for math scaling
    unit: { type: String, required: true },   // g, ml, tsp, units, pieces, etc.
    substitutes: { type: [String], default: [] }
  }],
  equipment: {
    type: [String],
    default: []
  },
  instructions: [{
    step: { type: Number, required: true },
    text: { type: String, required: true }
  }],
  tips: {
    type: [String],
    default: []
  },
  commonMistakes: [{
    mistake: { type: String },
    fix: { type: String }
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 4.5
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
