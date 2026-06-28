import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import SchoolManagement from './pages/SchoolManagement';
import FleetManagement from './pages/FleetManagement';
import LoadPlanning from './pages/LoadPlanning';
import RouteOptimization from './pages/RouteOptimization';
import LiveMonitoring from './pages/LiveMonitoring';
import ProofOfDelivery from './pages/ProofOfDelivery';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';

/** Guard: redirect ke /login jika belum autentikasi */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f7f0'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #c8e6c9',
            borderTopColor: '#1b5e20',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: 14, color: '#6b7280' }}>Memuat sistem...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/** Guard: redirect ke / jika sudah login */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* Protected */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/schools" element={<SchoolManagement />} />
            <Route path="/fleet" element={<FleetManagement />} />
            <Route path="/load-plan" element={<LoadPlanning />} />
            <Route path="/route-optimization" element={<RouteOptimization />} />
            <Route path="/live-monitoring" element={<LiveMonitoring />} />
            <Route path="/proof-of-delivery" element={<ProofOfDelivery />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
