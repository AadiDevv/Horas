'use client';

import { useState, useEffect } from 'react';
import { Clock, Menu, Bell, Users, UserPlus, Folder, Settings, FileText, User } from 'lucide-react';
import Navbar from '../components/navbar';
import RoleProtection from '../middleware/roleProtection';

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
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
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${dayName} ${day}, ${month} ${year} | ${hours}:${minutes}`;
  };

  const agents = [
    {
      name: 'John Ekeler',
      role: 'Food Dashboard Design',
      subtitle: 'Creating UI and Research',
      hours: '00:40:00',
      delays: 2,
      avatar: 'bg-gradient-to-br from-blue-400 to-cyan-500'
    },
    {
      name: 'Rubik Sans',
      role: 'Project Name',
      subtitle: 'Creating UI and Research',
      hours: '00:40:00',
      delays: 0,
      avatar: 'bg-gradient-to-br from-purple-400 to-pink-500'
    }
  ];

  const lateAgents = [
    {
      name: 'John Ekeler',
      role: 'Food Dashboard Design',
      subtitle: 'Creating UI and Research',
      startTime: '00:40:00',
      arrivedTime: '08:40:00',
      avatar: 'bg-gradient-to-br from-blue-400 to-cyan-500'
    },
    {
      name: 'Rubik Sans',
      role: 'Project Name',
      subtitle: 'Creating UI and Research',
      startTime: '00:40:00',
      arrivedTime: '08:40:00',
      avatar: 'bg-gradient-to-br from-purple-400 to-pink-500'
    }
  ];

  const weeklyHours = [
    { day: 'Lun', hours: 65 },
    { day: 'Mar', hours: 75 },
    { day: 'Mer', hours: 95 },
    { day: 'Jeu', hours: 98 },
    { day: 'Ven', hours: 85 },
    { day: 'Sam', hours: 45 }
  ];

  const agentHours = [
    { name: 'John', hours: 85 },
    { name: 'Rubik', hours: 92 },
    { name: 'Julie', hours: 95 },
    { name: 'Maxime', hours: 98 },
    { name: 'Elon', hours: 88 },
    { name: 'Steve', hours: 65 }
  ];

  return (
    <RoleProtection allowedRoles={['manager', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-64 p-6 space-y-2 bg-white/60 backdrop-blur-xl border-r border-gray-200/50">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-black text-white rounded-xl font-medium transition-all duration-200 hover:bg-gray-900 shadow-lg shadow-black/10">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                Tableau de bord
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100">
                <Users size={20} strokeWidth={2} />
                Agents
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100">
                <Clock size={20} strokeWidth={2} />
                Équipes
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100">
                <FileText size={20} strokeWidth={2} />
                Reports
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100">
                <Settings size={20} strokeWidth={2} />
                Paramètres
              </button>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Aujourd'hui</h2>
                <p className="text-gray-600 font-medium">{mounted && currentTime ? formatDate(currentTime) : 'Chargement...'}</p>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow">
                  <Users size={20} strokeWidth={2} />
                  Créer une équipe
                </button>
                <button className="flex items-center gap-3 px-6 py-3.5 bg-black hover:bg-gray-900 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-black/20">
                  <UserPlus size={20} strokeWidth={2} />
                  Ajouter un agent
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Heures Total Semaine</h3>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-semibold">40:00:05</span>
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <Clock size={28} className="text-gray-700" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Agent Actif</h3>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-semibold">01</span>
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <User size={28} className="text-black-700" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Équipe</h3>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-semibold">08</span>
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <Folder size={28} className="text-black-700" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Agents Table */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Agents</h3>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="col-span-5">Agent info</div>
                    <div className="col-span-4 text-center">H travaillés</div>
                    <div className="col-span-3 text-center">Retards</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {agents.map((agent, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-200">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={`w-11 h-11 ${agent.avatar} rounded-full flex-shrink-0`}></div>
                        <div>
                          <p className="font-semibold text-sm">{agent.name}</p>
                          <p className="text-xs text-gray-600">{agent.role}</p>
                          <p className="text-xs text-gray-400">{agent.subtitle}</p>
                        </div>
                      </div>
                      <div className="col-span-4 text-center">
                        <span className="font-semibold text-sm">{agent.hours}</span>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="font-semibold text-sm">{agent.delays}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold text-sm hover:bg-gray-900 transition-all duration-200">
                  View All
                </button>
              </div>

              {/* Weekly Hours Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Heures par jours</h3>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                    </svg>
                  </button>
                </div>

                <div className="h-64 flex items-end justify-between gap-4 px-2">
                  {weeklyHours.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full bg-gray-100 rounded-t-xl relative" style={{ height: '100%' }}>
                        <div
                          className="w-full bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-xl absolute bottom-0 transition-all duration-500 hover:from-gray-700 hover:to-gray-600"
                          style={{ height: `${item.hours}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{item.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                    06/10 week
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Late Agents */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Top retardataires</h3>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="col-span-5">Agent info</div>
                    <div className="col-span-3 text-center">Starting at</div>
                    <div className="col-span-4 text-center">Comes at</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {lateAgents.map((agent, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-200">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={`w-11 h-11 ${agent.avatar} rounded-full flex-shrink-0`}></div>
                        <div>
                          <p className="font-semibold text-sm">{agent.name}</p>
                          <p className="text-xs text-gray-600">{agent.role}</p>
                          <p className="text-xs text-gray-400">{agent.subtitle}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="font-semibold text-sm">{agent.startTime}</span>
                      </div>
                      <div className="col-span-4 text-center">
                        <span className="font-semibold text-sm">{agent.arrivedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Hours Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Heures par agent</h3>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {agentHours.map((agent, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-700 w-16">{agent.name}</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-full transition-all duration-500 hover:from-gray-700 hover:to-gray-600"
                          style={{ width: `${agent.hours}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}