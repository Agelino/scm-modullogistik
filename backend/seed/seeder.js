require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const School = require('../models/School');
const Student = require('../models/Student');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const DeliveryPlan = require('../models/DeliveryPlan');
const Delivery = require('../models/Delivery');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scm_mbg';

// ===================== SEED DATA =====================

const schoolsData = [
  { name: 'SDN Menteng 01', address: 'Jl. Besuki No.2, Menteng, Jakarta Pusat', location: { type: 'Point', coordinates: [106.8370, -6.1944] }, totalStudents: 320, portionsNeeded: 320, contactPerson: 'Ibu Sari', phone: '081234567001', district: 'Jakarta Pusat' },
  { name: 'SDN Cikini 02', address: 'Jl. Cikini Raya No.15, Jakarta Pusat', location: { type: 'Point', coordinates: [106.8412, -6.1889] }, totalStudents: 280, portionsNeeded: 280, contactPerson: 'Bapak Hendra', phone: '081234567002', district: 'Jakarta Pusat' },
  { name: 'SDN Kebayoran Lama 05', address: 'Jl. Ciputat Raya No.10, Jakarta Selatan', location: { type: 'Point', coordinates: [106.7820, -6.2501] }, totalStudents: 350, portionsNeeded: 350, contactPerson: 'Ibu Dewi', phone: '081234567003', district: 'Jakarta Selatan' },
  { name: 'SDN Tebet Barat 01', address: 'Jl. Tebet Barat Dalam IV, Jakarta Selatan', location: { type: 'Point', coordinates: [106.8530, -6.2310] }, totalStudents: 290, portionsNeeded: 290, contactPerson: 'Bapak Arif', phone: '081234567004', district: 'Jakarta Selatan' },
  { name: 'SDN Rawamangun 12', address: 'Jl. Pemuda No.45, Jakarta Timur', location: { type: 'Point', coordinates: [106.8850, -6.1950] }, totalStudents: 310, portionsNeeded: 310, contactPerson: 'Ibu Ratna', phone: '081234567005', district: 'Jakarta Timur' },
  { name: 'SDN Cakung 08', address: 'Jl. Raya Cakung No.12, Jakarta Timur', location: { type: 'Point', coordinates: [106.9320, -6.1780] }, totalStudents: 400, portionsNeeded: 400, contactPerson: 'Bapak Joko', phone: '081234567006', district: 'Jakarta Timur' },
  { name: 'SDN Kelapa Gading 03', address: 'Jl. Boulevard Raya, Jakarta Utara', location: { type: 'Point', coordinates: [106.9050, -6.1570] }, totalStudents: 380, portionsNeeded: 380, contactPerson: 'Ibu Linda', phone: '081234567007', district: 'Jakarta Utara' },
  { name: 'SDN Tanjung Priok 04', address: 'Jl. Enggano No.20, Jakarta Utara', location: { type: 'Point', coordinates: [106.8780, -6.1200] }, totalStudents: 260, portionsNeeded: 260, contactPerson: 'Bapak Rudi', phone: '081234567008', district: 'Jakarta Utara' },
  { name: 'SDN Cengkareng 11', address: 'Jl. Daan Mogot KM.14, Jakarta Barat', location: { type: 'Point', coordinates: [106.7230, -6.1520] }, totalStudents: 340, portionsNeeded: 340, contactPerson: 'Ibu Mega', phone: '081234567009', district: 'Jakarta Barat' },
  { name: 'SDN Grogol 06', address: 'Jl. Prof. Dr. Latumeten No.5, Jakarta Barat', location: { type: 'Point', coordinates: [106.7950, -6.1610] }, totalStudents: 300, portionsNeeded: 300, contactPerson: 'Bapak Andi', phone: '081234567010', district: 'Jakarta Barat' },
  { name: 'SDN Kemayoran 09', address: 'Jl. Bungur Besar No.8, Jakarta Pusat', location: { type: 'Point', coordinates: [106.8560, -6.1650] }, totalStudents: 270, portionsNeeded: 270, contactPerson: 'Ibu Fitri', phone: '081234567011', district: 'Jakarta Pusat' },
  { name: 'SDN Pasar Minggu 07', address: 'Jl. Ragunan No.18, Jakarta Selatan', location: { type: 'Point', coordinates: [106.8310, -6.2850] }, totalStudents: 330, portionsNeeded: 330, contactPerson: 'Bapak Wahyu', phone: '081234567012', district: 'Jakarta Selatan' },
  { name: 'SDN Cilincing 15', address: 'Jl. Cilincing Raya No.25, Jakarta Utara', location: { type: 'Point', coordinates: [106.9400, -6.1100] }, totalStudents: 220, portionsNeeded: 220, contactPerson: 'Ibu Nani', phone: '081234567013', district: 'Jakarta Utara' },
  { name: 'SDN Jatinegara 03', address: 'Jl. Matraman Raya No.32, Jakarta Timur', location: { type: 'Point', coordinates: [106.8670, -6.2130] }, totalStudents: 295, portionsNeeded: 295, contactPerson: 'Bapak Dedi', phone: '081234567014', district: 'Jakarta Timur' },
  { name: 'SDN Tambora 10', address: 'Jl. KH. Mas Mansyur No.50, Jakarta Barat', location: { type: 'Point', coordinates: [106.8130, -6.1480] }, totalStudents: 360, portionsNeeded: 360, contactPerson: 'Ibu Yanti', phone: '081234567015', district: 'Jakarta Barat' }
];

const vehiclesData = [
  { plateNumber: 'B 1234 MBG', type: 'Box', capacity: 500, status: 'available', brand: 'Mitsubishi Colt Diesel', year: 2023, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } },
  { plateNumber: 'B 5678 MBG', type: 'Box', capacity: 500, status: 'available', brand: 'Isuzu Elf', year: 2023, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } },
  { plateNumber: 'B 9012 MBG', type: 'Van', capacity: 350, status: 'available', brand: 'Toyota HiAce', year: 2024, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } },
  { plateNumber: 'B 3456 MBG', type: 'Van', capacity: 350, status: 'available', brand: 'Daihatsu Gran Max', year: 2023, fuelType: 'Bensin', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } },
  { plateNumber: 'B 7890 MBG', type: 'Pick Up', capacity: 250, status: 'available', brand: 'Suzuki Carry', year: 2024, fuelType: 'Bensin', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } },
  { plateNumber: 'B 2345 MBG', type: 'Pick Up', capacity: 250, status: 'maintenance', brand: 'Mitsubishi L300', year: 2022, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } },
  { plateNumber: 'B 6789 MBG', type: 'Truck', capacity: 800, status: 'available', brand: 'Hino Dutro', year: 2023, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } },
  { plateNumber: 'B 1357 MBG', type: 'Box', capacity: 450, status: 'available', brand: 'Mitsubishi Canter', year: 2024, fuelType: 'Solar', currentLocation: { type: 'Point', coordinates: [106.8456, -6.2088] } }
];

const driversData = [
  { employeeId: 'DRV-001', name: 'Ahmad Suryadi', phone: '081298765001', licenseNumber: 'SIM-B1-001', licenseExpiry: new Date('2027-06-15'), address: 'Jl. Kebon Sirih No.12, Jakarta Pusat', joinDate: new Date('2022-01-10'), status: 'available', rating: 4.8, totalDeliveries: 156 },
  { employeeId: 'DRV-002', name: 'Budi Santoso', phone: '081298765002', licenseNumber: 'SIM-B1-002', licenseExpiry: new Date('2027-03-20'), address: 'Jl. Cempaka Putih III No.5, Jakarta Pusat', joinDate: new Date('2022-03-05'), status: 'available', rating: 4.6, totalDeliveries: 142 },
  { employeeId: 'DRV-003', name: 'Cahyo Prabowo', phone: '081298765003', licenseNumber: 'SIM-B1-003', licenseExpiry: new Date('2028-01-10'), address: 'Jl. Tebet Utara No.22, Jakarta Selatan', joinDate: new Date('2021-08-15'), status: 'available', rating: 4.9, totalDeliveries: 189 },
  { employeeId: 'DRV-004', name: 'Dimas Pratama', phone: '081298765004', licenseNumber: 'SIM-B1-004', licenseExpiry: new Date('2027-09-05'), address: 'Jl. Rawamangun Muka No.8, Jakarta Timur', joinDate: new Date('2023-02-01'), status: 'busy', rating: 4.5, totalDeliveries: 98 },
  { employeeId: 'DRV-005', name: 'Eko Widodo', phone: '081298765005', licenseNumber: 'SIM-B1-005', licenseExpiry: new Date('2027-12-30'), address: 'Jl. Pluit Karang No.15, Jakarta Utara', joinDate: new Date('2021-05-20'), status: 'available', rating: 4.7, totalDeliveries: 167 },
  { employeeId: 'DRV-006', name: 'Fajar Nugroho', phone: '081298765006', licenseNumber: 'SIM-B1-006', licenseExpiry: new Date('2026-11-18'), address: 'Jl. Daan Mogot KM.12, Jakarta Barat', joinDate: new Date('2023-06-10'), status: 'offline', rating: 4.4, totalDeliveries: 73 },
  { employeeId: 'DRV-007', name: 'Gunawan Setiawan', phone: '081298765007', licenseNumber: 'SIM-B1-007', licenseExpiry: new Date('2028-04-22'), address: 'Jl. Sunter Agung No.30, Jakarta Utara', joinDate: new Date('2020-11-01'), status: 'available', rating: 4.8, totalDeliveries: 201 },
  { employeeId: 'DRV-008', name: 'Hadi Wijaya', phone: '081298765008', licenseNumber: 'SIM-B1-008', licenseExpiry: new Date('2027-07-14'), address: 'Jl. Kebayoran Baru No.7, Jakarta Selatan', joinDate: new Date('2024-01-15'), status: 'available', rating: 4.3, totalDeliveries: 65 },
  { employeeId: 'DRV-009', name: 'Irfan Hakim', phone: '081298765009', licenseNumber: 'SIM-B1-009', licenseExpiry: new Date('2028-02-28'), address: 'Jl. Cakung Cilincing No.45, Jakarta Timur', joinDate: new Date('2022-07-20'), status: 'available', rating: 4.6, totalDeliveries: 134 },
  { employeeId: 'DRV-010', name: 'Joko Susilo', phone: '081298765010', licenseNumber: 'SIM-B1-010', licenseExpiry: new Date('2027-08-10'), address: 'Jl. Kemang Raya No.18, Jakarta Selatan', joinDate: new Date('2021-12-08'), status: 'available', rating: 4.7, totalDeliveries: 178 },
  { employeeId: 'DRV-011', name: 'Kurniawan Adi', phone: '081298765011', licenseNumber: 'SIM-B1-011', licenseExpiry: new Date('2026-10-05'), address: 'Jl. Grogol Petamburan No.9, Jakarta Barat', joinDate: new Date('2023-04-01'), status: 'busy', rating: 4.4, totalDeliveries: 87 },
  { employeeId: 'DRV-012', name: 'Lukman Fauzi', phone: '081298765012', licenseNumber: 'SIM-B1-012', licenseExpiry: new Date('2028-05-15'), address: 'Jl. Pademangan III No.21, Jakarta Utara', joinDate: new Date('2022-09-15'), status: 'available', rating: 4.5, totalDeliveries: 112 },
  { employeeId: 'DRV-013', name: 'Mulyadi Rahman', phone: '081298765013', licenseNumber: 'SIM-B1-013', licenseExpiry: new Date('2027-11-20'), address: 'Jl. Cipulir Raya No.33, Jakarta Selatan', joinDate: new Date('2023-01-10'), status: 'offline', rating: 4.2, totalDeliveries: 56 },
  { employeeId: 'DRV-014', name: 'Naufal Hidayat', phone: '081298765014', licenseNumber: 'SIM-B1-014', licenseExpiry: new Date('2028-03-08'), address: 'Jl. Pulomas Barat No.11, Jakarta Timur', joinDate: new Date('2021-10-25'), status: 'available', rating: 4.8, totalDeliveries: 195 },
  { employeeId: 'DRV-015', name: 'Oscar Firmansyah', phone: '081298765015', licenseNumber: 'SIM-B1-015', licenseExpiry: new Date('2027-06-30'), address: 'Jl. Tanjung Duren No.14, Jakarta Barat', joinDate: new Date('2024-03-01'), status: 'available', rating: 4.1, totalDeliveries: 38 }
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
      Delivery.deleteMany({})
    ]);

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
      { vehicleIdx: 0, driverIdxs: [0, 3, 8] },      // B 1234 MBG -> Ahmad, Dimas, Irfan
      { vehicleIdx: 1, driverIdxs: [1, 9] },           // B 5678 MBG -> Budi, Joko
      { vehicleIdx: 2, driverIdxs: [2, 4, 11] },       // B 9012 MBG -> Cahyo, Eko, Lukman
      { vehicleIdx: 3, driverIdxs: [5, 10] },           // B 3456 MBG -> Fajar, Kurniawan
      { vehicleIdx: 4, driverIdxs: [6, 13] },           // B 7890 MBG -> Gunawan, Naufal
      { vehicleIdx: 5, driverIdxs: [7, 12] },           // B 2345 MBG -> Hadi, Mulyadi
      { vehicleIdx: 6, driverIdxs: [0, 2, 14] },        // B 6789 MBG -> Ahmad, Cahyo, Oscar
      { vehicleIdx: 7, driverIdxs: [1, 4, 9] },         // B 1357 MBG -> Budi, Eko, Joko
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
      { deliveryPlan: plan1._id, school: schools[0]._id, driver: drivers[0]._id, portions: schools[0].portionsNeeded, status: 'delivered', receivedBy: 'Ibu Sari', receivedAt: new Date(today.setHours(7, 45)), notes: 'Diterima dengan baik' },
      { deliveryPlan: plan1._id, school: schools[1]._id, driver: drivers[0]._id, portions: schools[1].portionsNeeded, status: 'delivered', receivedBy: 'Bapak Hendra', receivedAt: new Date(today.setHours(8, 10)), notes: 'Semua porsi lengkap' },
      { deliveryPlan: plan2._id, school: schools[2]._id, driver: drivers[1]._id, portions: schools[2].portionsNeeded, status: 'pending' },
      { deliveryPlan: plan2._id, school: schools[3]._id, driver: drivers[1]._id, portions: schools[3].portionsNeeded, status: 'pending' },
      { deliveryPlan: plan3._id, school: schools[4]._id, driver: drivers[2]._id, portions: schools[4].portionsNeeded, status: 'pending' },
      { deliveryPlan: plan3._id, school: schools[5]._id, driver: drivers[2]._id, portions: schools[5].portionsNeeded, status: 'pending' }
    ]);
    console.log(`   ✅ 6 delivery records berhasil dibuat`);

    console.log('\n🎉 Seeding complete!');
    console.log('📊 Summary:');
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
