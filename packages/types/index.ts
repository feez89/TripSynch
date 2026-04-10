// ─── Shared TripSync TypeScript Types ────────────────────────────────────────
// Used by both the backend and the mobile API client.

export type TripStatus = 'PLANNING' | 'BOOKED' | 'TRAVELING' | 'COMPLETED';
export type VoteValue = 'UP' | 'DOWN';
export type VoteTargetType = 'FLIGHT' | 'STAY' | 'RENTAL';
export type ExpenseCategory = 'ACCOMMODATION' | 'FLIGHTS' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';
export type SplitType = 'EQUAL' | 'FIXED' | 'PERCENTAGE' | 'CUSTOM';
export type ExpenseStatus = 'PENDING' | 'SETTLED' | 'CANCELED';
export type PacePreference = 'RELAXED' | 'BALANCED' | 'PACKED';
export type StayPreference = 'HOTEL' | 'RENTAL' | 'FLEXIBLE';
export type ActivityEventType = 'USER_JOINED' | 'OPTION_SAVED' | 'VOTE_ADDED' | 'EXPENSE_ADDED' | 'ITINERARY_GENERATED' | 'COMMENT_ADDED';

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: 'organizer' | 'member';
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

export interface TripPreference {
  vibe?: string | null;
  pace: PacePreference;
  stayPreference: StayPreference;
  foodPref: boolean;
  nightlifePref: boolean;
  naturePref: boolean;
  culturePref: boolean;
  extraNotes?: string | null;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  departureAirport?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency: string;
  status: TripStatus;
  inviteCode: string;
  createdAt: string;
  members: TripMember[];
  preferences?: TripPreference | null;
  itinerary?: Itinerary | null;
  _count?: { savedFlights: number; savedStays: number; savedRentals: number; expenses: number };
}

export interface CreateTripInput {
  name: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  departureAirport?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  preferences?: Partial<TripPreference>;
}

// ─── Itinerary ────────────────────────────────────────────────────────────────

export interface DayActivity {
  time?: string;
  title: string;
  description: string;
  category: string;
  estimatedCost?: number;
  location?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date?: string | null;
  theme?: string | null;
  activities: DayActivity[];
  meals?: { breakfast?: string; lunch?: string; dinner?: string } | null;
  notes?: string | null;
}

export interface Itinerary {
  id: string;
  tripId: string;
  summary: string;
  neighborhood?: string | null;
  budgetEstimate?: any;
  flightSummary?: string | null;
  staySummary?: string | null;
  openQuestions: string[];
  days: ItineraryDay[];
  createdAt: string;
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface Vote {
  id: string;
  userId: string;
  targetType: VoteTargetType;
  targetId: string;
  value: VoteValue;
  user?: Pick<User, 'id' | 'name'>;
}

export interface Comment {
  id: string;
  userId: string;
  targetType: VoteTargetType;
  targetId: string;
  body: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface SavedFlightOption {
  id: string;
  tripId: string;
  savedById: string;
  externalId?: string | null;
  provider: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  airline: string;
  flightNum?: string | null;
  durationMin?: number | null;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  deepLink?: string | null;
  notes?: string | null;
  createdAt: string;
  savedBy: Pick<User, 'id' | 'name'>;
  votes: Vote[];
  comments: Comment[];
}

export interface SavedStayOption {
  id: string;
  tripId: string;
  savedById: string;
  name: string;
  type: string;
  address?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  pricePerNight: number;
  totalPrice?: number | null;
  currency: string;
  starRating?: number | null;
  amenities: string[];
  cancellationPolicy?: string | null;
  imageUrl?: string | null;
  deepLink?: string | null;
  notes?: string | null;
  createdAt: string;
  savedBy: Pick<User, 'id' | 'name'>;
  votes: Vote[];
  comments: Comment[];
}

export interface SavedRentalOption {
  id: string;
  tripId: string;
  savedById: string;
  title: string;
  url?: string | null;
  priceEstimate?: number | null;
  currency: string;
  beds?: number | null;
  bedrooms?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  savedBy: Pick<User, 'id' | 'name'>;
  votes: Vote[];
  comments: Comment[];
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export interface ExpenseParticipant {
  id: string;
  expenseId: string;
  userId: string;
  shareAmount: number;
  sharePercent?: number | null;
  paid: boolean;
  user: Pick<User, 'id' | 'name'>;
}

export interface Expense {
  id: string;
  tripId: string;
  paidById: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  splitType: SplitType;
  status: ExpenseStatus;
  notes?: string | null;
  date: string;
  createdAt: string;
  paidBy: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  participants: ExpenseParticipant[];
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  currency?: string;
  category?: ExpenseCategory;
  paidById: string;
  splitType?: SplitType;
  notes?: string;
  date?: string;
  participants: { userId: string; shareAmount?: number; sharePercent?: number }[];
}

// ─── Settlement ───────────────────────────────────────────────────────────────

export interface UserBalance {
  userId: string;
  name: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

export interface SettlementSuggestion {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface SettlementResult {
  balances: UserBalance[];
  suggestions: SettlementSuggestion[];
  totalExpenses: number;
  currency: string;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  tripId: string;
  userId?: string | null;
  type: ActivityEventType;
  payload?: any;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
}

// ─── Flight Search ─────────────────────────────────────────────────────────────

export interface FlightSearchResult {
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
}

export interface StaySearchResult {
  id: string;
  name: string;
  type: string;
  address: string;
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
