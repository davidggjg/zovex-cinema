import React, { useState, useEffect } from "react";
import { ApiKey } from "@/entities/ApiKey";
import { Loader2, Copy, Check, Trash2, Plus, Eye, EyeOff } from "lucide-react";

const sp = `@keyframes spin { to { transform: rotate(360deg); } }`;

export default function ApiKeysPanel({ cardStyle, inp, dot }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });

  const load = async () => {
    setLoading(true);
    try {
      const all = await ApiKey.list("-created_date", 100);
      setKeys(all || []);
    } catch {
      setStatus({ type: "error", message: "שגיאה בטעינת מפתחות" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const genKey = () => {
    const part = () => (crypto.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, "");
    return "zx_" + part() + part();
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) { setStatus({ type: "error", message: "הכנס שם למפתח" }); return; }
    setCreating(true);
    try {
      await ApiKey.create({ key: genKey(), name: newKeyName.trim(), active: true });
      setNewKeyName("");
      setStatus({ type: "success", message: "המפתח נוצר!" });
      load();
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch {
      setStatus({ type: "error", message: "שגיאה ביצירת מפתח" });
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק מפתח זה? אתרים שמשתמשים בו יאבדו גישה.")) return;
    try { await ApiKey.delete(id); load(); } catch {}
  };

  const toggleActive = async (k) => {
    try { await ApiKey.update(k.id, { active: !k.active }); load(); } catch {}
  };

  const copyKey = (k) => {
    navigator.clipboard?.writeText(k.key);
    setCopiedId(k.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const apiUrl = `${window.location.origin}/functions/content_api`;

  return (
    <div style={{ ...cardStyle, border: "2px solid #0071e3" }}>
      <style>{sp}</style>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", color: "#0071e3" }}>
        {dot} מפתחות API חיצוניים
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 14, lineHeight: 1.7 }}>
        צור מפתחות כדי לאפשר לאתרים חיצוניים למשוך את כל התוכן שלך דרך API ציבורי.<br />
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#0071e3", direction: "ltr", display: "inline-block" }}>GET {apiUrl}?apiKey=YOUR_KEY</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="שם למפתח (למשל: האתר שלי)" style={{ ...inp, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
        <button onClick={handleCreate} disabled={creating} style={{ background: "#0071e3", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          {creating ? <Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> : <Plus size={16} />} צור
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 20, color: "#aaa", fontSize: 13 }}>טוען...</div>
      ) : keys.length === 0 ? (
        <div style={{ textAlign: "center", padding: 20, color: "#aaa", fontSize: 13 }}>אין מפתחות עדיין — צור אחד כדי להתחיל</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {keys.map((k) => (
            <div key={k.id} style={{ background: "#F5F5F7", borderRadius: 12, padding: 12, border: `1.5px solid ${k.active ? "#d2d2d7" : "#ffd0d0"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{k.name}</span>
                  <span style={{ fontSize: 10, color: k.active ? "#34c759" : "#ff3b30", fontWeight: 700, background: k.active ? "#e8f9ee" : "#fff0f0", padding: "2px 8px", borderRadius: 8 }}>{k.active ? "פעיל" : "מושבת"}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => toggleActive(k)} style={{ background: "none", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", color: "#6e6e73" }}>{k.active ? "השבת" : "הפעל"}</button>
                  <button onClick={() => handleDelete(k.id)} style={{ background: "none", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#ff3b30", display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #e8e8e8" }}>
                <code style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: "#333", direction: "ltr", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {visibleKeys[k.id] ? k.key : "••••••••••••••••••••••••••••••"}
                </code>
                <button onClick={() => setVisibleKeys((s) => ({ ...s, [k.id]: !s[k.id] }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                  {visibleKeys[k.id] ? <EyeOff size={14} color="#6e6e73" /> : <Eye size={14} color="#6e6e73" />}
                </button>
                <button onClick={() => copyKey(k)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                  {copiedId === k.id ? <Check size={14} color="#34c759" /> : <Copy size={14} color="#6e6e73" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {status.message && (
        <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: status.type === "success" ? "#f0fff4" : "#fff5f5", color: status.type === "success" ? "#1a7a3a" : "#ff3b30" }}>
          {status.message}
        </div>
      )}
    </div>
  );
}