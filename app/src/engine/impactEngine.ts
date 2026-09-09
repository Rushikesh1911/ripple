import { Booking } from '../types/trip';
import { DisruptionInput, ImpactReport, AffectedBooking } from './types';
import { buildDependencyGraph, getDownstreamBookings } from './graph';
import { evaluateBookingConstraint } from './constraints';

/**
 * The core deterministic Ripple Impact Engine.
 * Evaluates the actual constraint violations caused by disruptions traversing down the dependency graph.
 */
export function calculateRippleImpact(
  baselineBookings: Booking[], 
  disruptions: DisruptionInput[]
): ImpactReport {
  
  const affectedMap: Record<string, AffectedBooking> = {};
  const graph = buildDependencyGraph(baselineBookings);
  
  // Create a fast lookup map for bookings
  const bookingMap = new Map<string, Booking>();
  baselineBookings.forEach(b => bookingMap.set(b.id, b));

  // Keep track of the dynamically calculated end times as we traverse the graph
  const dynamicEndTimes = new Map<string, string>(); // bookingId -> ISO string

  let affectedCount = 0;
  let atRiskCount = 0;
  let protectedCount = 0;
  let damageScore = 0;

  // Process each disruption (supports multi-disruption)
  for (const disruption of disruptions) {
    const rootBooking = bookingMap.get(disruption.bookingId);
    if (!rootBooking) continue;

    // 1. Mark the root disruption
    affectedMap[disruption.bookingId] = {
      bookingId: disruption.bookingId,
      originalBooking: rootBooking,
      status: 'DISRUPTED',
      reason: disruption.type === 'DELAY' 
        ? `Delayed by ${disruption.delayMinutes} mins.` 
        : `Booking was cancelled.`,
      slackMinutes: 0
    };
    
    affectedCount++;
    damageScore += 30; // Severe damage for direct disruption

    // Calculate the actual end time of the disrupted root
    if (disruption.type === 'DELAY' && disruption.delayMinutes) {
      const actualEnd = new Date(rootBooking.endTime);
      actualEnd.setMinutes(actualEnd.getMinutes() + disruption.delayMinutes);
      dynamicEndTimes.set(rootBooking.id, actualEnd.toISOString());
    } else {
      // If cancelled, there is no end time, downstream is completely broken unless recovered
      dynamicEndTimes.set(rootBooking.id, new Date(8640000000000000).toISOString()); // Max date
    }

    // 2. Traverse downstream nodes in topological order using BFS
    const downstreamIds = getDownstreamBookings(rootBooking.id, graph);
    
    for (const childId of downstreamIds) {
      const childBooking = bookingMap.get(childId)!;
      const parentId = childBooking.prevBookingId!;
      const parentBooking = bookingMap.get(parentId)!;
      
      // Get the actual end time of the parent (either dynamically calculated or its original baseline)
      const parentActualEndTime = dynamicEndTimes.get(parentId) || parentBooking.endTime;

      // 3. Evaluate Constraints
      const evaluation = evaluateBookingConstraint(childBooking, parentBooking, parentActualEndTime);

      // Record the evaluation
      affectedMap[childId] = {
        bookingId: childId,
        originalBooking: childBooking,
        status: evaluation.status,
        reason: evaluation.reason,
        slackMinutes: evaluation.slackMinutes,
        expectedArrivalTime: evaluation.expectedArrivalTime
      };

      // 4. Update the dynamic end time for this child to propagate further
      // If it's a hotel, its actual schedule doesn't shift, only the traveler's arrival does.
      if (childBooking.type === 'hotel') {
        dynamicEndTimes.set(childId, childBooking.endTime); // Unchanged
      } else if (evaluation.status === 'IMPACTED') {
        // If they miss it, the whole chain is broken
        dynamicEndTimes.set(childId, new Date(8640000000000000).toISOString());
      } else {
        // If they make it, the booking ends at its original time
        dynamicEndTimes.set(childId, childBooking.endTime);
      }

      // Tally metrics
      if (evaluation.status === 'IMPACTED') {
        affectedCount++;
        damageScore += 20;
      } else if (evaluation.status === 'AT_RISK') {
        atRiskCount++;
        damageScore += 10;
      } else {
        protectedCount++;
      }
    }
  }

  // Calculate maximum depth (Ripple Radius) for the single longest chain from disruptions
  let rippleRadius = 0;
  for (const disruption of disruptions) {
    const chain = getDownstreamBookings(disruption.bookingId, graph);
    // Rough estimation: longest chain from any disruption
    if (chain.length > rippleRadius) rippleRadius = chain.length;
  }

  // Normalize damage score (0-100 max bounds)
  // Max possible damage is 30 for root + 20 for every other node in the graph
  const maxPossibleDamage = 30 + (baselineBookings.length - 1) * 20;
  const normalizedDamage = maxPossibleDamage === 0 ? 0 : Math.min(100, Math.round((damageScore / maxPossibleDamage) * 100));

  return {
    disruptions,
    affectedBookings: affectedMap,
    rippleRadius,
    damageScore: normalizedDamage,
    affectedCount,
    atRiskCount,
    protectedCount
  };
}
