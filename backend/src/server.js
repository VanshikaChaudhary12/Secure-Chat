const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/device');
const keyRoutes = require('./routes/key');
const sessionRoutes = require('./routes/session');
const messageRoutes = require('./routes/message');
const attachmentRoutes = require('./routes/attachment');
const groupRoutes = require('./routes/group');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting - more lenient for authenticated routes
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/key', keyRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/attachment', attachmentRoutes);
app.use('/api/group', groupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});