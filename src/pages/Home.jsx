import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play } from "lucide-react";
import { useNavigate } from "react-router-dom"; // נוודא שיש ניווט

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

export default function Home() {
  const [view, setView] = useState('home');
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("הכל");
  const navigate = useNavigate();

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // בדיקת קוד ניהול בשורת החיפוש
  useEffect(() => {
    if (searchQuery === "ZOVEX_ADMIN_2026") {
      const password = prompt("נא להזין סיסמת מנהל:");
      if (password === "ZOVEX ADMIN_2026") {
        navigate("/admin"); // או הנתיב המדויק של דף האדמין שלך
      } else if (password !== null) {
        alert("סיסמה שגויה!");
        setSearchQuery("");
      }
    }
  }, [searchQuery, navigate]);

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
    return { processedItems: [...standaloneMovies, ...Array.from(seriesMap.values())], categories: Array.from(cats) };
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
          <input 
            type="text" 
            placeholder="חיפוש..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
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
            {!searchQuery && activeCat === "הכל" && (
              <div className="gray-hero">
                <div className="hero-glow-text">ZOVEX</div>
              </div>
            )}

            <div className="cat-bar">
              {categories.map(c => (
                <button key={c} className={`cat-item ${activeCat === c ? 'active' : ''}`} onClick={() => setActiveCat(c)}>
                  {c}
                </button>
              ))}
            </div>

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

      {videoData && createPortal(
        <div className="vid-ov" onClick={() => setVideoData(null)}>
          <div className="vid-container" onClick={e => e.stopPropagation()}>
            <div className="vid-header">
              <button className="vid-close" onClick={() => setVideoData(null)}><X size={20} /> סגור</button>
            </div>
            <iframe src={getEmbedUrl(videoData.videoId, videoData.type)} allowFullScreen allow="autoplay" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const CSS = `
  :root { --red: #e50914; }
  body { margin: 0; font-family: 'Assistant', sans-serif; background: #fff; direction: rtl; }
  .nav { position: fixed; top: 0; width: 100%; height: 60px; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.05); box-sizing: border-box; }
  .logo { font-size: 24px; font-weight: 900; color: var(--red); cursor: pointer; }
  .search-box { position: relative; }
  .search-box input { padding: 6px 10px 6px 30px; border-radius: 15px; border: 1px solid #ddd; width: 130px; outline: none; }
  .search-icon { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #999; }
  .container { padding-top: 60px; }
  .gray-hero { width: 100%; height: 180px; background: linear-gradient(135deg, #4a4a4a 0%, #1a1a1a 100%); display: flex; align-items: center; justify-content: center; }
  .hero-glow-text { font-size: 50px; font-weight: 900; color: #fff; text-shadow: 0 0 15px var(--red); letter-spacing: 3px; }
  .cat-bar { display: flex; gap: 10px; overflow-x: auto; padding: 12px; border-bottom: 1px solid #eee; }
  .cat-item { padding: 5px 15px; border-radius: 20px; background: #f0f0f0; border: none; white-space: nowrap; font-weight: 700; color: #555; }
  .cat-item.active { background: var(--red); color: #fff; }
  .movie-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 12px; }
  .movie-card { cursor: pointer; }
  .card-media { position: relative; aspect-ratio: 2/3; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  .card-media img { width: 100%; height: 100%; object-fit: cover; }
  .tag { position: absolute; top: 5px; right: 5px; background: var(--red); color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 3px; font-weight: bold; }
  .card-name { margin-top: 6px; font-size: 13px; font-weight: 700; text-align: center; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .detail-page { position: fixed; inset: 0; background: #fff; z-index: 2000; overflow-y: auto; }
  .detail-hero { height: 30vh; background-size: cover; background-position: center; position: relative; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, #fff, transparent); }
  .detail-content-wrap { padding: 15px; }
  .play-btn-main { width: 100%; padding: 14px; background: var(--red); color: #fff; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
  .back-btn { position: absolute; top: 15px; left: 15px; z-index: 2100; background: rgba(0,0,0,0.4); color: #fff; border: none; border-radius: 50%; width: 35px; height: 35px; }
  .vid-ov { position: fixed; inset: 0; background: #000; z-index: 5000; display: flex; flex-direction: column; }
  .vid-header { height: 50px; display: flex; align-items: center; padding: 0 15px; }
  .vid-close { background: var(--red); color: #fff; border: none; padding: 5px 12px; border-radius: 4px; }
  iframe { flex: 1; width: 100%; border: none; }
  @media (min-width: 768px) {
    .movie-grid { grid-template-columns: repeat(6, 1fr); gap: 20px; padding: 20px 5%; }
    .gray-hero { height: 250px; }
    .hero-glow-text { font-size: 80px; }
    .play-btn-main { width: auto; padding: 14px 40px; }
  }
`;