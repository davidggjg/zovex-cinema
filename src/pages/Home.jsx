import React, { useState } from "react";
import { Play, Search, Send } from "lucide-react";

export default function Home({ movies, onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");

  // משיכת הקטגוריות מהסרטים הקיימים שלך
  const dynamicCategories = movies 
    ? ["הכל", ...new Set(movies.map(m => m.category).filter(Boolean))] 
    : ["הכל"];

  // סינון הסרטים
  const filteredMovies = movies?.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "הכל" || movie.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון: לוגו וחיפוש מעוגל */}
      <header style={{ padding: '15px 20px', position: 'sticky', top: 0, background: '#fff', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', 
              padding: '8px 15px', borderRadius: '50px', border: '1px solid #eee' 
            }}>
              <Search size={18} color="#999" />
              <input 
                type="text" 
                placeholder="חיפוש סרט..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} 
              />
            </div>
          </div>
          <h1 style={{ color: '#e50914', fontSize: '28px', fontWeight: '900', margin: '0 0 0 15px' }}>ZOVEX</h1>
        </div>

        {/* שורת הקטגוריות שלך - שורה נפרדת מתחת לחיפוש */}
        <div style={{ 
          display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 0', 
          scrollbarWidth: 'none', borderBottom: '1px solid #eee' 
        }}>
          {dynamicCategories.map((cat) => (
            <span 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ 
                cursor: 'pointer', fontSize: '16px', fontWeight: '800', whiteSpace: 'nowrap',
                color: selectedCategory === cat ? '#e50914' : '#333',
                borderBottom: selectedCategory === cat ? '2px solid #e50914' : 'none',
                paddingBottom: '5px'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </header>

      {/* תצוגת הסרטים - 2 סרטים בכל שורה (בדיוק כמו בתמונה) */}
      <main style={{ padding: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px' 
        }}>
          {filteredMovies?.map((movie) => (
            <div key={movie.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              
              {/* כותרת הסרט */}
              <h3 style={{ fontSize: '16px', fontWeight: '800', textAlign: 'center', margin: 0 }}>
                {movie.title}
              </h3>
              
              {/* תמונת הסרט - לחיצה עליה פותחת את התיאור/נגן */}
              <div 
                onClick={() => onMovieSelect(movie)}
                style={{ cursor: 'pointer', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              >
                <img 
                  src={movie.thumbnail_url} 
                  alt={movie.title}
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} 
                />
              </div>

              {/* הכפתור האדום המודגש */}
              <button 
                onClick={() => onMovieSelect(movie)}
                style={{
                  background: '#e50914', color: '#fff', border: 'none',
                  padding: '12px', fontSize: '18px', fontWeight: '900', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)'
                }}
              >
                <Play fill="white" size={18} /> צפייה ישירה
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* כפתור טלגרם צף שעובד עם הקישור שלך */}
      <a 
        href="https://t.me/ZOVE8" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '25px', left: '25px', background: '#24A1DE',
          width: '60px', height: '60px', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)', zIndex: 1000, textDecoration: 'none'
        }}
      >
        <Send size={30} fill="white" />
      </a>
    </div>
  );
}