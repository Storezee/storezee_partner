import { z } from "zod";

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'partner' | 'saathi';
  latitude?: number;
  longitude?: number;
  profile_picture?: string;
  city_name?: string;
  identification_number?: string;
}

export interface StorageUnit {
  id: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
}

export interface Addon {
  addon_id: string;
  name: string;
  price: number;
}
export interface AddonsResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    base_price: number;
    description?: string;
  }[];
}


export interface Booking {
  id: string;
  user_booked_id: string;
  storage_unit_id: string;
  booking_id: string;
  booking_type: string;
  booking_created_time: string;
  booking_end_time: string;
  status: string;
  storage_image_url?: string;
  luggage_images?: string | string[];
  amount: number;
  storage_latitude?: number;
  storage_longitude?: number;
  storage_booked_location?: string;
  pickup_confirmed_at?: string;
  storage_location_updated_at?: string;
  user_remark?: string;
  last_updated_by?: string;
  amount_updated_by?: string;
  created_at: string;
  updated_at: string;
  payment_status?: string;
  user_id?: string;
  user_full_name?: string;
  user_email?: string;
  user_phone?: string;
  user_identification_number?: string;
  user_document_id?: string;
  user_document_original_name?: string;
  user_document_url?: string;
  storage_id?: string;
  storage_title?: string;
  storage_description?: string;
  storage_address?: string;
  storage_city?: string;
  storage_state?: string;
  storage_pincode?: string;
  storage_lat?: number;
  storage_lng?: number;
  storage_rating?: number;
  addons?: Addon[];
}

export interface BookingSummary {
  total_bookings: number;
  total_amount: number;
  total_paid_amount: number;
}

export interface UserBookingsResponse {
  success: boolean;
  count: number;
  data: Booking[];
}

export interface StorageBookingsResponse {
  success: boolean;
  count: number;
  summary: BookingSummary;
  data: Booking[];
}

export interface StorageUnitsResponse {
  success: boolean;
  data: StorageUnit[];
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    booking_id: string;
    luggage_images: string[];
  };
  error?: string;
}

export const createBookingSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  storage_unit_id: z.string().min(1, "Storage unit is required"),
  booking_created_time: z.string().min(1, "Booking time is required"),
  storage_booked_location: z.string().min(1, "Location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  user_remark: z.string().optional(),
  luggage_time: z.number().min(1).max(720),
  addons: z.string().optional(),
  identification_number: z.string().optional(),
  file: z.any().optional(),
  luggage_pic: z.any().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
