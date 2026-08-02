import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, ArrowLeft, Download, Smartphone, Zap, Film } from "lucide-react";

const NEW_SITE_URL = "https://zovex.duckdns.org/";
const APK_URL = "https://github.com/davidggjg/zovex-android/releases/latest/download/zovex.apk";
const COUNTDOWN_SECONDS = 20;

const styles = `
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-10vh) scale(1.4) rotate(360deg); opacity: 0; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(229,9,20,.5), 0 0 60px rgba(229,9,20,.3); }
  50% { box-shadow: 0 0 60px rgba(229,9,20,.9), 0 0 120px rgba(229,9,20,.6); }
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
@keyframes scaleBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes neonFlicker {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px rgba(229,9,20,.8)); }
  50% { opacity: .85; filter: drop-shadow(0 0 20px rgba(229,9,20,1)); }
}
@keyframes auroraMove {
  0% { transform: translate(0,0) rotate(0deg); }
  50% { transform: translate(40px,-30px) rotate(180deg); }
  100% { transform: translate(0,0) rotate(360deg); }
}
@keyframes scanline {
  0% { top: -10%; }
  100% { top: 110%; }
}
@keyframes popIn {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
`;

function FloatingParticles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 14 + 6,
    duration: Math.random() * 10 + 7,
    delay: Math.random() * 8,
    emoji: ["🎬", "🍿", "📺", "✨", "🎥", "🔥", "💫", "⭐"][i % 8],
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
            opacity: 0.5,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function Ripple({ delay }) {
  return (
    <span
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        border: "2px solid rgba(52,199,89,.6)",
        animation: `ripple 2.4s ease-out ${delay}s infinite`,
        pointerEvents: "none",
      }}
    />
  );
}

export default function RedirectScreen() {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.title = "עברנו לאתר חדש | ZOVEX";
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, COUNTDOWN_SECONDS - Math.floor(elapsed));
      setCountdown(remaining);
      setProgress((elapsed / COUNTDOWN_SECONDS) * 100);
      if (remaining <= 0) {
        clearInterval(timer);
        window.location.href = NEW_SITE_URL;
      }
    }, 100);
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
        background: "linear-gradient(135deg, #05050a 0%, #1a0a1e 20%, #0f0a1f 40%, #1e0a14 60%, #0a0512 80%, #05050a 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 10s ease infinite",
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

      {/* Aurora glow orbs */}
      <div style={{
        position: "absolute", top: "8%", right: "8%",
        width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(229,9,20,.3) 0%, transparent 70%)",
        filter: "blur(50px)", animation: "auroraMove 8s ease-in-out infinite, pulseGlow 4s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "8%", left: "8%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,.25) 0%, transparent 70%)",
        filter: "blur(50px)", animation: "auroraMove 10s ease-in-out infinite reverse, pulseGlow 5s ease-in-out infinite 1s",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "50%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(229,9,20,.15) 0%, transparent 70%)",
        filter: "blur(60px)", animation: "auroraMove 12s ease-in-out infinite",
        transform: "translate(-50%,-50%)",
      }} />

      {/* Scanline effect */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(229,9,20,.5), transparent)",
        animation: "scanline 4s linear infinite", zIndex: 2,
      }} />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "36px 24px",
          maxWidth: 460,
          width: "100%",
          animation: "slideInUp .8s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 24, animation: "slideInUp .8s cubic-bezier(.16,1,.3,1) .1s both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            marginBottom: 6, animation: "popIn .6s cubic-bezier(.16,1,.3,1) .05s both",
          }}>
            <Film size={32} style={{ color: "#e50914", animation: "spinSlow 6s linear infinite" }} />
            <Zap size={28} style={{ color: "#ff4d4d", animation: "neonFlicker 1.5s ease-in-out infinite" }} />
          </div>
          <h1
            style={{
              fontSize: "clamp(52px, 15vw, 88px)",
              fontWeight: 900,
              margin: 0,
              letterSpacing: 6,
              background: "linear-gradient(90deg, #e50914, #ff4d4d, #ff8a3d, #e50914)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 2.5s linear infinite",
              textShadow: "0 0 50px rgba(229,9,20,.5)",
            }}
          >
            ZOVEX
          </h1>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 8, color: "#bbb", fontSize: 13, fontWeight: 600,
          }}>
            <Sparkles size={14} style={{ animation: "spinSlow 4s linear infinite" }} />
            <span>סדרות וסרטים לצפייה ישירה</span>
            <Sparkles size={14} style={{ animation: "spinSlow 4s linear infinite reverse" }} />
          </div>
        </div>

        {/* Announcement card */}
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 24,
            padding: "28px 22px",
            marginBottom: 18,
            animation: "slideInUp .8s cubic-bezier(.16,1,.3,1) .2s both",
            boxShadow: "0 24px 70px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)",
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
            marginBottom: 16,
            letterSpacing: 1,
            boxShadow: "0 4px 15px rgba(229,9,20,.5)",
            animation: "scaleBeat 2s ease-in-out infinite",
          }}>
            עדכון חשוב
          </div>

          <h2 style={{
            color: "#fff", fontSize: 26, fontWeight: 800,
            margin: "0 0 10px", lineHeight: 1.4,
          }}>
            עברנו לאתר חדש! 🎉
          </h2>

          <p style={{
            color: "rgba(255,255,255,.75)", fontSize: 15,
            lineHeight: 1.8, margin: "0 0 22px",
          }}>
            מוזמנים להיכנס לאתר החדש שלנו<br />
            עם חוויה משופרת ותוכן מעודכן
          </p>

          {/* Site button */}
          <a
            href={NEW_SITE_URL}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10,
              background: "linear-gradient(135deg, #e50914, #b80710)",
              color: "#fff",
              textDecoration: "none",
              padding: "15px 24px",
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

          {/* APK download button */}
          <a
            href={APK_URL}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10,
              background: "linear-gradient(135deg, #34c759, #248a3d)",
              color: "#fff",
              textDecoration: "none",
              padding: "15px 24px",
              borderRadius: 16,
              fontSize: 17,
              fontWeight: 800,
              marginTop: 12,
              position: "relative",
              transition: "transform .2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Ripple delay={0} />
            <Ripple delay={0.8} />
            <Ripple delay={1.6} />
            <Smartphone size={20} />
            <span>הורד את האפליקציה לאנדרואיד</span>
            <Download size={20} style={{ animation: "bounceArrow 1.2s ease-in-out infinite" }} />
          </a>
          <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,.45)" }}>
            קובץ APK · התקנה ישירה
          </div>

          {/* Copy link */}
          <button
            onClick={copyLink}
            style={{
              marginTop: 18,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              color: copied ? "#34c759" : "rgba(255,255,255,.7)",
              padding: "9px 16px",
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

        {/* Countdown with progress bar */}
        <div style={{
          animation: "slideInUp .8s cubic-bezier(.16,1,.3,1) .3s both",
        }}>
          <div style={{
            color: "rgba(255,255,255,.55)",
            fontSize: 13,
            marginBottom: 10,
          }}>
            מעבר אוטומטי לאתר החדש בעוד{" "}
            <span style={{
              color: "#e50914",
              fontWeight: 900,
              fontSize: 22,
              display: "inline-block",
              minWidth: 28,
              textShadow: "0 0 12px rgba(229,9,20,.6)",
            }}>
              {countdown}
            </span>
            {" "}שניות
          </div>
          {/* Progress bar */}
          <div style={{
            width: "100%", maxWidth: 280, margin: "0 auto",
            height: 6, borderRadius: 6,
            background: "rgba(255,255,255,.1)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 6,
              background: "linear-gradient(90deg, #e50914, #ff4d4d, #ff8a3d)",
              width: `${progress}%`,
              transition: "width .1s linear",
              boxShadow: "0 0 12px rgba(229,9,20,.6)",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}