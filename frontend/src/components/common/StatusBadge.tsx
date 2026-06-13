interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusLabels: Record<string, string> = {
  available: 'Tersedia',
  in_use: 'Digunakan',
  maintenance: 'Perawatan',
  busy: 'Sibuk',
  offline: 'Offline',
  planned: 'Direncanakan',
  loading: 'Memuat',
  in_transit: 'Dalam Perjalanan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  pending: 'Menunggu',
  delivered: 'Terkirim',
  rejected: 'Ditolak',
  departed: 'Berangkat',
  arrived: 'Tiba',
  idle: 'Idle',
  ready: 'Siap',
  preparing: 'Persiapan',
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      {label || statusLabels[status] || status}
    </span>
  );
}
