export default function HeroHeader({ movieCount, categoryCount }) {
  return (
    <header
      className="text-center relative"
      style={{
        padding: "clamp(32px,6vw,64px) 0 clamp(24px,4vw,40px)",
        borderBottom: "1px solid rgba(0,210,255,0.08)",
        marginBottom: 32,
      }}
    >
      {/* Bottom accent line */}
      <div
        className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[200px] h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--cyber-neon), transparent)",
        }}
      />

      <div
        className="mb-3"
        style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: 11,
          color: "var(--cyber-text-dim)",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          animation: "fadeUp 0.5s ease 0.1s both",
        }}
      >
        ◈ ברוכים הבאים אל ◈
      </div>

      <h1
        className="mb-2 leading-none"
        style={{
          fontFamily: "'Orbitron',sans-serif",
          fontSize: "clamp(36px,8vw,80px)",
          fontWeight: 900,
          letterSpacing: "0.2em",
          background:
            "linear-gradient(135deg, #00d2ff 0%, #0080ff 40%, #00ffcc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "200% auto",
          animation: "flicker 8s infinite, shimmer 4s linear infinite",
        }}
      >
        ZOVEX
      </h1>

      <div
        style={{
          fontFamily: "'Rajdhani',sans-serif",
          fontSize: "clamp(12px,2vw,16px)",
          color: "var(--cyber-text-dim)",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          animation: "fadeUp 0.5s ease 0.3s both",
          marginBottom: movieCount > 0 ? 24 : 0,
        }}
      >
        Cyber Cinema Platform
      </div>

      {/* Stats */}
      {movieCount > 0 && (
        <div
          className="inline-flex items-center gap-6 px-6 py-2 rounded"
          style={{
            background: "rgba(0,210,255,0.04)",
            border: "1px solid rgba(0,210,255,0.1)",
            animation: "fadeUp 0.5s ease 0.4s both",
          }}
        >
          {[
            { label: "סרטים", val: movieCount },
            { label: "קטגוריות", val: categoryCount },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                style={{
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "var(--cyber-neon)",
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: 9,
                  color: "var(--cyber-text-dim)",
                  letterSpacing: "0.1em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}