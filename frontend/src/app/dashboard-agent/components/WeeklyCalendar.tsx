import { DayKey, TimeLog } from '../types';
import TimeLogBar from './TimeLogBar';

interface WeeklyCalendarProps {
  timeLogs: Record<DayKey, TimeLog[]>;
  isClockingIn: boolean;
  currentDayLogs: TimeLog;
  currentDayKey: DayKey;
  onRefresh: () => void;
}

const dayKeys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyCalendar({ 
  timeLogs, 
  isClockingIn, 
  currentDayLogs, 
  currentDayKey,
  onRefresh 
}: WeeklyCalendarProps) {
  return (
    <div className="bg-gray-50 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Planning Hebdomadaire</h3>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl font-medium text-sm border border-gray-200 transition"
        >
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {dayKeys.map(day => (
          <div key={day} className="flex flex-col">
            <div className="font-semibold text-gray-700 text-center mb-3 pb-2 border-b-2 border-gray-200">
              {day}
            </div>
            <div className="flex-1 border-t-2 border-gray-200 pt-4 relative min-h-[200px]">
              {timeLogs[day].length === 0 && !(isClockingIn && currentDayKey === day) ? (
                <span className="text-gray-400 text-xs text-center block">Aucune heure</span>
              ) : (
                <div className="space-y-2">
                  {timeLogs[day].map((log, idx) => (
                    <TimeLogBar key={idx} log={log} />
                  ))}
                  {isClockingIn && currentDayKey === day && (
                    <div 
                      className="bg-gradient-to-b from-blue-500 to-blue-600 text-white px-2 py-2 rounded-lg text-xs font-medium animate-pulse"
                      style={{ minHeight: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                      <div>{currentDayLogs.start}</div>
                      <div className="text-center my-1">-</div>
                      <div>en cours</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
