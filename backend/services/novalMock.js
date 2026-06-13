/**
 * Mock Service: Integrasi dengan Modul Produksi "Noval"
 * Mensimulasikan data porsi makanan yang siap dijemput
 */

const getReadyPortions = (schools) => {
  // Simulasi data dari modul produksi Noval
  const mockPortions = schools.map(school => ({
    schoolId: school._id,
    schoolName: school.name,
    portionsOrdered: school.portionsNeeded,
    portionsReady: Math.floor(school.portionsNeeded * (0.85 + Math.random() * 0.15)), // 85-100% ready
    status: Math.random() > 0.1 ? 'ready' : 'preparing',
    menuItems: [
      { name: 'Nasi Ayam Geprek', qty: Math.floor(school.portionsNeeded * 0.4) },
      { name: 'Nasi Rendang', qty: Math.floor(school.portionsNeeded * 0.3) },
      { name: 'Nasi Sayur Asem + Tempe', qty: Math.floor(school.portionsNeeded * 0.3) }
    ],
    preparedAt: new Date(),
    estimatedPickupTime: new Date(Date.now() + 30 * 60 * 1000) // 30 min from now
  }));

  return {
    date: new Date().toISOString().split('T')[0],
    kitchen: 'Dapur Pusat MBG Jakarta',
    totalPortionsReady: mockPortions.reduce((sum, p) => sum + p.portionsReady, 0),
    totalPortionsOrdered: mockPortions.reduce((sum, p) => sum + p.portionsOrdered, 0),
    schools: mockPortions,
    lastUpdated: new Date()
  };
};

const getProductionStatus = () => {
  return {
    kitchenName: 'Dapur Pusat MBG Jakarta',
    location: { type: 'Point', coordinates: [106.8456, -6.2088] },
    status: 'active',
    totalCapacity: 5000,
    currentProduction: Math.floor(3500 + Math.random() * 1500),
    shifts: [
      { name: 'Pagi', time: '04:00 - 08:00', status: 'completed' },
      { name: 'Siang', time: '08:00 - 12:00', status: 'active' }
    ]
  };
};

module.exports = { getReadyPortions, getProductionStatus };
