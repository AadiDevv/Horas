import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from "recharts";

interface EquipeHeures {
  nom: string;
  heures: number;
  objectif: number;
}

interface HeuresChartProps {
  equipes: EquipeHeures[];
}

export default function HeuresChart({ equipes }: HeuresChartProps) {
  const chartData = equipes.map((equipe) => ({
    ...equipe,
    estAuDessus: equipe.heures >= equipe.objectif,
  }));

  const objectifCommun = equipes.length > 0 ? equipes[0].objectif : 40;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(51, 51, 51, 0.1)" }}
          >
            <TrendingUp size={24} style={{ color: "#333333" }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: "#333333" }}>
            Heures / Semaine
          </h3>
        </div>
      </div>

      <div className="mb-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="nom"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#999999", fontSize: 12, fontWeight: 500 }}
              style={{ fontFamily: "inherit" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#999999", fontSize: 12 }}
              domain={[0, "dataMax + 5"]}
              label={{
                value: "Heures",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#999999", fontSize: 12 },
              }}
            />
            <ReferenceLine
              y={objectifCommun}
              stroke="#999999"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Objectif: ${objectifCommun}h`,
                position: "right",
                fill: "#999999",
                fontSize: 11,
                fontWeight: 500,
              }}
            />
            <Bar dataKey="heures" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.estAuDessus ? "#333333" : "#666666"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#333333" }}
            />
            <span className="text-gray-600">Objectif atteint</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#666666" }}
            />
            <span className="text-gray-600">En dessous objectif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
