import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

import CyberStyles from "../components/cyber/CyberStyles";
import CyberBackground from "../components/cyber/CyberBackground";
import HeroHeader from "../components/movies/HeroHeader";
import SearchBar from "../components/movies/SearchBar";
import CategoryFilters from "../components/movies/CategoryFilters";
import MovieCard from "../components/movies/MovieCard";
import VideoModal from "../components/movies/VideoModal";
import EmptyState from "../components/movies/EmptyState";

const SECRET_CODE = "ZOVEX_ADMIN_2026";
const ADMIN_PASSWORD = "cyber2026";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("הכל");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [theme, setTheme] = useState("dark");

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // Derived data
  const categories = useMemo(() => {
    const cats = [...new Set(movies.map((m) => m.category))].sort((a, b) =>
      a.localeCompare(b, "he")
    );
    return cats;
  }, [movies]);

  const movieCounts = useMemo(() => {
    const counts = {};
    movies.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [movies]);

  // Check for secret code
  const isSecretCode = searchQuery.trim() === SECRET_CODE;
  if (isSecretCode && !showAdminAccess) {
    setShowAdminAccess(true);
  } else if (!isSecretCode && showAdminAccess) {
    setShowAdminAccess(false);
  }

  // Filtering
  const filtered = useMemo(() => {
    if (isSecretCode) return [];
    return movies.filter((m) => {
      const matchCat =
        activeCategory === "הכל" || m.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [movies, activeCategory, searchQuery, isSecretCode]);

  // Grouped for "הכל" view
  const grouped = useMemo(() => {
    if (activeCategory !== "הכל" || searchQuery) return null;
    const g = {};
    categories.forEach((cat) => {
      const items = movies.filter((m) => m.category === cat);
      if (items.length) g[cat] = items;
    });
    return g;
  }, [movies, categories, activeCategory, searchQuery]);

  return (
    <>
      <CyberStyles />

      <div className={theme === "dark" ? "cyber-page" : "light-page"} style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
        {theme === "dark" && <CyberBackground />}

        {/* Theme Toggle Button */}
        <div className="fixed top-4 left-4 z-[100]">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="cursor-pointer transition-all duration-200 px-4 py-2 rounded"
            style={{
              background: theme === "dark" 
                ? "rgba(0,210,255,0.15)" 
                : "rgba(255,255,255,0.9)",
              border: theme === "dark"
                ? "1px solid rgba(0,210,255,0.4)"
                : "1px solid rgba(37,99,235,0.3)",
              fontFamily: "'Orbitron',sans-serif",
              fontSize: 10,
              color: theme === "dark" ? "var(--cyber-neon)" : "#2563eb",
              letterSpacing: "0.1em",
              boxShadow: theme === "dark"
                ? "0 0 15px rgba(0,210,255,0.2)"
                : "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {theme === "dark" ? "☀ מצב בהיר" : "🌙 מצב כהה"}
          </button>
        </div>

        <div className="relative z-[2] max-w-[1200px] mx-auto px-4 pb-16">
          <HeroHeader
            movieCount={movies.length}
            categoryCount={categories.length}
            theme={theme}
          />

          <SearchBar value={searchQuery} onChange={setSearchQuery} theme={theme} />

          {/* Admin Access Button */}
          {showAdminAccess && (
            <div
              className="max-w-[480px] mx-auto mb-7 text-center"
              style={{ animation: "fadeUp 0.3s ease" }}
            >
              <button
                onClick={() => {
                  setShowPasswordDialog(true);
                  setPassword("");
                  setPasswordError("");
                }}
                className="cursor-pointer transition-all duration-200 px-6 py-3 rounded"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,210,255,0.2), rgba(0,128,255,0.15))",
                  border: "1px solid rgba(0,210,255,0.6)",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--cyber-neon)",
                  letterSpacing: "0.12em",
                  boxShadow: "0 0 20px rgba(0,210,255,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(0,210,255,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(0,210,255,0.3)";
                }}
              >
                🔐 גישה לפאנל ניהול
              </button>
            </div>
          )}

          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            movieCounts={movieCounts}
            totalCount={movies.length}
            theme={theme}
          />

          {/* Search results header */}
          {searchQuery && (
            <div
              className="mb-5"
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: 11,
                color: "var(--cyber-text-dim)",
                animation: "slideIn 0.2s ease",
              }}
            >
              נמצאו{" "}
              <span style={{ color: "var(--cyber-neon)", fontWeight: 700 }}>
                {filtered.length}
              </span>{" "}
              תוצאות עבור &quot;{searchQuery}&quot;
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div
                className="w-10 h-10 rounded-full"
                style={{
                  border: "2px solid rgba(0,210,255,0.3)",
                  borderTop: "2px solid var(--cyber-neon)",
                  animation: "spin 0.9s linear infinite",
                }}
              />
              <div
                style={{
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 10,
                  color: "var(--cyber-text-dim)",
                  letterSpacing: "0.2em",
                }}
              >
                טוען סינמה...
              </div>
            </div>
          ) : movies.length === 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
              <EmptyState />
            </div>
          ) : searchQuery || activeCategory !== "הכל" ? (
            <div>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div
                    style={{
                      fontFamily: "'Orbitron',sans-serif",
                      fontSize: 12,
                      color: "var(--cyber-text-dim)",
                      letterSpacing: "0.2em",
                    }}
                  >
                    לא נמצאו תוצאות
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
                  {filtered.map((movie, i) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      index={i}
                      onClick={setSelectedMovie}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Grouped by category */
            <div className="flex flex-col gap-12">
              {grouped &&
                Object.entries(grouped).map(([cat, catMovies], gi) => (
                  <section
                    key={cat}
                    style={{ animation: `fadeUp 0.5s ease ${gi * 0.1}s both` }}
                  >
                    {/* Category title */}
                    <div className="flex items-center gap-3.5 mb-5">
                      <div
                        style={{
                          fontFamily: "'Orbitron',sans-serif",
                          fontSize: "clamp(13px,2vw,16px)",
                          fontWeight: 700,
                          color: "var(--cyber-neon)",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                        }}
                      >
                        {cat}
                      </div>
                      <div
                        className="rounded px-2 py-0.5"
                        style={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: 10,
                          color: "var(--cyber-text-dim)",
                          background: "rgba(0,210,255,0.06)",
                          border: "1px solid rgba(0,210,255,0.15)",
                        }}
                      >
                        {catMovies.length}
                      </div>
                      <div
                        className="flex-1 h-px"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(0,210,255,0.2), transparent)",
                        }}
                      />
                    </div>

                    {/* Movies grid */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                      {catMovies.map((movie, i) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          index={i}
                          onClick={setSelectedMovie}
                        />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedMovie && (
        <VideoModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
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
          className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            className="w-full max-w-[400px] rounded-lg p-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,210,255,0.08) 0%, rgba(0,128,255,0.04) 100%)",
              border: "1px solid rgba(0,210,255,0.25)",
              backdropFilter: "blur(12px)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,210,255,0.06)",
              animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div
              className="mb-5 text-center"
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--cyber-neon)",
                letterSpacing: "0.12em",
              }}
            >
              🔐 הזן סיסמה
            </div>

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
              className="w-full mb-3 outline-none"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(0,210,255,0.15)",
                borderRadius: 4,
                color: "var(--cyber-text)",
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: 13,
                padding: "10px 14px",
                direction: "rtl",
              }}
            />

            {passwordError && (
              <div
                className="mb-3 text-center"
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: 11,
                  color: "#ff4466",
                }}
              >
                {passwordError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                  setPasswordError("");
                }}
                className="flex-1 cursor-pointer transition-all duration-200 py-2.5 rounded"
                style={{
                  background: "rgba(255,0,60,0.08)",
                  border: "1px solid rgba(255,0,60,0.35)",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 11,
                  color: "#ff4466",
                  letterSpacing: "0.1em",
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
                className="flex-1 cursor-pointer transition-all duration-200 py-2.5 rounded"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,210,255,0.2), rgba(0,128,255,0.15))",
                  border: "1px solid rgba(0,210,255,0.5)",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--cyber-neon)",
                  letterSpacing: "0.1em",
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