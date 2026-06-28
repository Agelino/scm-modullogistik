import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { schoolApi, vehicleApi, driverApi, loadPlanApi, settingsApi } from '../api/apiClient';
import type { ISchool, IVehicle, IDriver, IDeliveryPlan } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MapView from '../components/maps/MapView';
import { Map, MapPin, Truck, Car, User, Bot, AlertTriangle, Compass, Package, CheckCircle } from 'lucide-react';

interface VehicleRoute {
  vehicle: IVehicle | null;
  driver: IDriver | null;
  schools: ISchool[];
  color: string;
  deliveryPlanId?: string;
}

const ROUTE_COLORS = ['#1b5e20','#7b1fa2','#e65100','#c62828','#2e7d32','#ad1457','#1565c0','#ef6c00'];

export default function RouteOptimization() {
  const location = useLocation();
  const fromLoadPlan: boolean = location.state?.fromLoadPlan === true;
  const incomingPlanIds: string[] = location.state?.planIds ?? [];

  const [schools, setSchools] = useState<ISchool[]>([]);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [vehicleRoutes, setVehicleRoutes] = useState<VehicleRoute[]>([]);
  const [deliveryPlans, setDeliveryPlans] = useState<IDeliveryPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolsPerVehicle, setSchoolsPerVehicle] = useState(2);
  const [travelMode, setTravelMode] = useState<'driving'|'walking'|'bicycling'|'transit'>('driving');
  const [origin, setOrigin] = useState<[number, number]>([106.8456, -6.2088]);
  const [kitchenName, setKitchenName] = useState('Dapur Pusat MBG');

  useEffect(() => {
    const fetchAll = async () => {
      const [sRes, vRes, dRes, kitchenRes] = await Promise.all([
        schoolApi.getAll(),
        vehicleApi.getAll(),
        driverApi.getAll(),
        settingsApi.getKitchenLocation().catch(() => null),
      ]);
      const allSchools: ISchool[] = sRes.data.data;
      const allVehicles: IVehicle[] = vRes.data.data;
      const allDrivers: IDriver[] = dRes.data.data;

      // Set kitchen origin from settings
      if (kitchenRes?.data?.data) {
        const k = kitchenRes.data.data;
        if (k.coordinates && k.coordinates.length === 2) {
          setOrigin(k.coordinates as [number, number]);
        }
        if (k.name) setKitchenName(k.name);
      }

      setSchools(allSchools);
      setVehicles(allVehicles.filter(v => v.status === 'available'));
      setDrivers(allDrivers.filter(d => d.status === 'available'));

      // If navigated from Load Planning — fetch & pre-populate the saved plans
      if (fromLoadPlan && incomingPlanIds.length > 0) {
        try {
          const plansRes = await loadPlanApi.getAll();
          const allPlans: IDeliveryPlan[] = plansRes.data.data;
          const filtered = allPlans.filter(p => incomingPlanIds.includes(p._id));
          setDeliveryPlans(filtered);

          // Build vehicle routes from delivery plans
          const routes: VehicleRoute[] = filtered.map((plan, idx) => {
            const planSchools = plan.schools
              .map(ps => allSchools.find(s => s._id === (typeof ps.school === 'string' ? ps.school : ps.school._id)))
              .filter(Boolean) as ISchool[];
            return {
              vehicle: plan.vehicle,
              driver: plan.driver,
              schools: planSchools,
              color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
              deliveryPlanId: plan._id,
            };
          });
          setVehicleRoutes(routes);
        } catch (err) {
          console.error('Gagal memuat delivery plans:', err);
        }
      }

      setLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateRoutes = () => {
    const available = vehicles.filter(v => v.status === 'available');
    const avDrivers = drivers.filter(d => d.status === 'available');
    const routes: VehicleRoute[] = [];
    const sc = [...schools];
    for (let i = 0; i < available.length && sc.length > 0; i++) {
      routes.push({ vehicle: available[i], driver: avDrivers[i]||null, schools: sc.splice(0, schoolsPerVehicle), color: ROUTE_COLORS[i%ROUTE_COLORS.length] });
    }
    if (sc.length > 0) routes.push({ vehicle: null, driver: null, schools: sc, color: '#9ca3af' });
    setVehicleRoutes(routes);
  };

  const openInGoogleMaps = (route: VehicleRoute) => {
    if (route.schools.length === 0) return;
    const pts = route.schools.map(s => `${s.location.coordinates[1]},${s.location.coordinates[0]}`);
    const url = new URL('https://www.google.com/maps/dir/');
    url.searchParams.set('api','1');
    url.searchParams.set('origin',`${origin[1]},${origin[0]}`);
    url.searchParams.set('destination', pts[pts.length-1]);
    url.searchParams.set('travelmode', travelMode);
    if (pts.length > 1) url.searchParams.set('waypoints', pts.slice(0,-1).join('|'));
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const mapMarkers = [
    { id:'origin', lat:origin[1], lng:origin[0], label:kitchenName, type:'kitchen' as const, popup:'Titik keberangkatan' },
    ...schools.map(s => ({ id:s._id, lat:s.location.coordinates[1], lng:s.location.coordinates[0], label:s.name, type:'school' as const, popup:`${s.totalStudents} siswa • ${s.portionsNeeded} porsi` }))
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Map size={22} /> Optimasi Rute Pengiriman</h1>
          <p className="text-sm text-gray-500 mt-1">Atur pembagian rute per kendaraan lalu buka langsung di Google Maps</p>
        </div>
        {!fromLoadPlan && (
          <button onClick={handleGenerateRoutes} className="btn-primary flex items-center gap-1.5"><Bot size={14} /> Generate Rute Otomatis</button>
        )}
      </div>

      {/* Banner: navigated from Load Planning */}
      {fromLoadPlan && deliveryPlans.length > 0 && (
        <div className="glass-card p-4 border border-green-200 bg-green-50/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Package size={18} className="text-green-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              <CheckCircle size={13} className="inline mr-1" />
              {deliveryPlans.length} Delivery Plan dari Load Planning telah dimuat
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Rute sudah dipra-isi berdasarkan hasil kalkulasi FFD. Klik Google Maps untuk navigasi.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!fromLoadPlan && (
          <div className="glass-card p-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Jumlah Sekolah per Kendaraan</label>
            <select className="form-input" value={schoolsPerVehicle} onChange={e => setSchoolsPerVehicle(Number(e.target.value))}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Sekolah</option>)}
            </select>
          </div>
        )}
        <div className="glass-card p-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Mode Perjalanan (Google Maps)</label>
          <select className="form-input" value={travelMode} onChange={e => setTravelMode(e.target.value as 'driving')}>
            <option value="driving">Mobil (Driving)</option>
            <option value="walking">Jalan Kaki</option>
            <option value="bicycling">Sepeda</option>
            <option value="transit">Transport Umum</option>
          </select>
        </div>
        <div className={`glass-card p-4 flex items-center gap-4 ${fromLoadPlan ? 'md:col-span-2' : ''}`}>
          <div className="flex-1"><p className="text-xs text-gray-500">Kendaraan</p><p className="text-2xl font-bold text-green-700">{fromLoadPlan ? deliveryPlans.length : vehicles.length}</p></div>
          <div className="flex-1"><p className="text-xs text-gray-500">Sekolah</p><p className="text-2xl font-bold text-blue-700">{schools.length}</p></div>
          <div className="flex-1"><p className="text-xs text-gray-500">Porsi</p><p className="text-2xl font-bold text-orange-700">{schools.reduce((s, sch) => s + sch.portionsNeeded, 0).toLocaleString('id-ID')}</p></div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={15} /> Peta Distribusi Sekolah</h3>
        <MapView markers={mapMarkers} height="350px" />
      </div>

      {vehicleRoutes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Truck size={18} /> Pembagian Rute — {vehicleRoutes.filter(r => r.vehicle).length} Kendaraan</h2>
            <p className="text-xs text-gray-500">Klik Google Maps untuk navigasi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vehicleRoutes.map((route, idx) => (
              <div key={idx} className="glass-card overflow-hidden transition-all hover:scale-[1.01]" style={{ borderLeft: `3px solid ${route.color}` }}>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${route.color}15` }}>
                        {route.vehicle ? <Car size={18} style={{ color: route.color }} /> : <AlertTriangle size={18} className="text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{route.vehicle ? route.vehicle.plateNumber : 'Belum Ada Kendaraan'}</p>
                        {route.driver && <p className="text-xs text-gray-500 flex items-center gap-1"><User size={10} /> {typeof route.driver === 'object' ? route.driver.name : route.driver}</p>}
                        {route.vehicle && <p className="text-[10px] text-gray-400">{route.vehicle.type} • {route.vehicle.capacity} porsi</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: route.color }}>{route.schools.length} sekolah</p>
                      <p className="text-[10px] text-gray-400">{route.schools.reduce((s, sch) => s + sch.portionsNeeded, 0).toLocaleString('id-ID')} porsi</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="px-4 py-2.5 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-[10px] font-bold text-red-600 shrink-0">S</div>
                    <div><p className="text-xs font-medium text-gray-800">{kitchenName}</p><p className="text-[10px] text-gray-400">Titik keberangkatan</p></div>
                  </div>
                  {route.schools.map((school, i) => (
                    <div key={school._id} className="px-4 py-2.5 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: `${route.color}15`, color: route.color }}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{school.name}</p>
                        <p className="text-[10px] text-gray-400">{school.portionsNeeded} porsi • {school.district}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {route.vehicle && (
                  <div className="p-3 border-t border-gray-100">
                    <button onClick={() => openInGoogleMaps(route)} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]" style={{ background: `${route.color}10`, color: route.color, border: `1px solid ${route.color}30` }}>
                      <Compass size={16} /> Buka di Google Maps
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!fromLoadPlan && (
            <div className="flex justify-end">
              <button onClick={handleGenerateRoutes} className="btn-secondary flex items-center gap-1.5 text-sm"><Bot size={14} /> Regenerate Rute</button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Map size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Rute</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Klik "Generate Rute Otomatis" untuk membagi {schools.length} sekolah ke {vehicles.length} kendaraan, masing-masing {schoolsPerVehicle} sekolah per kendaraan.
          </p>
          <button onClick={handleGenerateRoutes} className="btn-primary mx-auto flex items-center gap-1.5"><Bot size={14} /> Generate Rute ({schoolsPerVehicle} sekolah/kendaraan)</button>
        </div>
      )}
    </div>
  );
}
