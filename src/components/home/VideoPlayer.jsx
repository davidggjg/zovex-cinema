import { X } from "lucide-react";

export default function VideoPlayer({ src, onClose }) {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: '#000', 
      zIndex: 200, 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        justifyContent: 'flex-end' 
      }}>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#fff', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={40} />
        </button>
      </div>
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <iframe 
          src={src} 
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none' 
          }} 
          allowFullScreen 
          allow="autoplay; encrypted-media"
        />
      </div>
    </div>
  );
}