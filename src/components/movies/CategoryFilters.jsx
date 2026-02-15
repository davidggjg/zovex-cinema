export default function CategoryFilters({
  categories,
  activeCategory,
  onSelect,
  movieCounts,
  totalCount,
}) {
  if (!categories.length) return null;

  const allCategories = ["הכל", ...categories];

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
              background: isActive
                ? "linear-gradient(135deg, rgba(0,210,255,0.2), rgba(0,128,255,0.15))"
                : "rgba(0,0,0,0.4)",
              border: `1px solid ${isActive ? "rgba(0,210,255,0.6)" : "rgba(0,210,255,0.15)"}`,
              borderRadius: 4,
              color: isActive ? "var(--cyber-neon)" : "var(--cyber-text-dim)",
              fontFamily: "'Orbitron',sans-serif",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "7px 16px",
              boxShadow: isActive
                ? "0 0 16px rgba(0,210,255,0.25)"
                : "none",
              animation: `fadeUp 0.4s ease ${i * 0.04}s both`,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "rgba(0,210,255,0.35)";
                e.currentTarget.style.color = "var(--cyber-text)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "rgba(0,210,255,0.15)";
                e.currentTarget.style.color = "var(--cyber-text-dim)";
              }
            }}
          >
            {cat}
            <span
              className="mr-1.5 opacity-60"
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: 8,
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