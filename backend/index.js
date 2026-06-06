require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { initGemini } = require('./src/config/gemini');

// Initialize Express App
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Test route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    mockDatabase: process.env.USE_MOCK_DB === 'true',
    mockAI: process.env.USE_MOCK_AI === 'true'
  });
});

// Bind Endpoints
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/recipes', require('./src/routes/recipes'));
app.use('/api/collections', require('./src/routes/collections'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/grocery', require('./src/routes/grocery'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Port configuration
const PORT = process.env.PORT || 5001;

// Connect Database & Start Server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize Gemini API
  initGemini();

  app.listen(PORT, () => {
    console.log(`🚀 SmartChef Backend running on http://localhost:${PORT}`);
    console.log(`📁 Health endpoint: http://localhost:${PORT}/health`);
  });
};

startServer();
