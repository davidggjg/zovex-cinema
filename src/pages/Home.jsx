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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("הכל");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filtering
  const filtered = useMemo(() => {
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
  }, [movies, activeCategory, searchQuery]);

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

      <div className="cyber-page relative min-h-screen z-[1]">
        <CyberBackground />

        <div className="relative z-[2] max-w-[1200px] mx-auto px-4 pb-16">
          <HeroHeader
            movieCount={movies.length}
            categoryCount={categories.length}
          />

          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            movieCounts={movieCounts}
            totalCount={movies.length}
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
    </>
  );
}