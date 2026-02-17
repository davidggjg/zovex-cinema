import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Grid, List, Filter } from "lucide-react";
import WatchlistButton from "../components/home/WatchlistButton";
import RatingStars from "../components/home/RatingStars";
import ShareButton from "../components/home/ShareButton";

// Helper Functions
const extractYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const getEmbedUrl = (videoId, type) => {
  if (!videoId) return "";
  
  switch (type) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    case "drive":
      return `https://drive.google.com/file/d/${videoId}/preview`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
    case "streamable":
      return `https://streamable.com/e/${videoId}?autoplay=1`;
    case "archive":
      return `https://archive.org/embed/${videoId}`;
    case "rumble":
      // אם זה כבר URL מלא של embed (כולל parameters) - השתמש בו כמו שהוא
      if (videoId.includes('rumble.com/embed/')) {
        return videoId;
      }
      // אם ה-ID כבר מתחיל ב-v, אל תוסיף v נוסף
      const rumbleId = videoId.startsWith('v') ? videoId : `v${videoId}`;
      return `https://rumble.com/embed/${rumbleId}/?pub=4`;
    default:
      return "";
  }
};

const getThumb = (movie) => {
  if (movie.thumbnail_url) return movie.thumbnail_url;
  if (movie.type === "youtube") {
    return `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`;
  }
  // תמונת ברירת מחדל
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop";
};

// Video Player Component with Portal
const VideoPlayer = ({ videoId, type, onClose }) => {
  const embedUrl = getEmbedUrl(videoId, type);
  const originalUrl = type === "rumble" 
    ? `https://rumble.com/v${videoId}` 
    : embedUrl;

  return createPortal(
    <div className="vid-ov" onClick={onClose}>
      <div className="vid-container" onClick={e => e.stopPropagation()}>
        <div className="vid-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.7)', borderBottom: '1px solid rgba(229,9,20,0.3)' }}>
          <button className="vid-close" onClick={onClose} style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '24px' }}>✕</button>
        </div>
        <iframe
          src={embedUrl}
          allowFullScreen
          allow="autoplay; encrypted-media"
          title="Zovex Player"
          style={{ width: '100%', height: 'calc(100% - 140px)', border: 'none' }}
        />
      </div>
    </div>,
    document.body
  );
};

// Movie Card Component
const MovieCard = ({ movie, onClick, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="card netflix-card" 
      onClick={() => onClick(movie)} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={viewMode === 'list' ? { 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '20px', 
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        background: isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: '1px solid transparent',
        borderColor: isHovered ? 'rgba(229,9,20,0.3)' : 'transparent',
      } : {}}
    >
      <div className="card-thumb netflix-thumb" style={viewMode === 'list' ? { width: '280px', aspectRatio: '16/9', flexShrink: 0 } : {}}>
        <img src={getThumb(movie)} alt={movie.title} loading="lazy" />
        <div className={`card-overlay netflix-overlay ${isHovered ? 'hovered' : ''}`}>
          <div className="play-btn-netflix">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" fill="rgba(255,255,255,0.95)" stroke="#e50914" strokeWidth="2"/>
              <path d="M24 20L42 30L24 40V20Z" fill="#000"/>
            </svg>
          </div>
        </div>
        <div className="card-badge-netflix">{movie.type === 'series' ? 'סדרה' : 'סרט'}</div>
        <div className="card-actions" style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px', 
          display: 'flex', 
          gap: '8px', 
          zIndex: 10,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <WatchlistButton movieId={movie.id} size={20} />
          <ShareButton movieTitle={movie.title} movieId={movie.id} size={20} />
        </div>
        {movie.views > 0 && (
          <div className="views-badge" style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            👁 {movie.views.toLocaleString()}
          </div>
        )}
      </div>
      <div className="card-info netflix-info" style={viewMode === 'list' ? { flex: 1 } : {}}>
        <h4 className="netflix-title">{movie.title}</h4>
        {viewMode === 'list' && movie.description && (
          <p className="netflix-desc" style={{ 
            fontSize: '14px', 
            color: 'rgba(255,255,255,0.7)', 
            margin: '8px 0 12px 0', 
            lineHeight: 1.6,
            maxHeight: isHovered ? '100px' : '40px',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
          }}>
            {movie.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="netflix-category">{movie.category}</span>
          {movie.year && <span className="netflix-year">{movie.year}</span>}
        </div>
        <div style={{ marginTop: '10px' }}>
          <RatingStars movieId={movie.id} size={16} interactive={false} />
        </div>
        {movie.tags && movie.tags.length > 0 && (
          <div className="netflix-tags" style={{ 
            marginTop: '10px', 
            display: 'flex', 
            gap: '6px', 
            flexWrap: 'wrap',
            opacity: isHovered || viewMode === 'list' ? 1 : 0,
            maxHeight: isHovered || viewMode === 'list' ? '100px' : '0',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}>
            {movie.tags.slice(0, 4).map(tag => (
              <span key={tag} className="netflix-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [view, setView] = useState('home');
  const [current, setCurrent] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // Group series into single items
  const processedItems = useMemo(() => {
    const seriesMap = new Map();
    const standaloneMovies = [];

    movies.forEach((movie) => {
      if (movie.series_name) {
        if (!seriesMap.has(movie.series_name)) {
          seriesMap.set(movie.series_name, {
            id: `series_${movie.series_name}`,
            title: movie.series_name,
            type: "series",
            thumbnail_url: movie.thumbnail_url,
            video_id: movie.video_id,
            description: movie.description || "",
            category: movie.category,
            episodes: [],
          });
        }
        seriesMap.get(movie.series_name).episodes.push(movie);
      } else {
        standaloneMovies.push(movie);
      }
    });

    // Sort episodes
    seriesMap.forEach((series) => {
      series.episodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    });

    return [...standaloneMovies, ...Array.from(seriesMap.values())];
  }, [movies]);

  // Track view history
  useEffect(() => {
    if (videoData) {
      const history = JSON.parse(localStorage.getItem('zovex_history') || '[]');
      const movieId = current?.id;
      if (movieId && !history.includes(movieId)) {
        history.unshift(movieId);
        if (history.length > 50) history.pop();
        localStorage.setItem('zovex_history', JSON.stringify(history));
      }
      
      // Increment views
      if (movieId && current?.type !== 'series') {
        base44.entities.Movie.update(movieId, { views: (current.views || 0) + 1 }).catch(() => {});
      }
    }
  }, [videoData]);

  // All available tags
  const allTags = useMemo(() => {
    const tags = new Set();
    movies.forEach(m => {
      if (m.tags) m.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [movies]);

  // Filter items
  const filteredMovies = useMemo(() => {
    let filtered = processedItems.filter(m => {
      const matchesSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           m.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
                         (m.tags && selectedTags.some(t => m.tags.includes(t)));
      
      const matchesYear = !yearFilter || m.year?.toString() === yearFilter;
      
      return matchesSearch && matchesTags && matchesYear;
    });

    // Sort
    if (sortBy === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'views') {
      filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'title') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title, 'he'));
    }

    return filtered;
  }, [processedItems, searchQuery, selectedTags, yearFilter, sortBy]);

  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    if (val === "ZOVEX_ADMIN_2026") {
      setShowAdminPrompt(true);
      setAdminPassword("");
      setSearchQuery("");
    } else {
      setSearchQuery(val);
    }
  };

  const handleAdminSubmit = () => {
    if (adminPassword === "ZOVEX_ADMIN_2026") {
      setShowAdminPrompt(false);
      window.location.href = "/Admin";
    } else {
      alert("סיסמה שגויה");
      setAdminPassword("");
    }
  };

  return (
    <div className="app light">
      <style>{CSS}</style>

      {/* Navbar */}
      <nav className="nav">
        <div className="logo" onClick={() => { setView('home'); setSearchQuery(''); }}>ZOVEX</div>
        <div className="nav-tools">
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="חיפוש..." 
              value={searchQuery} 
              onChange={handleSearch} 
            />
          </div>
          <button 
            className="icon-btn"
            onClick={() => setView(view === 'watchlist' ? 'home' : 'watchlist')}
            style={{ 
              background: view === 'watchlist' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
              borderColor: view === 'watchlist' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            📚
          </button>
          <button 
            className="icon-btn"
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              background: showFilters ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
              borderColor: showFilters ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <Filter size={18} color="#ffffff" />
          </button>
          <button 
            className="icon-btn"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={18} color="#ffffff" /> : <Grid size={18} color="#ffffff" />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container">
        {/* Filters Panel */}
        {showFilters && view === 'home' && (
          <div style={{ 
            padding: '20px 60px', 
            background: 'var(--card)', 
            borderBottom: '1px solid var(--border)',
            marginTop: '20px',
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>מיין לפי:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontFamily: "'Assistant',sans-serif",
                  }}
                >
                  <option value="recent">הוספו לאחרונה</option>
                  <option value="views">הכי נצפים</option>
                  <option value="title">לפי שם</option>
                </select>
              </div>
              
              {[...new Set(movies.map(m => m.year).filter(Boolean))].length > 0 && (
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>שנה:</label>
                  <select 
                    value={yearFilter} 
                    onChange={(e) => setYearFilter(e.target.value)}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '14px',
                      fontFamily: "'Assistant',sans-serif",
                    }}
                  >
                    <option value="">כל השנים</option>
                    {[...new Set(movies.map(m => m.year).filter(Boolean))].sort((a, b) => b - a).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {allTags.length > 0 && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>תגיות:</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        style={{
                          background: selectedTags.includes(tag) ? 'var(--accent)' : 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: selectedTags.includes(tag) ? '#fff' : 'var(--text)',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontFamily: "'Assistant',sans-serif",
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(229,9,20,0.2)',
                borderTop: '4px solid #e50914',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : view === 'watchlist' ? (
          <div className="grid-section">
            <h3>רשימת הצפייה שלי</h3>
            <div className={viewMode === 'grid' ? "movie-grid" : "movie-list"}>
              {(() => {
                const watchlist = JSON.parse(localStorage.getItem('zovex_watchlist') || '[]');
                const watchlistMovies = processedItems.filter(m => watchlist.includes(m.id));
                return watchlistMovies.length > 0 ? (
                  watchlistMovies.map(m => (
                    <MovieCard key={m.id} movie={m} onClick={(movie) => { setCurrent(movie); setView('detail'); }} viewMode={viewMode} />
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                    אין סרטים ברשימת הצפייה
                  </p>
                );
              })()}
            </div>
          </div>
        ) : view === 'home' ? (
          <>
            {searchQuery && (
              <div style={{ padding: '20px 60px' }}>
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: "'Assistant', sans-serif",
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'var(--card)';
                    e.target.style.borderColor = 'var(--border)';
                  }}
                >
                  ← חזרה
                </button>
              </div>
            )}
            {!searchQuery && (
              <>
                {/* Categories Section */}
                <div className="categories-section">
                  <h3>קטגוריות</h3>
                  <div className="categories-grid">
                    {[...new Set(movies.map(m => m.category).filter(Boolean))].sort().map(cat => (
                      <button
                        key={cat}
                        className="category-btn"
                        onClick={() => setSearchQuery(cat)}
                      >
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="hero" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1485579149c0-123dd979885f?w=1200&h=800&fit=crop)`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="hero-overlay" />
                  <div style={{ position: 'relative', zIndex: 10, fontSize: '80px', fontWeight: 800, color: 'white', textShadow: '0 4px 20px rgba(229, 9, 20, 0.6), 0 0 40px rgba(229, 9, 20, 0.4)', letterSpacing: '2px' }}>
                    ZOVEX
                  </div>
                </div>
              </>
            )}

            <div className="grid-section">
              <h3>{searchQuery ? `תוצאות עבור: ${searchQuery}` : sortBy === 'views' ? 'הכי נצפים' : sortBy === 'title' ? 'כל הסרטים' : 'הוספו לאחרונה'}</h3>
              <div className={viewMode === 'grid' ? "movie-grid" : "movie-list"}>
                {filteredMovies.map(m => (
                  <MovieCard key={m.id} movie={m} onClick={(movie) => { setCurrent(movie); setView('detail'); }} viewMode={viewMode} />
                ))}
              </div>
            </div>
          </>
        ) : current ? (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setView('home')}>← חזרה</button>
            <div className="detail-header" style={{ backgroundImage: `url(${getThumb(current)})` }}>
              <div className="hero-overlay" />
              <div className="detail-info">
                <h1>{current.title}</h1>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                  <span className="badge">{current.category}</span>
                  {current.year && <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>{current.year}</span>}
                  {current.views > 0 && <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>👁 {current.views} צפיות</span>}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <RatingStars movieId={current.id} size={24} />
                  <WatchlistButton movieId={current.id} size={20} />
                  <ShareButton movieTitle={current.title} movieId={current.id} size={20} />
                </div>
              </div>
            </div>
            {current.description && (
              <div style={{ padding: '30px 60px', background: 'var(--card)', borderTop: '1px solid var(--border)', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.6, fontSize: '16px' }}>{current.description}</p>
              </div>
            )}

            {/* Similar Movies */}
            {(() => {
              const similar = processedItems
                .filter(m => m.id !== current.id && m.category === current.category)
                .slice(0, 6);
              
              return similar.length > 0 && (
                <div style={{ padding: '30px 60px', background: 'var(--card)', borderTop: '1px solid var(--border)', marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 700 }}>סרטים דומים</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                    {similar.map(m => (
                      <MovieCard key={m.id} movie={m} onClick={(movie) => { setCurrent(movie); window.scrollTo(0, 0); }} viewMode="grid" />
                    ))}
                  </div>
                </div>
              );
            })()}
            <div className="episode-list" style={{ minHeight: 'auto', overflowY: 'visible' }}>
              <h3>פרקים / צפייה</h3>
              {current.type === 'series' ? (
                current.episodes.map((ep, i) => (
                  <div key={ep.id} className="ep-item" onClick={() => setVideoData({ videoId: ep.video_id, type: ep.type })}>
                    <div className="ep-num">{ep.episode_number || i + 1}</div>
                    <div className="ep-title">{ep.title}</div>
                    <div className="ep-play">▶</div>
                  </div>
                ))
              ) : (
                <button className="btn-main" onClick={() => setVideoData({ videoId: current.video_id, type: current.type })}>
                  <span>▶ צפה בסרט המלא</span>
                </button>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {videoData && <VideoPlayer videoId={videoData.videoId} type={videoData.type} onClose={() => setVideoData(null)} />}

      {showAdminPrompt && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          backdropFilter: "blur(5px)",
        }}>
          <div style={{
            background: "#f8fafc",
            border: "2px solid #e50914",
            borderRadius: "12px",
            padding: "40px",
            width: "90%",
            maxWidth: "400px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ color: "#e50914", marginTop: 0, fontSize: 24, fontWeight: 700 }}>פאנל ניהול</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>הכנס סיסמה לגישה</p>
            <input
              type="password"
              placeholder="סיסמה..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdminSubmit()}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                border: "2px solid #e5e7eb",
                borderRadius: "6px",
                background: "#fff",
                color: "#1f2937",
                fontSize: "14px",
                direction: "rtl",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              autoFocus
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowAdminPrompt(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e5e7eb",
                  border: "none",
                  color: "#1f2937",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#d1d5db")}
                onMouseLeave={(e) => (e.target.style.background = "#e5e7eb")}
              >
                ביטול
              </button>
              <button
                onClick={handleAdminSubmit}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e50914",
                  border: "none",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#c40812")}
                onMouseLeave={(e) => (e.target.style.background = "#e50914")}
              >
                כניסה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --bg: #f8fafc;
    --text: #0f172a;
    --card: #ffffff;
    --accent: #e50914;
    --glass: rgba(255, 255, 255, 0.95);
    --border: #e2e8f0;
    --text-secondary: #64748b;
  }

  .light {
    --bg: #f8fafc;
    --text: #0f172a;
    --card: #ffffff;
    --accent: #e50914;
    --glass: rgba(255, 255, 255, 0.95);
    --border: #e2e8f0;
    --text-secondary: #64748b;
  }



  * { 
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body { 
    margin: 0; 
    font-family: 'Inter', 'Assistant', -apple-system, sans-serif; 
    background: var(--bg); 
    color: var(--text); 
    direction: rtl; 
    transition: background 0.3s ease;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .nav { 
    position: fixed; 
    top: 0; 
    width: 100%; 
    height: 70px; 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding: 0 60px; 
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }
  
  .nav.scrolled {
    background: rgba(255,255,255,0.98);
    border-bottom-color: var(--border);
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  }

  .logo { 
    font-weight: 900; 
    font-size: 32px; 
    color: var(--accent); 
    cursor: pointer; 
    letter-spacing: 2px;
    text-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
    transition: all 0.3s ease;
    font-family: 'Inter', sans-serif;
  }
  
  .logo:hover {
    transform: scale(1.05);
    text-shadow: 0 0 30px rgba(229, 9, 20, 0.8);
  }

  .nav-tools { display: flex; align-items: center; gap: 15px; }

  .search-wrap input {
    background: rgba(255, 255, 255, 0.05); 
    border: 2px solid rgba(255, 255, 255, 0.1);
    padding: 12px 20px; 
    border-radius: 50px; 
    color: var(--text); 
    outline: none; 
    width: 280px;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Inter', 'Assistant', sans-serif;
    backdrop-filter: blur(10px);
  }
  
  .search-wrap input:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--accent);
    box-shadow: 0 0 0 4px rgba(229, 9, 20, 0.15), 0 8px 24px rgba(0,0,0,0.3);
    transform: translateY(-2px);
  }
  
  .search-wrap input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .icon-btn { 
    background: rgba(255, 255, 255, 0.1); 
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    padding: 10px;
    width: 44px;
    height: 44px;
    font-size: 18px; 
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ffffff;
    backdrop-filter: blur(10px);
  }
  
  .icon-btn svg {
    color: #ffffff;
    stroke: #ffffff;
  }
  
  .icon-btn:hover {
    background: rgba(229, 9, 20, 0.9);
    border-color: var(--accent);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 24px rgba(229, 9, 20, 0.3);
  }

  .container { padding-top: 70px; }

  .hero {
    height: 85vh; 
    background-size: cover; 
    background-position: center;
    position: relative; 
    display: flex; 
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    overflow: hidden;
    background-attachment: fixed;
  }

  .hero-overlay { 
    position: absolute; 
    inset: 0; 
    background: linear-gradient(
      to top, 
      rgba(20,20,20,1) 0%, 
      rgba(20,20,20,0.7) 40%,
      rgba(20,20,20,0.4) 70%,
      transparent 100%
    );
  }
  
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(20,20,20,0.5) 100%);
  }

  .hero-content { position: relative; z-index: 10; max-width: 600px; }
  .hero-content h1 { 
    font-size: 3.2rem; 
    margin: 0 0 15px 0;
    font-weight: 800;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    color: #fff;
  }
  .hero-content p {
    font-size: 16px;
    margin-bottom: 25px;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    color: #f3f4f6;
    line-height: 1.6;
  }
  .hero-btns { display: flex; gap: 12px; margin-top: 20px; }

  .btn-main { 
    background: linear-gradient(135deg, var(--accent), #ff0050); 
    color: white; 
    border: none; 
    padding: 14px 32px; 
    border-radius: 50px; 
    cursor: pointer; 
    font-weight: 700;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Inter', sans-serif;
    box-shadow: 0 4px 20px rgba(229, 9, 20, 0.3);
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
  }
  
  .btn-main::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #ff0050, var(--accent));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .btn-main:hover::before {
    opacity: 1;
  }
  
  .btn-main:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(229, 9, 20, 0.5);
  }
  
  .btn-main span {
    position: relative;
    z-index: 1;
  }
  
  .btn-sec { 
    background: rgba(255,255,255,0.3); 
    color: white; 
    border: 1px solid rgba(255,255,255,0.5);
    padding: 12px 28px; 
    border-radius: 8px; 
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.2s;
    font-family: 'Assistant', sans-serif;
  }
  .btn-sec:hover {
    background: rgba(255,255,255,0.4);
    border-color: rgba(255,255,255,0.7);
  }

  .categories-section { 
    padding: 60px 60px 40px; 
    background: linear-gradient(180deg, transparent 0%, rgba(20,20,20,0.5) 100%);
  }
  
  .categories-section h3 { 
    margin-bottom: 32px; 
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.5px;
  }
  
  .categories-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .category-btn {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 50px;
    color: var(--text);
    cursor: pointer;
    font-family: 'Inter', 'Assistant', sans-serif;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }
  
  .category-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--accent), #ff0050);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .category-btn:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(229, 9, 20, 0.3);
  }
  
  .category-btn:hover::before {
    opacity: 1;
  }
  
  .category-btn span {
    position: relative;
    z-index: 1;
  }

  .grid-section { 
    padding: 60px 60px 80px; 
    position: relative;
  }
  
  .grid-section::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(229, 9, 20, 0.3) 50%, transparent 100%);
  }
  
  .grid-section h3 { 
    margin-bottom: 40px; 
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.5px;
    position: relative;
    padding-bottom: 16px;
  }
  
  .grid-section h3::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 60px;
    height: 3px;
    background: var(--accent);
    border-radius: 2px;
  }

  .movie-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 32px 20px;
  }

  .movie-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .netflix-card { 
    cursor: pointer; 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  .netflix-card:hover { 
    transform: scale(1.05) translateY(-8px);
    z-index: 20;
  }
  
  .netflix-thumb { 
    position: relative; 
    aspect-ratio: 2/3; 
    border-radius: 8px; 
    overflow: hidden; 
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .netflix-card:hover .netflix-thumb {
    box-shadow: 0 16px 48px rgba(0,0,0,0.8), 0 0 0 2px rgba(229, 9, 20, 0.4);
    border-color: rgba(229, 9, 20, 0.5);
  }
  
  .netflix-thumb img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }
  
  .netflix-card:hover .netflix-thumb img {
    transform: scale(1.08);
  }

  .netflix-overlay { 
    position: absolute; 
    inset: 0; 
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.95) 0%,
      rgba(0,0,0,0.6) 50%,
      rgba(0,0,0,0.3) 100%
    );
    display: flex; 
    align-items: center; 
    justify-content: center; 
    opacity: 0; 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(0px);
  }
  
  .netflix-overlay.hovered { 
    opacity: 1;
    backdrop-filter: blur(4px);
  }

  .play-btn-netflix { 
    transform: scale(0.8);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
  }
  
  .netflix-overlay.hovered .play-btn-netflix {
    transform: scale(1);
    opacity: 1;
  }
  
  .play-btn-netflix:hover {
    transform: scale(1.1);
  }

  .card-badge-netflix { 
    position: absolute; 
    top: 12px; 
    right: 12px; 
    background: rgba(229, 9, 20, 0.95);
    backdrop-filter: blur(10px);
    color: white; 
    padding: 6px 14px; 
    border-radius: 20px; 
    font-size: 11px; 
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
  }

  .netflix-info { 
    padding: 16px 0; 
  }
  
  .netflix-title { 
    margin: 0 0 8px 0; 
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    font-family: 'Inter', sans-serif;
    line-height: 1.3;
    letter-spacing: -0.3px;
    transition: color 0.2s ease;
  }
  
  .netflix-card:hover .netflix-title {
    color: var(--accent);
  }
  
  .netflix-category { 
    font-size: 13px; 
    color: var(--text-secondary);
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }
  
  .netflix-year {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }
  
  .netflix-desc {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }
  
  .netflix-tag {
    font-size: 11px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.3px;
  }

  .detail-view { padding: 40px 60px; }
  .back-btn { 
    background: var(--card); 
    border: 1px solid var(--border);
    color: var(--text); 
    padding: 10px 20px; 
    border-radius: 8px; 
    cursor: pointer; 
    margin-bottom: 30px;
    font-weight: 500;
    transition: all 0.2s;
    font-family: 'Assistant', sans-serif;
  }
  .back-btn:hover {
    border-color: var(--accent);
    background: #f3f4f6;
  }

  .detail-header {
    height: 50vh; 
    background-size: cover; 
    background-position: center;
    position: relative; 
    display: flex; 
    align-items: flex-end; 
    padding: 50px; 
    border-radius: 16px; 
    overflow: hidden;
    margin-bottom: 40px;
    border: 1px solid var(--border);
  }

  .detail-info { position: relative; z-index: 10; }
  .detail-info h1 { 
    font-size: 2.6rem; 
    margin: 0 0 12px 0;
    font-weight: 800;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    color: #fff;
  }
  .badge { 
    background: var(--accent); 
    color: white; 
    padding: 6px 16px; 
    border-radius: 20px; 
    font-size: 12px; 
    display: inline-block; 
    margin: 12px 0;
    font-weight: 600;
  }

  .episode-list { margin-top: 20px; }
  .episode-list h3 { 
    margin-bottom: 24px;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
  }

  .ep-item {
    display: flex; 
    align-items: center; 
    background: var(--card); 
    padding: 16px 20px; 
    margin-bottom: 12px; 
    border-radius: 10px; 
    cursor: pointer; 
    transition: all 0.2s;
    border: 1px solid var(--border);
  }
  .ep-item:hover { 
    background: #f3f4f6;
    border-color: var(--accent);
    box-shadow: 0 2px 8px rgba(229, 9, 20, 0.1);
  }
  .ep-num { 
    font-weight: 600; 
    margin-left: 16px; 
    color: var(--text-secondary);
    font-size: 16px; 
  }
  .ep-title { 
    flex: 1;
    font-size: 15px;
    font-weight: 500;
    color: var(--text);
  }
  .ep-play { 
    font-size: 18px;
    color: var(--accent);
  }

  .vid-ov { 
    position: fixed; 
    inset: 0; 
    background: #000; 
    z-index: 3000; 
  }
  .vid-container { 
    width: 100%; 
    height: 100%; 
    position: relative; 
  }
  .vid-container iframe { 
    width: 100%; 
    height: 100%; 
    border: none; 
  }
  .vid-close { 
    position: absolute; 
    top: 24px; 
    right: 24px; 
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 10px; 
    border-radius: 8px; 
    cursor: pointer; 
    z-index: 10; 
    font-size: 24px; 
    width: 48px; 
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .vid-close:hover {
    background: rgba(255,255,255,0.2);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  .netflix-card {
    animation: fadeInUp 0.6s ease-out both;
  }
  
  .netflix-card:nth-child(1) { animation-delay: 0.05s; }
  .netflix-card:nth-child(2) { animation-delay: 0.1s; }
  .netflix-card:nth-child(3) { animation-delay: 0.15s; }
  .netflix-card:nth-child(4) { animation-delay: 0.2s; }
  .netflix-card:nth-child(5) { animation-delay: 0.25s; }
  .netflix-card:nth-child(6) { animation-delay: 0.3s; }
  
  @media (max-width: 768px) {
    .hero { padding: 20px; height: 60vh; margin: 0; }
    .hero-content h1 { font-size: 2rem; }
    .nav { padding: 0 20px; }
    .logo { font-size: 24px; }
    .search-wrap input { width: 180px; font-size: 13px; }
    .movie-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px 12px; }
    .grid-section { padding: 40px 20px; }
    .categories-section { padding: 40px 20px; }
    .detail-view { padding: 20px; }
    .detail-header { padding: 30px; height: 50vh; }
    .detail-info h1 { font-size: 2rem; }
    .episode-list { padding: 20px; }
    .ep-item { padding: 12px 16px; }
  }
`;