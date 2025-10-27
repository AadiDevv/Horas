import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  showGreenDot?: boolean;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  showGreenDot = false,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center" style={{ backgroundColor: 'rgba(51, 51, 51, 0.1)' }}>
          <Icon size={24} style={{ color: '#333333' }} />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          {showGreenDot && (
            <div className="relative flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="absolute w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
          )}
          <span className="text-4xl font-bold" style={{ color: '#333333' }}>{value}</span>
        </div>
        {subtitle && (
          <span className="text-sm text-gray-500 mt-1">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
