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
          background: 'rgba(0,0,0,0.7)', 
          border: 'none', 
          color: '#fff', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          padding: '10px',
        }}
      >
        <X size={32} />
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