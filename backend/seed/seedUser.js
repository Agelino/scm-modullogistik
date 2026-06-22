require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB');

    // Hapus user lama jika ada
    await User.deleteMany({});

    // Buat user default
    const users = [
      { username: 'admin', password: 'admin123', name: 'Admin MBG', role: 'admin' },
      { username: 'supervisor', password: 'super123', name: 'Supervisor Logistik', role: 'supervisor' },
    ];

    for (const userData of users) {
      await User.create(userData);
      console.log(`👤 User dibuat: ${userData.username} (${userData.role})`);
    }

    console.log('🎉 Seeding user selesai!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding:', err);
    process.exit(1);
  }
}

seed();
