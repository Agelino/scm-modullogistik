const mongoose = require('mongoose');

const deliveryPlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  schools: [{
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true
    },
    portions: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalPortions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['planned', 'loading', 'in_transit', 'completed', 'cancelled'],
    default: 'planned'
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  departedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

// Auto-calculate total portions
deliveryPlanSchema.pre('save', function(next) {
  if (this.schools && this.schools.length > 0) {
    this.totalPortions = this.schools.reduce((sum, s) => sum + s.portions, 0);
  }
  next();
});

module.exports = mongoose.model('DeliveryPlan', deliveryPlanSchema);
