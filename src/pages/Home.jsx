import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, Search, Loader2 } from "lucide-react";

export default function Home({ onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  // שליפת הסרטים מהדאטה-בייס - זה מה שמחזיר את הסרטים שלך לאתר
  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // פונקציית החיפוש
  const filteredMovies = movies?.filter(movie => 
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
      <Loader2 className="animate-spin" size={40} color="#e50914" />
    </div>
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון - לוגו אדום ותפריט לבן */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '15px 4%', 
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 style={{ color: '#e50914', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>ZOVEX</h1>
          <div style={{ display: 'flex', gap: '20px', fontSize: '16px', fontWeight: '500' }}>
            <span style={{ cursor: 'pointer' }}>ראשי</span>
            <span style={{ color: '#666', cursor: 'pointer' }}>סדרות</span>
            <span style={{ color: '#666', cursor: 'pointer' }}>סרטים</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f0f0', padding: '5px 15px', borderRadius: '5px' }}>
          <Search size={18} color="#666" />
          <input 
            type="text" 
            placeholder="חיפוש..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none' }} 
          />
        </div>
      </nav>

      {/* רשימת הסרטים */}
      <div style={{ padding: '30px 4%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredMovies && filteredMovies.map((movie) => (
            <div key={movie.id} style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <img 
                src={movie.thumbnail_url} 
                alt={movie.title}
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} 
              />
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>{movie.title}</h3>
                
                {/* הכפתור האדום המודגש - עכשיו הוא פה וזה עובד */}
                <button 
                  onClick={() => onMovieSelect(movie)}
                  style={{
                    width: '100%',
                    background: '#e50914', // אדום בולט
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#ff0000'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#e50914'}
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