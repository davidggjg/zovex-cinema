import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, ArrowLeft, Download, Smartphone } from "lucide-react";

const NEW_SITE_URL = "https://zovex.duckdns.org/";
const APK_URL = "https://github.com/davidggjg/zovex-android/releases/latest/download/zovex.apk";
const COUNTDOWN_SECONDS = 20;

// Cinematic / movie-still themed images (Unsplash, valid URLs)
const POSTER_IMAGES = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=60",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=60",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&q=60",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&q=60",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&q=60",
  "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&q=60",
];

const styles = `
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(168,85,247,.45), 0 0 60px rgba(236,72,153,.25); }
  50% { box-shadow: 0 0 50px rgba(168,85,247,.7), 0 0 90px rgba(236,72,153,.4); }
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
@keyframes driftCard {
  0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
  10% { opacity: .55; }
  90% { opacity: .55; }
  100% { transform: translateY(-15vh) rotate(14deg); opacity: 0; }
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(40px,-30px) scale(1.1); }
  66% { transform: translate(-30px,20px) scale(.95); }
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

// Neon palette
const NEON1 = "#a855f7"; // purple
const NEON2 = "#ec4899"; // pink
const NEON3 = "#22d3ee"; // cyan

function FloatingPosters() {
  const tiles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: 6 + Math.random() * 88,
    size: Math.random() * 26 + 54,
    duration: Math.random() * 10 + 16,
    delay: Math.random() * 12,
    rotate: Math.random() * 20 - 10,
    img: POSTER_IMAGES[i],
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {tiles.map((t) => (
        <div
          key={t.id}
          style={{
            position: "absolute",
            left: `${t.left}%`,
            bottom: "-120px",
            width: t.size,
            height: t.size * 1.5,
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid rgba(168,85,247,.35)`,
            boxShadow: "0 8px 30px rgba(0,0,0,.5)",
            transform: `rotate(${t.rotate}deg)`,
            animation: `driftCard ${t.duration}s linear ${t.delay}s infinite`,
          }}
        >
          <img
            src={t.img}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 40%, rgba(5,5,10,.7) 100%)",
          }} />
        </div>
      ))}
    </div>
  );
}

function GlowOrbs() {
  const orbs = [
    { top: "10%", left: "8%", size: 220, color: "rgba(168,85,247,.22)", dur: 18 },
    { top: "60%", left: "78%", size: 280, color: "rgba(236,72,153,.18)", dur: 22 },
    { top: "75%", left: "15%", size: 180, color: "rgba(34,211,238,.16)", dur: 26 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: o.top, left: o.left,
            width: o.size, height: o.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: "blur(40px)",
            animation: `orbFloat ${o.dur}s ease-in-out infinite`,
          }}
        />
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
        background: "linear-gradient(135deg, #05050a 0%, #120822 40%, #1a0a1e 70%, #05050a 100%)",
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

      {/* Static dot grid — modern texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <GlowOrbs />

      {/* Cinematic vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.65) 100%)",
      }} />

      <FloatingPosters />

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
              background: `linear-gradient(90deg, ${NEON1}, ${NEON2}, ${NEON3}, ${NEON2}, ${NEON1})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
              filter: `drop-shadow(0 0 18px rgba(168,85,247,.5))`,
            }}
          >
            ZOVEX
          </h1>
          {/* Modern neon accent bar */}
          <div style={{
            width: 100, height: 3, margin: "6px auto 0",
            borderRadius: 3,
            background: `linear-gradient(90deg, transparent, ${NEON1}, ${NEON2}, ${NEON3}, transparent)`,
            boxShadow: `0 0 12px ${NEON2}`,
          }} />
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
            border: `1px solid rgba(168,85,247,.25)`,
            borderRadius: 22,
            padding: "26px 22px",
            marginBottom: 18,
            animation: "slideInUp .7s cubic-bezier(.16,1,.3,1) .2s both",
            backdropFilter: "blur(14px)",
            boxShadow: "0 8px 40px rgba(168,85,247,.15)",
          }}
        >
          <div style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${NEON1}, ${NEON2})`,
            color: "#fff",
            padding: "5px 16px",
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 14,
            letterSpacing: 1,
            boxShadow: `0 4px 14px rgba(168,85,247,.4)`,
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
              background: `linear-gradient(135deg, ${NEON1}, ${NEON2})`,
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
              background: `linear-gradient(135deg, ${NEON3}, #0891b2)`,
              color: "#fff",
              textDecoration: "none",
              padding: "14px 24px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 800,
              marginTop: 10,
              transition: "transform .2s",
              boxShadow: "0 4px 14px rgba(34,211,238,.3)",
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
              color: NEON2,
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
              background: `linear-gradient(90deg, ${NEON1}, ${NEON2}, ${NEON3})`,
              width: `${progress}%`,
              transition: "width .2s linear",
              boxShadow: `0 0 10px ${NEON2}`,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}