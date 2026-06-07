/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
export type TransmissionType = 'Manual' | 'Automatic';
export type CarCategory = 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'MUV';
export type CarStatus = 'available' | 'booked' | 'maintenance';

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  seats: number;
  category: CarCategory;
  price_per_hour: number;
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  km_limit_per_day: number;
  extra_km_charge: number;
  deposit_amount: number;
  location: string;
  status: CarStatus;
  is_featured: boolean;
  description: string;
  features: string[];
  images: string[];
  total_trips: number;
  rating: number;
  created_at?: string;
}

export type DurationType = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  car_id: string;
  start_time: string;
  end_time: string;
  pickup_location?: string;
  drop_location?: string;
  duration_type: DurationType;
  total_hours: number;
  total_amount: number;
  deposit_paid: boolean;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  notes?: string;
  created_at?: string;
  car?: Car; // Joined car details
}

export interface Review {
  id: string;
  car_id: string;
  booking_id?: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at?: string;
  car?: Car; // Joined car details
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at?: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_percent: number;
  max_discount: number;
  valid_till: string;
  is_active: boolean;
  created_at?: string;
}

export interface AppConfig {
  isDemoMode: boolean;
  supabaseUrlExists: boolean;
  supabaseKeyExists: boolean;
}
