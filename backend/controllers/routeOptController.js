const Route = require('../models/Route');
const School = require('../models/School');
const { optimizeRoute, optimizeRouteOSRM } = require('../services/routeOptimizer');

// POST /api/routes/optimize
exports.optimize = async (req, res) => {
  try {
    const { originCoords, schoolIds, deliveryPlanId, useOSRM } = req.body;
    
    // Default origin: Dapur Pusat MBG Jakarta
    const origin = originCoords || [106.8456, -6.2088];
    
    // Get school data
    let schools;
    if (schoolIds && schoolIds.length > 0) {
      schools = await School.find({ _id: { $in: schoolIds } });
    } else {
      schools = await School.find();
    }

    if (schools.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada sekolah tujuan' });
    }

    // Run optimization (OSRM or Haversine)
    let result;
    if (useOSRM !== false) {
      result = await optimizeRouteOSRM(origin, schools);
    } else {
      result = optimizeRoute(origin, schools);
    }

    // Save route if deliveryPlanId provided
    if (deliveryPlanId) {
      const route = await Route.create({
        deliveryPlan: deliveryPlanId,
        origin: {
          name: 'Dapur Pusat MBG',
          location: { type: 'Point', coordinates: origin }
        },
        waypoints: result.waypoints,
        totalDistance: result.totalDistance,
        totalDuration: result.totalDuration,
        optimizedPath: result.optimizedPath,
        algorithm: result.algorithm
      });

      return res.json({ success: true, data: route });
    }

    res.json({
      success: true,
      data: {
        origin: { name: 'Dapur Pusat MBG', coordinates: origin },
        ...result
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/routes/:planId
exports.getRouteByPlan = async (req, res) => {
  try {
    const route = await Route.findOne({ deliveryPlan: req.params.planId })
      .populate('waypoints.school');
    if (!route) return res.status(404).json({ success: false, message: 'Rute tidak ditemukan' });
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/routes
exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate('deliveryPlan').sort({ createdAt: -1 });
    res.json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
