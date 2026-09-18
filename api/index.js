const app = require('../server/server');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB Connection Error:', err.message);
    if (req.url && req.url.startsWith('/api')) {
      return res.status(503).json({
        success: false,
        message: err.message || 'Database connection failure. Please check MONGODB_URI in Vercel settings and MongoDB Atlas IP access list.'
      });
    }
  }
  return app(req, res);
};
