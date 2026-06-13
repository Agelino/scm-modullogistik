const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('assignedDrivers', 'name phone status employeeId').sort({ plateNumber: 1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedDrivers', 'name phone status employeeId');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedDrivers', 'name phone status employeeId');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/vehicles/:id/assign-driver
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'driverId wajib diisi' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver tidak ditemukan' });

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });

    // Check if driver already assigned
    if (vehicle.assignedDrivers.includes(driverId)) {
      return res.status(400).json({ success: false, message: 'Driver sudah di-assign ke kendaraan ini' });
    }

    vehicle.assignedDrivers.push(driverId);
    await vehicle.save();

    const populated = await Vehicle.findById(vehicle._id).populate('assignedDrivers', 'name phone status employeeId');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/vehicles/:id/remove-driver/:driverId
exports.removeDriver = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });

    vehicle.assignedDrivers = vehicle.assignedDrivers.filter(
      (d) => d.toString() !== req.params.driverId
    );
    await vehicle.save();

    const populated = await Vehicle.findById(vehicle._id).populate('assignedDrivers', 'name phone status employeeId');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
