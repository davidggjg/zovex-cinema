import React, { useState, useEffect } from "react";
import { Play, Info, ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function Home({ movies, onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // סינון סרטים לפי חיפוש (כדי שלא תאבד את האופציה הזו)
  const filteredMovies = movies?.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      background: '#000', 
      minHeight: '100vh', 
      color: '#fff', 
      direction: 'rtl', 
      fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' 
    }}>
      
      {/* סרגל עליון (Navbar) */}
      <nav style={{ 
        padding: '20px 4%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 style={{ color: '#e50914', fontSize: '30px', fontWeight: '900', margin: 0 }}>ZOVEX</h1>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>ראשי</span>
            <span style={{ cursor: 'pointer', color: '#ccc' }}>סדרות</span>
            <span style={{ cursor: 'pointer', color: '#ccc' }}>סרטים</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.4)', padding: '5px 15px', borderRadius: '4px', border: '1px solid #333' }}>
          <Search size={18} color="#ccc" />
          <input 
            type="text" 
            placeholder="חיפוש..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '14px' }}
          />
        </div>
      </nav>

      {/* אזור ה-Hero (הסרט הראשון ברשימה) */}
      {movies && movies.length > 0 && !searchTerm && (
        <div style={{ height: '85vh', position: 'relative', width: '100%', overflow: 'hidden' }}>
          <img 
            src={movies[0].thumbnail_url} 
            alt={movies[0].title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, #000 15%, transparent 60%)' 
          }} />
          
          <div style={{ position: 'absolute', bottom: '15%', right: '5%', zIndex: 10, maxWidth: '700px' }}>
            <h2 style={{ fontSize: '60px', margin: '0 0 20px 0', fontWeight: '900' }}>{movies[0].title}</h2>
            <p style={{ fontSize: '18px', lineHeight: '1.4', marginBottom: '30px', color: '#ddd', maxWidth: '500px' }}>
              {movies[0].description}
            </p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              {/* כפתור ה"צפייה ישירה" האדום והענק */}
              <button 
                onClick={() => onMovieSelect(movies[0])}
                style={{
                  background: '#e50914', // צבע אדום בוהק
                  color: '#fff',
                  border: 'none',
                  padding: '14px 45px', // גודל גדול במיוחד
                  fontSize: '22px',
                  fontWeight: '900',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(229, 9, 20, 0.6)', // הילה אדומה
                  transition: 'all 0.3s ease'
                }}
                className="hero-play-button"
              >
                <Play fill="white" size={28} /> צפייה ישירה
              </button>

              <button style={{
                background: 'rgba(109, 109, 110, 0.7)',
                color: '#fff',
                border: 'none',
                padding: '14px 30px',
                fontSize: '22px',
                fontWeight: 'bold',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}>
                <Info size={28} /> מידע נוסף
              </button>
            </div>
          </div>
        </div>
      )}

      {/* שורות סרטים (Rows) */}
      <div style={{ padding: '40px 4%', marginTop: searchTerm ? '100px' : '-60px', position: 'relative', zIndex: 20 }}>
        <h3 style={{ fontSize: '22px', marginBottom: '15px', fontWeight: 'bold' }}>
          {searchTerm ? `תוצאות חיפוש עבור: ${searchTerm}` : "הוספו לאחרונה"}
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '20px' 
        }}>
          {filteredMovies?.map((movie) => (
            <div 
              key={movie.id} 
              onClick={() => onMovieSelect(movie)}
              style={{ 
                cursor: 'pointer', 
                transition: 'transform 0.3s ease',
                background: '#141414',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                <img 
                  src={movie.thumbnail_url} 
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {/* כפתור פליי קטן שמופיע במעבר עכבר על כל סרט ברשימה */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }} 
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0}
                >
                  <Play fill="white" size={40} />
                </div>
              </div>
              <div style={{ padding: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                {movie.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ה-CSS של הכפתור האדום (אפקט ריחוף) */}
      <style>{`
        .hero-play-button:hover {
          background-color: #ff0a16 !important;
          transform: scale(1.07);
          box-shadow: 0 0 30px rgba(229, 9, 20, 0.8) !important;
        }
      `}</style>

    </div>
  );
}