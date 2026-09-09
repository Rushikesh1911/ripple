import { Booking } from '../types/trip';

export type ImpactStatus = 'DISRUPTED' | 'IMPACTED' | 'AT_RISK' | 'PROTECTED';

export interface DisruptionInput {
  bookingId: string;
  type: 'DELAY' | 'CANCEL' | 'USER_CHANGE';
  delayMinutes?: number; 
}

export interface AffectedBooking {
  bookingId: string;
  originalBooking: Booking;
  status: ImpactStatus;
  reason: string;
  expectedArrivalTime?: string; // ISO 8601
  slackMinutes?: number;
}

export interface ImpactReport {
  disruptions: DisruptionInput[];
  affectedBookings: Record<string, AffectedBooking>; // Map bookingId -> AffectedBooking
  rippleRadius: number;
  damageScore: number;
  affectedCount: number;
  atRiskCount: number;
  protectedCount: number;
}

export type TravelerPreference = 'cost' | 'speed' | 'balanced' | 'comfort' | 'minimal_change';

export interface RecoveryOption {
  id: string;
  bookingId: string; // The primary booking this recovery addresses
  title: string;
  description: string;
  
  // Raw Metrics
  costDelta: number;
  timeDelta: number; // Minutes
  convenienceScore: number; // 0-100 raw
  riskScore: number; // 0-100 raw
  bookingsChanged: number;
  
  // Normalized Metrics (0-100, 100 is always best)
  normalizedCostScore?: number;
  normalizedTimeScore?: number;
  normalizedConvenienceScore?: number;
  normalizedRiskScore?: number;
  normalizedImpactScore?: number;

  finalScore?: number; // Weighted final score

  feasible: boolean;
  feasibilityReason?: string;
  explanation?: string;

  // For executing the recovery:
  suggestedUpdates: Record<string, Partial<Booking>>; // Map of bookingId -> fields to update
}
