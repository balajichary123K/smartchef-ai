const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not defined. Server will run in MOCK AI mode.');
    process.env.USE_MOCK_AI = 'true';
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    process.env.USE_MOCK_AI = 'false';
    console.log('Gemini AI initialized successfully.');
    return genAI;
  } catch (err) {
    console.error('Failed to initialize Gemini AI:', err.message);
    console.warn('⚠️ Server will run in MOCK AI mode.');
    process.env.USE_MOCK_AI = 'true';
    return null;
  }
};

const getGenAI = () => {
  if (!genAI && process.env.USE_MOCK_AI !== 'true') {
    return initGemini();
  }
  return genAI;
};

module.exports = {
  initGemini,
  getGenAI
};
