import { CalendarX } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface AbsencesWeekData {
  jour: string;
  count: number;
  isToday?: boolean;
}

interface AbsencesWeekChartProps {
  data: AbsencesWeekData[];
  total: number;
  evolution: number; // Pourcentage d'évolution vs semaine dernière
}

export default function AbsencesWeekChart({ data, total, evolution }: AbsencesWeekChartProps) {
  // Custom dot pour marquer le jour actuel
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isToday) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#333333"
          stroke="white"
          strokeWidth={2}
        />
      );
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="white"
        stroke="#333333"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(51, 51, 51, 0.1)' }}>
            <CalendarX size={24} style={{ color: '#333333' }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#333333' }}>Absences Semaine</h3>
        </div>
      </div>

      {/* Graphique courbe avec Recharts */}
      <div className="mb-8">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAbsences" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#333333" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#333333" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="jour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999999', fontSize: 12, fontWeight: 500 }}
              style={{ fontFamily: 'inherit' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999999', fontSize: 12 }}
              domain={[0, 'dataMax + 2']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#333333"
              strokeWidth={2.5}
              fill="url(#colorAbsences)"
              dot={<CustomDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total cette semaine:</span>
          <span className="text-lg font-bold" style={{ color: '#333333' }}>{total} absence{total > 1 ? 's' : ''}</span>
        </div>
        {evolution !== 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">vs semaine dernière:</span>
            <span className="text-sm font-bold" style={{ color: evolution < 0 ? '#22c55e' : '#ef4444' }}>
              {evolution > 0 ? '+' : ''}{evolution}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
