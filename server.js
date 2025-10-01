require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('./socketio');
const connectDB = require('./config/db');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const countyRoutes = require('./routes/countyRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dspRoutes = require('./routes/dspRoutes');
const messagingRoutes = require('./routes/messagingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const trainerRoutes = require('./routes/trainerRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();
socketio.init(server);

// Parse multiple URLs from CLIENT_URL
const getAllowedOrigins = () => {
  if (process.env.CLIENT_URL) {
    if (process.env.CLIENT_URL.includes(',')) {
      return process.env.CLIENT_URL.split(',').map(url => url.trim());
    }
    return [process.env.CLIENT_URL];
  }
  return ['https://shiflink-frontend.vercel.app', 'http://localhost:3000'];
};

const allowedOrigins = getAllowedOrigins();

console.log('🔄 Allowed CORS origins:', allowedOrigins);

// CORS Middleware - UPDATED
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('🚫 Blocked by CORS:', origin);
      const msg = `The CORS policy does not allow access from ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/county', countyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dsp', dspRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/trainer', trainerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    allowedOrigins: allowedOrigins
  });
});

// Test endpoint
app.get('/', (req, res) => {
  res.send('ShiftLink Backend Running!');
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});