const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'Sekolah wajib diisi']
  },
  name: {
    type: String,
    required: [true, 'Nama siswa wajib diisi'],
    trim: true
  },
  studentId: {
    type: String,
    trim: true,
    default: ''
  },
  className: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

studentSchema.index({ school: 1, name: 1 });

module.exports = mongoose.model('Student', studentSchema);
