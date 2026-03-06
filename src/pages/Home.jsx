import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  switch (type) {
    case "youtube": return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    case "drive": return `https://drive.google.com/file/d/${videoId}/preview`;
    case "rumble": return `https://rumble.com/embed/${videoId}/`;
    default: return "";
  }
};

const getThumb = (item) => {
  if (item.thumbnail_url) return item.thumbnail_url;
  if (item.type === "youtube") return `https://img.youtube.com/vi/${item.video_id}/maxresdefault.jpg`;
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";
};

export default function Home() {
  const [view, setView] = useState('home');
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("הכל");
  const [selectedSeason, setSelectedSeason] = useState("1");
  const navigate = useNavigate();

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // כניסה לפאנל ניהול דרך הקוד הסודי בחיפוש
  useEffect(() => {
    if (searchQuery === "ZovexAdmin2026") {
      navigate("/admin");
    }
  }, [searchQuery, navigate]);

  const { processedItems, categories } = useMemo(() => {
    const seriesMap = new Map();
    const standaloneMovies = [];
    const cats = new Set(["הכל"]);

    movies.forEach((m) => {
      if (m.category) cats.add(m.category);
      
      // בדיקה אם זה פרק של סדרה (לפי הקטגוריה או המטא-דאטה)
      if (m.category === "סדרות" || m.metadata?.season) {
        const baseTitle = m.title.split(" - עונה")[0]; // חילוץ שם הסדרה הכללי
        if (!seriesMap.has(baseTitle)) {
          seriesMap.set(baseTitle, { 
            id: `s_${baseTitle}`, title: baseTitle, type: "series", 
            thumbnail_url: m.thumbnail_url, category: "סדרות", episodes: [], 
            description: m.description 
          });
        }
        seriesMap.get(baseTitle).episodes.push(m);
      } else {
        standaloneMovies.push(m);
      }
    });

    return { 
      processedItems: [...standaloneMovies, ...Array.from(seriesMap.values())], 
      categories: Array.from(cats) 
    };
  }, [movies]);

  const filtered = useMemo(() => {
    return processedItems.filter(m => {
      const mS = m.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const mC = activeCat === "הכל" || m.category === activeCat;
      return mS && mC;
    });
  }, [processedItems, searchQuery, activeCat]);

  return (
    <div className="zovex-light">
      <style>{CSS}</style>

      <header className="app-header">
        <div className="logo" onClick={() => { setView('home'); setSearchQuery(''); }}>ZO<span>VEX</span></div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="חפש סרט או סדרה..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </header>

      <main className="content">
        {isLoading ? (
          <div className="loader">טוען קולנוע...</div>
        ) : view === 'detail' && current ? (
          <div className="detail-page">
            <button className="back-btn" onClick={() => setView('home')}><X /></button>
            <div className="hero-banner" style={{ backgroundImage: `url(${getThumb(current)})` }}>
              <div className="hero-overlay"></div>
            </div>
            
            <div className="info-section">
              <span className="badge">{current.category}</span>
              <h1>{current.title}</h1>
              <p className="description">{current.description}</p>

              {current.type === 'series' ? (
                <div className="series-controls">
                  <div className="season-selector">
                    <label>בחר עונה:</label>
                    <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                      {[...new Set(current.episodes.map(ep => ep.metadata?.season || "1"))].map(s => (
                        <option key={s} value={s}>עונה {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="episodes-grid">
                    {current.episodes
                      .filter(ep => (ep.metadata?.season || "1") === selectedSeason)
                      .sort((a, b) => (a.metadata?.episode || 0) - (b.metadata?.episode || 0))
                      .map((ep, i) => (
                        <button key={i} className="ep-card" onClick={() => setVideoData({ id: ep.video_id, t: ep.type })}>
                          <Play size={14} fill="currentColor" />
                          <span>פרק {ep.metadata?.episode || i+1}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <button className="play-main" onClick={() => setVideoData({ id: current.video_id, t: current.type })}>
                  <Play fill="white" /> צפה עכשיו
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="home-view">
            <div className="cat-bar">
              {categories.map(c => (
                <button key={c} className={activeCat === c ? 'active' : ''} onClick={() => setActiveCat(c)}>{c}</button>
              ))}
            </div>

            <div className="movie-grid">
              {filtered.map(m => (
                <div key={m.id} className="movie-card" onClick={() => { setCurrent(m); setView('detail'); window.scrollTo(0,0); }}>
                  <div className="card-img-holder">
                    <img src={getThumb(m)} alt="" loading="lazy" />
                    {m.type === 'series' && <div className="series-tag">S-TV</div>}
                  </div>
                  <div className="card-meta">
                    <h4>{m.title}</h4>
                    <p>{m.description?.substring(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {videoData && createPortal(
        <div className="player-overlay">
          <div className="player-header">
            <button onClick={() => setVideoData(null)}><X /> סגור נגן</button>
          </div>
          <iframe src={getEmbedUrl(videoData.id, videoData.t)} allowFullScreen allow="autoplay" />
        </div>,
        document.body
      )}
    </div>
  );
}

const CSS = `
  :root { --accent: #0071E3; --text: #1D1D1F; --gray: #86868B; --bg: #F5F5F7; }
  body { background: var(--bg); color: var(--text); direction: rtl; font-family: 'Assistant', sans-serif; margin: 0; }
  
  .app-header { 
    background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); 
    position: sticky; top: 0; z-index: 1000; padding: 12px 5%;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  .logo { font-size: 28px; font-weight: 900; cursor: pointer; }
  .logo span { color: var(--accent); }
  
  .search-wrapper { position: relative; width: 250px; }
  .search-wrapper input { 
    width: 100%; padding: 10px 35px; border-radius: 12px; border: 1px solid #E5E5E5;
    background: #FFF; outline: none; font-size: 15px; transition: 0.2s;
  }
  .search-wrapper input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(0,113,227,0.1); }
  .search-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--gray); }

  .cat-bar { display: flex; gap: 12px; padding: 20px 5%; overflow-x: auto; }
  .cat-bar button { 
    padding: 8px 20px; border-radius: 20px; border: none; background: #E8E8ED;
    color: var(--text); font-weight: 600; cursor: pointer; white-space: nowrap;
  }
  .cat-bar button.active { background: var(--accent); color: #fff; }

  .movie-grid { 
    display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); 
    gap: 25px; padding: 0 5% 40px; 
  }
  .movie-card { cursor: pointer; transition: transform 0.3s; }
  .movie-card:hover { transform: translateY(-8px); }
  .card-img-holder { position: relative; aspect-ratio: 2/3; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
  .card-img-holder img { width: 100%; height: 100%; object-fit: cover; }
  .series-tag { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; }
  
  .card-meta { padding: 12px 5px; }
  .card-meta h4 { margin: 0; font-size: 16px; font-weight: 700; }
  .card-meta p { margin: 5px 0 0; font-size: 13px; color: var(--gray); line-height: 1.3; }

  .detail-page { position: fixed; inset: 0; background: #fff; z-index: 2000; overflow-y: auto; }
  .hero-banner { height: 50vh; background-size: cover; background-position: center; position: relative; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, #fff 0%, transparent 100%); }
  .info-section { padding: 0 8% 50px; position: relative; margin-top: -60px; }
  .badge { background: #E8E8ED; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; color: var(--accent); }
  .description { font-size: 17px; line-height: 1.6; color: #424245; max-width: 700px; margin: 20px 0; }
  
  .play-main { 
    background: var(--accent); color: #fff; border: none; padding: 18px 50px; 
    border-radius: 15px; font-size: 20px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
  }

  .season-selector { margin-bottom: 20px; }
  .season-selector select { padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 16px; width: 150px; }
  .episodes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .ep-card { 
    background: #F5F5F7; border: none; padding: 15px; border-radius: 12px; 
    font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;
  }
  .ep-card:hover { background: #E8E8ED; color: var(--accent); }

  .player-overlay { position: fixed; inset: 0; background: #000; z-index: 5000; display: flex; flex-direction: column; }
  .player-header { padding: 15px; background: rgba(0,0,0,0.5); }
  .player-header button { background: var(--accent); color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; }
  iframe { flex: 1; border: none; }
  .back-btn { position: absolute; top: 20px; right: 20px; z-index: 2100; background: #fff; border: none; border-radius: 50%; width: 45px; height: 45px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

  @media (max-width: 600px) {
    .movie-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .search-wrapper { width: 150px; }
    .info-section h1 { font-size: 28px; }
  }
`;