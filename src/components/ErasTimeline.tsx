import panels from "../data/panels.json";
import Avatar from "./Avatar";

export default function ErasTimeline() {
  return (
    <div>
      <div className="eras-grid">
        {panels.panels.map((panel, i) => (
          <div key={panel.label} className="era-card">
            <div className="era-header">
              <span className="era-number">{i + 1}a</span>
              <div>
                <h3 className="era-label">{panel.label}</h3>
                <span className="era-period">{panel.period}</span>
              </div>
            </div>

            <div className="era-members">
              {panel.members.map((name) => (
                <div key={name} className="era-member">
                  <Avatar name={name} size={36} />
                  <span className="era-member-name">{name.split(" ")[0]}</span>
                </div>
              ))}
            </div>

            <p className="era-notes">{panel.notes}</p>
          </div>
        ))}
      </div>

      <div className="timeline-events">
        <h3 className="timeline-title">Linha do Tempo</h3>
        <div className="events-list">
          {panels.events.map((event, i) => (
            <div key={i} className="event-item">
              <div className="event-dot" />
              <div className="event-content">
                <span className="event-date">{event.date}</span>
                <span className="event-text">{event.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .eras-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        .era-card {
          padding: var(--spacing-lg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-surface);
        }
        .era-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: var(--spacing-md);
        }
        .era-number {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-accent);
          line-height: 1;
          margin-top: 2px;
        }
        .era-label {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .era-period {
          font-size: 0.8rem;
          color: var(--color-text-tertiary);
        }
        .era-members {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
        }
        .era-member {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .era-member-name {
          font-size: 0.7rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }
        .era-notes {
          font-size: 0.8rem;
          color: var(--color-text-tertiary);
          line-height: 1.5;
        }
        .timeline-events {
          max-width: 600px;
        }
        .timeline-title {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-md);
        }
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .event-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          position: relative;
        }
        .event-item:not(:last-child)::before {
          content: "";
          position: absolute;
          left: 5px;
          top: 24px;
          bottom: -4px;
          width: 1px;
          background: var(--color-border);
        }
        .event-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 2px solid var(--color-accent);
          background: var(--color-bg);
          flex-shrink: 0;
          margin-top: 3px;
        }
        .event-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .event-date {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .event-text {
          font-size: 0.85rem;
          color: var(--color-text);
        }
        @media (max-width: 768px) {
          .eras-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
