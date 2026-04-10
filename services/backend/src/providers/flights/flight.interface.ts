export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  currency?: string;
}

export interface FlightResult {
  id: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  airline: string;
  flightNum: string;
  durationMin: number;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  deepLink?: string;
  segments?: FlightSegment[];
}

export interface FlightSegment {
  origin: string;
  destination: string;
  departAt: string;
  arriveAt: string;
  airline: string;
  flightNum: string;
  durationMin: number;
}

export interface FlightProvider {
  searchFlights(params: FlightSearchParams): Promise<FlightResult[]>;
}
