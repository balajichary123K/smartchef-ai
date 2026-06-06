const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartchef';
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Try for 5 seconds
    });
    console.log('MongoDB connected successfully.');
    process.env.USE_MOCK_DB = 'false';
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.warn('⚠️ Server will run in MOCK DATABASE mode using in-memory mock data.');
    process.env.USE_MOCK_DB = 'true';
  }
};

module.exports = connectDB;
