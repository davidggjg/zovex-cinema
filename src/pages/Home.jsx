import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play } from "lucide-react";

// פונקציות עזר לנגן ולתמונות
const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  switch (type) {
    case "youtube": return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    case "drive": return `https://drive.google.com/file/d/${videoId}/preview`;
    case "vimeo": return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    case "rumble": return `https://rumble.com/embed/${videoId.startsWith('v') ? videoId : 'v'+videoId}/?pub=4`;
    default: return "";
  }
};

const getThumb = (movie) => {
  if (movie.thumbnail_url) return movie.thumbnail_url;
  if (movie.type === "youtube") return `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`;
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop";
};

// רכיב נגן וידאו
const VideoPlayer = ({ videoId, type, onClose }) => {
  const embedUrl = getEmbedUrl(videoId, type);
  return createPortal(
    <div className="vid-ov" onClick={onClose}>
      <div className="vid-container" onClick={e => e.stopPropagation()}>
        <div className="vid-header">
          <button className="vid-close" onClick={onClose}><X size={20} /> סגור נגן</button>
        </div>
        <iframe src={embedUrl} allowFullScreen allow="autoplay; encrypted-media" />
      </div>
    </div>,
    document.body
  );
};

export default function Home() {
  const [view, setView] = useState('home');
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    return [...standaloneMovies, ...Array.from(seriesMap.values())];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return processedItems.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [processedItems, searchQuery]);

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* Navbar - לוגו אדום וחיפוש */}
      <nav className="nav">
        <div className="logo" onClick={() => { setView('home'); setCurrent(null); setSearchQuery(''); }}>ZOVEX</div>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="חיפוש..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </nav>

      <main className="container">
        {isLoading ? (
          <div className="loading">טוען תוכן...</div>
        ) : view === 'detail' && current ? (
          /* דף פרטים - רק כפתור נגן סרט מלא */
          <div className="detail-page">
            <button className="back-btn" onClick={() => setView('home')}><X /></button>
            <div className="detail-hero" style={{ backgroundImage: `url(${getThumb(current)})` }}>
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <h1 className="movie-title-large">{current.title}</h1>
                <p className="movie-desc-large">{current.description}</p>
                <div className="button-group">
                  {current.type === 'series' ? (
                    current.episodes.map((ep, i) => (
                      <button key={i} className="btn-play-red" onClick={() => setVideoData({ videoId: ep.video_id, type: ep.type })}>
                        <Play fill="white" /> נגן פרק {ep.episode_number || i + 1}
                      </button>
                    ))
                  ) : (
                    <button className="btn-play-red" onClick={() => setVideoData({ videoId: current.video_id, type: current.type })}>
                      <Play fill="white" /> נגן סרט מלא
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* דף הבית */
          <>
            {!searchQuery && (
              <div className="main-hero">
                <div className="hero-img-wrap">
                   <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200" alt="hero" />
                   <div className="hero-grad"></div>
                   <div className="hero-logo-text">ZOVEX</div>
                </div>
              </div>
            )}

            <div className="section-header">
               <h2>{searchQuery ? 'תוצאות חיפוש' : 'הוספו לאחרונה'}</h2>
            </div>

            <div className="movie-grid">
              {filteredMovies.map(m => (
                <div key={m.id} className="m-card" onClick={() => { setCurrent(m); setView('detail'); window.scrollTo(0,0); }}>
                  <div className="m-img-container">
                    <img src={getThumb(m)} alt={m.title} />
                    <div className="m-type-tag">{m.type === 'series' ? 'סדרה' : 'סרט'}</div>
                  </div>
                  <div className="m-name">{m.title}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {videoData && <VideoPlayer videoId={videoData.videoId} type={videoData.type} onClose={() => setVideoData(null)} />}
    </div>
  );
}

const CSS = `
  :root { --main-red: #e50914; --bg: #ffffff; --text: #111; }
  body { margin: 0; font-family: 'Assistant', sans-serif; background: var(--bg); direction: rtl; }

  /* Navbar */
  .nav { position: fixed; top: 0; width: 100%; height: 65px; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 5%; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.05); box-sizing: border-box; }
  .logo { font-size: 28px; font-weight: 900; color: var(--main-red); cursor: pointer; letter-spacing: 1px; }
  .search-box { position: relative; display: flex; align-items: center; }
  .search-box input { padding: 8px 15px 8px 35px; border-radius: 20px; border: 1px solid #eee; background: #f5f5f5; width: 160px; outline: none; font-size: 14px; }
  .search-icon { position: absolute; left: 10px; color: #aaa; }

  .container { padding-top: 65px; }

  /* Hero Section Home */
  .main-hero { width: 100%; height: 350px; position: relative; overflow: hidden; }
  .hero-img-wrap { width: 100%; height: 100%; position: relative; }
  .hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .hero-grad { position: absolute; inset: 0; background: linear-gradient(to top, white, transparent); }
  .hero-logo-text { position: absolute; bottom: 20%; right: 5%; font-size: 80px; font-weight: 900; color: var(--main-red); text-shadow: 2px 2px 20px rgba(0,0,0,0.2); }

  /* Grid - 3 items per row on Mobile! */
  .section-header { padding: 20px 5% 10px; }
  .section-header h2 { font-size: 20px; font-weight: 800; border-right: 4px solid var(--main-red); padding-right: 10px; }
  .movie-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 10px 40px; }

  .m-card { cursor: pointer; transition: transform 0.2s; }
  .m-img-container { position: relative; aspect-ratio: 2/3; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .m-img-container img { width: 100%; height: 100%; object-fit: cover; }
  .m-type-tag { position: absolute; top: 5px; right: 5px; background: var(--main-red); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
  .m-name { font-size: 12px; font-weight: 700; margin-top: 8px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #333; }

  /* Detail Page */
  .detail-page { position: fixed; inset: 0; background: #fff; z-index: 2000; overflow-y: auto; }
  .detail-hero { height: 50vh; background-size: cover; background-position: center; position: relative; display: flex; align-items: flex-end; padding: 40px 5%; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, #fff 10%, transparent); }
  .hero-content { position: relative; z-index: 2; width: 100%; }
  .movie-title-large { font-size: 32px; font-weight: 900; margin: 0; }
  .movie-desc-large { font-size: 16px; color: #444; margin: 15px 0 25px; line-height: 1.5; max-width: 600px; }
  .back-btn { position: absolute; top: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; padding: 8px; cursor: pointer; }
  
  .btn-play-red { background: var(--main-red); color: #fff; border: none; padding: 15px 30px; border-radius: 12px; font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 10px; cursor: pointer; width: 100%; justify-content: center; margin-bottom: 10px; }

  /* Player */
  .vid-ov { position: fixed; inset: 0; background: #000; z-index: 5000; display: flex; flex-direction: column; }
  .vid-header { height: 50px; display: flex; align-items: center; padding: 0 15px; }
  .vid-close { background: var(--main-red); color: #fff; border: none; padding: 6px 15px; border-radius: 5px; display: flex; align-items: center; gap: 5px; }
  .vid-container { flex: 1; }
  iframe { width: 100%; height: 100%; border: none; }

  /* Desktop Styles */
  @media (min-width: 768px) {
    .movie-grid { grid-template-columns: repeat(6, 1fr); gap: 20px; padding: 0 5% 40px; }
    .hero-logo-text { font-size: 150px; }
    .btn-play-red { width: auto; }
    .search-box input { width: 300px; }
  }
`;