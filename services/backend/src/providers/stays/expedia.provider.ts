import type { StayProvider, StaySearchParams, StayResult } from './stay.interface';

// TODO: Integrate with Expedia Rapid API (formerly EPS)
// API docs: https://developers.expediagroup.com/docs/products/rapid

export class ExpediaStayProvider implements StayProvider {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.EXPEDIA_API_KEY || '';
    this.apiSecret = process.env.EXPEDIA_API_SECRET || '';
    if (!this.apiKey) console.warn('Expedia Rapid API key not configured.');
  }

  async searchStays(params: StaySearchParams): Promise<StayResult[]> {
    // TODO: Implement Expedia Rapid property availability search
    // POST https://test.ean.com/v3/properties/availability
    // Headers: Authorization: EAN apikey={key},signature={signature},timestamp={timestamp}
    throw new Error('Expedia provider not yet configured. Set STAY_PROVIDER=mock.');
  }
}
