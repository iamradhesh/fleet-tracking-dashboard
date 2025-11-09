// store/useFleetStore.ts (PERFORMANCE OPTIMIZED)
import { create } from "zustand";

export interface Location {
  lat: number;
  lng: number;
  accuracy_meters?: number;
  altitude_meters?: number;
}

export interface Movement {
  speed_kmh?: number;
  heading_degrees?: number;
  moving?: boolean;
}

export interface FleetEvent {
  event_id: string;
  event_type: string;
  timestamp: string;
  vehicle_id: string;
  trip_id: string;
  device_id?: string;
  location: Location;
  movement?: Movement;
  distance_travelled_km?: number;
  signal_quality?: string;
  overspeed?: boolean;
}

export interface Trip {
  trip_id: string;
  vehicle_id: string;
  name: string;
  events: FleetEvent[];
}

interface TripState {
  currentIndex: number;
  isPlaying: boolean;
  speed: number;
  // PERFORMANCE: Cache for current event to avoid array lookups
  cachedCurrentEvent?: FleetEvent;
}

interface FleetState {
  trips: Trip[];
  activeTripId: string | null;
  pageSize: number;
  tripStates: Record<string, TripState>;
  globalIsPlaying: boolean;
  globalSpeed: number;
  
  // Performance optimization: Memoized getters
  getCurrentEvent: (tripId: string) => FleetEvent | null;
  
  loadTrips: (data: Trip[]) => void;
  setActiveTrip: (id: string) => void;
  togglePlayAll: () => void;
  setSpeedAll: (speed: number) => void;
  incrementIndex: (tripId: string) => void;
  resetAll: () => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  trips: [],
  activeTripId: null,
  pageSize: 200,
  tripStates: {},
  globalIsPlaying: false,
  globalSpeed: 1,

  // PERFORMANCE: Memoized getter to avoid recalculating current event
  getCurrentEvent: (tripId: string) => {
    const state = get();
    const tripState = state.tripStates[tripId];
    
    // Return cached event if available
    if (tripState?.cachedCurrentEvent) {
      return tripState.cachedCurrentEvent;
    }
    
    const trip = state.trips.find((t) => t.trip_id === tripId);
    if (!trip || !tripState) return null;
    
    return trip.events[tripState.currentIndex] || null;
  },

  loadTrips: (data) =>
    set({
      trips: data,
      activeTripId: data[0]?.trip_id || null,
      tripStates: data.reduce((acc, trip) => {
        const firstEvent = trip.events[0];
        acc[trip.trip_id] = { 
          currentIndex: 0, 
          isPlaying: false, 
          speed: 1,
          cachedCurrentEvent: firstEvent, // Cache first event
        };
        return acc;
      }, {} as Record<string, TripState>),
    }),

  setActiveTrip: (id) => set({ activeTripId: id }),

  togglePlayAll: () =>
    set((state) => {
      const newIsPlaying = !state.globalIsPlaying;
      const updatedStates = { ...state.tripStates };
      
      Object.keys(updatedStates).forEach((tripId) => {
        updatedStates[tripId] = {
          ...updatedStates[tripId],
          isPlaying: newIsPlaying,
        };
      });

      return {
        globalIsPlaying: newIsPlaying,
        tripStates: updatedStates,
      };
    }),

  setSpeedAll: (speed) =>
    set((state) => {
      const updatedStates = { ...state.tripStates };
      
      Object.keys(updatedStates).forEach((tripId) => {
        updatedStates[tripId] = {
          ...updatedStates[tripId],
          speed,
        };
      });

      return {
        globalSpeed: speed,
        tripStates: updatedStates,
      };
    }),

  // PERFORMANCE OPTIMIZED: Batch updates and cache current event
  incrementIndex: (tripId) =>
    set((state) => {
      const trip = state.trips.find((t) => t.trip_id === tripId);
      if (!trip) return state;

      const maxIndex = trip.events.length - 1;
      const currentState = state.tripStates[tripId];
      
      if (currentState.currentIndex >= maxIndex) {
        return state;
      }

      const newIndex = currentState.currentIndex + 1;
      const newEvent = trip.events[newIndex];

      return {
        tripStates: {
          ...state.tripStates,
          [tripId]: {
            ...currentState,
            currentIndex: newIndex,
            cachedCurrentEvent: newEvent, // Update cached event
          },
        },
      };
    }),

  resetAll: () =>
    set((state) => {
      const updatedStates = { ...state.tripStates };
      
      state.trips.forEach((trip) => {
        const firstEvent = trip.events[0];
        updatedStates[trip.trip_id] = {
          ...updatedStates[trip.trip_id],
          currentIndex: 0,
          isPlaying: false,
          cachedCurrentEvent: firstEvent, // Reset to first event
        };
      });

      return {
        globalIsPlaying: false,
        globalSpeed: 1,
        tripStates: updatedStates,
      };
    }),
}));