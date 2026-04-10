export interface TripBrief {
  destination: string;
  startDate?: string;
  endDate?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  travelers?: number;
  vibe?: string;
  pace?: 'RELAXED' | 'BALANCED' | 'PACKED';
  stayPreference?: 'HOTEL' | 'RENTAL' | 'FLEXIBLE';
  foodPref?: boolean;
  nightlifePref?: boolean;
  naturePref?: boolean;
  culturePref?: boolean;
  extraNotes?: string;
  departureAirport?: string;
}

export interface DayActivity {
  time?: string;
  title: string;
  description: string;
  category: string;
  estimatedCost?: number;
  location?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  theme: string;
  activities: DayActivity[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  notes?: string;
}

export interface BudgetEstimate {
  flights?: { min: number; max: number };
  accommodation?: { min: number; max: number };
  dailyExpenses?: { min: number; max: number };
  total?: { min: number; max: number };
  currency: string;
}

export interface PlanningResult {
  summary: string;
  neighborhood: string;
  days: ItineraryDay[];
  budgetEstimate: BudgetEstimate;
  flightSummary: string;
  staySummary: string;
  openQuestions: string[];
}

export interface AIProvider {
  generateTripPlan(brief: TripBrief): Promise<PlanningResult>;
}
