const Tracking = require('../models/Tracking');

// POST /api/tracking/update
exports.updateLocation = async (req, res) => {
  try {
    const { deliveryPlanId, driverId, vehicleId, lat, lng, speed, heading, status } = req.body;
    
    const tracking = await Tracking.create({
      deliveryPlan: deliveryPlanId,
      driver: driverId,
      vehicle: vehicleId,
      currentLocation: { type: 'Point', coordinates: [lng, lat] },
      speed: speed || 0,
      heading: heading || 0,
      status: status || 'in_transit'
    });

    res.status(201).json({ success: true, data: tracking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/tracking/:planId
exports.getTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findOne({ deliveryPlan: req.params.planId })
      .sort({ timestamp: -1 })
      .populate('driver')
      .populate('vehicle');
    
    if (!tracking) return res.status(404).json({ success: false, message: 'Data tracking tidak ditemukan' });
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tracking/:planId/history
exports.getTrackingHistory = async (req, res) => {
  try {
    const history = await Tracking.find({ deliveryPlan: req.params.planId })
      .sort({ timestamp: 1 })
      .limit(500);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tracking/active/all — All active fleet positions
exports.getActiveFleet = async (req, res) => {
  try {
    // Get latest tracking for each active delivery plan
    const activeTracking = await Tracking.aggregate([
      { $match: { status: { $in: ['departed', 'in_transit'] } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$deliveryPlan',
          latestTracking: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestTracking' } }
    ]);

    // Populate references
    const populated = await Tracking.populate(activeTracking, [
      { path: 'driver', select: 'name phone' },
      { path: 'vehicle', select: 'plateNumber type' }
    ]);

    res.json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
