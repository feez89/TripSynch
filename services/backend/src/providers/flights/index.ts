import type { FlightProvider } from './flight.interface';
import { MockFlightProvider } from './mock.provider';
import { DuffelFlightProvider } from './duffel.provider';

export const getFlightProvider = (): FlightProvider => {
  switch (process.env.FLIGHT_PROVIDER || 'mock') {
    case 'duffel':
      return new DuffelFlightProvider();
    case 'mock':
    default:
      return new MockFlightProvider();
  }
};
