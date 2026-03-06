import React, { useState } from "react";
import { Play, Search, Send } from "lucide-react";

export default function Home({ movies, onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  // אם movies לא קיים או ריק, נציג הודעה פשוטה כדי שלא יהיה מסך לבן
  if (!movies) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#e50914' }}>ZOVEX</h1>
        <p>מתחבר לשרת... אם זה לוקח זמן, בדוק את פאנל הניהול.</p>
      </div>
    );
  }

  // סינון פשוט רק לפי חיפוש
  const filtered = movies.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון */}
      <header style={{ padding: '15px', borderBottom: '1px solid #eee', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <h1 style={{ color: '#e50914', fontSize: '24px', fontWeight: '900', margin: 0 }}>ZOVEX</h1>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f0f0', 
            padding: '8px 15px', borderRadius: '50px', flex: 1 
          }}>
            <Search size={18} color="#999" />
            <input 
              type="text" 
              placeholder="חיפוש סרט..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', width: '100%' }} 
            />
          </div>
        </div>
      </header>

      {/* רשימת סרטים - 2 בשורה */}
      <main style={{ padding: '15px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '15px' 
        }}>
          {filtered.map((movie) => (
            <div key={movie.id} style={{ marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
                {movie.title}
              </h3>
              
              <div 
                onClick={() => onMovieSelect?.(movie)}
                style={{ cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <img 
                  src={movie.thumbnail_url} 
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} 
                />
              </div>

              <button 
                onClick={() => onMovieSelect?.(movie)}
                style={{
                  marginTop: '10px', width: '100%', background: '#e50914', color: '#fff', 
                  border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <Play size={16} fill="white" /> צפייה ישירה
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* טלגרם */}
      <a 
        href="https://t.me/ZOVE8" 
        style={{
          position: 'fixed', bottom: '20px', left: '20px', background: '#24A1DE',
          width: '50px', height: '50px', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        <Send size={24} />
      </a>
    </div>
  );
}