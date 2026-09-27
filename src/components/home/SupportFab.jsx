import React from "react";
import { Send } from "lucide-react";

// כפתור תמיכה צף
export default function SupportFab() {
  return (
    <a
      href="https://t.me/ZOVE8"
      target="_blank"
      rel="noreferrer"
      style={{
        position: "fixed", bottom: 20, right: 16, zIndex: 50,
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg,#22d3ee,#2563eb)",
        color: "#fff", textDecoration: "none", borderRadius: 50,
        padding: "12px 18px", fontSize: 14, fontWeight: 800,
        boxShadow: "0 6px 24px rgba(34,211,238,.4)",
        fontFamily: "inherit",
      }}
    >
      <Send size={16} /> תמיכה
    </a>
  );
}