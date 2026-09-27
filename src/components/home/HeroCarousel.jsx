import React, { useState } from "react";
import { Play, Info } from "lucide-react";

const DOTS = 5;

// הירו ריק — שלד מוכן לתוכן עתידי
export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  return (
    <section style={{
      margin: "14px 14px 22px", borderRadius: 22, overflow: "hidden",
      position: "relative", aspectRatio: "16/9",
      border: "1px solid rgba(168,85,247,.25)",
      boxShadow: "0 10px 50px rgba(0,0,0,.5)",
    }}>
      {/* שלד רקע מנצנץ */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(100deg, rgba(255,255,255,.04) 25%, rgba(168,85,247,.12) 50%, rgba(255,255,255,.04) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmerSlide 2.4s linear infinite",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(7,3,15,.92), transparent 60%)",
      }} />

      {/* קווי כותרת ריקים */}
      <div style={{ position: "absolute", bottom: 96, right: 18, left: 18, textAlign: "right" }}>
        <div style={{ height: 20, width: "55%", borderRadius: 8, background: "rgba(255,255,255,.14)", marginBottom: 8, marginLeft: "auto" }} />
        <div style={{ height: 11, width: "35%", borderRadius: 6, background: "rgba(255,255,255,.08)", marginLeft: "auto" }} />
      </div>

      {/* כפתורי פעולה */}
      <div style={{ position: "absolute", bottom: 40, right: 18, left: 18, display: "flex", gap: 10 }}>
        <button style={{
          background: "#fff", color: "#111", border: "none", borderRadius: 12,
          padding: "9px 22px", fontSize: 14, fontWeight: 800,
          cursor: "default", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Play size={15} fill="#111" /> צפה
        </button>
        <button style={{
          background: "rgba(255,255,255,.15)", color: "#fff",
          border: "1px solid rgba(255,255,255,.2)", borderRadius: 12,
          padding: "9px 22px", fontSize: 14, fontWeight: 700,
          cursor: "default", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(8px)",
        }}>
          <Info size={15} /> מידע נוסף
        </button>
      </div>

      {/* נקודות עמודים */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, alignItems: "center",
      }}>
        {Array.from({ length: DOTS }).map((_, i) => (
          <span
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 18 : 7, height: 7, borderRadius: 50,
              cursor: "pointer", transition: "all .3s",
              background: i === active ? "#ec4899" : "rgba(255,255,255,.3)",
              boxShadow: i === active ? "0 0 8px rgba(236,72,153,.8)" : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
}