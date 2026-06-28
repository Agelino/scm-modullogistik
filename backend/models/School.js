const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama sekolah wajib diisi'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Alamat wajib diisi']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  totalStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  portionsNeeded: {
    type: Number,
    default: 0,
    min: 0
  },
  contactPerson: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    default: null
  },
  password: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

schoolSchema.index({ location: '2dsphere' });

// Auto-calculate portions based on students
schoolSchema.pre('save', function(next) {
  if (this.isModified('totalStudents')) {
    this.portionsNeeded = this.totalStudents; // 1 porsi per siswa
  }
  next();
});

module.exports = mongoose.model('School', schoolSchema);
