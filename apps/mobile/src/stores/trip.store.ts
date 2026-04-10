import { create } from 'zustand';

interface TripState {
  activeTrip: string | null;
  setActiveTrip: (id: string | null) => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTrip: null,
  setActiveTrip: (id) => set({ activeTrip: id }),
}));
