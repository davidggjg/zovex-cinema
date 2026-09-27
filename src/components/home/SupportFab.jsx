import React, { useState } from "react";
import { Send } from "lucide-react";
import SupportModal from "@/components/support/SupportModal";

// כפתור תמיכה — פותח צ'אט עם הניהול
export default function SupportFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 20, right: 16, zIndex: 50,
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg,#22d3ee,#2563eb)",
          color: "#fff", border: "none", borderRadius: 50,
          padding: "12px 18px", fontSize: 14, fontWeight: 800,
          boxShadow: "0 6px 24px rgba(34,211,238,.4)",
          fontFamily: "inherit", cursor: "pointer",
        }}
      >
        <Send size={16} /> תמיכה
      </button>
      {open && <SupportModal onClose={() => setOpen(false)} />}
    </>
  );
}