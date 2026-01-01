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
    selectedWeek,
    weekDays,
    getDayKey,
    handleClockToggle,
    checkTodayTimesheets,
    loadWeekTimesheets,
    loadStats,
    previousWeek,
    nextWeek,
    currentWeek,
    formatWeekRange,
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
          <main className="flex-1 p-4 md:p-8 w-full overflow-hidden">
            {/* Header with Clock Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-6 md:gap-0">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-2">Aujourd'hui</h2>
                <p className="text-gray-600">
                  {mounted && currentTime
                    ? formatDate(currentTime)
                    : "Chargement..."}
                </p>
              </div>
              <div className="w-full md:w-auto flex justify-center md:justify-end">
                <ClockButton
                  isClockingIn={isClockingIn}
                  onClockIn={handleClockToggle}
                  onClockOut={handleClockToggle}
                  pointageLoading={pointageLoading}
                  successMessage={successMessage}
                  errorMessage={errorMessage}
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
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

            {/* Weekly Calendar Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl md:text-2xl font-semibold">Planning de la semaine</h3>
              <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto max-w-full pb-1">
                <button
                  onClick={previousWeek}
                  className="px-3 py-2 md:px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                  ← Précédent
                </button>
                <button
                  onClick={currentWeek}
                  className="px-3 py-2 md:px-4 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Cette semaine
                </button>
                <button
                  onClick={nextWeek}
                  className="px-3 py-2 md:px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Suivant →
                </button>
              </div>
            </div>

            {/* Week Range Display */}
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Calendar size={20} />
              <span className="font-medium">{formatWeekRange()}</span>
            </div>

            {/* Weekly Calendar Container - Scrollable on mobile */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
               <div className="min-w-[800px] md:min-w-0">
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
                    weekDays={weekDays}
                  />
               </div>
            </div>
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
