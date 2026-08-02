import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, ArrowLeft, Download, Smartphone } from "lucide-react";

const NEW_SITE_URL = "https://zovex.duckdns.org/";
const APK_URL = "https://github.com/davidggjg/zovex-android/releases/latest/download/zovex.apk";
const COUNTDOWN_SECONDS = 20;

const styles = `
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: .6; }
  90% { opacity: .6; }
  100% { transform: translateY(-10vh) scale(1.4); opacity: 0; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 24px rgba(229,9,20,.4); }
  50% { box-shadow: 0 0 40px rgba(229,9,20,.7); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes bounceArrow {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-6px); }
}
`;

function FloatingParticles() {
  // Few, lightweight particles — no rotation, smaller count
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 10 + 6,
    duration: Math.random() * 6 + 8,
    delay: Math.random() * 6,
    emoji: ["🎬", "🍿", "✨", "🔥"][i % 4],
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: "-40px",
            fontSize: p.size,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
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
    }, 200);
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
        background: "linear-gradient(135deg, #05050a 0%, #1a0a1e 40%, #1e0a14 70%, #05050a 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 14s ease infinite",
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

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "36px 24px",
          maxWidth: 440,
          width: "100%",
          animation: "slideInUp .7s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 22, animation: "slideInUp .7s cubic-bezier(.16,1,.3,1) .1s both" }}>
          <h1
            style={{
              fontSize: "clamp(48px, 14vw, 76px)",
              fontWeight: 900,
              margin: 0,
              letterSpacing: 5,
              background: "linear-gradient(90deg, #e50914, #ff4d4d, #e50914)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
            }}
          >
            ZOVEX
          </h1>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 6, color: "#bbb", fontSize: 13, fontWeight: 600,
          }}>
            <Sparkles size={13} />
            <span>סדרות וסרטים לצפייה ישירה</span>
          </div>
        </div>

        {/* Announcement card */}
        <div
          style={{
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 22,
            padding: "26px 22px",
            marginBottom: 18,
            animation: "slideInUp .7s cubic-bezier(.16,1,.3,1) .2s both",
          }}
        >
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #e50914, #ff4d4d)",
            color: "#fff",
            padding: "5px 16px",
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 14,
            letterSpacing: 1,
          }}>
            עדכון חשוב
          </div>

          <h2 style={{
            color: "#fff", fontSize: 24, fontWeight: 800,
            margin: "0 0 10px", lineHeight: 1.4,
          }}>
            עברנו לאתר חדש! 🎉
          </h2>

          <p style={{
            color: "rgba(255,255,255,.75)", fontSize: 15,
            lineHeight: 1.7, margin: "0 0 20px",
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
              padding: "14px 24px",
              borderRadius: 14,
              fontSize: 16,
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
              padding: "14px 24px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 800,
              marginTop: 10,
              transition: "transform .2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
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
              marginTop: 16,
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
            }}
          >
            <ExternalLink size={13} />
            {copied ? "הקישור הועתק! ✓" : NEW_SITE_URL}
          </button>
        </div>

        {/* Countdown with progress bar */}
        <div style={{ animation: "slideInUp .7s cubic-bezier(.16,1,.3,1) .3s both" }}>
          <div style={{
            color: "rgba(255,255,255,.55)",
            fontSize: 13,
            marginBottom: 8,
          }}>
            מעבר אוטומטי לאתר החדש בעוד{" "}
            <span style={{
              color: "#e50914",
              fontWeight: 900,
              fontSize: 20,
              display: "inline-block",
              minWidth: 26,
            }}>
              {countdown}
            </span>
            {" "}שניות
          </div>
          <div style={{
            width: "100%", maxWidth: 260, margin: "0 auto",
            height: 6, borderRadius: 6,
            background: "rgba(255,255,255,.1)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 6,
              background: "linear-gradient(90deg, #e50914, #ff4d4d)",
              width: `${progress}%`,
              transition: "width .2s linear",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}