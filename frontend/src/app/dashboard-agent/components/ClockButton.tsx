import { Play, Pause } from "lucide-react";

interface ClockButtonProps {
  isClockingIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
}

export default function ClockButton({ isClockingIn, onClockIn, onClockOut }: ClockButtonProps) {
  return (
    <button 
      onClick={isClockingIn ? onClockOut : onClockIn}
      className="flex items-center gap-6 px-8 py-4 bg-black text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition"
    >
      {isClockingIn ? 'Clock Out' : 'Émarger'}
      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
        {isClockingIn ? (
          <Pause size={24} className="fill-black" />
        ) : (
          <Play size={24} className="fill-black" />
        )}
      </div>
    </button>
  );
}
