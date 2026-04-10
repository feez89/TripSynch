import type { FlightProvider, FlightSearchParams, FlightResult } from './flight.interface';

// TODO: Install @duffel/api package
// import { Duffel } from '@duffel/api';

export class DuffelFlightProvider implements FlightProvider {
  // TODO: private client: Duffel;

  constructor() {
    // TODO: this.client = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN! });
    if (!process.env.DUFFEL_ACCESS_TOKEN) {
      console.warn('Duffel access token not configured.');
    }
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
    // TODO: Implement Duffel offer request flow
    /*
    const offerRequest = await this.client.offerRequests.create({
      slices: [
        {
          origin: params.origin,
          destination: params.destination,
          departure_date: params.departDate,
        },
        ...(params.returnDate ? [{
          origin: params.destination,
          destination: params.origin,
          departure_date: params.returnDate,
        }] : []),
      ],
      passengers: Array(params.adults || 1).fill({ type: 'adult' }),
      cabin_class: params.cabinClass || 'economy',
    });

    const offers = await this.client.offers.list({ offer_request_id: offerRequest.data.id });

    return offers.data.map((offer) => ({
      id: offer.id,
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      airline: offer.owner.name,
      flightNum: offer.slices[0].segments[0].operating_carrier_flight_number,
      durationMin: offer.slices[0].duration ? parseDuration(offer.slices[0].duration) : 0,
      stops: offer.slices[0].segments.length - 1,
      price: parseFloat(offer.total_amount),
      currency: offer.total_currency,
      cabinClass: params.cabinClass || 'economy',
      deepLink: offer.booking_url,
    }));
    */
    throw new Error('Duffel provider not yet configured. Set FLIGHT_PROVIDER=mock for development.');
  }
}
