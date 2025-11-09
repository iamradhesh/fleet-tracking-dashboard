// Data/data.ts
import trip1 from "./trip_1_cross_country.json";
import trip2 from "./trip_2_urban_dense.json";
import trip3 from "./trip_3_mountain_cancelled.json";
import trip4 from "./trip_4_southern_technical.json";
import trip5 from "./trip_5_regional_logistics.json";
import type { Trip, FleetEvent } from "../store/useFleetStore";

// Helper function to pre-process events for performance
const processEvents = (events: any[]): FleetEvent[] => {
  return events.map((e) => ({
    ...e,
    // Convert timestamp string to a millisecond number once at load time
    timestamp_ms: new Date(e.timestamp).getTime(), 
  }));
};

export const allTrips: Trip[] = [
  {
    trip_id: "trip_20251103_080000",
    vehicle_id: "VH_001",
    name: "Cross Country Long Haul",
    // Loading full data and processing timestamps
    events: processEvents(trip1), 
  },
  {
    trip_id: "trip_20251103_090000",
    vehicle_id: "VH_002",
    name: "Urban Dense Delivery",
    // Loading full data and processing timestamps
    events: processEvents(trip2),
  },
  {
    trip_id: "trip_20251103_100000",
    vehicle_id: "VH_003",
    name: "Mountain Route Cancelled",
    // Loading full data and processing timestamps
    events: processEvents(trip3),
  },
  {
    trip_id: "trip_20251103_110000",
    vehicle_id: "VH_004",
    name: "Southern Technical Issues",
    // Loading full data and processing timestamps
    events: processEvents(trip4),
  },
  {
    trip_id: "trip_20251103_120000",
    vehicle_id: "VH_005",
    name: "Regional Logistics",
    // Loading full data and processing timestamps
    events: processEvents(trip5),
  },
];