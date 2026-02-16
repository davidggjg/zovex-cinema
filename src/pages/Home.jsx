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
  const [isDark, setIsDark] = useState(true);

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
        <GridView items={processedItems} onSelect={setSelectedItem} />
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
    </>
  );
}