import type { 
  UserBookingsResponse, 
  StorageBookingsResponse, 
  StorageUnitsResponse,
  CreateBookingResponse,
  AddonsResponse
} from "@shared/schema";

const API_BASE_URL = '/api';

interface UserRoleResponse {
  success: boolean;
  data?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: 'user' | 'partner' | 'saathi';
    profile_picture?: string;
  };
  message?: string;
}

export const api = {
  async getUserRole(phone: string): Promise<UserRoleResponse> {
    const response = await fetch(`${API_BASE_URL}/user-role/${phone}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user role');
    }
    return response.json();
  },

  async getUserBookings(phone: string): Promise<UserBookingsResponse> {
    const response = await fetch(`${API_BASE_URL}/user-bookings/${phone}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user bookings');
    }
    return response.json();
  },

  async getStorageBookings(storageUnitId: string): Promise<StorageBookingsResponse> {
    const response = await fetch(`${API_BASE_URL}/storage-bookings/${storageUnitId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch storage bookings');
    }
    return response.json();
  },

  async getStorageUnits(): Promise<StorageUnitsResponse> {
    const response = await fetch(`${API_BASE_URL}/storage-units/`);
    if (!response.ok) {
      throw new Error('Failed to fetch storage units');
    }
    return response.json();
  },

  async getAddons(): Promise<AddonsResponse> {
    const response = await fetch(`${API_BASE_URL}/addons`);
    if (!response.ok) {
      throw new Error('Failed to fetch addons');
    }
    return response.json();
  },

  async createBooking(formData: FormData): Promise<CreateBookingResponse> {
    const response = await fetch(`${API_BASE_URL}/create-everything`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to create booking');
    }
    return response.json();
  },
};
