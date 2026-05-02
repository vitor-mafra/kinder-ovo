const COLORS: Record<string, string> = {
  "Fernando de Barros e Silva": "#4a6741",
  "José Roberto de Toledo": "#3d5a80",
  "Malu Gaspar": "#7a4988",
  "Thaís Bilenky": "#c27830",
  "Ana Clara Costa": "#b05574",
  "Celso Rocha de Barros": "#2a7a6d",
};

function getInitials(name: string): string {
  const parts = name.split(" ").filter(p => p.length > 2 || p[0] === p[0].toUpperCase());
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColor(name: string): string {
  if (COLORS[name]) return COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 35%, 45%)`;
}

interface Props {
  name: string;
  size?: number;
}

export default function Avatar({ name, size = 40 }: Props) {
  const bg = getColor(name);
  const initials = getInitials(name);
  const fontSize = size * 0.38;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: "#fff",
          fontSize,
          fontWeight: 600,
          letterSpacing: "0.02em",
          fontFamily: "var(--font-sans)",
        }}
      >
        {initials}
      </span>
    </div>
  );
}
