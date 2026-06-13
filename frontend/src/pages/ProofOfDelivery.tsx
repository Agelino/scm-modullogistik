import { useState, useEffect, useMemo } from 'react';
import { schoolApi, studentApi } from '../api/apiClient';
import type { ISchool, IStudent } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CheckCircle, XCircle, BarChart3, Package, School, Truck, User, ChevronDown, Info } from 'lucide-react';

interface StudentPickup {
  student: IStudent;
  status: 'received' | 'not_received';
  time: string;
  feedback: string;
}

interface SchoolDelivery {
  school: ISchool;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
  driver: string;
  vehicle: string;
  totalStudents: number;
  receivedCount: number;
  notReceivedCount: number;
  pickups: StudentPickup[];
}

// Dummy feedbacks for simulation
const FEEDBACKS = [
  'Makanan enak, terima kasih!',
  'Nasi kurang panas',
  'Porsi cukup',
  'Menu hari ini favorit saya',
  '',
  'Lauk sudah dingin',
  'Terima kasih MBG!',
  '',
  'Sayurnya enak',
  '',
];

export default function ProofOfDelivery() {
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'not_received'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolDeliveries, setSchoolDeliveries] = useState<SchoolDelivery[]>([]);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([schoolApi.getAll(), studentApi.getAll()])
      .then(([sRes, stRes]) => {
        setSchools(sRes.data.data);
        setStudents(stRes.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Generate simulated delivery data per school
  useEffect(() => {
    if (schools.length === 0) return;

    const driverNames = ['Ahmad Supardi', 'Budi Santoso', 'Cahyo Wibowo', 'Dimas Pratama', 'Eko Saputra'];
    const plates = ['B 1234 MBG', 'B 5678 MBG', 'B 9012 MBG', 'B 3456 MBG', 'B 7890 MBG'];

    const deliveries: SchoolDelivery[] = schools.map((school, idx) => {
      const schoolStudents = students.filter(st => {
        const sid = typeof st.school === 'string' ? st.school : st.school?._id;
        return sid === school._id;
      });

      // Simulate: ~80% students received, ~20% did not
      const pickups: StudentPickup[] = schoolStudents.map((student, sIdx) => {
        const received = Math.random() > 0.2;
        const hour = 10 + Math.floor(sIdx / 10);
        const min = (sIdx * 3) % 60;
        return {
          student,
          status: received ? 'received' : 'not_received',
          time: received ? `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}` : '-',
          feedback: received ? (FEEDBACKS[sIdx % FEEDBACKS.length] || '') : '',
        };
      });

      const receivedCount = pickups.filter(p => p.status === 'received').length;
      const notReceivedCount = pickups.filter(p => p.status === 'not_received').length;

      // School delivery status
      let deliveryStatus: 'completed' | 'in_progress' | 'pending' = 'completed';
      if (receivedCount === 0 && schoolStudents.length > 0) deliveryStatus = 'pending';
      else if (notReceivedCount > 0 && receivedCount > 0) deliveryStatus = 'completed';

      return {
        school,
        date: selectedDate,
        status: deliveryStatus,
        driver: driverNames[idx % driverNames.length],
        vehicle: plates[idx % plates.length],
        totalStudents: schoolStudents.length,
        receivedCount,
        notReceivedCount,
        pickups,
      };
    });

    setSchoolDeliveries(deliveries);
  }, [schools, students, selectedDate]);

  // Filtering
  const filteredDeliveries = useMemo(() => {
    let result = schoolDeliveries;
    if (selectedSchoolId !== 'all') {
      result = result.filter(d => d.school._id === selectedSchoolId);
    }
    return result;
  }, [schoolDeliveries, selectedSchoolId]);

  const getFilteredPickups = (pickups: StudentPickup[]) => {
    let filtered = pickups;
    if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);
    if (searchQuery) filtered = filtered.filter(p => p.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.student.className.toLowerCase().includes(searchQuery.toLowerCase()));
    return filtered;
  };

  // Summary stats
  const totalReceived = schoolDeliveries.reduce((s, d) => s + d.receivedCount, 0);
  const totalNotReceived = schoolDeliveries.reduce((s, d) => s + d.notReceivedCount, 0);
  const totalStudentsAll = schoolDeliveries.reduce((s, d) => s + d.totalStudents, 0);
  const pickupRate = totalStudentsAll > 0 ? Math.round((totalReceived / totalStudentsAll) * 100) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><CheckCircle size={22} /> Bukti Pengiriman</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoring penerimaan makanan per sekolah — data dari aplikasi mobile driver
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" className="form-input text-sm w-40" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Sekolah</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{filteredDeliveries.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Siswa</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalStudentsAll}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><CheckCircle size={10} /> Sudah Ambil</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalReceived}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><XCircle size={10} /> Tidak Ambil</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalNotReceived}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tingkat Penerimaan</p>
          <p className={`text-2xl font-bold mt-1 ${pickupRate >= 80 ? 'text-emerald-600' : pickupRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
            {pickupRate}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1"><BarChart3 size={13} /> Rasio Penerimaan Makanan Hari Ini</p>
          <p className="text-xs text-gray-500">{totalReceived} / {totalStudentsAll} siswa</p>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pickupRate}%` }} />
          <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${100 - pickupRate}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><CheckCircle size={9} /> Ambil: {totalReceived} ({pickupRate}%)</span>
          <span className="flex items-center gap-1"><XCircle size={9} /> Tidak Ambil: {totalNotReceived} ({totalStudentsAll > 0 ? 100 - pickupRate : 0}%)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass-card p-3">
          <label className="block text-[10px] font-medium text-gray-500 mb-1">Filter Sekolah</label>
          <select className="form-input text-sm" value={selectedSchoolId} onChange={e => setSelectedSchoolId(e.target.value)}>
            <option value="all">Semua Sekolah ({schools.length})</option>
            {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="glass-card p-3">
          <label className="block text-[10px] font-medium text-gray-500 mb-1">Status Penerimaan</label>
          <select className="form-input text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all')}>
            <option value="all">Semua Status</option>
            <option value="received">Sudah Ambil</option>
            <option value="not_received">Tidak Ambil</option>
          </select>
        </div>
        <div className="glass-card p-3">
          <label className="block text-[10px] font-medium text-gray-500 mb-1">Cari Siswa</label>
          <input className="form-input text-sm" placeholder="Nama siswa atau kelas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* School Delivery Cards */}
      <div className="space-y-3">
        {filteredDeliveries.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Data Pengiriman</h3>
            <p className="text-sm text-gray-500">Data akan muncul setelah driver mengirim dari aplikasi mobile</p>
          </div>
        ) : (
          filteredDeliveries.map(delivery => {
            const isExpanded = expandedSchool === delivery.school._id;
            const filteredPickups = getFilteredPickups(delivery.pickups);
            const pct = delivery.totalStudents > 0 ? Math.round((delivery.receivedCount / delivery.totalStudents) * 100) : 0;

            return (
              <div key={delivery.school._id} className="glass-card overflow-hidden">
                {/* School header — clickable to expand */}
                <button
                  type="button"
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => setExpandedSchool(isExpanded ? null : delivery.school._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0"><School size={20} className="text-green-700" /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{delivery.school.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">{delivery.school.district} • <Truck size={10} /> {delivery.vehicle} • <User size={10} /> {delivery.driver}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5"><CheckCircle size={10} /> {delivery.receivedCount}</span>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs font-bold text-red-500 flex items-center gap-0.5"><XCircle size={10} /> {delivery.notReceivedCount}</span>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs text-gray-500">Total: {delivery.totalStudents}</span>
                      </div>
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden flex mt-1">
                        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        <div className="h-full bg-red-400" style={{ width: `${100 - pct}%` }} />
                      </div>
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded student list */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {delivery.totalStudents === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-400">Belum ada data siswa di sekolah ini</div>
                    ) : (
                      <>
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          <div className="col-span-1">#</div>
                          <div className="col-span-3">Nama Siswa</div>
                          <div className="col-span-1">Kelas</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-2">Waktu</div>
                          <div className="col-span-3">Feedback</div>
                        </div>
                        {/* Student rows */}
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                          {filteredPickups.map((pickup, idx) => (
                            <div key={pickup.student._id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center text-xs ${pickup.status === 'not_received' ? 'bg-red-50/40' : ''}`}>
                              <div className="col-span-1 text-gray-400">{idx + 1}</div>
                              <div className="col-span-3 font-medium text-gray-800">{pickup.student.name}</div>
                              <div className="col-span-1 text-gray-500">{pickup.student.className || '-'}</div>
                              <div className="col-span-2">
                                {pickup.status === 'received' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold"><CheckCircle size={9} /> Ambil</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-semibold"><XCircle size={9} /> Tidak</span>
                                )}
                              </div>
                              <div className="col-span-2 text-gray-500">{pickup.time}</div>
                              <div className="col-span-3 text-gray-400 truncate">{pickup.feedback || '-'}</div>
                            </div>
                          ))}
                          {filteredPickups.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-400">Tidak ada siswa sesuai filter</div>
                          )}
                        </div>
                        {/* School summary footer */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          <span>Total: {delivery.totalStudents} siswa</span>
                          <span className="font-semibold text-emerald-600">Tingkat penerimaan: {pct}%</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info note */}
      <div className="glass-card p-4 border-l-4 border-blue-400">
        <p className="text-xs text-gray-600 flex items-start gap-1.5">
          <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
          <span><strong>Catatan:</strong> Data penerimaan makanan ini nantinya akan diinput oleh driver melalui <strong>aplikasi mobile</strong>. 
          Driver melakukan checklist siswa yang mengambil makanan di setiap sekolah, lalu data terkirim otomatis ke dashboard ini.
          Siswa yang tidak mengambil makanan akan tercatat dan bisa dilaporkan.</span>
        </p>
      </div>
    </div>
  );
}
