import { useState, useEffect } from "react";
import { Play, ChevronLeft } from "lucide-react";

const getEmbedSrc = (movie) => {
  if (!movie || !movie.video_id) return "";
  switch (movie.type) {
    case "youtube":
      return `https://www.youtube.com/embed/${movie.video_id}?autoplay=1&rel=0`;
    case "drive":
      return `https://drive.google.com/file/d/${movie.video_id}/preview`;
    case "vimeo":
      return `https://player.vimeo.com/video/${movie.video_id}?autoplay=1`;
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${movie.video_id}?autoplay=1`;
    case "streamable":
      return `https://streamable.com/e/${movie.video_id}?autoplay=1`;
    case "archive":
      return `https://archive.org/embed/${movie.video_id}`;
    default:
      return "";
  }
};

export default function DetailView({ item, onBack, onPlay }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    window.scrollTo(0, 0); // מוודא שהדף נפתח תמיד למעלה
    return () => window.removeEventListener('scroll', handleScroll);
  }, [item]);

  const handlePlayClick = () => {
    if (item.type === 'movie') {
      onPlay(getEmbedSrc(item.movieData));
    } else if (item.episodes && item.episodes.length > 0) {
      onPlay(getEmbedSrc(item.episodes[0]));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', direction: 'rtl' }}>
      {/* Back Button */}
      <button 
        onClick={onBack} 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '20px', 
          zIndex: 110, 
          background: 'rgba(0,0,0,0.6)', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '50%', 
          padding: '12px', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}
      >
        <ChevronLeft size={28} />
      </button>

      {/* Hero Section */}
      <div style={{ height: '75vh', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={item.backdrop || item.poster} 
          alt={item.title}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            objectPosition: 'center top' 
          }} 
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, var(--bg) 10%, transparent 100%)' 
        }} />
        
        <div style={{ 
          position: 'absolute', 
          bottom: '10%', 
          right: '5%', 
          left: '5%',
          maxWidth: '800px', 
          textAlign: 'right'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(32px, 8vw, 60px)', 
            margin: '0 0 10px 0', 
            fontWeight: '900', 
            lineHeight: 1.1,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            {item.title}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '20px', 
            color: '#ccc',
            alignItems: 'center'
          }}>
            <span style={{ color: '#46d369' }}>{item.match || '98% התאמה'}</span>
            <span>{item.year}</span>
            <span style={{ 
              border: '1px solid #ccc', 
              padding: '0 8px', 
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {item.age || '13+'}
            </span>
            {item.type === 'series' && (
              <span>{item.episodes?.length} פרקים</span>
            )}
          </div>
          
          <p style={{ 
            fontSize: 'clamp(14px, 4vw, 18px)', 
            lineHeight: '1.6', 
            marginBottom: '30px',
            color: '#eee',
            maxWidth: '600px'
          }}>
            {item.description}
          </p>
          
          <button 
            onClick={handlePlayClick}
            style={{ 
              padding: '12px 45px', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              border: 'none', 
              borderRadius: '4px', 
              background: '#fff', 
              color: '#000', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Play fill="black" size={24} /> נגן
          </button>
        </div>
      </div>

      {/* Episodes Section - מופיע רק בסדרות */}
      {item.type === 'series' && item.episodes && item.episodes.length > 0 && (
        <div style={{ padding: '40px 5%', background: 'var(--bg)' }}>
          <h3 style={{ 
            fontSize: '24px', 
            borderBottom: '3px solid var(--accent, #e50914)', 
            paddingBottom: '10px', 
            display: 'inline-block',
            marginBottom: '30px',
          }}>
            פרקים
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {item.episodes.map((ep, index) => (
              <div 
                key={ep.id || index} 
                onClick={() => onPlay(getEmbedSrc(ep))} 
                style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  padding: '15px', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  alignItems: 'center',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <span style={{ fontSize: '20px', color: '#666', minWidth: '30px', fontWeight: 'bold' }}>
                  {index + 1}
                </span>
                
                <div style={{ 
                  width: '140px', 
                  aspectRatio: '16/9', 
                  background: '#000', 
                  borderRadius: '6px', 
                  overflow: 'hidden', 
                  position: 'relative',
                  flexShrink: 0 
                }}>
                  <img 
                    src={ep.thumbnail_url || item.backdrop} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <Play fill="white" size={24} color="white" />
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{ep.title || `פרק ${index + 1}`}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#aaa' }}>צפה עכשיו</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* אין יותר GridView או רשימות סרטים דומים כאן */}
    </div>
  );
}