import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";

export default function VideoModal({ movie, onClose }) {
  const [currentMovie, setCurrentMovie] = useState(movie);
  const [selectedSeason, setSelectedSeason] = useState(movie.season_number || 1);
  const [activeTab, setActiveTab] = useState("episodes");

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
  
  // Filter episodes by selected season - if no seasons, show all
  const episodes = seasons.length > 0 
    ? allEpisodes.filter(ep => ep.season_number === selectedSeason)
    : allEpisodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));

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
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
        style={{
          background: "#141414",
        }}
      >
        {/* Series Info Header */}
        {movie.series_name && (
          <div className="mb-8">
            <h1
              className="mb-3"
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 32,
                fontWeight: 700,
                color: "white",
              }}
            >
              {movie.series_name}
            </h1>
            
            <div className="flex items-center gap-3 mb-5">
              <span style={{ color: "#46d369", fontWeight: 600 }}>2023</span>
              <span className="px-2 py-0.5 border border-gray-500 text-gray-400 text-xs">+16</span>
              <span style={{ color: "#fff", fontWeight: 500 }}>
                {allEpisodes.length} פרקים
              </span>
            </div>

            {/* Play Button */}
            <button
              onClick={() => setCurrentMovie(allEpisodes[0])}
              className="w-full mb-3 flex items-center justify-center gap-2 py-3 rounded cursor-pointer transition-all duration-200"
              style={{
                background: "white",
                color: "black",
                fontFamily: "'Rajdhani',sans-serif",
                fontSize: 18,
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              <Play size={24} fill="black" />
              <span>הפעל</span>
            </button>

            {/* Description */}
            {movie.description && (
              <p
                className="mb-5"
                style={{
                  fontFamily: "'Rajdhani',sans-serif",
                  fontSize: 15,
                  color: "#fff",
                  lineHeight: 1.5,
                }}
              >
                {movie.description}
              </p>
            )}
          </div>
        )}

        {/* Non-series content */}
        {!movie.series_name && (
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
        )}

        {/* Series Section */}
        {movie.series_name && allEpisodes.length > 0 && (
          <div>
            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab("episodes")}
                className="pb-2 cursor-pointer transition-all duration-200"
                style={{
                  fontFamily: "'Rajdhani',sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: activeTab === "episodes" ? "white" : "#888",
                  borderBottom: activeTab === "episodes" ? "3px solid #e50914" : "3px solid transparent",
                }}
              >
                EPISODES
              </button>
            </div>

            {/* Season Selector */}
            {seasons.length > 1 && (
              <div className="mb-6">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="cursor-pointer outline-none"
                  style={{
                    background: "#2a2a2a",
                    border: "1px solid #555",
                    borderRadius: 4,
                    color: "white",
                    fontFamily: "'Rajdhani',sans-serif",
                    fontSize: 16,
                    padding: "8px 36px 8px 12px",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                  }}
                >
                  {seasons.map((season) => (
                    <option key={season} value={season}>
                      עונה {season}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Episodes List */}
            <div className="flex flex-col gap-3">
              {episodes.map((ep, index) => (
                <div
                  key={ep.id}
                  className="flex gap-4 rounded-lg transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => setCurrentMovie(ep)}
                  style={{
                    background: ep.id === currentMovie.id ? "#2a2a2a" : "#181818",
                    border: ep.id === currentMovie.id ? "2px solid #e50914" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (ep.id !== currentMovie.id) {
                      e.currentTarget.style.background = "#2a2a2a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (ep.id !== currentMovie.id) {
                      e.currentTarget.style.background = "#181818";
                    }
                  }}
                >
                  {/* Thumbnail with Play Button */}
                  <div className="relative shrink-0 group" style={{ width: 150, height: 85 }}>
                    <img
                      src={ep.thumbnail_url || `https://img.youtube.com/vi/${ep.video_id}/mqdefault.jpg`}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                      style={{ background: "#2a2a2a" }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          background: "rgba(255,255,255,0.95)",
                          border: "3px solid white",
                        }}
                      >
                        <Play size={20} fill="black" style={{ marginRight: -2 }} />
                      </div>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0 py-2 pr-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3
                        className="font-semibold"
                        style={{
                          fontFamily: "'Rajdhani',sans-serif",
                          fontSize: 15,
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        פרק {ep.episode_number || index + 1}
                      </h3>
                      <span
                        className="shrink-0"
                        style={{
                          fontFamily: "'Rajdhani',sans-serif",
                          fontSize: 13,
                          color: "#888",
                        }}
                      >
                        51 דק׳
                      </span>
                    </div>
                    <h4
                      className="mb-2"
                      style={{
                        fontFamily: "'Rajdhani',sans-serif",
                        fontSize: 16,
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {ep.title}
                    </h4>
                    {ep.description && (
                      <p
                        className="line-clamp-2"
                        style={{
                          fontFamily: "'Rajdhani',sans-serif",
                          fontSize: 13,
                          color: "#d0d0d0",
                          lineHeight: 1.4,
                        }}
                      >
                        {ep.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}