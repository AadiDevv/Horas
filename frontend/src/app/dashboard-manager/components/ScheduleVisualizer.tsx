import { Clock } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { Schedule } from '../types';
import {
  CLOCK_CONFIG,
  DURATION_COLOR_THRESHOLDS,
  DURATION_COLORS
} from '../constants/schedule';

interface ScheduleVisualizerProps {
  schedule: Schedule;
}

export default function ScheduleVisualizer({ schedule }: ScheduleVisualizerProps) {
  // Calcul durée
  const [startH, startM] = schedule.startHour.split(':').map(Number);
  const [endH, endM] = schedule.endHour.split(':').map(Number);
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  // Conversion des angles pour l'horloge
  const timeToAngle = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m;
    return (totalMinutes / (12 * 60)) * 360 - 90;
  };

  const startAngle = timeToAngle(schedule.startHour);
  const endAngle = timeToAngle(schedule.endHour);

  // Calcul arc SVG
  const { radius, centerX, centerY } = CLOCK_CONFIG;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const targetStartX = centerX + radius * Math.cos(startRad);
  const targetStartY = centerY + radius * Math.sin(startRad);
  const targetEndX = centerX + radius * Math.cos(endRad);
  const targetEndY = centerY + radius * Math.sin(endRad);

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  // Couleur dynamique basée sur la durée
  const getColorFromDuration = () => {
    if (hours >= DURATION_COLOR_THRESHOLDS.long) return DURATION_COLORS.long;
    if (hours >= DURATION_COLOR_THRESHOLDS.medium) return DURATION_COLORS.medium;
    return DURATION_COLORS.short;
  };

  const arcColor = getColorFromDuration();

  // Animation springs pour les coordonnées
  const animatedStartX = useSpring(targetStartX, { stiffness: 100, damping: 20 });
  const animatedStartY = useSpring(targetStartY, { stiffness: 100, damping: 20 });
  const animatedEndX = useSpring(targetEndX, { stiffness: 100, damping: 20 });
  const animatedEndY = useSpring(targetEndY, { stiffness: 100, damping: 20 });

  // Mettre à jour les springs quand les valeurs changent
  useEffect(() => {
    animatedStartX.set(targetStartX);
    animatedStartY.set(targetStartY);
    animatedEndX.set(targetEndX);
    animatedEndY.set(targetEndY);
  }, [targetStartX, targetStartY, targetEndX, targetEndY, animatedStartX, animatedStartY, animatedEndX, animatedEndY]);

  // Transformer les motion values en path string
  const pathD = useTransform(
    [animatedStartX, animatedStartY, animatedEndX, animatedEndY],
    ([sX, sY, eX, eY]: number[]) => `M ${sX} ${sY} A ${radius} ${radius} 0 ${largeArc} 1 ${eX} ${eY}`
  );

  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 overflow-hidden">
      {/* Effet de profondeur subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/30 pointer-events-none" />

      <div className="relative">
        {/* Horloge responsive */}
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <div className="relative">
            <svg
              width="160"
              height="160"
              viewBox="0 0 180 180"
              className="relative md:w-[180px] md:h-[180px]"
            >
              <defs>
                <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f9fafb" />
                  <stop offset="100%" stopColor="#f3f4f6" />
                </linearGradient>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <motion.stop
                    offset="0%"
                    stopColor={arcColor}
                    stopOpacity="1"
                    initial={false}
                    animate={{ stopColor: arcColor }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                  <motion.stop
                    offset="100%"
                    stopColor={arcColor}
                    stopOpacity="0.85"
                    initial={false}
                    animate={{ stopColor: arcColor }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </linearGradient>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="url(#trackGradient)"
                strokeWidth={CLOCK_CONFIG.strokeWidth}
              />

              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth={CLOCK_CONFIG.strokeWidth}
                strokeLinecap="round"
                filter="url(#softGlow)"
              />

              <motion.circle
                cx={animatedStartX}
                cy={animatedStartY}
                r={CLOCK_CONFIG.pointRadius}
                fill={arcColor}
                opacity="0.6"
                initial={false}
                animate={{ fill: arcColor }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
              <motion.circle
                cx={animatedEndX}
                cy={animatedEndY}
                r={CLOCK_CONFIG.pointRadius}
                fill={arcColor}
                initial={false}
                animate={{ fill: arcColor }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />

              <g transform={`translate(${centerX}, ${centerY})`}>
                <motion.circle
                  cx="0"
                  cy="0"
                  r={CLOCK_CONFIG.glowRadius}
                  fill={arcColor}
                  opacity="0.1"
                  initial={false}
                  animate={{ fill: arcColor }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="0"
                  cy="0"
                  r={CLOCK_CONFIG.centerCircleRadius}
                  fill={arcColor}
                  initial={false}
                  animate={{ fill: arcColor }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
                <Clock size={20} color="white" x="-10" y="-10" strokeWidth={2.5} />
              </g>
            </svg>
          </div>
        </div>

        {/* Heures - responsive minimal */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Début</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">{schedule.startHour.split(':')[0]}</span>
              <span className="text-xl font-medium text-gray-400">:{schedule.startHour.split(':')[1]}</span>
            </div>
          </div>

          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 10h10M10 5l5 5-5 5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Fin</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">{schedule.endHour.split(':')[0]}</span>
              <span className="text-xl font-medium text-gray-400">:{schedule.endHour.split(':')[1]}</span>
            </div>
          </div>
        </div>

        {/* Barre TRÈS épurée avec répartition homogène */}
        <div className="bg-white border border-gray-100 rounded-2xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-evenly">
          {/* Par jour */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Par jour</span>
            <span className="text-lg font-bold tracking-tight ml-2">
              {hours}<span className="text-sm text-gray-400">h</span>
              {minutes > 0 && <span className="text-sm text-gray-400">{minutes.toString().padStart(2, '0')}</span>}
            </span>
          </div>

          {/* Séparateur vertical */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Par semaine */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Par semaine</span>
            <span className="text-lg font-bold tracking-tight ml-2">
              {Math.round((durationMinutes / 60) * schedule.activeDays.length * 10) / 10}
              <span className="text-sm text-gray-400">h</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
