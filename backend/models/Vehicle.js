const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: [true, 'Plat nomor wajib diisi'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Box', 'Pick Up', 'Van', 'Truck']
  },
  capacity: {
    type: Number,
    required: [true, 'Kapasitas muatan wajib diisi'],
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance'],
    default: 'available'
  },
  brand: {
    type: String,
    default: ''
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  fuelType: {
    type: String,
    enum: ['Bensin', 'Solar', 'Gas'],
    default: 'Solar'
  },
  assignedDrivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  }],
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [106.8456, -6.2088] // Jakarta default
    }
  }
}, {
  timestamps: true
});

vehicleSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Vehicle', vehicleSchema);
