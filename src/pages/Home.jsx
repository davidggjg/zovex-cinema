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

  // מנגנון ה-Backdoor לפאנל ניהול
  useEffect(() => {
    if (searchQuery === "ZOVEX_ADMIN_2026") {
      const password = prompt("נא להזין סיסמת מנהל:");
      if (password === "ZOVEX ADMIN_2026") {
        navigate("/admin");
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
    <div className="app-mobile-container">
      <style>{CSS}</style>

      {/* Header מותאם לאפליקציה */}
      <nav className="mobile-nav">
        <div className="logo" onClick={() => { setView('home'); setCurrent(null); setSearchQuery(''); setActiveCat('הכל'); }}>ZOVEX</div>
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="חיפוש..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </nav>

      <main className="main-content">
        {isLoading ? (
          <div className="status-msg">טוען סרטים...</div>
        ) : view === 'detail' && current ? (
          <div className="full-detail-view">
            <button className="close-detail" onClick={() => setView('home')}><X /></button>
            <div className="hero-box" style={{ backgroundImage: `url(${getThumb(current)})` }}>
              <div className="overlay-fade"></div>
            </div>
            <div className="content-padding">
              <h1 className="title-text">{current.title}</h1>
              <p className="desc-text">{current.description}</p>
              <div className="action-area">
                {current.type === 'series' ? (
                  current.episodes.map((ep, i) => (
                    <button key={i} className="play-red-btn" onClick={() => setVideoData({ videoId: ep.video_id, type: ep.type })}>
                      <Play fill="white" size={18} /> פרק {ep.episode_number || i + 1}
                    </button>
                  ))
                ) : (
                  <button className="play-red-btn" onClick={() => setVideoData({ videoId: current.video_id, type: current.type })}>
                    <Play fill="white" size={18} /> נגן סרט מלא
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="home-scroll-view">
            {/* Hero אפור ללא גלילה הצידה */}
            {!searchQuery && activeCat === "הכל" && (
              <div className="brand-hero">
                <div className="glow-brand">ZOVEX</div>
              </div>
            )}

            {/* קטגוריות - גלילה פנימית בלבד */}
            <div className="category-scroller">
              {categories.map(c => (
                <button key={c} className={`cat-pill ${activeCat === c ? 'active' : ''}`} onClick={() => setActiveCat(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid-header-text">
               {activeCat === "הכל" ? "הוספו לאחרונה" : activeCat}
            </div>

            {/* גריד 2 בשורה - נעול למסך ללא גלילה אופקית */}
            <div className="vertical-grid">
              {filteredMovies.map(m => (
                <div key={m.id} className="movie-item" onClick={() => { setCurrent(m); setView('detail'); window.scrollTo(0,0); }}>
                  <div className="image-wrap">
                    <img src={getThumb(m)} alt={m.title} loading="lazy" />
                    <div className="type-badge">{m.type === 'series' ? 'סדרה' : 'סרט'}</div>
                  </div>
                  <div className="movie-name">{m.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {videoData && createPortal(
        <div className="fullscreen-player" onClick={() => setVideoData(null)}>
          <div className="player-inner" onClick={e => e.stopPropagation()}>
            <div className="player-toolbar">
              <button className="exit-player" onClick={() => setVideoData(null)}><X size={20} /> סגור</button>
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
  :root { --red: #e50914; --dark: #1a1a1a; }
  
  /* מניעת גלילה אופקית על כל האפליקציה */
  html, body { 
    margin: 0; 
    padding: 0; 
    overflow-x: hidden; 
    width: 100%; 
    background: #fff;
    font-family: 'Assistant', sans-serif;
    direction: rtl;
  }

  .app-mobile-container { width: 100%; overflow-x: hidden; }

  /* Nav */
  .mobile-nav { 
    position: fixed; top: 0; width: 100%; height: 60px; background: #fff; 
    display: flex; align-items: center; justify-content: space-between; 
    padding: 0 15px; z-index: 1000; box-shadow: 0 1px 4px rgba(0,0,0,0.1); 
    box-sizing: border-box;
  }
  .logo { font-size: 22px; font-weight: 900; color: var(--red); cursor: pointer; }
  .search-wrapper { position: relative; flex: 0 0 140px; }
  .search-wrapper input { 
    width: 100%; padding: 6px 30px 6px 10px; border-radius: 20px; 
    border: 1px solid #eee; background: #f8f8f8; outline: none; font-size: 13px; 
    box-sizing: border-box;
  }
  .search-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #aaa; }

  .main-content { padding-top: 60px; width: 100%; }

  /* Hero */
  .brand-hero { 
    width: 100%; height: 160px; 
    background: linear-gradient(135deg, #444, #000); 
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 5px;
  }
  .glow-brand { font-size: 45px; font-weight: 900; color: #fff; text-shadow: 0 0 15px var(--red); letter-spacing: 2px; }

  /* Categories - גלילה אופקית רק כאן */
  .category-scroller { 
    display: flex; gap: 8px; overflow-x: auto; padding: 12px 15px; 
    scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .category-scroller::-webkit-scrollbar { display: none; }
  .cat-pill { 
    padding: 6px 16px; border-radius: 20px; background: #f0f0f0; 
    border: none; white-space: nowrap; font-weight: 700; color: #555; font-size: 13px;
  }
  .cat-pill.active { background: var(--red); color: #fff; }

  .grid-header-text { padding: 5px 15px; font-size: 16px; font-weight: 800; color: #222; }

  /* Grid: 2 בשורה בלבד, ללא גלילה הצידה */
  .vertical-grid { 
    display: grid; 
    grid-template-columns: repeat(2, 1fr); 
    gap: 12px; 
    padding: 15px; 
    box-sizing: border-box;
    width: 100%;
  }
  .movie-item { width: 100%; cursor: pointer; }
  .image-wrap { 
    position: relative; aspect-ratio: 2/3; border-radius: 8px; 
    overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
  }
  .image-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .type-badge { 
    position: absolute; top: 6px; right: 6px; background: var(--red); 
    color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold; 
  }
  .movie-name { 
    margin-top: 6px; font-size: 13px; font-weight: 700; text-align: center; 
    color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; 
  }

  /* Detail View */
  .full-detail-view { position: fixed; inset: 0; background: #fff; z-index: 2000; overflow-y: auto; }
  .hero-box { height: 35vh; background-size: cover; background-position: center; position: relative; }
  .overlay-fade { position: absolute; inset: 0; background: linear-gradient(to top, #fff, transparent); }
  .content-padding { padding: 20px; }
  .title-text { font-size: 24px; font-weight: 900; margin: 0 0 10px; }
  .desc-text { font-size: 15px; color: #555; line-height: 1.6; }
  .play-red-btn { 
    width: 100%; padding: 15px; background: var(--red); color: #fff; border: none; 
    border-radius: 10px; font-size: 18px; font-weight: bold; display: flex; 
    align-items: center; justify-content: center; gap: 10px; margin-top: 20px;
  }
  .close-detail { 
    position: absolute; top: 15px; left: 15px; z-index: 2100; 
    background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; 
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  }

  /* Player */
  .fullscreen-player { position: fixed; inset: 0; background: #000; z-index: 5000; display: flex; flex-direction: column; }
  .player-toolbar { height: 50px; display: flex; align-items: center; padding: 0 15px; }
  .exit-player { background: var(--red); color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-weight: bold; }
  iframe { flex: 1; width: 100%; border: none; }

  /* Desktop */
  @media (min-width: 768px) {
    .vertical-grid { grid-template-columns: repeat(6, 1fr); gap: 20px; padding: 20px 5%; }
    .brand-hero { height: 280px; }
    .glow-brand { font-size: 90px; }
    .search-wrapper { flex: 0 0 300px; }
    .play-red-btn { width: auto; padding: 15px 50px; }
  }
`;