import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { trackingApi, settingsApi } from '../api/apiClient';
import StatusBadge from '../components/common/StatusBadge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, Truck, School, Gauge, MapPin, Clock, Play, Square } from 'lucide-react';

interface FleetPosition {
  deliveryPlanId: string;
  driverId: string;
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  status: string;
  timestamp: string;
  driverName?: string;
  plateNumber?: string;
}

interface SchoolMonitorRow {
  schoolName: string;
  status: 'planned' | 'in_transit' | 'delivered';
  vehicle: string;
  eta: string;
  receivedBy: string;
}

export default function LiveMonitoring() {
  const [fleetPositions, setFleetPositions] = useState<FleetPosition[]>([]);
  const [schoolMonitoring, setSchoolMonitoring] = useState<SchoolMonitorRow[]>([
    { schoolName: 'SDN Lengkong 01', status: 'in_transit', vehicle: 'D 1234 MBG', eta: '11:20', receivedBy: '-' },
    { schoolName: 'SDN Turangga 03', status: 'planned', vehicle: 'D 5678 MBG', eta: '11:45', receivedBy: '-' },
    { schoolName: 'SDN Buah Batu 05', status: 'delivered', vehicle: 'D 9012 MBG', eta: '10:58', receivedBy: 'Andi 7 (Kelas 2A)' },
  ]);
  const [simulating, setSimulating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const { subscribe, joinMonitoring, emit } = useSocket();
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default center, will be updated from settings
    mapRef.current = L.map(containerRef.current, { center: [-6.2088, 106.8456], zoom: 12, zoomControl: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO', maxZoom: 19
    }).addTo(mapRef.current);
    joinMonitoring();

    // Fetch kitchen location and re-center map
    settingsApi.getKitchenLocation().then(res => {
      const k = res.data?.data;
      if (k?.coordinates && k.coordinates.length === 2 && mapRef.current) {
        mapRef.current.setView([k.coordinates[1], k.coordinates[0]], 12);
      }
    }).catch(() => {});

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line

  useEffect(() => {
    trackingApi.getActiveFleet().then(res => {
      const rows = (res.data?.data || []) as Array<Record<string, unknown>>;
      if (rows.length === 0) return;
      const mapped = rows.map((item) => {
        const driver = item.driver as { _id?: string; name?: string } | string | undefined;
        const vehicle = item.vehicle as { _id?: string; plateNumber?: string } | string | undefined;
        return {
          deliveryPlanId: String(item.deliveryPlan || item._id || ''),
          driverId: String(typeof driver === 'string' ? driver : (driver?._id || '')),
          vehicleId: String(typeof vehicle === 'string' ? vehicle : (vehicle?._id || '')),
          lat: Number((item.currentLocation as { coordinates?: [number, number] })?.coordinates?.[1] || 0),
          lng: Number((item.currentLocation as { coordinates?: [number, number] })?.coordinates?.[0] || 0),
          speed: Number(item.speed || 0),
          status: String(item.status || 'in_transit'),
          timestamp: String(item.timestamp || new Date().toISOString()),
          driverName: String(typeof driver === 'string' ? '' : (driver?.name || '')),
          plateNumber: String(typeof vehicle === 'string' ? '' : (vehicle?.plateNumber || '')),
        };
      });
      setFleetPositions(mapped);
      mapped.forEach(updateMarker);
    }).catch(() => {});

    const unsub = subscribe('fleet:position', (data: unknown) => {
      const pos = data as FleetPosition;
      setFleetPositions(prev => {
        const idx = prev.findIndex(p => p.deliveryPlanId === pos.deliveryPlanId);
        if (idx >= 0) { const n = [...prev]; n[idx] = pos; return n; }
        return [...prev, pos];
      });
      updateMarker(pos);
    });
    return unsub;
  }, [subscribe]); // eslint-disable-line

  const updateMarker = (pos: FleetPosition) => {
    if (!mapRef.current) return;
    const key = pos.deliveryPlanId || pos.vehicleId;
    if (markersRef.current[key]) {
      markersRef.current[key].setLatLng([pos.lat, pos.lng]);
    } else {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:#2e7d32;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px #2e7d3255;border:3px solid #fff;animation:pulse-glow 2s infinite;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>`,
        iconSize: [40, 40], iconAnchor: [20, 20]
      });
      markersRef.current[key] = L.marker([pos.lat, pos.lng], { icon }).addTo(mapRef.current);
      markersRef.current[key].bindPopup(`<strong>${pos.plateNumber || 'Armada'}</strong><br/>Speed: ${pos.speed} km/h`);
    }
  };

  const startSimulation = () => {
    setSimulating(true);
    const routes = [
      { id: 'sim-1', plate: 'D 1234 MBG', driver: 'Ahmad', baseLat: -6.9367, baseLng: 107.6333 },
      { id: 'sim-2', plate: 'D 5678 MBG', driver: 'Budi', baseLat: -6.9270, baseLng: 107.6145 },
      { id: 'sim-3', plate: 'D 9012 MBG', driver: 'Cahyo', baseLat: -6.9425, baseLng: 107.6370 },
    ];
    let step = 0;
    simIntervalRef.current = setInterval(() => {
      step++;
      routes.forEach(r => {
        const lat = r.baseLat + Math.sin(step * 0.05) * 0.01 + (Math.random() - 0.5) * 0.002;
        const lng = r.baseLng + Math.cos(step * 0.03) * 0.015 + (Math.random() - 0.5) * 0.002;
        const pos: FleetPosition = {
          deliveryPlanId: r.id, driverId: r.id, vehicleId: r.id,
          lat, lng, speed: 20 + Math.random() * 30, status: 'in_transit',
          timestamp: new Date().toISOString(), driverName: r.driver, plateNumber: r.plate
        };
        setFleetPositions(prev => {
          const idx = prev.findIndex(p => p.deliveryPlanId === r.id);
          if (idx >= 0) { const n = [...prev]; n[idx] = pos; return n; }
          return [...prev, pos];
        });
        updateMarker(pos);
        emit('location:update', { deliveryPlanId: r.id, driverId: r.id, vehicleId: r.id, lat, lng, speed: pos.speed, status: 'in_transit' });
      });

      setSchoolMonitoring(prev => prev.map((row, idx) => {
        if (idx === step % prev.length) {
          if (row.status === 'planned') return { ...row, status: 'in_transit', eta: 'On progress', receivedBy: '-' };
          if (row.status === 'in_transit') return { ...row, status: 'delivered', eta: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), receivedBy: `Siswa Dummy ${idx + 1} (Kelas ${idx + 1}A)` };
        }
        return row;
      }));
    }, 2000);
  };

  const stopSimulation = () => {
    setSimulating(false);
    if (simIntervalRef.current) { clearInterval(simIntervalRef.current); simIntervalRef.current = null; }
  };

  const deliveredCount = schoolMonitoring.filter(s => s.status === 'delivered').length;
  const inTransitCount = schoolMonitoring.filter(s => s.status === 'in_transit').length;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Radio size={22} /> Live Monitoring</h1>
          <p className="text-sm text-gray-500 mt-1">Pelacakan posisi armada secara real-time</p>
        </div>
        <div className="flex gap-2">
          {!simulating ? (
            <button onClick={startSimulation} className="btn-primary flex items-center gap-1.5"><Play size={14} /> Mulai Simulasi GPS</button>
          ) : (
            <button onClick={stopSimulation} className="btn-danger flex items-center gap-1.5"><Square size={14} /> Stop Simulasi</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Armada Aktif</p>
          <p className="text-xl font-bold text-green-700">{fleetPositions.length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Terkirim</p>
          <p className="text-xl font-bold text-emerald-600">{deliveredCount}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dalam Perjalanan</p>
          <p className="text-xl font-bold text-orange-600">{inTransitCount}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Sekolah</p>
          <p className="text-xl font-bold text-blue-700">{schoolMonitoring.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 glass-card p-3">
          <div ref={containerRef} style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
        </div>
        <div className="space-y-3 xl:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Truck size={15} /> Detail Armada</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
              {fleetPositions.length === 0 ? (
                <div className="p-8 text-center"><p className="text-gray-400 text-sm">Belum ada armada aktif</p><p className="text-xs text-gray-300 mt-1">Klik "Mulai Simulasi" untuk demo</p></div>
              ) : fleetPositions.map((pos, i) => (
                <div key={i} className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-mono font-bold text-gray-800 text-sm">{pos.plateNumber || `Armada ${i + 1}`}</p>
                    <StatusBadge status={pos.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Gauge size={12} /> {Math.round(pos.speed)} km/h</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><School size={15} /> Monitoring Sekolah</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
              {schoolMonitoring.map((row, idx) => (
                <div key={`${row.schoolName}-${idx}`} className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-800 font-medium">{row.schoolName}</p>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Truck size={12} /> {row.vehicle}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {row.eta}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Penerima: {row.receivedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
