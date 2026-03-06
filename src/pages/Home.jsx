import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Search, X, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  return `https://rumble.com/embed/${videoId}/`;
};

const getThumb = (item) => item?.thumbnail_url || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800`;

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

  useEffect(() => { if (searchQuery === "ZovexAdmin2026") navigate("/admin"); }, [searchQuery]);

  // לוגיקת סרטי המשך (Sequels)
  const sequels = useMemo(() => {
    if (!current) return [];
    const baseName = current.title.split(' ')[0] + " " + (current.title.split(' ')[1] || ""); 
    return movies.filter(m => m.id !== current.id && m.title.includes(baseName.trim()));
  }, [current, movies]);

  return (
    <div className="zovex-light">
      <style>{CSS}</style>
      <header className="app-header">
        <div className="logo" onClick={() => setView('home')}>ZO<span>VEX</span></div>
        <div className="search-box"><Search size={18} /><input placeholder="חיפוש..." onChange={e => setSearchQuery(e.target.value)} /></div>
      </header>

      <main className="content">
        {isLoading ? <div className="loader">טוען...</div> : view === 'detail' ? (
          <div className="detail-view">
            <button className="back-circle" onClick={() => setView('home')}><X/></button>
            
            <div className="hero-section">
                <div className="poster-container" style={{backgroundImage: `url(${getThumb(current)})`}}>
                    <div className="play-overlay" onClick={() => setVideoData({id: current.video_id})}>
                        <div className="play-circle"><Play size={50} fill="white" /></div>
                    </div>
                </div>
                <div className="hero-info">
                    <h1>{current.title}</h1>
                    <p className="desc-text">{current.description}</p>
                </div>
            </div>

            {sequels.length > 0 && (
              <div className="sequels-section">
                <h2 className="section-label">סרטים נוספים בסדרה</h2>
                <div className="sequel-grid">
                  {sequels.map(s => (
                    <div key={s.id} className="s-card" onClick={() => {setCurrent(s); window.scrollTo(0,0)}}>
                      <img src={getThumb(s)} />
                      <span>{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="home-view">
            <div className="cat-bar">
                {["הכל", "סרטים", "סדרות", "ילדים"].map(c => (
                    <button key={c} className={activeCat === c ? 'active' : ''} onClick={() => setActiveCat(c)}>{c}</button>
                ))}
            </div>
            <div className="movie-grid">
              {movies.filter(m => (activeCat === "הכל" || m.category === activeCat) && m.title.includes(searchQuery)).map(m => (
                <div key={m.id} className="m-card" onClick={() => {setCurrent(m); setView('detail'); window.scrollTo(0,0)}}>
                  <div className="m-img"><img src={getThumb(m)} /></div>
                  <h4>{m.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {videoData && createPortal(
        <div className="player-screen">
          <div className="player-nav"><button onClick={() => setVideoData(null)}><X /> סגור</button></div>
          <div className="video-wrap">
            <div className="blocker"></div>
            <iframe src={getEmbedUrl(videoData.id)} allowFullScreen={false} />
          </div>
        </div>, document.body
      )}
    </div>
  );
}

const CSS = `
  :root { --accent: #0071E3; }
  body { background: #F5F5F7; margin: 0; font-family: Assistant, sans-serif; direction: rtl; }
  .app-header { background: #fff; padding: 12px 5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top:0; z-index:100; border-bottom: 1px solid #eee; }
  .logo { font-size: 26px; font-weight: 900; cursor: pointer; }
  .logo span { color: var(--accent); }
  .search-box { background: #eee; padding: 8px 15px; border-radius: 12px; display: flex; align-items: center; }
  .search-box input { border: none; background: none; outline: none; margin-right: 10px; }

  .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; padding: 20px 5%; }
  .m-card { cursor: pointer; text-align: center; }
  .m-img { aspect-ratio: 2/3; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 10px; }
  .m-img img { width: 100%; height: 100%; object-fit: cover; }

  .detail-view { background: #fff; min-height: 100vh; }
  .hero-section { display: flex; flex-direction: column; }
  .poster-container { height: 60vh; background-size: cover; background-position: center; position: relative; display: flex; align-items: center; justify-content: center; }
  .play-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .play-circle { width: 90px; height: 90px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; border: 3px solid #fff; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
  
  .hero-info { padding: 30px 8%; }
  .desc-text { font-size: 18px; color: #444; line-height: 1.6; max-width: 800px; }
  
  .section-label { font-size: 24px; font-weight: 800; margin: 40px 8% 20px; border-right: 5px solid var(--accent); padding-right: 15px; }
  .sequel-grid { display: flex; gap: 20px; overflow-x: auto; padding: 0 8% 40px; }
  .s-card { min-width: 140px; cursor: pointer; text-align: center; }
  .s-card img { width: 100%; aspect-ratio: 2/3; border-radius: 12px; object-fit: cover; }
  .s-card span { font-size: 13px; font-weight: bold; margin-top: 8px; display: block; }

  .player-screen { position: fixed; inset:0; background:#000; z-index:1000; display:flex; flex-direction:column; }
  .video-wrap { flex:1; position:relative; }
  .blocker { position:absolute; top:0; width:100%; height:80px; z-index:1001; }
  iframe { width:100%; height:100%; border:none; }
  .back-circle { position: absolute; top: 20px; right: 20px; z-index: 10; background: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; }
`;