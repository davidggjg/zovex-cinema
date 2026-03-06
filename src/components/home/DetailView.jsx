import { useState, useEffect } from "react";
import { Play, ChevronLeft } from "lucide-react";

export default function DetailView({ item, onBack, onPlay }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlayClick = () => {
    // מפעיל את הנגן עם הלינק ששמור ב-video_id
    if (item.video_id) {
      onPlay(item.video_id);
    } else {
      alert("שגיאה: לא נמצא לינק לוידאו עבור תוכן זה.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', direction: 'rtl', fontFamily: 'sans-serif' }}>
      {/* כפתור חזרה */}
      <button 
        onClick={onBack} 
        style={{ 
          position: 'fixed', top: '20px', right: '20px', zIndex: 110, 
          background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', 
          borderRadius: '50%', padding: '10px', cursor: 'pointer' 
        }}
      >
        <ChevronLeft size={24} style={{ transform: 'rotate(180deg)' }} />
      </button>

      {/* Hero Image */}
      <div style={{ height: '70vh', position: 'relative' }}>
        <img 
          src={item.thumbnail_url} 
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to top, #000 5%, transparent 95%)' 
        }} />
        
        <div style={{ 
          position: 'absolute', bottom: '10%', right: '40px', maxWidth: '600px' 
        }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>{item.title}</h1>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', color: '#46d369', fontWeight: 'bold' }}>
            <span>{item.category}</span>
            <span style={{ color: '#fff' }}>2026</span>
          </div>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#ccc', marginBottom: '25px' }}>
            {item.description}
          </p>
          <button 
            onClick={handlePlayClick}
            style={{ 
              padding: '12px 40px', fontSize: '20px', fontWeight: 'bold', 
              background: '#fff', color: '#000', border: 'none', 
              borderRadius: '4px', display: 'flex', alignItems: 'center', 
              gap: '10px', cursor: 'pointer' 
            }}
          >
            <Play fill="black" size={24} /> נגן עכשיו
          </button>
        </div>
      </div>
    </div>
  );
}