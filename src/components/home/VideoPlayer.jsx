import { X } from "lucide-react";

export default function VideoPlayer({ src, onClose }) {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: '#000', 
      zIndex: 200 
    }}>
      <button 
        onClick={onClose} 
        style={{ 
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 201,
          background: 'rgba(0,0,0,0.9)', 
          border: '2px solid rgba(255,255,255,0.3)', 
          color: '#fff', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.9)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <X size={36} />
      </button>
      
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
  );
}