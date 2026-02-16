import { useState, useEffect } from "react";
import { Play, Info, Download, ChevronLeft } from "lucide-react";

const getEmbedSrc = (movie) => {
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlayClick = () => {
    if (item.type === 'movie') {
      onPlay(getEmbedSrc(item.movieData));
    } else {
      // Play first episode
      const firstEp = item.episodes[0];
      if (firstEp) {
        onPlay(getEmbedSrc(firstEp));
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Back Button */}
      <button 
        onClick={onBack} 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '40px', 
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
        <ChevronLeft size={24} />
      </button>

      {/* Hero Section */}
      <div style={{ height: '80vh', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={item.backdrop} 
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
          style={{ position: 'absolute', inset: 0 }} 
        />
        
        <div style={{ 
          position: 'absolute', 
          bottom: '20%', 
          right: '40px', 
          maxWidth: '600px', 
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)' 
        }}>
          <h1 style={{ 
            fontSize: '60px', 
            margin: '0 0 10px 0', 
            fontWeight: '900', 
            lineHeight: 1 
          }}>
            {item.title}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '20px', 
            color: '#ccc' 
          }}>
            <span style={{ color: '#46d369' }}>{item.match}</span>
            <span>{item.year}</span>
            <span style={{ 
              border: '1px solid #ccc', 
              padding: '0 5px', 
              borderRadius: '3px' 
            }}>
              {item.age}
            </span>
            {item.type === 'series' && (
              <span>{item.episodes.length} פרקים</span>
            )}
          </div>
          
          <p style={{ 
            fontSize: '18px', 
            lineHeight: '1.5', 
            marginBottom: '30px' 
          }}>
            {item.description}
          </p>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
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
                gap: '10px' 
              }}
            >
              <Play fill="black" size={24} /> נגן
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '12px 35px', 
                fontSize: '20px', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '4px', 
                background: 'rgba(109, 109, 110, 0.7)', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}
            >
              <Download size={24} /> הורדה
            </button>
          </div>

          {/* Series Description - shown once */}
          {item.type === 'series' && item.description && (
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.6', 
              marginBottom: '20px',
              color: '#fff',
            }}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Episodes Section */}
      {item.type === 'series' && item.episodes.length > 0 && (
        <div style={{ 
          padding: '40px', 
          marginTop: '-100px', 
          position: 'relative', 
          zIndex: 10 
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            borderBottom: '3px solid var(--accent)', 
            paddingBottom: '10px', 
            display: 'inline-block',
            marginBottom: '20px',
          }}>
            פרקים
          </h3>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px', 
            marginTop: '20px' 
          }}>
            {item.episodes.map((ep, index) => (
              <div 
                key={ep.id} 
                className="card-hover" 
                onClick={() => onPlay(getEmbedSrc(ep))} 
                style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  padding: '20px', 
                  background: 'var(--card)', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid rgba(255,255,255,0.1)' 
                }}
              >
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#666', 
                  display: 'flex', 
                  alignItems: 'center',
                  minWidth: '30px',
                }}>
                  {ep.episode_number || index + 1}
                </div>
                
                <div style={{ 
                  width: '160px', 
                  height: '90px', 
                  background: '#000', 
                  borderRadius: '4px', 
                  overflow: 'hidden', 
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  <img 
                    src={ep.thumbnail_url || `https://img.youtube.com/vi/${ep.video_id}/mqdefault.jpg`} 
                    alt={ep.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: 'rgba(0,0,0,0.3)' 
                  }}>
                    <Play fill="white" color="white" size={32} />
                  </div>
                </div>
                
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '5px' 
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      {ep.title}
                    </span>
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>
                      51 דק'
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  paddingLeft: '10px',
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      background: 'transparent',
                      border: '2px solid #888',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#888',
                    }}
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}