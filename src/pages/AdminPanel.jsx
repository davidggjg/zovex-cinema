import React, { useState } from "react";
import { Lock, LogOut, Film, MessageCircle } from "lucide-react";
import ContentManager from "@/components/admin/ContentManager";
import SupportAdmin from "@/components/support/SupportAdmin";

const ADMIN_PASSWORD = "kX3QKhv58osQhtz5bHRF";
const AUTH_KEY = "sm_admin_auth";

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState("content");

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {}
      setAuthed(true);
      setPw("");
      setPwError("");
    } else {
      setPwError("סיסמה שגויה");
    }
  };

  const logout = () => {
    try { sessionStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
    setTab("content");
  };

  // ----- שער סיסמה -----
  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif",
        background: "linear-gradient(160deg, #07030f 0%, #150a26 45%, #1a0a1e 75%, #07030f 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <div style={{
          width: "100%", maxWidth: 340,
          background: "rgba(255,255,255,.05)",
          border: "1px solid rgba(168,85,247,.3)",
          borderRadius: 22, padding: 28, textAlign: "center",
          backdropFilter: "blur(14px)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
            background: "linear-gradient(135deg,#a855f7,#ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(168,85,247,.5)",
          }}>
            <Lock size={24} color="#fff" />
          </div>
          <h1 style={{ margin: "0 0 6px", color: "#fff", fontSize: 22, fontWeight: 900 }}>פאנל ניהול</h1>
          <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,.5)", fontSize: 13 }}>הזן סיסמה לכניסה</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") tryLogin(); }}
            placeholder="סיסמה"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.14)",
              borderRadius: 12, padding: "10px 12px",
              fontSize: 14, color: "#fff", outline: "none", fontFamily: "inherit",
            }}
          />
          {pwError && <p style={{ color: "#ff6b6b", fontSize: 12, margin: "10px 0 0" }}>{pwError}</p>}
          <button
            onClick={tryLogin}
            style={{
              width: "100%", marginTop: 14,
              background: "linear-gradient(135deg,#a855f7,#ec4899)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: 13, fontSize: 15, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            כניסה
          </button>
        </div>
      </div>
    );
  }

  // ----- הפאנל -----
  return (
    <div style={{
      minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif",
      background: "linear-gradient(160deg, #07030f 0%, #150a26 45%, #1a0a1e 75%, #07030f 100%)",
    }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        padding: "14px 16px",
        background: "rgba(10,5,20,.78)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(168,85,247,.18)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>פאנל ניהול</div>
        <button
          onClick={logout}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.14)",
            color: "rgba(255,255,255,.7)", borderRadius: 12,
            padding: "7px 14px", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <LogOut size={14} /> יציאה
        </button>
      </header>

      <div style={{ display: "flex", gap: 8, padding: "14px 14px 0", maxWidth: 560, margin: "0 auto" }}>
        {[
          ["content", "ניהול תוכן", Film],
          ["support", "צ'אט תמיכה", MessageCircle],
        ].map(([v, l, Icon]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            style={{
              flex: 1, borderRadius: 12, padding: "11px 0",
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              border: "1px solid",
              borderColor: tab === v ? "#a855f7" : "rgba(255,255,255,.15)",
              background: tab === v ? "rgba(168,85,247,.25)" : "rgba(255,255,255,.05)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
          >
            <Icon size={15} /> {l}
          </button>
        ))}
      </div>

      <div style={{ padding: 14, maxWidth: 560, margin: "0 auto" }}>
        {tab === "content" ? <ContentManager /> : <SupportAdmin />}
      </div>
    </div>
  );
}