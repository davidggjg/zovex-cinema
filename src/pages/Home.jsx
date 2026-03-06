import React, { useState } from "react";
import { Play, Search } from "lucide-react";

export default function Home({ movies, onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovies = movies?.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      background: '#ffffff', // חזרנו ללבן הנקי
      minHeight: '100vh', 
      color: '#333333', // טקסט כהה שקריא על לבן
      direction: 'rtl', 
      fontFamily: 'sans-serif' 
    }}>
      
      {/* סרגל עליון לבן */}
      <nav style={{ 
        padding: '15px 5%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #eeeeee',
        background: '#ffffff'
      }}>
        <h1 style={{ color: '#e50914', fontSize: '28px', fontWeight: '900', margin: 0 }}>ZOVEX</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px' }}>
          <Search size={18} color="#999" />
          <input 
            type="text" 
            placeholder="חיפוש סרט..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px' }}
          />
        </div>
      </nav>

      <div style={{ padding: '30px 5%' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '25px', color: '#000' }}>הסרטים שלנו</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '30px' 
        }}>
          {filteredMovies?.map((movie) => (
            <div key={movie.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <img 
                src={movie.thumbnail_url} 
                alt={movie.title}
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} 
              />
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{movie.title}</h3>
                <p style={{ fontSize: '14px', color: '#666', height: '40px', overflow: 'hidden', marginBottom: '20px' }}>
                  {movie.description}
                </p>
                
                {/* הכפתור האדום המודגש - עכשיו על רקע לבן */}
                <button 
                  onClick={() => onMovieSelect(movie)}
                  style={{
                    width: '100%',
                    background: '#e50914',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(229, 9, 20, 0.3)',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#ff1a25'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#e50914'}
                >
                  <Play fill="white" size={20} /> צפייה ישירה
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}