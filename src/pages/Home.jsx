import React from "react";
import { Play, Search } from "lucide-react";

export default function Home({ movies, onMovieSelect }) {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון מקורי - לוגו אדום ותפריט לבן */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '15px 4%', 
        borderBottom: '1px solid #eee' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 style={{ color: '#e50914', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>ZOVEX</h1>
          <div style={{ display: 'flex', gap: '20px', fontSize: '16px', fontWeight: '500' }}>
            <span>ראשי</span>
            <span style={{ color: '#666' }}>סדרות</span>
            <span style={{ color: '#666' }}>סרטים</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f0f0', padding: '5px 15px', borderRadius: '5px' }}>
          <Search size={18} color="#666" />
          <input type="text" placeholder="חיפוש..." style={{ background: 'none', border: 'none', outline: 'none' }} />
        </div>
      </nav>

      {/* רשימת הסרטים - מחזיר את כל הסרטים שלך למסך */}
      <div style={{ padding: '30px 4%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '25px' 
        }}>
          {movies && movies.map((movie) => (
            <div key={movie.id} style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
              <img 
                src={movie.thumbnail_url} 
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} 
              />
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>{movie.title}</h3>
                
                {/* הכפתור האדום שביקשת - עכשיו הוא בולט ומודגש */}
                <button 
                  onClick={() => onMovieSelect(movie)}
                  style={{
                    width: '100%',
                    background: '#e50914', // אדום בולט
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Play fill="white" size={18} /> צפייה ישירה
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}