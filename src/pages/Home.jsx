import React, { useEffect, useMemo, useState } from "react";
import { Movie } from "@/entities/Movie";
import SiteHeader from "@/components/home/SiteHeader";
import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryRow from "@/components/home/CategoryRow";
import BackgroundFX from "@/components/home/BackgroundFX";
import SupportFab from "@/components/home/SupportFab";
import CustomVideoPlayer from "@/components/home/CustomVideoPlayer.jsx";

const globalStyles = `
.hide-scroll::-webkit-scrollbar { display: none; }
.hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
`;

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    Movie.list("-created_date", 500)
      .then((all) => setMovies(all || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(
    () => movies.find((m) => m.thumbnail_url) || movies[0] || null,
    [movies]
  );

  const rows = useMemo(() => {
    const g = {};
    movies.forEach((m) => {
      const c = m.category || "ללא קטגוריה";
      if (!g[c]) g[c] = [];
      g[c].push(m);
    });
    return g;
  }, [movies]);

  const categories = useMemo(() => Object.keys(rows), [rows]);

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return null;
    return movies.filter((m) =>
      (m.title || "").toLowerCase().includes(q) ||
      (m.series_name || "").toLowerCase().includes(q)
    );
  }, [movies, searchTerm]);

  const scrollToCategory = (cat) => {
    document.getElementById(`row-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (playing) {
    return <CustomVideoPlayer movie={playing} onClose={() => setPlaying(null)} />;
  }

  return (
    <div style={{
      minHeight: "100vh", direction: "rtl",
      fontFamily: "Arial, sans-serif",
      background: "linear-gradient(160deg, #07030f 0%, #150a26 45%, #1a0a1e 75%, #07030f 100%)",
    }}>
      <style>{globalStyles}</style>
      <BackgroundFX />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          onCategoryClick={scrollToCategory}
        />
        <main style={{ padding: "0 0 120px" }}>
          {searchResults ? (
            searchResults.length > 0 ? (
              <CategoryRow title="תוצאות חיפוש" items={searchResults} onPlay={setPlaying} />
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "rgba(255,255,255,.45)", fontSize: 15 }}>
                לא נמצאו תוצאות
              </div>
            )
          ) : (
            <>
              <HeroCarousel featured={featured} onWatch={() => setPlaying(featured)} />
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,.4)", fontSize: 14 }}>
                  טוען...
                </div>
              ) : movies.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,.45)" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎬</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>התוכן יעלה בקרוב</div>
                </div>
              ) : (
                categories.map((cat) => (
                  <CategoryRow key={cat} title={cat} items={rows[cat]} onPlay={setPlaying} />
                ))
              )}
            </>
          )}
        </main>
      </div>
      <SupportFab />
    </div>
  );
}