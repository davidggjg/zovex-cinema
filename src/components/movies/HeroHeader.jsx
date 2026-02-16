export default function HeroHeader({ movieCount, categoryCount, theme = "dark" }) {
  const isDark = theme === "dark";
  return (
    <header
      className="text-center relative"
      style={{
        padding: "clamp(48px,8vw,80px) 0 clamp(32px,5vw,56px)",
        borderBottom: isDark ? "1px solid rgba(0,210,255,0.08)" : "none",
        marginBottom: isDark ? 32 : 48,
      }}
    >
      {/* Bottom accent line */}
      <div
        className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[200px] h-[2px]"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, var(--cyber-neon), transparent)"
            : "linear-gradient(90deg, transparent, #3b82f6, transparent)",
        }}
      />

      <div
        className="mb-4"
        style={{
          fontFamily: isDark ? "'Share Tech Mono',monospace" : "'Assistant', sans-serif",
          fontSize: isDark ? 11 : 13,
          fontWeight: isDark ? 400 : 500,
          color: isDark ? "var(--cyber-text-dim)" : "#64748B",
          letterSpacing: isDark ? "0.4em" : "0.02em",
          textTransform: isDark ? "uppercase" : "none",
          animation: "fadeUp 0.5s ease 0.1s both",
        }}
      >
        {isDark ? "◈ ברוכים הבאים אל ◈" : "ברוכים הבאים"}
      </div>

      <h1
        className="mb-3 leading-none"
        style={{
          fontFamily: isDark ? "'Orbitron',sans-serif" : "'Assistant', sans-serif",
          fontSize: isDark ? "clamp(36px,8vw,80px)" : "clamp(42px,9vw,72px)",
          fontWeight: isDark ? 900 : 800,
          letterSpacing: isDark ? "0.2em" : "-0.02em",
          background: isDark
            ? "linear-gradient(135deg, #00d2ff 0%, #0080ff 40%, #00ffcc 100%)"
            : "#0F172A",
          WebkitBackgroundClip: isDark ? "text" : "unset",
          WebkitTextFillColor: isDark ? "transparent" : "unset",
          backgroundSize: isDark ? "200% auto" : "unset",
          animation: isDark ? "flicker 8s infinite, shimmer 4s linear infinite" : "fadeUp 0.5s ease 0.2s both",
          color: isDark ? "unset" : "#0F172A",
        }}
      >
        ZOVEX
      </h1>

      <div
        style={{
          fontFamily: isDark ? "'Rajdhani',sans-serif" : "'Assistant', sans-serif",
          fontSize: isDark ? "clamp(12px,2vw,16px)" : "clamp(14px,2.5vw,18px)",
          fontWeight: isDark ? 400 : 400,
          color: isDark ? "var(--cyber-text-dim)" : "#64748B",
          letterSpacing: isDark ? "0.25em" : "0.01em",
          textTransform: isDark ? "uppercase" : "none",
          animation: "fadeUp 0.5s ease 0.3s both",
          marginBottom: movieCount > 0 ? (isDark ? 24 : 40) : 0,
        }}
      >
        {isDark ? "Cyber Cinema Platform" : "פלטפורמת הסינמה שלך"}
      </div>

      {/* Stats */}
      {movieCount > 0 && (
        <div
          className="inline-flex items-center gap-8 px-8 py-3 rounded-2xl"
          style={{
            background: isDark ? "rgba(0,210,255,0.04)" : "#F8FAFC",
            border: isDark ? "1px solid rgba(0,210,255,0.1)" : "1px solid #E2E8F0",
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
                  fontFamily: isDark ? "'Orbitron',sans-serif" : "'Assistant', sans-serif",
                  fontSize: isDark ? 18 : 24,
                  fontWeight: isDark ? 900 : 700,
                  color: isDark ? "var(--cyber-neon)" : "#0F172A",
                  marginBottom: 2,
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontFamily: isDark ? "'Share Tech Mono',monospace" : "'Assistant', sans-serif",
                  fontSize: isDark ? 9 : 13,
                  fontWeight: isDark ? 400 : 500,
                  color: isDark ? "var(--cyber-text-dim)" : "#64748B",
                  letterSpacing: isDark ? "0.1em" : "0",
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