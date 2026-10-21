export type StudioTier = 'starter' | 'pro';

export interface StudioTierConfig {
  id: StudioTier;
  name: string;
  priceGHS: number;
  baseAmountInPesewas: number;
  maxPhotosPerEvent: number;
  maxEvents: number;
  maxFileSizeMB: number;
  planCode: string;
  features: string[];
}

export const STUDIO_TIERS: Record<StudioTier, StudioTierConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter Photographer',
    priceGHS: 69,
    baseAmountInPesewas: 6900,
    maxPhotosPerEvent: 150,
    maxEvents: 5,
    maxFileSizeMB: 25,
    planCode: process.env.NEXT_PUBLIC_PAYSTACK_STUDIO_STARTER_PLAN_CODE || process.env.NEXT_PUBLIC_PAYSTACK_STUDIO_PLAN_CODE || '',
    features: [
      'Up to 150 photos per gallery',
      'Up to 5 active galleries',
      'Easy high-res client downloads',
      'Custom branded galleries',
      '25MB file size limit',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Photographer',
    priceGHS: 250,
    baseAmountInPesewas: 25000,
    maxPhotosPerEvent: Infinity,
    maxEvents: Infinity,
    maxFileSizeMB: 100,
    planCode: process.env.NEXT_PUBLIC_PAYSTACK_STUDIO_PRO_PLAN_CODE || '',
    features: [
      'Unlimited high-res photo uploads',
      'Unlimited event galleries',
      'Easy high-res client downloads',
      'Custom branded galleries',
      'Priority cloud storage',
      '100MB file size limit (RAW/high-res)',
    ],
  },
};

/**
 * Calculates total Paystack charge amount with the 1.95% fee passed to the customer.
 */
export function calculateAmountWithFee(baseInPesewas: number): number {
  return Math.ceil(baseInPesewas / 0.9805);
}
