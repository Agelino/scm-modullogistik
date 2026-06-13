const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Nama driver wajib diisi'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Nomor telepon wajib diisi']
  },
  licenseNumber: {
    type: String,
    default: ''
  },
  licenseExpiry: {
    type: Date,
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  photo: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
