import { RecoveryOption, TravelerPreference } from './types';

// Weights definition mapping
const PREFERENCE_WEIGHTS: Record<TravelerPreference, { cost: number, time: number, convenience: number, risk: number, impact: number }> = {
  cost: { cost: 0.45, time: 0.15, convenience: 0.15, risk: 0.15, impact: 0.10 },
  speed: { cost: 0.15, time: 0.45, convenience: 0.15, risk: 0.15, impact: 0.10 },
  comfort: { cost: 0.15, time: 0.15, convenience: 0.45, risk: 0.15, impact: 0.10 },
  minimal_change: { cost: 0.15, time: 0.15, convenience: 0.15, risk: 0.15, impact: 0.40 },
  balanced: { cost: 0.30, time: 0.25, convenience: 0.20, risk: 0.15, impact: 0.10 },
};

/**
 * Normalizes an array of numbers using Min-Max scaling.
 * 0-100 scale.
 * @param values Array of raw values
 * @param higherIsBetter true for convenience, false for cost/time/risk
 */
function normalizeScores(values: number[], higherIsBetter: boolean): number[] {
  if (values.length === 0) return [];
  const max = Math.max(...values);
  const min = Math.min(...values);

  return values.map(val => {
    if (max === min) return 100; // If all options are equal, they all score 100 for this dimension
    
    if (higherIsBetter) {
      return 100 * (val - min) / (max - min);
    } else {
      return 100 * (max - val) / (max - min);
    }
  });
}

/**
 * Takes an array of feasible RecoveryOptions and dynamically scores them 
 * against each other using the user's preference weights.
 */
export function rankRecoveryOptions(
  options: RecoveryOption[],
  preference: TravelerPreference = 'balanced'
): RecoveryOption[] {
  
  // 1. Filter out impossible options
  const feasibleOptions = options.filter(o => o.feasible);
  if (feasibleOptions.length === 0) return [];

  // 2. Extract raw metrics
  const costs = feasibleOptions.map(o => o.costDelta);
  const times = feasibleOptions.map(o => o.timeDelta);
  const conveniences = feasibleOptions.map(o => o.convenienceScore);
  const risks = feasibleOptions.map(o => o.riskScore);
  const impacts = feasibleOptions.map(o => o.bookingsChanged); // Proxy for impact

  // 3. Normalize across the dynamic pool
  const normCosts = normalizeScores(costs, false);
  const normTimes = normalizeScores(times, false);
  const normConveniences = normalizeScores(conveniences, true);
  const normRisks = normalizeScores(risks, false);
  const normImpacts = normalizeScores(impacts, false);

  // 4. Apply weights
  const weights = PREFERENCE_WEIGHTS[preference];

  const rankedOptions = feasibleOptions.map((opt, i) => {
    const finalScore = 
      (normCosts[i] * weights.cost) +
      (normTimes[i] * weights.time) +
      (normConveniences[i] * weights.convenience) +
      (normRisks[i] * weights.risk) +
      (normImpacts[i] * weights.impact);
    
    return {
      ...opt,
      normalizedCostScore: Math.round(normCosts[i]),
      normalizedTimeScore: Math.round(normTimes[i]),
      normalizedConvenienceScore: Math.round(normConveniences[i]),
      normalizedRiskScore: Math.round(normRisks[i]),
      normalizedImpactScore: Math.round(normImpacts[i]),
      finalScore: Math.round(finalScore)
    };
  });

  // 5. Sort descending (highest final score first)
  return rankedOptions.sort((a, b) => b.finalScore! - a.finalScore!);
}
