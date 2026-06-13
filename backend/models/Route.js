const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  deliveryPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPlan',
    required: true
  },
  origin: {
    name: { type: String, default: 'Dapur Pusat MBG' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    }
  },
  waypoints: [{
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    schoolName: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    order: { type: Number, required: true },
    eta: { type: Date },
    distanceFromPrev: { type: Number, default: 0 } // km
  }],
  totalDistance: {
    type: Number,
    default: 0 // km
  },
  totalDuration: {
    type: Number,
    default: 0 // minutes
  },
  optimizedPath: {
    type: [[Number]], // array of [lng, lat]
    default: []
  },
  algorithm: {
    type: String,
    default: 'nearest-neighbor-tsp'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
