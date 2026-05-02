import { useState } from "react";
import rankings from "../data/rankings.json";
import Avatar from "./Avatar";

type SortKey = "wins" | "winRate" | "appearances" | "name";
type SortDir = "asc" | "desc";

const mainPanelists = rankings.filter((r) => r.isMainPanelist);
const guests = rankings.filter((r) => !r.isMainPanelist && r.wins > 0);

export default function RankingTable() {
  const [sortKey, setSortKey] = useState<SortKey>("wins");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showGuests, setShowGuests] = useState(false);

  const toggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sorted = [...mainPanelists].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string")
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === "asc"
      ? (av as number) - (bv as number)
      : (bv as number) - (av as number);
  });

  const medal = (i: number) => {
    if (sortKey !== "wins" || sortDir !== "desc") return null;
    if (i === 0) return <span style={{ color: "var(--color-gold)" }}>1o</span>;
    if (i === 1) return <span style={{ color: "var(--color-silver)" }}>2o</span>;
    if (i === 2) return <span style={{ color: "var(--color-bronze)" }}>3o</span>;
    return <span style={{ color: "var(--color-text-tertiary)" }}>{i + 1}o</span>;
  };

  const headerBtn = (key: SortKey, label: string) => (
    <button
      onClick={() => toggle(key)}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: sortKey === key ? "var(--color-accent)" : "var(--color-text-secondary)",
      }}
    >
      {label}
      {sortKey === key && (
        <span style={{ fontSize: "0.6rem" }}>{sortDir === "desc" ? "▼" : "▲"}</span>
      )}
    </button>
  );

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table className="ranking-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: "center" }}>#</th>
              <th>{headerBtn("name", "Participante")}</th>
              <th style={{ textAlign: "right" }}>{headerBtn("appearances", "Participações")}</th>
              <th style={{ textAlign: "right" }}>{headerBtn("wins", "Vitórias")}</th>
              <th style={{ textAlign: "right" }}>{headerBtn("winRate", "Taxa")}</th>
              <th style={{ width: 160 }}>
                <span className="th-label">Desempenho</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.name}>
                <td style={{ textAlign: "center", fontWeight: 600, fontSize: "0.85rem" }}>
                  {medal(i) ?? `${i + 1}o`}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={r.name} size={32} />
                    <span style={{ fontWeight: 500 }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {r.appearances}
                </td>
                <td style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {r.wins}
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {r.winRate}%
                </td>
                <td>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "var(--color-bg-alt)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${r.winRate}%`,
                        borderRadius: 3,
                        backgroundColor: "var(--color-accent)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {guests.length > 0 && (
        <div style={{ marginTop: "var(--spacing-lg)" }}>
          <button
            onClick={() => setShowGuests(!showGuests)}
            style={{
              all: "unset",
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "var(--color-accent)",
              fontWeight: 500,
            }}
          >
            {showGuests ? "Ocultar convidados" : `Ver convidados que venceram (${guests.length})`}
          </button>

          {showGuests && (
            <table className="ranking-table" style={{ marginTop: "var(--spacing-md)" }}>
              <tbody>
                {guests.map((r) => (
                  <tr key={r.name}>
                    <td style={{ width: 40 }} />
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={r.name} size={28} />
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>{r.appearances}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{r.wins}</td>
                    <td style={{ textAlign: "right" }}>{r.winRate}%</td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style>{`
        .ranking-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .ranking-table th {
          padding: 10px 12px;
          border-bottom: 2px solid var(--color-border);
          text-align: left;
          white-space: nowrap;
        }
        .ranking-table .th-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-text-secondary);
        }
        .ranking-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--color-border-light);
          vertical-align: middle;
        }
        .ranking-table tbody tr:hover {
          background: var(--color-accent-bg);
        }
        @media (max-width: 640px) {
          .ranking-table th:nth-child(3),
          .ranking-table td:nth-child(3),
          .ranking-table th:nth-child(6),
          .ranking-table td:nth-child(6) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
