import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // כניסה לפאנל ניהול דרך חיפוש
  useEffect(() => {
    if (searchQuery === "ZOVEX_ADMIN_2026") {
      const password = prompt("נא להזין סיסמה:");
      if (password === "ZOVEX ADMIN_2026") {
        navigate("/admin");
      } else if (password !== null) {
        alert("סיסמה שגויה");
        setSearchQuery("");
      }
    }
  }, [searchQuery, navigate]);

  const { processedItems, categories } = useMemo(() => {
    const seriesMap = new Map();
    const standaloneMovies = [];
    const cats = new Set(["הכל"]);
    movies.forEach((m) => {
      if (m.category) cats.add(m.category);
      if (m.series_name) {
        if (!seriesMap.has(m.series_name)) {
          seriesMap.set(m.series_name, { 
            id: `s_${m.series_name}`, title: m.series_name, type: "series", 
            thumbnail_url: m.thumbnail_url, category: m.category, episodes: [], description: m.description 
          });
        }
        seriesMap.get(m.series_name).episodes.push(m);
      } else { standaloneMovies.push(m); }
    });
    return { processedItems: [...standaloneMovies, ...Array.from(seriesMap.values())], categories: Array.from(cats) };
  }, [movies]);

  const filtered = useMemo(() => {
    return processedItems.filter(m => {
      const mS = m.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const mC = activeCat === "הכל" || m.category === activeCat;
      return mS && mC;
    });
  }, [processedItems, searchQuery, activeCat]);

  return (
    <div className="zovex-app">
      <style>{CSS}</style>

      <header className="z-nav">
        <div className="z-logo" onClick={() => { setView('home'); setSearchQuery(''); setActiveCat('הכל'); }}>ZOVEX</div>
        <div className="z-search">
          <Search size={16} className="z-search-icon" />
          <input type="text" placeholder="חיפוש..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </header>

      <main className="z-main">
        {isLoading ? (
          <div className="z-msg">טוען...</div>
        ) : view === 'detail' && current ? (
          <div className="z-detail">
            <button className="z-back" onClick={() => setView('home')}><X /></button>
            <div className="z-detail-hero" style={{ backgroundImage: `url(${getThumb(current)})` }}>
              <div className="z-detail-grad"></div>
            </div>
            <div className="z-detail-info">
              <h1>{current.title}</h1>
              <p>{current.description}</p>
              <div className="z-actions">
                {current.type === 'series' ? (
                  current.episodes.map((ep, i) => (
                    <button key={i} className="z-btn-play" onClick={() => setVideoData({ id: ep.video_id, t: ep.type })}>
                      <Play fill="white" size={18} /> פרק {ep.episode_number || i+1}
                    </button>
                  ))
                ) : (
                  <button className="z-btn-play" onClick={() => setVideoData({ id: current.video_id, t: current.type })}>
                    <Play fill="white" size={18} /> נגן סרט מלא
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="z-home">
            {!searchQuery && activeCat === "הכל" && (
              <div className="z-hero">
                <div className="z-hero-text">ZOVEX</div>
              </div>
            )}

            <div className="z-cats">
              {categories.map(c => (
                <button key={c} className={activeCat === c ? 'active' : ''} onClick={() => setActiveCat(c)}>{c}</button>
              ))}
            </div>

            <div className="z-grid">
              {filtered.map(m => (
                <div key={m.id} className="z-card" onClick={() => { setCurrent(m); setView('detail'); window.scrollTo(0,0); }}>
                  <div className="z-card-img">
                    <img src={getThumb(m)} alt="" loading="lazy" />
                    <div className="z-badge">{m.type === 'series' ? 'סדרה' : 'סרט'}</div>
                  </div>
                  <div className="z-card-title">{m.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {videoData && createPortal(
        <div className="z-player-ov" onClick={() => setVideoData(null)}>
          <div className="z-player-inner" onClick={e => e.stopPropagation()}>
            <div className="z-player-top">
              <button onClick={() => setVideoData(null)}><X size={20} /> סגור</button>
            </div>
            <iframe src={getEmbedUrl(videoData.id, videoData.t)} allowFullScreen allow="autoplay" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const CSS = `
  :root { --red: #e50914; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; background: #fff; direction: rtl; font-family: sans-serif; }
  
  .zovex-app { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }

  /* Navbar - Fix for Mobile */
  .z-nav { 
    position: fixed; top: 0; width: 100%; height: 60px; background: #fff; 
    display: flex; align-items: center; justify-content: space-between; 
    padding: 0 15px; z-index: 1000; border-bottom: 1px solid #f0f0f0;
  }
  .z-logo { font-size: 24px; font-weight: 900; color: var(--red); cursor: pointer; }
  .z-search { position: relative; width: 140px; }
  .z-search input { 
    width: 100%; padding: 7px 30px 7px 10px; border-radius: 20px; 
    border: 1px solid #eee; background: #f9f9f9; outline: none; font-size: 14px;
  }
  .z-search-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #999; }

  .z-main { padding-top: 60px; flex: 1; width: 100%; }

  /* Hero Gray Glow */
  .z-hero { 
    width: 100%; height: 180px; 
    background: linear-gradient(135deg, #444, #111); 
    display: flex; align-items: center; justify-content: center; margin-bottom: 10px;
  }
  .z-hero-text { font-size: 50px; font-weight: 900; color: #fff; text-shadow: 0 0 15px var(--red); letter-spacing: 2px; }

  /* Categories Scroller */
  .z-cats { display: flex; gap: 10px; overflow-x: auto; padding: 12px 15px; scrollbar-width: none; }
  .z-cats::-webkit-scrollbar { display: none; }
  .z-cats button { 
    padding: 6px 16px; border-radius: 20px; background: #f0f0f0; border: none; 
    white-space: nowrap; font-weight: 700; color: #666; font-size: 13px; cursor: pointer;
  }
  .z-cats button.active { background: var(--red); color: #fff; }

  /* Vertical Grid - 2 per row, Perfect Fit */
  .z-grid { 
    display: grid; grid-template-columns: repeat(2, 1fr); 
    gap: 15px; padding: 15px; width: 100%; 
  }
  .z-card { width: 100%; cursor: pointer; }
  .z-card-img { 
    position: relative; aspect-ratio: 2/3; border-radius: 12px; 
    overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #eee;
  }
  .z-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .z-badge { position: absolute; top: 8px; right: 8px; background: var(--red); color: #fff; font-size: 10px; padding: 2px 7px; border-radius: 4px; font-weight: bold; }
  .z-card-title { margin-top: 8px; font-size: 14px; font-weight: 700; text-align: center; color: #222; }

  /* Detail View */
  .z-detail { position: fixed; inset: 0; background: #fff; z-index: 2000; overflow-y: auto; }
  .z-detail-hero { height: 40vh; background-size: cover; background-position: center; position: relative; }
  .z-detail-grad { position: absolute; inset: 0; background: linear-gradient(to top, #fff, transparent); }
  .z-detail-info { padding: 20px; }
  .z-detail-info h1 { font-size: 28px; margin: 0 0 10px; }
  .z-detail-info p { color: #555; line-height: 1.6; }
  .z-btn-play { 
    width: 100%; padding: 16px; background: var(--red); color: #fff; border: none; 
    border-radius: 12px; font-size: 18px; font-weight: bold; display: flex; 
    align-items: center; justify-content: center; gap: 10px; margin-top: 15px;
  }
  .z-back { position: absolute; top: 15px; left: 15px; z-index: 2100; background: rgba(0,0,0,0.4); color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; }

  /* Player */
  .z-player-ov { position: fixed; inset: 0; background: #000; z-index: 5000; display: flex; flex-direction: column; }
  .z-player-top { height: 50px; display: flex; align-items: center; padding: 0 15px; }
  .z-player-top button { background: var(--red); color: #fff; border: none; padding: 6px 15px; border-radius: 5px; font-weight: bold; }
  iframe { flex: 1; width: 100%; border: none; }

  @media (min-width: 768px) {
    .z-grid { grid-template-columns: repeat(6, 1fr); padding: 20px 5%; }
    .z-hero { height: 300px; }
    .z-hero-text { font-size: 100px; }
    .z-search { width: 300px; }
    .z-btn-play { width: auto; padding: 16px 60px; }
  }
`;