import { useState, useEffect } from "react";
import { Play, ChevronLeft, Info } from "lucide-react";

export default function DetailView({ item, onBack, onPlay }) {
  const handlePlayClick = () => {
    if (item.video_id) onPlay(item.video_id);
    else alert("לינק הוידאו לא תקין");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', direction: 'rtl', fontFamily: 'sans-serif' }}>
      {/* כפתור חזרה */}
      <button onClick={onBack} style={backButtonStyle}>
        <ChevronLeft size={28} style={{ transform: 'rotate(180deg)' }} />
      </button>

      {/* Hero Section */}
      <div style={{ height: '85vh', position: 'relative' }}>
        <img src={item.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 10%, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />
        
        <div style={{ position: 'absolute', bottom: '15%', right: '50px', maxWidth: '700px' }}>
          <h1 style={{ fontSize: '70px', margin: '0 0 10px 0', fontWeight: '900', letterSpacing: '-2px' }}>{item.title}</h1>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '25px', fontSize: '18px' }}>
            <span style={{ color: '#46d369', fontWeight: 'bold' }}>98% התאמה</span>
            <span style={{ color: '#aaa' }}>2026</span>
            <span style={{ border: '1px solid #666', padding: '0 8px', borderRadius: '4px', fontSize: '14px' }}>16+</span>
            <span style={{ color: '#aaa' }}>{item.category}</span>
          </div>

          <p style={{ fontSize: '20px', lineHeight: '1.6', color: '#e5e5e5', marginBottom: '35px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {item.description}
          </p>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            {/* כפתור צפייה אדום ובולט */}
            <button 
              onClick={handlePlayClick}
              className="play-btn-main"
              style={{ 
                padding: '15px 45px', fontSize: '22px', fontWeight: 'bold', 
                background: '#e50914', color: '#fff', border: 'none', 
                borderRadius: '8px', display: 'flex', alignItems: 'center', 
                gap: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)' 
              }}
            >
              <Play fill="white" size={28} /> צפייה ישירה
            </button>
            
            <button style={{ 
                padding: '15px 30px', fontSize: '22px', fontWeight: 'bold', 
                background: 'rgba(109, 109, 110, 0.7)', color: '#fff', border: 'none', 
                borderRadius: '8px', display: 'flex', alignItems: 'center', 
                gap: '12px', cursor: 'pointer' 
            }}>
              <Info size={28} /> מידע נוסף
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .play-btn-main:hover { background: #ff0a16 !important; transform: scale(1.05); transition: 0.2s; }
        @media (max-width: 768px) {
          h1 { fontSize: 40px !important; }
          div { right: 20px !important; }
        }
      `}</style>
    </div>
  );
}

const backButtonStyle = {
  position: 'fixed', top: '30px', right: '30px', zIndex: 1000,
  background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
  borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
};