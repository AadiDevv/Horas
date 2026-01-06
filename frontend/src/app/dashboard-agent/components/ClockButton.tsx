import { Play, Pause, Loader2 } from "lucide-react";

interface ClockButtonProps {
  isClockingIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  pointageLoading?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export default function ClockButton({
  isClockingIn,
  onClockIn,
  onClockOut,
  pointageLoading = false,
  successMessage = '',
  errorMessage = ''
}: ClockButtonProps) {
  return (
    <div className="flex flex-col items-end gap-3">
      {successMessage && (
        <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

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
    </div>
  );
}
