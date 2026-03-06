import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play, ChevronLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (searchQuery === "ZovexAdmin2026") navigate("/admin");
  }, [searchQuery, navigate]);

  const { displayItems, categories } = useMemo(() => {
    const seriesMap = new Map();
    const films = [];
    const cats = new Set(["הכל"]);

    movies.forEach(item => {
      if (item.category) cats.add(item.category);
      if (item.category === "סדרות") {
        const baseName = item.title.split(" ")[0].trim(); 
        if (!seriesMap.has(baseName)) {
          seriesMap.set(baseName, { ...item, title: baseName, type: 'series', episodes: [] });
        }
        seriesMap.get(baseName).episodes.push(item);
      } else {
        films.push({ ...item, type: 'movie' });
      }
    });

    seriesMap.forEach(s => {
      s.episodes.sort((a, b) => (parseInt(a.metadata?.episode) || 0) - (parseInt(b.metadata?.episode) || 0));
    });

    return { displayItems: [...films, ...Array.from(seriesMap.values())], categories: Array.from(cats) };
  }, [movies]);

  const filteredItems = displayItems.filter(item => {
    const matchesCat = activeCat === "הכל" || item.category === activeCat;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="zovex-app">
      <style>{CSS}</style>
      
      <header className="main-header">
        <div className="logo" onClick={() => { setView('home'); window.scrollTo(0,0); }}>ZO<span>VEX</span></div>
        <div className="search-bar">
          <Search size={18} color="#86868B" />
          <input placeholder="חיפוש..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </header>

      <main className="content-area">
        {isLoading ? <div className="loader">טוען...</div> : view === 'detail' ? (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setView('home')}><X size={24}/></button>
            <div className="hero-banner"><img src={current.thumbnail_url} alt="" /><div className="hero-overlay"></div></div>
            <div className="info-section">
              <h1>{current.title}</h1>
              <div className="summary-card">
                <div className="summary-header"><div className="blue-dash"></div><h3>📝 תקציר:</h3></div>
                <p className="summary-text">{current.description || "אין תקציר זמין"}</p>
              </div>

              {current.type === 'movie' ? (
                <button className="play-action-btn" onClick={() => setVideoData({url: current.video_id})}>
                  <Play fill="white" size={24} /> צפייה ישירה
                </button>
              ) : (
                <div className="series-list">
                  <h3 className="section-title">פרקי הסדרה</h3>
                  <div className="episodes-rows">
                    {current.episodes.map((ep) => (
                      <div key={ep.id} className="episode-row" onClick={() => setVideoData({url: ep.video_id})}>
                        <div className="ep-info">
                          <div className="ep-play-icon"><Play size={14} fill="white"/></div>
                          <span>{ep.title}</span>
                        </div>
                        <ChevronLeft size={18} color="#86868B"/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="home-view">
            <div className="category-strip">
              {categories.map(cat => (
                <button key={cat} className={activeCat === cat ? 'active' : ''} onClick={() => setActiveCat(cat)}>{cat}</button>
              ))}
            </div>
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="movie-card" onClick={() => { setCurrent(item); setView('detail'); window.scrollTo(0,0); }}>
                  <div className="card-thumb"><img src={item.thumbnail_url} alt="" />{item.type === 'series' && <div className="series-tag">סדרה</div>}</div>
                  <h4>{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* כפתור תמיכה צף משופר */}
      <a href="https://t.me/ZOVE8" target="_blank" rel="noreferrer" className="fab-support">
        <div className="fab-content">
          <span className="fab-text">🚀 בקשת סרטים ותמיכה</span>
          <div className="fab-icon">
            <HelpCircle size={26} color="white" />
            <div className="pulse-ring"></div>
          </div>
        </div>
      </a>

      {videoData && createPortal(
        <div className="video-overlay-screen">
          <div className="video-controls"><button onClick={() => setVideoData(null)} className="close-player"><X size={20} /> סגור</button></div>
          <div className="iframe-container">
            <div className="safety-blocker"></div>
            <iframe 
              src={
                videoData.url.includes("youtube.com") ? videoData.url.replace("watch?v=", "embed/") :
                videoData.url.includes("drive.google.com") ? videoData.url.replace("/view", "/preview") :
                videoData.url.includes("rumble.com") ? `https://rumble.com/embed/${videoData.url.split('/').pop()}/` :
                videoData.url
              } 
              allowFullScreen title="Video"
            />
          </div>
        </div>, document.body
      )}
    </div>
  );
}

const CSS = `
  :root { --blue: #0071E3; --bg: #F5F5F7; --text: #1D1D1F; }
  body { background: var(--bg); color: var(--text); direction: rtl; font-family: 'Assistant', sans-serif; margin: 0; padding-bottom: 80px; }
  
  .main-header { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top:0; z-index: 1000; border-bottom: 1px solid #D2D2D7; }
  .logo { font-size: 26px; font-weight: 900; cursor: pointer; }
  .logo span { color: var(--blue); }
  .search-bar { background: #E8E8ED; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; width: 220px; }
  .search-bar input { background: none; border: none; outline: none; margin-right: 10px; width: 100%; font-size: 14px; }

  .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; padding: 0 5% 50px; }
  .movie-card { cursor: pointer; transition: 0.3s ease; }
  .card-thumb { position: relative; aspect-ratio: 2/3; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .series-tag { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }

  /* כפתור תמיכה צף - עיצוב חדש */
  .fab-support { position: fixed; bottom: 30px; left: 30px; text-decoration: none; z-index: 2000; }
  .fab-content { display: flex; align-items: center; background: #1c1c1e; padding: 6px; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 52px; overflow: hidden; white-space: nowrap; }
  .fab-support:hover .fab-content { max-width: 300px; background: var(--blue); padding-right: 20px; }
  .fab-icon { background: var(--blue); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
  .fab-text { color: white; font-size: 14px; font-weight: 800; margin-left: 12px; opacity: 0; transition: 0.3s; }
  .fab-support:hover .fab-text { opacity: 1; }

  /* אנימציית דופק */
  .pulse-ring { position: absolute; width: 100%; height: 100%; background: var(--blue); border-radius: 50%; opacity: 0.6; animation: pulse 2s infinite; z-index: -1; }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0; }
  }

  /* שאר העיצוב */
  .detail-view { background: #FFF; min-height: 100vh; position: relative; }
  .back-btn { position: absolute; top: 20px; right: 20px; z-index: 100; background: #FFF; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
  .hero-banner { width: 100%; height: 45vh; background: #000; }
  .hero-banner img { width: 100%; height: 100%; object-fit: contain; }
  .info-section { padding: 0 8% 50px; max-width: 850px; margin: -40px auto 0; position: relative; z-index: 10; }
  .summary-card { background: #F5F5F7; padding: 25px; border-radius: 25px; border: 1px solid #E5E5E5; margin-bottom: 30px; }
  .episode-row { background: #1D1D1F; color: #FFF; padding: 16px 20px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .video-overlay-screen { position: fixed; inset: 0; background: #000; z-index: 10000; display: flex; flex-direction: column; }
  .iframe-container { flex: 1; position: relative; }
  iframe { width: 100%; height: 100%; border: none; }
`;