import { Booking, BookingStatus } from '../types/trip';

export interface DisruptionInput {
  bookingId: string;
  delayMinutes: number; // e.g., 180 for a 3-hour delay
}

export interface AffectedBooking {
  bookingId: string;
  status: BookingStatus;
  reason: string;
}

export interface ImpactReport {
  disruption: DisruptionInput;
  affectedBookings: AffectedBooking[];
}

/**
 * Deterministically calculates the cascading impact of a disruption on downstream bookings.
 */
export function calculateRippleImpact(bookings: Booking[], disruption: DisruptionInput): ImpactReport {
  const affected: AffectedBooking[] = [];
  
  // Sort bookings conceptually (assuming the array order represents chronological order, 
  // or we can build a linked chain via prevBookingId)
  
  // Find the initially disrupted booking
  const startIndex = bookings.findIndex(b => b.id === disruption.bookingId);
  if (startIndex === -1) return { disruption, affectedBookings: affected };

  let currentDelayMinutes = disruption.delayMinutes;
  
  for (let i = startIndex + 1; i < bookings.length; i++) {
    const currentBooking = bookings[i];
    const prevBooking = bookings[i - 1]; // Assume linear flow for MVP

    // Calculate original times
    const prevOriginalEnd = new Date(prevBooking.endTime).getTime();
    const currentOriginalStart = new Date(currentBooking.startTime).getTime();
    
    // Apply the rolling delay to find actual times
    const prevActualEnd = prevOriginalEnd + (currentDelayMinutes * 60 * 1000);
    const requiredStartTime = prevActualEnd + (currentBooking.bufferMinutes * 60 * 1000);

    if (requiredStartTime > currentOriginalStart) {
      // Impact detected!
      const overlapMinutes = Math.ceil((requiredStartTime - currentOriginalStart) / (60 * 1000));
      
      let reason = '';
      let status: BookingStatus = 'at_risk';

      if (currentBooking.type === 'transfer') {
        reason = `Arrival now overlaps required pickup window by ${overlapMinutes} min.`;
      } else if (currentBooking.type === 'hotel') {
        reason = `Estimated arrival exceeds standard check-in window by ${overlapMinutes} min.`;
      } else if (currentBooking.type === 'activity') {
        reason = `You will likely miss the start time for this activity.`;
        status = 'disrupted'; // Missing an activity entirely
      } else {
        reason = `Insufficient buffer connection (overlaps by ${overlapMinutes} min).`;
      }

      affected.push({
        bookingId: currentBooking.id,
        status,
        reason
      });

      // We assume the delay propagates linearly. If we are 3 hours late to the hotel, 
      // the activity after the hotel is also delayed conceptually by 3 hours.
      // (In a real system, we'd check if the next booking is fixed time or flexible)
      // For this deterministic MVP, we pass the same delay downstream.
      currentDelayMinutes = currentDelayMinutes; 
    } else {
      // If the buffer absorbs the delay, the ripple stops here!
      // (e.g., if we had a 5-hour layover and a 1-hour delay, it's fine)
      break; 
    }
  }

  return {
    disruption,
    affectedBookings: affected
  };
}
