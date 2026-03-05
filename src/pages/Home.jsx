import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Grid, List, Filter } from "lucide-react";
import WatchlistButton from "../components/home/WatchlistButton";
import RatingStars from "../components/home/RatingStars";
import ShareButton from "../components/home/ShareButton";

// Helper Functions
const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  switch (type) {
    case "youtube": return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    case "drive": return `https://drive.google.com/file/d/${videoId}/preview`;
    case "vimeo": return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    case "rumble":
      const rumbleId = videoId.startsWith('v') ? videoId : `v${videoId}`;
      return `https://rumble.com/embed/${rumbleId}/?pub=4`;
    default: return "";
  }
};

const getThumb = (movie) => {
  if (movie.thumbnail_url) return movie.thumbnail_url;
  if (movie.type === "youtube") return `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`;
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop";
};

// Video Player Component
const VideoPlayer = ({ videoId, type, onClose }) => {
  const embedUrl = getEmbedUrl(videoId, type);
  return createPortal(
    <div className="vid-ov" onClick={onClose}>
      <div className="vid-container" onClick={e => e.stopPropagation()}>
        <div className="vid-header">
          <button className="vid-close" onClick={onClose}>✕ סגור נגן</button>
        </div>
        <iframe src={embedUrl} allowFullScreen allow="autoplay; encrypted-media" />
      </div>
    </div>,
    document.body
  );
};

// Movie Card Component (העיצוב המקורי חזר)
const MovieCard = ({ movie, onClick, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className={`card netflix-card ${viewMode === 'list' ? 'list-mode' : ''}`} 
      onClick={() => onClick(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-thumb netflix-thumb">
        <img src={getThumb(movie)} alt={movie.title} loading="lazy" />
        <div className={`card-overlay netflix-overlay ${isHovered ? 'hovered' : ''}`}>
          <div className="play-btn-netflix">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" fill="rgba(255,255,255,0.95)" stroke="#e50914" strokeWidth="2"/>
              <path d="M24 20L42 30L24 40V20Z" fill="#000"/>
            </svg>
          </div>
        </div>
        <div className="card-badge-netflix">{movie.type === 'series' ? 'סדרה' : 'סרט'}</div>
        <div className="card-actions" style={{ opacity: isHovered ? 1 : 0 }}>
          <WatchlistButton movieId={movie.id} size={20} />
          <ShareButton movieTitle={movie.title} movieId={movie.id} size={20} />
        </div>
      </div>
      <div className="card-info netflix-info">
        <h4 className="netflix-title">{movie.title}</h4>
        <div className="netflix-meta">
          <span className="netflix-category">{movie.category}</span>
          {movie.year && <span className="netflix-year">{movie.year}</span>}
        </div>
        <div style={{ marginTop: '10px' }}>
          <RatingStars movieId={movie.id} size={16} interactive={false} />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [view, setView] = useState('home');
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState('grid');

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const processedItems = useMemo(() => {
    const seriesMap = new Map();
    const standaloneMovies = [];
    movies.forEach((movie) => {
      if (movie.series_name) {
        if (!seriesMap.has(movie.series_name)) {
          seriesMap.set(movie.series_name, { 
            id: `series_${movie.series_name}`, title: movie.series_name, type: "series", 
            thumbnail_url: movie.thumbnail_url, category: movie.category, episodes: [], description: movie.description 
          });
        }
        seriesMap.get(movie.series_name).episodes.push(movie);
      } else { standaloneMovies.push(movie); }
    });
    seriesMap.forEach(s => s.episodes.sort((a,b) => (a.episode_number || 0) - (b.episode_number || 0)));
    return [...standaloneMovies, ...Array.from(seriesMap.values())];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return processedItems.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [processedItems, searchQuery]);

  return (
    <div className="app light">
      <style>{CSS}</style>

      {/* Navbar - העיצוב המקורי חזר */}
      <nav className="nav">
        <div className="logo" onClick={() => { setView('home'); setCurrent(null); setSearchQuery(''); }}>ZOVEX</div>
        <div className="nav-tools">
          <div className="search-wrap">
            <input type="text" placeholder="חיפוש..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="icon-btn" onClick={() => setView('watchlist')}>📚</button>
          <button className="icon-btn" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
             {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
          </button>
        </div>
      </nav>

      <main className="container">
        {isLoading ? (
          <div className="loader-wrap"><div className="loader"></div></div>
        ) : view === 'detail' && current ? (
          /* מצב פרטים - נקי ללא סרטים דומים */
          <div className="detail-view-container">
            <button className="back-btn-modern" onClick={() => setView('home')}>← חזרה לראשי</button>
            <div className="detail-layout">
               <div className="detail-poster">
                  <img src={getThumb(current)} alt={current.title} />
               </div>
               <div className="detail-content">
                  <h1 className="detail-title">{current.title}</h1>
                  <div className="detail-meta">
                     <span className="badge">{current.category}</span>
                     {current.year && <span className="badge-outline">{current.year}</span>}
                  </div>
                  <p className="detail-desc">{current.description}</p>
                  
                  <div className="watch-section">
                    <h3>צפייה ישירה</h3>
                    {current.type === 'series' ? (
                      <div className="episodes-grid">
                        {current.episodes.map((ep, i) => (
                          <div key={i} className="episode-card" onClick={() => setVideoData({ videoId: ep.video_id, type: ep.type })}>
                            <span className="ep-index">{ep.episode_number || i + 1}</span>
                            <span className="ep-name">{ep.title}</span>
                            <span className="ep-play-icon">▶</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button className="play-main-btn" onClick={() => setVideoData({ videoId: current.video_id, type: current.type })}>
                        ▶ נגן סרט מלא
                      </button>
                    )}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          /* דף הבית המקורי */
          <>
            {!searchQuery && view === 'home' && (
              <div className="hero-modern">
                <div className="hero-overlay-gradient"></div>
                <div className="hero-text">ZOVEX</div>
              </div>
            )}
            
            <div className="grid-section">
              <h3 className="section-title">{searchQuery ? `תוצאות עבור: ${searchQuery}` : 'הוספו לאחרונה'}</h3>
              <div className={viewMode === 'grid' ? "movie-grid" : "movie-list"}>
                {filteredMovies.map(m => (
                  <MovieCard key={m.id} movie={m} onClick={(movie) => { setCurrent(movie); setView('detail'); window.scrollTo(0,0); }} viewMode={viewMode} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {videoData && <VideoPlayer videoId={videoData.videoId} type={videoData.type} onClose={() => setVideoData(null)} />}
    </div>
  );
}

const CSS = `
  :root { --accent: #e50914; --bg: #f8fafc; --text: #0f172a; --border: #e2e8f0; }
  body { margin: 0; font-family: 'Assistant', sans-serif; background: var(--bg); direction: rtl; overflow-x: hidden; }
  
  /* Navbar */
  .nav { position: fixed; top: 0; width: 100%; height: 70px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); display: flex; justify-content: space-between; align-items: center; padding: 0 5%; z-index: 1000; border-bottom: 1px solid var(--border); box-shadow: 0 2px 15px rgba(0,0,0,0.05); }
  .logo { font-weight: 900; font-size: 30px; color: var(--accent); cursor: pointer; letter-spacing: 2px; text-shadow: 0 0 15px rgba(229, 9, 20, 0.3); }
  .nav-tools { display: flex; gap: 12px; align-items: center; }
  .search-wrap input { padding: 10px 20px; border-radius: 50px; border: 1px solid var(--border); width: 250px; outline: none; transition: 0.3s; }
  .search-wrap input:focus { border-color: var(--accent); width: 300px; }
  .icon-btn { background: #f1f5f9; border: none; padding: 10px; border-radius: 50%; cursor: pointer; transition: 0.3s; }
  .icon-btn:hover { background: var(--accent); color: white; }

  /* Hero */
  .hero-modern { height: 400px; background: #000; position: relative; border-radius: 20px; margin: 20px 0 40px; display: flex; align-items: center; justifyContent: center; overflow: hidden; }
  .hero-text { font-size: 100px; font-weight: 900; color: white; z-index: 2; text-shadow: 0 0 30px var(--accent); }
  .hero-overlay-gradient { position: absolute; inset: 0; background: linear-gradient(to top, #000, transparent); }

  /* Grid & Cards */
  .container { padding: 90px 5% 50px; }
  .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 25px; }
  .netflix-card { cursor: pointer; transition: 0.4s; }
  .netflix-card:hover { transform: translateY(-10px); }
  .netflix-thumb { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 2/3; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
  .netflix-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .card-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: 0.3s; display: flex; align-items: center; justifyContent: center; }
  .card-overlay.hovered { opacity: 1; }
  .netflix-title { margin-top: 12px; font-weight: 700; font-size: 18px; color: var(--text); }
  .card-badge-netflix { position: absolute; top: 10px; right: 10px; background: var(--accent); color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }

  /* Detail View */
  .detail-layout { display: flex; gap: 50px; margin-top: 30px; flex-wrap: wrap; }
  .detail-poster img { width: 350px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
  .detail-title { font-size: 48px; font-weight: 900; margin-bottom: 15px; }
  .badge { background: var(--accent); color: white; padding: 6px 15px; border-radius: 50px; font-size: 14px; }
  .badge-outline { border: 1px solid #ccc; padding: 6px 15px; border-radius: 50px; font-size: 14px; }
  .detail-desc { font-size: 18px; line-height: 1.8; color: #444; margin: 30px 0; max-width: 800px; }
  .play-main-btn { padding: 15px 40px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 20px; font-weight: bold; cursor: pointer; transition: 0.3s; }
  .play-main-btn:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(229, 9, 20, 0.4); }

  /* Episodes */
  .episodes-grid { display: flex; flexDirection: column; gap: 10px; }
  .episode-card { display: flex; align-items: center; gap: 20px; padding: 15px; background: white; border-radius: 12px; border: 1px solid var(--border); cursor: pointer; transition: 0.2s; }
  .episode-card:hover { border-color: var(--accent); background: #fff1f1; }
  .ep-index { font-weight: 900; color: #ccc; }
  .ep-name { font-weight: 700; flex: 1; }
  .ep-play-icon { color: var(--accent); }

  /* Video Player */
  .vid-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 3000; display: flex; align-items: center; justifyContent: center; }
  .vid-container { width: 95%; height: 90%; background: #000; }
  .vid-header { padding: 15px; background: #111; display: flex; }
  .vid-close { background: var(--accent); color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; }
  iframe { width: 100%; height: calc(100% - 60px); border: none; }

  /* Mobile Adjustments */
  @media (max-width: 768px) {
    .nav { padding: 0 15px; }
    .search-wrap input { width: 120px; }
    .search-wrap input:focus { width: 150px; }
    .hero-text { font-size: 50px; }
    .detail-poster img { width: 100%; }
    .movie-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
    .logo { font-size: 20px; }
  }
`;