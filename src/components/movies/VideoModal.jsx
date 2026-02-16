import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function VideoModal({ movie, onClose }) {
  const [currentMovie, setCurrentMovie] = useState(movie);
  const [selectedSeason, setSelectedSeason] = useState(movie.season_number || 1);

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
    switch (currentMovie.type) {
      case "youtube":
        return `https://www.youtube.com/embed/${currentMovie.video_id}?autoplay=1&rel=0&cc_load_policy=0`;
      case "drive":
        return `https://drive.google.com/file/d/${currentMovie.video_id}/preview`;
      case "vimeo":
        return `https://player.vimeo.com/video/${currentMovie.video_id}?autoplay=1`;
      case "dailymotion":
        return `https://www.dailymotion.com/embed/video/${currentMovie.video_id}?autoplay=1`;
      case "streamable":
        return `https://streamable.com/e/${currentMovie.video_id}?autoplay=1`;
      case "archive":
        return `https://archive.org/embed/${currentMovie.video_id}`;
      default:
        return "";
    }
  };
  
  const embedSrc = getEmbedSrc();

  // Fetch all episodes if this is a series
  const { data: allEpisodes = [] } = useQuery({
    queryKey: ['episodes', movie.series_name],
    queryFn: () => base44.entities.Movie.filter({ series_name: movie.series_name }, 'season_number,episode_number'),
    enabled: !!movie.series_name,
  });

  // Get unique seasons
  const seasons = [...new Set(allEpisodes.map(ep => ep.season_number))].filter(Boolean).sort((a, b) => a - b);
  
  // Filter episodes by selected season
  const episodes = allEpisodes.filter(ep => ep.season_number === selectedSeason);

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
          key={currentMovie.id}
          src={embedSrc}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media"
          title={currentMovie.title}
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
            {currentMovie.title}
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
              {currentMovie.category}
            </span>
            {currentMovie.series_name && (
              <span
                style={{
                  fontFamily: "'Rajdhani',sans-serif",
                  fontSize: 12,
                  color: "#888",
                }}
              >
                {currentMovie.series_name}
                {currentMovie.season_number && ` • עונה ${currentMovie.season_number}`}
                {currentMovie.episode_number && ` • פרק ${currentMovie.episode_number}`}
              </span>
            )}
          </div>

          {currentMovie.description && (
            <p
              style={{
                fontFamily: "'Rajdhani',sans-serif",
                fontSize: 15,
                color: "#ffffff",
                lineHeight: 1.6,
                maxWidth: 800,
              }}
            >
              {currentMovie.description}
            </p>
          )}
        </div>

        {/* Series Section */}
        {movie.series_name && allEpisodes.length > 0 && (
          <div>
            {/* Season Selector */}
            {seasons.length > 1 && (
              <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {seasons.map((season) => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className="shrink-0 px-4 py-2 rounded transition-all duration-200 cursor-pointer"
                      style={{
                        background: selectedSeason === season 
                          ? "rgba(255,255,255,0.2)" 
                          : "rgba(255,255,255,0.05)",
                        border: selectedSeason === season 
                          ? "1px solid rgba(255,255,255,0.4)" 
                          : "1px solid rgba(255,255,255,0.1)",
                        fontFamily: "'Orbitron',sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSeason !== season) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSeason !== season) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        }
                      }}
                    >
                      עונה {season}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes List */}
            <h2
              className="mb-4"
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "white",
              }}
            >
              {seasons.length > 1 ? `עונה ${selectedSeason}` : "פרקים"}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setCurrentMovie(ep)}
                  className="flex gap-4 p-3 rounded transition-all duration-200 cursor-pointer text-right"
                  style={{
                    background: ep.id === currentMovie.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                    border: ep.id === currentMovie.id ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = ep.id === currentMovie.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)";
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