"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, Calendar } from "lucide-react";
import Navbar from "../components/navbar";
import RoleProtection from "../middleware/roleProtection";
import {
  StatCard,
  ClockButton,
  WeeklyCalendar,
  SettingsModal,
} from "./components";
import {
  useUserData,
  useSettings,
  useTeamSchedule,
  useTimesheet,
} from "./hooks/useAgentDashboard";
import { formatDate } from "./utils/dateUtils";

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Custom hooks
  const { userData, setUserData, formData, setFormData, loadUserData } =
    useUserData();
  const {
    settingsOpen,
    setSettingsOpen,
    saving,
    successMessage: settingsSuccessMessage,
    errorMessage: settingsErrorMessage,
    handleOpenSettings,
    handleSaveSettings,
  } = useSettings(userData, formData);
  const {
    timeLogs,
    isClockingIn,
    currentDayLogs,
    pointageLoading,
    successMessage,
    errorMessage,
    stats,
    getDayKey,
    handleClockToggle,
    checkTodayTimesheets,
    loadWeekTimesheets,
    loadStats,
  } = useTimesheet();
  const { teamSchedule, loadTeamSchedule } = useTeamSchedule(userData);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadUserData();
    checkTodayTimesheets();

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Charger les horaires de l'équipe quand userData est disponible
  useEffect(() => {
    if (userData) {
      loadTeamSchedule();
    }
  }, [userData]);

  const handleLogout = () => {
    console.log('🚪 Déconnexion...');
    window.location.href = '/login';
  };

  return (
    <RoleProtection allowedRoles={["manager", "admin", "employe"]}>
      <div className="min-h-screen bg-white">
        <Navbar
          onOpenSettings={handleOpenSettings}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Settings Modal */}
        {userData && (
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            userData={userData}
            formData={formData}
            setFormData={setFormData}
            onSave={() => handleSaveSettings(setUserData, setFormData)}
            saving={saving}
            successMessage={settingsSuccessMessage}
            errorMessage={settingsErrorMessage}
          />
        )}

        {/* Main Content */}
        <div className="flex">
          <main className="flex-1 p-8">
            {/* Header with Clock Button */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-semibold mb-2">Aujourd'hui</h2>
                <p className="text-gray-600">
                  {mounted && currentTime
                    ? formatDate(currentTime)
                    : "Chargement..."}
                </p>
              </div>
              <ClockButton
                isClockingIn={isClockingIn}
                onClockIn={handleClockToggle}
                onClockOut={handleClockToggle}
                pointageLoading={pointageLoading}
                successMessage={successMessage}
                errorMessage={errorMessage}
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <StatCard
                title="Travaillé ce jour"
                value={`${stats.heuresJour.toFixed(2)}h`}
                icon={Clock}
              />
              <StatCard
                title="Travaillé cette semaine"
                value={`${stats.heuresSemaine.toFixed(2)}h`}
                icon={Calendar}
              />
              <StatCard
                title="Retards ce mois"
                value={stats.retardsMois.toString()}
                icon={AlertCircle}
              />
            </div>

            {/* Weekly Calendar */}
            <WeeklyCalendar
              timeLogs={timeLogs}
              isClockingIn={isClockingIn}
              currentDayLogs={currentDayLogs}
              currentDayKey={getDayKey()}
              onRefresh={() => {
                setCurrentTime(new Date());
                loadTeamSchedule();
                loadWeekTimesheets();
              }}
              teamSchedule={teamSchedule}
            />
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
