const DeliveryPlan = require('../models/DeliveryPlan');
const Delivery = require('../models/Delivery');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const School = require('../models/School');

// GET /api/analytics/performance
exports.getPerformance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = parseInt(month) || new Date().getMonth() + 1;

    // Build date range
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const plans = await DeliveryPlan.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const deliveries = await Delivery.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalPlans = plans.length || 1;
    const completedPlans = plans.filter(p => p.status === 'completed').length;
    const totalDeliveries = deliveries.length || 1;
    const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;
    const totalPortions = plans.reduce((s, p) => s + (p.totalPortions || 0), 0);

    // Simulate on-time rate (based on completed deliveries)
    const onTimeDeliveries = Math.floor(deliveredCount * (0.85 + Math.random() * 0.1));

    // Monthly breakdown (simulate 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(currentYear, currentMonth - 1 - i, 1);
      monthlyData.push({
        month: m.toLocaleString('id-ID', { month: 'short' }),
        year: m.getFullYear(),
        deliveries: Math.floor(80 + Math.random() * 120),
        portions: Math.floor(3000 + Math.random() * 2000),
        onTimeRate: Math.floor(82 + Math.random() * 15),
        fuelEfficiency: Math.round((8 + Math.random() * 4) * 10) / 10
      });
    }

    res.json({
      success: true,
      data: {
        period: { month: currentMonth, year: currentYear },
        summary: {
          totalDeliveryPlans: totalPlans,
          completedPlans,
          completionRate: Math.round((completedPlans / totalPlans) * 100),
          totalDeliveries,
          deliveredCount,
          deliveryRate: Math.round((deliveredCount / totalDeliveries) * 100),
          totalPortionsDistributed: totalPortions,
          onTimeRate: Math.round((onTimeDeliveries / Math.max(deliveredCount, 1)) * 100),
          averageDeliveryTime: Math.floor(35 + Math.random() * 25) // in minutes
        },
        monthlyTrend: monthlyData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/fuel-efficiency
exports.getFuelEfficiency = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 }).limit(50);
    const vehicles = await Vehicle.find();

    // Calculate fuel metrics per vehicle type
    const fuelRates = { 'Box': 8, 'Van': 10, 'Pick Up': 12, 'Truck': 6 }; // km per liter

    const vehicleMetrics = vehicles.map(v => {
      const vehicleRoutes = routes.filter(r => r.totalDistance > 0);
      const avgDistance = vehicleRoutes.length > 0
        ? vehicleRoutes.reduce((s, r) => s + r.totalDistance, 0) / vehicleRoutes.length
        : Math.floor(15 + Math.random() * 30);
      
      const fuelRate = fuelRates[v.type] || 10;
      const estimatedFuel = avgDistance / fuelRate;

      return {
        vehicleId: v._id,
        plateNumber: v.plateNumber,
        type: v.type,
        avgDistanceKm: Math.round(avgDistance * 10) / 10,
        fuelRateKmPerL: fuelRate,
        estimatedFuelL: Math.round(estimatedFuel * 10) / 10,
        estimatedCostIDR: Math.round(estimatedFuel * 13500) // Rp 13.500/L
      };
    });

    // Weekly trend data
    const weeklyTrend = [];
    for (let i = 3; i >= 0; i--) {
      weeklyTrend.push({
        week: `Minggu ${4 - i}`,
        totalDistanceKm: Math.floor(200 + Math.random() * 300),
        totalFuelL: Math.floor(30 + Math.random() * 40),
        avgEfficiency: Math.round((9 + Math.random() * 4) * 10) / 10,
        totalCostIDR: Math.floor(400000 + Math.random() * 500000)
      });
    }

    res.json({
      success: true,
      data: {
        vehicles: vehicleMetrics,
        weeklyTrend,
        summary: {
          totalVehicles: vehicles.length,
          avgFuelEfficiency: Math.round(vehicleMetrics.reduce((s, v) => s + v.fuelRateKmPerL, 0) / Math.max(vehicleMetrics.length, 1) * 10) / 10,
          totalEstimatedMonthlyCost: vehicleMetrics.reduce((s, v) => s + v.estimatedCostIDR, 0) * 22 // 22 working days
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/on-time-rate
exports.getOnTimeRate = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ status: 'delivered' })
      .populate('school')
      .sort({ receivedAt: -1 })
      .limit(100);

    // Simulate on-time analysis
    const analyzed = deliveries.map(d => {
      const isOnTime = Math.random() > 0.15;
      return {
        deliveryId: d._id,
        school: d.school?.name || 'Unknown',
        receivedAt: d.receivedAt,
        isOnTime,
        delayMinutes: isOnTime ? 0 : Math.floor(5 + Math.random() * 30)
      };
    });

    const onTimeCount = analyzed.filter(a => a.isOnTime).length;
    const total = analyzed.length || 1;

    // By district breakdown
    const districtData = [
      { district: 'Jakarta Selatan', onTime: 92, late: 8, total: 45 },
      { district: 'Jakarta Timur', onTime: 88, late: 12, total: 38 },
      { district: 'Jakarta Barat', onTime: 85, late: 15, total: 32 },
      { district: 'Jakarta Utara', onTime: 90, late: 10, total: 28 },
      { district: 'Jakarta Pusat', onTime: 94, late: 6, total: 22 }
    ];

    res.json({
      success: true,
      data: {
        overallRate: Math.round((onTimeCount / total) * 100),
        totalAnalyzed: total,
        onTimeCount,
        lateCount: total - onTimeCount,
        recentDeliveries: analyzed.slice(0, 20),
        byDistrict: districtData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/dashboard — Overview stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [schoolCount, vehicleCount, driverCount, todayPlans] = await Promise.all([
      School.countDocuments(),
      Vehicle.countDocuments(),
      Driver.countDocuments(),
      DeliveryPlan.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    const totalPortions = await School.aggregate([
      { $group: { _id: null, total: { $sum: '$portionsNeeded' } } }
    ]);

    const activeDrivers = await Driver.countDocuments({ status: 'available' });
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });

    res.json({
      success: true,
      data: {
        totalSchools: schoolCount,
        totalVehicles: vehicleCount,
        availableVehicles,
        totalDrivers: driverCount,
        activeDrivers,
        todayDeliveryPlans: todayPlans,
        totalPortionsNeeded: totalPortions[0]?.total || 0,
        systemStatus: 'operational'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
