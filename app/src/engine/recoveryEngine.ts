import { Booking } from '../types/trip';
import { ImpactReport, RecoveryOption, TravelerPreference } from './types';
import { rankRecoveryOptions } from './scoring';
import { calculateRippleImpact } from './impactEngine';

/**
 * Dynamically generates recovery options for a given disruption scenario.
 */
export function generateRecoveryPlan(
  itinerary: Booking[],
  impactReport: ImpactReport,
  preference: TravelerPreference = 'balanced'
): RecoveryOption[] {
  
  const options: RecoveryOption[] = [];

  // For the MVP hackathon, we'll specifically target the root disruptions
  for (const disruption of impactReport.disruptions) {
    const rootBooking = itinerary.find(b => b.id === disruption.bookingId);
    if (!rootBooking) continue;

    // Depending on the disrupted booking type, generate contextual strategies
    if (rootBooking.type === 'transfer' || rootBooking.type === 'flight') {
      
      // Strategy 1: Shared/Cheaper
      options.push(createMockOption({
        id: `ro_${rootBooking.id}_cheap`,
        bookingId: rootBooking.id,
        title: 'Cheapest Alternative',
        description: 'Rebook shared shuttle/bus. Takes longer but saves money.',
        costDelta: 200,
        timeDelta: 90,
        convenienceScore: 60,
        riskScore: 40,
        bookingsChanged: 1,
        statusUpdate: 'recovered'
      }));

      // Strategy 2: Fastest/Premium
      options.push(createMockOption({
        id: `ro_${rootBooking.id}_fast`,
        bookingId: rootBooking.id,
        title: 'Fastest Alternative',
        description: 'Private premium transfer. Fast but expensive.',
        costDelta: 1800,
        timeDelta: 10,
        convenienceScore: 90,
        riskScore: 10,
        bookingsChanged: 1,
        statusUpdate: 'recovered'
      }));

      // Strategy 3: Best Fit
      options.push(createMockOption({
        id: `ro_${rootBooking.id}_fit`,
        bookingId: rootBooking.id,
        title: 'Best Fit',
        description: 'Rebook standard taxi. Balances cost and time.',
        costDelta: 700,
        timeDelta: 30,
        convenienceScore: 95,
        riskScore: 20,
        bookingsChanged: 1,
        statusUpdate: 'recovered'
      }));

    } else if (rootBooking.type === 'activity') {
      // Activity specific strategies
      options.push(createMockOption({
        id: `ro_${rootBooking.id}_alt`,
        bookingId: rootBooking.id,
        title: 'Alternative Activity',
        description: 'Nearby Museum. Same time window.',
        costDelta: 500,
        timeDelta: 0,
        convenienceScore: 85,
        riskScore: 30,
        bookingsChanged: 1,
        statusUpdate: 'recovered'
      }));
      
      options.push(createMockOption({
        id: `ro_${rootBooking.id}_free`,
        bookingId: rootBooking.id,
        title: 'Free Time',
        description: 'Cancel and relax. Costs nothing.',
        costDelta: 0,
        timeDelta: 0,
        convenienceScore: 95,
        riskScore: 0,
        bookingsChanged: 1,
        statusUpdate: 'cancelled' // They skip it
      }));
    }
  }

  // FEASIBILITY FILTER: Test each option against the graph to ensure it doesn't break hard constraints
  for (const opt of options) {
    opt.feasible = testOptionFeasibility(itinerary, impactReport, opt);
  }

  // RANK: Pass feasible options to the dynamic scorer
  const rankedOptions = rankRecoveryOptions(options, preference);

  // EXPLAIN: Generate the "Why" strings
  generateExplanations(rankedOptions, preference);

  return rankedOptions;
}

// Helper to construct the object easily
function createMockOption(params: any): RecoveryOption {
  return {
    id: params.id,
    bookingId: params.bookingId,
    title: params.title,
    description: params.description,
    costDelta: params.costDelta,
    timeDelta: params.timeDelta,
    convenienceScore: params.convenienceScore,
    riskScore: params.riskScore,
    bookingsChanged: params.bookingsChanged,
    feasible: true, // Optimistic start
    suggestedUpdates: {
      [params.bookingId]: { status: params.statusUpdate, subtitle: params.title }
      // We will map timeDelta to startTime/endTime dynamically during execution
    }
  };
}

/**
 * Checks if a recovery option actually works by simulating the itinerary with it.
 */
function testOptionFeasibility(itinerary: Booking[], impactReport: ImpactReport, option: RecoveryOption): boolean {
  // In a real system, we clone the itinerary, apply the option's timeDeltas, 
  // and run calculateRippleImpact() again to see if any AT_RISK turn into IMPACTED.
  // For the MVP, we assume any option with a timeDelta that exceeds a hardcoded limit is infeasible.
  // E.g., if a shared shuttle delays us 90 minutes, does that break the hotel check-in completely?
  
  const root = impactReport.affectedBookings[option.bookingId];
  if (!root) return false;

  // Let's do a fast constraint check
  // If the delay is massive (e.g. > 180 mins), and it's a transfer to an activity, it might be impossible.
  if (option.timeDelta > 240) {
    option.feasibilityReason = "Option exceeds maximum allowed delay.";
    return false;
  }

  return true;
}

function generateExplanations(options: RecoveryOption[], preference: TravelerPreference) {
  for (const opt of options) {
    if (opt.normalizedImpactScore! === 100) {
      opt.explanation = `Preserves downstream bookings while minimizing disruption.`;
    } else if (preference === 'cost' && opt.normalizedCostScore! > 90) {
      opt.explanation = `Saves you the most money based on your Cost preference.`;
    } else if (preference === 'speed' && opt.normalizedTimeScore! > 90) {
      opt.explanation = `Gets you back on track the fastest.`;
    } else {
      opt.explanation = `A balanced choice that fixes your itinerary.`;
    }
  }
}
