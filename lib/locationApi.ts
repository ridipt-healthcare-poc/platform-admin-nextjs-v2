import { api } from "./api";

// Location Types
export interface Location {
  _id: string;
  facilityId: string;
  facilityType: "Hospital" | "Clinic";
  branchName: string;
  branchCode: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isMainBranch: boolean;
  operatingHours: Record<string, { open: string; close: string; is24x7?: boolean }>;
  numberOfBeds?: number;
  departments?: string[];
  facilities?: string[];
  totalDoctors: number;
  totalSupportStaff: number;
  isActive: boolean;
  branchManager?: {
    name: string;
    phone: string;
    email: string;
  };
  description?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Location API Services
export const locationService = {
  // Get all locations for a facility
  getLocationsByFacility: async (facilityId: string, params?: Record<string, unknown>) => {
    const response = await api.get(`/api/locations/facility/${facilityId}`, { params });
    return response.data;
  },

  // Get all locations (public)
  getAllLocations: async (params?: Record<string, unknown>) => {
    const response = await api.get("/api/locations/all", { params });
    return response.data;
  },

  // Get location by ID
  getLocationById: async (locationId: string) => {
    const response = await api.get(`/api/locations/${locationId}`);
    return response.data;
  },

  // Get location statistics
  getLocationStats: async (locationId: string) => {
    const response = await api.get(`/api/locations/${locationId}/stats`);
    return response.data;
  },
};
