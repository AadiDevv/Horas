import { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  bgGradient?: string;
}

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-gray-700",
  bgGradient = "from-gray-100 to-gray-200"
}: DashboardStatCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-4xl font-semibold">{value}</span>
        <div className={`w-16 h-16 bg-gradient-to-br ${bgGradient} rounded-2xl flex items-center justify-center`}>
          <Icon size={28} className={iconColor} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
