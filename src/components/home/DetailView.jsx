import { useEffect } from "react";
import { Play, ChevronLeft } from "lucide-react";

const getEmbedSrc = (movie) => {
  if (!movie || !movie.video_id) return "";
  // תמיכה בקישורי הנגן של כאן 11 ובקישורי m3u8
  if (movie.type === "kan" || movie.video_id.includes("m3u8")) {
    return movie.video_id.startsWith("http") ? movie.video_id : `https://www.kan.org.il/General/Embed.aspx?id=${movie.video_id}`;
  }
  switch (movie.type) {
    case "youtube": return `https://www.youtube.com/embed/${movie.video_id}?autoplay=1`;
    case "drive": return `https://drive.google.com/file/d/${movie.video_id}/preview`;
    default: return "";
  }
};

export default function DetailView({ item, onBack, onPlay }) {
  useEffect(() => { window.scrollTo(0, 0); }, [item]);

  const handlePlayClick = () => {
    const data = item.movieData || item;
    onPlay(getEmbedSrc(data));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', direction: 'rtl' }}>
      <button onClick={onBack} style={{ position: 'fixed', top: '20px', left: '20px', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 110 }}>
        <ChevronLeft size={24} />
      </button>
      <div style={{ padding: '40px 5%' }}>
        <h1 style={{ fontSize: '35px', fontWeight: 'bold' }}>{item.title}</h1>
        <button onClick={handlePlayClick} style={{ padding: '12px 35px', fontSize: '20px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <Play fill="white" size={20} /> נגן עכשיו
        </button>
        <p style={{ marginTop: '30px', fontSize: '18px', lineHeight: '1.6' }}>{item.description}</p>
      </div>
    </div>
  );
}