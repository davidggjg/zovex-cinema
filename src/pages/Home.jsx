import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play, ChevronDown } from "lucide-react";
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

  useEffect(() => { if (searchQuery === "ZovexAdmin2026") navigate("/admin"); }, [searchQuery]);

  // קיבוץ סדרות וקטגוריות
  const { processedItems, categories } = useMemo(() => {
    const seriesMap = new Map();
    const films = [];
    const cats = new Set(["הכל"]);
    movies.forEach(m => {
      cats.add(m.category);
      if (m.category === "סדרות" || m.metadata?.season) {
        const base = m.title.split(" - ")[0];
        if (!seriesMap.has(base)) seriesMap.set(base, { title: base, type: "series", episodes: [], description: m.description, thumbnail_url: m.thumbnail_url });
        seriesMap.get(base).episodes.push(m);
      } else { films.push(m); }
    });
    return { processedItems: [...films, ...Array.from(seriesMap.values())], categories: Array.from(cats) };
  }, [movies]);

  // מנוע סרטי המשך (לפי שם)
  const sequels = useMemo(() => {
    if (!current || current.type === 'series') return [];
    const firstWord = current.title.split(" ")[0];
    return movies.filter(m => m.id !== current.id && m.title.includes(firstWord) && m.category !== "סדרות");
  }, [current, movies]);

  return (
    <div className="zovex-light">
      <style>{CSS}</style>
      <header className="header">
        <div className="logo" onClick={() => setView('home')}>ZO<span>VEX</span></div>
        <div className="search"><Search size={18}/><input placeholder="חפש סרט..." onChange={e => setSearchQuery(e.target.value)} /></div>
      </header>

      <main className="main">
        {isLoading ? <div className="loader">טוען...</div> : view === 'detail' ? (
          <div className="detail">
            <button className="close" onClick={() => setView('home')}><X/></button>
            <div className="movie-hero">
                <img src={current.thumbnail_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"} alt="" />
            </div>

            <div className="info-box">
              <h1>{current.title}</h1>
              <p className="desc">{current.description}</p>
              
              {current.type !== 'series' && (
                <button className="play-btn" onClick={() => setVideoData({id: current.video_id})}>
                  <Play fill="white" size={24}/> צפה עכשיו
                </button>
              )}

              {current.type === 'series' ? (
                <div className="episodes-section">
                  <div className="season-header">
                    <h3>פרקי הסדרה</h3>
                    <select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}>
                      {[...new Set(current.episodes.map(e => e.metadata?.season || "1"))].map(s => <option key={s} value={s}>עונה {s}</option>)}
                    </select>
                  </div>
                  <div className="ep-list">
                    {current.episodes.filter(e => (e.metadata?.season || "1") === selectedSeason).map((e, i) => (
                      <div key={i} className="ep-row" onClick={() => setVideoData({id: e.video_id})}>
                        <Play size={16} fill="#0071E3"/>
                        <span>פרק {e.metadata?.episode || i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                sequels.length > 0 && (
                  <div className="sequels">
                    <h2 className="section-title">סרטים דומים והמשכים</h2>
                    <div className="sequel-grid">
                      {sequels.map(s => (
                        <div key={s.id} className="s-card" onClick={() => {setCurrent(s); window.scrollTo(0,0)}}>
                          <img src={s.thumbnail_url} />
                          <span>{s.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="home">
            <div className="cats">{categories.map(c => <button key={c} className={activeCat === c ? 'active' : ''} onClick={() => setActiveCat(c)}>{c}</button>)}</div>
            <div className="grid">
              {processedItems.filter(m => (activeCat === "הכל" || m.category === activeCat) && m.title.includes(searchQuery)).map((m, i) => (
                <div key={i} className="card" onClick={() => {setCurrent(m); setView('detail'); window.scrollTo(0,0)}}>
                  <div className="card-img"><img src={m.thumbnail_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400"} /></div>
                  <h4>{m.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {videoData && createPortal(
        <div className="player">
          <div className="p-head"><button onClick={() => setVideoData(null)}><X/> סגור</button></div>
          <div className="v-wrap">
            <div className="v-blocker"></div>
            <iframe src={`https://rumble.com/embed/${videoData.id}/`} allowFullScreen={false} />
          </div>
        </div>, document.body
      )}
    </div>
  );
}

const CSS = `
  body { background: #F5F5F7; direction: rtl; font-family: Assistant, sans-serif; margin: 0; }
  .header { background: #fff; padding: 12px 5%; display: flex; justify-content: space-between; position: sticky; top:0; z-index:100; border-bottom:1px solid #eee; }
  .logo { font-size: 24px; font-weight: 900; cursor: pointer; }
  .logo span { color: #0071E3; }
  .search { background: #eee; padding: 8px 15px; border-radius: 10px; display:flex; align-items:center; }
  .search input { border:none; background:none; outline:none; margin-right:10px; }
  
  .cats { display: flex; gap: 10px; padding: 20px 5%; overflow-x: auto; }
  .cats button { padding: 8px 18px; border-radius: 20px; border: none; background: #E8E8ED; cursor: pointer; font-weight: bold; }
  .cats button.active { background: #0071E3; color: #fff; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; padding: 0 5% 40px; }
  .card { cursor: pointer; text-align: center; }
  .card-img { aspect-ratio: 2/3; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 8px; }
  .card-img img { width: 100%; height: 100%; object-fit: cover; }

  .detail { background: #fff; min-height: 100vh; position: relative; }
  .close { position: absolute; top: 20px; right: 20px; background: #fff; border: none; border-radius: 50%; padding: 10px; cursor: pointer; z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
  .movie-hero { width: 100%; height: 50vh; overflow: hidden; }
  .movie-hero img { width: 100%; height: 100%; object-fit: cover; }
  
  .info-box { padding: 30px 8%; }
  .desc { font-size: 18px; line-height: 1.6; color: #444; margin-bottom: 25px; }
  .play-btn { background: #0071E3; color: #fff; border: none; padding: 15px 40px; border-radius: 12px; font-size: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; }

  .episodes-section { margin-top: 40px; }
  .season-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 15px; }
  .season-header select { padding: 8px; border-radius: 8px; border: 1px solid #ddd; }
  .ep-list { display: flex; flex-direction: column; gap: 10px; }
  .ep-row { display: flex; align-items: center; gap: 15px; padding: 15px; background: #f9f9f9; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.2s; }
  .ep-row:hover { background: #E8F2FF; color: #0071E3; }

  .section-title { font-size: 24px; font-weight: 800; margin: 50px 0 20px; border-right: 5px solid #0071E3; padding-right: 15px; }
  .sequel-grid { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 20px; }
  .s-card { min-width: 140px; cursor: pointer; text-align: center; }
  .s-card img { width: 100%; aspect-ratio: 2/3; border-radius: 12px; object-fit: cover; }

  .player { position: fixed; inset: 0; background: #000; z-index: 1000; display: flex; flex-direction: column; }
  .p-head { padding: 15px; }
  .p-head button { background: #0071E3; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  .v-wrap { flex: 1; position: relative; }
  .v-blocker { position: absolute; top: 0; width: 100%; height: 80px; z-index: 1001; }
  iframe { width: 100%; height: 100%; border: none; }
`;