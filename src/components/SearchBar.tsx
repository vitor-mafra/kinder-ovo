import { useState, useMemo } from "react";
import rankings from "../data/rankings.json";
import figures from "../data/figures.json";
import Avatar from "./Avatar";

type ResultType = "participant" | "figure";

interface SearchResult {
  type: ResultType;
  name: string;
  detail: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    const matches: SearchResult[] = [];

    for (const r of rankings) {
      if (r.name.toLowerCase().includes(q)) {
        matches.push({
          type: "participant",
          name: r.name,
          detail: `${r.wins} vitórias em ${r.appearances} participações (${r.winRate}%)`,
        });
      }
    }

    for (const f of figures) {
      if (f.name.toLowerCase().includes(q)) {
        matches.push({
          type: "figure",
          name: f.name,
          detail: `${f.count} ${f.count === 1 ? "aparição" : "aparições"} no Kinder Ovo`,
        });
      }
      if (matches.length >= 12) break;
    }

    return matches.slice(0, 12);
  }, [query]);

  const show = focused && query.length >= 2;

  return (
    <div className="search-wrapper">
      <div className="search-box">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Buscar participante ou figura pública..."
          className="search-field"
        />
      </div>

      {show && results.length > 0 && (
        <div className="search-results">
          {results.map((r) => (
            <div key={`${r.type}-${r.name}`} className="search-result-item">
              <div className="result-left">
                {r.type === "participant" ? (
                  <Avatar name={r.name} size={28} />
                ) : (
                  <div className="figure-icon">FP</div>
                )}
                <div>
                  <div className="result-name">{r.name}</div>
                  <div className="result-detail">{r.detail}</div>
                </div>
              </div>
              <span className="result-badge">
                {r.type === "participant" ? "Participante" : "Figura pública"}
              </span>
            </div>
          ))}
        </div>
      )}

      {show && results.length === 0 && (
        <div className="search-results">
          <div style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--color-text-tertiary)" }}>
            Nenhum resultado para "{query}"
          </div>
        </div>
      )}

      <style>{`
        .search-wrapper {
          position: relative;
          max-width: 480px;
          margin: 0 auto;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-surface);
          transition: border-color 0.15s;
        }
        .search-box:focus-within {
          border-color: var(--color-accent);
        }
        .search-field {
          all: unset;
          flex: 1;
          font-size: 0.9rem;
          font-family: var(--font-sans);
          color: var(--color-text);
        }
        .search-field::placeholder {
          color: var(--color-text-tertiary);
        }
        .search-results {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          z-index: 50;
          max-height: 360px;
          overflow-y: auto;
        }
        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          cursor: default;
          transition: background 0.1s;
        }
        .search-result-item:hover {
          background: var(--color-bg-alt);
        }
        .result-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .result-name {
          font-size: 0.85rem;
          font-weight: 500;
        }
        .result-detail {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }
        .result-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--color-bg-alt);
          color: var(--color-text-secondary);
          white-space: nowrap;
        }
        .figure-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-bg-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 600;
          color: var(--color-text-tertiary);
        }
      `}</style>
    </div>
  );
}
