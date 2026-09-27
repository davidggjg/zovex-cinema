import React, { useState } from "react";
import { X } from "lucide-react";
import SupportChat from "./SupportChat";

const LS_ID = "sm_support_conversation";
const LS_NAME = "sm_support_name";

function getConversationId() {
  let id = null;
  try { id = localStorage.getItem(LS_ID); } catch {}
  if (!id) {
    id = "c_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    try { localStorage.setItem(LS_ID, id); } catch {}
  }
  return id;
}

// צ'אט התמיכה עבור המשתמש — נפתח מכפתור "תמיכה"
export default function SupportModal({ onClose }) {
  const [conversationId] = useState(getConversationId);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(LS_NAME) || ""; } catch { return ""; }
  });

  const saveName = () => {
    try { localStorage.setItem(LS_NAME, name.trim()); } catch {}
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0a0514", display: "flex", flexDirection: "column",
    }}>
      <header style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>צ'אט תמיכה</div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.2)", color: "#fff",
            borderRadius: "50%", width: 38, height: 38, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>
      </header>

      {!name.trim() && (
        <div style={{ padding: "10px 14px 0", flexShrink: 0 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            placeholder="איך לקרוא לך? (לא חובה)"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.14)", borderRadius: 12,
              padding: "10px 12px", fontSize: 13, color: "#fff",
              outline: "none", fontFamily: "inherit",
            }}
          />
        </div>
      )}

      <SupportChat conversationId={conversationId} who="user" userName={name.trim() || undefined} />
    </div>
  );
}