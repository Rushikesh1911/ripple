export type BookingType = 'flight' | 'hotel' | 'transfer' | 'activity';
export type BookingStatus = 'confirmed' | 'at_risk' | 'disrupted' | 'recovered';

export interface Booking {
  id: string;
  tripId: string;
  type: BookingType;
  title: string;
  subtitle?: string; // Used for things like flight numbers (e.g., "AI-202")
  startTime: string; // ISO 8601 string
  endTime: string;   // ISO 8601 string
  location: string;
  status: BookingStatus;
  bufferMinutes: number; // Minimum safe buffer needed BEFORE this booking
  prevBookingId?: string; // The ID of the immediate prior booking in the chain
}

export interface Trip {
  id: string;
  traveler: string;
  title: string;
  bookings: Booking[]; // We will embed the bookings array directly in the trip for easier state management
}

export interface RecoveryOption {
  id: string;
  bookingId: string;
  description: string;
  costDelta: number;
  timeDelta: number; // Minutes
  convenienceScore: number; // 0-100 scale, where 100 is most convenient
  finalScore?: number; // 0-100 scale, where 100 is the best overall option (or lowest is best, we'll decide in the engine)
}
