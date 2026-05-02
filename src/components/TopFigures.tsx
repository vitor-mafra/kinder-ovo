import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import figures from "../data/figures.json";

export default function TopFigures() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return figures.slice(0, 20);
    const q = query.toLowerCase();
    return figures.filter((f) => f.name.toLowerCase().includes(q));
  }, [query]);

  const chartData = figures.slice(0, 12);

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#6b6560" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#1a1a1a" }}
            axisLine={false}
            tickLine={false}
            width={160}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e0db",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value: number) => [`${value} aparições`, "Total"]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={i < 3 ? "#8B3A3A" : i < 6 ? "#a8524f" : "#c9a09e"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: "var(--spacing-xl)" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar figura pública..."
          className="search-input"
        />

        <div className="figures-list">
          {filtered.map((f, i) => (
            <div key={f.name} className="figure-item">
              <span className="figure-rank">{i + 1}</span>
              <span className="figure-name">{f.name}</span>
              <span className="figure-count">
                {f.count} {f.count === 1 ? "vez" : "vezes"}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: "var(--color-text-tertiary)", fontSize: "0.85rem", padding: "12px 0" }}>
              Nenhuma figura pública encontrada.
            </p>
          )}
        </div>
      </div>

      <style>{`
        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 10px 14px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-family: var(--font-sans);
          color: var(--color-text);
          background: var(--color-surface);
          outline: none;
          transition: border-color 0.15s;
          margin-bottom: var(--spacing-md);
        }
        .search-input:focus {
          border-color: var(--color-accent);
        }
        .search-input::placeholder {
          color: var(--color-text-tertiary);
        }
        .figures-list {
          display: flex;
          flex-direction: column;
        }
        .figure-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--color-border-light);
          font-size: 0.85rem;
        }
        .figure-item:last-child {
          border-bottom: none;
        }
        .figure-rank {
          width: 28px;
          text-align: right;
          color: var(--color-text-tertiary);
          font-size: 0.8rem;
          font-variant-numeric: tabular-nums;
        }
        .figure-name {
          flex: 1;
          font-weight: 500;
        }
        .figure-count {
          color: var(--color-text-secondary);
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
