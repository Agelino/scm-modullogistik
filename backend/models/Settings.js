const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'general'
  },
  kitchen: {
    name: { type: String, default: 'Dapur Pusat MBG' },
    address: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [106.8456, -6.2088] } // [lng, lat]
    }
  }
}, { timestamps: true });

settingsSchema.index({ 'kitchen.location': '2dsphere' });

module.exports = mongoose.model('Settings', settingsSchema);
