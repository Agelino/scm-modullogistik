const bcrypt = require('bcryptjs');
const School = require('../models/School');

// GET /api/schools
exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find().select('-password').sort({ name: 1 });
    res.json({ success: true, count: schools.length, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/schools/:id
exports.getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id).select('-password');
    if (!school) return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan' });
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/schools
exports.createSchool = async (req, res) => {
  try {
    const { name, address, lat, lng, totalStudents, contactPerson, phone, district, username, password } = req.body;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    const finalLat = isNaN(parsedLat) ? -6.9175 : parsedLat;
    const finalLng = isNaN(parsedLng) ? 107.6191 : parsedLng;

    const schoolData = {
      name,
      address,
      location: { type: 'Point', coordinates: [finalLng, finalLat] },
      totalStudents: parseInt(totalStudents) || 0,
      portionsNeeded: parseInt(totalStudents) || 0,
      contactPerson: contactPerson || '',
      phone: phone || '',
      district: district || '',
      username: username || null,
    };

    if (password) {
      schoolData.password = await bcrypt.hash(password, 10);
    }

    const school = await School.create(schoolData);
    const result = school.toObject();
    delete result.password;

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/schools/:id
exports.updateSchool = async (req, res) => {
  try {
    const { name, address, lat, lng, totalStudents, contactPerson, phone, district, username, password } = req.body;

    const updateData = {
      name,
      address,
      contactPerson: contactPerson || '',
      phone: phone || '',
      district: district || '',
      username: username || null,
    };

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      updateData.location = { type: 'Point', coordinates: [parsedLng, parsedLat] };
    }

    if (totalStudents !== undefined) {
      updateData.totalStudents = parseInt(totalStudents) || 0;
      updateData.portionsNeeded = parseInt(totalStudents) || 0;
    }

    // Hanya hash & update password jika field diisi
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const school = await School.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
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

// POST /api/schools/login  — dipakai mobile app
exports.schoolLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const school = await School.findOne({ username });
    if (!school || !school.password) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const match = await bcrypt.compare(password, school.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const result = school.toObject();
    delete result.password;

    res.json({ success: true, data: result });
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
