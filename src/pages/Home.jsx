import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        // איחוד חכם: לוקחים את השם עד המקף הראשון או המילה פרק
        let baseName = item.title.split(" - ")[0].split(" פרק ")[0].trim();
        if (!seriesMap.has(baseName)) {
          seriesMap.set(baseName, { ...item, title: baseName, type: 'series', episodes: [] });
        }
        seriesMap.get(baseName).episodes.push(item);
      } else { films.push({ ...item, type: 'movie' }); }
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
        <div className="logo" onClick={() => setView('home')}>ZO<span>VEX</span></div>
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
                <p className="summary-text">{current.description}</p>
              </div>

              {current.type === 'movie' ? (
                <button className="play-action-btn" onClick={() => setVideoData({url: current.video_id})}>
                  <Play fill="white" size={24} /> צפייה ישירה
                </button>
              ) : (
                <div className="series-episodes">
                  <div className="episodes-rows">
                    {current.episodes.map((ep, idx) => (
                      <div key={ep.id} className="episode-row" onClick={() => setVideoData({url: ep.video_id})}>
                        <div className="ep-info">
                          <div className="ep-play-icon"><Play size={14} fill="white"/></div>
                          <span>פרק {ep.metadata?.episode || idx + 1} {ep.title.includes("אחרון") ? "(פרק אחרון)" : ""}</span>
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
              {categories.map(cat => <button key={cat} className={activeCat === cat ? 'active' : ''} onClick={() => setActiveCat(cat)}>{cat}</button>)}
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
  body { background: var(--bg); color: var(--text); direction: rtl; font-family: 'Assistant', sans-serif; margin: 0; }
  .main-header { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top:0; z-index: 1000; border-bottom: 1px solid #D2D2D7; }
  .logo { font-size: 26px; font-weight: 900; cursor: pointer; }
  .logo span { color: var(--blue); }
  .search-bar { background: #E8E8ED; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; width: 250px; }
  .search-bar input { background: none; border: none; outline: none; margin-right: 10px; width: 100%; }
  .category-strip { display: flex; gap: 10px; padding: 20px 5%; overflow-x: auto; }
  .category-strip button { padding: 8px 18px; border-radius: 20px; border: none; background: #FFF; cursor: pointer; font-weight: 600; white-space: nowrap; }
  .category-strip button.active { background: var(--blue); color: #FFF; }
  .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; padding: 0 5% 50px; }
  .movie-card { cursor: pointer; transition: 0.3s; }
  .card-thumb { position: relative; aspect-ratio: 2/3; border-radius: 20px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .series-tag { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 11px; }
  .movie-card h4 { margin-top: 10px; font-size: 14px; text-align: center; }
  .detail-view { background: #FFF; min-height: 100vh; }
  .back-btn { position: absolute; top: 20px; right: 20px; z-index: 100; background: #FFF; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
  .hero-banner { width: 100%; height: 45vh; position: relative; background: #000; }
  .hero-banner img { width: 100%; height: 100%; object-fit: contain; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, #FFF); }
  .info-section { padding: 0 8% 50px; max-width: 800px; margin: -40px auto 0; position: relative; }
  .summary-card { background: #F5F5F7; padding: 25px; border-radius: 25px; border: 1px solid #E5E5E5; margin: 25px 0; }
  .summary-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .blue-dash { width: 35px; height: 5px; background: var(--blue); border-radius: 5px; }
  .summary-text { font-size: 17px; line-height: 1.7; color: #333; }
  .play-action-btn { background: var(--blue); color: #FFF; border: none; padding: 18px 45px; border-radius: 18px; font-size: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 12px; }
  .episodes-rows { display: flex; flex-direction: column; gap: 10px; }
  .episode-row { background: #1D1D1F; color: #FFF; padding: 16px 20px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
  .ep-info { display: flex; align-items: center; gap: 12px; }
  .ep-play-icon { background: var(--blue); width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .video-overlay-screen { position: fixed; inset: 0; background: #000; z-index: 10000; display: flex; flex-direction: column; }
  .video-controls { padding: 15px; }
  .close-player { background: var(--blue); color: #FFF; border: none; padding: 8px 18px; border-radius: 8px; cursor: pointer; }
  .iframe-container { flex: 1; position: relative; }
  .safety-blocker { position: absolute; top: 0; right: 0; width: 100%; height: 60px; z-index: 10001; }
  iframe { width: 100%; height: 100%; border: none; }
`;