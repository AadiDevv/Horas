import { TimeLog } from '../types';

interface TimeLogBarProps {
  log: TimeLog;
}

export default function TimeLogBar({ log }: TimeLogBarProps) {
  const getLogHeight = (log: TimeLog) => {
    if (!log.end) {
      const now = new Date();
      const endMinutes = now.getHours() * 60 + now.getMinutes();
      const [startHours, startMinutes] = log.start.split(':').map(Number);
      const startMinutesTotal = startHours * 60 + startMinutes;
      return (endMinutes - startMinutesTotal) * 1;
    }
    const [startHours, startMinutes] = log.start.split(':').map(Number);
    const [endHours, endMinutes] = log.end.split(':').map(Number);
    return ((endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)) * 1;
  };

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return null;
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const height = getLogHeight(log);
  const isSmall = height < 60;
  const duration = calculateDuration(log.start, log.end);

  return (
    <div 
      className="bg-gradient-to-b from-gray-800 to-gray-700 text-white px-2 py-2 rounded-lg text-xs font-medium relative group"
      style={{ 
        height: `${height}px`, 
        minHeight: '30px', 
        display: 'flex', 
        flexDirection: isSmall ? 'row' : 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: isSmall ? '4px' : '0'
      }}
    >
      {isSmall ? (
        <>
          <div className="text-[10px]">{log.start}</div>
          <div className="text-[10px]">→</div>
          <div className="text-[10px]">{log.end || 'en cours'}</div>
        </>
      ) : (
        <>
          <div>{log.start}</div>
          <div className="text-center my-1">-</div>
          <div>{log.end || 'en cours'}</div>
        </>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
        {log.start} - {log.end || 'en cours'}
        {duration && (
          <div className="text-[10px] text-gray-400 mt-1">
            Durée: {duration}
          </div>
        )}
      </div>
    </div>
  );
}
