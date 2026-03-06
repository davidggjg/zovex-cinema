import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play, ChevronLeft, HelpCircle, Info } from "lucide-react";
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

  // הסרט שיוצג בראש הדף (Hero)
  const heroItem = displayItems[0];

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
            <div className="hero-banner-detail"><img src={current.thumbnail_url} alt="" /><div className="hero-overlay"></div></div>
            <div className="info-section">
              <h1>{current.title}</h1>
              <div className="summary-card">
                <div className="summary-header"><div className="blue-dash"></div><h3>📝 תקציר:</h3></div>
                <p className="summary-text">{current.description || "אין תקציר זמין"}</p>
              </div>

              {current.type === 'movie' ? (
                <button className="play-action-btn-red" onClick={() => setVideoData({url: current.video_id})}>
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
            {/* HERO SECTION החדש עם הכפתור האדום */}
            {heroItem && searchQuery === "" && activeCat === "הכל" && (
              <div className="hero-section">
                <img src={heroItem.thumbnail_url} className="hero-bg" alt="" />
                <div className="hero-content">
                  <h1 className="hero-title">{heroItem.title}</h1>
                  <p className="hero-description">{heroItem.description}</p>
                  <div className="hero-btns">
                    <button className="play-btn-main-red" onClick={() => { setCurrent(heroItem); setView('detail'); }}>
                      <Play fill="white" size={28} /> צפייה ישירה
                    </button>
                    <button className="info-btn-main" onClick={() => { setCurrent(heroItem); setView('detail'); }}>
                      <Info size={28} /> מידע נוסף
                    </button>
                  </div>
                </div>
                <div className="hero-vignette"></div>
              </div>
            )}

            <div className="category-strip">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={activeCat === cat ? 'active' : ''} 
                  onClick={() => setActiveCat(cat)}
                >
                  {cat}
                </button>
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

      {/* תמיכה ונגן - נשאר ללא שינוי */}
      <a href="https://t.me/ZOVE8" target="_blank" rel="noreferrer" className="fab-support">
        <div className="fab-content">
          <div className="fab-icon-box"><span className="fab-emoji">🚀</span><div className="pulse-effect"></div></div>
          <span className="fab-text">בקשת סרטים ותמיכה</span>
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
  :root { --blue: #0071E3; --bg: #0A0A0A; --text: #FFFFFF; --red: #E50914; }
  body { background: var(--bg); color: var(--text); direction: rtl; font-family: 'Assistant', sans-serif; margin: 0; }
  
  .main-header { background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; position: fixed; width: 100%; top:0; z-index: 1000; box-sizing: border-box; }
  .logo { font-size: 26px; font-weight: 900; cursor: pointer; color: #FFF; }
  .logo span { color: var(--red); }
  .search-bar { background: #262626; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; width: 220px; }
  .search-bar input { background: none; border: none; outline: none; margin-right: 10px; width: 100%; font-size: 14px; color: #FFF; }

  /* HERO SECTION STYLE */
  .hero-section { height: 85vh; position: relative; display: flex; align-items: flex-end; padding: 0 5% 100px; overflow: hidden; }
  .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }
  .hero-vignette { position: absolute; inset: 0; background: linear-gradient(to top, #0A0A0A 5%, transparent 50%, rgba(0,0,0,0.4) 100%); z-index: 0; }
  .hero-content { position: relative; z-index: 2; max-width: 700px; }
  .hero-title { font-size: 60px; font-weight: 900; margin: 0 0 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.8); }
  .hero-description { font-size: 20px; line-height: 1.5; margin-bottom: 30px; text-shadow: 1px 1px 5px rgba(0,0,0,0.8); color: #E5E5E5; }
  
  .hero-btns { display: flex; gap: 15px; }
  
  /* הכפתור האדום המודגש */
  .play-btn-main-red, .play-action-btn-red { 
    background: var(--red); color: #FFF; border: none; padding: 15px 40px; border-radius: 8px; 
    font-size: 22px; font-weight: 900; display: flex; align-items: center; gap: 12px; 
    cursor: pointer; transition: 0.3s; box-shadow: 0 4px 20px rgba(229, 9, 20, 0.4);
  }
  .play-btn-main-red:hover { background: #ff0a16; transform: scale(1.05); }
  
  .info-btn-main { background: rgba(109, 109, 110, 0.7); color: #FFF; border: none; padding: 15px 30px; border-radius: 8px; font-size: 22px; font-weight: bold; display: flex; align-items: center; gap: 12px; cursor: pointer; backdrop-filter: blur(10px); }

  .category-strip { display: flex; gap: 10px; padding: 30px 5% 20px; overflow-x: auto; scrollbar-width: none; }
  .category-strip button { padding: 8px 25px; border-radius: 20px; border: none; background: #262626; color: #FFF; cursor: pointer; font-weight: 600; white-space: nowrap; transition: 0.2s; }
  .category-strip button.active { background: var(--red); }

  .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 25px; padding: 0 5% 100px; }
  .movie-card { cursor: pointer; transition: 0.3s ease; }
  .movie-card:hover { transform: translateY(-10px); }
  .card-thumb { position: relative; aspect-ratio: 2/3; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .movie-card h4 { margin-top: 12px; font-size: 15px; text-align: center; font-weight: 700; color: #E5E5E5; }

  .detail-view { background: #0A0A0A; min-height: 100vh; position: relative; }
  .hero-banner-detail { width: 100%; height: 60vh; position: relative; }
  .hero-banner-detail img { width: 100%; height: 100%; object-fit: cover; }
  .info-section { padding: 0 5% 100px; max-width: 900px; margin: -100px auto 0; position: relative; z-index: 10; }
  .summary-card { background: #1A1A1A; padding: 30px; border-radius: 20px; border: 1px solid #333; margin-bottom: 30px; }

  .fab-support { position: fixed; bottom: 30px; left: 30px; text-decoration: none; z-index: 2000; }
  .fab-content { display: flex; align-items: center; background: #0071E3; padding: 8px; border-radius: 50px; box-shadow: 0 15px 35px rgba(0,113,227,0.4); transition: 0.4s; max-width: 56px; overflow: hidden; border: 2px solid white; }
  .fab-support:hover .fab-content { max-width: 250px; padding-right: 20px; }
  .fab-icon-box { width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .fab-text { color: white; font-size: 15px; font-weight: 800; margin-left: 12px; opacity: 0; transition: 0.3s; white-space: nowrap; }
  .fab-support:hover .fab-text { opacity: 1; }

  .episode-row { background: #1A1A1A; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; margin-bottom: 10px; cursor: pointer; border: 1px solid #333; transition: 0.2s; }
  .episode-row:hover { background: #262626; border-color: var(--red); }
  
  .video-overlay-screen { position: fixed; inset: 0; background: #000; z-index: 10000; display: flex; flex-direction: column; }
  .close-player { background: var(--red); color: white; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; }
`;