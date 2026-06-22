import { useState, useEffect, useCallback } from 'react';
import { vehicleApi, driverApi } from '../api/apiClient';
import type { IVehicle, IDriver, IDriverSummary } from '../types';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Truck, Car, User, X } from 'lucide-react';

export default function FleetManagement() {
  const [tab, setTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDriverAssignModal, setShowDriverAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
  const [editingItem, setEditingItem] = useState<IVehicle | IDriver | null>(null);
  const [vForm, setVForm] = useState({ plateNumber: '', type: 'Box', capacity: '', brand: '', year: '', fuelType: 'Solar' });
  const [vFormError, setVFormError] = useState('');

  const [assignDriverId, setAssignDriverId] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [vRes, dRes] = await Promise.all([vehicleApi.getAll(), driverApi.getAll()]);
      setVehicles(vRes.data.data);
      setDrivers(dRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddVehicle = () => {
    setEditingItem(null);
    setVForm({ plateNumber: '', type: 'Box', capacity: '', brand: '', year: String(new Date().getFullYear()), fuelType: 'Solar' });
    setVFormError('');
    setShowModal(true);
  };

  const handleEditVehicle = (v: IVehicle) => {
    setEditingItem(v);
    setVForm({ plateNumber: v.plateNumber, type: v.type, capacity: String(v.capacity), brand: v.brand, year: String(v.year), fuelType: v.fuelType });
    setVFormError('');
    setShowModal(true);
  };



  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVFormError('');
    try {
      const data = { ...vForm, capacity: parseInt(vForm.capacity), year: parseInt(vForm.year) };
      if (editingItem) await vehicleApi.update(editingItem._id, data);
      else await vehicleApi.create(data);
      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const rawMsg = axiosErr?.response?.data?.message ?? '';
      // Terjemahkan pesan error MongoDB duplikat ke bahasa yang lebih ramah
      if (rawMsg.includes('E11000') || rawMsg.includes('duplicate') || rawMsg.includes('plateNumber')) {
        setVFormError(`Plat nomor "${vForm.plateNumber.toUpperCase()}" sudah terdaftar. Gunakan plat nomor yang berbeda.`);
      } else if (rawMsg) {
        setVFormError(rawMsg);
      } else {
        setVFormError('Gagal menyimpan data. Silakan coba lagi.');
      }
    }
  };



  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Hapus kendaraan ini?')) return;
    await vehicleApi.delete(id); loadData();
  };



  const handleStatusChange = async (id: string, status: string) => {
    await driverApi.updateStatus(id, status); loadData();
  };

  // Driver assignment to vehicle
  const handleOpenAssignModal = (v: IVehicle) => {
    setSelectedVehicle(v);
    setAssignDriverId('');
    setShowDriverAssignModal(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedVehicle || !assignDriverId) return;
    try {
      await vehicleApi.assignDriver(selectedVehicle._id, assignDriverId);
      loadData();
      setAssignDriverId('');
    } catch (err) { console.error(err); }
  };

  const handleRemoveDriverFromVehicle = async (vehicleId: string, driverId: string) => {
    try {
      await vehicleApi.removeDriver(vehicleId, driverId);
      loadData();
    } catch (err) { console.error(err); }
  };

  // Get drivers not yet assigned to the selected vehicle
  const getAvailableDriversForVehicle = (vehicle: IVehicle) => {
    const assignedIds = (vehicle.assignedDrivers || []).map((d: IDriverSummary) => d._id);
    return drivers.filter(d => !assignedIds.includes(d._id));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-7 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3"><Truck size={24} /> Manajemen Armada & Driver</h1>
          <p className="text-sm text-gray-500 mt-2">Kelola aset kendaraan dan data pengemudi karyawan</p>
        </div>
        {tab === 'vehicles' && (
          <button onClick={handleAddVehicle} className="btn-primary">
            + Tambah Kendaraan
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="glass-card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Kendaraan</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{vehicles.length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Tersedia</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{vehicles.filter(v => v.status === 'available').length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Driver Karyawan</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{drivers.length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Driver Aktif</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{drivers.filter(d => d.status === 'available').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-xl w-fit">
        <button onClick={() => setTab('vehicles')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'vehicles' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
          <Car size={16} /> Kendaraan ({vehicles.length})
        </button>
        <button onClick={() => setTab('drivers')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'drivers' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
          <User size={16} /> Driver Karyawan ({drivers.length})
        </button>
      </div>

      {/* Vehicles Table */}
      {tab === 'vehicles' && (
        <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Car size={16} /> Daftar Kendaraan</h3>
            <p className="text-xs text-gray-400 mt-1">Data armada kendaraan yang terdaftar dalam sistem</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plat Nomor</th>
                  <th>Jenis</th>
                  <th>Merek</th>
                  <th>Kapasitas</th>
                  <th>Driver Ditugaskan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v._id}>
                    <td className="font-mono font-bold text-gray-800">{v.plateNumber}</td>
                    <td><span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">{v.type}</span></td>
                    <td className="text-gray-600">{v.brand}</td>
                    <td className="font-semibold text-green-700">{v.capacity} porsi</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {(v.assignedDrivers || []).length > 0 ? (
                          (v.assignedDrivers as IDriverSummary[]).map((d: IDriverSummary) => (
                            <span key={d._id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <span className={`w-2 h-2 rounded-full ${d.status === 'available' ? 'bg-green-500' : d.status === 'busy' ? 'bg-orange-400' : 'bg-gray-400'}`}></span>
                              {d.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum ada driver</span>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={v.status} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenAssignModal(v)} className="btn-secondary text-xs py-2 px-3" title="Kelola Driver"><User size={13} /></button>
                        <button onClick={() => handleEditVehicle(v)} className="btn-secondary text-xs py-2 px-3">Edit</button>
                        <button onClick={() => handleDeleteVehicle(v._id)} className="btn-danger text-xs py-2 px-3">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      {tab === 'drivers' && (
        <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><User size={16} /> Daftar Driver Karyawan</h3>
            <p className="text-xs text-gray-400 mt-1">Data driver dikelola dari modul lain — tampilan baca saja</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Karyawan</th>
                  <th>Nama</th>
                  <th>Telepon</th>
                  <th>SIM</th>
                  <th>Masa Berlaku SIM</th>
                  <th>Bergabung</th>
                  <th>Kendaraan</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d._id}>
                    <td>
                      <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-mono font-bold">
                        {d.employeeId || '-'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-800">{d.name}</p>
                        {d.address && <p className="text-xs text-gray-400 mt-1 max-w-[220px] truncate" title={d.address}>{d.address}</p>}
                      </div>
                    </td>
                    <td className="text-gray-600">{d.phone}</td>
                    <td className="font-mono text-xs text-gray-500">{d.licenseNumber}</td>
                    <td>
                      {d.licenseExpiry ? (
                        <span className={`text-xs font-medium ${new Date(d.licenseExpiry) < new Date() ? 'text-red-600' : new Date(d.licenseExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'text-orange-600' : 'text-green-700'}`}>
                          {formatDate(d.licenseExpiry)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="text-xs text-gray-500">{formatDate(d.joinDate)}</td>
                    <td>
                      {typeof d.assignedVehicle === 'object' && d.assignedVehicle ? (
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-mono font-medium">
                          {(d.assignedVehicle as IVehicle).plateNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="text-orange-500 text-sm">{'★'.repeat(Math.round(d.rating))}</span>
                        <span className="text-xs text-gray-400">{d.rating}</span>
                      </div>
                    </td>
                    <td>
                      <select value={d.status} onChange={(e) => handleStatusChange(d._id, e.target.value)}
                        className="bg-transparent border-none text-xs cursor-pointer text-gray-600 py-1">
                        <option value="available" className="bg-white">Tersedia</option>
                        <option value="busy" className="bg-white">Sibuk</option>
                        <option value="offline" className="bg-white">Offline</option>
                      </select>
                    </td>
                    <td>
                      <span className="text-xs text-gray-400 italic">Data dari modul lain</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {tab === 'vehicles' && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Kendaraan' : 'Tambah Kendaraan'}>
          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            {/* Error banner */}
            {vFormError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c62828', flexShrink: 0, marginTop: 4, display: 'inline-block' }} />
                <p className="text-xs text-red-700 font-medium leading-relaxed">{vFormError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Plat Nomor <span className="text-red-400">*</span></label>
                <input
                  className={`form-input uppercase ${vFormError && vFormError.includes('Plat nomor') ? 'border-red-400 focus:border-red-500' : ''}`}
                  value={vForm.plateNumber}
                  onChange={e => { setVForm({ ...vForm, plateNumber: e.target.value }); setVFormError(''); }}
                  required
                  placeholder="Contoh: B 1234 XYZ"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Jenis</label>
                <select className="form-input" value={vForm.type} onChange={e => setVForm({ ...vForm, type: e.target.value })}>
                  <option value="Box">Box</option>
                  <option value="Van">Van</option>
                  <option value="Pick Up">Pick Up</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kapasitas (porsi) <span className="text-red-400">*</span></label>
                <input className="form-input" type="number" min="1" value={vForm.capacity} onChange={e => setVForm({ ...vForm, capacity: e.target.value })} required placeholder="Contoh: 200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Merek</label>
                <input className="form-input" value={vForm.brand} onChange={e => setVForm({ ...vForm, brand: e.target.value })} placeholder="Contoh: Hino" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bahan Bakar</label>
                <select className="form-input" value={vForm.fuelType} onChange={e => setVForm({ ...vForm, fuelType: e.target.value })}>
                  <option value="Solar">Solar</option>
                  <option value="Bensin">Bensin</option>
                  <option value="Gas">Gas</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Simpan</button>
              <button type="button" onClick={() => { setShowModal(false); setVFormError(''); }} className="btn-secondary">Batal</button>
            </div>
          </form>
        </Modal>
      )}



      {/* Driver Assignment Modal */}
      <Modal isOpen={showDriverAssignModal} onClose={() => setShowDriverAssignModal(false)} title={`Kelola Driver — ${selectedVehicle?.plateNumber || ''}`}>
        <div className="space-y-5">
          {/* Current assigned drivers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Driver yang Ditugaskan
            </h4>
            {selectedVehicle && (selectedVehicle.assignedDrivers || []).length > 0 ? (
              <div className="space-y-2">
                {(selectedVehicle.assignedDrivers as IDriverSummary[]).map((d: IDriverSummary) => (
                  <div key={d._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-green-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-500/20">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.employeeId} • {d.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === 'available' ? 'bg-green-50 text-green-700' : d.status === 'busy' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                        {d.status === 'available' ? 'Tersedia' : d.status === 'busy' ? 'Sibuk' : 'Offline'}
                      </span>
                      <button
                        onClick={() => handleRemoveDriverFromVehicle(selectedVehicle._id, d._id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Hapus driver dari kendaraan"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-400">Belum ada driver yang ditugaskan</p>
              </div>
            )}
          </div>

          {/* Add new driver */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Tambah Driver
            </h4>
            {selectedVehicle && getAvailableDriversForVehicle(selectedVehicle).length > 0 ? (
              <div className="flex gap-2">
                <select
                  className="form-input flex-1"
                  value={assignDriverId}
                  onChange={e => setAssignDriverId(e.target.value)}
                >
                  <option value="">— Pilih Driver —</option>
                  {getAvailableDriversForVehicle(selectedVehicle).map(d => (
                    <option key={d._id} value={d._id} className="bg-white">
                      {d.employeeId ? `[${d.employeeId}] ` : ''}{d.name} — {d.status === 'available' ? '✓ Tersedia' : d.status === 'busy' ? '⏳ Sibuk' : '○ Offline'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignDriver}
                  disabled={!assignDriverId}
                  className="btn-primary px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Assign
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Semua driver sudah ditugaskan ke kendaraan ini.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
