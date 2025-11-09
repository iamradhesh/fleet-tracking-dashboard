// components/StatCards.tsx
import { useFleetStore } from "../store/useFleetStore";
import { TrendingUp, MapPin, Activity, AlertCircle, Clock, Zap } from "lucide-react";

export default function StatCards() {
  const { trips, activeTripId, tripStates, globalIsPlaying } = useFleetStore();
  const activeTrip = trips.find((t) => t.trip_id === activeTripId);
  
  // Calculate fleet metrics
  const activeVehicles = Object.values(tripStates).filter(s => s.isPlaying).length;
  
  // Calculate completion percentages
  const completionStats = trips.reduce((acc, trip) => {
    const state = tripStates[trip.trip_id];
    if (!state) return acc;
    
    const progress = (state.currentIndex / trip.events.length) * 100;
    
    if (progress >= 80) acc.above80++;
    else if (progress >= 50) acc.above50++;
    else if (progress >= 20) acc.above20++;
    else acc.below20++;
    
    return acc;
  }, { above80: 0, above50: 0, above20: 0, below20: 0 });

  // Calculate average progress
  const avgProgress = trips.length > 0
    ? Math.round(
        trips.reduce((sum, trip) => {
          const state = tripStates[trip.trip_id];
          return sum + ((state?.currentIndex || 0) / trip.events.length) * 100;
        }, 0) / trips.length
      )
    : 0;

  // Count alerts (overspeeding, low signal)
  const alerts = trips.reduce((count, trip) => {
    const state = tripStates[trip.trip_id];
    if (!state) return count;
    
    const currentEvent = trip.events[state.currentIndex];
    if (!currentEvent) return count;
    
    if (currentEvent.overspeed) count++;
    if (currentEvent.signal_quality === "poor" || currentEvent.signal_quality === "fair") count++;
    
    return count;
  }, 0);

  const stats = [
    {
      icon: TrendingUp,
      label: "Fleet Progress",
      value: `${avgProgress}%`,
      subValue: `${completionStats.above80} trips >80%`,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-700",
      detail: `${completionStats.above50} trips >50% | ${completionStats.below20} trips <20%`,
    },
    {
      icon: Activity,
      label: "Live Tracking",
      value: activeVehicles,
      subValue: `${activeVehicles} of ${trips.length} moving`,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      textColor: "text-emerald-700",
      pulse: globalIsPlaying,
      detail: globalIsPlaying ? "All systems operational" : "Simulation paused",
    },
    {
      icon: AlertCircle,
      label: "Active Alerts",
      value: alerts,
      subValue: alerts > 0 ? "Attention required" : "All clear",
      color: alerts > 0 ? "from-red-500 to-orange-600" : "from-gray-400 to-gray-500",
      bgColor: alerts > 0 ? "bg-red-50" : "bg-gray-50",
      iconBg: alerts > 0 ? "bg-red-100" : "bg-gray-100",
      textColor: alerts > 0 ? "text-red-700" : "text-gray-600",
      detail: "Speed & signal monitoring",
    },
    {
      icon: MapPin,
      label: "Active Trip",
      value: activeTrip?.name || "None",
      subValue: activeTrip?.vehicle_id,
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      textColor: "text-indigo-700",
      detail: activeTrip ? `${activeTrip.events.length} total events` : "Select a trip",
    },
    {
      icon: Clock,
      label: "Total Events",
      value: trips.reduce((sum, trip) => sum + trip.events.length, 0).toLocaleString(),
      subValue: "Across all trips",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      textColor: "text-purple-700",
      detail: `${trips.length} active routes`,
    },
    {
      icon: Zap,
      label: "Playback Speed",
      value: `${tripStates[trips[0]?.trip_id]?.speed || 1}x`,
      subValue: globalIsPlaying ? "Running" : "Paused",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-700",
      detail: "Simulation control",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl ${stat.bgColor} p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50 group hover:scale-[1.02]`}
          >
            {/* Gradient Overlay */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.iconBg} p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={stat.textColor} size={18} />
                </div>
                {stat.pulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <p className={`text-xs font-medium ${stat.textColor} mb-1`}>
                {stat.label}
              </p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800 mb-1 truncate">
                {stat.value}
              </p>
              {stat.subValue && (
                <p className="text-xs text-gray-600 font-medium mb-2">
                  {stat.subValue}
                </p>
              )}
              {stat.detail && (
                <p className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                  {stat.detail}
                </p>
              )}
            </div>

            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color}`} />
          </div>
        );
      })}
    </div>
  );
}