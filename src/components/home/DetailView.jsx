import { useState, useEffect } from "react";
import { Play, ChevronLeft } from "lucide-react";

// פונקציה חכמה שהופכת כל לינק רגיל ללינק של נגן (Embed)
const getEmbedSrc = (videoUrl) => {
  if (!videoUrl) return "";

  // אם זה יוטיוב - הופך ל-embed
  if (videoUrl.includes("youtube.com/watch?v=")) {
    const videoId = videoUrl.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  if (videoUrl.includes("youtu.be/")) {
    const videoId = videoUrl.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  // אם זה גוגל דרייב - הופך ל-preview
  if (videoUrl.includes("drive.google.com")) {
    // מחלץ את ה-ID מתוך הלינק
    const driveId = videoUrl.match(/\/d\/(.+?)\//)?.[1] || videoUrl.split("id=")[1];
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // אם זה כבר לינק embed מוכן (כמו שפאנל הניהול החדש יוצר)
  return videoUrl;
};

export default function DetailView({ item, onBack, onPlay }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlayClick = () => {
    // בבסיס הנתונים שלך הלינק נשמר תחת video_id
    if (item.type === 'movie') {
      onPlay(getEmbedSrc(item.video_id));
    } else {
      // בסדרות - מנגן את הפרק הראשון
      const firstEp = item.episodes?.[0];
      if (firstEp) {
        onPlay(getEmbedSrc(firstEp.video_id));
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', direction: 'rtl' }}>
      {/* כפתור חזרה */}
      <button 
        onClick={onBack} 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', // שיניתי לצד ימין בגלל העברית
          zIndex: 110, 
          background: 'rgba(0,0,0,0.5)', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '50%', 
          padding: '10px', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={24} style={{ transform: 'rotate(180deg)' }} />
      </button>

      {/* Hero Section */}
      <div style={{ height: '80vh', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={item.thumbnail_url} // השם הנכון של השדה ב-Base44
          alt={item.title}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            objectPosition: 'center top' 
          }} 
        />
        <div 
          className="hero-gradient" 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, var(--bg) 10%, transparent 90%)' 
          }} 
        />
        
        <div style={{ 
          position: 'absolute', 
          bottom: '20%', 
          right: '40px', 
          maxWidth: '600px', 
          textAlign: 'right'
        }}>
          <h1 style={{ fontSize: '60px', margin: '0 0 10px 0', fontWeight: '900' }}>
            {item.title}
          </h1>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', color: '#ccc', justifyContent: 'flex-start' }}>
            <span style={{ color: '#46d369' }}>חדש</span>
            <span>{item.category}</span>
            {item.type === 'series' && <span>{item.episodes?.length} פרקים</span>}
          </div>
          
          <p style={{ fontSize: '18px', lineHeight: '1.5', marginBottom: '30px', color: '#eee' }}>
            {item.description}
          </p>
          
          <button 
            onClick={handlePlayClick}
            className="btn" 
            style={{ 
              padding: '12px 35px', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              border: 'none', 
              borderRadius: '4px', 
              background: '#fff', 
              color: '#000', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <Play fill="black" size={24} /> נגן עכשיו
          </button>
        </div>
      </div>

      {/* רשימת פרקים לסדרות */}
      {item.type === 'series' && item.episodes?.length > 0 && (
        <div style={{ padding: '40px', position: 'relative', zIndex: 10 }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '2px solid #fff', display: 'inline-block' }}>
            פרקים
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {item.episodes.map((ep, index) => (
              <div 
                key={ep.id} 
                onClick={() => onPlay(getEmbedSrc(ep.video_id))} 
                style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  padding: '15px', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '20px', color: '#666', minWidth: '30px' }}>{index + 1}</div>
                <div style={{ width: '150px', height: '85px', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                    <img src={ep.thumbnail_url || item.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{ep.title}</div>
                  <div style={{ fontSize: '14px', color: '#aaa' }}>עונה {ep.metadata?.season || 1} פרק {ep.metadata?.episode || index+1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}