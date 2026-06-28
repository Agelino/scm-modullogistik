import { useState, useEffect } from 'react';
import { settingsApi, schoolApi } from '../api/apiClient';
import MapView from '../components/maps/MapView';
import { Settings as SettingsIcon, MapPin, Save, Building2, Loader2 } from 'lucide-react';

interface KitchenData {
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export default function Settings() {
  const [kitchen, setKitchen] = useState<KitchenData>({
    name: 'Dapur Pusat MBG',
    address: '',
    coordinates: [106.8456, -6.2088],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    settingsApi.get().then(res => {
      const s = res.data?.data;
      if (s?.kitchen) {
        setKitchen({
          name: s.kitchen.name || 'Dapur Pusat MBG',
          address: s.kitchen.address || '',
          coordinates: s.kitchen.location?.coordinates || [106.8456, -6.2088],
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await settingsApi.update({
        kitchenName: kitchen.name,
        kitchenAddress: kitchen.address,
        kitchenCoordinates: kitchen.coordinates,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleGeocode = async () => {
    const query = kitchen.address.trim();
    if (!query) return;
    setGeocoding(true);
    try {
      // Coba geocode lewat backend
      const res = await schoolApi.geocode(query);
      const results = res.data?.data;
      console.log('Geocode results:', results);

      if (Array.isArray(results) && results.length > 0) {
        const first = results[0];
        if (first.lat && first.lng) {
          setKitchen(prev => ({
            ...prev,
            coordinates: [first.lng, first.lat],
          }));
          return;
        }
      }

      // Jika tidak ditemukan, coba search lebih sederhana (nama kota saja)
      const simplified = query.replace(/No\.\s*\d+,?\s*/gi, '').replace(/Kec\.\s*/gi, '').replace(/Jl\.\s*/gi, '');
      if (simplified !== query) {
        const res2 = await schoolApi.geocode(simplified);
        const results2 = res2.data?.data;
        if (Array.isArray(results2) && results2.length > 0 && results2[0].lat && results2[0].lng) {
          setKitchen(prev => ({
            ...prev,
            coordinates: [results2[0].lng, results2[0].lat],
          }));
          return;
        }
      }

      alert('Lokasi tidak ditemukan via pencarian alamat.\n\nAlternatif:\n1. Klik langsung pada peta\n2. Copy koordinat dari Google Maps\n3. Isi Latitude & Longitude manual');
    } catch (err) {
      console.error('Geocode error:', err);
      alert('Gagal melakukan geocoding. Coba klik langsung pada peta.');
    } finally {
      setGeocoding(false);
    }
  };

  const handlePasteFromGoogleMaps = () => {
    const input = prompt(
      'Paste koordinat dari Google Maps.\n\n' +
      'Cara: Buka Google Maps → klik kanan pada lokasi → klik koordinat yang muncul (otomatis tercopy)\n\n' +
      'Format: -6.9366, 107.6333'
    );
    if (!input) return;

    // Parse berbagai format: "-6.9366, 107.6333" atau "-6.9366 107.6333"
    const parts = input.trim().split(/[,\s]+/).map(s => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      // Google Maps format: lat, lng
      setKitchen(prev => ({
        ...prev,
        coordinates: [parts[1], parts[0]], // [lng, lat]
      }));
    } else {
      alert('Format koordinat tidak valid. Contoh: -6.9366, 107.6333');
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setKitchen(prev => ({ ...prev, coordinates: [lng, lat] }));
  };

  const mapMarkers = [
    {
      id: 'kitchen',
      lat: kitchen.coordinates[1],
      lng: kitchen.coordinates[0],
      label: kitchen.name,
      type: 'kitchen' as const,
      popup: kitchen.address || 'Lokasi dapur/gudang',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SettingsIcon size={22} /> Pengaturan
        </h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi lokasi dapur/gudang sebagai titik awal pengiriman</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Building2 size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Lokasi Dapur / Gudang</h2>
              <p className="text-xs text-gray-500">Titik awal untuk optimasi rute & live monitoring</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Dapur / Gudang</label>
            <input
              type="text"
              className="form-input"
              value={kitchen.name}
              onChange={e => setKitchen(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Dapur MBG Bandung"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="form-input flex-1"
                value={kitchen.address}
                onChange={e => setKitchen(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Contoh: Jl. Braga No. 10, Bandung"
              />
              <button
                onClick={handleGeocode}
                disabled={geocoding || !kitchen.address.trim()}
                className="btn-secondary text-xs px-3 flex items-center gap-1 whitespace-nowrap"
              >
                {geocoding ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                Cari
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Klik "Cari" untuk otomatis isi koordinat dari alamat</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Longitude</label>
              <input
                type="number"
                step="0.0001"
                className="form-input"
                value={kitchen.coordinates[0]}
                onChange={e => setKitchen(prev => ({
                  ...prev,
                  coordinates: [parseFloat(e.target.value) || 0, prev.coordinates[1]],
                }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Latitude</label>
              <input
                type="number"
                step="0.0001"
                className="form-input"
                value={kitchen.coordinates[1]}
                onChange={e => setKitchen(prev => ({
                  ...prev,
                  coordinates: [prev.coordinates[0], parseFloat(e.target.value) || 0],
                }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 -mt-1">
            <p className="text-[10px] text-gray-400 flex-1">Atau klik langsung pada peta untuk menentukan lokasi</p>
            <button
              onClick={handlePasteFromGoogleMaps}
              type="button"
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
            >
              <MapPin size={11} /> Paste dari Google Maps
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>

          {saved && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
              <p className="text-sm font-medium text-green-700">✓ Pengaturan berhasil disimpan!</p>
              <p className="text-xs text-green-600 mt-0.5">Semua modul akan menggunakan lokasi ini sebagai titik awal.</p>
            </div>
          )}
        </div>

        {/* Map Preview */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <MapPin size={15} /> Preview Lokasi Dapur
          </h3>
          <MapView
            markers={mapMarkers}
            center={[kitchen.coordinates[1], kitchen.coordinates[0]]}
            zoom={14}
            height="460px"
            onMapClick={handleMapClick}
          />
          <p className="text-[10px] text-gray-400 text-center">Klik pada peta untuk memindahkan lokasi dapur</p>
        </div>
      </div>
    </div>
  );
}
