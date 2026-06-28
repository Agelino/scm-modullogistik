import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { schoolApi, studentApi } from '../api/apiClient';
import type { ISchool, IStudent } from '../types';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MapView from '../components/maps/MapView';
import { School, UtensilsCrossed, GraduationCap, Calendar, ClipboardList, MapPin, Package, Search, CheckCircle, AlertTriangle } from 'lucide-react';

type TabKey = 'schools' | 'menus' | 'students';

type DayKey = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  calories: number;
}

const DAY_COLORS: Record<DayKey, string> = {
  senin: '#22c55e', selasa: '#3b82f6', rabu: '#eab308', kamis: '#f97316', jumat: '#a855f7', sabtu: '#ef4444',
};

const DAYS: { key: DayKey; label: string; color: string }[] = [
  { key: 'senin', label: 'Senin', color: DAY_COLORS.senin },
  { key: 'selasa', label: 'Selasa', color: DAY_COLORS.selasa },
  { key: 'rabu', label: 'Rabu', color: DAY_COLORS.rabu },
  { key: 'kamis', label: 'Kamis', color: DAY_COLORS.kamis },
  { key: 'jumat', label: 'Jumat', color: DAY_COLORS.jumat },
  { key: 'sabtu', label: 'Sabtu', color: DAY_COLORS.sabtu },
];

const dailyMenus: Record<DayKey, MenuItem[]> = {
  senin: [
    { id: 'sen-1', name: 'Sate Ayam + Lontong', category: 'Makan Siang', calories: 580 },
    { id: 'sen-2', name: 'Nasi Goreng Spesial', category: 'Makan Siang', calories: 550 },
    { id: 'sen-3', name: 'Nasi Ayam Bakar Kecap', category: 'Makan Siang', calories: 600 },
    { id: 'sen-4', name: 'Sup Ayam + Nasi Putih', category: 'Makan Siang', calories: 480 },
    { id: 'sen-5', name: 'Nasi Uduk + Telur Balado', category: 'Makan Siang', calories: 520 },
  ],
  selasa: [
    { id: 'sel-1', name: 'Pecel Sayur + Nasi', category: 'Makan Siang', calories: 450 },
    { id: 'sel-2', name: 'Nasi Goreng Kampung', category: 'Makan Siang', calories: 530 },
    { id: 'sel-3', name: 'Nasi Rendang Daging', category: 'Makan Siang', calories: 650 },
    { id: 'sel-4', name: 'Mie Goreng + Telur Ceplok', category: 'Makan Siang', calories: 560 },
    { id: 'sel-5', name: 'Nasi Sayur Asem + Ikan Goreng', category: 'Makan Siang', calories: 510 },
  ],
  rabu: [
    { id: 'rab-1', name: 'Nasi Ayam Teriyaki', category: 'Makan Siang', calories: 580 },
    { id: 'rab-2', name: 'Nasi Opor Ayam', category: 'Makan Siang', calories: 590 },
    { id: 'rab-3', name: 'Nasi Ikan Bakar Rica', category: 'Makan Siang', calories: 540 },
    { id: 'rab-4', name: 'Soto Ayam + Nasi', category: 'Makan Siang', calories: 470 },
    { id: 'rab-5', name: 'Nasi Telor Dadar + Sayur Tumis', category: 'Makan Siang', calories: 490 },
  ],
  kamis: [
    { id: 'kam-1', name: 'Nasi Ikan Balado', category: 'Makan Siang', calories: 560 },
    { id: 'kam-2', name: 'Nasi Semur Daging', category: 'Makan Siang', calories: 620 },
    { id: 'kam-3', name: 'Nasi Ayam Geprek', category: 'Makan Siang', calories: 600 },
    { id: 'kam-4', name: 'Nasi Capcay + Bakso', category: 'Makan Siang', calories: 500 },
    { id: 'kam-5', name: 'Nasi Pepes Ikan + Lalapan', category: 'Makan Siang', calories: 480 },
  ],
  jumat: [
    { id: 'jum-1', name: 'Nasi Gulai Ayam', category: 'Makan Siang', calories: 570 },
    { id: 'jum-2', name: 'Bubur Ayam Spesial', category: 'Sarapan', calories: 420 },
    { id: 'jum-3', name: 'Nasi Empal + Sayur Lodeh', category: 'Makan Siang', calories: 590 },
    { id: 'jum-4', name: 'Nasi Kuning + Ayam Goreng', category: 'Makan Siang', calories: 610 },
    { id: 'jum-5', name: 'Ketoprak + Kerupuk', category: 'Makan Siang', calories: 440 },
  ],
  sabtu: [
    { id: 'sab-1', name: 'Roti Gandum + Susu Coklat', category: 'Sarapan', calories: 380 },
    { id: 'sab-2', name: 'Nasi Goreng Seafood', category: 'Makan Siang', calories: 560 },
    { id: 'sab-3', name: 'Nasi Ayam Penyet + Sambal', category: 'Makan Siang', calories: 590 },
    { id: 'sab-4', name: 'Bubur Kacang Hijau + Pisang', category: 'Snack', calories: 360 },
    { id: 'sab-5', name: 'Nasi Tim Ayam + Sup', category: 'Makan Siang', calories: 510 },
  ],
};

export default function SchoolManagement() {
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('schools');
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<ISchool | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showStudentFormModal, setShowStudentFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
  const [studentFilterSchoolId, setStudentFilterSchoolId] = useState('all');
  const [studentForm, setStudentForm] = useState({ school: '', name: '', studentId: '', className: '', isActive: true });
  const [selectedSchoolForStudents, setSelectedSchoolForStudents] = useState<ISchool | null>(null);
  const [search, setSearch] = useState('');
  // schoolMenus: Record<schoolId, Record<dayKey, menuId>>
  const [schoolMenus, setSchoolMenus] = useState<Record<string, Record<DayKey, string>>>({});
  const [selectedMenuDay, setSelectedMenuDay] = useState<DayKey>('senin');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuModalSchool, setMenuModalSchool] = useState<ISchool | null>(null);
  const [form, setForm] = useState({ name: '', address: '', lat: '', lng: '', totalStudents: '', contactPerson: '', phone: '', district: '', username: '', password: '' });
  const [geoResults, setGeoResults] = useState<{ displayName: string; lat: number; lng: number; district: string }[]>([]);
  const [geoQuery, setGeoQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper: jalankan pencarian ke Nominatim
  const doGeoSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 3) return;
    setIsSearching(true);
    try {
      const res = await schoolApi.geocode(query.trim());
      const results = res.data.data;
      setGeoResults(results);
    } catch {
      // silent fail
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Auto-search dengan debounce 800ms setiap kali geoQuery berubah
  useEffect(() => {
    if (!geoQuery || geoQuery.trim().length < 3) {
      setGeoResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doGeoSearch(geoQuery);
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [geoQuery, doGeoSearch]);


  const loadSchools = useCallback(async () => {
    try {
      const res = await schoolApi.getAll();
      const nextSchools = res.data.data;
      setSchools(nextSchools);
      setSchoolMenus(prev => {
        const seeded = { ...prev };
        nextSchools.forEach((school: ISchool, idx: number) => {
          if (!seeded[school._id]) {
            // Auto-seed: pick a different menu per day for each school
            const dayMenus: Record<DayKey, string> = {} as Record<DayKey, string>;
            DAYS.forEach((d, di) => {
              const menus = dailyMenus[d.key];
              dayMenus[d.key] = menus[(idx + di) % menus.length].id;
            });
            seeded[school._id] = dayMenus;
          }
        });
        return seeded;
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSchools(); }, [loadSchools]);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await studentApi.getAll();
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const openAddModal = () => {
    setEditingSchool(null);
    setForm({ name: '', address: '', lat: '', lng: '', totalStudents: '', contactPerson: '', phone: '', district: '', username: '', password: '' });
    setGeoQuery('');
    setGeoResults([]);
    setShowModal(true);
  };

  const openEditModal = (school: ISchool) => {
    setEditingSchool(school);
    setForm({
      name: school.name,
      address: school.address,
      lat: String(school.location.coordinates[1]),
      lng: String(school.location.coordinates[0]),
      totalStudents: String(school.totalStudents),
      contactPerson: school.contactPerson,
      phone: school.phone,
      district: school.district,
      username: school.username || '',
      password: '',
    });
    setGeoQuery(school.address || school.name);
    setGeoResults([]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        await schoolApi.update(editingSchool._id, form);
      } else {
        await schoolApi.create(form);
      }
      setShowModal(false);
      loadSchools();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data sekolah ini?')) return;
    try {
      await schoolApi.delete(id);
      loadSchools();
    } catch (err) { console.error(err); }
  };

  const openStudentModal = (school: ISchool) => {
    setSelectedSchoolForStudents(school);
    setShowStudentModal(true);
  };

  const openAddStudentModal = () => {
    setEditingStudent(null);
    const preferredSchool = studentFilterSchoolId !== 'all' ? studentFilterSchoolId : (schools[0]?._id || '');
    setStudentForm({ school: preferredSchool, name: '', studentId: '', className: '', isActive: true });
    setShowStudentFormModal(true);
  };

  const openEditStudentModal = (student: IStudent) => {
    const schoolId = typeof student.school === 'string' ? student.school : student.school?._id;
    setEditingStudent(student);
    setStudentForm({
      school: schoolId || '',
      name: student.name || '',
      studentId: student.studentId || '',
      className: student.className || '',
      isActive: student.isActive !== false,
    });
    setShowStudentFormModal(true);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentApi.update(editingStudent._id, studentForm);
      } else {
        await studentApi.create(studentForm);
      }
      setShowStudentFormModal(false);
      await loadStudents();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data siswa');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Hapus data siswa ini?')) return;
    try {
      await studentApi.delete(studentId);
      await loadStudents();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data siswa');
    }
  };

  const openMenuModal = (school: ISchool) => {
    setMenuModalSchool(school);
    setShowMenuModal(true);
  };

  const updateSchoolMenu = (schoolId: string, day: DayKey, menuId: string) => {
    setSchoolMenus(prev => ({
      ...prev,
      [schoolId]: {
        ...(prev[schoolId] || {}),
        [day]: menuId,
      }
    }));
  };

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.district.toLowerCase().includes(search.toLowerCase())
  );

  const totalPortions = schools.reduce((s, sch) => s + sch.portionsNeeded, 0);

  const selectedSchoolStudents = useMemo(() => {
    if (!selectedSchoolForStudents) return [];
    return students.filter(student => {
      const schoolId = typeof student.school === 'string' ? student.school : student.school?._id;
      return schoolId === selectedSchoolForStudents._id;
    });
  }, [students, selectedSchoolForStudents]);

  const filteredStudents = useMemo(() => {
    if (studentFilterSchoolId === 'all') return students;
    return students.filter(student => {
      const schoolId = typeof student.school === 'string' ? student.school : student.school?._id;
      return schoolId === studentFilterSchoolId;
    });
  }, [students, studentFilterSchoolId]);

  const getSchoolName = (student: IStudent) => {
    if (typeof student.school !== 'string') return student.school?.name || '-';
    return schools.find(s => s._id === student.school)?.name || '-';
  };

  // Menu planning: summarize selected menus for a given day
  const menuPlanning = useMemo(() => {
    const totals: Record<string, number> = {};
    schools.forEach(school => {
      const dayMenuId = schoolMenus[school._id]?.[selectedMenuDay];
      const menu = dailyMenus[selectedMenuDay].find(m => m.id === dayMenuId);
      const menuName = menu?.name || 'Belum dipilih';
      totals[menuName] = (totals[menuName] || 0) + school.totalStudents;
    });
    return Object.entries(totals)
      .map(([menuName, portions]) => ({ menuName, portions }))
      .sort((a, b) => b.portions - a.portions);
  }, [schools, schoolMenus, selectedMenuDay]);

  const getSchoolMenuLabel = (schoolId: string) => {
    const menus = schoolMenus[schoolId];
    if (!menus) return 'Belum dipilih';
    const filled = DAYS.filter(d => menus[d.key]).length;
    return `${filled}/6 hari terpilih`;
  };

  const mapMarkers = schools.map(s => ({
    id: s._id,
    lat: s.location.coordinates[1],
    lng: s.location.coordinates[0],
    label: s.name,
    type: 'school' as const,
    popup: `${s.totalStudents} siswa • ${s.portionsNeeded} porsi`
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><School size={22} /> Master Data</h1>
          <p className="text-sm text-gray-500 mt-1">Menu, Sekolah, List Siswa, dan perencanaan muatan terintegrasi</p>
        </div>
        <button onClick={openAddModal} className="btn-primary" id="btn-add-school" disabled={activeTab !== 'schools'}>
          + Tambah Sekolah
        </button>
      </div>

      <div className="glass-card p-2 flex flex-wrap gap-2 mt-1">
        <button
          className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-colors ${activeTab === 'menus' ? 'bg-green-50 text-green-700 border-green-200' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('menus')}
          type="button"
        >
          <UtensilsCrossed size={18} /> Menu
        </button>
        <button
          className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-colors ${activeTab === 'schools' ? 'bg-green-50 text-green-700 border-green-200' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('schools')}
          type="button"
        >
          <School size={18} /> Sekolah
        </button>
        <button
          className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-colors ${activeTab === 'students' ? 'bg-green-50 text-green-700 border-green-200' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('students')}
          type="button"
        >
          <GraduationCap size={18} /> List Siswa
        </button>
      </div>

      {/* ===== MENU TAB ===== */}
      {activeTab === 'menus' && (
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><UtensilsCrossed size={18} /> Master Menu Harian</h3>
              <p className="text-xs text-gray-400 mt-1">Menu untuk setiap hari sekolah — Senin s/d Sabtu, masing-masing 5 pilihan menu.</p>
            </div>

            {/* Day tabs */}
            <div className="flex gap-1 p-3 border-b border-gray-100 overflow-x-auto">
              {DAYS.map(d => (
                <button
                  key={d.key}
                  onClick={() => setSelectedMenuDay(d.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedMenuDay === d.key
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }}></span> {d.label}
                </button>
              ))}
            </div>

            {/* Menu cards for selected day */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {dailyMenus[selectedMenuDay].map((menu, idx) => (
                  <div key={menu.id} className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Menu {idx + 1}</span>
                      <span className="text-xs text-gray-400">{menu.calories} kkal</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{menu.name}</p>
                    <p className="text-xs text-gray-500">Kategori: {menu.category}</p>
                    <p className="text-[11px] text-gray-400">Sumber data: dummy. Akan diganti API menu.</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  <ClipboardList size={13} className="inline-block mr-1" /> Total {dailyMenus[selectedMenuDay].length} pilihan menu untuk hari {DAYS.find(d => d.key === selectedMenuDay)?.label} — 
                  Rata-rata {Math.round(dailyMenus[selectedMenuDay].reduce((s, m) => s + m.calories, 0) / dailyMenus[selectedMenuDay].length)} kkal/menu
                </p>
              </div>
            </div>
          </div>

          {/* All days overview */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Calendar size={15} /> Ringkasan Menu Semua Hari</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hari</th>
                    <th>Menu 1</th>
                    <th>Menu 2</th>
                    <th>Menu 3</th>
                    <th>Menu 4</th>
                    <th>Menu 5</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(d => (
                    <tr key={d.key} className={selectedMenuDay === d.key ? 'bg-green-50' : ''}>
                      <td>
                        <button
                          onClick={() => setSelectedMenuDay(d.key)}
                          className="font-semibold text-gray-800 hover:text-green-700 flex items-center gap-1.5"
                        >
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }}></span> {d.label}
                        </button>
                      </td>
                      {dailyMenus[d.key].map(menu => (
                        <td key={menu.id} className="text-xs text-gray-600">{menu.name}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== STUDENTS TAB ===== */}
      {activeTab === 'students' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><GraduationCap size={15} /> List Siswa</h3>
            <div className="flex items-center gap-2">
              <select
                className="form-input text-xs w-52"
                value={studentFilterSchoolId}
                onChange={(e) => setStudentFilterSchoolId(e.target.value)}
              >
                <option value="all">Semua Sekolah</option>
                {schools.map(school => (
                  <option key={school._id} value={school._id}>{school.name}</option>
                ))}
              </select>
              <button onClick={openAddStudentModal} className="btn-primary text-xs py-2 px-3">+ Tambah Siswa</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>NIS</th>
                  <th>Kelas</th>
                  <th>Sekolah</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td className="font-medium text-gray-800">{student.name}</td>
                    <td className="text-gray-600">{student.studentId || '-'}</td>
                    <td className="text-gray-600">{student.className || '-'}</td>
                    <td className="text-gray-600">{getSchoolName(student)}</td>
                    <td>
                      <StatusBadge status={student.isActive ? 'available' : 'offline'} label={student.isActive ? 'aktif' : 'nonaktif'} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEditStudentModal(student)} className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                        <button onClick={() => handleDeleteStudent(student._id)} className="btn-danger text-xs py-1.5 px-3">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-xs text-gray-400 py-6">Belum ada data siswa.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== SCHOOLS TAB ===== */}
      {activeTab === 'schools' && (
        <>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 stat-glow-cyan">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sekolah</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{schools.length}</p>
        </div>
        <div className="glass-card p-4 stat-glow-blue">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Siswa</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{schools.reduce((s, sch) => s + sch.totalStudents, 0).toLocaleString('id-ID')}</p>
        </div>
        <div className="glass-card p-4 stat-glow-amber">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Kebutuhan Porsi</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{totalPortions.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={15} /> Peta Distribusi Sekolah</h3>
        <MapView markers={mapMarkers} height="350px" />
      </div>

      {/* Menu planning summary per day */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Package size={15} /> Perencanaan Muatan Berdasarkan Menu</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Hari:</span>
            <select
              className="form-input text-xs w-32"
              value={selectedMenuDay}
              onChange={(e) => setSelectedMenuDay(e.target.value as DayKey)}
            >
              {DAYS.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {menuPlanning.map(item => (
            <div key={item.menuName} className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500">Menu ({DAYS.find(d => d.key === selectedMenuDay)?.label})</p>
              <p className="text-sm text-gray-800 font-semibold">{item.menuName}</p>
              <p className="text-xs text-green-700 mt-1">Total kebutuhan: {item.portions.toLocaleString('id-ID')} porsi</p>
            </div>
          ))}
          {menuPlanning.length === 0 && (
            <p className="text-xs text-gray-400 col-span-3 text-center py-4">Belum ada menu terpilih untuk hari ini.</p>
          )}
        </div>
      </div>

      {/* School table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Daftar Sekolah</h3>
          <input
            type="text"
            placeholder="Cari sekolah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-64"
            id="search-school"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Sekolah</th>
                <th>Wilayah</th>
                <th>Siswa</th>
                <th>Porsi</th>
                <th>Menu Harian</th>
                <th>Akun</th>
                <th>Kontak</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((school) => (
                <tr key={school._id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-800">{school.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{school.address}</p>
                    </div>
                  </td>
                  <td><StatusBadge status="planned" label={school.district} /></td>
                  <td className="font-medium text-gray-600">{school.totalStudents}</td>
                  <td className="font-bold text-green-700">{school.portionsNeeded}</td>
                  <td>
                    <button
                      onClick={() => openMenuModal(school)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors font-medium"
                    >
                      <Calendar size={12} className="inline-block mr-1" /> {getSchoolMenuLabel(school._id)}
                    </button>
                  </td>
                  <td>
                    {school.username
                      ? <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{school.username}</span>
                      : <span className="text-xs text-gray-400 italic">Belum diset</span>
                    }
                  </td>
                  <td>
                    <p className="text-sm text-gray-600">{school.contactPerson}</p>
                    <p className="text-xs text-gray-400">{school.phone}</p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openStudentModal(school)} className="btn-secondary text-xs py-1.5 px-3">Lihat Siswa</button>
                      <button onClick={() => openEditModal(school)} className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                      <button onClick={() => handleDelete(school._id)} className="btn-danger text-xs py-1.5 px-3">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* ===== MODALS ===== */}

      {/* School Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSchool ? 'Edit Sekolah' : 'Tambah Sekolah'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Sekolah <span className="text-red-400">*</span></label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Contoh: SDN 01 Bandung" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Wilayah</label>
              <input className="form-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="Contoh: Bandung Utara" />
            </div>
          </div>

          {/* Geocoding — cari otomatis saat mengetik */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <Search size={12} /> Cari Lokasi di Peta
              <span className="text-gray-400 font-normal">— ketik nama sekolah atau alamat</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  className="form-input"
                  placeholder="Contoh: SDN 01 Bandung, atau nama jalan..."
                  value={geoQuery}
                  onChange={e => setGeoQuery(e.target.value)}
                  autoComplete="off"
                />
                {isSearching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span style={{
                      display: 'inline-block', width: 14, height: 14,
                      border: '2px solid #c8e6c9', borderTopColor: '#2e7d32',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite'
                    }} />
                  </span>
                )}
              </div>
              {/* Tombol salin nama sekolah ke kolom pencarian */}
              {form.name && (
                <button
                  type="button"
                  className="btn-secondary whitespace-nowrap"
                  style={{ fontSize: 12, padding: '0 14px' }}
                  onClick={() => setGeoQuery(form.name)}
                  title="Cari berdasarkan nama sekolah"
                >
                  <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Cari nama ini
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Sistem akan mencari otomatis setelah Anda berhenti mengetik. Pilih hasil yang sesuai di bawah.
            </p>

            {/* Dropdown hasil pencarian */}
            {geoResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg max-h-52 overflow-y-auto">
                {geoResults.map((r, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="w-full text-left px-4 py-3 text-xs border-b border-gray-100 hover:bg-green-50 transition-colors"
                    onClick={() => {
                      setForm({
                        ...form,
                        address: r.displayName.split(',').slice(0, 4).join(','),
                        lat: String(r.lat),
                        lng: String(r.lng),
                        district: r.district || form.district,
                      });
                      setGeoQuery(r.displayName.split(',').slice(0, 3).join(','));
                      setGeoResults([]);
                    }}
                  >
                    <p className="text-gray-800 font-semibold flex items-center gap-1.5">
                      <MapPin size={11} className="text-green-600 flex-shrink-0" />
                      {r.displayName.split(',').slice(0, 3).join(',')}
                    </p>
                    <p className="text-gray-400 mt-0.5 pl-4">
                      {r.district && <span className="text-green-600 mr-2">• {r.district}</span>}
                      Lat: {r.lat.toFixed(5)}, Lng: {r.lng.toFixed(5)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Tidak ada hasil */}
            {!isSearching && geoQuery.length >= 3 && geoResults.length === 0 && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <AlertTriangle size={11} className="text-orange-400" />
                Tidak ditemukan. Coba kata kunci lebih spesifik.
              </p>
            )}
          </div>


          {/* Koordinat — opsional, auto dari pencarian */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                Latitude
                {form.lat
                  ? <CheckCircle size={11} className="text-green-600" />
                  : <span className="text-[10px] text-orange-400 font-normal ml-1">(opsional)</span>
                }
              </label>
              <input
                className={`form-input ${!form.lat ? 'bg-gray-50 border-dashed' : 'bg-white'}`}
                type="number"
                step="any"
                value={form.lat}
                onChange={e => setForm({ ...form, lat: e.target.value })}
                placeholder="Auto dari pencarian"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                Longitude
                {form.lng
                  ? <CheckCircle size={11} className="text-green-600" />
                  : <span className="text-[10px] text-orange-400 font-normal ml-1">(opsional)</span>
                }
              </label>
              <input
                className={`form-input ${!form.lng ? 'bg-gray-50 border-dashed' : 'bg-white'}`}
                type="number"
                step="any"
                value={form.lng}
                onChange={e => setForm({ ...form, lng: e.target.value })}
                placeholder="Auto dari pencarian"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Siswa <span className="text-red-400">*</span></label>
              <input className="form-input" type="number" min="0" value={form.totalStudents} onChange={e => setForm({ ...form, totalStudents: e.target.value })} required placeholder="0" />
            </div>
          </div>

          {/* Info jika koordinat belum diisi */}
          {(!form.lat || !form.lng) && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Koordinat belum diisi.</strong> Gunakan fitur <em>Cari Alamat</em> di atas untuk mengisi Latitude & Longitude secara otomatis.
                Jika dikosongkan, sistem akan menggunakan koordinat default (pusat Bandung) — dapat diperbarui nanti.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kontak PIC</label>
              <input className="form-input" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} placeholder="Nama penanggung jawab" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">No. Telepon</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xx-xxxx-xxxx" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600">Akun Mobile App</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                <input
                  className="form-input font-mono"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Contoh: sdn01bandung"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Password {editingSchool && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editingSchool ? '••••••••' : 'Buat password'}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editingSchool ? 'Simpan Perubahan' : 'Tambah Sekolah'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
          </div>
        </form>
      </Modal>


      {/* Student list modal (per school) */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={`Daftar Siswa - ${selectedSchoolForStudents?.name || ''}`}
        size="lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Data siswa ditarik langsung dari database.</p>
          <div className="max-h-[420px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
            {loadingStudents && (
              <p className="text-xs text-gray-400">Memuat data siswa...</p>
            )}
            {selectedSchoolStudents.map(student => (
              <div key={student._id} className="rounded-lg bg-gray-50 px-3 py-2 text-xs border border-gray-200">
                <p className="text-gray-700">{student.name}</p>
                <p className="text-gray-400">{student.studentId} • Kelas {student.className}</p>
              </div>
            ))}
            {!loadingStudents && selectedSchoolStudents.length === 0 && (
              <p className="text-xs text-gray-400">Belum ada data siswa.</p>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => setShowStudentModal(false)} className="btn-secondary">Tutup</button>
          </div>
        </div>
      </Modal>

      {/* Student add/edit modal */}
      <Modal
        isOpen={showStudentFormModal}
        onClose={() => setShowStudentFormModal(false)}
        title={editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}
        size="lg"
      >
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sekolah</label>
            <select
              className="form-input"
              value={studentForm.school}
              onChange={(e) => setStudentForm({ ...studentForm, school: e.target.value })}
              required
            >
              <option value="" disabled>Pilih sekolah</option>
              {schools.map(school => (
                <option key={school._id} value={school._id}>{school.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Siswa</label>
              <input
                className="form-input"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">NIS</label>
              <input
                className="form-input"
                value={studentForm.studentId}
                onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kelas</label>
              <input
                className="form-input"
                value={studentForm.className}
                onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                className="form-input"
                value={studentForm.isActive ? 'aktif' : 'nonaktif'}
                onChange={(e) => setStudentForm({ ...studentForm, isActive: e.target.value === 'aktif' })}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}</button>
            <button type="button" onClick={() => setShowStudentFormModal(false)} className="btn-secondary">Batal</button>
          </div>
        </form>
      </Modal>

      {/* Menu selection modal per school */}
      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title={`Pilih Menu — ${menuModalSchool?.name || ''}`}
        size="lg"
      >
        {menuModalSchool && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Pilih menu untuk setiap hari sekolah. Setiap hari memiliki 5 pilihan menu berbeda.</p>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {DAYS.map(d => {
                const currentMenuId = schoolMenus[menuModalSchool._id]?.[d.key] || '';
                const currentMenu = dailyMenus[d.key].find(m => m.id === currentMenuId);
                return (
                  <div key={d.key} className="rounded-xl border border-gray-200 p-4 hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.color }}></span>
                        <span className="text-sm font-semibold text-gray-800">{d.label}</span>
                      </div>
                      {currentMenu && (
                        <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{currentMenu.calories} kkal</span>
                      )}
                    </div>
                    <select
                      className="form-input text-sm"
                      value={currentMenuId}
                      onChange={(e) => updateSchoolMenu(menuModalSchool._id, d.key, e.target.value)}
                    >
                      <option value="">— Pilih Menu —</option>
                      {dailyMenus[d.key].map(menu => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name} ({menu.calories} kkal)
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-green-50 border border-green-200 p-3">
              <p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1"><ClipboardList size={13} /> Ringkasan Menu {menuModalSchool.name}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {DAYS.map(d => {
                  const menuId = schoolMenus[menuModalSchool._id]?.[d.key];
                  const menu = dailyMenus[d.key].find(m => m.id === menuId);
                  return (
                    <div key={d.key} className="text-xs">
                      <span className="font-medium text-gray-600"><span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: d.color }}></span>{d.label}: </span>
                      <span className={menu ? 'text-green-700' : 'text-gray-400'}>{menu?.name || 'Belum dipilih'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setShowMenuModal(false)} className="btn-primary">Selesai</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
