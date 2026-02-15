import { useEffect } from "react";
import GlassPanel from "../cyber/GlassPanel";

export default function VideoModal({ movie, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const embedSrc =
    movie.type === "youtube"
      ? `https://www.youtube.com/embed/${movie.video_id}?autoplay=1&rel=0`
      : `https://drive.google.com/file/d/${movie.video_id}/preview`;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="w-full max-w-[900px]"
        style={{ animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <div
              className="mb-1"
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: "clamp(12px,2vw,16px)",
                fontWeight: 700,
                color: "var(--cyber-neon)",
                letterSpacing: "0.08em",
              }}
            >
              {movie.title}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="rounded px-2.5 py-0.5"
                style={{
                  background: "rgba(0,210,255,0.1)",
                  border: "1px solid rgba(0,210,255,0.25)",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 9,
                  color: "var(--cyber-neon3)",
                  letterSpacing: "0.1em",
                }}
              >
                {movie.category}
              </span>
              <span
                style={{
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 9,
                  color:
                    movie.type === "youtube" ? "#ff4444" : "#4285f4",
                  letterSpacing: "0.12em",
                }}
              >
                {movie.type === "youtube" ? "▶ YOUTUBE" : "☁ DRIVE"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded cursor-pointer transition-all duration-200"
            style={{
              background: "rgba(255,0,60,0.08)",
              border: "1px solid rgba(255,0,60,0.35)",
              color: "#ff003c",
              fontFamily: "'Orbitron',sans-serif",
              fontSize: 13,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,60,0.2)";
              e.currentTarget.style.boxShadow =
                "0 0 16px rgba(255,0,60,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,60,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ✕
          </button>
        </div>

        {/* Player */}
        <GlassPanel style={{ overflow: "hidden", padding: 0 }}>
          <div className="relative" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={embedSrc}
              className="absolute inset-0 w-full h-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title={movie.title}
            />
          </div>
        </GlassPanel>

        {/* ESC hint */}
        <div
          className="text-center mt-2.5 opacity-50"
          style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: 10,
            color: "var(--cyber-text-dim)",
          }}
        >
          לחץ ESC או מחוץ לנגן לסגירה
        </div>
      </div>
    </div>
  );
}