import React, { useState } from "react";
import { Play, Info } from "lucide-react";

const wrap = {
  margin: "14px 14px 22px", borderRadius: 22, overflow: "hidden",
  position: "relative", aspectRatio: "16/9",
  border: "1px solid rgba(168,85,247,.25)",
  boxShadow: "0 10px 50px rgba(0,0,0,.5)",
};

const btnWhite = {
  background: "#fff", color: "#111", border: "none", borderRadius: 12,
  padding: "9px 22px", fontSize: 14, fontWeight: 800,
  cursor: "pointer", fontFamily: "inherit",
  display: "flex", alignItems: "center", gap: 8,
};

const btnGlass = {
  background: "rgba(255,255,255,.15)", color: "#fff",
  border: "1px solid rgba(255,255,255,.2)", borderRadius: 12,
  padding: "9px 22px", fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit",
  display: "flex", alignItems: "center", gap: 8,
  backdropFilter: "blur(8px)",
};

// הירו — מציג תוכן אמיתי אם קיים, אחרת הירו נקי וסטטי (בלי מראה של טעינה)
export default function HeroCarousel({ featured, onWatch }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!featured) {
    return (
      <section style={wrap}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(168,85,247,.16), rgba(236,72,153,.1) 50%, rgba(34,211,238,.12))",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(7,3,15,.85), transparent 65%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 8, textAlign: "center", padding: 20,
        }}>
          <h1 style={{
            margin: 0, fontSize: "clamp(22px, 7vw, 34px)",
            fontWeight: 900, letterSpacing: 1,
            background: "linear-gradient(90deg,#a855f7,#ec4899,#22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            SERIES AND MOVIES
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,.65)", fontSize: 14, fontWeight: 600 }}>
            סדרות וסרטים לצפייה ישירה
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={wrap}>
      {featured.thumbnail_url ? (
        <img
          src={featured.thumbnail_url}
          alt={featured.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(168,85,247,.2), rgba(236,72,153,.12))",
        }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(7,3,15,.92), transparent 65%)",
      }} />
      <div style={{ position: "absolute", bottom: 16, right: 16, left: 16 }}>
        <h2 style={{
          margin: "0 0 10px", color: "#fff", fontSize: 20, fontWeight: 900,
          textShadow: "0 2px 8px rgba(0,0,0,.7)",
        }}>
          {featured.title}
        </h2>
        {showInfo && featured.description && (
          <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,.75)", fontSize: 12, lineHeight: 1.6 }}>
            {featured.description}
          </p>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onWatch} style={btnWhite}>
            <Play size={15} fill="#111" /> צפה
          </button>
          <button onClick={() => setShowInfo(!showInfo)} style={btnGlass}>
            <Info size={15} /> מידע נוסף
          </button>
        </div>
      </div>
    </section>
  );
}