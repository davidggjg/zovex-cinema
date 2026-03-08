import React, { useState, useEffect } from "react";
import { Movie } from "@/entities/Movie";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Film, Plus, List, Settings, ArrowRight, Sparkles,
  Save, Upload, ImageIcon, Loader2, Pencil, X,
  AlertCircle, ChevronDown, ChevronUp, Tv, Search, Tag
} from "lucide-react";

const CATEGORIES = ["סרטים", "סדרות", "מצוירים", "אנימה", "תוכניות", "ספורט", "חדש 2026"];
const VIDEO_TYPES = ["youtube", "drive", "cloudinary", "vimeo", "dailymotion", "streamable", "archive", "rumble"];
const TABS = [
  { id: "browse", label: "תכנים", icon: Film },
  { id: "add",    label: "הוסף",  icon: Plus },
  { id: "manage", label: "ניהול", icon: List },
  { id: "settings", label: "הגדרות", icon: Settings },
];

const EMPTY_FORM = {
  title: "", description: "", video_id: "", type: "youtube",
  category: CATEGORIES[0], thumbnail_url: "",
  series_name: "", season_number: "", episode_number: "",
  cloudinary_cloud_name: "", tags: [], year: new Date().getFullYear(),
};

function Toast({ msg, onHide }) {
  useEffect(() => { if (msg) { const t = setTimeout(onHide, 2500); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(29,29,31,.92)", color: "#fff", padding: "10px 20px", borderRadius: 20, fontSize: 12, zIndex: 999, whiteSpace: "nowrap", backdropFilter: "blur(10px)" }}>
      {msg}
    </div>
  );
}

function StatusBar({ status }) {
  if (!status) return null;
  const styles = {
    ok:  { background: "#f0fff4", borderColor: "#34c759", color: "#1a7a3a" },
    err: { background: "#fff5f5", borderColor: "#ff3b30", color: "#ff3b30" },
    "":  { background: "#F0F0F5", borderColor: "#0071e3", color: "#6e6e73" },
  };
  const s = styles[status.type] || styles[""];
  return (
    <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, borderRight: `3px solid ${s.borderColor}`, background: s.background, color: s.color }}>
      {status.text}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700, letterSpacing: 0.3 }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { width: "100%", background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
const card = { background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,.08)" };
const dot = <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0071e3", display: "inline-block", marginLeft: 8, flexShrink: 0 }} />;

// ─── TMDB Search ──────────────────────────────────────────────
function TMDBSearch({ tmdbKey, onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q || !tmdbKey) return;
    setLoading(true);
    try {
      const r = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(q)}&language=he`);
      const d = await r.json();
      setResults((d.results || []).filter(x => x.media_type !== "person").slice(0, 5));
    } catch {}
    setLoading(false);
  };

  return (
    <div style={card}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}חיפוש TMDB אוטומטי</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="שם הסרט / סדרה..." style={{ ...inp, flex: 1 }} />
        <button onClick={search} disabled={loading} style={{ background: "transparent", color: "#0071e3", border: "1.5px solid #0071e3", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> : <Search size={14} />} חפש
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
        {results.map((x, i) => (
          <div key={i} onClick={() => onSelect(x)}
            style={{ display: "flex", gap: 10, background: "#F0F0F5", borderRadius: 12, padding: 10, cursor: "pointer", border: "1.5px solid transparent", alignItems: "flex-start" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#0071e3"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
            {x.poster_path
              ? <img src={`https://image.tmdb.org/t/p/w92${x.poster_path}`} style={{ width: 42, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" />
              : <div style={{ width: 42, height: 60, borderRadius: 8, background: "#d2d2d7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎬</div>
            }
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{x.title || x.name}</div>
              <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 2 }}>{(x.release_date || x.first_air_date || "").slice(0, 4)} · {x.media_type === "tv" ? "סדרה" : "סרט"}</div>
              <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{x.overview || "אין תיאור"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Content Form ─────────────────────────────────────────────
function ContentForm({ editItem, tmdbData, onSaved, onToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const isSeries = form.series_name || form.season_number || form.episode_number;

  useEffect(() => {
    if (tmdbData) {
      setForm(p => ({
        ...p,
        title: tmdbData.title || tmdbData.name || p.title,
        description: tmdbData.overview || p.description,
        thumbnail_url: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : p.thumbnail_url,
        year: parseInt((tmdbData.release_date || tmdbData.first_air_date || "").slice(0, 4)) || p.year,
        category: tmdbData.media_type === "tv" ? "סדרות" : "סרטים",
      }));
      if (tmdbData.poster_path) setPreview(`https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`);
    }
  }, [tmdbData]);

  useEffect(() => {
    if (editItem) {
      setForm({ ...EMPTY_FORM, ...editItem, tags: editItem.tags || [], season_number: editItem.season_number || "", episode_number: editItem.episode_number || "" });
      setPreview(editItem.thumbnail_url || "");
    } else {
      setForm(EMPTY_FORM);
      setPreview("");
    }
  }, [editItem]);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await Movie.uploadFile(file);
      upd("thumbnail_url", file_url); setPreview(file_url); onToast("✅ תמונה הועלתה");
    } catch { onToast("❌ שגיאה בהעלאה"); }
    setUploading(false);
  };

  const generateAI = async () => {
    if (!form.title.trim()) { onToast("⚠️ הכנס שם קודם"); return; }
    setAiLoading(true); setStatus({ text: "✨ AI כותב תיאור...", type: "" });
    try {
      const { InvokeLLM } = await import("@/integrations/Core");
      const result = await InvokeLLM({ prompt: `כתוב תיאור קצר ומרתק בעברית (3 משפטים, סגנון נטפליקס) לסרט: "${form.title}". רק התיאור עצמו.` });
      if (result) { upd("description", result); setStatus({ text: "✅ תיאור נוצר!", type: "ok" }); }
      else setStatus({ text: "⚠️ לא התקבל תיאור", type: "err" });
    } catch { setStatus({ text: "❌ שגיאה", type: "err" }); }
    setAiLoading(false);
  };

  const save = async () => {
    if (!form.title.trim() || !form.video_id.trim()) { setStatus({ text: "⚠️ שם ו-Video ID חובה", type: "err" }); return; }
    setSaving(true);
    const payload = {
      title: form.title, description: form.description, video_id: form.video_id,
      type: form.type, category: form.category, thumbnail_url: form.thumbnail_url,
      year: Number(form.year) || new Date().getFullYear(),
      tags: form.tags,
      series_name: form.series_name || null,
      season_number: form.season_number ? Number(form.season_number) : null,
      episode_number: form.episode_number ? Number(form.episode_number) : null,
      cloudinary_cloud_name: form.type === "cloudinary" ? form.cloudinary_cloud_name : null,
    };
    try {
      if (editItem?.id) await Movie.update(editItem.id, payload);
      else await Movie.create(payload);
      setStatus({ text: "✅ נשמר!", type: "ok" }); onToast("✅ נשמר!");
      setForm(EMPTY_FORM); setPreview("");
      if (onSaved) onSaved();
      setTimeout(() => setStatus(null), 3000);
    } catch { setStatus({ text: "❌ שגיאה בשמירה", type: "err" }); }
    setSaving(false);
  };

  return (
    <div style={card} dir="rtl">
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}{editItem ? "עריכת תוכן" : "הוספת תוכן חדש"}</div>

      <Field label="שם">
        <input value={form.title} onChange={e => upd("title", e.target.value)} placeholder="שם הסרט..." style={inp} />
      </Field>

      {/* סוג תוכן */}
      <Field label="סוג תוכן">
        <div style={{ display: "flex", gap: 8 }}>
          {[["movie", "🎬 סרט"], ["series", "📺 סדרה"]].map(([v, l]) => (
            <button key={v} type="button"
              onClick={() => { if (v === "series") upd("series_name", form.series_name || form.title); else { upd("series_name", ""); upd("season_number", ""); upd("episode_number", ""); } }}
              style={{ flex: 1, borderRadius: 12, padding: "10px 0", fontSize: 13, fontWeight: 700, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", borderColor: (v === "series" ? !!form.series_name : !form.series_name) ? "#0071e3" : "#d2d2d7", background: (v === "series" ? !!form.series_name : !form.series_name) ? "#0071e3" : "#F0F0F5", color: (v === "series" ? !!form.series_name : !form.series_name) ? "#fff" : "#6e6e73" }}>
              {l}
            </button>
          ))}
        </div>
      </Field>

      {/* שדות סדרה */}
      {form.series_name !== "" && form.series_name !== undefined && (
        <div style={{ background: "#F0F0F5", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Field label="שם הסדרה">
            <input value={form.series_name} onChange={e => upd("series_name", e.target.value)} placeholder="שם הסדרה..." style={inp} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="עונה">
              <input type="number" min="1" value={form.season_number} onChange={e => upd("season_number", e.target.value)} placeholder="1" style={inp} />
            </Field>
            <Field label="פרק">
              <input type="number" min="1" value={form.episode_number} onChange={e => upd("episode_number", e.target.value)} placeholder="1" style={inp} />
            </Field>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Field label="שנה">
          <input type="number" value={form.year} onChange={e => upd("year", e.target.value)} placeholder="2026" style={inp} />
        </Field>
        <Field label="קטגוריה">
          <select value={form.category} onChange={e => upd("category", e.target.value)} style={inp}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="תיאור">
        <textarea value={form.description} onChange={e => upd("description", e.target.value)} placeholder="תיאור..." rows={3}
          style={{ ...inp, resize: "none", minHeight: 80 }} />
      </Field>

      {/* פוסטר */}
      <Field label="תמונת פוסטר">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 64, minHeight: 88, borderRadius: 12, background: "#F0F0F5", border: "1.5px solid #d2d2d7", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
            onClick={() => document.getElementById("poster-upload").click()}>
            {preview ? <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={() => setPreview("")} /> : <ImageIcon size={24} color="#6e6e73" />}
          </div>
          <div style={{ flex: 1 }}>
            <button type="button" onClick={() => document.getElementById("poster-upload").click()} disabled={uploading}
              style={{ width: "100%", background: "transparent", color: "#0071e3", border: "1.5px solid #0071e3", borderRadius: 12, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              {uploading ? <Loader2 size={14} /> : <Upload size={14} />} {uploading ? "מעלה..." : "העלה מהמכשיר"}
            </button>
            <input value={form.thumbnail_url} onChange={e => { upd("thumbnail_url", e.target.value); setPreview(e.target.value); }} placeholder="או הכנס קישור לתמונה..." style={{ ...inp, fontSize: 12 }} />
          </div>
        </div>
        <input id="poster-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
      </Field>

      {/* וידאו */}
      <Field label="סוג מקור וידאו">
        <select value={form.type} onChange={e => upd("type", e.target.value)} style={inp}>
          {VIDEO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <Field label="Video ID">
        <input value={form.video_id} onChange={e => upd("video_id", e.target.value)} placeholder="מזהה הוידאו..." dir="ltr" style={inp} />
        <div style={{ marginTop: 6, fontSize: 11, color: "#6e6e73" }}>
          {form.type === "youtube" && "YouTube: הID אחרי watch?v= (לדוגמה: dQw4w9WgXcQ)"}
          {form.type === "drive" && "Google Drive: הID מהקישור של הקובץ"}
          {form.type === "vimeo" && "Vimeo: המספר בקישור (לדוגמה: 123456789)"}
          {form.type === "cloudinary" && "Cloudinary: שם הקובץ ללא סיומת"}
          {form.type === "streamable" && "Streamable: הקוד הקצר בקישור"}
          {form.type === "rumble" && "Rumble: הID מהקישור"}
        </div>
      </Field>

      {form.type === "cloudinary" && (
        <Field label="Cloudinary Cloud Name">
          <input value={form.cloudinary_cloud_name} onChange={e => upd("cloudinary_cloud_name", e.target.value)} placeholder="שם ה-cloud שלך" dir="ltr" style={inp} />
        </Field>
      )}

      {/* כפתורים */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={generateAI} disabled={aiLoading}
          style={{ flex: 1, background: "#34c759", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {aiLoading ? <Loader2 size={14} /> : <Sparkles size={14} />} AI תיאור
        </button>
        <button onClick={save} disabled={saving}
          style={{ flex: 1, background: "#0071e3", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(0,113,227,.3)" }}>
          {saving ? <Loader2 size={14} /> : <Save size={14} />} {editItem ? "עדכן" : "שמור"}
        </button>
      </div>
      <StatusBar status={status} />
    </div>
  );
}

// ─── Manage List ──────────────────────────────────────────────
function CategorySection({ catName, items, onEdit, onDelete }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 12, background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F0F0F5", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{catName} <span style={{ color: "#6e6e73", fontWeight: 400, fontSize: 12 }}>({items.length})</span></span>
        {open ? <ChevronUp size={16} color="#6e6e73" /> : <ChevronDown size={16} color="#6e6e73" />}
      </button>
      {open && items.map(item => (
        <div key={item.id} style={{ display: "flex", gap: 10, padding: 12, alignItems: "center", borderTop: "1px solid #F0F0F5" }}>
          {item.thumbnail_url
            ? <img src={item.thumbnail_url} style={{ width: 36, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" onError={e => e.target.style.display = "none"} />
            : <div style={{ width: 36, height: 52, borderRadius: 8, background: "#F0F0F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.series_name ? <Tv size={16} color="#6e6e73" /> : <Film size={16} color="#6e6e73" />}
              </div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
            <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 2 }}>
              {item.series_name
                ? [item.series_name, item.season_number ? `עונה ${item.season_number}` : null, item.episode_number ? `פרק ${item.episode_number}` : null].filter(Boolean).join(" · ")
                : [item.year, item.type].filter(Boolean).join(" · ")
              }
            </div>
            {!item.description && <div style={{ fontSize: 10, color: "#ff3b30", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={10} /> חסר תיאור</div>}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => onEdit(item)} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 7px", cursor: "pointer" }}>
              <Pencil size={14} color="#6e6e73" />
            </button>
            <button onClick={() => onDelete(item)} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 7px", cursor: "pointer" }}>
              <X size={14} color="#ff3b30" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ManageList({ items, onEdit, onDelete }) {
  const grouped = {};
  items.forEach(item => {
    const cat = item.category || "ללא קטגוריה";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });
  if (!items.length) return (
    <div style={{ ...card, textAlign: "center", padding: 40 }}>
      <Film size={40} color="#d2d2d7" style={{ margin: "0 auto 10px" }} />
      <p style={{ color: "#6e6e73", fontSize: 13 }}>אין תכנים עדיין</p>
    </div>
  );
  return (
    <div dir="rtl">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        {dot}<span style={{ fontSize: 14, fontWeight: 700 }}>תכנים ({items.length})</span>
      </div>
      {Object.entries(grouped).map(([cat, catItems]) => (
        <CategorySection key={cat} catName={cat} items={catItems} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsPanel({ tmdbKey, setTmdbKey, onSaveKeys, onRunChecks, checks, checkingSystem, onEnrich, enriching, enrichStatus, onExport }) {
  return (
    <div dir="rtl">
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}מפתחות API</div>
        <Field label="TMDB API Key (v3)">
          <input type="password" value={tmdbKey} onChange={e => setTmdbKey(e.target.value)} placeholder="32 תווים" dir="ltr" style={inp} />
        </Field>
        <button onClick={onSaveKeys} style={{ width: "100%", background: "#0071e3", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(0,113,227,.3)" }}>
          💾 שמור מפתחות
        </button>
        <div style={{ marginTop: 10, fontSize: 11, color: "#6e6e73", lineHeight: 1.8 }}>
          🔑 TMDB: <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{ color: "#0071e3" }}>themoviedb.org</a> → API Key (v3)
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}🔍 בדיקת מערכת</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {checks.map(chk => (
            <div key={chk.id} style={{ borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 600, borderRight: "3px solid", borderColor: chk.state === "ok" ? "#34c759" : chk.state === "err" ? "#ff3b30" : chk.state === "checking" ? "#0071e3" : "#d2d2d7", background: chk.state === "ok" ? "#f0fff4" : chk.state === "err" ? "#fff5f5" : chk.state === "checking" ? "#f0f7ff" : "#F0F0F5", color: chk.state === "ok" ? "#1a7a3a" : chk.state === "err" ? "#ff3b30" : chk.state === "checking" ? "#0071e3" : "#6e6e73" }}>
              {chk.msg}
            </div>
          ))}
        </div>
        <button onClick={onRunChecks} disabled={checkingSystem} style={{ width: "100%", background: "transparent", color: "#0071e3", border: "1.5px solid #0071e3", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {checkingSystem ? <Loader2 size={14} /> : "🔍 הפעל בדיקת מערכת"}
        </button>
      </div>

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}עדכון אוטומטי</div>
        <button onClick={onEnrich} disabled={enriching} style={{ width: "100%", background: "transparent", color: "#0071e3", border: "1.5px solid #0071e3", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {enriching ? <Loader2 size={14} /> : "🤖 עדכן תכנים חסרים"}
        </button>
        {enrichStatus && <div style={{ marginTop: 10, background: "#f0fff4", borderRight: "3px solid #34c759", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#1a7a3a" }}>{enrichStatus}</div>}
      </div>

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}נתונים</div>
        <button onClick={onExport} style={{ width: "100%", background: "#F0F0F5", color: "#6e6e73", border: "1.5px solid #d2d2d7", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          📤 ייצא JSON
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin ───────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState("browse");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [browseCategory, setBrowseCategory] = useState("הכל");
  const [editItem, setEditItem] = useState(null);
  const [tmdbData, setTmdbData] = useState(null);
  const [toast, setToast] = useState("");
  const [tmdbKey, setTmdbKey] = useState(() => localStorage.getItem("zovex_tmdb_key") || "");
  const [checks, setChecks] = useState([
    { id: "storage", msg: "⏳ Base44 — לא נבדק", state: "" },
    { id: "tmdb",    msg: "⏳ TMDB API — לא נבדק", state: "" },
  ]);
  const [checkingSystem, setCheckingSystem] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichStatus, setEnrichStatus] = useState("");
  const navigate = useNavigate();

  const loadMovies = () => {
    setLoading(true);
    Movie.list("-created_date").then(d => { setMovies(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadMovies(); }, []);

  const showToast = (m) => setToast(m);

  const handleDelete = async (item) => {
    if (!confirm(`למחוק את "${item.title}"?`)) return;
    await Movie.delete(item.id);
    showToast("🗑 נמחק");
    loadMovies();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setTmdbData(null);
    setActiveTab("add");
    showToast("✏️ ערוך ושמור");
  };

  const handleSaved = () => { loadMovies(); setEditItem(null); setTmdbData(null); };

  const saveKeys = () => { localStorage.setItem("zovex_tmdb_key", tmdbKey); showToast("✅ מפתחות נשמרו"); };

  const runChecks = async () => {
    setCheckingSystem(true);
    const upd = (id, state, msg) => setChecks(p => p.map(c => c.id === id ? { ...c, state, msg } : c));
    const delay = ms => new Promise(r => setTimeout(r, ms));
    upd("storage", "checking", "🔄 Base44 — בודק...");
    await delay(400);
    try { await Movie.list("-created_date", 1); upd("storage", "ok", `✅ Base44 — מחובר · ${movies.length} סרטים ✓`); }
    catch { upd("storage", "err", "❌ Base44 — שגיאת חיבור"); }
    upd("tmdb", "checking", "🔄 TMDB — מתחבר...");
    await delay(400);
    if (!tmdbKey) { upd("tmdb", "err", "❌ TMDB — מפתח לא הוזן"); }
    else {
      try {
        const r = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`);
        const d = await r.json();
        d.images ? upd("tmdb", "ok", "✅ TMDB API — מחובר ✓") : upd("tmdb", "err", "❌ TMDB — מפתח לא תקין");
      } catch { upd("tmdb", "err", "❌ TMDB — שגיאת רשת"); }
    }
    setCheckingSystem(false);
    showToast("✅ בדיקה הושלמה");
  };

  const autoEnrich = async () => {
    const missing = movies.filter(m => !m.description || !m.thumbnail_url);
    if (!missing.length) { showToast("✅ כל התכנים מלאים!"); return; }
    if (!tmdbKey) { showToast("⚠️ הכנס TMDB Key בהגדרות"); return; }
    setEnriching(true);
    let done = 0;
    for (const item of missing) {
      setEnrichStatus(`מעדכן: "${item.title}" (${done + 1}/${missing.length})...`);
      const updates = {};
      if (!item.thumbnail_url) {
        try {
          const r = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(item.title)}`);
          const d = await r.json();
          const x = (d.results || [])[0];
          if (x?.poster_path) updates.thumbnail_url = `https://image.tmdb.org/t/p/w500${x.poster_path}`;
        } catch {}
      }
      if (Object.keys(updates).length) { try { await Movie.update(item.id, updates); } catch {} }
      done++;
    }
    setEnrichStatus(`✅ עודכנו ${done} תכנים!`);
    loadMovies(); setEnriching(false);
  };

  const exportData = () => {
    const b = new Blob([JSON.stringify(movies, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "zovex_movies.json"; a.click();
  };

  const filteredBrowse = browseCategory === "הכל" ? movies : movies.filter(m => m.category === browseCategory);
  const allCategories = ["הכל", ...new Set(movies.map(m => m.category).filter(Boolean))];

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" }} dir="rtl">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ background: "rgba(245,245,247,.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #d2d2d7", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, background: "linear-gradient(135deg,#0071e3,#5e5ce6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          ZOVEX <span style={{ fontSize: 12, fontWeight: 400, WebkitTextFillColor: "#6e6e73" }}>Admin</span>
        </div>
        <button onClick={() => navigate(createPageUrl("Home"))}
          style={{ background: "#F0F0F5", color: "#6e6e73", border: "1.5px solid #d2d2d7", borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowRight size={14} /> יציאה
        </button>
      </div>

      {/* Nav */}
      <div style={{ background: "rgba(245,245,247,.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #d2d2d7", display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id !== "add") { setEditItem(null); setTmdbData(null); } }}
            style={{ flex: 1, padding: "12px 4px", textAlign: "center", fontSize: 10, fontWeight: 700, color: activeTab === tab.id ? "#0071e3" : "#6e6e73", borderBottom: `2px solid ${activeTab === tab.id ? "#0071e3" : "transparent"}`, background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? "#0071e3" : "transparent"}`, cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16, paddingBottom: 80 }}>

        {/* תכנים */}
        {activeTab === "browse" && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {allCategories.map(cat => (
                <button key={cat} onClick={() => setBrowseCategory(cat)}
                  style={{ background: browseCategory === cat ? "#0071e3" : "#fff", border: "1.5px solid", borderColor: browseCategory === cat ? "#0071e3" : "#d2d2d7", color: browseCategory === cat ? "#fff" : "#6e6e73", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                  {cat}
                </button>
              ))}
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#6e6e73" }}>טוען...</div>
            ) : filteredBrowse.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#6e6e73" }}>אין תכנים</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {filteredBrowse.map(movie => (
                  <div key={movie.id} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "2/3", background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,.1)", cursor: "pointer" }}
                    onClick={() => { setEditItem(movie); setActiveTab("add"); }}>
                    {movie.thumbnail_url
                      ? <img src={movie.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#e8eaf6,#c5cae9)" }}>
                          <Film size={32} color="#3949ab" />
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#3949ab", textAlign: "center", padding: "0 8px" }}>{movie.title}</div>
                        </div>
                    }
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,.85))", padding: "20px 10px 10px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{movie.title}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{movie.year} · {movie.category}</div>
                    </div>
                    <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.6)", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 700, color: "#fff" }}>{movie.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* הוסף */}
        {activeTab === "add" && (
          <div>
            <TMDBSearch tmdbKey={tmdbKey} onSelect={x => { setTmdbData(x); setEditItem(null); }} />
            <ContentForm editItem={editItem} tmdbData={tmdbData} onSaved={handleSaved} onToast={showToast} />
          </div>
        )}

        {/* ניהול */}
        {activeTab === "manage" && (
          <ManageList items={movies} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        {/* הגדרות */}
        {activeTab === "settings" && (
          <SettingsPanel
            tmdbKey={tmdbKey} setTmdbKey={setTmdbKey}
            onSaveKeys={saveKeys}
            onRunChecks={runChecks} checks={checks} checkingSystem={checkingSystem}
            onEnrich={autoEnrich} enriching={enriching} enrichStatus={enrichStatus}
            onExport={exportData}
          />
        )}
      </div>

      <Toast msg={toast} onHide={() => setToast("")} />
    </div>
  );
}