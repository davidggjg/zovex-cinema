export default function CategoryFilters({
  categories,
  activeCategory,
  onSelect,
  movieCounts,
  totalCount,
  theme = "dark",
}) {
  if (!categories.length) return null;

  const allCategories = ["הכל", ...categories];
  const isDark = theme === "dark";

  return (
    <div
      className="flex gap-2 flex-wrap justify-center mb-9"
      style={{ animation: "fadeUp 0.5s ease 0.6s both" }}
    >
      {allCategories.map((cat, i) => {
        const isActive = activeCategory === cat;
        const count = cat === "הכל" ? totalCount : (movieCounts[cat] || 0);

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="cursor-pointer transition-all duration-200"
            style={{
              background: isDark
                ? (isActive ? "linear-gradient(135deg, rgba(0,210,255,0.2), rgba(0,128,255,0.15))" : "rgba(0,0,0,0.4)")
                : (isActive ? "#3b82f6" : "#F8FAFC"),
              border: isDark
                ? `1px solid ${isActive ? "rgba(0,210,255,0.6)" : "rgba(0,210,255,0.15)"}`
                : `1px solid ${isActive ? "#3b82f6" : "#E2E8F0"}`,
              borderRadius: isDark ? 4 : 8,
              color: isDark
                ? (isActive ? "var(--cyber-neon)" : "var(--cyber-text-dim)")
                : (isActive ? "#FFFFFF" : "#64748B"),
              fontFamily: isDark ? "'Orbitron',sans-serif" : "'Assistant', sans-serif",
              fontSize: isDark ? 9 : 13,
              fontWeight: isDark ? 400 : 500,
              letterSpacing: isDark ? "0.12em" : "0",
              textTransform: isDark ? "uppercase" : "none",
              padding: isDark ? "7px 16px" : "8px 16px",
              boxShadow: isActive && isDark
                ? "0 0 16px rgba(0,210,255,0.25)"
                : "none",
              animation: `fadeUp 0.4s ease ${i * 0.04}s both`,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                if (isDark) {
                  e.currentTarget.style.borderColor = "rgba(0,210,255,0.35)";
                  e.currentTarget.style.color = "var(--cyber-text)";
                } else {
                  e.currentTarget.style.background = "#EFF6FF";
                  e.currentTarget.style.borderColor = "#93C5FD";
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                if (isDark) {
                  e.currentTarget.style.borderColor = "rgba(0,210,255,0.15)";
                  e.currentTarget.style.color = "var(--cyber-text-dim)";
                } else {
                  e.currentTarget.style.background = "#F8FAFC";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }
              }
            }}
          >
            {cat}
            <span
              className="mr-1.5 opacity-60"
              style={{
                fontFamily: isDark ? "'Share Tech Mono',monospace" : "'Assistant', sans-serif",
                fontSize: isDark ? 8 : 12,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}