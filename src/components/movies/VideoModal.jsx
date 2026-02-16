import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function VideoModal({ movie, onClose }) {
  const [showPlayer, setShowPlayer] = useState(true);

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

  const getEmbedSrc = () => {
    switch (movie.type) {
      case "youtube":
        return `https://www.youtube.com/embed/${movie.video_id}?autoplay=1&rel=0&cc_load_policy=0`;
      case "drive":
        return `https://drive.google.com/file/d/${movie.video_id}/preview`;
      case "vimeo":
        return `https://player.vimeo.com/video/${movie.video_id}?autoplay=1`;
      case "dailymotion":
        return `https://www.dailymotion.com/embed/video/${movie.video_id}?autoplay=1`;
      case "streamable":
        return `https://streamable.com/e/${movie.video_id}?autoplay=1`;
      case "archive":
        return `https://archive.org/embed/${movie.video_id}`;
      default:
        return "";
    }
  };
  
  const embedSrc = getEmbedSrc();

  // Fetch episodes if this is a series
  const { data: episodes = [] } = useQuery({
    queryKey: ['episodes', movie.series_name],
    queryFn: () => base44.entities.Movie.filter({ series_name: movie.series_name }, 'episode_number'),
    enabled: !!movie.series_name,
  });

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col"
      style={{
        background: "#141414",
      }}
    >
      {/* Close Button - Top Right */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[1001] flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200"
        style={{
          background: "rgba(20,20,20,0.7)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          fontSize: 20,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(20,20,20,0.7)";
        }}
      >
        ✕
      </button>

      {/* Player */}
      <div 
        className="w-full"
        style={{
          aspectRatio: "16/9",
          background: "#000",
        }}
      >
        <iframe
          src={embedSrc}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media"
          title={movie.title}
        />
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-y-auto px-8 py-6"
        style={{
          background: "#141414",
        }}
      >
        {/* Title and Info */}
        <div className="mb-6">
          <h1
            className="mb-3"
            style={{
              fontFamily: "'Orbitron',sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "white",
            }}
          >
            {movie.title}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span
              className="rounded px-2 py-1"
              style={{
                background: "rgba(255,255,255,0.1)",
                fontFamily: "'Rajdhani',sans-serif",
                fontSize: 12,
                color: "#ffffff",
              }}
            >
              {movie.category}
            </span>
            {movie.series_name && (
              <span
                style={{
                  fontFamily: "'Rajdhani',sans-serif",
                  fontSize: 12,
                  color: "#888",
                }}
              >
                {movie.series_name} • פרק {movie.episode_number}
              </span>
            )}
          </div>

          {movie.description && (
            <p
              style={{
                fontFamily: "'Rajdhani',sans-serif",
                fontSize: 15,
                color: "#ffffff",
                lineHeight: 1.6,
                maxWidth: 800,
              }}
            >
              {movie.description}
            </p>
          )}
        </div>

        {/* Episodes Section */}
        {episodes.length > 0 && (
          <div>
            <h2
              className="mb-4"
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "white",
              }}
            >
              פרקים
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    window.location.reload();
                    setTimeout(() => {
                      const event = new CustomEvent('playMovie', { detail: ep });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                  className="flex gap-4 p-3 rounded transition-all duration-200 cursor-pointer text-right"
                  style={{
                    background: ep.id === movie.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                    border: ep.id === movie.id ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = ep.id === movie.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)";
                  }}
                >
                  {ep.thumbnail_url && (
                    <img
                      src={ep.thumbnail_url}
                      alt={ep.title}
                      className="w-32 h-18 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className="flex items-center gap-2 mb-1"
                      style={{
                        fontFamily: "'Orbitron',sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      <span>{ep.episode_number}.</span>
                      <span className="truncate">{ep.title}</span>
                    </div>
                    {ep.description && (
                      <p
                        className="line-clamp-2"
                        style={{
                          fontFamily: "'Rajdhani',sans-serif",
                          fontSize: 13,
                          color: "#aaa",
                          lineHeight: 1.4,
                        }}
                      >
                        {ep.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}