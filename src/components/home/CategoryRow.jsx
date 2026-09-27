import React from "react";

// שורת גלילה אופקית — מציגה כרטיסים אמיתיים; אם אין תוכן השורה לא מופיעה
export default function CategoryRow({ title, items, onPlay }) {
  if (!items || items.length === 0) return null;

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
        {items.map((m) => (
          <div
            key={m.id}
            onClick={() => onPlay(m)}
            style={{ flexShrink: 0, width: 110, cursor: "pointer", scrollSnapAlign: "start" }}
          >
            <div style={{
              aspectRatio: "2/3", borderRadius: 12, overflow: "hidden",
              position: "relative", border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(255,255,255,.06)",
            }}>
              {m.thumbnail_url ? (
                <img
                  src={m.thumbnail_url}
                  alt={m.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26,
                }}>
                  🎬
                </div>
              )}
              {m.series_name && (
                <div style={{
                  position: "absolute", top: 6, right: 6,
                  background: "rgba(0,0,0,.6)", borderRadius: 6,
                  padding: "2px 7px", fontSize: 9, color: "#fff", fontWeight: 700,
                }}>
                  סדרה
                </div>
              )}
            </div>
            <div style={{
              marginTop: 6, fontSize: 12, fontWeight: 700, color: "#fff",
              textAlign: "center", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {m.series_name
                ? `${m.series_name} · ע${m.season_number || 1}${m.episode_number ? ` פ${m.episode_number}` : ""}`
                : m.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}