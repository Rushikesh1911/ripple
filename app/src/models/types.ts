export type BookingType = 'Flight' | 'Transfer' | 'Hotel' | 'Activity';
export type BookingStatus = 'Confirmed' | 'At Risk' | 'Disrupted';

export interface Booking {
  id: string;
  tripId: string;
  type: BookingType;
  title: string;
  subtitle?: string; // e.g., Flight number or terminal
  startTime: string; // ISO String
  endTime: string; // ISO String
  location: string;
  status: BookingStatus;
  previousBookingId: string | null;
  bufferMinutes: number;
}

export interface Trip {
  id: string;
  travelerId: string;
  title: string;
  dateString: string;
  bookings: Booking[];
}

export interface RecoveryOption {
  id: string;
  bookingId: string;
  description: string;
  costDelta: number; // in INR
  timeDeltaMinutes: number; // + or - wait time
  convenienceScore: number; // 1-10
  rank: number; // 1-3
  label: 'Cheapest' | 'Fastest' | 'Best fit' | null;
}
