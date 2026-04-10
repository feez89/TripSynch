import type { StayProvider } from './stay.interface';
import { MockStayProvider } from './mock.provider';
import { ExpediaStayProvider } from './expedia.provider';
import { DuffelStayProvider } from './duffel.provider';

export const getStayProvider = (): StayProvider => {
  switch (process.env.STAY_PROVIDER || 'mock') {
    case 'expedia':
      return new ExpediaStayProvider();
    case 'duffel':
      return new DuffelStayProvider();
    case 'mock':
    default:
      return new MockStayProvider();
  }
};
