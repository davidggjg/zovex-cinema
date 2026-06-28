import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, ArrowLeft } from "lucide-react";

const NEW_SITE_URL = "https://davidggjg.github.io/zovex";

const styles = `
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(229,9,20,.5), 0 0 60px rgba(229,9,20,.3); }
  50% { box-shadow: 0 0 50px rgba(229,9,20,.8), 0 0 100px rgba(229,9,20,.5); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes spinSlow {
  to { transform: rotate(360deg); }
}
@keyframes bounceArrow {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-8px); }
}
`;

function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 6,
    emoji: ["🎬", "🍿", "📺", "✨", "🎥"][i % 5],
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: "-50px",
            fontSize: p.size,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.4,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export default function RedirectScreen() {
  const [countdown, setCountdown] = useState(5);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "עברנו לאתר חדש | ZOVEX";
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          window.location.href = NEW_SITE_URL;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyLink = () => {
    navigator.clipboard?.writeText(NEW_SITE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a1e 25%, #0f0a1a 50%, #1e0a14 75%, #0a0a0f 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 12s ease infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{styles}</style>
      <FloatingParticles />

      {/* Glow orbs */}
      <div style={{
        position: "absolute", top: "10%", right: "10%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(229,9,20,.25) 0%, transparent 70%)",
        filter: "blur(40px)", animation: "pulseGlow 4s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "10%",
        width: 250, height: 250, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)",
        filter: "blur(40px)", animation: "pulseGlow 5s ease-in-out infinite 1s",
      }} />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "40px 28px",
          maxWidth: 480,
          animation: "slideInUp .8s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* Logo with shimmer */}
        <div style={{ marginBottom: 28, animation: "slideInUp .8s cubic-bezier(.16,1,.3,1) .1s both" }}>
          <h1
            style={{
              fontSize: "clamp(48px, 14vw, 80px)",
              fontWeight: 900,
              margin: 0,
              letterSpacing: 4,
              background: "linear-gradient(90deg, #e50914, #ff4d4d, #e50914, #ff4d4d)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
              textShadow: "0 0 40px rgba(229,9,20,.4)",
            }}
          >
            ZOVEX
          </h1>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 8, color: "#aaa", fontSize: 13, fontWeight: 600,
          }}>
            <Sparkles size={14} style={{ animation: "spinSlow 4s linear infinite" }} />
            <span>סדרות וסרטים לצפייה ישירה</span>
          </div>
        </div>

        {/* Announcement card */}
        <div
          style={{
            background: "rgba(255,255,255,.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 24,
            padding: "32px 24px",
            marginBottom: 24,
            animation: "slideInUp .8s cubic-bezier(.16,1,.3,1) .2s both",
            boxShadow: "0 20px 60px rgba(0,0,0,.4)",
          }}
        >
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #e50914, #ff4d4d)",
            color: "#fff",
            padding: "6px 18px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 18,
            letterSpacing: 1,
            boxShadow: "0 4px 15px rgba(229,9,20,.4)",
          }}>
            עדכון חשוב
          </div>

          <h2 style={{
            color: "#fff", fontSize: 24, fontWeight: 800,
            margin: "0 0 12px", lineHeight: 1.4,
          }}>
            עברנו לאתר חדש! 🎉
          </h2>

          <p style={{
            color: "rgba(255,255,255,.75)", fontSize: 15,
            lineHeight: 1.8, margin: "0 0 24px",
          }}>
            מוזמנים להיכנס לאתר החדש שלנו<br />
            עם חוויה משופרת ותוכן מעודכן
          </p>

          {/* Link button */}
          <a
            href={NEW_SITE_URL}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10,
              background: "linear-gradient(135deg, #e50914, #b80710)",
              color: "#fff",
              textDecoration: "none",
              padding: "16px 24px",
              borderRadius: 16,
              fontSize: 17,
              fontWeight: 800,
              animation: "pulseGlow 2.5s ease-in-out infinite",
              transition: "transform .2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <span>לכניסה לאתר החדש</span>
            <ArrowLeft size={20} style={{ animation: "bounceArrow 1.2s ease-in-out infinite" }} />
          </a>

          {/* Copy link */}
          <button
            onClick={copyLink}
            style={{
              marginTop: 14,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              color: copied ? "#34c759" : "rgba(255,255,255,.7)",
              padding: "10px 18px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all .2s",
            }}
          >
            <ExternalLink size={13} />
            {copied ? "הקישור הועתק! ✓" : NEW_SITE_URL}
          </button>
        </div>

        {/* Countdown */}
        <div style={{
          color: "rgba(255,255,255,.5)",
          fontSize: 13,
          animation: "slideInUp .8s cubic-bezier(.16,1,.3,1) .3s both",
        }}>
          מעבר אוטומטי לאתר החדש בעוד{" "}
          <span style={{
            color: "#e50914",
            fontWeight: 900,
            fontSize: 18,
            display: "inline-block",
            minWidth: 20,
          }}>
            {countdown}
          </span>
          {" "}שניות
        </div>
      </div>
    </div>
  );
}