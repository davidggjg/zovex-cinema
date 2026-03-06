import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, Search, Loader2, Send } from "lucide-react";

export default function Home({ onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");

  // 1. משיכת כל הסרטים
  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // 2. יצירת רשימת קטגוריות אוטומטית מהסרטים שהוספת (כדי שיופיעו הקטגוריות שלך)
  const categories = ["הכל", ...new Set(movies?.map(m => m.category).filter(Boolean))];

  // 3. סינון הסרטים לפי חיפוש ולפי הקטגוריה שנבחרה
  const filteredMovies = movies?.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "הכל" || movie.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlay = (movie) => {
    if (typeof onMovieSelect === 'function') {
      onMovieSelect(movie);
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
      <Loader2 className="animate-spin" size={40} color="#e50914" />
    </div>
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון: לוגו וחיפוש מעוגל */}
      <nav style={{ padding: '20px 5% 10px 5%', background: '#fff', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ color: '#e50914', fontSize: '35px', fontWeight: '900', margin: 0 }}>ZOVEX</h1>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f5', 
            padding: '10px 25px', borderRadius: '50px', width: '350px', border: '1px solid #eee' 
          }}>
            <Search size={20} color="#999" />
            <input 
              type="text" placeholder="חיפוש סרט..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '16px' }} 
            />
          </div>
        </div>

        {/* הקטגוריות האמיתיות שלך - עכשיו הן מגיבות ללחיצה! */}
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <span 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ 
                cursor: 'pointer', 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: selectedCategory === cat ? '#e50914' : '#333',
                borderBottom: selectedCategory === cat ? '3px solid #e50914' : 'none',
                paddingBottom: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </nav>

      {/* תצוגת הסרטים לפי התמונה שלך */}
      <div style={{ padding: '20px 5%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '30px' 
        }}>
          {filteredMovies?.map((movie) => (
            <div key={movie.id} style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>{movie.title}</h3>
              
              <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '15px' }}>
                <img 
                  src={movie.thumbnail_url} 
                  style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} 
                />
              </div>

              <button 
                onClick={() => handlePlay(movie)}
                style={{
                  width: '100%', background: '#e50914', color: '#fff', border: 'none',
                  padding: '14px', fontSize: '20px', fontWeight: '900', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  cursor: 'pointer'
                }}
              >
                צפייה ישירה <Play fill="white" size={22} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* כפתור טלגרם צף */}
      <div 
        onClick={() => window.open('https://t.me/ZOVE8', '_blank')}
        style={{
          position: 'fixed', bottom: '30px', left: '30px', background: '#24A1DE',
          width: '60px', height: '60px', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 1000
        }}
      >
        <Send size={30} fill="white" />
      </div>

    </div>
  );
}