import { BrowserRouter, Routes, Route } from 'react-router';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import SchoolManagement from './pages/SchoolManagement';
import FleetManagement from './pages/FleetManagement';
import LoadPlanning from './pages/LoadPlanning';
import RouteOptimization from './pages/RouteOptimization';
import LiveMonitoring from './pages/LiveMonitoring';
import ProofOfDelivery from './pages/ProofOfDelivery';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schools" element={<SchoolManagement />} />
          <Route path="/fleet" element={<FleetManagement />} />
          <Route path="/load-plan" element={<LoadPlanning />} />
          <Route path="/route-optimization" element={<RouteOptimization />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/proof-of-delivery" element={<ProofOfDelivery />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
