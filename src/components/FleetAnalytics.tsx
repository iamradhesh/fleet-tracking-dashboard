// components/FleetAnalytics.tsx
import { useFleetStore } from "../store/useFleetStore";
import { BarChart3, PieChart, TrendingUp, AlertTriangle } from "lucide-react";

export default function FleetAnalytics() {
  const { trips, tripStates } = useFleetStore();

  // Calculate completion distribution
  const completionBuckets = trips.reduce((acc, trip) => {
    const state = tripStates[trip.trip_id];
    if (!state) return acc;
    
    const progress = (state.currentIndex / trip.events.length) * 100;
    
    if (progress >= 80) acc["80-100%"]++;
    else if (progress >= 60) acc["60-80%"]++;
    else if (progress >= 40) acc["40-60%"]++;
    else if (progress >= 20) acc["20-40%"]++;
    else acc["0-20%"]++;
    
    return acc;
  }, { "0-20%": 0, "20-40%": 0, "40-60%": 0, "60-80%": 0, "80-100%": 0 });

  // Calculate speed statistics
  const speedStats = trips.map(trip => {
    const state = tripStates[trip.trip_id];
    if (!state) return null;
    
    const currentEvent = trip.events[state.currentIndex];
    return {
      name: trip.name,
      speed: currentEvent?.movement?.speed_kmh || 0,
      overspeed: currentEvent?.overspeed || false,
    };
  }).filter(Boolean);

  // Calculate signal quality distribution
  const signalQuality = trips.reduce((acc, trip) => {
    const state = tripStates[trip.trip_id];
    if (!state) return acc;
    
    const currentEvent = trip.events[state.currentIndex];
    const quality = currentEvent?.signal_quality || "unknown";
    acc[quality] = (acc[quality] || 0) + 1;
    
    return acc;
  }, {} as Record<string, number>);

  const maxCompletion = Math.max(...Object.values(completionBuckets));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Completion Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Trip Completion Distribution</h3>
            <p className="text-xs text-gray-500">Progress across all active trips</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {Object.entries(completionBuckets).map(([range, count]) => {
            const percentage = maxCompletion > 0 ? (count / maxCompletion) * 100 : 0;
            const colors = {
              "0-20%": "bg-red-500",
              "20-40%": "bg-orange-500",
              "40-60%": "bg-yellow-500",
              "60-80%": "bg-blue-500",
              "80-100%": "bg-green-500",
            };
            
            return (
              <div key={range}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{range}</span>
                  <span className="text-gray-600 font-bold">{count} trips</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[range as keyof typeof colors]} transition-all duration-500 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Speed Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Current Speed Status</h3>
            <p className="text-xs text-gray-500">Real-time vehicle speeds</p>
          </div>
        </div>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {speedStats.map((stat, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                stat!.overspeed ? "bg-red-50 border border-red-200" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                {stat!.overspeed && <AlertTriangle className="text-red-500" size={16} />}
                <span className="text-sm font-medium text-gray-700 truncate">{stat!.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${stat!.overspeed ? "text-red-600" : "text-gray-800"}`}>
                  {stat!.speed.toFixed(1)} km/h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Quality */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 lg:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <PieChart className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Signal Quality Overview</h3>
            <p className="text-xs text-gray-500">Current connectivity status across fleet</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(signalQuality).map(([quality, count]) => {
            const colors = {
              excellent: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
              good: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
              fair: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
              poor: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
              unknown: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
            };
            
            const color = colors[quality as keyof typeof colors] || colors.unknown;
            
            return (
              <div
                key={quality}
                className={`${color.bg} rounded-lg p-4 border ${color.border} text-center transition-all hover:scale-105`}
              >
                <p className={`text-2xl font-bold ${color.text} mb-1`}>{count}</p>
                <p className={`text-xs font-medium ${color.text} capitalize`}>{quality}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}