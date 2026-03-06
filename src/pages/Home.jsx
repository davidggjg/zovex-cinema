import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [view, setView] = useState('home'); // 'home' | 'detail'
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("הכל");
  const [selectedSeason, setSelectedSeason] = useState("1");
  const navigate = useNavigate();

  // משיכת כל הנתונים מהשרת
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // כניסה לניהול דרך החיפוש
  useEffect(() => {
    if (searchQuery === "ZovexAdmin2026") navigate("/admin");
  }, [searchQuery, navigate]);

  // לוגיקה לקיבוץ סדרות וסרטים
  const { displayItems, categories } = useMemo(() => {
    const seriesMap = new Map();
    const films = [];
    const cats = new Set(["הכל"]);

    movies.forEach(item => {
      if (item.category) cats.add(item.category);

      if (item.category === "סדרות") {
        const baseName = item.title.split(" - ")[0].trim();
        if (!seriesMap.has(baseName)) {
          seriesMap.set(baseName, {
            id: item.id,
            title: baseName,
            type: 'series',
            description: item.description,
            thumbnail_url: item.thumbnail_url,
            category: "סדרות",
            episodes: []
          });
        }
        seriesMap.get(baseName).episodes.push(item);
      } else {
        films.push({ ...item, type: 'movie' });
      }
    });

    // מיון פרקים בתוך כל סדרה לפי עונה ופרק
    seriesMap.forEach(s => {
      s.episodes.sort((a, b) => {
        const aS = parseInt(a.metadata?.season || 1);
        const bS = parseInt(b.metadata?.season || 1);
        if (aS !== bS) return aS - bS;
        return parseInt(a.metadata?.episode || 0) - parseInt(b.metadata?.episode || 0);
      });
    });

    return { 
      displayItems: [...films, ...Array.from(seriesMap.values())], 
      categories: Array.from(cats) 
    };
  }, [movies]);

  // סינון לפי חיפוש וקטגוריה
  const filteredItems = displayItems.filter(item => {
    const matchesCat = activeCat === "הכל" || item.category === activeCat;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // סרטי המשך/דומים (רק לסרטים)
  const sequels = useMemo(() => {
    if (!current || current.type === 'series') return [];
    const firstWord = current.title.split(" ")[0];
    return movies.filter(m => 
      m.id !== current.id && 
      m.title.includes(firstWord) && 
      m.category !== "סדרות"
    );
  }, [current, movies]);

  return (
    <div className="zovex-app">
      <style>{CSS}</style>
      
      {/* סרגל עליון */}
      <header className="main-header">
        <div className="logo" onClick={() => { setView('home'); window.scrollTo(0,0); }}>ZO<span>VEX</span></div>
        <div className="search-bar">
          <Search size={18} color="#86868B" />
          <input 
            placeholder="חיפוש סרטים וסדרות..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="content-area">
        {isLoading ? (
          <div className="loader-box">טוען תוכן...</div>
        ) : view === 'detail' ? (
          /* --- דף פירוט תוכן --- */
          <div className="detail-view">
            <button className="back-btn" onClick={() => setView('home')}><X size={24}/></button>
            
            <div className="hero-banner">
              <img src={current.thumbnail_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"} alt={current.title} />
              <div className="hero-overlay"></div>
            </div>

            <div className="info-section">
              <h1>{current.title}</h1>
              
              <div className="summary-card">
                <div className="summary-header">
                  <div className="blue-dash"></div>
                  <h3>📝 תקציר הסרט:</h3>
                </div>
                <p className="summary-text">{current.description || "אין תקציר זמין כרגע."}</p>
              </div>

              {current.type === 'movie' ? (
                <>
                  <button className="play-action-btn" onClick={() => setVideoData({id: current.video_id})}>
                    <Play fill="white" size={24} /> צפייה ישירה
                  </button>

                  {sequels.length > 0 && (
                    <div className="extra-content">
                      <h3 className="section-title">סרטי המשך ודומים</h3>
                      <div className="horizontal-scroll">
                        {sequels.map(s => (
                          <div key={s.id} className="small-card" onClick={() => { setCurrent({...s, type:'movie'}); window.scrollTo(0,0); }}>
                            <img src={s.thumbnail_url} alt="" />
                            <span>{s.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* --- תצוגת סדרות --- */
                <div className="series-episodes">
                  <div className="series-nav">
                    <h3>פרקי הסדרה</h3>
                    <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                      {[...new Set(current.episodes.map(e => e.metadata?.season || "1"))].map(s => (
                        <option key={s} value={s}>עונה {s}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="episodes-rows">
                    {current.episodes
                      .filter(e => (e.metadata?.season || "1") === selectedSeason)
                      .map((ep, idx) => (
                        <div key={ep.id} className="episode-row" onClick={() => setVideoData({id: ep.video_id})}>
                          <div className="ep-info">
                            <div className="ep-play-icon"><Play size={14} fill="white"/></div>
                            <span>פרק {ep.metadata?.episode || idx + 1}</span>
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
          /* --- דף הבית --- */
          <div className="home-view">
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
                  <div className="card-thumb">
                    <img src={item.thumbnail_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400"} alt="" />
                    {item.type === 'series' && <div className="series-tag">סדרה</div>}
                  </div>
                  <h4>{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* נגן וידאו (מובנה בתוך הפורטל) */}
      {videoData && createPortal(
        <div className="video-overlay-screen">
          <div className="video-controls">
            <button onClick={() => setVideoData(null)} className="close-player">
              <X size={20} /> סגור נגן
            </button>
          </div>
          <div className="iframe-container">
            <div className="safety-blocker"></div>
            <iframe 
              src={`https://rumble.com/embed/${videoData.id}/`} 
              allowFullScreen={false} 
              title="Video Player"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const CSS = `
  :root { --blue: #0071E3; --bg: #F5F5F7; --text: #1D1D1F; --gray: #86868B; }
  
  body { background: var(--bg); color: var(--text); direction: rtl; font-family: 'Assistant', sans-serif; margin: 0; }
  
  .main-header { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top:0; z-index: 1000; border-bottom: 1px solid #D2D2D7; }
  .logo { font-size: 26px; font-weight: 900; cursor: pointer; letter-spacing: -1px; }
  .logo span { color: var(--blue); }
  .search-bar { background: #E8E8ED; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; width: 300px; }
  .search-bar input { background: none; border: none; outline: none; margin-right: 10px; width: 100%; font-size: 15px; }

  .category-strip { display: flex; gap: 10px; padding: 20px 5%; overflow-x: auto; scrollbar-width: none; }
  .category-strip::-webkit-scrollbar { display: none; }
  .category-strip button { padding: 10px 20px; border-radius: 20px; border: none; background: #FFF; color: var(--text); font-weight: 600; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); white-space: nowrap; }
  .category-strip button.active { background: var(--blue); color: #FFF; }

  .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 25px; padding: 0 5% 50px; }
  .movie-card { cursor: pointer; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .movie-card:hover { transform: scale(1.05); }
  .card-thumb { position: relative; aspect-ratio: 2/3; border-radius: 22px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .series-tag { position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; }
  .movie-card h4 { margin-top: 12px; font-size: 16px; font-weight: 700; text-align: center; }

  .detail-view { background: #FFF; min-height: 100vh; position: relative; }
  .back-btn { position: absolute; top: 20px; right: 20px; z-index: 100; background: #FFF; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); cursor: pointer; }
  
  .hero-banner { width: 100%; height: 50vh; position: relative; }
  .hero-banner img { width: 100%; height: 100%; object-fit: cover; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, #FFF); }

  .info-section { padding: 0 8% 50px; max-width: 900px; margin: -50px auto 0; position: relative; z-index: 10; }
  .info-section h1 { font-size: 42px; font-weight: 900; margin-bottom: 20px; }

  .summary-card { background: #F5F5F7; padding: 30px; border-radius: 28px; border: 1px solid #E5E5E5; margin-bottom: 30px; }
  .summary-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .blue-dash { width: 40px; height: 6px; background: var(--blue); border-radius: 10px; }
  .summary-header h3 { font-size: 22px; margin: 0; }
  .summary-text { font-size: 18px; line-height: 1.8; color: #424245; }

  .play-action-btn { background: var(--blue); color: #FFF; border: none; padding: 20px 50px; border-radius: 20px; font-size: 22px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 15px; margin: 30px 0; transition: 0.2s; width: fit-content; }
  .play-action-btn:hover { transform: scale(1.03); box-shadow: 0 10px 25px rgba(0,113,227,0.3); }

  /* עיצוב רשימת פרקים */
  .series-episodes { margin-top: 40px; }
  .series-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .series-nav select { padding: 10px; border-radius: 10px; border: 1px solid #D2D2D7; font-size: 16px; background: #F5F5F7; }
  
  .episodes-rows { display: flex; flex-direction: column; gap: 12px; }
  .episode-row { background: #1D1D1F; color: #FFF; padding: 18px 25px; border-radius: 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
  .episode-row:hover { background: #323236; transform: translateX(-5px); }
  .ep-info { display: flex; align-items: center; gap: 15px; }
  .ep-play-icon { background: var(--blue); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

  /* נגן */
  .video-overlay-screen { position: fixed; inset: 0; background: #000; z-index: 10000; display: flex; flex-direction: column; }
  .video-controls { padding: 15px; display: flex; justify-content: flex-start; }
  .close-player { background: var(--blue); color: #FFF; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; }
  .iframe-container { flex: 1; position: relative; }
  .safety-blocker { position: absolute; top: 0; right: 0; width: 100%; height: 80px; z-index: 10001; }
  iframe { width: 100%; height: 100%; border: none; }

  .horizontal-scroll { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px; }
  .small-card { min-width: 140px; cursor: pointer; text-align: center; }
  .small-card img { width: 100%; aspect-ratio: 2/3; border-radius: 15px; object-fit: cover; }
  .small-card span { font-size: 13px; font-weight: 700; margin-top: 5px; display: block; }
  .section-title { font-size: 24px; font-weight: 800; margin: 40px 0 20px; }
`;