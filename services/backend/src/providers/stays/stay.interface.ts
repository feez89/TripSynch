export interface StaySearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  currency?: string;
  type?: 'hotel' | 'rental' | 'all';
}

export interface StayResult {
  id: string;
  name: string;
  type: 'hotel' | 'rental' | 'hostel';
  address: string;
  lat?: number;
  lng?: number;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  starRating?: number;
  amenities: string[];
  cancellationPolicy?: string;
  imageUrl?: string;
  deepLink?: string;
}

export interface StayProvider {
  searchStays(params: StaySearchParams): Promise<StayResult[]>;
}
