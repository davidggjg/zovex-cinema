import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, Search, Loader2, MessageCircle } from "lucide-react";

export default function Home({ onMovieSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  // שליפת הנתונים מהשרת שלך
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
      
      {/* סרגל עליון - עיצוב מעוגל ויוקרתי */}
      <nav style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '15px 5%', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 style={{ color: '#e50914', fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>ZOVEX</h1>
          <div style={{ display: 'flex', gap: '25px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
            <span style={{ cursor: 'pointer', color: '#e50914' }}>ראשי</span>
            <span style={{ cursor: 'pointer' }}>סדרות</span>
            <span style={{ cursor: 'pointer' }}>סרטים</span>
          </div>
        </div>
        
        {/* חיפוש מעוגל ויפה */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f5', 
          padding: '10px 20px', borderRadius: '50px', width: '350px', border: '1px solid #eee' 
        }}>
          <Search size={20} color="#999" />
          <input 
            type="text" placeholder="מה תרצו לראות היום?" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '15px' }} 
          />
        </div>
      </nav>

      {/* גוף הדף - רשימת סרטים בכרטיסים נקיים */}
      <div style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '26px', marginBottom: '30px', fontWeight: '800' }}>הוספו לאחרונה</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '35px' }}>
          {filteredMovies?.map((movie) => (
            <div key={movie.id} style={{ 
              background: '#fff', borderRadius: '15px', overflow: 'hidden', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transition: '0.3s' 
            }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => onMovieSelect(movie)}>
                <img src={movie.thumbnail_url} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                <div style={{ 
                  position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', 
                  display: 'flex', alignItems: 'flex-end', padding: '15px' 
                }}>
                   <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{movie.title}</span>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px', height: '45px', overflow: 'hidden' }}>
                  {movie.description}
                </p>

                {/* הכפתור האדום הענק - צפייה ישירה */}
                <button 
                  onClick={() => onMovieSelect(movie)}
                  style={{
                    width: '100%', background: '#e50914', color: '#fff', border: 'none',
                    padding: '15px', fontSize: '19px', fontWeight: '900', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    cursor: 'pointer', boxShadow: '0 5px 15px rgba(229, 9, 20, 0.3)'
                  }}
                >
                  <Play fill="white" size={22} /> צפייה ישירה
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* כפתור צף (WhatsApp/Support) בצד שמאל למטה */}
      <div style={{
        position: 'fixed', bottom: '30px', left: '30px', background: '#e50914',
        width: '60px', height: '60px', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 1000
      }}>
        <MessageCircle size={30} />
      </div>

    </div>
  );
}