export default function CyberStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

      :root {
        --cyber-bg: #040608;
        --cyber-bg2: #080c12;
        --cyber-bg3: #0d1520;
        --cyber-neon: #00d2ff;
        --cyber-neon2: #0080ff;
        --cyber-neon3: #00ffcc;
        --cyber-accent: #ff003c;
        --cyber-text: #c8e6ff;
        --cyber-text-dim: #4a7090;
      }

      .cyber-page {
        background: var(--cyber-bg);
        color: var(--cyber-text);
        font-family: 'Rajdhani', sans-serif;
        min-height: 100vh;
        direction: rtl;
      }

      .light-page {
        background: #ffffff;
        color: #1a202c;
        font-family: 'Rajdhani', sans-serif;
        min-height: 100vh;
        direction: rtl;
        position: relative;
      }

      .light-page::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6992542871bb3f3ba9500a34/505bf6a49_1771178941220.png');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        opacity: 0.15;
        z-index: 0;
        pointer-events: none;
      }

      .light-page ::-webkit-scrollbar { width: 4px; }
      .light-page ::-webkit-scrollbar-track { background: #f7fafc; }
      .light-page ::-webkit-scrollbar-thumb { background: #4299e1; border-radius: 2px; }

      .cyber-page ::-webkit-scrollbar { width: 4px; }
      .cyber-page ::-webkit-scrollbar-track { background: var(--cyber-bg2); }
      .cyber-page ::-webkit-scrollbar-thumb { background: var(--cyber-neon); border-radius: 2px; }

      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
      @keyframes flicker {
        0%,100%{opacity:1;} 92%{opacity:1;} 93%{opacity:.7;} 94%{opacity:1;} 96%{opacity:.9;}
      }
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes slideIn {
        from { opacity:0; transform:translateY(-10px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes modalIn {
        from { opacity:0; transform:scale(0.92) translateY(20px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
      @keyframes spin { to { transform:rotate(360deg); } }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      @keyframes glow-pulse {
        0%,100% { box-shadow: 0 0 20px rgba(0,210,255,0.2); }
        50%      { box-shadow: 0 0 40px rgba(0,210,255,0.5), 0 0 80px rgba(0,210,255,0.2); }
      }
    `}</style>
  );
}