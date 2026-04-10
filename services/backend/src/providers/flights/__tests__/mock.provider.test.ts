import { MockFlightProvider } from '../mock.provider';

const provider = new MockFlightProvider();

const params = {
  origin: 'JFK',
  destination: 'BCN',
  departDate: '2024-07-15',
  returnDate: '2024-07-22',
  adults: 2,
  cabinClass: 'economy' as const,
  currency: 'USD',
};

describe('MockFlightProvider', () => {
  it('returns an array of results', async () => {
    const results = await provider.searchFlights(params);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('results are sorted by price ascending', async () => {
    const results = await provider.searchFlights(params);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].price).toBeGreaterThanOrEqual(results[i - 1].price);
    }
  });

  it('each result has required fields', async () => {
    const results = await provider.searchFlights(params);
    for (const r of results) {
      expect(r.id).toBeTruthy();
      expect(r.origin).toBe('JFK');
      expect(r.destination).toBe('BCN');
      expect(r.airline).toBeTruthy();
      expect(r.flightNum).toBeTruthy();
      expect(typeof r.price).toBe('number');
      expect(r.price).toBeGreaterThan(0);
      expect(typeof r.stops).toBe('number');
      expect(r.stops).toBeGreaterThanOrEqual(0);
      expect(r.currency).toBe('USD');
    }
  });

  it('prices are realistic (> $99)', async () => {
    const results = await provider.searchFlights(params);
    for (const r of results) {
      expect(r.price).toBeGreaterThanOrEqual(99);
    }
  });

  it('works for one-way search (no returnDate)', async () => {
    const results = await provider.searchFlights({ ...params, returnDate: undefined });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.returnDate).toBeUndefined();
    }
  });
});
