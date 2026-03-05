import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Grid, List, Filter } from "lucide-react";
import WatchlistButton from "../components/home/WatchlistButton";
import RatingStars from "../components/home/RatingStars";
import ShareButton from "../components/home/ShareButton";

// Helper Functions
const extractYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

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
        <div className="vid-header" style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px', background: 'rgba(0,0,0,0.8)' }}>
          <button className="vid-close" onClick={onClose} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>סגור נגן ✕</button>
        </div>
        <iframe src={embedUrl} allowFullScreen allow="autoplay; encrypted-media" style={{ width: '100%', height: 'calc(100% - 70px)', border: 'none' }} />
      </div>
    </div>,
    document.body
  );
};

// Movie Card Component
const MovieCard = ({ movie, onClick, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="card netflix-card" onClick={() => onClick(movie)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={viewMode === 'list' ? { display: 'flex', gap: '20px', padding: '16px' } : {}}>
      <div className="card-thumb netflix-thumb" style={viewMode === 'list' ? { width: '280px', flexShrink: 0 } : {}}>
        <img src={getThumb(movie)} alt={movie.title} />
        <div className={`card-overlay ${isHovered ? 'hovered' : ''}`}><div className="play-btn-netflix">▶</div></div>
      </div>
      <div className="card-info">
        <h4 className="netflix-title">{movie.title}</h4>
        <div style={{ fontSize: '12px', color: '#666' }}>{movie.category} | {movie.year}</div>
      </div>
    </div>
  );
};

export default function Home() {
  const [view, setView] = useState('home'); // 'home', 'watchlist', 'detail'
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('recent');

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
          seriesMap.set(movie.series_name, { id: `series_${movie.series_name}`, title: movie.series_name, type: "series", thumbnail_url: movie.thumbnail_url, category: movie.category, episodes: [], description: movie.description });
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
    <div className="app light" style={{ direction: 'rtl', background: '#f8fafc', minHeight: '100vh' }}>
      <style>{CSS}</style>

      <nav className="nav" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, background: '#fff', height: '70px', display: 'flex', alignItems: 'center', padding: '0 5%', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="logo" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e50914', cursor: 'pointer' }} onClick={() => { setView('home'); setCurrent(null); }}>ZOVEX</div>
        <input type="text" placeholder="חיפוש..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ margin: '0 20px', padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '300px' }} />
        <button onClick={() => setView('watchlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>📚</button>
      </nav>

      <main style={{ paddingTop: '100px', paddingBottom: '50px' }}>
        
        {/* מצב 1: דף פרטי סרט - מציג רק את הסרט הנבחר */}
        {view === 'detail' && current ? (
          <div className="detail-view" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <button onClick={() => setView('home')} style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer' }}>← חזרה לראשי</button>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <img src={getThumb(current)} style={{ width: '350px', borderRadius: '12px' }} />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '40px', marginBottom: '10px' }}>{current.title}</h1>
                <p style={{ fontSize: '18px', color: '#444', marginBottom: '30px' }}>{current.description}</p>
                
                <div className="episode-list">
                  <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #e50914', display: 'inline-block' }}>צפייה ישירה</h3>
                  {current.type === 'series' ? (
                    current.episodes.map((ep, i) => (
                      <div key={i} className="ep-item" onClick={() => setVideoData({ videoId: ep.video_id, type: ep.type })} style={{ padding: '15px', background: '#fff', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', border: '1px solid #eee' }}>
                        <span>פרק {ep.episode_number || i + 1}: {ep.title}</span>
                        <span style={{ color: '#e50914' }}>▶ נגן</span>
                      </div>
                    ))
                  ) : (
                    <button className="btn-main" onClick={() => setVideoData({ videoId: current.video_id, type: current.type })} style={{ padding: '15px 40px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>
                      ▶ נגן סרט מלא
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* כאן הוסר הבלוק של "סרטים דומים" כדי שלא יפריע */}
          </div>
        ) : view === 'watchlist' ? (
          <div style={{ padding: '0 5%' }}>
            <h2>רשימת הצפייה שלי</h2>
            {/* רשימת צפייה פשוטה */}
          </div>
        ) : (
          /* מצב ברירת מחדל: דף הבית */
          <div style={{ padding: '0 5%' }}>
            {!searchQuery && (
              <div className="hero" style={{ height: '300px', background: '#000', borderRadius: '20px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <h1 style={{ fontSize: '60px', letterSpacing: '5px' }}>ZOVEX</h1>
              </div>
            )}
            
            <h3>{searchQuery ? `תוצאות עבור: ${searchQuery}` : 'הוספו לאחרונה'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginTop: '20px' }}>
              {filteredMovies.map(m => (
                <MovieCard key={m.id} movie={m} onClick={(movie) => { setCurrent(movie); setView('detail'); window.scrollTo(0,0); }} viewMode="grid" />
              ))}
            </div>
          </div>
        )}
      </main>

      {videoData && <VideoPlayer videoId={videoData.videoId} type={videoData.type} onClose={() => setVideoData(null)} />}
    </div>
  );
}

const CSS = `
  .vid-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justifyContent: center; }
  .vid-container { width: 90%; height: 85%; background: #000; position: relative; }
  .card { cursor: pointer; transition: transform 0.2s; }
  .card:hover { transform: scale(1.03); }
  .card-thumb { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 16/9; }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .netflix-title { margin-top: 10px; font-size: 16px; font-weight: bold; }
  .ep-item:hover { background: #f0f0f0 !important; border-color: #e50914 !important; }
`;