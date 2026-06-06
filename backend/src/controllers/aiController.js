const geminiService = require('../services/geminiService');
const Conversation = require('../models/Conversation');

// 1. AI Chef Assistant Chat
exports.chat = async (req, res) => {
  const { message, conversationId } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    let conversation;
    let history = [];

    if (userId) {
      if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, user: userId });
      } else {
        conversation = await Conversation.findOne({ user: userId }).sort({ updatedAt: -1 });
      }

      if (conversation) {
        history = conversation.messages;
      } else {
        conversation = new Conversation({ user: userId, messages: [] });
      }
    }

    // Call Gemini API service
    const reply = await geminiService.askChef(message, history);

    if (userId) {
      conversation.messages.push({ sender: 'user', text: message });
      conversation.messages.push({ sender: 'ai', text: reply });
      await conversation.save();
    }

    res.json({
      reply,
      conversationId: conversation ? conversation._id : null,
      messages: conversation ? conversation.messages : [{ sender: 'user', text: message }, { sender: 'ai', text: reply }]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. Scan Ingredients from image
exports.scanIngredients = async (req, res) => {
  try {
    let base64Data;
    let mimeType;

    if (req.file) {
      // Multer file upload
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.image) {
      // Direct base64 string
      const match = req.body.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = req.body.image;
        mimeType = 'image/jpeg';
      }
    } else {
      return res.status(400).json({ msg: 'Please upload or provide an image' });
    }

    const analysis = await geminiService.scanIngredientsFromImage(base64Data, mimeType);
    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 3. Leftover Food Recipe Generator
exports.leftovers = async (req, res) => {
  const { leftovers } = req.body;

  if (!leftovers) {
    return res.status(400).json({ msg: 'Please provide leftovers list' });
  }

  try {
    const recipes = await geminiService.suggestLeftoverRecipes(leftovers);
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 4. Meal Planner
exports.mealPlan = async (req, res) => {
  const { preferences, days, goals } = req.body; // e.g. goals: { weightLoss: true }

  try {
    const plan = await geminiService.generateMealPlan(goals || {}, preferences, days || 7);
    res.json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 5. Image Doneness & Quality Diagnosis
exports.diagnoseImage = async (req, res) => {
  try {
    let base64Data;
    let mimeType;

    if (req.file) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.image) {
      const match = req.body.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = req.body.image;
        mimeType = 'image/jpeg';
      }
    } else {
      return res.status(400).json({ msg: 'Please provide cooking image file' });
    }

    const diagnosis = await geminiService.analyzeCookingQuality(base64Data, mimeType);
    res.json(diagnosis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 6. Video Technique Analysis
exports.analyzeVideo = async (req, res) => {
  try {
    let base64Data;
    let mimeType;

    if (req.file) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.video) {
      const match = req.body.video.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = req.body.video;
        mimeType = 'video/mp4';
      }
    } else {
      return res.status(400).json({ msg: 'Please provide cooking video' });
    }

    const analysis = await geminiService.analyzeCookingVideo(base64Data, mimeType);
    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
