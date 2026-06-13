const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPlan',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  portions: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'rejected'],
    default: 'pending'
  },
  receivedBy: {
    type: String,
    default: ''
  },
  photoProof: {
    type: String,
    default: ''
  },
  signature: {
    type: String,
    default: '' // base64 encoded
  },
  receivedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  temperature: {
    type: Number,
    default: null // suhu makanan saat diterima
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);
