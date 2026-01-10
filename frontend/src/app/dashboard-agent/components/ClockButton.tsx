import { Play, Pause, Loader2 } from "lucide-react";

interface ClockButtonProps {
  isClockingIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  pointageLoading?: boolean;
}

export default function ClockButton({
  isClockingIn,
  onClockIn,
  onClockOut,
  pointageLoading = false,
}: ClockButtonProps) {
  return (
    <button
      onClick={isClockingIn ? onClockOut : onClockIn}
      disabled={pointageLoading}
      className="flex items-center gap-6 px-8 py-4 bg-black text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
    >
      {pointageLoading ? (
        <>
          <Loader2 className="animate-spin" size={24} />
          Chargement...
        </>
      ) : (
        <>
          {isClockingIn ? 'Pointer sortie' : 'Pointer entrée'}
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            {isClockingIn ? (
              <Pause size={24} fill="black" />
            ) : (
              <Play size={24} fill="black" />
            )}
          </div>
        </>
      )}
    </button>
  );
}
