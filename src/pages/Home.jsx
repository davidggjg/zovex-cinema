
import React, { useState, useMemo, useEffect } from "react";
import { Search, Send, Play } from "lucide-react";
import { Movie } from "@/entities/Movie";

const spinnerStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const data = await Movie.list();
      setMovies(data);
    } catch (error) {
      console.error("שגיאה בטעינת סרטים:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (selectedMovie) {
    return (
      <div style={{ background: "#000", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <button
          onClick={() => setSelectedMovie(null)}
          style={{ alignSelf: "flex-start", background: "#e50914", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontSize: "16px" }}
        >
          ← חזרה
        </button>
        <h2 style={{ color: "#fff", marginBottom: "15px" }}>{selectedMovie.title}</h2>
        <video
          controls
          autoPlay
          style={{ width: "100%", maxWidth: "800px", borderRadius: "12px" }}
          src={selectedMovie.video_url}
        />
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif" }}>

      <header style={{ padding: "15px 15px 0 15px", position: "sticky", top: 0, background: "#fff", zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
          <h1 style={{ color: "#e50914", fontSize: "28px", fontWeight: 900, margin: 0, flexShrink: 0 }}>
            ZOVEX
          </h1>
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
              <span onClick={() => setSearchTerm("")} style={{ cursor: "pointer", color: "#aaa", fontSize: "18px", lineHeight: 1 }}>×</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "22px", overflowX: "auto", paddingBottom: "12px", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <span
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ cursor: "pointer", fontSize: "15px", fontWeight: "bold", color: selectedCategory === cat ? "#e50914" : "#666", borderBottom: selectedCategory === cat ? "3px solid #e50914" : "3px solid transparent", paddingBottom: "6px", transition: "all 0.2s" }}
            >
              {cat}
            </span>
          ))}
        </div>
      </header>

      <main style={{ padding: "20px 15px 100px 15px" }}>
        {filteredMovies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
            <p style={{ fontSize: "18px" }}>😕 לא נמצאו תוצאות</p>
            <p style={{ fontSize: "14px" }}>נסה מילת חיפוש אחרת</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {filteredMovies.map(movie => (
              <div key={movie.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", margin: 0, color: "#111", lineHeight: "1.3", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {movie.title}
                </h3>
                <div
                  onClick={() => setSelectedMovie(movie)}
                  style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden", aspectRatio: "2/3", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", background: "#f0f0f0" }}
                >
                  <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.src = "https://via.placeholder.com/200x300?text=ZOVEX"; }}
                  />
                </div>
                <button
                  onClick={() => setSelectedMovie(movie)}
                  style={{ background: "linear-gradient(135deg, #e50914, #b20710)", color: "#fff", border: "none", padding: "11px", fontSize: "15px", fontWeight: "bold", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", cursor: "pointer", boxShadow: "0 4px 12px rgba(229,9,20,0.35)" }}
                >
                  <Play fill="white" size={16} /> צפייה ישירה
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <a
        href="https://t.me/ZOVE8"
        target="_blank"
        rel="noreferrer"
        style={{ position: "fixed", bottom: "25px", left: "25px", background: "#24A1DE", width: "58px", height: "58px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", zIndex: 1000, textDecoration: "none" }}
      >
        <Send size={28} fill="white" />
      </a>

    </div>
  );
}