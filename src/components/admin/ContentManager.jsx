import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Movie } from "@/entities/Movie";

function detectType(url) {
  if (!url) return "direct";
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("drive.google.com")) return "drive";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.includes("dailymotion.com") || u.includes("dai.ly")) return "dailymotion";
  if (u.includes("streamable.com")) return "streamable";
  if (u.includes("rumble.com")) return "rumble";
  if (u.includes("archive.org")) return "archive";
  return "direct";
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.14)",
  borderRadius: 12, padding: "10px 12px",
  fontSize: 14, color: "#fff", outline: "none",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block", fontSize: 11, color: "rgba(255,255,255,.55)",
  marginBottom: 5, fontWeight: 700,
};

const cardStyle = {
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 18, padding: 18, marginBottom: 16,
};

const emptyForm = {
  title: "", category: "", videoUrl: "", thumbnail: "",
  year: String(new Date().getFullYear()), description: "",
  seriesName: "", season: "1", episode: "",
};

// ניהול התוכן — הוספה ומחיקה של סרטים וסדרות
export default function ContentManager() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ ok: null, msg: "" });
  const [isSeries, setIsSeries] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const load = async () => {
    setLoading(true);
    try {
      const all = await Movie.list("-created_date", 500);
      setMovies(all || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const g = {};
    movies.forEach((m) => {
      const c = m.category || "ללא קטגוריה";
      if (!g[c]) g[c] = [];
      g[c].push(m);
    });
    return g;
  }, [movies]);

  const existingCats = useMemo(
    () => [...new Set(movies.map((m) => m.category).filter(Boolean))],
    [movies]
  );

  const handleSave = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.videoUrl.trim()) {
      setStatus({ ok: false, msg: "כותרת, קטגוריה וקישור וידאו הם שדות חובה" });
      return;
    }
    setSaving(true);
    try {
      await Movie.create({
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim() || null,
        thumbnail_url: form.thumbnail.trim() || null,
        year: form.year ? Number(form.year) : null,
        video_id: form.videoUrl.trim(),
        type: detectType(form.videoUrl.trim()),
        series_name: isSeries ? (form.seriesName.trim() || form.title.trim()) : null,
        season_number: isSeries ? Number(form.season) || 1 : null,
        episode_number: isSeries ? Number(form.episode) || null : null,
      });
      setForm(emptyForm);
      setIsSeries(false);
      setStatus({ ok: true, msg: "נוסף בהצלחה ✓" });
      load();
    } catch {
      setStatus({ ok: false, msg: "שגיאה בשמירה" });
    }
    setSaving(false);
    setTimeout(() => setStatus({ ok: null, msg: "" }), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק את התוכן?")) return;
    try { await Movie.delete(id); load(); } catch {}
  };

  return (
    <>
      {/* הוספת תוכן */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "#fff", fontSize: 14, fontWeight: 800 }}>
          <Plus size={16} color="#ec4899" /> הוספת תוכן
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[["movie", "סרט"], ["series", "סדרה"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setIsSeries(v === "series")}
              style={{
                flex: 1, borderRadius: 12, padding: "10px 0",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                border: "1px solid",
                borderColor: (v === "series") === isSeries ? "#a855f7" : "rgba(255,255,255,.15)",
                background: (v === "series") === isSeries ? "rgba(168,85,247,.25)" : "rgba(255,255,255,.05)",
                color: "#fff",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>כותרת</label>
          <input value={form.title} onChange={set("title")} placeholder="שם הסרט / הפרק" style={inputStyle} />
        </div>

        {isSeries && (
          <div style={{
            background: "rgba(255,255,255,.04)", borderRadius: 14,
            padding: 12, marginBottom: 12,
            border: "1px solid rgba(255,255,255,.08)",
          }}>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>שם הסדרה</label>
              <input value={form.seriesName} onChange={set("seriesName")} placeholder="למשל: הסדרה שלי" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>עונה</label>
                <input type="number" min="1" value={form.season} onChange={set("season")} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>פרק</label>
                <input type="number" min="1" value={form.episode} onChange={set("episode")} placeholder="1" style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>קטגוריה</label>
            <input list="admin-cats" value={form.category} onChange={set("category")} placeholder="למשל: סדרות" style={inputStyle} />
            <datalist id="admin-cats">
              {existingCats.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label style={labelStyle}>שנה</label>
            <input type="number" value={form.year} onChange={set("year")} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>קישור וידאו</label>
          <input value={form.videoUrl} onChange={set("videoUrl")} placeholder="YouTube / Drive / mp4 ..." dir="ltr" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>קישור לתמונה (פוסטר)</label>
          <input value={form.thumbnail} onChange={set("thumbnail")} placeholder="https://..." dir="ltr" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>תיאור</label>
          <textarea value={form.description} onChange={set("description")} rows={3} style={{ ...inputStyle, resize: "none" }} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,#a855f7,#ec4899)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: 13, fontSize: 14, fontWeight: 800,
            cursor: saving ? "default" : "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {saving ? <><Loader2 size={15} style={{ animation: "spin .7s linear infinite" }} /> שומר...</> : "שמור"}
        </button>

        {status.msg && (
          <div style={{
            marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12,
            background: status.ok ? "rgba(52,199,89,.15)" : "rgba(255,59,48,.15)",
            color: status.ok ? "#34c759" : "#ff6b6b",
          }}>
            {status.msg}
          </div>
        )}
      </div>

      {/* רשימת תכנים */}
      <div style={cardStyle}>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
          תכנים ({movies.length})
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,.4)", fontSize: 13 }}>
            <Loader2 size={20} style={{ animation: "spin .7s linear infinite" }} />
          </div>
        ) : movies.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,.4)", fontSize: 13 }}>
            אין תכנים עדיין
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 12, fontWeight: 800, color: "#ec4899",
                marginBottom: 8, padding: "5px 10px",
                background: "rgba(236,72,153,.1)", borderRadius: 8,
                display: "inline-block",
              }}>
                {cat} ({items.length})
              </div>
              {items.map((m) => (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.06)",
                }}>
                  {m.thumbnail_url ? (
                    <img src={m.thumbnail_url} alt="" style={{ width: 34, height: 48, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: 34, height: 48, borderRadius: 7, background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>
                      {m.series_name ? `ע${m.season_number || 1}${m.episode_number ? ` פ${m.episode_number}` : ""} · ` : ""}{m.type}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    style={{
                      background: "rgba(255,59,48,.15)",
                      border: "1px solid rgba(255,59,48,.35)",
                      color: "#ff6b6b", borderRadius: 10,
                      padding: "6px 10px", cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}