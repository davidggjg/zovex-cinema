import React, {
  useState, useEffect, useReducer, useMemo
} from 'react';
import { createPortal } from 'react-dom';

// ------------------------------------------------------------
// 1. HELPERS & UTILS
// ------------------------------------------------------------
const DB_KEY = "zovex_master_db";
const ADMIN_PASSWORD = "admin";

const extractYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const getEmbedUrl = (link) => {
  if (!link) return "";
  
  if (link.includes('vidhide') || link.includes('streamwish')) {
    return link.replace('/v/', '/e/').replace('/watch/', '/embed/');
  }

  const ytId = extractYouTubeId(link);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
  
  if (link.includes('drive.google.com')) {
    const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return m ? `https://drive.google.com/file/d/${m[1]}/preview` : link;
  }
  
  return link;
};

const getThumb = (movie) => {
  if (movie.poster) return movie.poster;
  const ytId = extractYouTubeId(movie.link || movie.episodes?.[0]?.link);
  return ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : "";
};

// ------------------------------------------------------------
// 2. REDUCER
// ------------------------------------------------------------
const moviesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD': return [...state, { ...action.payload, id: Date.now() }];
    case 'DELETE': return state.filter(m => m.id !== action.id);
    case 'SET': return action.payload;
    default: return state;
  }
};

// ------------------------------------------------------------
// 3. COMPONENTS
// ------------------------------------------------------------

const VideoPlayer = ({ src, onClose }) => {
  const [showControls, setShowControls] = useState(true);
  
  useEffect(() => {
    let timeout;
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('click', handleActivity);
    timeout = setTimeout(() => setShowControls(false), 3000);
    
    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('click', handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  return createPortal(
    <div className="vid-ov">
      <button 
        className="vid-close" 
        onClick={onClose}
        style={{
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        ✕
      </button>
      <iframe
        src={getEmbedUrl(src)}
        allowFullScreen
        allow="autoplay; encrypted-media"
        title="Zovex Player"
      />
    </div>,
    document.body
  );
};

const MovieCard = ({ movie, onClick }) => (
  <div className="card" onClick={() => onClick(movie)}>
    <div className="card-thumb">
      <img src={getThumb(movie)} alt={movie.title} loading="lazy" />
      <div className="card-overlay">
        <div className="play-btn-circle">▶</div>
      </div>
      <div className="card-badge">{movie.type === 'series' ? 'TV' : 'FILM'}</div>
    </div>
    <div className="card-info">
      <h4>{movie.title}</h4>
      <span>{movie.category}</span>
    </div>
  </div>
);

function AdminForm({ onAdd }) {
  const [data, setData] = useState({ 
    title: '', 
    type: 'movie', 
    category: '', 
    link: '', 
    poster: '', 
    backdrop: '', 
    description: '', 
    episodes: [] 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(data);
    setData({ title: '', type: 'movie', category: '', link: '', poster: '', backdrop: '', description: '', episodes: [] });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <select value={data.type} onChange={e => setData({...data, type: e.target.value})}>
        <option value="movie">סרט</option>
        <option value="series">סדרה</option>
      </select>
      <input placeholder="שם הכותר" value={data.title} onChange={e => setData({...data, title: e.target.value})} required />
      <input placeholder="קטגוריה" value={data.category} onChange={e => setData({...data, category: e.target.value})} />
      <input placeholder="לינק פוסטר" value={data.poster} onChange={e => setData({...data, poster: e.target.value})} />
      <input placeholder="לינק רקע" value={data.backdrop} onChange={e => setData({...data, backdrop: e.target.value})} />
      <textarea placeholder="תקציר" value={data.description} onChange={e => setData({...data, description: e.target.value})} />
      
      {data.type === 'movie' ? (
        <input placeholder="לינק וידאו" value={data.link} onChange={e => setData({...data, link: e.target.value})} />
      ) : (
        <div className="ep-manager">
          <p>נהל פרקים</p>
          <button type="button" onClick={() => setData({...data, episodes: [...data.episodes, { title: '', link: '' }]})}>+ הוסף פרק</button>
          {data.episodes.map((ep, i) => (
            <div key={i} className="ep-input">
              <input placeholder="שם פרק" value={ep.title} onChange={e => {
                const newEps = [...data.episodes];
                newEps[i].title = e.target.value;
                setData({...data, episodes: newEps});
              }} />
              <input placeholder="לינק פרק" value={ep.link} onChange={e => {
                const newEps = [...data.episodes];
                newEps[i].link = e.target.value;
                setData({...data, episodes: newEps});
              }} />
            </div>
          ))}
        </div>
      )}
      <button type="submit" className="btn-main">הוסף לספרייה</button>
    </form>
  );
}

// ------------------------------------------------------------
// 4. MAIN APP
// ------------------------------------------------------------
export default function ZovexApp() {
  const [movies, dispatch] = useReducer(moviesReducer, [], () => {
    const saved = localStorage.getItem(DB_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('home');
  const [current, setCurrent] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(movies));
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter(m => 
      m.title.toLowerCase().includes(search.toLowerCase()) || 
      m.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [movies, search]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.toLowerCase() === ADMIN_PASSWORD) {
      setShowAdmin(true);
      setSearch("");
    }
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(movies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zovex_backup.json';
    a.click();
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <style>{CSS}</style>

      {/* Navbar */}
      <nav className="nav">
        <div className="logo" onClick={() => setView('home')}>ZOVEX</div>
        <div className="nav-tools">
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="חיפוש או קוד..." 
              value={search} 
              onChange={handleSearch} 
            />
          </div>
          <button className="icon-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container">
        {view === 'home' ? (
          <>
            {movies.length > 0 && !search && (
              <div className="hero" style={{ backgroundImage: `url(${movies[0].backdrop || movies[0].poster})` }}>
                <div className="hero-overlay" />
                <div className="hero-content">
                  <h1>{movies[0].title}</h1>
                  <p>{movies[0].description}</p>
                  <div className="hero-btns">
                    <button className="btn-main" onClick={() => setVideoSrc(movies[0].link || movies[0].episodes?.[0]?.link)}>▶ נגן</button>
                    <button className="btn-sec" onClick={() => { setCurrent(movies[0]); setView('detail'); }}>ℹ מידע</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid-section">
              <h3>{search ? `תוצאות עבור: ${search}` : 'הוספו לאחרונה'}</h3>
              <div className="movie-grid">
                {filteredMovies.map(m => (
                  <MovieCard key={m.id} movie={m} onClick={(movie) => { setCurrent(movie); setView('detail'); }} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setView('home')}>← חזרה</button>
            <div className="detail-header" style={{ backgroundImage: `url(${current.backdrop || current.poster})` }}>
              <div className="hero-overlay" />
              <div className="detail-info">
                <h1>{current.title}</h1>
                <span className="badge">{current.category}</span>
                <p>{current.description}</p>
              </div>
            </div>
            <div className="episode-list">
              <h3>פרקים / צפייה</h3>
              {current.type === 'series' ? (
                current.episodes.map((ep, i) => (
                  <div key={i} className="ep-item" onClick={() => setVideoSrc(ep.link)}>
                    <div className="ep-num">{i + 1}</div>
                    <div className="ep-title">{ep.title || `פרק ${i + 1}`}</div>
                    <div className="ep-play">▶</div>
                  </div>
                ))
              ) : (
                <button className="btn-main" onClick={() => setVideoSrc(current.link)}>צפה בסרט המלא</button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Admin Panel */}
      {showAdmin && (
        <div className="admin-modal">
          <div className="admin-content">
            <div className="admin-header">
              <h2>ניהול תוכן</h2>
              <button onClick={() => setShowAdmin(false)}>✕</button>
            </div>
            <AdminForm onAdd={(data) => dispatch({ type: 'ADD', payload: data })} />
            <div className="admin-list">
              {movies.map(m => (
                <div key={m.id} className="admin-item">
                  <span>{m.title}</span>
                  <button onClick={() => dispatch({ type: 'DELETE', id: m.id })}>🗑</button>
                </div>
              ))}
            </div>
            <button className="btn-sec" onClick={exportBackup} style={{ width: '100%', marginTop: '10px' }}>📥 גיבוי נתונים</button>
          </div>
        </div>
      )}

      {videoSrc && <VideoPlayer src={videoSrc} onClose={() => setVideoSrc(null)} />}
    </div>
  );
}

// ------------------------------------------------------------
// 5. CSS
// ------------------------------------------------------------
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;800&display=swap');

  :root {
    --primary: #e50914;
    --neon: #e50914;
    --bg: #0f172a;
    --card: #1e293b;
    --text: #f8fafc;
    --dim: #cbd5e1;
  }

  .light {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --dim: #64748b;
    --primary: #2563eb;
    --neon: #2563eb;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Assistant', sans-serif; background: var(--bg); color: var(--text); direction: rtl; transition: background 0.3s; }

  .app { min-height: 100vh; }

  .nav { 
    position: fixed; top: 0; width: 100%; height: 70px; 
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 40px; 
    background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
    backdrop-filter: blur(10px); z-index: 1000;
  }

  .logo { 
    font-weight: 900; font-size: 28px; color: var(--primary); 
    cursor: pointer; letter-spacing: 2px; text-shadow: 0 0 10px rgba(229,9,20,0.5);
  }

  .nav-tools { display: flex; align-items: center; gap: 15px; }

  .search-wrap input {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    padding: 10px 20px; border-radius: 25px; color: var(--text); outline: none; width: 250px;
    transition: all 0.3s;
  }
  .search-wrap input:focus { border-color: var(--primary); background: rgba(255,255,255,0.15); }

  .icon-btn { 
    background: rgba(255,255,255,0.1); border: none; padding: 10px 15px; 
    border-radius: 50%; cursor: pointer; font-size: 18px; transition: 0.3s;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }

  .container { padding-top: 70px; }

  .hero {
    height: 75vh; background-size: cover; background-position: center;
    position: relative; display: flex; align-items: flex-end; padding: 60px;
  }

  .hero-overlay { 
    position: absolute; inset: 0; 
    background: linear-gradient(to top, var(--bg) 0%, transparent 60%); 
  }

  .hero-content { position: relative; z-index: 10; max-width: 650px; }
  .hero-content h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 15px; font-weight: 900; }
  .hero-content p { font-size: 18px; line-height: 1.6; margin-bottom: 25px; opacity: 0.9; }

  .hero-btns { display: flex; gap: 15px; }

  .btn-main { 
    background: var(--primary); color: white; border: none; 
    padding: 14px 35px; border-radius: 6px; cursor: pointer; 
    font-weight: bold; font-size: 16px; transition: 0.3s;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-main:hover { background: #c40812; transform: translateY(-2px); box-shadow: 0 5px 20px rgba(229,9,20,0.4); }

  .btn-sec { 
    background: rgba(255,255,255,0.25); color: white; border: none; 
    padding: 14px 35px; border-radius: 6px; cursor: pointer; 
    font-weight: bold; font-size: 16px; transition: 0.3s;
  }
  .btn-sec:hover { background: rgba(255,255,255,0.35); }

  .grid-section { padding: 40px; }
  .grid-section h3 { font-size: 24px; margin-bottom: 25px; font-weight: 700; }

  .movie-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 25px;
  }

  .card { cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; }
  .card-thumb { 
    position: relative; aspect-ratio: 2/3; border-radius: 12px; overflow: hidden; 
    box-shadow: 0 8px 25px rgba(0,0,0,0.6);
  }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .card:hover { transform: translateY(-8px); }
  .card:hover .card-thumb { box-shadow: 0 15px 40px rgba(229,9,20,0.5); }

  .card-overlay { 
    position: absolute; inset: 0; 
    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); 
    display: flex; align-items: center; justify-content: center; 
    opacity: 0; transition: 0.3s;
  }
  .card:hover .card-overlay { opacity: 1; }

  .play-btn-circle { 
    width: 60px; height: 60px; border-radius: 50%; 
    border: 3px solid white; background: rgba(229,9,20,0.9);
    display: flex; align-items: center; justify-content: center; 
    color: white; font-size: 24px;
  }

  .card-badge {
    position: absolute; top: 10px; right: 10px;
    background: var(--primary); color: white;
    padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold;
  }

  .card-info { margin-top: 12px; }
  .card-info h4 { font-size: 16px; font-weight: 600; margin-bottom: 5px; }
  .card-info span { font-size: 13px; color: var(--dim); }

  .detail-view { padding: 20px 40px; }

  .back-btn {
    background: rgba(255,255,255,0.1); border: none; color: white;
    padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-bottom: 20px;
    font-size: 16px; transition: 0.3s;
  }
  .back-btn:hover { background: rgba(255,255,255,0.2); }

  .detail-header {
    height: 50vh; background-size: cover; background-position: center;
    position: relative; border-radius: 15px; overflow: hidden;
    display: flex; align-items: flex-end; padding: 40px;
    margin-bottom: 30px;
  }

  .detail-info { position: relative; z-index: 10; }
  .detail-info h1 { font-size: 3rem; margin-bottom: 15px; }
  .detail-info .badge { 
    background: var(--primary); color: white; padding: 6px 15px; 
    border-radius: 5px; font-size: 14px; display: inline-block; margin-bottom: 15px;
  }
  .detail-info p { font-size: 16px; line-height: 1.6; max-width: 700px; }

  .episode-list { background: var(--card); padding: 30px; border-radius: 15px; }
  .episode-list h3 { margin-bottom: 20px; font-size: 22px; }

  .ep-item {
    display: flex; align-items: center; background: rgba(255,255,255,0.05); 
    padding: 18px; margin-bottom: 12px; border-radius: 10px; cursor: pointer; 
    transition: 0.2s; border: 1px solid transparent;
  }
  .ep-item:hover { background: var(--primary); border-color: rgba(255,255,255,0.2); }
  .ep-num { 
    font-weight: bold; margin-left: 20px; opacity: 0.6; 
    min-width: 30px; font-size: 18px;
  }
  .ep-title { flex: 1; font-size: 16px; }
  .ep-play { font-size: 20px; opacity: 0.7; }

  .admin-modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 2000;
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .admin-content { 
    background: var(--card); padding: 35px; border-radius: 20px; 
    width: 100%; max-width: 550px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    border: 1px solid rgba(229,9,20,0.2);
  }
  .admin-header { 
    display: flex; justify-content: space-between; align-items: center; 
    margin-bottom: 25px; border-bottom: 2px solid var(--primary); padding-bottom: 15px;
  }
  .admin-header h2 { font-size: 24px; color: var(--primary); }
  .admin-header button { 
    background: rgba(255,255,255,0.1); border: none; color: white;
    padding: 8px 15px; border-radius: 50%; cursor: pointer; font-size: 20px;
  }

  .admin-form input, .admin-form textarea, .admin-form select {
    width: 100%; margin-bottom: 12px; padding: 12px 15px; 
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
    color: white; border-radius: 8px; font-family: 'Assistant', sans-serif; font-size: 14px;
    transition: 0.3s;
  }
  .admin-form input:focus, .admin-form textarea:focus, .admin-form select:focus {
    outline: none; border-color: var(--primary); background: rgba(255,255,255,0.08);
  }
  .admin-form textarea { resize: vertical; min-height: 80px; }

  .ep-manager { 
    background: rgba(255,255,255,0.03); padding: 15px; 
    border-radius: 8px; margin-bottom: 12px;
  }
  .ep-manager p { margin-bottom: 10px; font-size: 14px; opacity: 0.8; }
  .ep-manager button { 
    background: var(--primary); color: white; border: none;
    padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-bottom: 12px;
    font-size: 13px;
  }
  .ep-input { display: flex; gap: 10px; margin-bottom: 10px; }

  .admin-list { margin: 25px 0; max-height: 250px; overflow-y: auto; }
  .admin-item {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(255,255,255,0.05); padding: 12px 15px; 
    margin-bottom: 8px; border-radius: 8px;
  }
  .admin-item button {
    background: rgba(220,38,38,0.2); border: none; color: #ff6b6b;
    padding: 6px 12px; border-radius: 5px; cursor: pointer; transition: 0.2s;
  }
  .admin-item button:hover { background: rgba(220,38,38,0.4); }

  .vid-ov { 
    position: fixed; inset: 0; background: black; z-index: 3000; 
    display: flex; align-items: center; justify-content: center;
  }
  .vid-ov iframe { width: 100%; height: 100%; border: none; }
  .vid-close { 
    position: fixed; top: 25px; right: 25px; 
    background: rgba(0,0,0,0.9); border: 2px solid rgba(255,255,255,0.3);
    color: white; padding: 12px; border-radius: 50%; cursor: pointer; z-index: 10;
    font-size: 24px; width: 50px; height: 50px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.3s;
  }
  .vid-close:hover { 
    background: rgba(255,255,255,0.2); transform: scale(1.1); 
  }
  
  @media (max-width: 768px) {
    .hero { padding: 30px 20px; height: 60vh; }
    .hero-content h1 { font-size: 2rem; }
    .nav { padding: 0 20px; }
    .movie-grid { padding: 20px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
    .grid-section { padding: 20px; }
    .detail-view { padding: 20px; }
    .detail-header { height: 40vh; padding: 20px; }
    .search-wrap input { width: 180px; }
  }
`;