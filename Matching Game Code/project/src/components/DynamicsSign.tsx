const extrusion = `
  2px 2px 0 hsl(16, 58%, 36%),
  4px 4px 0 hsl(16, 55%, 30%),
  6px 6px 0 hsl(16, 52%, 24%),
  8px 8px 0 hsl(16, 50%, 18%),
  10px 10px 12px rgba(0,0,0,0.55)
`.trim();

const lineStyle = {
  fontFamily: "'Fredoka One', cursive",
  color: "hsl(20, 66%, 52%)",
  textShadow: extrusion,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  lineHeight: 1.05,
  userSelect: "none" as const,
};

export function DynamicsSign({ className = "" }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <div style={{ ...lineStyle, fontSize: "clamp(2.6rem, 7vw, 5rem)" }}>
        Dynamics
      </div>
      <div style={{ ...lineStyle, fontSize: "clamp(2.1rem, 5.5vw, 4rem)" }}>
        Agents
      </div>
    </div>
  );
}
