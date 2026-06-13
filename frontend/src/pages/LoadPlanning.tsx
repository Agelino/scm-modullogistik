import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { loadPlanApi, driverApi } from '../api/apiClient';
import type { IReadyPortions, ILoadAssignment, IDriver } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Package, Factory, ClipboardList, School, Truck, Car, Bot,
  Hourglass, AlertTriangle, CheckCircle, ChevronRight, User, ArrowRight
} from 'lucide-react';

export default function LoadPlanning() {
  const navigate = useNavigate();

  // Step: 'view' | 'calculated' | 'confirm' | 'saved'
  const [step, setStep] = useState<'view' | 'calculated' | 'confirm' | 'saved'>('view');

  const [readyPortions, setReadyPortions] = useState<IReadyPortions | null>(null);
  const [assignments, setAssignments] = useState<ILoadAssignment[]>([]);
  const [unassigned, setUnassigned] = useState<{ school: string; schoolName: string; portions: number }[]>([]);
  const [drivers, setDrivers] = useState<IDriver[]>([]);

  // driverMap: vehicleId → driverId
  const [driverMap, setDriverMap] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedPlanIds, setSavedPlanIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      loadPlanApi.getReadyPortions(),
      driverApi.getAll(),
    ]).then(([portionRes, driverRes]) => {
      setReadyPortions(portionRes.data.data);
      setDrivers(driverRes.data.data.filter((d: IDriver) => d.status === 'available'));
    }).finally(() => setLoading(false));
  }, []);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const res = await loadPlanApi.calculate({ date: new Date().toISOString().split('T')[0] });
      const assigns: ILoadAssignment[] = res.data.data.assignments;
      setAssignments(assigns);
      setUnassigned(res.data.data.unassigned);
      // Auto-assign first available driver to each vehicle
      const map: Record<string, string> = {};
      assigns.forEach((a, i) => {
        if (drivers[i]) map[String(a.vehicleId)] = drivers[i]._id;
      });
      setDriverMap(map);
      setStep('calculated');
    } catch (err) { console.error(err); }
    finally { setCalculating(false); }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const planIds: string[] = [];
      for (const a of assignments) {
        if (a.schools.length === 0) continue;
        const driverId = driverMap[String(a.vehicleId)];
        if (!driverId) continue;
        const payload = {
          date: today,
          vehicle: a.vehicleId,
          driver: driverId,
          schools: a.schools.map(s => ({ school: s.school, portions: s.portions })),
          totalPortions: a.totalPortions,
          status: 'planned',
        };
        const res = await loadPlanApi.create(payload);
        planIds.push(res.data.data._id);
      }
      setSavedPlanIds(planIds);
      setStep('saved');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleGoToRoute = () => {
    navigate('/route-optimization', { state: { fromLoadPlan: true, planIds: savedPlanIds } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={22} /> Perencanaan Muatan
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kalkulasi dan konfirmasi distribusi porsi ke armada</p>
        </div>
        {step === 'view' || step === 'calculated' ? (
          <button
            onClick={handleCalculate}
            className="btn-primary flex items-center gap-1.5"
            disabled={calculating}
          >
            {calculating ? <><Hourglass size={14} /> Menghitung...</> : <><Bot size={14} /> Hitung Otomatis (FFD)</>}
          </button>
        ) : step === 'calculated' ? null : null}
      </div>

      {/* Step indicator */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2">
          {[
            { label: '1. Data Porsi', done: true },
            { label: '2. Kalkulasi FFD', done: step !== 'view' },
            { label: '3. Konfirmasi Driver', done: step === 'confirm' || step === 'saved' },
            { label: '4. Simpan & Rute', done: step === 'saved' },
          ].map((s, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${s.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {s.done && <CheckCircle size={11} />} {s.label}
              </div>
              {i < arr.length - 1 && <ChevronRight size={14} className="text-gray-300 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Production status from Noval */}
      <div className="glass-card p-5 stat-glow-cyan">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <Factory size={20} className="text-green-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{readyPortions?.kitchen || 'Dapur Pusat MBG'}</h3>
              <p className="text-xs text-gray-400">Integrasi Modul Produksi "Noval"</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-700">{readyPortions?.totalPortionsReady?.toLocaleString('id-ID') || 0}</p>
            <p className="text-xs text-gray-400">porsi siap dari {readyPortions?.totalPortionsOrdered?.toLocaleString('id-ID') || 0} dipesan</p>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${readyPortions ? (readyPortions.totalPortionsReady / readyPortions.totalPortionsOrdered * 100) : 0}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Ready portions */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><ClipboardList size={15} /> Pesanan Siap Jemput</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {readyPortions?.schools.map((school, i) => (
              <div key={i} className="p-4 hover:bg-green-50/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <School size={16} className="text-green-700" />
                    <p className="font-medium text-gray-800 text-sm">{school.schoolName}</p>
                  </div>
                  <StatusBadge status={school.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Dipesan: <strong className="text-gray-700">{school.portionsOrdered}</strong></span>
                  <span>Siap: <strong className="text-green-700">{school.portionsReady}</strong></span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {school.menuItems.map((menu, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{menu.name} ({menu.qty})</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Load assignments */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Truck size={15} /> Pembagian Beban Armada</h3>
            {step === 'calculated' && (
              <button onClick={() => setStep('confirm')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                <User size={12} /> Assign Driver
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <Bot size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Klik "Hitung Otomatis" untuk kalkulasi pembagian beban</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {assignments.map((assignment, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-green-700" />
                      <div>
                        <p className="font-mono font-bold text-gray-800 text-sm">{assignment.plateNumber}</p>
                        <p className="text-[10px] text-gray-400">{assignment.vehicle?.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-700">{assignment.totalPortions}/{assignment.capacity}</p>
                      <p className="text-[10px] text-gray-400">porsi terisi</p>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all ${assignment.totalPortions / assignment.capacity > 0.9 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${(assignment.totalPortions / assignment.capacity * 100)}%` }} />
                  </div>

                  {/* Driver picker (step confirm) */}
                  {(step === 'confirm' || step === 'saved') && (
                    <div className="mb-3">
                      <label className="text-[10px] font-semibold text-gray-500 mb-1 block flex items-center gap-1"><User size={10} /> Pilih Driver</label>
                      <select
                        className="form-input text-xs py-1.5"
                        value={driverMap[String(assignment.vehicleId)] || ''}
                        onChange={e => setDriverMap(prev => ({ ...prev, [String(assignment.vehicleId)]: e.target.value }))}
                        disabled={step === 'saved'}
                      >
                        <option value="">— Pilih Driver —</option>
                        {drivers.map(d => (
                          <option key={d._id} value={d._id}>{d.name} ({d.employeeId})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    {assignment.schools.map((s, j) => (
                      <div key={j} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-gray-50">
                        <span className="text-gray-600">{s.schoolName}</span>
                        <span className="font-mono text-green-700">{s.portions} porsi</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {unassigned.length > 0 && (
                <div className="p-4 bg-red-50">
                  <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Belum Terassign ({unassigned.length})</p>
                  {unassigned.map((u, i) => (
                    <p key={i} className="text-xs text-gray-500">{u.schoolName} — {u.portions} porsi</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action bar — Confirm step */}
      {step === 'confirm' && (
        <div className="glass-card p-5 flex items-center justify-between border border-green-200 bg-green-50/40">
          <div>
            <p className="text-sm font-semibold text-gray-800">Konfirmasi Load Plan</p>
            <p className="text-xs text-gray-500 mt-0.5">Pastikan semua kendaraan sudah memiliki driver sebelum menyimpan</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('calculated')} className="btn-secondary text-sm">Kembali</button>
            <button
              onClick={handleSaveAll}
              disabled={saving || assignments.some(a => a.schools.length > 0 && !driverMap[String(a.vehicleId)])}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {saving ? <><Hourglass size={14} /> Menyimpan...</> : <><CheckCircle size={14} /> Simpan Delivery Plan</>}
            </button>
          </div>
        </div>
      )}

      {/* Success state — step saved */}
      {step === 'saved' && (
        <div className="glass-card p-6 border border-green-300 bg-green-50/50 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {savedPlanIds.length} Delivery Plan Tersimpan!
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Load plan berhasil dikonfirmasi. Lanjutkan ke Optimasi Rute untuk menghitung rute terbaik per kendaraan.
          </p>
          <button onClick={handleGoToRoute} className="btn-primary mx-auto flex items-center gap-2 text-sm">
            Lanjut ke Optimasi Rute <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
