import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, Search, Loader2, Send } from "lucide-react";

export default function Home({ onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  // משיכת הסרטים מה-Database שלך
  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const filteredMovies = movies?.filter(movie => 
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Loader2 className="animate-spin" size={40} color="#e50914" />
    </div>
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון - לוגו וחיפוש */}
      <nav style={{ padding: '20px 5% 10px 5%', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ color: '#e50914', fontSize: '35px', fontWeight: '900', margin: 0 }}>ZOVEX</h1>
          
          {/* חיפוש מעוגל */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f5', 
            padding: '12px 25px', borderRadius: '50px', width: '400px', border: '1px solid #eee' 
          }}>
            <Search size={20} color="#999" />
            <input 
              type="text" placeholder="חפש סרט או סדרה..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '16px' }} 
            />
          </div>
        </div>

        {/* קטגוריות - שורה מתחת לחיפוש */}
        <div style={{ display: 'flex', gap: '30px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
          <span style={{ cursor: 'pointer', color: '#e50914', borderBottom: '3px solid #e50914' }}>ראשי</span>
          <span style={{ cursor: 'pointer', color: '#333' }}>סדרות</span>
          <span style={{ cursor: 'pointer', color: '#333' }}>סרטים</span>
        </div>
      </nav>

      {/* תצוגת הסרטים */}
      <div style={{ padding: '40px 5%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '30px' 
        }}>
          {filteredMovies?.map((movie) => (
            <div key={movie.id} style={{ 
              background: '#fff', borderRadius: '12px', overflow: 'hidden', 
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0'
            }}>
              {/* תמונת הסרט - לחיצה עליה פותחת את הסרט */}
              <div style={{ cursor: 'pointer' }} onClick={() => onMovieSelect(movie)}>
                <img src={movie.thumbnail_url} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
              </div>

              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>{movie.title}</h3>
                
                {/* כפתור צפייה ישירה - מגיב ללחיצה */}
                <button 
                  onClick={() => onMovieSelect(movie)}
                  style={{
                    width: '100%', background: '#e50914', color: '#fff', border: 'none',
                    padding: '12px', fontSize: '17px', fontWeight: 'bold', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    cursor: 'pointer', transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#b30710'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#e50914'}
                >
                  <Play fill="white" size={18} /> צפייה ישירה
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* כפתור טלגרם צף - למטה בצד שמאל */}
      <div 
        onClick={() => window.open('https://t.me/YOUR_CHANNEL', '_blank')} // תחליף לקישור שלך
        style={{
          position: 'fixed', bottom: '30px', left: '30px', background: '#0088cc', // צבע טלגרם
          width: '60px', height: '60px', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 5px 20px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 1000
        }}
      >
        <Send size={30} fill="white" />
      </div>

    </div>
  );
}
