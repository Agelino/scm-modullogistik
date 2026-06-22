import { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return (
    <header className="app-header">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              className="icon-btn"
              aria-label={isSidebarOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={!!isSidebarOpen}
              onClick={onToggleSidebar}
            >
              <Menu size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Cari sekolah, kendaraan, driver..."
              className="form-input app-search-input"
              id="header-search"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
          </div>

          <div className="quick-tabs">
            <button className="quick-tab active">Overview</button>
            <button className="quick-tab">Operasional</button>
            <button className="quick-tab">Sekolah</button>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end xl:self-auto">
          <div className="time-pill text-right">
            <p className="text-[11px] text-gray-500">
              {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm font-mono font-semibold text-green-700">
              {time.toLocaleTimeString('id-ID')}
            </p>
          </div>

          <button className="relative icon-btn" id="btn-notifications" aria-label="Notifikasi">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-green-700">Sistem Aktif</span>
          </div>

          <button className="profile-chip" aria-label="Profil pengguna">
            <span className="profile-avatar">{initials}</span>
            <span className="text-xs text-gray-700">{user?.name?.split(' ')[0] ?? 'Admin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
