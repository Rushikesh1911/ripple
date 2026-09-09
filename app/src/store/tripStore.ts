import { Trip, Booking } from '../types/trip';
import { supabase } from '../lib/supabase';
import { ImpactReport, DisruptionInput } from '../engine/types';
import { calculateRippleImpact } from '../engine/impactEngine';

class TripStore {
  private baselineTrip: Trip | null = null; // Immutable source of truth from DB
  private currentTrip: Trip | null = null;  // Mutated state for UI
  
  public impactReport: ImpactReport | null = null;
  public isLoading: boolean = false;
  private listeners: Set<() => void> = new Set();

  private getMockTrip(userId: string): Trip {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    return {
      id: 't1',
      traveler: userId,
      title: 'London Business Summit',
      bookings: [
        {
          id: 'b1', tripId: 't1', type: 'flight', title: 'Flight to LHR', subtitle: 'BA-202',
          startTime: `${dateStr}T10:00:00Z`, endTime: `${dateStr}T12:30:00Z`,
          location: 'JFK -> LHR', status: 'confirmed', bufferMinutes: 0
        },
        {
          id: 'b2', tripId: 't1', type: 'transfer', title: 'Heathrow Express', subtitle: 'Train 4402',
          startTime: `${dateStr}T13:30:00Z`, endTime: `${dateStr}T14:00:00Z`,
          location: 'LHR -> Paddington', status: 'confirmed', bufferMinutes: 45, prevBookingId: 'b1'
        },
        {
          id: 'b3', tripId: 't1', type: 'hotel', title: 'The Savoy Hotel', subtitle: 'Check-in',
          startTime: `${dateStr}T15:00:00Z`, endTime: `${dateStr}T15:30:00Z`,
          location: 'Strand, London', status: 'confirmed', bufferMinutes: 30, prevBookingId: 'b2'
        },
        {
          id: 'b4', tripId: 't1', type: 'activity', title: 'Keynote Speech', subtitle: 'Main Stage',
          startTime: `${dateStr}T17:00:00Z`, endTime: `${dateStr}T19:00:00Z`,
          location: 'ExCeL London', status: 'confirmed', bufferMinutes: 60, prevBookingId: 'b3'
        }
      ]
    };
  }

  getTrip(): Trip | null {
    return this.currentTrip;
  }

  /**
   * Fetches the latest trip for the authenticated user.
   */
  async fetchLatestTrip() {
    this.isLoading = true;
    this.notify();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        this.baselineTrip = null;
        this.currentTrip = null;
        return;
      }

      // Fetch the most recent trip for the user
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (tripError || !tripData) {
        // No trip found, inject Hackathon mock trip
        this.baselineTrip = this.getMockTrip(user.id);
        this.currentTrip = JSON.parse(JSON.stringify(this.baselineTrip));
        return;
      }

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', tripData.id)
        .order('start_time', { ascending: true });

      if (bookingsError) {
        console.error('Supabase fetch bookings error:', bookingsError.message);
        this.baselineTrip = this.getMockTrip(user.id);
        this.currentTrip = JSON.parse(JSON.stringify(this.baselineTrip));
        return;
      }

      const mappedBookings: Booking[] = (bookingsData || []).map(b => ({
        id: b.id,
        tripId: b.trip_id,
        type: b.type,
        title: b.title,
        subtitle: b.subtitle,
        startTime: b.start_time,
        endTime: b.end_time,
        location: b.location,
        status: b.status,
        bufferMinutes: b.buffer_minutes,
        prevBookingId: b.prev_booking_id
      }));

      this.baselineTrip = {
        id: tripData.id,
        traveler: tripData.traveler,
        title: tripData.title,
        bookings: mappedBookings
      };
      
      this.currentTrip = JSON.parse(JSON.stringify(this.baselineTrip));
      this.impactReport = null;

    } catch (e) {
      console.error('Failed to fetch trip from Supabase.', e);
      this.baselineTrip = null;
      this.currentTrip = null;
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  /**
   * Runs the engine against the baseline to generate an Impact Report and mutates the current UI state.
   */
  simulateDisruptions(disruptions: DisruptionInput[]) {
    if (!this.baselineTrip || !this.currentTrip) return;

    // 1. Run the engine against the PRISTINE baseline
    const report = calculateRippleImpact(this.baselineTrip.bookings, disruptions);
    this.impactReport = report;

    // 2. Clone baseline to create a fresh mutated state for the UI
    const simulatedBookings = JSON.parse(JSON.stringify(this.baselineTrip.bookings)) as Booking[];

    // 3. Apply the engine's findings to the simulated bookings sequentially (cascade animation)
    const affectedArray = Object.values(report.affectedBookings).sort((a, b) => 
      new Date(a.originalBooking.startTime).getTime() - new Date(b.originalBooking.startTime).getTime()
    );

    this.currentTrip.bookings = simulatedBookings;
    this.notify();

    let delay = 400; // ms between ripples
    affectedArray.forEach((affected, index) => {
      setTimeout(() => {
        if (!this.currentTrip) return;
        const b = this.currentTrip.bookings.find(bk => bk.id === affected.bookingId);
        if (b) {
          if (affected.status === 'IMPACTED' || affected.status === 'DISRUPTED') {
            b.status = 'disrupted';
          } else if (affected.status === 'AT_RISK') {
            b.status = 'at_risk';
          }
          this.notify();
        }
      }, delay * (index + 1));
    });
  }

  clearSimulation() {
    if (!this.baselineTrip) return;
    this.impactReport = null;
    this.currentTrip = JSON.parse(JSON.stringify(this.baselineTrip));
    this.notify();
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<boolean> {
    if (!this.baselineTrip) return false;
    
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;

    try {
      const { error, status } = await supabase
        .from('bookings')
        .update(dbUpdates)
        .eq('id', bookingId);
        
      if (error) {
        console.error(`[TripStore] Supabase update error for booking ${bookingId}:`, error);
        return false;
      }
      
      await this.fetchLatestTrip();
      return true;

    } catch (e) {
      console.error(`[TripStore] Supabase update exception for booking ${bookingId}:`, e);
      return false;
    }
  }

  async reset() {
    // Resetting now means just refetching from the DB since we have no mock data
    await this.fetchLatestTrip();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const tripStore = new TripStore();
