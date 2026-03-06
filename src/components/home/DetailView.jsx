import { useState, useEffect } from "react";
import { Play, ChevronLeft } from "lucide-react";

const getEmbedSrc = (movie) => {
  if (!movie || !movie.video_id) return "";
  switch (movie.type) {
    case "kan": return `https://www.kan.org.il/General/Embed.aspx?id=${movie.video_id}`;
    case "youtube": return `https://www.youtube.com/embed/${movie.video_id}?autoplay=1&rel=0`;
    case "drive": return `https://drive.google.com/file/d/${movie.video_id}/preview`;
    case "vimeo": return `https://player.vimeo.com/video/${movie.video_id}?autoplay=1`;
    default: return "";
  }
};

export default function DetailView({ item, onBack, onPlay }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [item]);

  const handlePlayClick = () => {
    if (item.type === 'movie') {
      onPlay(getEmbedSrc(item.movieData));
    } else if (item.episodes?.length > 0) {
      onPlay(getEmbedSrc(item.episodes[0]));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', direction: 'rtl', position: 'relative', zIndex: 100, paddingBottom: '100px' }}>
      <button onClick={onBack} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 110, background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}>
        <ChevronLeft size={24} />
      </button>

      <div style={{ padding: '40px 5%' }}>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 50px)', margin: '0 0 10px 0' }}>{item.title}</h1>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', color: '#666' }}>
          <span>{item.year}</span>
          <span style={{ border: '1px solid #ccc', padding: '0 5px' }}>{item.age}</span>
        </div>

        <button onClick={handlePlayClick} style={{ padding: '12px 35px', fontSize: '20px', fontWeight: 'bold', background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Play fill="white" size={20} /> נגן
        </button>

        <p style={{ marginTop: '30px', fontSize: '18px', lineHeight: '1.6' }}>{item.description}</p>
      </div>

      {item.type === 'series' && item.episodes && (
        <div style={{ padding: '0 5% 40px 5%' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>פרקים</h3>
          {item.episodes.map((ep, i) => (
            <div key={i} onClick={() => onPlay(getEmbedSrc(ep))} style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#ccc', fontWeight: 'bold' }}>{i + 1}</span>
              <span>{ep.title || `פרק ${i + 1}`}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: '200px', background: '#fff' }}></div>
    </div>
  );
}