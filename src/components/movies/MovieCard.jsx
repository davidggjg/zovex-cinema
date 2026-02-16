import { useState } from "react";

export default function MovieCard({ movie, index, onClick, theme = "dark" }) {
  const [hovered, setHovered] = useState(false);
  const isDark = theme === "dark";

  const thumb =
    movie.type === "youtube"
      ? `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`
      : movie.thumbnail_url || null;

  return (
    <div
      onClick={() => onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer overflow-hidden"
      style={{
        background: isDark
          ? hovered
            ? "linear-gradient(135deg, rgba(0,210,255,0.1) 0%, rgba(0,128,255,0.06) 100%)"
            : "linear-gradient(135deg, rgba(0,210,255,0.04) 0%, rgba(0,0,0,0.4) 100%)"
          : "#FFFFFF",
        border: isDark
          ? `1px solid ${hovered ? "rgba(0,210,255,0.45)" : "rgba(0,210,255,0.1)"}`
          : `1px solid ${hovered ? "#CBD5E1" : "#E2E8F0"}`,
        borderRadius: isDark ? 8 : 16,
        transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? (isDark ? "translateY(-6px) scale(1.02)" : "translateY(-4px)") : "none",
        boxShadow: isDark
          ? hovered
            ? "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,210,255,0.15)"
            : "0 4px 20px rgba(0,0,0,0.5)"
          : hovered
            ? "0 20px 40px rgba(0,0,0,0.12)"
            : "0 4px 12px rgba(0,0,0,0.06)",
        animation: `fadeUp 0.5s ease ${index * 0.06}s both`,
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ paddingTop: "56.25%" }}>
        {thumb ? (
          <img
            src={thumb}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-400"
            style={{
              filter: hovered
                ? "brightness(0.85) saturate(1.2)"
                : "brightness(0.6) saturate(0.8)",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
            style={{
              background: "linear-gradient(135deg, #0d1520, #060c14)",
            }}
          >
            <div className="text-[32px] opacity-40">☁</div>
            <div
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 8,
                color: "var(--cyber-text-dim)",
                letterSpacing: "0.15em",
              }}
            >
              GOOGLE DRIVE
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, transparent 30%, rgba(4,6,8,0.95) 100%)"
              : "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        {/* Play button */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-250"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: isDark ? "rgba(0,210,255,0.15)" : "rgba(255,255,255,0.95)",
              border: isDark ? "2px solid rgba(0,210,255,0.6)" : "2px solid #0F172A",
              boxShadow: isDark ? "0 0 30px rgba(0,210,255,0.4)" : "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <span
              className="mr-[-2px]"
              style={{ color: isDark ? "var(--cyber-neon)" : "#0F172A", fontSize: 20 }}
            >
              ▶
            </span>
          </div>
        </div>

        {/* Type badge */}
        <div
          className="absolute top-2 left-2 rounded px-2 py-0.5"
          style={{
            background:
              movie.type === "youtube"
                ? "rgba(255,0,0,0.2)"
                : "rgba(66,133,244,0.2)",
            border: `1px solid ${movie.type === "youtube" ? "rgba(255,68,68,0.5)" : "rgba(66,133,244,0.5)"}`,
            fontFamily: "'Orbitron',sans-serif",
            fontSize: 8,
            color: movie.type === "youtube" ? "#ff6666" : "#4da3ff",
            letterSpacing: "0.12em",
          }}
        >
          {movie.type === "youtube" ? "▶ YT" : "☁ DRIVE"}
        </div>
      </div>

      {/* Card info */}
      <div className="p-4 pb-4">
        <div
          className="mb-1.5 transition-colors duration-200"
          style={{
            fontFamily: isDark ? "'Rajdhani',sans-serif" : "'Assistant', sans-serif",
            fontWeight: isDark ? 700 : 600,
            fontSize: isDark ? 14 : 16,
            color: isDark ? (hovered ? "white" : "var(--cyber-text)") : "#0F172A",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {movie.title}
        </div>
        {movie.description && (
          <div
            className="mb-2.5"
            style={{
              fontFamily: isDark ? "'Share Tech Mono',monospace" : "'Assistant', sans-serif",
              fontSize: isDark ? 10 : 13,
              fontWeight: isDark ? 400 : 400,
              color: isDark ? "var(--cyber-text-dim)" : "#64748B",
              opacity: isDark ? 0.6 : 0.9,
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {movie.description}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-3 py-1"
            style={{
              background: isDark ? "rgba(0,210,255,0.08)" : "#F1F5F9",
              border: isDark ? "1px solid rgba(0,210,255,0.2)" : "1px solid #E2E8F0",
              fontFamily: isDark ? "'Orbitron',sans-serif" : "'Assistant', sans-serif",
              fontSize: isDark ? 8 : 12,
              fontWeight: isDark ? 400 : 500,
              color: isDark ? "var(--cyber-neon3)" : "#475569",
              letterSpacing: isDark ? "0.1em" : "0",
            }}
          >
            {movie.category}
          </span>
          <span
            style={{
              fontFamily: isDark ? "'Share Tech Mono',monospace" : "'Assistant', sans-serif",
              fontSize: isDark ? 9 : 12,
              fontWeight: isDark ? 400 : 400,
              color: isDark ? "var(--cyber-text-dim)" : "#94A3B8",
            }}
          >
            {new Date(movie.created_date).toLocaleDateString("he-IL")}
          </span>
        </div>
      </div>
    </div>
  );
}