const School = require('../models/School');

// GET /api/schools
exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.json({ success: true, count: schools.length, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/schools/:id
exports.getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan' });
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/schools
exports.createSchool = async (req, res) => {
  try {
    const { name, address, lat, lng, totalStudents, contactPerson, phone, district } = req.body;
    const school = await School.create({
      name, address,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      totalStudents: parseInt(totalStudents) || 0,
      portionsNeeded: parseInt(totalStudents) || 0,
      contactPerson, phone, district
    });
    res.status(201).json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/schools/:id
exports.updateSchool = async (req, res) => {
  try {
    const { name, address, lat, lng, totalStudents, contactPerson, phone, district } = req.body;
    const updateData = { name, address, contactPerson, phone, district };
    if (lat && lng) {
      updateData.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    }
    if (totalStudents !== undefined) {
      updateData.totalStudents = parseInt(totalStudents);
      updateData.portionsNeeded = parseInt(totalStudents);
    }
    const school = await School.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!school) return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan' });
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/schools/:id
exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/schools/stats/portions
exports.getPortionStats = async (req, res) => {
  try {
    const stats = await School.aggregate([
      {
        $group: {
          _id: null,
          totalSchools: { $sum: 1 },
          totalStudents: { $sum: '$totalStudents' },
          totalPortions: { $sum: '$portionsNeeded' }
        }
      }
    ]);
    res.json({
      success: true,
      data: stats[0] || { totalSchools: 0, totalStudents: 0, totalPortions: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/schools/geocode?q=address
// Geocoding menggunakan Nominatim (OpenStreetMap) — GRATIS, tanpa API key
exports.geocode = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query alamat wajib diisi' });

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=id&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SCM-MBG-Logistics/1.0' }
    });
    const data = await response.json();

    const results = data.map(item => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      district: item.address?.suburb || item.address?.city_district || item.address?.city || '',
      type: item.type
    }));

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
