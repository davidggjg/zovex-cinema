import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play } from "lucide-react";

const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  switch (type) {
    case "youtube": return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    case "drive": return `https://drive.google.com/file/d/${videoId}/preview`;
    case "vimeo": return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    case "rumble": return `https://rumble.com/embed/${videoId.startsWith('v') ? videoId : 'v'+videoId}/`;
    default: return "";
  }
};

const getThumb = (movie) => {
  if (movie.thumbnail_url) return movie.thumbnail_url;
  if (movie.type === "youtube") return `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`;
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400";
};

const VideoPlayer = ({ videoId, type, onClose }) => {
  const embedUrl = getEmbedUrl(videoId, type);
  return createPortal(
    <div className="vid-ov" onClick={onClose}>
      <div className="vid-container" onClick={e => e.stopPropagation()}>
        <div className="vid-header">
          <button className="vid-close" onClick={onClose}><X size={20} /> סגור</button>
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
  const [activeCat, setActiveCat] = useState("הכל");

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // עיבוד סדרות וקטגוריות
  const { processedItems, categories } = useMemo(() => {
    const seriesMap = new Map();
    const standaloneMovies = [];
    const cats = new Set(["הכל"]);

    movies.forEach((movie) => {
      if (movie.category) cats.add(movie.category);
      
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
    return { 
      processedItems: [...standaloneMovies, ...Array.from(seriesMap.values())],
      categories: Array.from(cats)
    };
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return processedItems.filter(m => {
      const matchSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = activeCat === "הכל" || m.category === activeCat;
      return matchSearch && matchCat;
    });
  }, [processedItems, searchQuery, activeCat]);

  return (
    <div className="app">
      <style>{CSS}</style>

      <nav className="nav">
        <div className="logo" onClick={() => { setView('home'); setCurrent(null); setSearchQuery(''); setActiveCat('הכל'); }}>ZOVEX</div>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="חיפוש..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </nav>

      <main className="container">
        {isLoading ? (
          <div className="loading">טוען...</div>
        ) : view === 'detail' && current ? (
          <div className="detail-page">
            <button className="back-btn" onClick={() => setView('home')}><X /></button>
            <div className="detail-hero" style={{ backgroundImage: `url(${getThumb(current)})` }}>
              <div className="hero-overlay"></div>
            </div>
            <div className="detail-content-wrap">
              <h1 className="d-title">{current.title}</h1>
              <p className="d-desc">{current.description}</p>
              <div className="watch-section">
                {current.type === 'series' ? (
                  current.episodes.map((ep, i) => (
                    <button key={i} className="play-btn-main" onClick={() => setVideoData({ videoId: ep.video_id, type: ep.type })}>
                      <Play fill="white" size={20} /> נגן פרק {ep.episode_number || i + 1}
                    </button>
                  ))
                ) : (
                  <button className="play-btn-main" onClick={() => setVideoData({ videoId: current.video_id, type: current.type })}>
                    <Play fill="white" size={20} /> נגן סרט מלא
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Hero אפור עם לוגו זוהר כמו בתמונה */}
            {!searchQuery && activeCat === "הכל" && (
              <div className="gray-hero">
                <div className="hero-glow-text">ZOVEX</div>
              </div>
            )}

            {/* שורת קטגוריות מהפאנל */}
            <div className="cat-bar">
              {categories.map(c => (
                <button key={c} className={`cat-item ${activeCat === c ? 'active' : ''}`} onClick={() => setActiveCat(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid-label">
               <h3>{activeCat !== "הכל" ? activeCat : "הוספו לאחרונה"}</h3>
            </div>

            {/* גריד - 2 בשורה בטלפון */}
            <div className="movie-grid">
              {filteredMovies.map(m => (
                <div key={m.id} className="movie-card" onClick={() => { setCurrent(m); setView('detail'); window.scrollTo(0,0); }}>
                  <div className="card-media">
                    <img src={getThumb(m)} alt={m.title} loading="lazy" />
                    <div className="tag">{m.type === 'series' ? 'סדרה' : 'סרט'}</div>
                  </div>
                  <div className="card-name">{m.title}</div>
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
  :root { --red: #e50914; --gray-bg: #4a4a4a; --light-gray: #f2f2f2; }
  body { margin: 0; font-family: 'Assistant', sans-serif; background: #fff; direction: rtl; }

  /* Nav */
  .nav { position: fixed; top: 0; width: 100%; height: 60px; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.05); box-sizing: border-box; }
  .logo { font-size: 24px; font-weight: 900; color: var(--red); cursor: pointer; }
  .search-box { position: relative; }
  .search-box input { padding: 6px 10px 6px 30px; border-radius: 15px; border: 1px solid #ddd; width: 120px; outline: none; }
  .search-icon { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #999; }

  .container { padding-top: 60px; }

  /* Gray Hero - במקום תמונה */
  .gray-hero { width: 100%; height: 200px; background: linear-gradient(135deg, #5e5e5e 0%, #2b2b2b 100%); display: flex; align-items: center; justify-content: center; }
  .hero-glow-text { font-size: 60px; font-weight: 900; color: #fff; text-shadow: 0 0 20px rgba(229, 9, 20, 0.8); letter-spacing: 4px; }

  /* Categories Bar */
  .cat-bar { display: flex; gap: 10px; overflow-x: auto; padding: 15px; scrollbar-width: none; border-bottom: 1px solid #eee; }
  .cat-bar::-webkit-scrollbar { display: none; }
  .cat-item { padding: 6px 18px; border-radius: 20px; background: #f0f0f0; border: none; white-space: nowrap; font-weight: 700; color: #555; cursor: pointer; }
  .cat-item.active { background: var(--red); color: #fff; }

  .grid-label { padding: 15px 15px 0; }
  .grid-label h3 { margin: 0; font-size: 18px; border-right: 3px solid var(--red); padding-right: 10px; }

  /* Grid: 2 items per row on Mobile */
  .movie-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 15px; }
  .movie-card { cursor: pointer; }
  .card-media { position: relative; aspect-ratio: 2/3; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .card-media img { width: 100%; height: 100%; object-fit: cover; }
  .tag { position: absolute; top: 5px; right: 5px; background: var(--red); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
  .card-name { margin-top: 8px; font-size: 14px; font-weight: 700; text-align: center; color: #333; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

  /* Detail Page */
  .detail-page { position: fixed; inset: 0; background: #fff; z-index: 2000; overflow-y: auto; }
  .detail-hero { height: 35vh; background-size: cover; background-position: center; position: relative; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, #fff, transparent); }
  .detail-content-wrap { padding: 20px; }
  .d-title { font-size: 26px; font-weight: 800; margin: 0 0 10px; }
  .d-desc { font-size: 15px; color: #666; line-height: 1.5; margin-bottom: 25px; }
  .play-btn-main { width: 100%; padding: 15px; background: var(--red); color: #fff; border: none; border-radius: 10px; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }
  .back-btn { position: absolute; top: 15px; left: 15px; z-index: 2100; background: rgba(0,0,0,0.4); color: #fff; border: none; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; }

  /* Video Player */
  .vid-ov { position: fixed; inset: 0; background: #000; z-index: 3000; display: flex; flex-direction: column; }
  .vid-header { height: 50px; display: flex; align-items: center; padding: 0 15px; }
  .vid-close { background: var(--red); color: #fff; border: none; padding: 5px 15px; border-radius: 5px; display: flex; align-items: center; gap: 5px; }
  iframe { flex: 1; width: 100%; border: none; }

  /* Desktop Adjustments */
  @media (min-width: 768px) {
    .movie-grid { grid-template-columns: repeat(6, 1fr); gap: 20px; padding: 20px 5%; }
    .gray-hero { height: 300px; }
    .hero-glow-text { font-size: 100px; }
    .play-btn-main { width: auto; padding: 15px 40px; }
    .search-box input { width: 250px; }
  }
`;