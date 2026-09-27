import React from "react";

// שורת גלילה אופקית — שלד כרטיסים ריקים
export default function CategoryRow({ title }) {
  const cards = Array.from({ length: 8 });

  return (
    <section id={`row-${title}`} style={{ marginBottom: 22, scrollMarginTop: 130 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px 10px" }}>
        <div style={{
          width: 4, height: 18, borderRadius: 3,
          background: "linear-gradient(180deg,#a855f7,#ec4899)",
          boxShadow: "0 0 8px rgba(168,85,247,.6)",
        }} />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>{title}</h2>
      </div>

      <div className="hide-scroll" style={{
        display: "flex", gap: 10,
        overflowX: "auto", padding: "0 14px 4px",
        scrollSnapType: "x mandatory",
      }}>
        {cards.map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: 110, scrollSnapAlign: "start" }}>
            <div style={{
              aspectRatio: "2/3", borderRadius: 12, overflow: "hidden",
              position: "relative", border: "1px solid rgba(255,255,255,.08)",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(100deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.04) 75%)",
                backgroundSize: "200% 100%",
                animation: `shimmerSlide ${1.4 + (i % 3) * 0.3}s linear infinite`,
              }} />
              {i % 3 === 0 && (
                <div style={{
                  position: "absolute", top: 6, right: 6,
                  background: "rgba(0,0,0,.55)", borderRadius: 6,
                  padding: "2px 7px", fontSize: 9, color: "#fff", fontWeight: 700,
                }}>
                  סדרה
                </div>
              )}
            </div>
            <div style={{
              height: 8, width: "70%", borderRadius: 5,
              background: "rgba(255,255,255,.09)", margin: "8px auto 0",
            }} />
          </div>
        ))}
      </div>
    </section>
  );
}