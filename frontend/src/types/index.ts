// ==================== SCHOOL ====================
export interface ISchool {
  _id: string;
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  totalStudents: number;
  portionsNeeded: number;
  contactPerson: string;
  phone: string;
  district: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStudent {
  _id: string;
  school: string | ISchool;
  name: string;
  studentId: string;
  className: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== VEHICLE ====================
export interface IVehicle {
  _id: string;
  plateNumber: string;
  type: 'Box' | 'Pick Up' | 'Van' | 'Truck';
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance';
  brand: string;
  year: number;
  fuelType: 'Bensin' | 'Solar' | 'Gas';
  assignedDrivers: IDriverSummary[];
  currentLocation: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface IDriverSummary {
  _id: string;
  name: string;
  phone: string;
  status: string;
  employeeId: string;
}

// ==================== DRIVER ====================
export interface IDriver {
  _id: string;
  employeeId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string | null;
  address: string;
  joinDate: string;
  status: 'available' | 'busy' | 'offline';
  assignedVehicle: IVehicle | string | null;
  photo: string;
  rating: number;
  totalDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== DELIVERY PLAN ====================
export interface IDeliveryPlan {
  _id: string;
  date: string;
  vehicle: IVehicle;
  driver: IDriver;
  schools: {
    school: ISchool;
    portions: number;
  }[];
  totalPortions: number;
  status: 'planned' | 'loading' | 'in_transit' | 'completed' | 'cancelled';
  route: IRoute | null;
  departedAt: string | null;
  completedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== ROUTE ====================
export interface IWaypoint {
  school: string | ISchool;
  schoolName: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  order: number;
  eta: string;
  distanceFromPrev: number;
}

export interface IRoute {
  _id: string;
  deliveryPlan: string | IDeliveryPlan;
  origin: {
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  waypoints: IWaypoint[];
  totalDistance: number;
  totalDuration: number;
  optimizedPath: [number, number][];
  algorithm: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== TRACKING ====================
export interface ITracking {
  _id: string;
  deliveryPlan: string;
  driver: IDriver | string;
  vehicle: IVehicle | string;
  currentLocation: {
    type: string;
    coordinates: [number, number];
  };
  speed: number;
  heading: number;
  status: 'departed' | 'in_transit' | 'arrived' | 'idle';
  timestamp: string;
  battery: number;
}

// ==================== DELIVERY (POD) ====================
export interface IDelivery {
  _id: string;
  deliveryPlan: string | IDeliveryPlan;
  school: ISchool;
  driver: IDriver;
  portions: number;
  status: 'pending' | 'delivered' | 'rejected';
  receivedBy: string;
  photoProof: string;
  signature: string;
  receivedAt: string | null;
  notes: string;
  temperature: number | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== ANALYTICS ====================
export interface IPerformanceData {
  period: { month: number; year: number };
  summary: {
    totalDeliveryPlans: number;
    completedPlans: number;
    completionRate: number;
    totalDeliveries: number;
    deliveredCount: number;
    deliveryRate: number;
    totalPortionsDistributed: number;
    onTimeRate: number;
    averageDeliveryTime: number;
  };
  monthlyTrend: {
    month: string;
    year: number;
    deliveries: number;
    portions: number;
    onTimeRate: number;
    fuelEfficiency: number;
  }[];
}

export interface IDashboardStats {
  totalSchools: number;
  totalVehicles: number;
  availableVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  todayDeliveryPlans: number;
  totalPortionsNeeded: number;
  systemStatus: string;
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// ==================== LOAD PLAN ====================
export interface ILoadAssignment {
  vehicle: IVehicle;
  vehicleId: string;
  plateNumber: string;
  capacity: number;
  remainingCapacity: number;
  schools: {
    school: string;
    schoolName: string;
    portions: number;
  }[];
  totalPortions: number;
}

export interface IReadyPortions {
  date: string;
  kitchen: string;
  totalPortionsReady: number;
  totalPortionsOrdered: number;
  schools: {
    schoolId: string;
    schoolName: string;
    portionsOrdered: number;
    portionsReady: number;
    status: string;
    menuItems: { name: string; qty: number }[];
  }[];
  lastUpdated: string;
}
