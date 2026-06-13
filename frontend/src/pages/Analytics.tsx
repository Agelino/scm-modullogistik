import { useState, useEffect } from 'react';
import { analyticsApi } from '../api/apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TrendingUp, CheckCircle, Clock, Truck, Fuel, Package, UtensilsCrossed, MapPin } from 'lucide-react';

const COLORS = ['#2e7d32', '#1565c0', '#7b1fa2', '#e65100', '#1b5e20', '#c62828'];

export default function Analytics() {
  const [performance, setPerformance] = useState<any>(null);
  const [fuel, setFuel] = useState<any>(null);
  const [onTime, setOnTime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getPerformance(),
      analyticsApi.getFuelEfficiency(),
      analyticsApi.getOnTimeRate()
    ]).then(([pRes, fRes, oRes]) => {
      setPerformance(pRes.data.data);
      setFuel(fRes.data.data);
      setOnTime(oRes.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Memuat analisis..." />;

  const pieData = [
    { name: 'Tepat Waktu', value: onTime?.onTimeCount || 85 },
    { name: 'Terlambat', value: onTime?.lateCount || 15 },
  ];

  const kpiCards = [
    { label: 'Penyelesaian', value: `${performance?.summary?.completionRate || 0}%`, icon: CheckCircle, color: 'text-green-700' },
    { label: 'Ketepatan Waktu', value: `${onTime?.overallRate || 0}%`, icon: Clock, color: 'text-green-600' },
    { label: 'Avg Waktu Kirim', value: `${performance?.summary?.averageDeliveryTime || 0}m`, icon: Truck, color: 'text-blue-700' },
    { label: 'Efisiensi BB', value: `${fuel?.summary?.avgFuelEfficiency || 0} km/L`, icon: Fuel, color: 'text-orange-700' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={22} /> Analisis Performa Logistik</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard AI Insight untuk efisiensi armada dan pengiriman</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <p className="text-2xl mb-1 flex justify-center"><kpi.icon size={24} className={kpi.color} /></p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package size={15} /> Tren Pengiriman Bulanan</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={performance?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e3e8', borderRadius: '12px', color: '#1f2937' }} />
              <Bar dataKey="deliveries" fill="#2e7d32" radius={[6, 6, 0, 0]} name="Pengiriman" />
              <Bar dataKey="onTimeRate" fill="#4caf50" radius={[6, 6, 0, 0]} name="% Tepat Waktu" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Fuel size={15} /> Efisiensi Bahan Bakar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={performance?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e3e8', borderRadius: '12px', color: '#1f2937' }} />
              <Line type="monotone" dataKey="fuelEfficiency" stroke="#e65100" strokeWidth={2} dot={{ fill: '#e65100', r: 4 }} name="km/L" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock size={15} /> Ketepatan Waktu</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e3e8', borderRadius: '12px', color: '#1f2937' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }}></div>
                <span className="text-gray-600">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><UtensilsCrossed size={15} /> Distribusi Porsi Bulanan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performance?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e3e8', borderRadius: '12px', color: '#1f2937' }} />
              <Area type="monotone" dataKey="portions" stroke="#1b5e20" fill="url(#portionGrad)" strokeWidth={2} name="Porsi" />
              <defs><linearGradient id="portionGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2e7d32" stopOpacity={0.3} /><stop offset="100%" stopColor="#2e7d32" stopOpacity={0.05} /></linearGradient></defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District breakdown */}
      {onTime?.byDistrict && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-200"><h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><MapPin size={15} /> Performa per Wilayah</h3></div>
          <table className="data-table">
            <thead><tr><th>Wilayah</th><th>Total Pengiriman</th><th>Tepat Waktu (%)</th><th>Terlambat (%)</th><th>Visual</th></tr></thead>
            <tbody>
              {onTime.byDistrict.map((d: any, i: number) => (
                <tr key={i}>
                  <td className="font-medium text-gray-800">{d.district}</td>
                  <td>{d.total}</td>
                  <td className="text-green-700 font-semibold">{d.onTime}%</td>
                  <td className="text-red-600">{d.late}%</td>
                  <td><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-600 rounded-full" style={{ width: `${d.onTime}%` }}></div></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
