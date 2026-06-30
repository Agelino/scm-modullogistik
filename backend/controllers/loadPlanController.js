const DeliveryPlan = require('../models/DeliveryPlan');
const Vehicle = require('../models/Vehicle');
const School = require('../models/School');
const Driver = require('../models/Driver');
const { getReadyPortions, getProductionStatus } = require('../services/novalMock');

// GET /api/load-plans/ready-portions — Mock data dari Noval
exports.getReadyPortions = async (req, res) => {
  try {
    const schools = await School.find();
    const portionData = getReadyPortions(schools);
    res.json({ success: true, data: portionData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/load-plans/production-status
exports.getProductionStatus = async (req, res) => {
  try {
    const status = getProductionStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/load-plans/calculate — Auto load balancing
exports.calculateLoadPlan = async (req, res) => {
  try {
    const { date, schoolIds } = req.body;
    
    // Get available vehicles sorted by capacity
    const vehicles = await Vehicle.find({ status: 'available' }).sort({ capacity: -1 });
    if (vehicles.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada kendaraan tersedia' });
    }

    // Get schools with portions needed
    const schools = await School.find(
      schoolIds ? { _id: { $in: schoolIds } } : {}
    ).sort({ portionsNeeded: -1 });

    // First-Fit Decreasing bin packing algorithm
    const assignments = vehicles.map(v => ({
      vehicle: v,
      vehicleId: v._id,
      plateNumber: v.plateNumber,
      capacity: v.capacity,
      remainingCapacity: v.capacity,
      schools: [],
      totalPortions: 0
    }));

    const unassigned = [];

    for (const school of schools) {
      let assigned = false;
      for (const bin of assignments) {
        if (bin.remainingCapacity >= school.portionsNeeded) {
          bin.schools.push({
            school: school._id,
            schoolName: school.name,
            portions: school.portionsNeeded
          });
          bin.totalPortions += school.portionsNeeded;
          bin.remainingCapacity -= school.portionsNeeded;
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        unassigned.push({
          school: school._id,
          schoolName: school.name,
          portions: school.portionsNeeded
        });
      }
    }

    // Filter out empty assignments
    const activeAssignments = assignments.filter(a => a.schools.length > 0);

    res.json({
      success: true,
      data: {
        date: date || new Date().toISOString().split('T')[0],
        assignments: activeAssignments,
        unassigned,
        summary: {
          vehiclesUsed: activeAssignments.length,
          totalVehicles: vehicles.length,
          totalPortionsAssigned: activeAssignments.reduce((s, a) => s + a.totalPortions, 0),
          totalPortionsUnassigned: unassigned.reduce((s, u) => s + u.portions, 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/load-plans
exports.getDeliveryPlans = async (req, res) => {
  try {
    const plans = await DeliveryPlan.find()
      .populate('vehicle')
      .populate('driver')
      .populate('schools.school')
      .populate('route')
      .sort({ date: -1 });
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/load-plans
exports.createDeliveryPlan = async (req, res) => {
  try {
    const plan = await DeliveryPlan.create(req.body);
    const populated = await DeliveryPlan.findById(plan._id)
      .populate('vehicle')
      .populate('driver')
      .populate('schools.school');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/load-plans/driver/:novalDriverId — untuk mobile app driver
exports.getDeliveryPlansByNovalDriver = async (req, res) => {
  try {
    const { novalDriverId } = req.params;

    const driver = await Driver.findOne({ novalDriverId });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver tidak ditemukan' });
    }

    const plans = await DeliveryPlan.find({ driver: driver._id })
      .populate('vehicle', 'plateNumber type capacity brand')
      .populate('driver', 'name phone employeeId novalDriverId rating')
      .populate('schools.school', 'name address location district phone contactPerson')
      .populate('route')
      .sort({ date: -1 });

    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/load-plans/:id/status
exports.updatePlanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'in_transit') update.departedAt = new Date();
    if (status === 'completed') update.completedAt = new Date();
    
    const plan = await DeliveryPlan.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('vehicle').populate('driver').populate('schools.school');
    if (!plan) return res.status(404).json({ success: false, message: 'Plan tidak ditemukan' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
