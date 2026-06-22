import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Leaf, Package, Truck, Map, BarChart3, Lock, User } from 'lucide-react';

const features = [
  { icon: Package, label: 'Perencanaan Muatan', desc: 'Otomasi rencana distribusi MBG' },
  { icon: Truck, label: 'Armada & Driver', desc: 'Manajemen kendaraan real-time' },
  { icon: Map, label: 'Optimasi Rute', desc: 'Rute terpendek dengan AI' },
  { icon: BarChart3, label: 'Analisis Performa', desc: 'Laporan dan statistik lengkap' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan password wajib diisi');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Login gagal. Periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* ─── Decorative blobs ─── */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-wrapper">
        {/* ─── Left panel — branding ─── */}
        <div className="login-left">
          <div className="login-brand">
            <div className="login-brand-mark" />
            <h1 className="login-brand-title">SCM MBG</h1>
          </div>

          <div className="login-tagline">
            <Leaf size={18} className="login-tagline-icon" />
            <span>Supply Chain Management</span>
          </div>

          <p className="login-hero-text">
            Platform logistik terpadu untuk distribusi Makan Bergizi Gratis yang efisien, akurat, dan real-time.
          </p>

          <div className="login-features">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="login-feature-item">
                <div className="login-feature-icon">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="login-feature-label">{label}</p>
                  <p className="login-feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="login-stats">
            <div className="login-stat">
              <span className="login-stat-value">8</span>
              <span className="login-stat-label">Modul Aktif</span>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <span className="login-stat-value">Real-time</span>
              <span className="login-stat-label">Monitoring</span>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <span className="login-stat-value">AI</span>
              <span className="login-stat-label">Route Optimize</span>
            </div>
          </div>
        </div>

        {/* ─── Right panel — form ─── */}
        <div className="login-right">
          <div className="login-card">
            {/* Header */}
            <div className="login-card-header">
              <div className="login-card-icon">
                <Lock size={22} />
              </div>
              <h2 className="login-card-title">Masuk ke Sistem</h2>
              <p className="login-card-subtitle">Gunakan kredensial yang diberikan oleh administrator</p>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error" role="alert">
                <span className="login-error-dot" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="login-field">
                <label htmlFor="login-username" className="login-label">Username</label>
                <div className="login-input-wrap">
                  <User size={16} className="login-input-icon" />
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="login-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password" className="login-label">Password</label>
                <div className="login-input-wrap">
                  <Lock size={16} className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="login-input login-input-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoading}
                id="btn-login-submit"
              >
                {isLoading ? (
                  <>
                    <span className="login-spinner" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            {/* Hint */}
            <div className="login-hint">
              <p>Default akun: <strong>admin</strong> / <strong>admin123</strong></p>
            </div>
          </div>

          <p className="login-footer">© 2024 SCM MBG — Sistem Manajemen Rantai Pasok</p>
        </div>
      </div>
    </div>
  );
}
