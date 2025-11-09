// pages/Dashboard.tsx
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCards from "../components/StatCard";
import FleetAnalytics from "../components/FleetAnalytics";
import MapView from "../components/MapView";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1800px] mx-auto space-y-6">
            <StatCards />
            <FleetAnalytics />
            <MapView />
          </div>
        </main>

        {/* Decorative Elements */}
        <div className="fixed top-20 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}