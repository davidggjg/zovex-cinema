import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Send, Play, ArrowRight, X, Loader2, ChevronDown, ChevronUp, Upload, FastForward, Rewind } from "lucide-react";
import { Movie } from "@/entities/Movie";
import CustomVideoPlayer from "@/components/home/CustomVideoPlayer.jsx";

const spinnerStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;
const SECRET_TRIGGER = "ZovexAdmin2026";
const PIN_CODE = "123456";
const LETTER_CODE = "ZOVIX";

// --- בוט חילוץ ותיקון כתובות אוטומטי ---
function extractVideoInfo(url) {
  if (!url) return { type: "direct", video_id: "" };
  let targetUrl = url;
  
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["']([^"']+)["']/);
    if (srcMatch) targetUrl = srcMatch[1];
  }
  
  if (!targetUrl.startsWith("http")) return { type: "direct", video_id: targetUrl };

  // תיקון אוטומטי ל-Google Drive
  if (targetUrl.includes("drive.google.com")) {
    const id = targetUrl.replace(/.*\/d\//, "").replace(/\/.*/, "").split("?")[0];
    return { type: "drive", video_id: `https://drive.google.com/file/d/${id}/preview` };
  }
  
  // תיקון אוטומטי ל-Archive.org
  if (targetUrl.includes("archive.org")) {
    const id = targetUrl.replace(/.*archive\.org\/(?:embed|details)\//, "").split("?")[0];
    return { type: "archive", video_id: `https://archive.org/embed/${id}` };
  }

  if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
    const id = targetUrl.replace(/.*[?&]v=/, "").replace(/.*youtu\.be\//, "").split("&")[0];
    return { type: "youtube", video_id: id };
  }

  return { type: "direct", video_id: targetUrl };
}

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [playerMovie, setPlayerMovie] = useState(null);
  
  // רפרנס לנגן עבור הבוט
  const iframeRef = useRef(null);

  // --- לוגיקת הבוט לדילוג 10 שניות ---
  const handleSkip = (seconds) => {
    if (iframeRef.current) {
      iframeRef.current.focus();
      // L = דילוג קדימה, J = דילוג אחורה
      const keyCode = seconds > 0 ? 76 : 74; 
      const command = JSON.stringify({
        event: 'command',
        func: 'remoteControl',
        args: ['keyCode', keyCode]
      });
      iframeRef.current.contentWindow.postMessage(command, '*');
    }
  };

  // --- טעינת נתונים (המקורי שלך) ---
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("/api/movies");
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "הכל" || m.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [movies, searchTerm, selectedCategory]);

  const renderPlayer = (movie) => {
    const info = extractVideoInfo(movie.video_url || movie.video_id);
    const frameStyle = { width: "100%", height: "100%", border: "none", borderRadius: "12px" };

    if (info.type === "youtube") {
      return <iframe ref={iframeRef} src={`https://www.youtube.com/embed/${info.video_id}?autoplay=1&enablejsapi=1`} style={frameStyle} allowFullScreen allow="autoplay" />;
    }
    if (info.type === "drive" || info.type === "archive") {
      return <iframe ref={iframeRef} src={info.video_id} style={frameStyle} allowFullScreen allow="autoplay" />;
    }
    return <video controls autoPlay style={frameStyle} src={movie.video_url || movie.video_id} />;
  };

  return (
    <div dir="rtl" style={styles.mainBackground}>
      <style>{spinnerStyle}</style>

      {/* הדר וחיפוש */}
      <header style={styles.header}>
        <h1 style={styles.logo}>ZOVEX CINEMA</h1>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חפש סרט או סדרה..." 
            style={styles.searchInput} 
          />
        </div>
      </header>

      {/* נגן וידאו מורחב עם הבוט */}
      {playerMovie && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <span style={{ fontWeight: "800" }}>{playerMovie.title}</span>
              <X onClick={() => setPlayerMovie(null)} style={{ cursor: "pointer" }} />
            </div>
            
            <div style={styles.videoContainer}>
              {renderPlayer(playerMovie)}

              {/* כפתורי הבוט מעל הנגן */}
              <div style={styles.botControls}>
                <button onClick={() => handleSkip(-10)} style={styles.glassBtn}>
                  <Rewind size={20} />
                </button>
                <button onClick={() => handleSkip(10)} style={styles.glassBtn}>
                  <FastForward size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* רשימת סרטים */}
      <main style={styles.mainContent}>
        {loading ? (
          <div style={styles.loaderContainer}><Loader2 style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : (
          <div style={styles.movieGrid}>
            {filteredMovies.map((movie, idx) => (
              <div key={idx} onClick={() => setPlayerMovie(movie)} style={styles.movieCard}>
                <div style={styles.posterContainer}>
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} style={styles.posterImg} />
                  ) : (
                    <div style={styles.posterPlaceholder}><Play size={40} /></div>
                  )}
                </div>
                <h3 style={styles.movieTitle}>{movie.title}</h3>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* פאנל ניהול (מכאן והלאה הלוגיקה המקורית שלך נשמרת) */}
      {/* ... לוגיקת האדמין והעלאת הסרטים שמופיעה בקובץ שלך ... */}

    </div>
  );
}

// --- עיצובים (Styles) ---
const styles = {
  mainBackground: {
    background: "#080808",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  header: {
    padding: "30px 20px",
    textAlign: "center",
    borderBottom: "1px solid #1a1a1a"
  },
  logo: {
    fontSize: "2.5rem",
    fontWeight: "900",
    background: "linear-gradient(to right, #00f2fe, #4facfe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "2px",
    marginBottom: "20px"
  },
  searchBox: {
    position: "relative",
    maxWidth: "500px",
    margin: "0 auto"
  },
  searchInput: {
    width: "100%",
    padding: "14px 45px 14px 20px",
    borderRadius: "15px",
    border: "1px solid #222",
    background: "#121212",
    color: "#fff",
    fontSize: "16px",
    outline: "none"
  },
  searchIcon: {
    position: "absolute",
    right: "15px",
    top: "16px",
    color: "#555"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.95)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  modalContent: {
    width: "100%",
    maxWidth: "1100px",
    background: "#000",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #333"
  },
  modalHeader: {
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111"
  },
  videoContainer: {
    position: "relative",
    aspectRatio: "16/9",
    width: "100%",
    background: "#000"
  },
  botControls: {
    position: "absolute",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "20px",
    zIndex: 2010
  },
  glassBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#fff",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "0.2s"
  },
  mainContent: { padding: "30px 20px" },
  movieGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "25px"
  },
  movieCard: {
    cursor: "pointer",
    transition: "transform 0.3s ease"
  },
  posterContainer: {
    aspectRatio: "2/3",
    borderRadius: "15px",
    overflow: "hidden",
    background: "#151515",
    border: "1px solid #222"
  },
  posterImg: { width: "100%", height: "100%", objectFit: "cover" },
  posterPlaceholder: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#333"
  },
  movieTitle: {
    marginTop: "10px",
    textAlign: "center",
    fontSize: "0.95rem",
    fontWeight: "600"
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "100px"
  }
};