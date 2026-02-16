import React, {
  useState, useEffect, useReducer, useCallback, useMemo, useRef
} from 'react';
import { createPortal } from 'react-dom';

// ------------------------------------------------------------
// 1. HELPERS & UTILS
// ------------------------------------------------------------
const DB_KEY = "zovex_master_db";
const ADMIN_PASSWORD = "admin"; // ניתן להחליף ב-Hash בקלות

// חילוץ מזהה יוטיוב וניקוי לינקים
const extractYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const getEmbedUrl = (link) => {
  if (!link) return "";
  
  // ניקוי לינקים משרתי וידאו נפוצים (VidHide/StreamWish)
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
// 2. REDUCER & HOOKS
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

// נגן וידאו בפורטל
const VideoPlayer = ({ src, onClose }) => {
  return createPortal(
    <div className="vid-ov" onClick={onClose}>
      <div className="vid-container" onClick={e => e.stopPropagation()}>
        <button className="vid-close" onClick={onClose}>✕</button>
        <iframe
          src={getEmbedUrl(src)}
          allowFullScreen
          allow="autoplay; encrypted-media"
          title="Zovex Player"
        />
      </div>
    </div>,
    document.body
  );
};

// כרטיס סרט
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

// ------------------------------------------------------------
// 4. MAIN APP
// ------------------------------------------------------------
export default function ZovexApp() {
  const [movies, dispatch] = useReducer(moviesReducer, [], () => {
    const saved = localStorage.getItem(DB_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('home'); // home | detail
  const [current, setCurrent] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(movies));
  }, [movies]);

  // סינון
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

// קומפוננטת טופס פנימית לאדמין
function AdminForm({ onAdd }) {
  const [data, setData] = useState({ title: '', type: 'movie', category: '', link: '', poster: '', backdrop: '', description: '', episodes: [] });

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
          <p>נהל פרקים (הוסף בפורמט: שם|לינק)</p>
          <button type="button" onClick={() => setData({...data, episodes: [...data.episodes, { title: '', link: '' }]})}>+ הוסף פרק</button>
          {data.episodes.map((ep, i) => (
            <div key={i} className="ep-input">
              <input placeholder="שם" value={ep.title} onChange={e => {
                const newEps = [...data.episodes];
                newEps[i].title = e.target.value;
                setData({...data, episodes: newEps});
              }} />
              <input placeholder="לינק" value={ep.link} onChange={e => {
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
// 5. CSS (MODERN & NEON)
// ------------------------------------------------------------
const CSS = `
  :root {
    --primary: #e50914;
    --neon: #00d2ff;
    --bg: #080b12;
    --card: #111827;
    --text: #ffffff;
    --dim: #94a3b8;
  }

  .light {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --dim: #64748b;
    --primary: #2563eb;
  }

  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Assistant', sans-serif; background: var(--bg); color: var(--text); direction: rtl; transition: 0.3s; }

  .nav { 
    position: fixed; top: 0; width: 100%; height: 70px; 
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 40px; 
    background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
    backdrop-filter: blur(10px); z-index: 1000;
  }

  .logo { font-weight: 900; font-size: 24px; color: var(--neon); cursor: pointer; letter-spacing: 2px; }

  .nav-tools { display: flex; align-items: center; gap: 15px; }

  .search-wrap input {
    background: rgba(255,255,255,0.1); border: 1px solid var(--dim);
    padding: 8px 15px; border-radius: 20px; color: var(--text); outline: none; width: 200px;
  }

  .icon-btn { background: none; border: none; font-size: 20px; cursor: pointer; }

  .container { padding-top: 70px; }

  .hero {
    height: 70vh; background-size: cover; background-position: center;
    position: relative; display: flex; align-items: flex-end; padding: 60px;
  }

  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg), transparent); }

  .hero-content { position: relative; z-index: 10; max-width: 600px; }
  .hero-content h1 { font-size: 3rem; margin: 0; }
  .hero-btns { display: flex; gap: 10px; margin-top: 20px; }

  .btn-main { background: var(--primary); color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; font-weight: bold; }
  .btn-sec { background: rgba(255,255,255,0.2); color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; }

  .grid-section { padding: 40px; }
  .grid-section h3 { margin-bottom: 20px; font-size: 24px; }

  .movie-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }

  .card { cursor: pointer; transition: 0.3s; }
  .card-thumb { 
    position: relative; aspect-ratio: 2/3; border-radius: 10px; overflow: hidden; 
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  }
  .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .card:hover { transform: scale(1.05); }

  .card-overlay { 
    position: absolute; inset: 0; background: rgba(0,0,0,0.4); 
    display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s;
  }
  .card:hover .card-overlay { opacity: 1; }

  .play-btn-circle { 
    width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; 
    display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;
  }

  .card-badge { 
    position: absolute; top: 10px; right: 10px; 
    background: var(--primary); color: white; 
    padding: 5px 10px; border-radius: 5px; font-size: 10px; font-weight: bold;
  }

  .card-info { padding: 10px 0; }
  .card-info h4 { margin: 0 0 5px 0; font-size: 14px; }
  .card-info span { font-size: 12px; opacity: 0.7; }

  .detail-view { padding: 40px; }
  .back-btn { background: var(--card); border: none; color: var(--text); padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-bottom: 20px; }

  .detail-header {
    height: 50vh; background-size: cover; background-position: center;
    position: relative; display: flex; align-items: flex-end; padding: 40px; border-radius: 10px; overflow: hidden;
  }

  .detail-info { position: relative; z-index: 10; }
  .detail-info h1 { font-size: 2.5rem; margin: 0; }
  .badge { background: var(--primary); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; display: inline-block; margin: 10px 0; }

  .episode-list { margin-top: 30px; }
  .episode-list h3 { margin-bottom: 15px; }

  .ep-item {
    display: flex; align-items: center; background: var(--card); 
    padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: 0.2s;
  }
  .ep-item:hover { background: var(--primary); }
  .ep-num { font-weight: bold; margin-left: 15px; opacity: 0.5; font-size: 18px; }
  .ep-title { flex: 1; }
  .ep-play { font-size: 20px; }

  .admin-modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000;
    display: flex; align-items: center; justify-content: center;
  }
  .admin-content { background: var(--card); padding: 30px; border-radius: 15px; width: 500px; max-height: 90vh; overflow-y: auto; }
  .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .admin-header h2 { margin: 0; }
  .admin-header button { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text); }

  .admin-form input, .admin-form textarea, .admin-form select {
    width: 100%; margin-bottom: 10px; padding: 10px; background: var(--bg); border: 1px solid #333; color: var(--text); border-radius: 5px;
  }

  .admin-list { max-height: 300px; overflow-y: auto; margin: 20px 0; }
  .admin-item { 
    display: flex; justify-content: space-between; align-items: center; 
    padding: 10px; background: var(--bg); margin-bottom: 5px; border-radius: 5px;
  }
  .admin-item button { background: var(--primary); border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer; }

  .ep-manager { border: 1px solid #333; padding: 15px; border-radius: 5px; margin: 10px 0; }
  .ep-input { display: flex; gap: 10px; margin-top: 10px; }

  .vid-ov { position: fixed; inset: 0; background: black; z-index: 3000; }
  .vid-container { width: 100%; height: 100%; position: relative; }
  .vid-container iframe { width: 100%; height: 100%; border: none; }
  .vid-close { position: absolute; top: 20px; right: 20px; background: white; border: none; padding: 15px; border-radius: 50%; cursor: pointer; z-index: 10; font-size: 20px; width: 50px; height: 50px; }
  
  @media (max-width: 600px) {
    .hero { padding: 20px; height: 50vh; }
    .hero-content h1 { font-size: 2rem; }
    .nav { padding: 0 15px; }
    .movie-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
    .detail-view { padding: 20px; }
    .admin-content { width: 90%; }
  }
`;