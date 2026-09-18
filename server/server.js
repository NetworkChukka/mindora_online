require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { initSocketIO } = require('./sockets/socketManager');
const { errorHandler } = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const server = http.createServer(app);

// Initialize DB
connectDB();

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Helmet Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests. Please try again shortly.' }
});
app.use('/api/', apiLimiter);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
initSocketIO(io);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', healthRoutes);

// Serve static frontend build in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('MINDORA API Server Running.');
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  MINDORA MICROBIOLOGY EXHIBITION SERVER RUNNING   `);
    console.log(`  Port: ${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
