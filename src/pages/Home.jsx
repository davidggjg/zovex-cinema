import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, ChevronLeft } from "lucide-react";

import GridView from "../components/home/GridView";
import DetailView from "../components/home/DetailView";
import VideoPlayer from "../components/home/VideoPlayer";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // Group series into single items
  const processedItems = (() => {
    const seriesMap = new Map();
    const standaloneMovies = [];

    movies.forEach((movie) => {
      if (movie.series_name) {
        if (!seriesMap.has(movie.series_name)) {
          seriesMap.set(movie.series_name, {
            id: `series_${movie.series_name}`,
            title: movie.series_name,
            type: "series",
            cover: movie.thumbnail_url || `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`,
            backdrop: movie.thumbnail_url || `https://img.youtube.com/vi/${movie.video_id}/maxresdefault.jpg`,
            description: movie.description || "סדרה מרתקת",
            year: "2023",
            age: "16+",
            match: "98% התאמה",
            category: movie.category,
            episodes: [],
          });
        }
        seriesMap.get(movie.series_name).episodes.push(movie);
      } else {
        standaloneMovies.push({
          id: movie.id,
          title: movie.title,
          type: "movie",
          cover: movie.thumbnail_url || `https://img.youtube.com/vi/${movie.video_id}/mqdefault.jpg`,
          backdrop: movie.thumbnail_url || `https://img.youtube.com/vi/${movie.video_id}/maxresdefault.jpg`,
          description: movie.description || "",
          year: "2024",
          age: "13+",
          match: "85% התאמה",
          category: movie.category,
          movieData: movie,
        });
      }
    });

    // Sort episodes
    seriesMap.forEach((series) => {
      series.episodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    });

    return [...standaloneMovies, ...Array.from(seriesMap.values())];
  })();

  // Theme switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Check for secret code
  const SECRET_CODE = "ZOVEX_ADMIN_2026";
  const ADMIN_PASSWORD = "cyber2026";
  
  useEffect(() => {
    if (searchQuery.trim() === SECRET_CODE) {
      setShowAdminAccess(true);
    } else {
      setShowAdminAccess(false);
    }
  }, [searchQuery]);

  // Filter items by search
  const filteredItems = processedItems.filter(item => 
    searchQuery === SECRET_CODE || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;800&display=swap');
        
        :root {
          --bg: #0f172a;
          --text: #f8fafc;
          --card: #1e293b;
          --accent: #e50914;
          --glass: rgba(15, 23, 42, 0.9);
        }

        [data-theme='light'] {
          --bg: #ffffff;
          --text: #1a1a1a;
          --card: #f3f4f6;
          --accent: #2563eb;
          --glass: rgba(255, 255, 255, 0.9);
        }

        body { 
          margin: 0; 
          font-family: 'Assistant', sans-serif; 
          background: var(--bg); 
          color: var(--text); 
          direction: rtl; 
          transition: background 0.3s ease; 
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
        
        .hero-gradient { background: linear-gradient(to top, var(--bg) 0%, transparent 100%); }
        .btn { cursor: pointer; transition: transform 0.2s; }
        .btn:hover { transform: scale(1.05); }
        .card-hover { transition: transform 0.3s, box-shadow 0.3s; }
        .card-hover:hover { transform: scale(1.03); z-index: 10; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
      `}</style>

      {/* Navbar */}
      {!selectedItem && !videoSrc && (
        <nav style={{ 
          position: 'fixed', 
          top: 0, 
          width: '100%', 
          zIndex: 100, 
          padding: '20px 40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' 
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '900', 
            color: 'var(--accent)', 
            margin: 0, 
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)' 
          }}>
            ZOVEX
          </h1>
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="btn" 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '50%', 
              padding: '10px', 
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid rgba(229, 9, 20, 0.3)', 
            borderTop: '3px solid #e50914', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !selectedItem && (
        <>
          {/* Search Bar */}
          <div style={{ 
            padding: '120px 40px 20px', 
            maxWidth: '1600px', 
            margin: '0 auto' 
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש סרטים וסדרות..."
              style={{
                width: '100%',
                maxWidth: '600px',
                padding: '15px 20px',
                fontSize: '16px',
                background: 'var(--card)',
                border: '2px solid rgba(229, 9, 20, 0.3)',
                borderRadius: '8px',
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(229, 9, 20, 0.3)'}
            />

            {/* Admin Access Button */}
            {showAdminAccess && (
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => {
                    setShowPasswordDialog(true);
                    setPassword("");
                    setPasswordError("");
                  }}
                  className="btn"
                  style={{
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--accent), #c40812)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)',
                  }}
                >
                  🔐 גישה לפאנל ניהול
                </button>
              </div>
            )}
          </div>

          <GridView items={searchQuery === SECRET_CODE ? [] : filteredItems} onSelect={setSelectedItem} />
        </>
      )}

      {/* Detail View */}
      {selectedItem && (
        <DetailView 
          item={selectedItem} 
          onBack={() => setSelectedItem(null)} 
          onPlay={(src) => setVideoSrc(src)} 
        />
      )}

      {/* Video Player */}
      {videoSrc && (
        <VideoPlayer src={videoSrc} onClose={() => setVideoSrc(null)} />
      )}

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasswordDialog(false);
              setPassword("");
              setPasswordError("");
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            width: '90%',
            maxWidth: '400px',
            padding: '30px',
            background: 'var(--card)',
            borderRadius: '12px',
            border: '2px solid var(--accent)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: 'var(--accent)',
            }}>
              🔐 הזן סיסמה
            </h2>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (password === ADMIN_PASSWORD) {
                    window.location.href = "/Admin";
                  } else {
                    setPasswordError("סיסמה שגויה");
                  }
                }
              }}
              placeholder="הכנס סיסמה..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'var(--text)',
                outline: 'none',
                marginBottom: '15px',
              }}
            />

            {passwordError && (
              <div style={{
                padding: '10px',
                marginBottom: '15px',
                background: 'rgba(229, 9, 20, 0.1)',
                border: '1px solid var(--accent)',
                borderRadius: '6px',
                color: 'var(--accent)',
                fontSize: '14px',
                textAlign: 'center',
              }}>
                {passwordError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                  setPasswordError("");
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                ביטול
              </button>
              <button
                onClick={() => {
                  if (password === ADMIN_PASSWORD) {
                    window.location.href = "/Admin";
                  } else {
                    setPasswordError("סיסמה שגויה");
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'var(--accent)',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                כניסה
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}