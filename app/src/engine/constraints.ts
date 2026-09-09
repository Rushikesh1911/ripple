import { Booking } from '../types/trip';
import { ImpactStatus } from './types';

export interface ConstraintEvaluation {
  status: ImpactStatus;
  reason: string;
  slackMinutes: number;
  expectedArrivalTime: string;
}

/**
 * Mocks deterministic travel/transition times between locations (in minutes).
 * In a real app, this would use a routing API.
 */
function getMockTransitionTime(fromLocation: string, toLocation: string): number {
  const transitions: Record<string, number> = {
    'DEL Airport → Hotel_New Delhi': 45,
    'New Delhi_New Delhi → Jaipur': 30, // From hotel to train station
    'New Delhi → Jaipur_City Palace, Jaipur': 25, // Train station to Palace
  };
  
  const key = `${fromLocation}_${toLocation}`;
  return transitions[key] || 0; // Default to 0 if unknown
}

/**
 * Evaluates the hard constraints for a dependent booking given the actual finish time of its parent.
 */
export function evaluateBookingConstraint(
  currentBooking: Booking,
  previousBooking: Booking | null,
  previousActualEndTime: string
): ConstraintEvaluation {
  
  const originalStartTime = new Date(currentBooking.startTime).getTime();
  
  // 1. Calculate transition time
  let transitionMinutes = 0;
  if (previousBooking && previousBooking.location !== currentBooking.location) {
    transitionMinutes = getMockTransitionTime(previousBooking.location, currentBooking.location);
  }

  // 2. Calculate Expected Arrival Time at the current booking's location
  let expectedArrivalMs = new Date(previousActualEndTime).getTime() + (transitionMinutes * 60 * 1000);
  
  // Prevent RangeError: Date value out of bounds
  const MAX_DATE = 8640000000000000;
  if (expectedArrivalMs > MAX_DATE) {
    expectedArrivalMs = MAX_DATE;
  }
  
  // 3. Calculate Slack (How much free time we have BEFORE we hit our buffer)
  // Slack = (StartTime - ExpectedArrival)
  const slackMinutes = Math.floor((originalStartTime - expectedArrivalMs) / (60 * 1000));
  
  let status: ImpactStatus = 'PROTECTED';
  let reason = '';

  // 4. Special Logic for Hotels
  if (currentBooking.type === 'hotel') {
    // A hotel check-in isn't something you "miss" the same way you miss a train.
    // If you arrive late, the booking is still there, but you might lose the room if you are EXTREMELY late.
    if (slackMinutes < -120) { // More than 2 hours late
      status = 'AT_RISK';
      reason = `Estimated arrival is ${Math.abs(slackMinutes)}m past check-in time. Hotel may cancel if unnotified.`;
    } else if (slackMinutes < 0) {
      status = 'AT_RISK';
      reason = `Late check-in. Arriving ${Math.abs(slackMinutes)}m after standard time.`;
    } else {
      status = 'PROTECTED';
      reason = `Plenty of time to check-in. ${slackMinutes}m slack.`;
    }
  } 
  // 5. Standard Transit / Activity Logic
  else {
    if (slackMinutes < 0) {
      status = 'IMPACTED';
      if (currentBooking.type === 'activity') {
        reason = `You will miss the start time by ${Math.abs(slackMinutes)}m.`;
      } else {
        reason = `Impossible connection. You are ${Math.abs(slackMinutes)}m late.`;
      }
    } else if (slackMinutes < currentBooking.bufferMinutes) {
      status = 'AT_RISK';
      reason = `Connection is tight. Only ${slackMinutes}m slack (Recommended: ${currentBooking.bufferMinutes}m).`;
    } else {
      status = 'PROTECTED';
      reason = `Safe connection. ${slackMinutes}m slack remains.`;
    }
  }

  return {
    status,
    reason,
    slackMinutes,
    expectedArrivalTime: new Date(expectedArrivalMs).toISOString()
  };
}
