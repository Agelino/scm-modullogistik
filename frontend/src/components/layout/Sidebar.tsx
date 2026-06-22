import { NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, School, Truck, Package, Map, Radio, CheckCircle, TrendingUp, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems: { path: string; label: string; icon: LucideIcon }[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/schools', label: 'Master Data (Menu/Sekolah/Siswa)', icon: School },
  { path: '/fleet', label: 'Armada & Driver', icon: Truck },
  { path: '/load-plan', label: 'Perencanaan Muatan', icon: Package },
  { path: '/route-optimization', label: 'Optimasi Rute', icon: Map },
  { path: '/live-monitoring', label: 'Live Monitoring', icon: Radio },
  { path: '/proof-of-delivery', label: 'Bukti Pengiriman', icon: CheckCircle },
  { path: '/analytics', label: 'Analisis Performa', icon: TrendingUp },
];

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  supervisor: 'Supervisor',
  operator: 'Operator',
};

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ className, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Inisial untuk avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className={className ?? 'app-sidebar'}>
      <div className="sidebar-panel ">
        <div className="sidebar-brand ">
          <div className="sidebar-brand-mark" />
          <h1 className="sidebar-brand-title">SCM MBG</h1>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="sidebar-caption">Menu Utama</p>
          <div className="space-y-1.5 mt-2" >
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
                onClick={onNavigate}
              >
                <span className="sidebar-nav-icon"><item.icon size={16} /></span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          <div className="sidebar-user-card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name ?? 'Pengguna'}</p>
              <p className="text-[10px] text-gray-500">{roleLabels[user?.role ?? ''] ?? user?.role ?? ''}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
          </div>

          <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
