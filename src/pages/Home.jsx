import React, { useState } from "react";
import { Play, Search, Send } from "lucide-react";

export default function Home({ movies, onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");

  // הגנה: אם אין סרטים עדיין, נציג טעינה ולא מסך לבן ריק
  if (!movies || movies.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e50914' }}>טוען סרטים...</div>
      </div>
    );
  }

  // חילוץ קטגוריות מהסרטים הקיימים
  const dynamicCategories = ["הכל", ...new Set(movies.map(m => m.category).filter(Boolean))];

  // סינון הסרטים
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "הכל" || movie.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון קבוע */}
      <header style={{ padding: '15px 20px', position: 'sticky', top: 0, background: '#fff', zIndex: 100, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', 
              padding: '10px 20px', borderRadius: '50px', border: '1px solid #eee' 
            }}>
              <Search size={18} color="#999" />
              <input 
                type="text" 
                placeholder="חיפוש סרט..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '16px' }} 
              />
            </div>
          </div>
          <h1 style={{ color: '#e50914', fontSize: '32px', fontWeight: '900', margin: '0 0 0 15px' }}>ZOVEX</h1>
        </div>

        {/* שורת קטגוריות שנגללת הצידה */}
        <div style={{ 
          display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 0', 
          scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}>
          {dynamicCategories.map((cat) => (
            <span 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ 
                cursor: 'pointer', fontSize: '18px', fontWeight: '800', whiteSpace: 'nowrap',
                color: selectedCategory === cat ? '#e50914' : '#333',
                borderBottom: selectedCategory === cat ? '3px solid #e50914' : 'none',
                paddingBottom: '5px',
                transition: '0.2s'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </header>

      {/* תצוגת הסרטים - 2 בשורה בדיוק כמו בתמונות */}
      <main style={{ padding: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px' 
        }}>
          {filteredMovies.map((movie) => (
            <div key={movie.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: 0, color: '#000' }}>
                {movie.title}
              </h3>
              
              <div 
                onClick={() => onMovieSelect(movie)}
                style={{ cursor: 'pointer', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              >
                <img 
                  src={movie.thumbnail_url} 
                  alt={movie.title}
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} 
                />
              </div>

              <button 
                onClick={() => onMovieSelect(movie)}
                style={{
                  background: '#e50914', color: '#fff', border: 'none',
                  padding: '12px', fontSize: '18px', fontWeight: '900', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: 'pointer', boxShadow: '0 4px 10px rgba(229, 9, 20, 0.3)'
                }}
              >
                צפייה ישירה <Play fill="white" size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* כפתור טלגרם צף */}
      <a 
        href="https://t.me/ZOVE8" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '25px', left: '25px', background: '#24A1DE',
          width: '65px', height: '65px', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1000, textDecoration: 'none'
        }}
      >
        <Send size={32} fill="white" />
      </a>
    </div>
  );
}