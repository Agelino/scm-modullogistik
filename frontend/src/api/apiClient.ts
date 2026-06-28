import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});


// ====== Schools ======
export const schoolApi = {
  getAll: () => api.get('/schools'),
  getById: (id: string) => api.get(`/schools/${id}`),
  create: (data: Record<string, unknown>) => api.post('/schools', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/schools/${id}`, data),
  delete: (id: string) => api.delete(`/schools/${id}`),
  getPortionStats: () => api.get('/schools/stats/portions'),
  geocode: (query: string) => api.get('/schools/geocode', { params: { q: query } }),
  login: (username: string, password: string) => api.post('/schools/login', { username, password }),
};

// ====== Students ======
export const studentApi = {
  getAll: (params?: Record<string, string>) => api.get('/students', { params }),
  getBySchool: (schoolId: string) => api.get(`/students/school/${schoolId}`),
  create: (data: Record<string, unknown>) => api.post('/students', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

// ====== Vehicles ======
export const vehicleApi = {
  getAll: () => api.get('/vehicles'),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: Record<string, unknown>) => api.post('/vehicles', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  assignDriver: (vehicleId: string, driverId: string) => api.post(`/vehicles/${vehicleId}/assign-driver`, { driverId }),
  removeDriver: (vehicleId: string, driverId: string) => api.delete(`/vehicles/${vehicleId}/remove-driver/${driverId}`),
};

// ====== Drivers ======
export const driverApi = {
  getAll: () => api.get('/drivers'),
  getById: (id: string) => api.get(`/drivers/${id}`),
  create: (data: Record<string, unknown>) => api.post('/drivers', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/drivers/${id}/status`, { status }),
};

// ====== Load Plans ======
export const loadPlanApi = {
  getReadyPortions: () => api.get('/load-plans/ready-portions'),
  getProductionStatus: () => api.get('/load-plans/production-status'),
  calculate: (data: Record<string, unknown>) => api.post('/load-plans/calculate', data),
  getAll: () => api.get('/load-plans'),
  create: (data: Record<string, unknown>) => api.post('/load-plans', data),
  updateStatus: (id: string, status: string) => api.patch(`/load-plans/${id}/status`, { status }),
};

// ====== Route Optimization ======
export const routeApi = {
  optimize: (data: Record<string, unknown>) => api.post('/routes/optimize', data),
  getAll: () => api.get('/routes'),
  getByPlan: (planId: string) => api.get(`/routes/${planId}`),
};

// ====== Tracking ======
export const trackingApi = {
  update: (data: Record<string, unknown>) => api.post('/tracking/update', data),
  getByPlan: (planId: string) => api.get(`/tracking/${planId}`),
  getHistory: (planId: string) => api.get(`/tracking/${planId}/history`),
  getActiveFleet: () => api.get('/tracking/active/all'),
};

// ====== Deliveries (POD) ======
export const deliveryApi = {
  getAll: (params?: Record<string, string>) => api.get('/deliveries', { params }),
  getByPlan: (planId: string) => api.get(`/deliveries/plan/${planId}`),
  confirm: (id: string, formData: FormData) => api.post(`/deliveries/${id}/confirm`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id: string, status: string) => api.patch(`/deliveries/${id}/status`, { status }),
  createFromPlan: (deliveryPlanId: string) => api.post('/deliveries', { deliveryPlanId }),
};

// ====== Analytics ======
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPerformance: (month?: number, year?: number) => api.get('/analytics/performance', { params: { month, year } }),
  getFuelEfficiency: () => api.get('/analytics/fuel-efficiency'),
  getOnTimeRate: () => api.get('/analytics/on-time-rate'),
};

// ====== Settings ======
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: Record<string, unknown>) => api.put('/settings', data),
  getKitchenLocation: () => api.get('/settings/kitchen-location'),
};

export default api;
