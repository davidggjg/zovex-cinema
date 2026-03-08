import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Send, Play, ArrowRight, X, Plus, Trash2, Film, Loader2, ChevronDown, ChevronUp, Pencil, Tag } from "lucide-react";
import { Movie } from "@/entities/Movie";

const spinnerStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;
const SECRET_TRIGGER = "ZovexAdmin2026";
const PIN_CODE = "123456";
const LETTER_CODE = "ZOVIX";

const DEFAULT_CATEGORIES = ["סרטים", "סדרות", "מצוירים", "אנימה", "תוכניות", "ספורט", "כאן 11"];

// ─── חילוץ Video ID מ-URL ─────────────────────────────────────
function extractVideoInfo(url) {
  if (!url || !url.includes("http")) return { type: "direct", video_id: url };

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&/?]+)/);
    return { type: "youtube", video_id: match?.[1] || url };
  }
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([^/]+)/);
    return { type: "drive", video_id: match?.[1] || url };
  }
  if (url.includes("vimeo.com")) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return { type: "vimeo", video_id: match?.[1] || url };
  }
  if (url.includes("dailymotion.com") || url.includes("dai.ly")) {
    const match = url.match(/(?:video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
    return { type: "dailymotion", video_id: match?.[1] || url };
  }
  if (url.includes("streamable.com")) {
    const match = url.match(/streamable\.com\/([a-zA-Z0-9]+)/);
    return { type: "streamable", video_id: match?.[1] || url };
  }
  if (url.includes("rumble.com")) {
    const match = url.match(/(?:embed\/|video\/)([a-zA-Z0-9]+)/);
    return { type: "rumble", video_id: match?.[1] || url };
  }
  if (url.includes("archive.org")) {
    const match = url.match(/archive\.org\/(?:embed|details)\/([^/?]+)/);
    return { type: "archive", video_id: match?.[1] || url };
  }
  if (url.includes("kan.org.il")) {
    const parts = url.split("/").filter(Boolean);
    return { type: "kan", video_id: parts[parts.length - 1] };
  }
  return { type: "direct", video_id: url };
}

// ─── נגן וידאו ───────────────────────────────────────────────
function renderPlayer(movie) {
  const vid = movie.video_id || movie.video_url || "";
  const type = movie.type || "";

  if (!vid) return <p style={{ color: "#aaa", textAlign: "center", padding: 20 }}>אין וידאו זמין</p>;

  const iframeStyle = { width: "100%", height: "56vw", maxHeight: "80vh", border: "none" };

  if (type === "youtube" || vid.includes("youtube") || vid.includes("youtu.be")) {
    const id = vid.replace(/.*[?&]v=/, "").replace(/.*youtu\.be\//, "").split("&")[0];
    return <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "drive" || vid.includes("drive.google")) {
    const id = vid.replace(/.*\/d\//, "").replace(/\/.*/, "").split("?")[0];
    return <iframe src={`https://drive.google.com/file/d/${id}/preview`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "vimeo" || vid.includes("vimeo")) {
    const id = vid.replace(/.*vimeo\.com\//, "").split("?")[0];
    return <iframe src={`https://player.vimeo.com/video/${id}?autoplay=1`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "dailymotion" || vid.includes("dailymotion")) {
    const id = vid.replace(/.*video\//, "").split(/[?_]/)[0];
    return <iframe src={`https://www.dailymotion.com/embed/video/${id}?autoplay=1`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "streamable" || vid.includes("streamable")) {
    const id = vid.replace(/.*streamable\.com\//, "").split("?")[0];
    return <iframe src={`https://streamable.com/e/${id}?autoplay=1`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "rumble" || vid.includes("rumble")) {
    const cleanId = vid.replace(/.*rumble\.com\/embed\//, "").replace(/.*rumble\.com\/video\//, "").split(/[/?]/)[0];
    return <iframe src={`https://rumble.com/embed/${cleanId}/`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "archive" || vid.includes("archive.org")) {
    const id = vid.replace(/.*archive\.org\/(?:embed|details)\//, "").split("?")[0];
    return <iframe src={`https://archive.org/embed/${id}`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "kan" || vid.includes("kan.org")) {
    return <iframe src={`https://www.kan.org.il/General/Embed.aspx?id=${vid}`} style={iframeStyle} allowFullScreen allow="autoplay" />;
  }
  if (type === "cloudinary") {
    const cloud = movie.cloudinary_cloud_name || "";
    return <video controls autoPlay style={{ width: "100%", maxHeight: "80vh" }} src={`https://res.cloudinary.com/${cloud}/video/upload/${vid}`} />;
  }
  return <video controls autoPlay style={{ width: "100%", maxHeight: "80vh" }} src={vid} />;
}

// ─── Main ────────────────────────────────────────────────────
export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  // Admin auth
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [letterInput, setLetterInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Admin state
  const [adminTab, setAdminTab] = useState("browse");
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [tmdbKey, setTmdbKey] = useState(() => localStorage.getItem("zovex_tmdb_key") || "");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Categories
  const [customCategories, setCustomCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("zovex_categories") || "null") || DEFAULT_CATEGORIES; } catch { return DEFAULT_CATEGORIES; }
  });
  const [newCatInput, setNewCatInput] = useState("");

  // Form
  const [form, setForm] = useState({
    title: "", thumbnail_url: "", category: "", video_url: "", description: "", year: String(new Date().getFullYear()),
    series_name: "", season_number: "", episode_number: "",
  });
  const [isSeries, setIsSeries] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const searchRef = useRef(null);

  useEffect(() => { loadMovies(); }, []);

  const loadMovies = () => {
    setLoading(true);
    Movie.list("-created_date").then(d => { setMovies(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (searchTerm === SECRET_TRIGGER) { setSearchTerm(""); setShowAdminLogin(true); }
  }, [searchTerm]);

  const saveCategories = (cats) => {
    setCustomCategories(cats);
    localStorage.setItem("zovex_categories", JSON.stringify(cats));
  };

  const handleAdminLogin = () => {
    if (pinInput === PIN_CODE && letterInput === LETTER_CODE) {
      setShowAdminLogin(false); setShowAdmin(true);
      setPinInput(""); setLetterInput(""); setLoginError("");
    } else { setLoginError("קודים שגויים. נסה שוב."); }
  };

  const resetForm = () => {
    setForm({ title: "", thumbnail_url: "", category: customCategories[0] || "", video_url: "", description: "", year: String(new Date().getFullYear()), series_name: "", season_number: "", episode_number: "" });
    setVideoUrlInput(""); setIsSeries(false); setEditingMovie(null);
  };

  const handleVideoUrlChange = (url) => {
    setVideoUrlInput(url);
    const info = extractVideoInfo(url);
    setForm(p => ({ ...p, video_url: url, _video_id: info.video_id, _type: info.type }));
  };

  // TMDB search
  const searchTMDB = async (q) => {
    if (!q.trim() || !tmdbKey) return;
    setTmdbLoading(true);
    try {
      const r = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(q)}&language=he`);
      const d = await r.json();
      setTmdbResults((d.results || []).filter(x => x.media_type !== "person").slice(0, 6));
    } catch {}
    setTmdbLoading(false);
  };

  useEffect(() => {
    if (!tmdbQuery.trim()) { setTmdbResults([]); return; }
    const t = setTimeout(() => searchTMDB(tmdbQuery), 500);
    return () => clearTimeout(t);
  }, [tmdbQuery]);

  const selectTMDB = (item) => {
    setForm(p => ({
      ...p,
      title: item.title || item.name || "",
      description: item.overview || "",
      thumbnail_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
      year: (item.release_date || item.first_air_date || "").slice(0, 4) || String(new Date().getFullYear()),
      category: item.media_type === "tv" ? "סדרות" : "סרטים",
    }));
    if (item.media_type === "tv") setIsSeries(true);
    setTmdbResults([]); setTmdbQuery("");
  };

  const generateAI = async () => {
    if (!form.title) { setFormStatus({ type: "error", message: "⚠️ הכנס שם קודם" }); return; }
    setAiLoading(true);
    try {
      const { InvokeLLM } = await import("@/integrations/Core");
      const result = await InvokeLLM({ prompt: `כתוב תיאור קצר ומרתק בעברית (3 משפטים, סגנון נטפליקס) לסרט: "${form.title}". רק התיאור עצמו.` });
      if (result) setForm(p => ({ ...p, description: result }));
    } catch {}
    setAiLoading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.category) { setFormStatus({ type: "error", message: "⚠️ שם וקטגוריה חובה" }); return; }
    setSaving(true);
    const info = extractVideoInfo(videoUrlInput);
    const payload = {
      title: form.title,
      description: form.description,
      thumbnail_url: form.thumbnail_url,
      category: form.category,
      year: Number(form.year) || new Date().getFullYear(),
      video_id: info.video_id,
      type: info.type,
      video_url: videoUrlInput,
      series_name: isSeries ? form.series_name : null,
      season_number: isSeries ? (Number(form.season_number) || null) : null,
      episode_number: isSeries ? (Number(form.episode_number) || null) : null,
    };
    try {
      if (editingMovie) { await Movie.update(editingMovie.id, payload); setFormStatus({ type: "success", message: "✅ עודכן!" }); }
      else { await Movie.create(payload); setFormStatus({ type: "success", message: "✅ נשמר!" }); }
      resetForm(); loadMovies();
      setTimeout(() => setFormStatus({ type: "", message: "" }), 3000);
    } catch { setFormStatus({ type: "error", message: "❌ שגיאה" }); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק?")) return;
    setDeleting(id);
    try { await Movie.delete(id); loadMovies(); } catch {}
    setDeleting(null);
  };

  const startEdit = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title || "", thumbnail_url: movie.thumbnail_url || "",
      category: movie.category || "", description: movie.description || "",
      year: String(movie.year || new Date().getFullYear()),
      series_name: movie.series_name || "", season_number: String(movie.season_number || ""), episode_number: String(movie.episode_number || ""),
    });
    setVideoUrlInput(movie.video_url || movie.video_id || "");
    setIsSeries(!!movie.series_name);
    setAdminTab("add");
  };

  const allCategories = useMemo(() => ["הכל", ...new Set([...customCategories, ...movies.map(m => m.category).filter(Boolean)])], [movies, customCategories]);

  const filteredMovies = useMemo(() => {
    if (searchTerm === SECRET_TRIGGER) return [];
    return movies.filter(m => {
      const matchSearch = (m.title || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "הכל" || m.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [movies, searchTerm, selectedCategory]);

  const inp = { width: "100%", background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const card = { background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,.07)" };
  const dot = <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0071e3", display: "inline-block", marginLeft: 8, flexShrink: 0 }} />;

  // ─── Loading ─────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#fff" }}>
      <style>{spinnerStyle}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 50, height: 50, border: "5px solid #eee", borderTop: "5px solid #e50914", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 15px" }} />
        <p style={{ color: "#999", fontFamily: "Arial" }}>טוען...</p>
      </div>
    </div>
  );

  // ─── Admin Login ─────────────────────────────────────────────
  if (showAdminLogin) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#111", fontFamily: "Arial", direction: "rtl" }}>
      <div style={{ background: "#1e1e1e", padding: 40, borderRadius: 20, width: 320, boxShadow: "0 8px 40px rgba(0,0,0,.5)" }}>
        <h2 style={{ color: "#e50914", textAlign: "center", marginBottom: 30, fontSize: 22 }}>🔐 כניסת מנהל</h2>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 7 }}>קוד PIN</label>
          <input type="password" inputMode="numeric" value={pinInput} onChange={e => setPinInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminLogin()} placeholder="הזן קוד PIN"
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#2a2a2a", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 7 }}>קוד אותיות</label>
          <input type="password" value={letterInput} onChange={e => setLetterInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleAdminLogin()} placeholder="הזן קוד אותיות"
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#2a2a2a", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
        </div>
        {loginError && <p style={{ color: "#ff4d4d", textAlign: "center", marginBottom: 15, fontSize: 14 }}>{loginError}</p>}
        <button onClick={handleAdminLogin} style={{ width: "100%", background: "#e50914", color: "#fff", border: "none", padding: 14, borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>כניסה</button>
        <button onClick={() => { setShowAdminLogin(false); setPinInput(""); setLetterInput(""); }} style={{ width: "100%", background: "none", color: "#666", border: "none", padding: 10, marginTop: 8, cursor: "pointer", fontSize: 14 }}>ביטול</button>
      </div>
    </div>
  );

  // ─── Admin Panel ──────────────────────────────────────────────
  if (showAdmin) {
    const TABS = [
      { id: "browse", label: "🎬 סרטים" },
      { id: "add",    label: "➕ הוסף" },
      { id: "manage", label: "📋 ניהול" },
      { id: "categories", label: "🏷️ קטגוריות" },
      { id: "settings", label: "⚙️ הגדרות" },
    ];

    const grouped = {};
    movies.forEach(m => { const c = m.category || "ללא קטגוריה"; if (!grouped[c]) grouped[c] = []; grouped[c].push(m); });

    return (
      <div style={{ background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" }}>
        <style>{spinnerStyle}</style>

        {/* Top bar */}
        <div style={{ background: "rgba(245,245,247,.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid #d2d2d7", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: 2, background: "linear-gradient(135deg,#0071e3,#5e5ce6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ZOVEX <span style={{ fontSize: 11, WebkitTextFillColor: "#6e6e73", fontWeight: 400 }}>Admin</span>
          </div>
          <button onClick={() => setShowAdmin(false)}
            style={{ background: "#F0F0F5", color: "#6e6e73", border: "1.5px solid #d2d2d7", borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ← יציאה
          </button>
        </div>

        {/* Tabs */}
        <div style={{ background: "rgba(245,245,247,.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid #d2d2d7", display: "flex", overflowX: "auto", position: "sticky", top: 52, zIndex: 20 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)}
              style={{ flex: 1, minWidth: 60, padding: "11px 4px", fontSize: 10, fontWeight: 700, color: adminTab === tab.id ? "#0071e3" : "#6e6e73", background: "none", border: "none", borderBottom: `2px solid ${adminTab === tab.id ? "#0071e3" : "transparent"}`, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 14, paddingBottom: 80 }}>

          {/* ── סרטים (browse) ── */}
          {adminTab === "browse" && (
            <div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {["הכל", ...customCategories].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    style={{ background: selectedCategory === cat ? "#0071e3" : "#fff", border: "1.5px solid", borderColor: selectedCategory === cat ? "#0071e3" : "#d2d2d7", color: selectedCategory === cat ? "#fff" : "#6e6e73", borderRadius: 20, padding: "5px 13px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {(selectedCategory === "הכל" ? movies : movies.filter(m => m.category === selectedCategory)).map(movie => (
                  <div key={movie.id} onClick={() => startEdit(movie)}
                    style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "2/3", background: "#e0e0e0", boxShadow: "0 4px 16px rgba(0,0,0,.1)", cursor: "pointer" }}>
                    {movie.thumbnail_url && <img src={movie.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,.85))", padding: "18px 8px 8px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{movie.title}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,.65)", marginTop: 1 }}>{movie.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── הוסף / ערוך ── */}
          {adminTab === "add" && (
            <div>
              {/* TMDB Search */}
              <div style={card}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center" }}>{dot}חיפוש TMDB אוטומטי</div>
                <div style={{ position: "relative" }}>
                  <input value={tmdbQuery} onChange={e => setTmdbQuery(e.target.value)} placeholder="Inception... 🔍"
                    style={{ ...inp, paddingLeft: tmdbLoading ? 36 : 12 }} />
                  {tmdbLoading && <Loader2 size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", animation: "spin .6s linear infinite", color: "#0071e3" }} />}
                </div>
                {tmdbResults.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {tmdbResults.map((x, i) => (
                      <div key={i} onClick={() => selectTMDB(x)}
                        style={{ display: "flex", gap: 10, background: "#F5F5F7", borderRadius: 12, padding: 10, cursor: "pointer", border: "1.5px solid #d2d2d7", alignItems: "flex-start" }}>
                        {x.poster_path
                          ? <img src={`https://image.tmdb.org/t/p/w92${x.poster_path}`} style={{ width: 40, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" />
                          : <div style={{ width: 40, height: 56, borderRadius: 8, background: "#d2d2d7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎬</div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{x.title || x.name}</div>
                          <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 1 }}>{(x.release_date || x.first_air_date || "").slice(0, 4)} · {x.media_type === "tv" ? "📺 סדרה" : "🎬 סרט"}</div>
                          <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{x.overview}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form */}
              <div style={card}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}{editingMovie ? "עריכת תוכן" : "פרטי התוכן"}</div>

                {/* סוג תוכן */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>סוג תוכן</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["movie", "🎬 סרט"], ["series", "📺 סדרה"]].map(([v, l]) => (
                      <button key={v} onClick={() => setIsSeries(v === "series")}
                        style={{ flex: 1, borderRadius: 12, padding: "10px 0", fontSize: 13, fontWeight: 700, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", borderColor: (v === "series") === isSeries ? "#0071e3" : "#d2d2d7", background: (v === "series") === isSeries ? "#0071e3" : "#F0F0F5", color: (v === "series") === isSeries ? "#fff" : "#6e6e73" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* שם */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>שם</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="שם הסרט / סדרה..." style={inp} />
                </div>

                {/* שדות סדרה */}
                {isSeries && (
                  <div style={{ background: "#F5F5F7", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>שם הסדרה</label>
                      <input value={form.series_name} onChange={e => setForm(p => ({ ...p, series_name: e.target.value }))} placeholder="שם הסדרה..." style={inp} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>עונה</label>
                        <input type="number" min="1" value={form.season_number} onChange={e => setForm(p => ({ ...p, season_number: e.target.value }))} placeholder="1" style={inp} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>פרק</label>
                        <input type="number" min="1" value={form.episode_number} onChange={e => setForm(p => ({ ...p, episode_number: e.target.value }))} placeholder="1" style={inp} />
                      </div>
                    </div>
                  </div>
                )}

                {/* שנה + קטגוריה */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>שנה</label>
                    <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="2026" style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>קטגוריה</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inp}>
                      <option value="">בחר קטגוריה...</option>
                      {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* תיאור */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>תיאור</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="תיאור..." rows={3}
                    style={{ ...inp, resize: "none", minHeight: 75 }} />
                </div>

                {/* תמונה */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>קישור תמונה / פוסטר</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {form.thumbnail_url && <img src={form.thumbnail_url} style={{ width: 44, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" onError={e => e.target.style.display = "none"} />}
                    <input value={form.thumbnail_url} onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://...jpg" style={inp} />
                  </div>
                </div>

                {/* וידאו */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>
                    קישור וידאו
                    {videoUrlInput && <span style={{ color: "#0071e3", fontWeight: 400, marginRight: 6 }}>· {extractVideoInfo(videoUrlInput).type}</span>}
                  </label>
                  <input value={videoUrlInput} onChange={e => handleVideoUrlChange(e.target.value)}
                    placeholder="YouTube / Dailymotion / Rumble / כאן 11 / mp4..." dir="ltr" style={inp} />
                  <div style={{ marginTop: 5, fontSize: 10, color: "#6e6e73" }}>
                    תומך: YouTube, Drive, Vimeo, Dailymotion, Streamable, Rumble, Archive, כאן 11, mp4
                  </div>
                </div>

                {/* כפתורים */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={generateAI} disabled={aiLoading}
                    style={{ flex: 1, background: "#34c759", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: aiLoading ? 0.6 : 1 }}>
                    {aiLoading ? <Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> : "✨"} AI תיאור
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    style={{ flex: 1, background: "#0071e3", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 4px 12px rgba(0,113,227,.3)", opacity: saving ? 0.6 : 1 }}>
                    {saving ? <Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> : "💾"} {editingMovie ? "עדכן" : "שמור"}
                  </button>
                </div>
                {editingMovie && (
                  <button onClick={resetForm} style={{ width: "100%", marginTop: 8, background: "#F0F0F5", color: "#6e6e73", border: "1.5px solid #d2d2d7", borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    ביטול עריכה
                  </button>
                )}
                {formStatus.message && (
                  <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, borderRight: `3px solid ${formStatus.type === "success" ? "#34c759" : "#ff3b30"}`, background: formStatus.type === "success" ? "#f0fff4" : "#fff5f5", color: formStatus.type === "success" ? "#1a7a3a" : "#ff3b30" }}>
                    {formStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ניהול ── */}
          {adminTab === "manage" && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>
                {dot}תכנים ({movies.length})
              </div>
              {Object.entries(grouped).map(([cat, items]) => (
                <CategorySection key={cat} catName={cat} items={items}
                  onEdit={startEdit} onDelete={handleDelete} deleting={deleting} />
              ))}
            </div>
          )}

          {/* ── קטגוריות ── */}
          {adminTab === "categories" && (
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}ניהול קטגוריות</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input value={newCatInput} onChange={e => setNewCatInput(e.target.value)} placeholder="שם קטגוריה חדשה..."
                  onKeyDown={e => { if (e.key === "Enter" && newCatInput.trim()) { saveCategories([...customCategories, newCatInput.trim()]); setNewCatInput(""); } }}
                  style={{ ...inp, flex: 1 }} />
                <button onClick={() => { if (newCatInput.trim()) { saveCategories([...customCategories, newCatInput.trim()]); setNewCatInput(""); } }}
                  style={{ background: "#0071e3", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  + הוסף
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {customCategories.map((cat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F5F5F7", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{cat}</span>
                    <button onClick={() => saveCategories(customCategories.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── הגדרות ── */}
          {adminTab === "settings" && (
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}מפתחות API</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>TMDB API Key</label>
                <input type="password" value={tmdbKey} onChange={e => setTmdbKey(e.target.value)} placeholder="32 תווים..." dir="ltr" style={inp} />
              </div>
              <button onClick={() => { localStorage.setItem("zovex_tmdb_key", tmdbKey); setFormStatus({ type: "success", message: "✅ נשמר!" }); setTimeout(() => setFormStatus({ type: "", message: "" }), 2000); }}
                style={{ width: "100%", background: "#0071e3", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(0,113,227,.3)" }}>
                💾 שמור מפתחות
              </button>
              {formStatus.message && (
                <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#f0fff4", color: "#1a7a3a" }}>{formStatus.message}</div>
              )}
              <div style={{ marginTop: 12, fontSize: 11, color: "#6e6e73", lineHeight: 1.9 }}>
                🔑 TMDB: <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{ color: "#0071e3" }}>themoviedb.org</a> → API Key (v3)
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Player ───────────────────────────────────────────────────
  if (playerOpen && selectedMovie) return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{spinnerStyle}</style>
      <button onClick={() => setPlayerOpen(false)}
        style={{ position: "absolute", top: 15, right: 15, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
        <X size={24} />
      </button>
      <p style={{ color: "#aaa", fontSize: 15, marginBottom: 12, fontFamily: "Arial", padding: "0 50px", textAlign: "center" }}>{selectedMovie.title}</p>
      {renderPlayer(selectedMovie)}
    </div>
  );

  // ─── Movie Detail ─────────────────────────────────────────────
  if (selectedMovie) return (
    <div style={{ background: "#111", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", color: "#fff" }}>
      <button onClick={() => setSelectedMovie(null)}
        style={{ position: "fixed", top: 15, right: 15, zIndex: 100, background: "rgba(0,0,0,.7)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <ArrowRight size={22} />
      </button>
      <div style={{ position: "relative" }}>
        <img src={selectedMovie.thumbnail_url} alt={selectedMovie.title} style={{ width: "100%", height: "55vw", maxHeight: 400, objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(transparent,#111)" }} />
      </div>
      <div style={{ padding: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px 0", color: "#fff" }}>{selectedMovie.title}</h1>
        {selectedMovie.series_name && (
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
            {selectedMovie.series_name}
            {selectedMovie.season_number ? ` · עונה ${selectedMovie.season_number}` : ""}
            {selectedMovie.episode_number ? ` · פרק ${selectedMovie.episode_number}` : ""}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {selectedMovie.category && <span style={{ background: "#e50914", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold" }}>{selectedMovie.category}</span>}
          {selectedMovie.year && <span style={{ background: "#333", color: "#aaa", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>{selectedMovie.year}</span>}
          {selectedMovie.type && <span style={{ background: "#222", color: "#666", padding: "4px 12px", borderRadius: 20, fontSize: 11 }}>{selectedMovie.type}</span>}
        </div>
        {selectedMovie.description && <p style={{ fontSize: 15, lineHeight: 1.8, color: "#bbb", margin: "0 0 20px" }}>{selectedMovie.description}</p>}
        <button onClick={() => setPlayerOpen(true)}
          style={{ width: "100%", background: "#e50914", color: "#fff", border: "none", padding: 16, fontSize: 18, fontWeight: "bold", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: "0 4px 20px rgba(229,9,20,.4)" }}>
          <Play fill="white" size={22} /> לצפייה עכשיו
        </button>
      </div>
    </div>
  );

  // ─── Home ─────────────────────────────────────────────────────
  return (
    <div style={{ background: "#fff", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif" }}>
      <style>{spinnerStyle}</style>
      <header style={{ padding: "14px 14px 0", position: "sticky", top: 0, background: "#fff", zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
          <h1 style={{ color: "#e50914", fontSize: 27, fontWeight: 900, margin: 0, flexShrink: 0 }}>ZOVEX</h1>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", padding: "9px 14px", borderRadius: 50, border: "1px solid #eee" }}>
            <Search size={16} color="#aaa" />
            <input type="text" placeholder="חפש סרט או סדרה..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: 15, color: "#333" }} />
            {searchTerm && <span onClick={() => setSearchTerm("")} style={{ cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 11, whiteSpace: "nowrap", scrollbarWidth: "none" }}>
          {allCategories.map(cat => (
            <span key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ cursor: "pointer", fontSize: 14, fontWeight: "bold", color: selectedCategory === cat ? "#e50914" : "#666", borderBottom: selectedCategory === cat ? "3px solid #e50914" : "3px solid transparent", paddingBottom: 5, transition: "all .2s" }}>
              {cat}
            </span>
          ))}
        </div>
      </header>

      <main style={{ padding: "18px 14px 100px" }}>
        {filteredMovies.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}><p style={{ fontSize: 18 }}>😕 לא נמצאו תוצאות</p></div>
          : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {filteredMovies.map(movie => (
                <div key={movie.id} onClick={() => setSelectedMovie(movie)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 7 }}>
                  <h3 style={{ fontSize: 13, fontWeight: "bold", textAlign: "center", margin: 0, color: "#111", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {movie.title}
                  </h3>
                  <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "2/3", boxShadow: "0 4px 12px rgba(0,0,0,.12)", background: "#f0f0f0" }}>
                    <img src={movie.thumbnail_url} alt={movie.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.src = "https://via.placeholder.com/200x300?text=ZOVEX"; }} />
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </main>

      <a href="https://t.me/ZOVE8" target="_blank" rel="noreferrer"
        style={{ position: "fixed", bottom: 24, left: 24, background: "#24A1DE", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,.2)", zIndex: 1000, textDecoration: "none" }}>
        <Send size={26} fill="white" />
      </a>
    </div>
  );
}

// ─── CategorySection (Manage) ────────────────────────────────
function CategorySection({ catName, items, onEdit, onDelete, deleting }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 12, background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F0F0F5", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{catName} <span style={{ color: "#6e6e73", fontWeight: 400, fontSize: 12 }}>({items.length})</span></span>
        {open ? <ChevronUp size={16} color="#6e6e73" /> : <ChevronDown size={16} color="#6e6e73" />}
      </button>
      {open && items.map(item => (
        <div key={item.id} style={{ display: "flex", gap: 10, padding: 12, alignItems: "center", borderTop: "1px solid #F5F5F7" }}>
          {item.thumbnail_url
            ? <img src={item.thumbnail_url} style={{ width: 36, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" onError={e => e.target.style.display = "none"} />
            : <div style={{ width: 36, height: 52, borderRadius: 8, background: "#F0F0F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>🎬</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
            <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 2 }}>
              {item.series_name ? `${item.series_name} · ע${item.season_number || "?"} פ${item.episode_number || "?"}` : `${item.year || ""} · ${item.type || ""}`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => onEdit(item)} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}>✏️</button>
            <button onClick={() => onDelete(item.id)} disabled={deleting === item.id} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}>
              {deleting === item.id ? <Loader2 size={13} style={{ animation: "spin .6s linear infinite" }} /> : "🗑️"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}