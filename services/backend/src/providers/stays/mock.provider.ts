import type { StayProvider, StaySearchParams, StayResult } from './stay.interface';

const HOTEL_NAMES = [
  'The Grand Central Hotel', 'Boutique Hotel Lumière', 'Comfort Inn & Suites',
  'The Westin Downtown', 'Marriott City Center', 'Hilton Garden Inn',
  'Hotel Indigo', 'The Kimpton Collection', 'Ace Hotel', 'The Standard',
];

const AMENITIES_POOL = [
  'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Concierge',
  'Parking', 'Pet-friendly', 'Air conditioning', 'Room service', 'Breakfast included',
];

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export class MockStayProvider implements StayProvider {
  async searchStays(params: StaySearchParams): Promise<StayResult[]> {
    const nights = Math.max(1, Math.ceil(
      (new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86400000
    ));
    const results: StayResult[] = [];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const pricePerNight = Math.round(80 + i * 35 + Math.random() * 50);
      const stars = i < 2 ? 3 : i < 5 ? 4 : i < 7 ? 4.5 : 5;
      results.push({
        id: `mock-stay-${Date.now()}-${i}`,
        name: HOTEL_NAMES[i % HOTEL_NAMES.length],
        type: 'hotel',
        address: `${100 + i * 10} Main St, ${params.destination}`,
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        pricePerNight,
        totalPrice: pricePerNight * nights,
        currency: params.currency || 'USD',
        starRating: stars,
        amenities: randomItems(AMENITIES_POOL, 5),
        cancellationPolicy: i % 3 === 0 ? 'Free cancellation until 48h before' : 'Non-refundable',
        imageUrl: `https://picsum.photos/seed/hotel${i}/400/300`,
        deepLink: `https://example.com/stays/mock-${i}`,
      });
    }

    return results;
  }
}
