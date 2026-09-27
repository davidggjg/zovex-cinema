import React, { useState } from "react";
import { Search, Menu, X, User } from "lucide-react";

export default function SiteHeader({ searchTerm, onSearchChange, categories, onCategoryClick }) {
  const [openCats, setOpenCats] = useState(false);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      padding: "14px 14px 10px",
      background: "rgba(10,5,20,.78)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(168,85,247,.18)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h1 style={{
          margin: 0, fontSize: 14, fontWeight: 900, letterSpacing: 0.5,
          flexShrink: 0, whiteSpace: "nowrap",
          background: "linear-gradient(90deg,#a855f7,#ec4899,#22d3ee)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          SERIES AND MOVIES
        </h1>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,.07)",
          border: "1px solid rgba(255,255,255,.12)",
          padding: "8px 14px", borderRadius: 50,
        }}>
          <Search size={15} color="rgba(255,255,255,.5)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חיפוש..."
            style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: 14, color: "#fff", fontFamily: "inherit" }}
          />
          {searchTerm && <X size={15} color="#888" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => onSearchChange("")} />}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#a855f7,#ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 14px rgba(168,85,247,.5)",
        }}>
          <User size={17} color="#fff" />
        </div>
      </div>

      <button
        onClick={() => setOpenCats(!openCats)}
        style={{
          marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,.08)",
          border: "1px solid rgba(255,255,255,.14)",
          color: "#fff", padding: "7px 14px", borderRadius: 12,
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {openCats ? <X size={14} /> : <Menu size={14} />}
        קטגוריות
      </button>

      {openCats && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((c) => (
            <span
              key={c}
              onClick={() => { onCategoryClick(c); setOpenCats(false); }}
              style={{
                cursor: "pointer",
                background: "rgba(168,85,247,.18)",
                border: "1px solid rgba(168,85,247,.4)",
                color: "#fff", borderRadius: 50,
                padding: "6px 14px", fontSize: 12, fontWeight: 700,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}