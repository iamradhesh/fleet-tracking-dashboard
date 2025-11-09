// components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { useFleetStore } from "../store/useFleetStore";
import { allTrips } from "../Data/data";
import { Truck, X, ChevronRight } from "lucide-react";

const Sidebar: React.FC = () => {
  const { trips, loadTrips, activeTripId, setActiveTrip, tripStates } = useFleetStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (trips.length === 0) {
      loadTrips(allTrips);
    }
  }, [loadTrips, trips]);

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Truck className="text-white" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Trips</h2>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1">
        {trips.map((trip) => {
          const state = tripStates[trip.trip_id];
          const progress = state ? Math.round((state.currentIndex / trip.events.length) * 100) : 0;
          const isActive = activeTripId === trip.trip_id;

          return (
            <div
              key={trip.trip_id}
              onClick={() => {
                setActiveTrip(trip.trip_id);
                setIsMobileOpen(false);
              }}
              className={`group cursor-pointer rounded-xl p-4 transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-[1.02]"
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {trip.vehicle_id}
                    </span>
                    {state?.isPlaying && (
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${
                          isActive ? "bg-green-300" : "bg-green-500"
                        }`} />
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold text-sm leading-tight ${
                    isActive ? "text-white" : "text-gray-800"
                  }`}>
                    {trip.name}
                  </h3>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`transition-transform ${
                    isActive ? "text-white" : "text-gray-400 group-hover:translate-x-1"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={isActive ? "text-blue-100" : "text-gray-500"}>
                    Progress
                  </span>
                  <span className={`font-bold ${isActive ? "text-white" : "text-gray-700"}`}>
                    {progress}%
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isActive ? "bg-white/20" : "bg-gray-200"
                }`}>
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isActive 
                        ? "bg-white" 
                        : "bg-gradient-to-r from-blue-500 to-indigo-600"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className={isActive ? "text-blue-100" : "text-gray-500"}>
                    {state?.currentIndex || 0} / {trip.events.length}
                  </span>
                  {state?.speed && state.speed > 1 && (
                    <span className={`font-medium ${isActive ? "text-blue-100" : "text-blue-600"}`}>
                      {state.speed}x
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 p-6 flex-col shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        <Truck size={24} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-gray-50 to-white p-6 flex flex-col shadow-2xl z-50">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;