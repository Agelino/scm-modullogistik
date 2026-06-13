import { useState, useEffect } from 'react';
import { analyticsApi } from '../api/apiClient';
import type { IDashboardStats, IPerformanceData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { School, Truck, User, UtensilsCrossed, Package, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [performance, setPerformance] = useState<IPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, perfRes] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getPerformance()
      ]);
      setStats(statsRes.data.data);
      setPerformance(perfRes.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat dashboard..." />;

  const statCards: { label: string; value: string | number; icon: LucideIcon; glow: string; color: string; bgGrad: string }[] = [
    { label: 'Total Sekolah', value: stats?.totalSchools || 0, icon: School, glow: 'stat-glow-cyan', color: 'text-green-700', bgGrad: 'from-green-100 to-green-50' },
    { label: 'Armada Tersedia', value: `${stats?.availableVehicles || 0}/${stats?.totalVehicles || 0}`, icon: Truck, glow: 'stat-glow-blue', color: 'text-blue-700', bgGrad: 'from-blue-100 to-blue-50' },
    { label: 'Driver Aktif', value: `${stats?.activeDrivers || 0}/${stats?.totalDrivers || 0}`, icon: User, glow: 'stat-glow-green', color: 'text-green-700', bgGrad: 'from-green-100 to-green-50' },
    { label: 'Total Porsi Hari Ini', value: stats?.totalPortionsNeeded?.toLocaleString('id-ID') || '0', icon: UtensilsCrossed, glow: 'stat-glow-amber', color: 'text-orange-700', bgGrad: 'from-orange-100 to-orange-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="dashboard-hero">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-green-700/80 mb-2">SCM Command Center</p>
          <h1 className="text-3xl font-bold text-gray-800 leading-tight">Dashboard Operasional MBG</h1>
          <p className="text-sm text-gray-500 mt-2">Ringkasan armada, sekolah, dan distribusi dalam satu tampilan real-time.</p>
        </div>
        <div className="hero-mini-grid">
          <div className="hero-mini-card">
            <p className="text-[11px] text-gray-500">Rencana Hari Ini</p>
            <p className="text-xl font-semibold text-green-700">{stats?.todayDeliveryPlans || 0}</p>
          </div>
          <div className="hero-mini-card">
            <p className="text-[11px] text-gray-500">Status Sistem</p>
            <p className="text-xl font-semibold text-green-600">Online</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`glass-card p-5 dashboard-stat-card ${card.glow}`}
            style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.bgGrad} flex items-center justify-center`}>
                <card.icon size={24} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package size={16} /> Pengiriman Bulanan</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={performance?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e0e3e8', borderRadius: '12px', color: '#1f2937' }}
              />
              <Bar dataKey="deliveries" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Pengiriman" />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4caf50" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><UtensilsCrossed size={16} /> Distribusi Porsi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={performance?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e0e3e8', borderRadius: '12px', color: '#1f2937' }}
              />
              <Area type="monotone" dataKey="portions" stroke="#1b5e20" fill="url(#areaGradient)" strokeWidth={2} name="Porsi" />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2e7d32" stopOpacity={0.05} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={16} /> Performa Bulan Ini</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tingkat Penyelesaian', value: `${performance?.summary.completionRate || 0}%`, color: 'text-green-700' },
            { label: 'Ketepatan Waktu', value: `${performance?.summary.onTimeRate || 0}%`, color: 'text-green-600' },
            { label: 'Rata-rata Waktu Kirim', value: `${performance?.summary.averageDeliveryTime || 0} mnt`, color: 'text-blue-700' },
            { label: 'Porsi Terdistribusi', value: (performance?.summary.totalPortionsDistributed || 0).toLocaleString('id-ID'), color: 'text-orange-700' },
          ].map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
