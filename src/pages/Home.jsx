import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Sun, Moon } from "lucide-react";

// Helper Functions
const extractYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  
  switch (type) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    case "drive":
      return `https://drive.google.com/file/d/${videoId}/preview`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
    case "streamable":
      return `https://streamable.com/e/${videoId}?autoplay=1`;
    case "archive":
      return `https://archive.org/embed/${videoId}`;
    default:
      return "";
  }
};

const getThumb = (movie) => {
  if (movie.thumbnail_url) return movie.thumbnail_url;
  if (movie.type === "youtube") {
    return `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`;
  }
  return "";
};

// Video Player Component with Portal
const VideoPlayer = ({ videoId, type, onClose }) => {
  return createPortal(
    <div className="vid-ov" onClick={onClose}>
      <div className="vid-container" onClick={e => e.stopPropagation()}>
        <button className="vid-close" onClick={onClose}>✕</button>
        <iframe
          src={getEmbedUrl(videoId, type)}
          allowFullScreen
          allow="autoplay; encrypted-media"
          title="Zovex Player"
        />
      </div>
    </div>,
    document.body
  );
};

// Movie Card Component
const MovieCard = ({ movie, onClick }) => (
  <div className="card" onClick={() => onClick(movie)}>
    <div className="card-thumb">
      <img src={getThumb(movie)} alt={movie.title} loading="lazy" />
      <div className="card-overlay">
        <div className="play-btn-circle">▶</div>
      </div>
      <div className="card-badge">{movie.type === 'series' ? 'TV' : 'FILM'}</div>
    </div>
    <div className="card-info">
      <h4>{movie.title}</h4>
      <span>{movie.category}</span>
    </div>
  </div>
);

export default function Home() {
  const [view, setView] = useState('home');
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // Group series into single items
  const processedItems = useMemo(() => {
    const seriesMap = new Map();
    const standaloneMovies = [];

    movies.forEach((movie) => {
      if (movie.series_name) {
        if (!seriesMap.has(movie.series_name)) {
          seriesMap.set(movie.series_name, {
            id: `series_${movie.series_name}`,
            title: movie.series_name,
            type: "series",
            thumbnail_url: movie.thumbnail_url,
            video_id: movie.video_id,
            description: movie.description || "",
            category: movie.category,
            episodes: [],
          });
        }
        seriesMap.get(movie.series_name).episodes.push(movie);
      } else {
        standaloneMovies.push(movie);
      }
    });

    // Sort episodes
    seriesMap.forEach((series) => {
      series.episodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    });

    return [...standaloneMovies, ...Array.from(seriesMap.values())];
  }, [movies]);

  // Filter items
  const filteredMovies = useMemo(() => {
    return processedItems.filter(m => {
      const matchesSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [processedItems, searchQuery]);

  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    if (val === "ZOVEX_ADMIN_2026") {
      setShowAdminPrompt(true);
      setAdminPassword("");
      setSearchQuery("");
    } else {
      setSearchQuery(val);
    }
  };

  const handleAdminSubmit = () => {
    if (adminPassword === "ZOVEX_ADMIN_2026") {
      setShowAdminPrompt(false);
      window.location.href = "/Admin";
    } else {
      alert("סיסמה שגויה");
      setAdminPassword("");
    }
  };

  return (
    <div className="app light">
      <style>{CSS}</style>

      {/* Navbar */}
      <nav className="nav">
        <div className="logo" onClick={() => setView('home')}>ZOVEX</div>
        <div className="nav-tools">
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="חיפוש..." 
              value={searchQuery} 
              onChange={handleSearch} 
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container">
        {view === 'home' ? (
          <>
            {processedItems.length > 0 && !searchQuery && (
              <div className="hero" style={{ backgroundImage: `url(${getThumb(processedItems[0])})` }}>
                <div className="hero-overlay" />
                <div className="hero-content">
                  <h1>{processedItems[0].title}</h1>
                  <p>{processedItems[0].description}</p>
                  <div className="hero-btns">
                    <button className="btn-main" onClick={() => {
                      if (processedItems[0].type === 'series') {
                        setVideoData({ videoId: processedItems[0].episodes[0].video_id, type: processedItems[0].episodes[0].type });
                      } else {
                        setVideoData({ videoId: processedItems[0].video_id, type: processedItems[0].type });
                      }
                    }}>▶ נגן</button>
                    <button className="btn-sec" onClick={() => { setCurrent(processedItems[0]); setView('detail'); }}>ℹ מידע</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid-section">
              <h3>{searchQuery ? `תוצאות עבור: ${searchQuery}` : 'הוספו לאחרונה'}</h3>
              <div className="movie-grid">
                {filteredMovies.map(m => (
                  <MovieCard key={m.id} movie={m} onClick={(movie) => { setCurrent(movie); setView('detail'); }} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setView('home')}>← חזרה</button>
            <div className="detail-header" style={{ backgroundImage: `url(${getThumb(current)})` }}>
              <div className="hero-overlay" />
              <div className="detail-info">
                <h1>{current.title}</h1>
                <span className="badge">{current.category}</span>
                <p>{current.description}</p>
              </div>
            </div>
            <div className="episode-list">
              <h3>פרקים / צפייה</h3>
              {current.type === 'series' ? (
                current.episodes.map((ep, i) => (
                  <div key={ep.id} className="ep-item" onClick={() => setVideoData({ videoId: ep.video_id, type: ep.type })}>
                    <div className="ep-num">{ep.episode_number || i + 1}</div>
                    <div className="ep-title">{ep.title}</div>
                    <div className="ep-play">▶</div>
                  </div>
                ))
              ) : (
                <button className="btn-main" onClick={() => setVideoData({ videoId: current.video_id, type: current.type })}>צפה בסרט המלא</button>
              )}
            </div>
          </div>
        )}
      </main>

      {videoData && <VideoPlayer videoId={videoData.videoId} type={videoData.type} onClose={() => setVideoData(null)} />}

      {showAdminPrompt && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          backdropFilter: "blur(5px)",
        }}>
          <div style={{
            background: "#f8fafc",
            border: "2px solid #e50914",
            borderRadius: "12px",
            padding: "40px",
            width: "90%",
            maxWidth: "400px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ color: "#e50914", marginTop: 0, fontSize: 24, fontWeight: 700 }}>פאנל ניהול</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>הכנס סיסמה לגישה</p>
            <input
              type="password"
              placeholder="סיסמה..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdminSubmit()}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #e5e7eb",
                borderRadius: "6px",
                background: "#fff",
                color: "#1f2937",
                fontSize: "14px",
                direction: "rtl",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              autoFocus
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowAdminPrompt(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e5e7eb",
                  border: "none",
                  color: "#1f2937",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#d1d5db")}
                onMouseLeave={(e) => (e.target.style.background = "#e5e7eb")}
              >
                ביטול
              </button>
              <button
                onClick={handleAdminSubmit}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e50914",
                  border: "none",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#c40812")}
                onMouseLeave={(e) => (e.target.style.background = "#e50914")}
              >
                כניסה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --bg: #ffffff;
    --text: #1a1a1a;
    --card: #f8fafc;
    --accent: #e50914;
    --glass: rgba(255, 255, 255, 0.95);
    --border: #e5e7eb;
    --text-secondary: #6b7280;
  }

  .light {
    --bg: #ffffff;
    --text: #1a1a1a;
    --card: #f8fafc;
    --accent: #e50914;
    --glass: rgba(255, 255, 255, 0.95);
    --border: #e5e7eb;
    --text-secondary: #6b7280;
  }

  .dark {
    --bg: #ffffff;
    --text: #1a1a1a;
    --card: #f8fafc;
    --accent: #e50914;
    --glass: rgba(255, 255, 255, 0.95);
    --border: #e5e7eb;
    --text-secondary: #6b7280;
  }

  * { box-sizing: border-box; }
  body { 
    margin: 0; 
    font-family: 'Assistant', sans-serif; 
    background: var(--bg); 
    color: var(--text); 
    direction: rtl; 
    transition: background 0.3s ease;
    font-size: 16px;
  }
  
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

  .nav { 
    position: fixed; top: 0; width: 100%; height: 70px; 
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 40px; 
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
    z-index: 1000;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .logo { 
    font-weight: 800; 
    font-size: 26px; 
    color: var(--accent); 
    cursor: pointer; 
    letter-spacing: 1px;
  }

  .nav-tools { display: flex; align-items: center; gap: 15px; }

  .search-wrap input {
    background: var(--card); 
    border: 1px solid var(--border);
    padding: 10px 16px; 
    border-radius: 8px; 
    color: var(--text); 
    outline: none; 
    width: 250px;
    font-size: 14px;
    transition: all 0.2s;
    font-family: 'Assistant', sans-serif;
  }
  
  .search-wrap input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1);
  }

  .icon-btn { 
    background: var(--card); 
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 18px; 
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .icon-btn:hover {
    background: #f3f4f6;
    border-color: var(--accent);
  }

  .container { padding-top: 70px; }

  .hero {
    height: 60vh; 
    background-size: cover; 
    background-position: center;
    position: relative; 
    display: flex; 
    align-items: flex-end; 
    padding: 60px;
    margin: 20px;
    border-radius: 16px;
    overflow: hidden;
  }

  .hero-overlay { 
    position: absolute; 
    inset: 0; 
    background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%); 
  }

  .hero-content { position: relative; z-index: 10; max-width: 600px; }
  .hero-content h1 { 
    font-size: 3.2rem; 
    margin: 0 0 15px 0;
    font-weight: 800;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    color: #fff;
  }
  .hero-content p {
    font-size: 16px;
    margin-bottom: 25px;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    color: #f3f4f6;
    line-height: 1.6;
  }
  .hero-btns { display: flex; gap: 12px; margin-top: 20px; }

  .btn-main { 
    background: var(--accent); 
    color: white; 
    border: none; 
    padding: 12px 28px; 
    border-radius: 8px; 
    cursor: pointer; 
    font-weight: 600;
    font-size: 15px;
    transition: all 0.2s;
    font-family: 'Assistant', sans-serif;
  }
  .btn-main:hover {
    background: #c40812;
    box-shadow: 0 4px 12px rgba(229, 9, 20, 0.2);
  }
  
  .btn-sec { 
    background: rgba(255,255,255,0.3); 
    color: white; 
    border: 1px solid rgba(255,255,255,0.5);
    padding: 12px 28px; 
    border-radius: 8px; 
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.2s;
    font-family: 'Assistant', sans-serif;
  }
  .btn-sec:hover {
    background: rgba(255,255,255,0.4);
    border-color: rgba(255,255,255,0.7);
  }

  .grid-section { padding: 40px 60px; }
  .grid-section h3 { 
    margin-bottom: 30px; 
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
  }

  .movie-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 24px;
  }

  .card { 
    cursor: pointer; 
    transition: all 0.3s ease; 
  }
  .card:hover { 
    transform: translateY(-4px); 
    z-index: 10;
  }
  
  .card-thumb { 
    position: relative; 
    aspect-ratio: 2/3; 
    border-radius: 12px; 
    overflow: hidden; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border: 1px solid var(--border);
  }
  .card:hover .card-thumb {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  .card-thumb img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
  }

  .card-overlay { 
    position: absolute; 
    inset: 0; 
    background: rgba(0,0,0,0.4); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    opacity: 0; 
    transition: opacity 0.3s;
  }
  .card:hover .card-overlay { opacity: 1; }

  .play-btn-circle { 
    width: 50px; 
    height: 50px; 
    border-radius: 50%; 
    border: 2px solid white; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    color: white; 
    font-size: 20px;
  }

  .card-badge { 
    position: absolute; 
    top: 8px; 
    right: 8px; 
    background: var(--accent); 
    color: white; 
    padding: 5px 10px; 
    border-radius: 6px; 
    font-size: 10px; 
    font-weight: 600;
  }

  .card-info { padding: 12px 0; }
  .card-info h4 { 
    margin: 0 0 6px 0; 
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .card-info span { 
    font-size: 12px; 
    color: var(--text-secondary);
  }

  .detail-view { padding: 40px 60px; }
  .back-btn { 
    background: var(--card); 
    border: 1px solid var(--border);
    color: var(--text); 
    padding: 10px 20px; 
    border-radius: 8px; 
    cursor: pointer; 
    margin-bottom: 30px;
    font-weight: 500;
    transition: all 0.2s;
    font-family: 'Assistant', sans-serif;
  }
  .back-btn:hover {
    border-color: var(--accent);
    background: #f3f4f6;
  }

  .detail-header {
    height: 50vh; 
    background-size: cover; 
    background-position: center;
    position: relative; 
    display: flex; 
    align-items: flex-end; 
    padding: 50px; 
    border-radius: 16px; 
    overflow: hidden;
    margin-bottom: 40px;
    border: 1px solid var(--border);
  }

  .detail-info { position: relative; z-index: 10; }
  .detail-info h1 { 
    font-size: 2.6rem; 
    margin: 0 0 12px 0;
    font-weight: 800;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    color: #fff;
  }
  .badge { 
    background: var(--accent); 
    color: white; 
    padding: 6px 16px; 
    border-radius: 20px; 
    font-size: 12px; 
    display: inline-block; 
    margin: 12px 0;
    font-weight: 600;
  }

  .episode-list { margin-top: 20px; }
  .episode-list h3 { 
    margin-bottom: 24px;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
  }

  .ep-item {
    display: flex; 
    align-items: center; 
    background: var(--card); 
    padding: 16px 20px; 
    margin-bottom: 12px; 
    border-radius: 10px; 
    cursor: pointer; 
    transition: all 0.2s;
    border: 1px solid var(--border);
  }
  .ep-item:hover { 
    background: #f3f4f6;
    border-color: var(--accent);
    box-shadow: 0 2px 8px rgba(229, 9, 20, 0.1);
  }
  .ep-num { 
    font-weight: 600; 
    margin-left: 16px; 
    color: var(--text-secondary);
    font-size: 16px; 
  }
  .ep-title { 
    flex: 1;
    font-size: 15px;
    font-weight: 500;
    color: var(--text);
  }
  .ep-play { 
    font-size: 18px;
    color: var(--accent);
  }

  .vid-ov { 
    position: fixed; 
    inset: 0; 
    background: #000; 
    z-index: 3000; 
  }
  .vid-container { 
    width: 100%; 
    height: 100%; 
    position: relative; 
  }
  .vid-container iframe { 
    width: 100%; 
    height: 100%; 
    border: none; 
  }
  .vid-close { 
    position: absolute; 
    top: 24px; 
    right: 24px; 
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 10px; 
    border-radius: 8px; 
    cursor: pointer; 
    z-index: 10; 
    font-size: 24px; 
    width: 48px; 
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .vid-close:hover {
    background: rgba(255,255,255,0.2);
  }
  
  @media (max-width: 768px) {
    .hero { padding: 30px; height: 45vh; margin: 12px; }
    .hero-content h1 { font-size: 2.2rem; }
    .nav { padding: 0 20px; }
    .logo { font-size: 22px; }
    .search-wrap input { width: 160px; font-size: 13px; }
    .movie-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
    .grid-section { padding: 30px 20px; }
    .detail-view { padding: 20px; }
    .detail-header { padding: 30px; }
    .detail-info h1 { font-size: 2rem; }
  }
`;