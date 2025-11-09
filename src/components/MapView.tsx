// components/MapView.tsx
import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useFleetStore } from "../store/useFleetStore";
import { Navigation, Gauge, Signal, MapPinned } from "lucide-react";

const vehicleIcons = [
  new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448636.png", iconSize: [32, 32] }),
  new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", iconSize: [32, 32] }),
  new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448459.png", iconSize: [32, 32] }),
  new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448773.png", iconSize: [32, 32] }),
  new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448872.png", iconSize: [32, 32] }),
];

const polylineColors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

export default function MapView() {
  const { trips, tripStates, incrementIndex } = useFleetStore();

  const tripsData = useMemo(() => {
    if (trips.length === 0) return [];
    return trips.map((trip) => {
      const state = tripStates[trip.trip_id];
      if (!state) return null;

      const visibleEvents = trip.events;
      const positions = visibleEvents.map((e) => [e.location.lat, e.location.lng] as [number, number]);
      const currentEvent = visibleEvents[Math.min(state.currentIndex, visibleEvents.length - 1)] || null;

      return { positions, currentEvent, trip, state };
    }).filter(Boolean);
  }, [trips, tripStates]);

  const mapCenter = useMemo(() => {
    const validPositions = tripsData.filter(d => d && d.currentEvent).map(d => d!.currentEvent!.location);
    if (validPositions.length === 0) return [37.0902, -95.7129] as [number, number];
    
    const avgLat = validPositions.reduce((sum, pos) => sum + pos.lat, 0) / validPositions.length;
    const avgLng = validPositions.reduce((sum, pos) => sum + pos.lng, 0) / validPositions.length;
    return [avgLat, avgLng] as [number, number];
  }, [tripsData]);

  // CRITICAL FIX: Use playStateKey to prevent unnecessary re-renders
  const playStateKey = useMemo(() => {
    if (!trips.length || Object.keys(tripStates).length === 0) return "init";
    return trips.map((trip) => {
      const state = tripStates[trip.trip_id];
      return `${trip.trip_id}:${state?.isPlaying}:${state?.speed}`;
    }).join(",");
  }, [trips, tripStates]);

  useEffect(() => {
    if (trips.length === 0) return;

   const intervals: (ReturnType<typeof setInterval> | null)[] = [];

    trips.forEach((trip) => {
      const state = tripStates[trip.trip_id];
      if (state && state.isPlaying) {
        const speed = state.speed || 1;
        const interval = setInterval(() => {
          incrementIndex(trip.trip_id);
        }, 1000 / speed);
        intervals.push(interval);
      } else {
        intervals.push(null);
      }
    });

    return () => {
      intervals.forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [playStateKey, incrementIndex]);

  if (trips.length === 0) {
    return (
      <div className="relative w-full h-[calc(100vh-280px)] lg:h-[75vh] bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
            <MapPinned className="text-blue-500 animate-pulse" size={48} />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-280px)] lg:h-[75vh] bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer center={mapCenter} zoom={5} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {tripsData.map((data, index) => {
          if (!data || !data.currentEvent) return null;

          const icon = vehicleIcons[index % vehicleIcons.length];
          const color = polylineColors[index % polylineColors.length];

          return (
            <React.Fragment key={data.trip.trip_id}>
              <Polyline positions={data.positions} color={color} weight={4} opacity={0.8} />
              <Marker position={[data.currentEvent.location.lat, data.currentEvent.location.lng]} icon={icon}>
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <h3 className="font-bold text-base text-gray-800">{data.trip.name}</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Navigation size={14} className="text-blue-500" />
                        <span className="font-medium">{data.trip.vehicle_id}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Gauge size={14} className="text-orange-500" />
                        <span>{data.currentEvent.movement?.speed_kmh ?? "N/A"} km/h</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Signal size={14} className="text-green-500" />
                        <span className="capitalize">{data.currentEvent.signal_quality ?? "N/A"}</span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold text-gray-700">
                            {Math.round((data.state.currentIndex / data.trip.events.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(data.state.currentIndex / data.trip.events.length) * 100}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {data.state.currentIndex} / {data.trip.events.length} events
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Modern Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl text-xs max-h-[300px] overflow-y-auto border border-gray-200 z-[1000]">
        <h3 className="font-bold text-sm mb-3 text-gray-800 flex items-center gap-2">
          <MapPinned size={16} className="text-blue-500" />
          Live Fleet Status
        </h3>
        <div className="space-y-2">
          {trips.map((trip, idx) => {
            const state = tripStates[trip.trip_id];
            const progress = state ? Math.round((state.currentIndex / trip.events.length) * 100) : 0;
            
            return (
              <div key={trip.trip_id} className="group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: polylineColors[idx % polylineColors.length] }} />
                  <span className="flex-1 font-medium text-gray-700 truncate">{trip.name}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${state?.isPlaying ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {state?.isPlaying ? "▶" : "⏸"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-5">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: polylineColors[idx % polylineColors.length] }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium min-w-[35px] text-right">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}