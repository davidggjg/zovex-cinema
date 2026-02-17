import { Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ movieTitle, movieId, style, size = 20 }) {
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = encodeURIComponent(window.location.origin + '?movie=' + movieId);
  const shareText = encodeURIComponent(`צפו ב-${movieTitle} ב-ZOVEX`);

  const share = (platform, e) => {
    e.stopPropagation();
    let url = '';
    
    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${shareText}%20${shareUrl}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(decodeURIComponent(shareUrl));
      alert('הקישור הועתק!');
      setShowMenu(false);
      return;
    }
    
    window.open(url, '_blank');
    setShowMenu(false);
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          padding: '8px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Share2 size={size} />
      </button>
      
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            background: '#1e293b',
            border: '1px solid rgba(229,9,20,0.3)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 100,
            minWidth: '140px',
          }}
        >
          <button
            onClick={(e) => share('whatsapp', e)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'right',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: "'Assistant',sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229,9,20,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            💬 WhatsApp
          </button>
          <button
            onClick={(e) => share('telegram', e)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'right',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: "'Assistant',sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229,9,20,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ✈️ Telegram
          </button>
          <button
            onClick={(e) => share('copy', e)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'right',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: "'Assistant',sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229,9,20,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            📋 העתק קישור
          </button>
        </div>
      )}
    </div>
  );
}