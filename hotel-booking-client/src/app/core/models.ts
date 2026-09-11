// ── ყველა ტიპი, რასაც backend აბრუნებს ან იღებს ────────────

// უნივერსალური პასუხი: { success, message, data }
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type Role = 'Guest' | 'Manager' | 'Admin';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

// ── Auth ───────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
  role: Role;
  createdAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Rooms ──────────────────────────────────────────────────
export interface Room {
  id: number;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface RoomFilter {
  search?: string;
  maxGuests?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
}

export interface RoomRequest {
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  imageUrl: string;
  isAvailable?: boolean;
}

export interface BookedPeriod {
  checkIn: string;
  checkOut: string;
}

// ── Bookings ───────────────────────────────────────────────
export interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  roomImageUrl: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

// Admin-ის სიაში სტუმრის მონაცემებიც არის
export interface AdminBooking extends Booking {
  guestName: string;
  guestEmail: string;
}

export interface BookingRequest {
  roomId: number;
  checkIn: string;
  checkOut: string;
}
