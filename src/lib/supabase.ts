/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Car, Booking, Review, Offer, SiteSetting, CarStatus, BookingStatus, AppConfig } from '../types';

// Check if Supabase keys exist in Vite context
const isSupabaseConfigured = false;

// Initialize real Supabase client if configured
export const supabase = null;

// Log Supabase configuration state
console.log("💻 Drive-Eaze is running in Local Storage Offline Mode.");

// ────────────────────────────────────────────────────────────────────────
// LOCAL SEED DATA
// ────────────────────────────────────────────────────────────────────────

const DEFAULT_CARS: Car[] = [
  {
    id: 'car-thar-001',
    name: 'Thar LX Convertible',
    brand: 'Mahindra',
    model: 'Convertible Off-Road 4WD',
    year: 2024,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    seats: 4,
    category: 'SUV',
    price_per_hour: 250,
    price_per_day: 2999,
    price_per_week: 18999,
    price_per_month: 65000,
    km_limit_per_day: 300,
    extra_km_charge: 12,
    deposit_amount: 5000,
    location: 'Lucknow',
    status: 'available',
    is_featured: true,
    description: 'Experience the raw power and wind-in-the-hair freedom of India\'s most desirable off-roader. The Mahindra Thar LX Convertible 4x4 Automatic offers state-of-the-art electronics paired with unparalleled ruggedness. Perfect for long highway runs, style statements in Lucknow city, or exploring local terrains. Equipped with cruise control, android auto, and superb air conditioning.',
    features: ['4WD Drive System', 'Convertible Hard/Soft Roof', 'Touchscreen infotainment', 'Apple CarPlay & Android Auto', 'All-Terrain Alloy Wheels', 'Reverse Parking Sensors', 'Sleek Air Conditioning'],
    images: [
      'https://images.unsplash.com/photo-1698144670460-e483569527ad?w=1200&auto=format&fit=crop&q=82',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=82'
    ],
    total_trips: 184,
    rating: 4.9
  },
  {
    id: 'car-creta-002',
    name: 'Creta SX (O) Turbo',
    brand: 'Hyundai',
    model: 'Panoramic Sunroof Premium',
    year: 2024,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    category: 'SUV',
    price_per_hour: 199,
    price_per_day: 2499,
    price_per_week: 14999,
    price_per_month: 49999,
    km_limit_per_day: 300,
    extra_km_charge: 10,
    deposit_amount: 4000,
    location: 'Lucknow',
    status: 'available',
    is_featured: true,
    description: 'The Hyundai Creta SX (O) Turbo is the undisputed king of luxury compact SUVs. Features a gorgeous full panoramic voice-enabled sunroof, leather ventilated front seats, premium Bose Sound System, and advanced comfort suspension. An elegant black-on-black cabin finish gives it a sharp, Bloomberg-meets-luxury aesthetic. Recommended for corporate commutes and executive travel.',
    features: ['Panoramic Voice Sunroof', 'Ventilated Front Seats', '8-Speaker Bose Premium Audio', '360 Degree Surround Camera', 'ADAS Driving Assistance', 'Wireless Charger', 'Automatic Air Purifier'],
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=82',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=82'
    ],
    total_trips: 242,
    rating: 4.85
  },
  {
    id: 'car-fortuner-003',
    name: 'Fortuner Legender 4x4',
    brand: 'Toyota',
    model: 'Legender Flagship SUV',
    year: 2024,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    category: 'Luxury',
    price_per_hour: 499,
    price_per_day: 5999,
    price_per_week: 34999,
    price_per_month: 110000,
    km_limit_per_day: 300,
    extra_km_charge: 15,
    deposit_amount: 10000,
    location: 'Lucknow',
    status: 'available',
    is_featured: true,
    description: 'Command immediate respect on Lucknow roads. The Toyota Fortuner Legender features a dual-tone aggressive exterior, electronic power seats, sequential LED turn indicators, and power tailgates. It is Lucknow\'s ultimate VIP rental status symbol, highly requested for political rallies, weddings, top tier corporate clients, and highway tour trips.',
    features: ['Legender Body Styling', 'Electric Tailgate Sense', 'Ambient Lighting Pack', 'Premium Black & Maroon Leather', 'Eco/Power/Sport Driving Modes', '7 Airbags Shield', 'Active Traction Control'],
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&auto=format&fit=crop&q=82',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=82'
    ],
    total_trips: 92,
    rating: 4.95
  },
  {
    id: 'car-swift-004',
    name: 'Swift ZXI+ Smart Hybrid',
    brand: 'Maruti Suzuki',
    model: 'ZXI+ Top Spec Hatchback',
    year: 2023,
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    category: 'Hatchback',
    price_per_hour: 99,
    price_per_day: 1499,
    price_per_week: 8999,
    price_per_month: 29999,
    km_limit_per_day: 300,
    extra_km_charge: 8,
    deposit_amount: 3000,
    location: 'Lucknow',
    status: 'available',
    is_featured: true,
    description: 'Agile, highly fuel-efficient, and easy to park. The Swift ZXI+ Smart Hybrid is the perfect companion for quick navigations through Hazratganj, Aminabad, and tight city lanes. Features automatic climate control, alloy wheels, push-button start/stop, and a sporty leather steering wheel. Drive smart, pay less.',
    features: ['Smart LED Projector Headlamps', 'Sleek Precision Alloys', 'Push Start Stop Ignition', 'Automatic Climate Control', 'Fuel Saving Idle Start Stop', 'Reverse Parking Camera', 'Android Auto Head Unit'],
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=82',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=82'
    ],
    total_trips: 412,
    rating: 4.78
  },
  {
    id: 'car-nexon-005',
    name: 'Nexon EV Empowered',
    brand: 'Tata',
    model: 'Empowered Range EV',
    year: 2024,
    fuel_type: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    category: 'SUV',
    price_per_hour: 210,
    price_per_day: 2599,
    price_per_week: 15999,
    price_per_month: 52000,
    km_limit_per_day: 300,
    extra_km_charge: 12,
    deposit_amount: 5000,
    location: 'Lucknow',
    status: 'available',
    is_featured: true,
    description: 'Go green without compromising on style or torque. The Tata Nexon EV Empowered features a super quiet silent electric drive, virtual cockpit cluster, paddle shifters for regeneration, premium Harman speaker system, and 465 km of certified range. Ideal for tech-forward travelers wanting zero carbon emission.',
    features: ['Zero Emissions Electric Drive', 'Empowered Cinematic Display', 'Harman Surround Stage', 'Paddle Regenerative Brake', 'Virtual Cockpit Cluster', 'Wireless Phone Charger', 'Voice Controlled Sunroof'],
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=82',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=82'
    ],
    total_trips: 110,
    rating: 4.9
  },
  {
    id: 'car-carens-006',
    name: 'Carens Luxury Plus Prestige',
    brand: 'Kia',
    model: '6-Seater Captain Seats MUV',
    year: 2024,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 6,
    category: 'MUV',
    price_per_hour: 220,
    price_per_day: 2799,
    price_per_week: 16999,
    price_per_month: 55000,
    km_limit_per_day: 300,
    extra_km_charge: 12,
    deposit_amount: 5000,
    location: 'Lucknow',
    status: 'available',
    is_featured: false,
    description: 'Travel together in style. The Kia Carens Luxury Plus is an elegant family cruiser featuring executive captain seats in the second row, one-touch electronic tumble for third-row access, multiple AC vents across all rows, skylight sunroof, ambient music sync lights, and a luxury aesthetic. Perfect for family pilgrimages to Ayodhya or weekend gateway outings.',
    features: ['2nd-Row Captain Seats', 'One-Touch Electric Tumble', '64-Color Ambient Sync', 'Rear Passenger AC Vents', 'Skylight Electric Sunroof', 'Smart Space Utility Pack', 'Bose Cabin Sound system'],
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=82',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=82'
    ],
    total_trips: 63,
    rating: 4.82
  }
];

const DEFAULT_SETTINGS: SiteSetting[] = [
  { key: 'phone', value: '+91-8960695050' },
  { key: 'whatsapp', value: '918960695050' },
  { key: 'email', value: '' },
  { key: 'address', value: 'Shop K 02, Kisan Bazar, Vibhuti Khand, Lucknow, Uttar Pradesh 226010' },
  { key: 'hero_tagline', value: 'Drive Smart. Pay Less.' },
  { key: 'hero_subtitle', value: 'Premium self-drive car rentals in Lucknow. Flexible bookings by the hour, day, week, or month. No hidden charges.' },
  { key: 'price_hourly_start', value: '99' },
  { key: 'price_daily_start', value: '1499' },
  { key: 'price_weekly_start', value: '8999' },
  { key: 'price_monthly_start', value: '29999' },
  { key: 'total_renters', value: '5,000+' },
  { key: 'total_km', value: '800K+' },
  { key: 'google_rating', value: '4.9' },
  { key: 'review_count', value: '240+' }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    car_id: 'car-thar-001',
    reviewer_name: 'Anmesh Srivastava',
    rating: 5,
    review_text: 'Renting the Thar LX Convertible was incredibly simple! Drive-Eaze delivered the sanitized clean car right to my office in Gomti Nagar. The automatic transmission made my drive to Ayodhya absolutely memorable. Returning was as smooth as pickup. Truly Lucknow\'s best self-drive!',
    is_approved: true,
    created_at: new Date('2026-05-15').toISOString()
  },
  {
    id: 'rev-002',
    car_id: 'car-creta-002',
    reviewer_name: 'Dr. Shalini Mehrotra',
    rating: 5,
    review_text: 'Had an executive visitor and booked the Creta SX. The panoramic sunroof and premium audio system made dynamic impressions. Uncompromised luxury at half the car owner cost. Excellent customer response from the desk team!',
    is_approved: true,
    created_at: new Date('2026-05-20').toISOString()
  },
  {
    id: 'rev-003',
    car_id: 'car-swift-004',
    reviewer_name: 'Rohan Mishra',
    rating: 4,
    review_text: 'Needed a nimble car to roam around Aminabad and Chowk lanes. Swift ZXI was super economical. At ₹99/hr, it is cheaper than catching auto-rickshaws, and with full privacy! Will definitely rent again from Drive-Eaze.',
    is_approved: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'rev-004',
    car_id: 'car-fortuner-003',
    reviewer_name: 'Vikramaditya Shah',
    rating: 5,
    review_text: 'Rented the Fortuner Legender for a business event and local travel. Absolute beast of a car, perfectly shining clean, tyres in great shape. Everyone in Lucknow knows that Fortuner is power. Drive-Eaze pickup crew was highly professional and on-time at 4:30 AM.',
    is_approved: true,
    created_at: new Date('2026-06-05').toISOString()
  }
];

const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'off-001',
    code: 'FIRSTDRIVE',
    title: 'First-Time Renters',
    description: 'Get Flat 15% off up to ₹1,500 on your very first Drive-Eaze self-drive vehicle booking.',
    discount_percent: 15,
    max_discount: 1500,
    valid_till: '2026-12-31T23:59:59Z',
    is_active: true
  },
  {
    id: 'off-002',
    code: 'LKOLEGEND',
    title: 'Weekly Gateway Promo',
    description: 'Rent any SUV or Luxury vehicle for a duration of 7 days or more and get a flat 20% off.',
    discount_percent: 20,
    max_discount: 5000,
    valid_till: '2026-09-30T23:59:59Z',
    is_active: true
  }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'book-001',
    booking_ref: 'DE-8F12B5',
    customer_name: 'Aditya Raj Verma',
    customer_phone: '+91-9876543210',
    customer_email: 'adityaraj@outlook.com',
    car_id: 'car-creta-002',
    start_time: '2026-06-10T09:00:00',
    end_time: '2026-06-12T18:00:00',
    pickup_location: 'Charbagh Railway Station',
    drop_location: 'Charbagh Railway Station',
    duration_type: 'daily',
    total_hours: 57,
    total_amount: 4998,
    deposit_paid: true,
    payment_status: 'paid',
    booking_status: 'upcoming',
    notes: 'Please keep the panoramic sunroof glass perfectly cleaned. Delivery executive should call 30 mins before arrival.',
    created_at: '2026-06-05T12:00:00'
  }
];

// ────────────────────────────────────────────────────────────────────────
// HELPER FOR INITIAL STATE
// ────────────────────────────────────────────────────────────────────────

const readLocalData = <T>(key: string, backup: T[]): T[] => {
  const data = localStorage.getItem(`driveeaze_${key}`);
  if (!data) {
    localStorage.setItem(`driveeaze_${key}`, JSON.stringify(backup));
    return backup;
  }
  return JSON.parse(data);
};

const writeLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(`driveeaze_${key}`, JSON.stringify(data));
  // Dispatches Custom Event to mimic Supabase Realtime across multi components
  window.dispatchEvent(new CustomEvent(`driveeaze_realtime_${key}`, { detail: data }));
};

// ────────────────────────────────────────────────────────────────────────
// REALTIME LISTENER MIMIC
// ────────────────────────────────────────────────────────────────────────

export const subscribeToRealtime = (table: string, callback: () => void) => {
  const handler = () => {
    callback();
  };
  window.addEventListener(`driveeaze_realtime_${table}`, handler);
  return () => {
    window.removeEventListener(`driveeaze_realtime_${table}`, handler);
  };
};

// ────────────────────────────────────────────────────────────────────────
// MASTER DB CLIENT (DUAL SUPABASE OR LOCAL-STORAGE BACKEND)
// ────────────────────────────────────────────────────────────────────────

export const db = {
  // App Config Metadata
  getConfig: (): AppConfig => {
    return {
      isDemoMode: true,
      supabaseUrlExists: false,
      supabaseKeyExists: false
    };
  },

  // CARS API
  getCars: async (includeAll = false): Promise<Car[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('cars').select('*');
        if (!includeAll) {
          query = query.eq('status', 'available');
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        if (data) return data as Car[];
      } catch (err) {
        console.warn("Supabase Fetch Failed. Using local storage fallback.", err);
      }
    }
    const cars = readLocalData<Car>('cars', DEFAULT_CARS);
    return includeAll ? cars : cars.filter(c => c.status === 'available');
  },

  getCarById: async (id: string): Promise<Car | null> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) return data as Car;
      } catch (err) {
        console.warn(`Supabase getCarById failed for ${id}. Using local fallback.`, err);
      }
    }
    const cars = readLocalData<Car>('cars', DEFAULT_CARS);
    return cars.find(c => c.id === id) || null;
  },

  createCar: async (carInput: Omit<Car, 'id' | 'total_trips' | 'rating' | 'created_at'>): Promise<Car> => {
    const id = `car-${Math.random().toString(36).substr(2, 9)}`;
    const newCar: Car = {
      ...carInput,
      id,
      total_trips: 0,
      rating: 5.0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cars').insert([newCar]).select().single();
        if (error) throw error;
        if (data) {
          writeLocalData<Car>('cars', [data as Car, ...readLocalData<Car>('cars', DEFAULT_CARS)]);
          return data as Car;
        }
      } catch (err) {
        console.warn("Supabase createCar failed. Syncing local storage state.", err);
      }
    }

    const cars = readLocalData<Car>('cars', DEFAULT_CARS);
    const updated = [newCar, ...cars];
    writeLocalData<Car>('cars', updated);
    return newCar;
  },

  updateCar: async (id: string, updates: Partial<Car>): Promise<Car | null> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cars').update(updates).eq('id', id).select().single();
        if (error) throw error;
        if (data) {
          // Sync locally too
          const cars = readLocalData<Car>('cars', DEFAULT_CARS);
          const i = cars.findIndex(c => c.id === id);
          if (i !== -1) {
            cars[i] = { ...cars[i], ...updates };
            writeLocalData<Car>('cars', cars);
          }
          return data as Car;
        }
      } catch (err) {
        console.warn("Supabase updateCar failed. Syncing locally.", err);
      }
    }

    const cars = readLocalData<Car>('cars', DEFAULT_CARS);
    const index = cars.findIndex(c => c.id === id);
    if (index === -1) return null;

    cars[index] = { ...cars[index], ...updates };
    writeLocalData<Car>('cars', cars);
    return cars[index];
  },

  deleteCar: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('cars').delete().eq('id', id);
        if (error) throw error;
        const cars = readLocalData<Car>('cars', DEFAULT_CARS).filter(c => c.id !== id);
        writeLocalData<Car>('cars', cars);
        return true;
      } catch (err) {
        console.warn("Supabase deleteCar failed. Running local delete.", err);
      }
    }
    const cars = readLocalData<Car>('cars', DEFAULT_CARS);
    const filtered = cars.filter(c => c.id !== id);
    writeLocalData<Car>('cars', filtered);
    return true;
  },

  // BOOKINGS API
  getBookings: async (): Promise<Booking[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*, car:cars(*)').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) return data as Booking[];
      } catch (err) {
        console.warn("Supabase bookings fetch failed. Using local storage.", err);
      }
    }
    const bookings = readLocalData<Booking>('bookings', DEFAULT_BOOKINGS);
    const cars = readLocalData<Car>('cars', DEFAULT_CARS);
    return bookings.map(b => ({
      ...b,
      car: cars.find(c => c.id === b.car_id)
    })).sort((a,b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  },

  createBooking: async (bookingInput: Omit<Booking, 'id' | 'booking_ref' | 'created_at'>): Promise<Booking> => {
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().substring(0, 6);
    const booking_ref = `DE-${randomHex}`;
    const id = `book-${Math.random().toString(36).substr(2, 9)}`;
    
    const newBooking: Booking = {
      ...bookingInput,
      id,
      booking_ref,
      created_at: new Date().toISOString()
    };

    // First update the car status to booked in DB state
    await db.updateCar(bookingInput.car_id, { status: 'booked' });

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bookings').insert([newBooking]).select().single();
        if (error) throw error;
        if (data) {
          const bookings = readLocalData<Booking>('bookings', DEFAULT_BOOKINGS);
          writeLocalData<Booking>('bookings', [data as Booking, ...bookings]);
          return data as Booking;
        }
      } catch (err) {
        console.warn("Supabase createBooking failed. Syncing offline fallback.", err);
      }
    }

    const bookings = readLocalData<Booking>('bookings', DEFAULT_BOOKINGS);
    writeLocalData<Booking>('bookings', [newBooking, ...bookings]);
    return newBooking;
  },

  updateBookingStatus: async (id: string, booking_status: BookingStatus, updates: Partial<Booking> = {}): Promise<Booking | null> => {
    const bookings = readLocalData<Booking>('bookings', DEFAULT_BOOKINGS);
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    const currentBooking = bookings[index];
    const fullUpdates = { ...updates, booking_status };
    
    // Auto align car booking state
    // active -> car booked
    // completed -> car available
    // cancelled -> car available
    if (booking_status === 'completed' || booking_status === 'cancelled') {
      await db.updateCar(currentBooking.car_id, { status: 'available' });
    } else if (booking_status === 'active') {
      await db.updateCar(currentBooking.car_id, { status: 'booked' });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bookings').update(fullUpdates).eq('id', id).select().single();
        if (error) throw error;
        if (data) {
          bookings[index] = { ...currentBooking, ...fullUpdates };
          writeLocalData<Booking>('bookings', bookings);
          return data as Booking;
        }
      } catch (err) {
        console.warn("Supabase updateBookingStatus failed. Syncing locally.", err);
      }
    }

    bookings[index] = { ...currentBooking, ...fullUpdates };
    writeLocalData<Booking>('bookings', bookings);
    return bookings[index];
  },

  deleteBooking: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) throw error;
        const bookings = readLocalData<Booking>('bookings', DEFAULT_BOOKINGS).filter(b => b.id !== id);
        writeLocalData<Booking>('bookings', bookings);
        return true;
      } catch (err) {
        console.warn("Supabase deleteBooking failed.", err);
      }
    }
    const bookings = readLocalData<Booking>('bookings', DEFAULT_BOOKINGS);
    const filtered = bookings.filter(b => b.id !== id);
    writeLocalData<Booking>('bookings', filtered);
    return true;
  },

  // REVIEWS API
  getReviews: async (clientFacingOnly = false): Promise<Review[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('reviews').select('*, car:cars(*)');
        if (clientFacingOnly) {
          query = query.eq('is_approved', true);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        if (data) return data as Review[];
      } catch (err) {
        console.warn("Supabase reviews fetch failed. Using local storage.", err);
      }
    }
    const reviews = readLocalData<Review>('reviews', DEFAULT_REVIEWS);
    const cars = readLocalData<Car>('cars', DEFAULT_CARS);
    const joined = reviews.map(r => ({
      ...r,
      car: cars.find(c => c.id === r.car_id)
    }));
    return clientFacingOnly ? joined.filter(r => r.is_approved) : joined;
  },

  createReview: async (reviewInput: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
    const id = `rev-${Math.random().toString(36).substr(2, 9)}`;
    const newReview: Review = {
      ...reviewInput,
      id,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
        if (error) throw error;
        if (data) {
          const reviews = readLocalData<Review>('reviews', DEFAULT_REVIEWS);
          writeLocalData<Review>('reviews', [data as Review, ...reviews]);
          
          // Re-calculate average rating for this car
          await db.recalculateCarRating(reviewInput.car_id);
          return data as Review;
        }
      } catch (err) {
        console.warn("Supabase createReview failed. Syncing offline.", err);
      }
    }

    const reviews = readLocalData<Review>('reviews', DEFAULT_REVIEWS);
    writeLocalData<Review>('reviews', [newReview, ...reviews]);
    
    // Re-calculate locally
    await db.recalculateCarRating(reviewInput.car_id);
    return newReview;
  },

  approveReview: async (id: string, is_approved = true): Promise<Review | null> => {
    const reviews = readLocalData<Review>('reviews', DEFAULT_REVIEWS);
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').update({ is_approved }).eq('id', id).select().single();
        if (error) throw error;
        if (data) {
          reviews[idx].is_approved = is_approved;
          writeLocalData<Review>('reviews', reviews);
          await db.recalculateCarRating(reviews[idx].car_id);
          return data as Review;
        }
      } catch (err) {
        console.warn("Supabase approveReview failed. Syncing locally.", err);
      }
    }

    reviews[idx].is_approved = is_approved;
    writeLocalData<Review>('reviews', reviews);
    await db.recalculateCarRating(reviews[idx].car_id);
    return reviews[idx];
  },

  deleteReview: async (id: string): Promise<boolean> => {
    const reviews = readLocalData<Review>('reviews', DEFAULT_REVIEWS);
    const rev = reviews.find(r => r.id === id);
    const filtered = reviews.filter(r => r.id !== id);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) throw error;
        writeLocalData<Review>('reviews', filtered);
        if (rev) {
          await db.recalculateCarRating(rev.car_id);
        }
        return true;
      } catch (err) {
        console.warn("Supabase deleteReview failed. running locally.", err);
      }
    }

    writeLocalData<Review>('reviews', filtered);
    if (rev) {
      await db.recalculateCarRating(rev.car_id);
    }
    return true;
  },

  recalculateCarRating: async (carId: string): Promise<void> => {
    const reviews = readLocalData<Review>('reviews', DEFAULT_REVIEWS);
    const carReviews = reviews.filter(r => r.car_id === carId && r.is_approved);
    if (carReviews.length === 0) return;
    
    const sum = carReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / carReviews.length).toFixed(2));
    
    await db.updateCar(carId, { rating: avg });
  },

  // OFFERS API
  getOffers: async (activeOnly = false): Promise<Offer[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('offers').select('*');
        if (activeOnly) {
          query = query.eq('is_active', true);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        if (data) return data as Offer[];
      } catch (err) {
        console.warn("Supabase offers fetch failed. Using local storage.", err);
      }
    }
    const offers = readLocalData<Offer>('offers', DEFAULT_OFFERS);
    return activeOnly ? offers.filter(o => o.is_active) : offers;
  },

  createOffer: async (offerInput: Omit<Offer, 'id' | 'created_at'>): Promise<Offer> => {
    const id = `off-${Math.random().toString(36).substr(2, 9)}`;
    const newOffer: Offer = {
      ...offerInput,
      id,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('offers').insert([newOffer]).select().single();
        if (error) throw error;
        if (data) {
          const offers = readLocalData<Offer>('offers', DEFAULT_OFFERS);
          writeLocalData<Offer>('offers', [data as Offer, ...offers]);
          return data as Offer;
        }
      } catch (err) {
        console.warn("Supabase createOffer failed. Offline sync.", err);
      }
    }

    const offers = readLocalData<Offer>('offers', DEFAULT_OFFERS);
    writeLocalData<Offer>('offers', [newOffer, ...offers]);
    return newOffer;
  },

  updateOffer: async (id: string, updates: Partial<Offer>): Promise<Offer | null> => {
    const offers = readLocalData<Offer>('offers', DEFAULT_OFFERS);
    const idx = offers.findIndex(o => o.id === id);
    if (idx === -1) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('offers').update(updates).eq('id', id).select().single();
        if (error) throw error;
        if (data) {
          offers[idx] = { ...offers[idx], ...updates };
          writeLocalData<Offer>('offers', offers);
          return data as Offer;
        }
      } catch (err) {
        console.warn("Supabase updateOffer failed. Online fail.", err);
      }
    }

    offers[idx] = { ...offers[idx], ...updates };
    writeLocalData<Offer>('offers', offers);
    return offers[idx];
  },

  deleteOffer: async (id: string): Promise<boolean> => {
    const offers = readLocalData<Offer>('offers', DEFAULT_OFFERS);
    const filtered = offers.filter(o => o.id !== id);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('offers').delete().eq('id', id);
        if (error) throw error;
        writeLocalData<Offer>('offers', filtered);
        return true;
      } catch (err) {
        console.warn("Supabase deleteOffer failed.", err);
      }
    }

    writeLocalData<Offer>('offers', filtered);
    return true;
  },

  // SITE SETTINGS API
  getSiteSettings: async (): Promise<Record<string, string>> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;
        if (data) {
          const formatted: Record<string, string> = {};
          data.forEach((s: any) => {
            formatted[s.key] = s.value;
          });
          return formatted;
        }
      } catch (err) {
        console.warn("Supabase site settings load failed. Using local details.", err);
      }
    }

    const settings = readLocalData<SiteSetting>('settings', DEFAULT_SETTINGS);
    const formatted: Record<string, string> = {};
    settings.forEach(s => {
      formatted[s.key] = s.value;
    });
    return formatted;
  },

  updateSiteSetting: async (key: string, value: string): Promise<boolean> => {
    const settings = readLocalData<SiteSetting>('settings', DEFAULT_SETTINGS);
    const idx = settings.findIndex(s => s.key === key);
    
    const item: SiteSetting = { key, value, updated_at: new Date().toISOString() };
    
    if (idx === -1) {
      settings.push(item);
    } else {
      settings[idx] = item;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('site_settings').upsert([item]);
        if (error) throw error;
        writeLocalData<SiteSetting>('settings', settings);
        return true;
      } catch (err) {
        console.warn("Supabase site settings update failed. Running local write.", err);
      }
    }

    writeLocalData<SiteSetting>('settings', settings);
    return true;
  },

  saveSiteSettingsBulk: async (values: Record<string, string>): Promise<boolean> => {
    const keys = Object.keys(values);
    for (const key of keys) {
      await db.updateSiteSetting(key, values[key]);
    }
    return true;
  }
};
