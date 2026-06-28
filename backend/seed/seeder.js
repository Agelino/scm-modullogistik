require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const School = require('../models/School');
const Student = require('../models/Student');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const DeliveryPlan = require('../models/DeliveryPlan');
const Delivery = require('../models/Delivery');
const Settings = require('../models/Settings');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scm_mbg';

// ===================== SEED DATA — Bandung Area =====================

const schoolsData = [
  { name: 'SDN Lengkong 01', address: 'Jl. Lengkong Besar No.12, Lengkong, Bandung', location: { type: 'Point', coordinates: [107.6145, -6.9270] }, totalStudents: 320, portionsNeeded: 320, contactPerson: 'Ibu Sari Mulyani', phone: '081234567001', district: 'Lengkong' },
  { name: 'SDN Turangga 03', address: 'Jl. Turangga No.8, Lengkong, Bandung', location: { type: 'Point', coordinates: [107.6312, -6.9340] }, totalStudents: 280, portionsNeeded: 280, contactPerson: 'Bapak Hendra Kusuma', phone: '081234567002', district: 'Lengkong' },
  { name: 'SDN Buah Batu 05', address: 'Jl. Buah Batu No.25, Bandung', location: { type: 'Point', coordinates: [107.6370, -6.9425] }, totalStudents: 350, portionsNeeded: 350, contactPerson: 'Ibu Dewi Anggraeni', phone: '081234567003', district: 'Bandung Kidul' },
  { name: 'SDN Cibeunying 02', address: 'Jl. Cibeunying Kolot No.15, Bandung', location: { type: 'Point', coordinates: [107.6250, -6.8980] }, totalStudents: 290, portionsNeeded: 290, contactPerson: 'Bapak Arif Hidayat', phone: '081234567004', district: 'Cibeunying Kaler' },
  { name: 'SDN Dago 04', address: 'Jl. Ir. H. Juanda No.45, Dago, Bandung', location: { type: 'Point', coordinates: [107.6180, -6.8850] }, totalStudents: 310, portionsNeeded: 310, contactPerson: 'Ibu Ratna Dewi', phone: '081234567005', district: 'Coblong' },
  { name: 'SDN Antapani 08', address: 'Jl. Antapani Lama No.18, Bandung', location: { type: 'Point', coordinates: [107.6520, -6.9120] }, totalStudents: 400, portionsNeeded: 400, contactPerson: 'Bapak Joko Prasetyo', phone: '081234567006', district: 'Antapani' },
  { name: 'SDN Cicadas 06', address: 'Jl. Cicadas No.30, Bandung', location: { type: 'Point', coordinates: [107.6440, -6.9050] }, totalStudents: 380, portionsNeeded: 380, contactPerson: 'Ibu Linda Permatasari', phone: '081234567007', district: 'Cibeunying Kidul' },
  { name: 'SDN Kopo 11', address: 'Jl. Kopo No.55, Bandung', location: { type: 'Point', coordinates: [107.5930, -6.9470] }, totalStudents: 260, portionsNeeded: 260, contactPerson: 'Bapak Rudi Hartono', phone: '081234567008', district: 'Bojongloa Kaler' },
  { name: 'SDN Pasteur 09', address: 'Jl. Dr. Djunjunan No.22, Pasteur, Bandung', location: { type: 'Point', coordinates: [107.5980, -6.8930] }, totalStudents: 340, portionsNeeded: 340, contactPerson: 'Ibu Mega Sari', phone: '081234567009', district: 'Sukajadi' },
  { name: 'SDN Cimahi 07', address: 'Jl. Raya Cimahi No.10, Bandung Barat', location: { type: 'Point', coordinates: [107.5420, -6.8850] }, totalStudents: 300, portionsNeeded: 300, contactPerson: 'Bapak Andi Firmansyah', phone: '081234567010', district: 'Cimahi Tengah' },
  { name: 'SDN Arcamanik 12', address: 'Jl. Arcamanik Endah No.8, Bandung', location: { type: 'Point', coordinates: [107.6680, -6.9180] }, totalStudents: 270, portionsNeeded: 270, contactPerson: 'Ibu Fitri Handayani', phone: '081234567011', district: 'Arcamanik' },
  { name: 'SDN Ujung Berung 03', address: 'Jl. AH. Nasution No.70, Bandung', location: { type: 'Point', coordinates: [107.6910, -6.9080] }, totalStudents: 330, portionsNeeded: 330, contactPerson: 'Bapak Wahyu Setiawan', phone: '081234567012', district: 'Ujung Berung' },
  { name: 'SDN Gedebage 15', address: 'Jl. Gedebage Selatan No.20, Bandung', location: { type: 'Point', coordinates: [107.6980, -6.9420] }, totalStudents: 220, portionsNeeded: 220, contactPerson: 'Ibu Nani Sumarni', phone: '081234567013', district: 'Gedebage' },
  { name: 'SDN Batununggal 10', address: 'Jl. Batununggal Indah No.14, Bandung', location: { type: 'Point', coordinates: [107.6350, -6.9510] }, totalStudents: 295, portionsNeeded: 295, contactPerson: 'Bapak Dedi Supriadi', phone: '081234567014', district: 'Bandung Kidul' },
  { name: 'SDN Sukamiskin 13', address: 'Jl. Sukamiskin No.35, Bandung', location: { type: 'Point', coordinates: [107.6750, -6.9250] }, totalStudents: 360, portionsNeeded: 360, contactPerson: 'Ibu Yanti Rahayu', phone: '081234567015', district: 'Arcamanik' }
];

const vehiclesData = [
  { plateNumber: 'D 1234 MBG', type: 'Box', capacity: 500, status: 'available', brand: 'Mitsubishi Colt Diesel', year: 2023, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } },
  { plateNumber: 'D 5678 MBG', type: 'Box', capacity: 500, status: 'available', brand: 'Isuzu Elf', year: 2023, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } },
  { plateNumber: 'D 9012 MBG', type: 'Van', capacity: 350, status: 'available', brand: 'Toyota HiAce', year: 2024, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } },
  { plateNumber: 'D 3456 MBG', type: 'Van', capacity: 350, status: 'available', brand: 'Daihatsu Gran Max', year: 2023, fuelType: 'Bensin', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } },
  { plateNumber: 'D 7890 MBG', type: 'Pick Up', capacity: 250, status: 'available', brand: 'Suzuki Carry', year: 2024, fuelType: 'Bensin', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } },
  { plateNumber: 'D 2345 MBG', type: 'Pick Up', capacity: 250, status: 'maintenance', brand: 'Mitsubishi L300', year: 2022, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } },
  { plateNumber: 'D 6789 MBG', type: 'Truck', capacity: 800, status: 'available', brand: 'Hino Dutro', year: 2023, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } },
  { plateNumber: 'D 1357 MBG', type: 'Box', capacity: 450, status: 'available', brand: 'Mitsubishi Canter', year: 2024, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [107.6333, -6.9367] } }
];

const driversData = [
  { employeeId: 'DRV-001', name: 'Ahmad Suryadi', phone: '081298765001', licenseNumber: 'SIM-B1-001', licenseExpiry: new Date('2027-06-15'), address: 'Jl. Merdeka No.12, Bandung', joinDate: new Date('2022-01-10'), status: 'available', rating: 4.8, totalDeliveries: 156 },
  { employeeId: 'DRV-002', name: 'Budi Santoso', phone: '081298765002', licenseNumber: 'SIM-B1-002', licenseExpiry: new Date('2027-03-20'), address: 'Jl. Braga No.5, Bandung', joinDate: new Date('2022-03-05'), status: 'available', rating: 4.6, totalDeliveries: 142 },
  { employeeId: 'DRV-003', name: 'Cahyo Prabowo', phone: '081298765003', licenseNumber: 'SIM-B1-003', licenseExpiry: new Date('2028-01-10'), address: 'Jl. Buah Batu No.22, Bandung', joinDate: new Date('2021-08-15'), status: 'available', rating: 4.9, totalDeliveries: 189 },
  { employeeId: 'DRV-004', name: 'Dimas Pratama', phone: '081298765004', licenseNumber: 'SIM-B1-004', licenseExpiry: new Date('2027-09-05'), address: 'Jl. Dago Atas No.8, Bandung', joinDate: new Date('2023-02-01'), status: 'busy', rating: 4.5, totalDeliveries: 98 },
  { employeeId: 'DRV-005', name: 'Eko Widodo', phone: '081298765005', licenseNumber: 'SIM-B1-005', licenseExpiry: new Date('2027-12-30'), address: 'Jl. Pasteur No.15, Bandung', joinDate: new Date('2021-05-20'), status: 'available', rating: 4.7, totalDeliveries: 167 },
  { employeeId: 'DRV-006', name: 'Fajar Nugroho', phone: '081298765006', licenseNumber: 'SIM-B1-006', licenseExpiry: new Date('2026-11-18'), address: 'Jl. Soekarno Hatta No.80, Bandung', joinDate: new Date('2023-06-10'), status: 'offline', rating: 4.4, totalDeliveries: 73 },
  { employeeId: 'DRV-007', name: 'Gunawan Setiawan', phone: '081298765007', licenseNumber: 'SIM-B1-007', licenseExpiry: new Date('2028-04-22'), address: 'Jl. Cihampelas No.30, Bandung', joinDate: new Date('2020-11-01'), status: 'available', rating: 4.8, totalDeliveries: 201 },
  { employeeId: 'DRV-008', name: 'Hadi Wijaya', phone: '081298765008', licenseNumber: 'SIM-B1-008', licenseExpiry: new Date('2027-07-14'), address: 'Jl. Riau No.7, Bandung', joinDate: new Date('2024-01-15'), status: 'available', rating: 4.3, totalDeliveries: 65 },
  { employeeId: 'DRV-009', name: 'Irfan Hakim', phone: '081298765009', licenseNumber: 'SIM-B1-009', licenseExpiry: new Date('2028-02-28'), address: 'Jl. Antapani No.45, Bandung', joinDate: new Date('2022-07-20'), status: 'available', rating: 4.6, totalDeliveries: 134 },
  { employeeId: 'DRV-010', name: 'Joko Susilo', phone: '081298765010', licenseNumber: 'SIM-B1-010', licenseExpiry: new Date('2027-08-10'), address: 'Jl. Setiabudi No.18, Bandung', joinDate: new Date('2021-12-08'), status: 'available', rating: 4.7, totalDeliveries: 178 },
  { employeeId: 'DRV-011', name: 'Kurniawan Adi', phone: '081298765011', licenseNumber: 'SIM-B1-011', licenseExpiry: new Date('2026-10-05'), address: 'Jl. Kopo Jaya No.9, Bandung', joinDate: new Date('2023-04-01'), status: 'busy', rating: 4.4, totalDeliveries: 87 },
  { employeeId: 'DRV-012', name: 'Lukman Fauzi', phone: '081298765012', licenseNumber: 'SIM-B1-012', licenseExpiry: new Date('2028-05-15'), address: 'Jl. Gatot Subroto No.21, Bandung', joinDate: new Date('2022-09-15'), status: 'available', rating: 4.5, totalDeliveries: 112 },
  { employeeId: 'DRV-013', name: 'Mulyadi Rahman', phone: '081298765013', licenseNumber: 'SIM-B1-013', licenseExpiry: new Date('2027-11-20'), address: 'Jl. Supratman No.33, Bandung', joinDate: new Date('2023-01-10'), status: 'offline', rating: 4.2, totalDeliveries: 56 },
  { employeeId: 'DRV-014', name: 'Naufal Hidayat', phone: '081298765014', licenseNumber: 'SIM-B1-014', licenseExpiry: new Date('2028-03-08'), address: 'Jl. Ujung Berung No.11, Bandung', joinDate: new Date('2021-10-25'), status: 'available', rating: 4.8, totalDeliveries: 195 },
  { employeeId: 'DRV-015', name: 'Oscar Firmansyah', phone: '081298765015', licenseNumber: 'SIM-B1-015', licenseExpiry: new Date('2027-06-30'), address: 'Jl. Cimahi Raya No.14, Cimahi', joinDate: new Date('2024-03-01'), status: 'available', rating: 4.1, totalDeliveries: 38 }
];

const studentNamePool = [
  'Andi Prasetyo', 'Budi Santoso', 'Citra Lestari', 'Dinda Maharani', 'Eko Saputra',
  'Farah Azzahra', 'Gilang Ramadhan', 'Hana Safitri', 'Intan Permata', 'Joko Purnomo',
  'Karin Amelia', 'Lutfi Hakim', 'Mega Wulandari', 'Nadia Putri', 'Oki Kurniawan',
  'Putri Ayuningtyas', 'Rizky Maulana', 'Salsa Nabila', 'Tegar Pratama', 'Vina Oktaviani'
];

// ===================== SEEDER FUNCTIONS =====================

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      School.deleteMany({}),
      Student.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      DeliveryPlan.deleteMany({}),
      Delivery.deleteMany({}),
      Settings.deleteMany({})
    ]);

    // Seed settings (kitchen location — Bandung)
    console.log('⚙️  Seeding settings...');
    await Settings.create({
      key: 'general',
      kitchen: {
        name: 'MBG Dapur Lengkong Turangga 2',
        address: 'Jl. Salendro Utara No.20, Turangga, Kec. Lengkong, Kota Bandung, Jawa Barat 40264',
        location: { type: 'Point', coordinates: [107.6333003, -6.9366717] }
      }
    });
    console.log('   ✅ Settings dapur berhasil dikonfigurasi (Bandung)');

    // Seed schools
    console.log('🏫 Seeding schools...');
    const schools = await School.insertMany(schoolsData);
    console.log(`   ✅ ${schools.length} sekolah berhasil ditambahkan`);

    // Seed students
    console.log('👩‍🎓 Seeding students...');
    const studentsPayload = schools.flatMap((school, schoolIdx) => {
      const count = Math.min(25, Math.max(10, Math.round(school.totalStudents * 0.08)));
      return Array.from({ length: count }).map((_, i) => ({
        school: school._id,
        name: `${studentNamePool[i % studentNamePool.length]} ${i + 1}`,
        studentId: `STD-${String(schoolIdx + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        className: `${(i % 6) + 1}${String.fromCharCode(65 + (i % 3))}`,
        isActive: true
      }));
    });
    const students = await Student.insertMany(studentsPayload);
    console.log(`   ✅ ${students.length} siswa berhasil ditambahkan`);

    // Seed vehicles
    console.log('🚗 Seeding vehicles...');
    const vehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`   ✅ ${vehicles.length} kendaraan berhasil ditambahkan`);

    // Seed drivers and assign vehicles
    console.log('👤 Seeding drivers (karyawan)...');
    const driversWithVehicles = driversData.map((d, i) => ({
      ...d,
      assignedVehicle: vehicles[i] ? vehicles[i]._id : null
    }));
    const drivers = await Driver.insertMany(driversWithVehicles);
    console.log(`   ✅ ${drivers.length} driver karyawan berhasil ditambahkan`);

    // Assign drivers to vehicles (each vehicle gets 2-3 drivers)
    console.log('🔗 Assigning drivers to vehicles...');
    const driverAssignments = [
      { vehicleIdx: 0, driverIdxs: [0, 3, 8] },      // D 1234 MBG -> Ahmad, Dimas, Irfan
      { vehicleIdx: 1, driverIdxs: [1, 9] },           // D 5678 MBG -> Budi, Joko
      { vehicleIdx: 2, driverIdxs: [2, 4, 11] },       // D 9012 MBG -> Cahyo, Eko, Lukman
      { vehicleIdx: 3, driverIdxs: [5, 10] },           // D 3456 MBG -> Fajar, Kurniawan
      { vehicleIdx: 4, driverIdxs: [6, 13] },           // D 7890 MBG -> Gunawan, Naufal
      { vehicleIdx: 5, driverIdxs: [7, 12] },           // D 2345 MBG -> Hadi, Mulyadi
      { vehicleIdx: 6, driverIdxs: [0, 2, 14] },        // D 6789 MBG -> Ahmad, Cahyo, Oscar
      { vehicleIdx: 7, driverIdxs: [1, 4, 9] },         // D 1357 MBG -> Budi, Eko, Joko
    ];
    for (const assignment of driverAssignments) {
      await Vehicle.findByIdAndUpdate(vehicles[assignment.vehicleIdx]._id, {
        assignedDrivers: assignment.driverIdxs.map(idx => drivers[idx]._id)
      });
    }
    console.log(`   ✅ Driver berhasil di-assign ke kendaraan`);

    // Create sample delivery plans
    console.log('📋 Creating sample delivery plans...');
    const today = new Date();
    
    const plan1 = await DeliveryPlan.create({
      date: today,
      vehicle: vehicles[0]._id,
      driver: drivers[0]._id,
      schools: [
        { school: schools[0]._id, portions: schools[0].portionsNeeded },
        { school: schools[1]._id, portions: schools[1].portionsNeeded }
      ],
      status: 'completed',
      departedAt: new Date(today.setHours(6, 30)),
      completedAt: new Date(today.setHours(8, 15))
    });

    const plan2 = await DeliveryPlan.create({
      date: today,
      vehicle: vehicles[1]._id,
      driver: drivers[1]._id,
      schools: [
        { school: schools[2]._id, portions: schools[2].portionsNeeded },
        { school: schools[3]._id, portions: schools[3].portionsNeeded }
      ],
      status: 'in_transit',
      departedAt: new Date(today.setHours(7, 0))
    });

    const plan3 = await DeliveryPlan.create({
      date: today,
      vehicle: vehicles[2]._id,
      driver: drivers[2]._id,
      schools: [
        { school: schools[4]._id, portions: schools[4].portionsNeeded },
        { school: schools[5]._id, portions: schools[5].portionsNeeded }
      ],
      status: 'planned'
    });

    console.log(`   ✅ 3 delivery plans berhasil dibuat`);

    // Create sample deliveries (proof of delivery)
    console.log('📦 Creating sample deliveries...');
    await Delivery.insertMany([
      { deliveryPlan: plan1._id, school: schools[0]._id, driver: drivers[0]._id, portions: schools[0].portionsNeeded, status: 'delivered', receivedBy: 'Ibu Sari Mulyani', receivedAt: new Date(today.setHours(7, 45)), notes: 'Diterima dengan baik' },
      { deliveryPlan: plan1._id, school: schools[1]._id, driver: drivers[0]._id, portions: schools[1].portionsNeeded, status: 'delivered', receivedBy: 'Bapak Hendra Kusuma', receivedAt: new Date(today.setHours(8, 10)), notes: 'Semua porsi lengkap' },
      { deliveryPlan: plan2._id, school: schools[2]._id, driver: drivers[1]._id, portions: schools[2].portionsNeeded, status: 'pending' },
      { deliveryPlan: plan2._id, school: schools[3]._id, driver: drivers[1]._id, portions: schools[3].portionsNeeded, status: 'pending' },
      { deliveryPlan: plan3._id, school: schools[4]._id, driver: drivers[2]._id, portions: schools[4].portionsNeeded, status: 'pending' },
      { deliveryPlan: plan3._id, school: schools[5]._id, driver: drivers[2]._id, portions: schools[5].portionsNeeded, status: 'pending' }
    ]);
    console.log(`   ✅ 6 delivery records berhasil dibuat`);

    console.log('\n🎉 Seeding complete!');
    console.log('📊 Summary:');
    console.log(`   Lokasi Dapur: MBG Dapur Lengkong Turangga 2 (Bandung)`);
    console.log(`   Sekolah: ${schools.length}`);
    console.log(`   Siswa: ${students.length}`);
    console.log(`   Kendaraan: ${vehicles.length}`);
    console.log(`   Driver: ${drivers.length}`);
    console.log(`   Delivery Plans: 3`);
    console.log(`   Total Porsi: ${schools.reduce((s, sch) => s + sch.portionsNeeded, 0)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
