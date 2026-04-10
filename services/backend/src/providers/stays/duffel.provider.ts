import type { StayProvider, StaySearchParams, StayResult } from './stay.interface';

// TODO: Integrate with Duffel Stays API
// https://duffel.com/docs/api/stays

export class DuffelStayProvider implements StayProvider {
  constructor() {
    if (!process.env.DUFFEL_ACCESS_TOKEN) console.warn('Duffel token not configured for stays.');
  }

  async searchStays(params: StaySearchParams): Promise<StayResult[]> {
    // TODO: Implement Duffel Stays search
    throw new Error('Duffel stays provider not yet configured. Set STAY_PROVIDER=mock.');
  }
}
