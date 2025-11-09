// components/Navbar.tsx
import { Play, Pause, FastForward, RotateCcw, Menu } from "lucide-react";
import { useFleetStore } from "../store/useFleetStore";
import { useState } from "react";

export default function Navbar() {
  const { globalIsPlaying, globalSpeed, togglePlayAll, setSpeedAll, resetAll, trips, tripStates } = useFleetStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSpeedUp = () => {
    const newSpeed = globalSpeed >= 16 ? 1 : globalSpeed * 2;
    setSpeedAll(newSpeed);
  };

  const totalEvents = trips.reduce((sum, trip) => sum + trip.events.length, 0);
  const currentEvents = trips.reduce((sum, trip) => {
    const state = tripStates[trip.trip_id];
    return sum + (state?.currentIndex || 0);
  }, 0);
  const progressPercent = totalEvents > 0 ? Math.round((currentEvents / totalEvents) * 100) : 0;

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-xl sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Left: Logo & Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
            <span className="text-2xl">🚛</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight">
              Fleet Tracker
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs sm:text-sm text-blue-100">
                {trips.length} vehicles
              </span>
              <span className="hidden sm:inline text-blue-200">•</span>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 lg:w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-blue-100 font-medium">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={resetAll}
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105"
              title="Reset all vehicles"
            >
              <RotateCcw size={18} />
            </button>
            
            <button
              onClick={togglePlayAll}
              className={`p-2.5 rounded-lg transition-all duration-200 backdrop-blur-sm border hover:scale-105 ${
                globalIsPlaying 
                  ? "bg-red-500 hover:bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/50" 
                  : "bg-green-500 hover:bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/50"
              }`}
              title={globalIsPlaying ? "Pause all" : "Play all"}
            >
              {globalIsPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <button
              onClick={handleSpeedUp}
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105"
              title="Change speed"
            >
              <FastForward size={18} />
            </button>
            
            <div className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-sm font-bold text-white">{globalSpeed}x</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Controls Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { resetAll(); setMobileMenuOpen(false); }}
              className="flex-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              <span className="text-sm font-medium">Reset</span>
            </button>
            
            <button
              onClick={() => { togglePlayAll(); setMobileMenuOpen(false); }}
              className={`flex-1 p-3 rounded-lg transition-all backdrop-blur-sm border flex items-center justify-center gap-2 ${
                globalIsPlaying 
                  ? "bg-red-500 hover:bg-red-600 border-red-400 text-white" 
                  : "bg-green-500 hover:bg-green-600 border-green-400 text-white"
              }`}
            >
              {globalIsPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span className="text-sm font-medium">{globalIsPlaying ? "Pause" : "Play"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { handleSpeedUp(); setMobileMenuOpen(false); }}
              className="flex-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2"
            >
              <FastForward size={18} />
              <span className="text-sm font-medium">Speed</span>
            </button>
            
            <div className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-sm font-bold text-white">{globalSpeed}x</span>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm text-blue-100 font-medium min-w-[45px]">{progressPercent}%</span>
          </div>
        </div>
      )}
    </header>
  );
}