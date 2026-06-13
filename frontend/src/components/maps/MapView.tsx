import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type?: 'kitchen' | 'school' | 'vehicle';
  popup?: string;
}

interface MapViewProps {
  markers?: MarkerData[];
  routePath?: [number, number][];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

// SVG icons for map markers (inline, no emoji)
const markerSvgs: Record<string, string> = {
  kitchen: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>',
  school: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M18 5v17"/><path d="m4 6 8-4 8 4"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg>',
  vehicle: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
};

function createCustomIcon(type: string = 'school') {
  const svg = markerSvgs[type] || markerSvgs.school;
  const bgColor = type === 'kitchen' ? '#c62828' : type === 'vehicle' ? '#2e7d32' : '#1b5e20';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${bgColor};width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px ${bgColor}40;border:2px solid #fff;">${svg}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export default function MapView({ markers = [], routePath = [], center = [-6.2088, 106.8456], zoom = 12, height = '500px', onMapClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(mapRef.current);

    if (onMapClick) {
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add tile layer back if needed
    let hasTile = false;
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) hasTile = true;
    });
    if (!hasTile) {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Add markers
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: createCustomIcon(m.type || 'school'),
      }).addTo(mapRef.current!);

      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;"><strong>${m.label}</strong>${m.popup ? `<br/><span style="color:#6b7280;font-size:12px;">${m.popup}</span>` : ''}</div>`
      );
    });

    // Add route path
    if (routePath.length > 1) {
      const latLngs: L.LatLngExpression[] = routePath.map(([lng, lat]) => [lat, lng]);
      L.polyline(latLngs, {
        color: '#2e7d32',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 8',
      }).addTo(mapRef.current);
    }

    // Fit bounds
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, routePath]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}
    />
  );
}
