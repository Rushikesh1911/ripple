import { RecoveryOption } from '../types/trip';

export const WEIGHTS = {
  COST: 0.40,
  TIME: 0.35,
  CONVENIENCE: 0.25,
};

/**
 * Normalizes a value to a 0-100 scale where higher is better.
 * For cost and time, lower raw values are better, so we invert them relative to a max threshold.
 */
function normalizeInverse(value: number, maxThreshold: number): number {
  if (value >= maxThreshold) return 0;
  if (value <= 0) return 100;
  return Math.max(0, 100 - (value / maxThreshold) * 100);
}

/**
 * Calculates the final score for a recovery option based on the defined weights.
 * Score range: 0-100 (100 is best)
 */
export function calculateRecoveryScore(option: RecoveryOption): number {
  // Assume a max cost delta of ₹3000 for normalization bounds in this MVP
  const MAX_COST = 3000; 
  // Assume a max time delta of 180 minutes (3 hours) for normalization bounds
  const MAX_TIME = 180; 

  const costScore = normalizeInverse(option.costDelta, MAX_COST);
  const timeScore = normalizeInverse(option.timeDelta, MAX_TIME);
  const convenienceScore = option.convenienceScore; // Already 0-100

  const finalScore = 
    (costScore * WEIGHTS.COST) +
    (timeScore * WEIGHTS.TIME) +
    (convenienceScore * WEIGHTS.CONVENIENCE);

  return Math.round(finalScore);
}

/**
 * Generates the deterministic recovery options for the killer demo transfer disruption.
 */
export function generateTransferRecoveryOptions(bookingId: string): RecoveryOption[] {
  const options: RecoveryOption[] = [
    {
      id: 'ro_1',
      bookingId,
      description: 'Cheapest: Rebook shared shuttle',
      costDelta: 200, // ₹200
      timeDelta: 90,  // +90 mins
      convenienceScore: 60, // 3/5 stars
    },
    {
      id: 'ro_2',
      bookingId,
      description: 'Fastest: Private premium transfer',
      costDelta: 1800, // ₹1800
      timeDelta: 10,   // +10 mins
      convenienceScore: 90, // 4.5/5 stars
    },
    {
      id: 'ro_3',
      bookingId,
      description: 'Best Fit: Rebook standard taxi',
      costDelta: 700,  // ₹700
      timeDelta: 30,   // +30 mins
      convenienceScore: 95, // 5/5 stars (Best balance, most convenient for luggage)
    }
  ];

  const scoredOptions = options.map(opt => ({
    ...opt,
    finalScore: calculateRecoveryScore(opt)
  })).sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

  return scoredOptions;
}

/**
 * Generates recovery options for an activity cancellation (Step 10 scenario).
 */
export function generateActivityRecoveryOptions(bookingId: string): RecoveryOption[] {
  // For activities, we don't necessarily rank exactly by cost/time the same way, 
  // but we can use the same structure for consistency.
  const options: RecoveryOption[] = [
    {
      id: 'ro_act_1',
      bookingId,
      description: 'Alternative: Museum A',
      costDelta: 500, // ₹500
      timeDelta: 0,   // Starts at same time
      convenienceScore: 85,
    },
    {
      id: 'ro_act_2',
      bookingId,
      description: 'Alternative: City Tour',
      costDelta: 800, // ₹800
      timeDelta: 30,  // Starts 30 mins later (14:30)
      convenienceScore: 90,
    },
    {
      id: 'ro_act_3',
      bookingId,
      description: 'Flexibility: Free time',
      costDelta: 0,   // ₹0
      timeDelta: 0,   // Free time starts immediately
      convenienceScore: 95,
    }
  ];

  // We can still score them using our normalized engine
  const scoredOptions = options.map(opt => ({
    ...opt,
    finalScore: calculateRecoveryScore(opt)
  })).sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

  return scoredOptions;
}
