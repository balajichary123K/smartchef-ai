const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; } // Password not required if Google login is used
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'user'
  },
  preferences: {
    dietary: {
      type: [String],
      default: []
    },
    allergies: {
      type: [String],
      default: []
    },
    cookingLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    nutritionGoals: {
      weightLoss: { type: Boolean, default: false },
      muscleGain: { type: Boolean, default: false },
      diabeticFriendly: { type: Boolean, default: false },
      highProtein: { type: Boolean, default: false },
      keto: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false }
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  history: [{
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  groceryList: [{
    name: { type: String, required: true },
    quantity: { type: String, default: '' },
    checked: { type: Boolean, default: false },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
