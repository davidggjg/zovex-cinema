import React, { useState, useMemo, useEffect } from "react";
import { Search, Send, Play, ArrowRight, X } from "lucide-react";
import { Movie } from "@/entities/Movie";

const spinnerStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    Movie.list().then(data => {
      setMovies(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    if (!movies.length) return ["הכל"];
    return ["הכל", ...new Set(movies.map(m => m.category).filter(Boolean))];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const title = movie.title || "";
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "הכל" || movie.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [movies, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#fff" }}>
        <style>{spinnerStyle}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 50, height: 50, border: "5px solid #eee", borderTop: "5px solid #e50914", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 15px" }} />
          <p dir="rtl" style={{ color: "#999", fontFamily: "Arial" }}>טוען סרטים...</p>
        </div>
      </div>
    );
  }

  // מסך נגן מלא
  if (playerOpen && selectedMovie) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <button
          onClick={() => { setPlayerOpen(false); }}
          style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}
        >
          <X size={24} />
        </button>
        <p style={{ color: "#aaa", fontSize: "16px", marginBottom: "15px", fontFamily: "Arial" }}>{selectedMovie.title}</p>
        <video
          controls
          autoPlay
          style={{ width: "100%", maxHeight: "80vh" }}
          src={selectedMovie.video_url}
        />
      </div>
    );
  }

  // דף סרט
  if (selectedMovie) {
    return (
      <div style={{ background: "#111", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", color: "#fff" }}>

        <button
          onClick={() => setSelectedMovie(null)}
          style={{ position: "fixed", top: "15px", right: "15px", zIndex: 100, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <ArrowRight size={22} />
        </button>

        <div style={{ position: "relative" }}>
          <img
            src={selectedMovie.thumbnail_url}
            alt={selectedMovie.title}
            style={{ width: "100%", height: "55vw", maxHeight: "400px", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(transparent, #111)" }} />
        </div>

        <div style={{ padding: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 10px 0", color: "#fff" }}>
            {selectedMovie.title}
          </h1>

          {selectedMovie.category && (
            <span style={{ background: "#e50914", color: "#fff", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>
              {selectedMovie.category}
            </span>
          )}

          {selectedMovie.description && (
            <p style={{ marginTop: "15px", fontSize: "15px", lineHeight: "1.8", color: "#bbb" }}>
              {selectedMovie.description}
            </p>
          )}

          <button
            onClick={() => setPlayerOpen(true)}
            style={{ marginTop: "25px", width: "100%", background: "#e50914", color: "#fff", border: "none", padding: "16px", fontSize: "18px", fontWeight: "bold", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", boxShadow: "0 4px 20px rgba(229,9,20,0.4)" }}
          >
            <Play fill="white" size={22} /> לצפייה עכשיו
          </button>
        </div>

      </div>
    );
  }

  // דף בית
  return (
    <div style={{ background: "#fff", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif" }}>

      <header style={{ padding: "15px 15px 0 15px", position: "sticky", top: 0, background: "#fff", zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
          <h1 style={{ color: "#e50914", fontSize: "28px", fontWeight: 900, margin: 0, flexShrink: 0 }}>ZOVEX</h1>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "#f5f5f5", padding: "10px 16px", borderRadius: "50px", border: "1px solid #eee" }}>
            <Search size={17} color="#aaa" />
            <input
              type="text"
              placeholder="חפש סרט או סדרה..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: "15px", color: "#333" }}
            />
            {searchTerm && (
              <span onClick={() => setSearchTerm("")} style={{ cursor: "pointer", color: "#aaa", fontSize: "18px" }}>×</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "22px", overflowX: "auto", paddingBottom: "12px", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <span key={cat} onClick={() => setSelectedCategory(cat)} style={{ cursor: "pointer", fontSize: "15px", fontWeight: "bold", color: selectedCategory === cat ? "#e50914" : "#666", borderBottom: selectedCategory === cat ? "3px solid #e50914" : "3px solid transparent", paddingBottom: "6px", transition: "all 0.2s" }}>
              {cat}
            </span>
          ))}
        </div>
      </header>

      <main style={{ padding: "20px 15px 100px 15px" }}>
        {filteredMovies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
            <p style={{ fontSize: "18px" }}>😕 לא נמצאו תוצאות</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {filteredMovies.map(movie => (
              <div key={movie.id} onClick={() => setSelectedMovie(movie)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", margin: 0, color: "#111", lineHeight: "1.3", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {movie.title}
                </h3>
                <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "2/3", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", background: "#f0f0f0" }}>
                  <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.src = "https://via.placeholder.com/200x300?text=ZOVEX"; }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <a href="https://t.me/ZOVE8" target="_blank" rel="noreferrer" style={{ position: "fixed", bottom: "25px", left: "25px", background: "#24A1DE", width: "58px", height: "58px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", zIndex: 1000, textDecoration: "none" }}>
        <Send size={28} fill="white" />
      </a>

    </div>
  );
}