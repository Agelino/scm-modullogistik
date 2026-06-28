const Settings = require('../models/Settings');

// GET /api/settings — ambil pengaturan (auto-create jika belum ada)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'general' });

    if (!settings) {
      settings = await Settings.create({
        key: 'general',
        kitchen: {
          name: 'Dapur Pusat MBG',
          address: '',
          location: { type: 'Point', coordinates: [106.8456, -6.2088] }
        }
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings — update pengaturan dapur
exports.updateSettings = async (req, res) => {
  try {
    const { kitchenName, kitchenAddress, kitchenCoordinates } = req.body;

    let settings = await Settings.findOne({ key: 'general' });

    if (!settings) {
      settings = new Settings({ key: 'general' });
    }

    if (kitchenName !== undefined) settings.kitchen.name = kitchenName;
    if (kitchenAddress !== undefined) settings.kitchen.address = kitchenAddress;
    if (kitchenCoordinates && Array.isArray(kitchenCoordinates) && kitchenCoordinates.length === 2) {
      settings.kitchen.location.coordinates = kitchenCoordinates; // [lng, lat]
    }

    await settings.save();

    res.json({ success: true, data: settings, message: 'Pengaturan berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/settings/kitchen-location — endpoint ringkas untuk ambil koordinat dapur saja
exports.getKitchenLocation = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'general' });

    const kitchen = settings?.kitchen || {
      name: 'Dapur Pusat MBG',
      location: { coordinates: [106.8456, -6.2088] }
    };

    res.json({
      success: true,
      data: {
        name: kitchen.name,
        address: kitchen.address || '',
        coordinates: kitchen.location.coordinates // [lng, lat]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
