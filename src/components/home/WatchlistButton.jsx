import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function WatchlistButton({ movieId, style, size = 24 }) {
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('zovex_watchlist') || '[]');
    setInWatchlist(watchlist.includes(movieId));
  }, [movieId]);

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    const watchlist = JSON.parse(localStorage.getItem('zovex_watchlist') || '[]');
    
    if (inWatchlist) {
      const updated = watchlist.filter(id => id !== movieId);
      localStorage.setItem('zovex_watchlist', JSON.stringify(updated));
      setInWatchlist(false);
    } else {
      watchlist.push(movieId);
      localStorage.setItem('zovex_watchlist', JSON.stringify(watchlist));
      setInWatchlist(true);
    }
  };

  const Icon = inWatchlist ? BookmarkCheck : Bookmark;

  return (
    <button
      onClick={toggleWatchlist}
      style={{
        background: inWatchlist ? 'rgba(229,9,20,0.9)' : 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '8px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#e50914';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = inWatchlist ? 'rgba(229,9,20,0.9)' : 'rgba(0,0,0,0.6)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <Icon size={size} fill={inWatchlist ? '#fff' : 'none'} />
    </button>
  );
}