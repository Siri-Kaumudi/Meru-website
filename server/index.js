const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const memberRoutes = require('./routes/members');
const adminRoutes = require('./routes/admin');
const newsRoutes = require('./routes/news');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

app.use('/api/members', memberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meru-website';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected:', MONGO_URI);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
