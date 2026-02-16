import { useEffect, useState } from "react";

export default function VideoModal({ movie, onClose }) {
  const [showPlayer, setShowPlayer] = useState(false);

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
      className="fixed inset-0 z-[1000] flex flex-col"
      style={{
        background: "#000",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(0,0,0,0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex items-center gap-4">
          {!showPlayer && (
            <button
              onClick={() => setShowPlayer(true)}
              className="cursor-pointer transition-all duration-200 px-5 py-2.5 rounded-lg flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #ff0050 0%, #ff4080 100%)",
                border: "none",
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.1em",
                boxShadow: "0 4px 20px rgba(255,0,80,0.4)",
              }}
            >
              ▶ PLAY
            </button>
          )}
          <div>
            <div
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}
            >
              {movie.title}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="rounded px-2 py-0.5"
                style={{
                  background: "rgba(0,210,255,0.15)",
                  border: "1px solid rgba(0,210,255,0.3)",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 9,
                  color: "#00d2ff",
                  letterSpacing: "0.1em",
                }}
              >
                {movie.category}
              </span>
              <span
                style={{
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 9,
                  color: movie.type === "youtube" ? "#ff4444" : "#4285f4",
                  letterSpacing: "0.1em",
                }}
              >
                {movie.type === "youtube" ? "▶ YOUTUBE" : "☁ DRIVE"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            fontFamily: "'Orbitron',sans-serif",
            fontSize: 18,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,0,60,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
        >
          ✕
        </button>
      </div>

      {/* Player */}
      <div className="flex-1 relative">
        {showPlayer ? (
          <iframe
            src={embedSrc}
            className="absolute inset-0 w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media"
            title={movie.title}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "#0a0a0a",
            }}
          >
            <div className="text-center">
              <div
                className="mb-4"
                style={{
                  fontSize: 80,
                  opacity: 0.3,
                }}
              >
                ▶
              </div>
              <div
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                לחץ על PLAY כדי להתחיל
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {movie.description && (
        <div
          className="px-6 py-5"
          style={{
            background: "rgba(0,0,0,0.9)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            maxHeight: "25vh",
            overflowY: "auto",
          }}
        >
          <div
            className="mb-2"
            style={{
              fontFamily: "'Orbitron',sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "#00d2ff",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            תיאור
          </div>
          <div
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.8,
            }}
          >
            {movie.description}
          </div>
        </div>
      )}
    </div>
  );
}