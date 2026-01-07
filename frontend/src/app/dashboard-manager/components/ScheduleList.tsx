import { Search, Plus, Clock, Edit2, Trash2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Schedule } from '../types';
import ScheduleVisualizer from './ScheduleVisualizer';
import { getDayName, getDayInitial, ALL_DAY_NUMBERS } from '../constants/schedule';

interface ScheduleListProps {
  schedules: Schedule[];
  onAddSchedule: () => void;
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: number) => void;
}

export default function ScheduleList({
  schedules,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule
}: ScheduleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Synchronize selectedSchedule with updated schedules data
  useEffect(() => {
    if (selectedSchedule) {
      const updatedSchedule = schedules.find(s => s.id === selectedSchedule.id);
      if (updatedSchedule) {
        setSelectedSchedule(updatedSchedule);
      }
    }
  }, [schedules]);

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule =>
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header with title and create button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Gestion des Horaires</h2>
        <button
          onClick={onAddSchedule}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all"
        >
          <Plus size={20} />
          Créer un horaire
        </button>
      </div>

      {/* Split-view layout - responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR - Compact schedule list */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un horaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          {/* Scrollable schedule list */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchTerm ? 'Aucun horaire trouvé' : 'Aucun horaire'}
              </div>
            ) : (
              filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="relative">
                  {/* Desktop: Compact interactive list item */}
                  <button
                    onClick={() => setSelectedSchedule(schedule)}
                    className={`hidden lg:block w-full text-left p-3 rounded-xl transition-all border-2 ${
                      selectedSchedule?.id === schedule.id
                        ? 'bg-gray-100 border-gray-800'
                        : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                    }`}
                  >
                    {/* Schedule name */}
                    <div className="font-semibold text-sm mb-1 truncate">
                      {schedule.name}
                    </div>

                    {/* Hours */}
                    <div className="text-xs mb-2 text-gray-600">
                      <Clock size={12} className="inline mr-1" />
                      {schedule.startHour} - {schedule.endHour}
                    </div>

                    Active days - all days with inactive grayed
                    <div className="flex gap-0.5 mb-2">
                      {ALL_DAY_NUMBERS.map((day) => {
                        const isActive = schedule.activeDays.includes(day);
                        return (
                          <span
                            key={day}
                            className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-semibold transition-all ${
                              selectedSchedule?.id === schedule.id
                                ? isActive
                                  ? 'bg-stone-800/90 text-white'
                                  : 'bg-gray-300 text-gray-500'
                                : isActive
                                  ? 'bg-stone-800/90 text-white'
                                  : 'bg-gray-200 text-gray-400'
                            }`}
                            title={getDayName(day)}
                          >
                            {getDayInitial(day)}
                          </span>
                        );
                      })}
                    </div>

                    {/* Usage indicator */}
                    {schedule.usersCount !== undefined && schedule.usersCount > 0 && (
                      <div className="text-[10px] text-gray-500">
                        {schedule.usersCount} utilisateur{schedule.usersCount > 1 ? 's' : ''}
                      </div>
                    )}
                  </button>

                  {/* Mobile: Card with all info + action buttons */}
                  <div className="lg:hidden bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{schedule.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} />
                          <span>{schedule.startHour} - {schedule.endHour}</span>
                        </div>
                      </div>
                    </div>

                    {/* Active days - all days with first letter */}
                    <div className="flex gap-1.5 mb-3">
                      {ALL_DAY_NUMBERS.map((day) => {
                        const isActive = schedule.activeDays.includes(day);
                        return (
                          <span
                            key={day}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-stone-800/90 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                            title={getDayName(day)}
                          >
                            {getDayInitial(day)}
                          </span>
                        );
                      })}
                    </div>

                    {/* Usage info */}
                    {schedule.usersCount !== undefined && schedule.usersCount > 0 && (
                      <div className="text-xs text-gray-500 mb-3">
                        {schedule.usersCount} utilisateur{schedule.usersCount > 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditSchedule(schedule)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stone-800/90 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all"
                      >
                        <Edit2 size={16} />
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) {
                            onDeleteSchedule(schedule.id);
                          }
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Selected schedule details (hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-9 bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
          {selectedSchedule ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-2xl font-semibold mb-2">{selectedSchedule.name}</h3>
                <p className="text-sm text-gray-500">
                  Créé le {new Date(selectedSchedule.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Visual timeline */}
              <ScheduleVisualizer
                key={`${selectedSchedule.id}-${selectedSchedule.startHour}-${selectedSchedule.endHour}-${selectedSchedule.activeDays.join(',')}`}
                schedule={selectedSchedule}
              />

              {/* Active days section */}
              <div>
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 mb-3">
                  <Calendar size={16} />
                  <span>JOURS DE LA SEMAINE</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 ">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {ALL_DAY_NUMBERS.map((day) => {
                      const isActive = selectedSchedule.activeDays.includes(day);
                      return (
                        <span
                          key={day}
                          className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${
                            isActive
                              ? 'bg-white text-black border shadow-xl border-gray-200'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {getDayName(day)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Usage statistics */}
              {selectedSchedule.usersCount !== undefined && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-3">UTILISATION</div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Utilisateurs assignés</span>
                      <span className="text-2xl font-bold">
                        {selectedSchedule.usersCount}
                      </span>
                    </div>
                    {selectedSchedule.usersCount > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Cet horaire est actuellement utilisé
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Teams using this schedule */}
              {selectedSchedule.teams && selectedSchedule.teams.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-3">ÉQUIPES ASSOCIÉES</div>
                  <div className="space-y-2">
                    {selectedSchedule.teams.map((team) => (
                      <div
                        key={team.id}
                        className="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
                      >
                        <span className="font-medium">{team.name}</span>
                        <span className="text-sm text-gray-600">
                          {team.membersCount} membre{team.membersCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manager info */}
              {selectedSchedule.manager && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-3">CRÉÉ PAR</div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium">
                      {selectedSchedule.manager.firstName} {selectedSchedule.manager.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedSchedule.manager.email}</p>
                  </div>
                </div>
              )}

              {/* Action buttons at bottom */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => onEditSchedule(selectedSchedule)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-stone-800/90 text-white rounded-xl font-semibold hover:bg-stone-800 transition-all"
                >
                  <Edit2 size={18} />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) {
                      onDeleteSchedule(selectedSchedule.id);
                      setSelectedSchedule(null);
                    }
                  }}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <Clock size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Sélectionnez un horaire</p>
              <p className="text-sm mt-2">Cliquez sur un horaire dans la liste pour voir ses détails</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
