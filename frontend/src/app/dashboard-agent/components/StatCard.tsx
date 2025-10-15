import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor = "text-gray-700" }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-3xl p-8">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        {title}
      </h3>
      <div className="flex items-center gap-4">
        <span className="text-4xl font-semibold">{value}</span>
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
          <Icon size={28} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
