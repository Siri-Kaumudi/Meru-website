const express = require('express');
const router = express.Router();
const NewsItem = require('../models/NewsItem');

// GET /api/news — public, active items only
router.get('/', async (req, res) => {
  try {
    const items = await NewsItem.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v')
      .lean();
    res.json({ items });
  } catch (err) {
    console.error('News fetch error:', err);
    res.status(500).json({ message: 'వార్తలు లోడ్ కాలేదు. మళ్ళీ ప్రయత్నించండి.' });
  }
});

module.exports = router;
