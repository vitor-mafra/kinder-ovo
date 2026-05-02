import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import timeline from "../data/timeline.json";

const COLORS: Record<string, string> = {
  "José Roberto de Toledo": "#3d5a80",
  "Fernando de Barros e Silva": "#4a6741",
  "Malu Gaspar": "#7a4988",
  "Thaís Bilenky": "#c27830",
  "Celso Rocha de Barros": "#2a7a6d",
  "Ana Clara Costa": "#b05574",
};

type Mode = "year" | "cumulative";

export default function WinTimeline() {
  const [mode, setMode] = useState<Mode>("year");

  const source = mode === "year" ? timeline.byYear : timeline.cumulative;
  const chartData = source.years.map((year, i) => {
    const point: Record<string, number | string> = { year: String(year) };
    for (const series of source.series) {
      point[series.name] = series.data[i];
    }
    return point;
  });

  return (
    <div>
      <div className="mode-toggle">
        <button
          className={`toggle-btn ${mode === "year" ? "active" : ""}`}
          onClick={() => setMode("year")}
        >
          Por ano
        </button>
        <button
          className={`toggle-btn ${mode === "cumulative" ? "active" : ""}`}
          onClick={() => setMode("cumulative")}
        >
          Acumulado
        </button>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: "#6b6560" }}
            axisLine={{ stroke: "#e5e0db" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b6560" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e0db",
              borderRadius: 8,
              fontSize: 13,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          {source.series.map((s) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={COLORS[s.name] || "#888"}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS[s.name] || "#888" }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <style>{`
        .mode-toggle {
          display: flex;
          gap: 4px;
          margin-bottom: var(--spacing-lg);
          background: var(--color-bg-alt);
          border-radius: var(--radius-md);
          padding: 3px;
          width: fit-content;
        }
        .toggle-btn {
          all: unset;
          padding: 6px 16px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .toggle-btn:hover {
          color: var(--color-text);
        }
        .toggle-btn.active {
          background: var(--color-surface);
          color: var(--color-text);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
      `}</style>
    </div>
  );
}
