import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  switch (type) {
    case "youtube": return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1`;
    case "drive": return `https://drive.google.com/file/d/${videoId}/preview`;
    case "rumble": return `https://rumble.com/embed/${videoId}/`;
    default: return "";
  }
};

const getThumb = (item) => {
  if (item.thumbnail_url) return item.thumbnail_url;
  return `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800`;
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

  useEffect(() => { if (searchQuery === "ZovexAdmin2026") navigate("/admin"); }, [searchQuery]);

  const { processedItems, categories } = useMemo(() => {
    const seriesMap = new Map();
    const standaloneMovies = [];
    const cats = new Set(["הכל"]);
    movies.forEach((m) => {
      cats.add(m.category);
      if (m.category === "סדרות" || m.metadata?.season) {
        const base = m.title.split(" - עונה")[0].trim();
        if (!seriesMap.has(base)) seriesMap.set(base, { id: base, title: base, type: "series", category: "סדרות", episodes: [], description: m.description });
        seriesMap.get(base).episodes.push(m);
      } else { standaloneMovies.push(m); }
    });
    return { processedItems: [...standaloneMovies, ...Array.from(seriesMap.values())], categories: Array.from(cats) };
  }, [movies]);

  const getSimilar = (item) => {
    const word = item.title.split(' ')[0];
    return movies.filter(m => m.id !== item.id && (m.title.includes(word) || m.category === item.category)).slice(0, 6);
  };

  return (
    <div className="zovex-light">
      <style>{CSS}</style>
      <header className="app-header">
        <div className="logo" onClick={() => setView('home')}>ZO<span>VEX</span></div>
        <div className="search-box">
          <Search size={18} />
          <input placeholder="חיפוש..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </header>

      <main className="content">
        {isLoading ? <div className="loader">טוען...</div> : view === 'detail' ? (
          <div className="detail-view">
            <button className="back" onClick={() => setView('home')}><X/></button>
            <div className="hero-poster" style={{backgroundImage: `url(${getThumb(current)})`}}>
                <div className="play-btn-main" onClick={() => current.type !== 'series' && setVideoData({id: current.video_id, t: current.type})}>
                    <Play size={60} fill="white" />
                </div>
            </div>
            <div className="info">
                <h1>{current.title}</h1>
                <p>{current.description}</p>
                {current.type === 'series' ? (
                    <div className="series-box">
                        <select onChange={e => setSelectedSeason(e.target.value)} className="season-select">
                            {[...new Set(current.episodes.map(e => e.metadata?.season || "1"))].map(s => <option key={s} value={s}>עונה {s}</option>)}
                        </select>
                        <div className="ep-grid">
                            {current.episodes.filter(e => (e.metadata?.season || "1") === selectedSeason).map((e, i) => (
                                <button key={i} onClick={() => setVideoData({id: e.video_id, t: e.type})} className="ep-card">פרק {e.metadata?.episode || i+1}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="similar-wrap">
                        <h2 className="similar-title">סרטים דומים</h2>
                        <div className="similar-scroll">
                            {getSimilar(current).map(s => (
                                <div key={s.id} className="s-card" onClick={() => {setCurrent(s); window.scrollTo(0,0)}}>
                                    <img src={getThumb(s)} />
                                    <span>{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="home-view">
            <div className="cat-bar">{categories.map(c => <button key={c} className={activeCat === c ? 'active' : ''} onClick={() => setActiveCat(c)}>{c}</button>)}</div>
            <div className="movie-grid">
              {processedItems.filter(i => (activeCat === "הכל" || i.category === activeCat) && i.title.includes(searchQuery)).map(m => (
                <div key={m.id} className="m-card" onClick={() => {setCurrent(m); setView('detail'); window.scrollTo(0,0)}}>
                  <div className="m-img"><img src={getThumb(m)} /></div>
                  <div className="m-info"><h4>{m.title}</h4><p>{m.description?.substring(0,40)}...</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {videoData && createPortal(
        <div className="player-overlay">
          <div className="player-top"><button onClick={() => setVideoData(null)}><X /> סגור נגן</button></div>
          <div className="video-container">
            <div className="blocker-top"></div>
            <iframe src={getEmbedUrl(videoData.id, videoData.t)} allow="autoplay" allowFullScreen={false} />
          </div>
        </div>, document.body
      )}
    </div>
  );
}

const CSS = `
  :root { --accent: #0071E3; }
  body { background: #F5F5F7; margin: 0; font-family: Assistant, sans-serif; direction: rtl; }
  .app-header { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 1000; padding: 12px 5%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EEE; }
  .logo { font-size: 26px; font-weight: 900; cursor: pointer; }
  .logo span { color: var(--accent); }
  .search-box { position: relative; display: flex; align-items: center; background: #EEE; padding: 8px 15px; border-radius: 12px; }
  .search-box input { border: none; background: none; outline: none; margin-right: 10px; width: 150px; }
  .cat-bar { display: flex; gap: 10px; padding: 20px 5%; overflow-x: auto; }
  .cat-bar button { padding: 8px 18px; border-radius: 20px; border: none; background: #E8E8ED; cursor: pointer; font-weight: bold; }
  .cat-bar button.active { background: var(--accent); color: #fff; }
  .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; padding: 0 5% 40px; }
  .m-card { cursor: pointer; transition: 0.3s; }
  .m-card:hover { transform: translateY(-5px); }
  .m-img { aspect-ratio: 2/3; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
  .m-img img { width: 100%; height: 100%; object-fit: cover; }
  .m-info { padding: 10px 5px; }
  .m-info h4 { margin: 0; font-size: 15px; }
  .m-info p { margin: 5px 0 0; font-size: 12px; color: #888; }
  .detail-view { background: #fff; min-height: 100vh; }
  .hero-poster { height: 50vh; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; position: relative; }
  .play-btn-main { background: rgba(0,113,227,0.8); width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 4px solid #fff; }
  .info { padding: 30px 5%; }
  .back { position: absolute; top: 20px; right: 20px; background: #fff; border: none; border-radius: 50%; padding: 10px; cursor: pointer; }
  .season-select { padding: 10px; border-radius: 8px; margin-bottom: 20px; width: 150px; }
  .ep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
  .ep-card { padding: 15px; background: #F5F5F7; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; }
  .similar-title { font-size: 22px; margin: 40px 0 20px; border-right: 4px solid var(--accent); padding-right: 15px; }
  .similar-scroll { display: flex; gap: 15px; overflow-x: auto; }
  .s-card { min-width: 130px; cursor: pointer; }
  .s-card img { width: 100%; aspect-ratio: 2/3; border-radius: 10px; object-fit: cover; }
  .player-overlay { position: fixed; inset: 0; background: #000; z-index: 5000; display: flex; flex-direction: column; }
  .player-top { padding: 15px; background: #111; }
  .player-top button { background: var(--accent); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
  .video-container { flex: 1; position: relative; }
  .blocker-top { position: absolute; top: 0; width: 100%; height: 60px; z-index: 5001; }
  iframe { width: 100%; height: 100%; border: none; }
`;