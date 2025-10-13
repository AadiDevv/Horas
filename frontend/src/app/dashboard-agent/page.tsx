"use client";

import { useState, useEffect } from "react";
import { Clock, Menu, Bell, Play, AlertCircle } from "lucide-react";
import Navbar from "../components/navbar";
import RoleProtection from "../middleware/roleProtection";

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedDomain, setSelectedDomain] = useState("Matrix Domain");
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayName} ${day}, ${month} ${year} | ${hours}:${minutes}`;
  };

  return (
    <RoleProtection allowedRoles={["employe", "manager", "admin"]}>
      <div className="min-h-screen bg-white">
        <Navbar />
        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-64 p-6 space-y-4 border-r border-gray-200">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-black text-white rounded-xl font-medium transition hover:bg-gray-800">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                Tableau de bord
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl font-medium transition hover:bg-gray-100">
                <Clock size={20} />
                Feuille de temps
              </button>

              <div className="pt-6">
                <label className="block text-xs text-gray-500 mb-2 px-4">
                  Filtré par
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                >
                  <option>Matrix Domain</option>
                  <option>Design Domain</option>
                  <option>Dev Domain</option>
                </select>
              </div>
            </aside>
          )}

          {/* Main Dashboard */}
          <main className="flex-1 p-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-semibold mb-2">Aujourd'hui</h2>
                <p className="text-gray-600">
                  {mounted && currentTime
                    ? formatDate(currentTime)
                    : "Chargement..."}
                </p>
              </div>
              <button className="flex items-center gap-6 px-8 py-4 bg-[#333333] text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition">
                Émarger
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Play size={24} className="fill-[#333333]" />
                </div>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Travaillé ce jour
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-semibold">02:00:05</span>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <Clock size={28} className="text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Travaillé cette semaine
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-semibold">40:00:05</span>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <Clock size={28} className="text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Retards ce mois
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-semibold">2</span>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <AlertCircle size={28} className="text-gray-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Activité récente</h3>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between bg-white rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                  <span className="font-semibold">Rubik Sans</span>
                </div>
                <button className="text-sm font-medium text-gray-600 hover:text-black transition">
                  Tout voir
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
