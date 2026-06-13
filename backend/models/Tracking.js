const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  deliveryPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPlan',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  speed: {
    type: Number,
    default: 0 // km/h
  },
  heading: {
    type: Number,
    default: 0 // degrees
  },
  status: {
    type: String,
    enum: ['departed', 'in_transit', 'arrived', 'idle'],
    default: 'idle'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  battery: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

trackingSchema.index({ currentLocation: '2dsphere' });
trackingSchema.index({ deliveryPlan: 1, timestamp: -1 });

module.exports = mongoose.model('Tracking', trackingSchema);
