const mongoose = require('mongoose');

const newsItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'శీర్షిక 200 అక్షరాలు మించకూడదు'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'వివరణ 500 అక్షరాలు మించకూడదు'],
    },
    imageData: {
      type: String, // base64 data URL
      required: [true, 'ఫోటో తప్పనిసరి'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

newsItemSchema.index({ isActive: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model('NewsItem', newsItemSchema);
