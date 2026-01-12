"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, Calendar, UserX } from "lucide-react";
import Navbar from "../components/navbar";
import RoleProtection from "../middleware/roleProtection";
import {
  StatCard,
  ClockButton,
  WeeklyCalendar,
  SettingsModal,
  Sidebar,
} from "./components";
import {
  useUserData,
  useSettings,
  useTeamSchedule,
  useTimesheet,
} from "./hooks/useAgentDashboard";
import { formatDate } from "./utils/dateUtils";
import {
  getAbsences,
  Absence,
} from "@/app/dashboard-manager/services/absenceService";

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [absences, setAbsences] = useState<Absence[]>([]);

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
    isCurrentWeek,
    formatWeekButtonText,
  } = useTimesheet();
  const { teamSchedule, loadTeamSchedule } = useTeamSchedule(userData);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadUserData();

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (userData) {
      loadTeamSchedule();
      loadAbsences();
    }
  }, [userData]);

  const loadAbsences = async () => {
    if (!userData?.id) return;

    try {
      const response = await getAbsences({ employeId: userData.id });
      if (response.success && response.data) {
        const monday = weekDays[0];
        const sunday = weekDays[6];

        if (monday && sunday) {
          const filteredAbsences = response.data.filter((absence) => {
            const absenceStart = new Date(absence.startDateTime);
            const absenceEnd = new Date(absence.endDateTime);
            const weekStart = new Date(monday);
            const weekEnd = new Date(sunday);

            weekStart.setHours(0, 0, 0, 0);
            weekEnd.setHours(23, 59, 59, 999);

            return absenceStart <= weekEnd && absenceEnd >= weekStart;
          });

          setAbsences(filteredAbsences);
        }
      }
    } catch (error) {
      // Silent error
    }
  };

  useEffect(() => {
    if (userData && weekDays.length > 0) {
      loadAbsences();
    }
  }, [selectedWeek, weekDays]);


  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <RoleProtection allowedRoles={["manager", "admin", "employe"]}>
      <div className="min-h-screen bg-white">
        {/* Notifications en haut de l'écran */}
        {successMessage && (
          <div
            className="fixed top-6 z-[100] px-6 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium shadow-lg animate-slideDown"
            style={{ left: '50%' }}
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            className="fixed top-6 z-[100] px-6 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium shadow-lg animate-slideDown"
            style={{ left: '50%' }}
          >
            {errorMessage}
          </div>
        )}

        <Navbar onOpenSettings={handleOpenSettings} />

        {userData && (
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            userData={userData}
            formData={formData}
            setFormData={setFormData}
            onSave={() => handleSaveSettings(setUserData)}
            saving={saving}
            successMessage={settingsSuccessMessage}
            errorMessage={settingsErrorMessage}
          />
        )}

        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-2">
                  Aujourd'hui
                </h2>
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
              <h3 className="text-xl md:text-2xl font-semibold">
                Planning de la semaine
              </h3>
              <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto max-w-full pb-1">
                <button
                  onClick={previousWeek}
                  className="px-3 py-2 md:px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                  ← Précédent
                </button>
                <button
                  onClick={currentWeek}
                  className={`px-3 py-2 md:px-4 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isCurrentWeek()
                      ? "bg-black hover:bg-gray-900 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {formatWeekButtonText()}
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
                    loadAbsences();
                  }}
                  teamSchedule={teamSchedule}
                  weekDays={weekDays}
                  absences={absences}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
