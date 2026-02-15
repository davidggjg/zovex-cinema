export default function EmptyState() {
  return (
    <div
      className="col-span-full flex flex-col items-center justify-center text-center"
      style={{ padding: "80px 20px" }}
    >
      <div
        className="w-[90px] h-[90px] rounded-full flex items-center justify-center mb-5 text-4xl"
        style={{
          background: "rgba(0,210,255,0.04)",
          border: "2px solid rgba(0,210,255,0.1)",
          animation: "glow-pulse 3s ease infinite",
        }}
      >
        ◫
      </div>
      <div
        className="mb-2.5"
        style={{
          fontFamily: "'Orbitron',sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--cyber-text-dim)",
          letterSpacing: "0.2em",
        }}
      >
        הספרייה ריקה
      </div>
      <div
        style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: 11,
          color: "var(--cyber-text-dim)",
          opacity: 0.5,
          lineHeight: 1.8,
        }}
      >
        הוסף סרטים דרך פאנל האדמין
      </div>
    </div>
  );
}