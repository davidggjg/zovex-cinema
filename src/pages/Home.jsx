import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Send, Play, ArrowRight, X, Loader2, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { Movie } from "@/entities/Movie";
import CustomVideoPlayer from "@/components/home/CustomVideoPlayer.jsx";
 
const spinnerStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;
const SECRET_TRIGGER = "ZovexAdmin2026";
const PIN_CODE = "123456";
const LETTER_CODE = "ZOVIX";
 
function extractVideoInfo(url) {
  if (!url) return { type: "direct", video_id: "" };
  // אם זה iframe שלם - חלץ את ה-src ממנו
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src=["']([^"']+)["']/);
    if (srcMatch) url = srcMatch[1];
  }
  if (!url.startsWith("http")) return { type: "direct", video_id: url };
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const m = url.match(/(?:v=|youtu\.be\/)([^&/?]+)/);
    return { type: "youtube", video_id: m?.[1] || url };
  }
  if (url.includes("drive.google.com")) {
    const m = url.match(/\/d\/([^/]+)/);
    return { type: "drive", video_id: m?.[1] || url };
  }
  if (url.includes("vimeo.com")) {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return { type: "vimeo", video_id: m?.[1] || url };
  }
  if (url.includes("dailymotion.com") || url.includes("dai.ly")) {
    const m = url.match(/(?:video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
    return { type: "dailymotion", video_id: m?.[1] || url };
  }
  if (url.includes("streamable.com")) {
    const m = url.match(/streamable\.com\/([a-zA-Z0-9]+)/);
    return { type: "streamable", video_id: m?.[1] || url };
  }
  if (url.includes("rumble.com")) {
    const m = url.match(/(?:embed\/|video\/)([a-zA-Z0-9]+)/);
    return { type: "rumble", video_id: m?.[1] || url };
  }
  if (url.includes("archive.org")) {
    const m = url.match(/archive\.org\/(?:embed|details)\/([^/?]+)/);
    return { type: "archive", video_id: m?.[1] || url };
  }
  if (url.includes("stream.mp4") && url.includes("/Videos/")) {
    const m = url.match(/\/Videos\/([^/]+)\//);
    return { type: "jellyfin", video_id: m?.[1] || url };
  }
  if (url.includes("kan.org.il")) {
    const parts = url.split("/").filter(Boolean);
    return { type: "kan", video_id: parts[parts.length - 1] };
  }
  if (url.includes("ok.ru")) {
    const m = url.match(/ok\.ru\/video\/(\d+)/);
    return { type: "okru", video_id: m?.[1] || url };
  }
  if (url.includes("t.me")) {
    const m = url.match(/t\.me\/([^/]+\/\d+)/);
    return { type: "telegram", video_id: m?.[1] || url };
  }
  if (url.includes("kaltura.com")) {
    const entryM = url.match(/entry_id=([^&"'\s]+)/);
    const uiconfM = url.match(/uiconf_id\/(\d+)/);
    const partnerM = url.match(/\/p\/(\d+)\//);
    if (entryM && uiconfM && partnerM) {
      return { type: "kaltura", video_id: `${partnerM[1]}/${uiconfM[1]}/${entryM[1]}` };
    }
  }
  return { type: "direct", video_id: url };
}
 
function renderPlayer(movie) {
  const vid = movie.video_id || movie.video_url || "";
  const type = movie.type || "direct";
  if (!vid) return <p style={{ color: "#aaa", textAlign: "center", padding: 20 }}>אין וידאו זמין</p>;
  const fr = { width: "100%", height: "56vw", maxHeight: "82vh", border: "none" };
  if (type === "youtube" || vid.includes("youtube") || vid.includes("youtu.be")) {
    const id = vid.replace(/.*[?&]v=/, "").replace(/.*youtu\.be\//, "").split("&")[0];
    return <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "drive" || vid.includes("drive.google")) {
    const id = vid.replace(/.*\/d\//, "").replace(/\/.*/, "").split("?")[0];
    return <iframe src={`https://drive.google.com/file/d/${id}/preview`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "vimeo" || vid.includes("vimeo")) {
    const id = vid.replace(/.*vimeo\.com\//, "").split("?")[0];
    return <iframe src={`https://player.vimeo.com/video/${id}?autoplay=1`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "dailymotion" || vid.includes("dailymotion")) {
    const id = vid.replace(/.*video\//, "").split(/[?_]/)[0];
    return <iframe src={`https://www.dailymotion.com/embed/video/${id}?autoplay=1`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "streamable" || vid.includes("streamable")) {
    const id = vid.replace(/.*streamable\.com\//, "").split("?")[0];
    return <iframe src={`https://streamable.com/e/${id}?autoplay=1`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "rumble" || vid.includes("rumble")) {
    const id = vid.replace(/.*rumble\.com\/embed\//, "").replace(/.*rumble\.com\/video\//, "").split(/[/?]/)[0];
    return <iframe src={`https://rumble.com/embed/${id}/`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "archive" || vid.includes("archive.org")) {
    const id = vid.replace(/.*archive\.org\/(?:embed|details)\//, "").split("?")[0];
    return <iframe src={`https://archive.org/embed/${id}`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "kan" || vid.includes("kan.org")) {
    return <iframe src={`https://www.kan.org.il/General/Embed.aspx?id=${vid}`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "okru" || vid.includes("ok.ru")) {
    const id = vid.replace(/.*ok\.ru\/video\//, "").split("?")[0];
    return <iframe src={`https://ok.ru/videoembed/${id}`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "telegram" || vid.includes("t.me")) {
    const id = vid.replace(/.*t\.me\//, "").split("?")[0];
    return <iframe src={`https://t.me/${id}?embed=1&mode=tme`} style={fr} allowFullScreen allow="autoplay" />;
  }
  if (type === "kaltura" || vid.includes("kaltura")) {
    const parts = vid.split("/");
    const partnerId = parts[0], uiconfId = parts[1], entryId = parts[2];
    return <iframe src={`https://cdnapisec.kaltura.com/p/${partnerId}/embedPlaykitJs/uiconf_id/${uiconfId}?iframeembed=true&entry_id=${entryId}`} style={fr} allowFullScreen allow="autoplay; encrypted-media" />;
  }
  if (type === "cloudinary") {
    const cloud = movie.cloudinary_cloud_name || "";
    return <video controls autoPlay style={{ width: "100%", maxHeight: "82vh" }} src={`https://res.cloudinary.com/${cloud}/video/upload/${vid}`} />;
  }
  // direct URL שהוא בעצם Kaltura embed מלא
  if (vid.includes("kaltura.com")) {
    return <iframe src={vid} style={fr} allowFullScreen allow="autoplay; encrypted-media" />;
  }
  return <video controls autoPlay style={{ width: "100%", maxHeight: "82vh" }} src={vid} />;
}
 
export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [openSeasons, setOpenSeasons] = useState({});
  const [playerMovie, setPlayerMovie] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [letterInput, setLetterInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminTab, setAdminTab] = useState("browse");
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [tmdbKey, setTmdbKey] = useState(() => { try { return localStorage.getItem("zovex_tmdb_key") || ""; } catch { return ""; } });
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [isSeries, setIsSeries] = useState(false);
  const [showExistingSeries, setShowExistingSeries] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [posterPreview, setPosterPreview] = useState("");
  const [form, setForm] = useState({
    title: "", thumbnail_url: "", category: "", description: "",
    year: String(new Date().getFullYear()),
    series_name: "", season_number: "", episode_number: "", episode_title: ""
  });
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [editingCatVal, setEditingCatVal] = useState("");
  const [manageQ, setManageQ] = useState("");
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const lastScrollY = useRef(0);
  const fileInputRef = useRef(null);
 
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setShowCategories(true);
      } else if (currentY > lastScrollY.current) {
        setShowCategories(false);
      } else {
        setShowCategories(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  useEffect(() => { loadMovies(); }, []);
 
 
 
  // פתיחת סרט ישירה ללא רענון מיותר
  const refreshKalturaEpisode = async (movie) => movie;
 
  const loadMovies = () => {
    setLoading(true);
    Movie.list("-created_date", 500).then(d => { setMovies(d); setLoading(false); }).catch(() => setLoading(false));
  };
 
  useEffect(() => {
    if (searchTerm === SECRET_TRIGGER) { setSearchTerm(""); setShowAdminLogin(true); }
  }, [searchTerm]);
 
  useEffect(() => {
    if (movies.length === 0) return;
    const saved = (() => { try { return JSON.parse(localStorage.getItem("zovex_cats") || "null"); } catch { return null; } })();
    const fromMovies = [...new Set(movies.map(m => m.category).filter(Boolean))];
    if (saved && saved.length > 0) {
      // מוסיף קטגוריות חדשות שאינן בשמורות, אבל שומר על הסדר הקיים
      const merged = [...saved, ...fromMovies.filter(c => !saved.includes(c))];
      setCategories(merged);
      try { localStorage.setItem("zovex_cats", JSON.stringify(merged)); } catch {}
      return;
    }
    setCategories(fromMovies);
    try { localStorage.setItem("zovex_cats", JSON.stringify(fromMovies)); } catch {}
  }, [movies]);
 
  const saveCats = (c) => {
    setCategories(c);
    try { localStorage.setItem("zovex_cats", JSON.stringify(c)); } catch {}
  };
 
  const renameCat = async (oldName, newName) => {
    if (!newName.trim() || newName === oldName) { setEditingCat(null); return; }
    const updated = categories.map(c => c === oldName ? newName.trim() : c);
    saveCats(updated);
    setSaving(true);
    const toUpdate = movies.filter(m => m.category === oldName);
    for (const m of toUpdate) {
      try { await Movie.update(m.id, { category: newName.trim() }); } catch {}
    }
    setSaving(false);
    loadMovies();
    setEditingCat(null);
    setEditingCatVal("");
  };
 
  useEffect(() => {
    if (!tmdbQuery.trim() || !tmdbKey) { setTmdbResults([]); return; }
    const t = setTimeout(async () => {
      setTmdbLoading(true);
      try {
        const r = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(tmdbQuery)}&language=he`);
        const d = await r.json();
        setTmdbResults((d.results || []).filter(x => x.media_type !== "person").slice(0, 6));
      } catch {}
      setTmdbLoading(false);
    }, 450);
    return () => clearTimeout(t);
  }, [tmdbQuery, tmdbKey]);
 
  const selectTMDB = (item) => {
    const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "";
    setForm(p => ({
      ...p,
      title: item.title || item.name || "",
      description: item.overview || "",
      thumbnail_url: poster,
      year: (item.release_date || item.first_air_date || "").slice(0, 4) || p.year,
      category: item.media_type === "tv" ? "סדרות" : "סרטים",
    }));
    setPosterPreview(poster);
    if (item.media_type === "tv") setIsSeries(true);
    setTmdbResults([]); setTmdbQuery("");
  };
 
  const handleUploadPoster = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { base44 } = await import("@/api/base44Client");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(p => ({ ...p, thumbnail_url: file_url }));
      setPosterPreview(file_url);
    } catch {
      setFormStatus({ type: "error", message: "שגיאה בהעלאת תמונה" });
    }
    setUploading(false);
  };
 
  const resetForm = () => {
    setForm({ title: "", thumbnail_url: "", category: categories[0] || "", description: "", year: String(new Date().getFullYear()), series_name: "", season_number: "", episode_number: "", episode_title: "", jellyfinServer: "", jellyfinApiKey: "" });
    setVideoUrlInput(""); setIsSeries(false); setEditingMovie(null);
    setFormStatus({ type: "", message: "" }); setPosterPreview("");
    setShowExistingSeries(false);
  };
 
  const generateAI = async () => {
    if (!form.title) { setFormStatus({ type: "error", message: "הכנס שם קודם" }); return; }
    setAiLoading(true);
    try {
      const { InvokeLLM } = await import("@/integrations/Core");
      const result = await InvokeLLM({ prompt: `כתוב תיאור קצר ומרתק בעברית (3 משפטים, סגנון נטפליקס) ל: "${form.title}". רק התיאור עצמו.` });
      if (result) setForm(p => ({ ...p, description: result }));
    } catch {}
    setAiLoading(false);
  };
 
  const handleSave = async () => {
    if (!form.title || !form.category) { setFormStatus({ type: "error", message: "שם וקטגוריה חובה" }); return; }
    setSaving(true);
    const info = extractVideoInfo(videoUrlInput);
    // auto episode number: find next available in series+season
    let autoEpNum = Number(form.episode_number) || null;
    if (isSeries && !editingMovie && !autoEpNum) {
      const serName = form.series_name || form.title;
      const seasonN = Number(form.season_number) || 1;
      const existing = movies.filter(m => m.series_name === serName && (m.season_number || 1) === seasonN).map(m => m.episode_number || 0);
      autoEpNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    }
    const payload = {
      title: form.title, description: form.description,
      thumbnail_url: form.thumbnail_url, category: form.category,
      year: Number(form.year) || new Date().getFullYear(),
      video_id: info.video_id, type: info.type, video_url: videoUrlInput,
      jellyfin_server: info.type === "jellyfin" ? (form.jellyfinServer || null) : null,
      jellyfin_api_key: info.type === "jellyfin" ? (form.jellyfinApiKey || null) : null,
      series_name: isSeries ? (form.series_name || form.title) : null,
      season_number: isSeries ? (Number(form.season_number) || 1) : null,
      episode_number: isSeries ? (autoEpNum) : null,
      episode_title: isSeries ? form.episode_title : null,
    };
    try {
      if (editingMovie) {
        await Movie.update(editingMovie.id, payload);
        // if category changed on a series episode, update all episodes in that series
        if (payload.series_name && editingMovie.category !== payload.category) {
          const seriesEps = movies.filter(m => m.series_name === payload.series_name && m.id !== editingMovie.id);
          for (const ep of seriesEps) {
            try { await Movie.update(ep.id, { category: payload.category }); } catch {}
          }
          setFormStatus({ type: "success", message: `עודכן! קטגוריה עודכנה לכל הסדרה (${seriesEps.length + 1} פרקים)` });
        } else {
          setFormStatus({ type: "success", message: "עודכן!" });
        }
      } else {
        await Movie.create(payload);
        setFormStatus({ type: "success", message: "נשמר!" });
      }
      resetForm(); loadMovies();
      setTimeout(() => setFormStatus({ type: "", message: "" }), 3000);
    } catch {
      setFormStatus({ type: "error", message: "שגיאה בשמירה" });
    }
    setSaving(false);
  };
 
  const handleDelete = async (id) => {
    if (!window.confirm("למחוק?")) return;
    setDeleting(id);
    try { await Movie.delete(id); loadMovies(); } catch {}
    setDeleting(null);
  };
 
  const updateSeriesThumbnail = async (seriesName, thumbnailUrl) => {
    if (!seriesName || !thumbnailUrl) return;
    const toUpdate = movies.filter(m => m.series_name === seriesName);
    setSaving(true);
    let done = 0;
    for (const ep of toUpdate) {
      try { await Movie.update(ep.id, { thumbnail_url: thumbnailUrl }); done++; } catch {}
    }
    setFormStatus({ type: "success", message: `תמונה עודכנה ל-${done} פרקים!` });
    loadMovies();
    setSaving(false);
    setTimeout(() => setFormStatus({ type: "", message: "" }), 3000);
  };
 
  const updateSeriesDescription = async (seriesName, description) => {
    if (!seriesName || !description) return;
    const toUpdate = movies.filter(m => m.series_name === seriesName);
    setSaving(true);
    let done = 0;
    for (const ep of toUpdate) {
      try { await Movie.update(ep.id, { description }); done++; } catch {}
    }
    setFormStatus({ type: "success", message: `תיאור עודכן ל-${done} פרקים!` });
    loadMovies();
    setSaving(false);
    setTimeout(() => setFormStatus({ type: "", message: "" }), 3000);
  };
 
  const startEdit = (movie) => {
    setEditingMovie(movie);
    setIsSeries(!!movie.series_name);
    setForm({
      title: movie.title || "", thumbnail_url: movie.thumbnail_url || "",
      category: movie.category || "", description: movie.description || "",
      year: String(movie.year || new Date().getFullYear()),
      series_name: movie.series_name || "", season_number: String(movie.season_number || ""),
      episode_number: String(movie.episode_number || ""), episode_title: movie.episode_title || "",
      jellyfinServer: movie.jellyfin_server || "", jellyfinApiKey: movie.jellyfin_api_key || "",
    });
    setPosterPreview(movie.thumbnail_url || "");
    let fullUrl = "";
    const vid = movie.video_id || "";
    const type = movie.type || "direct";
    if (movie.video_url && movie.video_url.startsWith("http")) {
      fullUrl = movie.video_url;
    } else if (vid) {
      if (type === "youtube") fullUrl = `https://www.youtube.com/watch?v=${vid}`;
      else if (type === "drive") fullUrl = `https://drive.google.com/file/d/${vid}/view`;
      else if (type === "vimeo") fullUrl = `https://vimeo.com/${vid}`;
      else if (type === "dailymotion") fullUrl = `https://www.dailymotion.com/video/${vid}`;
      else if (type === "streamable") fullUrl = `https://streamable.com/${vid}`;
      else if (type === "rumble") fullUrl = `https://rumble.com/embed/${vid}`;
      else if (type === "archive") fullUrl = `https://archive.org/details/${vid}`;
      else if (type === "kan") fullUrl = `https://www.kan.org.il/General/Embed.aspx?id=${vid}`;
      else if (type === "okru") fullUrl = `https://ok.ru/video/${vid}`;
      else if (type === "telegram") fullUrl = `https://t.me/${vid}`;
      else if (type === "jellyfin") fullUrl = vid; // store raw item ID
      else fullUrl = vid;
    }
    setVideoUrlInput(fullUrl);
    setAdminTab("add");
  };
 
  const seriesMap = useMemo(() => {
    const map = {};
    movies.forEach(m => {
      if (!m.series_name) return;
      if (!map[m.series_name]) {
        map[m.series_name] = { name: m.series_name, thumbnail_url: m.thumbnail_url, description: m.description, category: m.category, episodes: [] };
      }
      map[m.series_name].episodes.push(m);
    });
    return map;
  }, [movies]);
 
  const existingSeriesNames = useMemo(() => Object.keys(seriesMap), [seriesMap]);
 
  const allCategories = useMemo(() => {
    const fromMovies = movies.map(m => m.category).filter(Boolean);
    return ["הכל", ...new Set([...categories, ...fromMovies])];
  }, [movies, categories]);
 
  const shuffledMovies = movies;
 
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const cat = selectedCategory;
    const sourceMovies = movies;
    const regularMovies = sourceMovies.filter(m => {
      if (m.series_name) return false;
      return (m.title || "").toLowerCase().includes(q) && (cat === "הכל" || m.category === cat);
    });
    const seriesShown = {};
    const seriesList = [];
 
    movies.forEach(m => {
      if (!m.series_name || seriesShown[m.series_name]) return;
      const matchQ = m.series_name.toLowerCase().includes(q) || (m.title || "").toLowerCase().includes(q);
      const matchC = cat === "הכל" || m.category === cat;
      if (matchQ && matchC) { seriesShown[m.series_name] = true; seriesList.push(seriesMap[m.series_name]); }
    });
    return { movies: regularMovies, series: seriesList };
  }, [movies, searchTerm, selectedCategory, seriesMap]);
 
  const allItems = [...filteredItems.series, ...filteredItems.movies];
  const inp = { width: "100%", background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const cardStyle = { background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,.07)" };
  const dot = <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0071e3", display: "inline-block", marginLeft: 8, flexShrink: 0 }} />;
 
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#fff" }}>
      <style>{spinnerStyle}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 50, height: 50, border: "5px solid #eee", borderTop: "5px solid #e50914", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 15px" }} />
        <p style={{ color: "#999", fontFamily: "Arial" }}>טוען...</p>
      </div>
    </div>
  );
 
  if (showAdminLogin) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#111", fontFamily: "Arial", direction: "rtl" }}>
      <div style={{ background: "#1e1e1e", padding: 40, borderRadius: 20, width: 320, boxShadow: "0 8px 40px rgba(0,0,0,.5)" }}>
        <h2 style={{ color: "#e50914", textAlign: "center", marginBottom: 28, fontSize: 22 }}>כניסת מנהל</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 7 }}>קוד PIN</label>
          <input type="password" inputMode="numeric" value={pinInput} onChange={e => setPinInput(e.target.value)} placeholder="קוד PIN" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#2a2a2a", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 7 }}>קוד אותיות</label>
          <input type="password" value={letterInput} onChange={e => setLetterInput(e.target.value.toUpperCase())} placeholder="קוד אותיות" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#2a2a2a", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
        </div>
        {loginError && <p style={{ color: "#ff4d4d", textAlign: "center", marginBottom: 14, fontSize: 14 }}>{loginError}</p>}
        <button onClick={() => {
          if (pinInput === PIN_CODE && letterInput === LETTER_CODE) {
            setShowAdminLogin(false); setShowAdmin(true); setPinInput(""); setLetterInput(""); setLoginError("");
          } else { setLoginError("קודים שגויים."); }
        }} style={{ width: "100%", background: "#e50914", color: "#fff", border: "none", padding: 14, borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>כניסה</button>
        <button onClick={() => { setShowAdminLogin(false); setPinInput(""); setLetterInput(""); }} style={{ width: "100%", background: "none", color: "#666", border: "none", padding: 10, marginTop: 8, cursor: "pointer", fontSize: 14 }}>ביטול</button>
      </div>
    </div>
  );
 
  if (showAdmin) {
    const grouped = {};
    movies.forEach(m => { const c = m.category || "ללא קטגוריה"; if (!grouped[c]) grouped[c] = []; grouped[c].push(m); });
    return (
      <div style={{ background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" }}>
        <style>{spinnerStyle}</style>
        <div style={{ background: "rgba(245,245,247,.94)", backdropFilter: "blur(20px)", borderBottom: "1px solid #d2d2d7", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>ZOVEX Admin</div>
          <button onClick={() => setShowAdmin(false)} style={{ background: "#F0F0F5", color: "#6e6e73", border: "1.5px solid #d2d2d7", borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>יציאה</button>
        </div>
        <div style={{ background: "rgba(245,245,247,.94)", borderBottom: "1px solid #d2d2d7", display: "flex", overflowX: "auto", position: "sticky", top: 50, zIndex: 20 }}>
          {[["browse","סרטים"],["add","הוסף"],["manage","ניהול"],["categories","קטגוריות"],["settings","הגדרות"]].map(([id, label]) => (
            <button key={id} onClick={() => setAdminTab(id)} style={{ flex: 1, minWidth: 58, padding: "11px 3px", fontSize: 11, fontWeight: 700, color: adminTab === id ? "#0071e3" : "#6e6e73", background: "none", border: "none", borderBottom: `2px solid ${adminTab === id ? "#0071e3" : "transparent"}`, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
          ))}
        </div>
        <div style={{ padding: 14, paddingBottom: 80 }}>
          {adminTab === "browse" && (
            <AdminBrowseTab
              movies={movies}
              seriesMap={seriesMap}
              existingSeriesNames={existingSeriesNames}
              categories={categories}
              onEdit={startEdit}
            />
          )}
          {adminTab === "add" && (
            <div>
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center" }}>{dot}חיפוש TMDB אוטומטי</div>
                <div style={{ position: "relative" }}>
                  <input value={tmdbQuery} onChange={e => setTmdbQuery(e.target.value)} placeholder={tmdbKey ? "חפש שם סרט / סדרה..." : "הכנס TMDB Key בהגדרות"} disabled={!tmdbKey} style={inp} />
                  {tmdbLoading && <Loader2 size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", animation: "spin .6s linear infinite", color: "#0071e3" }} />}
                </div>
                {tmdbResults.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 7, maxHeight: 280, overflowY: "auto" }}>
                    {tmdbResults.map((x, i) => (
                      <div key={i} onClick={() => selectTMDB(x)} style={{ display: "flex", gap: 10, background: "#F5F5F7", borderRadius: 12, padding: 10, cursor: "pointer", border: "1.5px solid #d2d2d7", alignItems: "flex-start" }}>
                        {x.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${x.poster_path}`} style={{ width: 40, height: 56, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} alt="" /> : <div style={{ width: 40, height: 56, borderRadius: 7, background: "#d2d2d7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>?</div>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{x.title || x.name}</div>
                          <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 1 }}>{(x.release_date || x.first_air_date || "").slice(0, 4)} - {x.media_type === "tv" ? "סדרה" : "סרט"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center" }}>{dot}{editingMovie ? "עריכת תוכן" : "פרטי התוכן"}</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>סוג תוכן</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["movie", "סרט"], ["series", "סדרה"]].map(([v, l]) => (
                      <button key={v} onClick={() => { setIsSeries(v === "series"); setShowExistingSeries(v === "series" && existingSeriesNames.length > 0); }} style={{ flex: 1, borderRadius: 12, padding: "10px 0", fontSize: 13, fontWeight: 700, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", borderColor: (v === "series") === isSeries ? "#0071e3" : "#d2d2d7", background: (v === "series") === isSeries ? "#0071e3" : "#F0F0F5", color: (v === "series") === isSeries ? "#fff" : "#6e6e73" }}>{l}</button>
                    ))}
                  </div>
                </div>
                {isSeries && existingSeriesNames.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <button onClick={() => setShowExistingSeries(!showExistingSeries)} style={{ width: "100%", background: form.series_name && existingSeriesNames.includes(form.series_name) ? "#e8f4ff" : "#F5F5F7", border: `1.5px solid ${form.series_name && existingSeriesNames.includes(form.series_name) ? "#0071e3" : "#d2d2d7"}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#0071e3" }}>
                      <span>{form.series_name && existingSeriesNames.includes(form.series_name) ? form.series_name : "הוסף לסדרה קיימת"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {form.series_name && existingSeriesNames.includes(form.series_name) && <span style={{ fontSize: 10, color: "#6e6e73", fontWeight: 400 }}>החלף</span>}
                        {showExistingSeries ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>
                    {showExistingSeries && (
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto", background: "#F5F5F7", borderRadius: 12, padding: 10 }}>
                        {existingSeriesNames.map(name => (
                          <div key={name} onClick={() => { const s = seriesMap[name]; setForm(p => ({ ...p, series_name: name, category: s.category || p.category, thumbnail_url: s.thumbnail_url || p.thumbnail_url })); setPosterPreview(s.thumbnail_url || ""); setShowExistingSeries(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: form.series_name === name ? "#e8f4ff" : "#fff", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${form.series_name === name ? "#0071e3" : "#d2d2d7"}` }}>
                            {seriesMap[name]?.thumbnail_url ? <img src={seriesMap[name].thumbnail_url} style={{ width: 30, height: 42, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} alt="" /> : <div style={{ width: 30, height: 42, borderRadius: 6, background: "#e0e0e0" }} />}
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                            {form.series_name === name && <span style={{ marginRight: "auto", fontSize: 16 }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>{isSeries ? "כותרת לתצוגה (שם הפרק / הסרט)" : "שם הסרט"}</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={isSeries ? "למשל: הכבוד של אשרף פרק 1" : "שם הסרט"} style={inp} />
                </div>
                {isSeries && (
                  <div style={{ background: "#F5F5F7", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>שם הסדרה (חייב להיות זהה בכל הפרקים!)</label>
                      <input value={form.series_name} onChange={e => setForm(p => ({ ...p, series_name: e.target.value }))} placeholder="למשל: הכבוד של אשרף" style={inp} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>מספר עונה</label>
                        <input type="number" min="1" value={form.season_number} onChange={e => setForm(p => ({ ...p, season_number: e.target.value }))} placeholder="1" style={inp} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>מספר פרק</label>
                        <input type="number" min="1" value={form.episode_number} onChange={e => setForm(p => ({ ...p, episode_number: e.target.value }))} placeholder="1" style={inp} />
                      </div>
                    </div>
 
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>שנה</label>
                    <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>קטגוריה</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inp}>
                      <option value="">בחר...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>תיאור</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: "none", minHeight: 72 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 8, fontWeight: 700 }}>תמונת פוסטר</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 56, height: 78, borderRadius: 10, background: "#F0F0F5", border: "1.5px solid #d2d2d7", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                      {posterPreview ? <img src={posterPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={() => setPosterPreview("")} /> : <Upload size={20} color="#6e6e73" />}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ flex: 1, background: "transparent", color: "#0071e3", border: "1.5px solid #0071e3", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      {uploading ? "מעלה..." : "העלה תמונה"}
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadPoster} />
                  {isSeries && editingMovie && (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" onClick={() => updateSeriesDescription(form.series_name || editingMovie.series_name, form.description)} disabled={!form.description} style={{ flex: 1, background: form.description ? "#5e5ce6" : "#ccc", color: "#fff", border: "none", borderRadius: 12, padding: "10px 0", fontSize: 12, fontWeight: 700, cursor: form.description ? "pointer" : "default", fontFamily: "inherit" }}>
                        📝 תיאור לסדרה
                      </button>
                      <button type="button" onClick={() => updateSeriesThumbnail(form.series_name || editingMovie.series_name, form.thumbnail_url)} disabled={!form.thumbnail_url} title="עדכן תמונה לכל הסדרה" style={{ flexShrink: 0, background: form.thumbnail_url ? "#ff9500" : "#ccc", color: "#fff", border: "none", borderRadius: 12, padding: "10px 12px", fontSize: 16, cursor: form.thumbnail_url ? "pointer" : "default", fontFamily: "inherit" }}>
                        🖼️
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>
                    קישור וידאו
                    {videoUrlInput && <span style={{ color: "#0071e3", fontWeight: 400, marginRight: 6, fontSize: 10 }}> - {extractVideoInfo(videoUrlInput).type}</span>}
                  </label>
                  <input value={videoUrlInput} onChange={e => {
                    let val = e.target.value;
                    // אם הדביקו iframe שלם - חלץ את ה-src אוטומטית
                    if (val.includes("<iframe")) {
                      const srcMatch = val.match(/src=["']([^"']+)["']/);
                      if (srcMatch) val = srcMatch[1];
                    }
                    setVideoUrlInput(val);
                  }} placeholder="YouTube / Drive / Dailymotion / Rumble / mp4 / Kaltura iframe..." dir="ltr" style={inp} />
                </div>
                {extractVideoInfo(videoUrlInput).type === "jellyfin" || form.jellyfinServer ? (
                  <div style={{ background: "#f0f7ff", borderRadius: 12, padding: 12, marginBottom: 14, border: "1.5px solid #0071e3" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0071e3", marginBottom: 10 }}>⚙️ הגדרות Jellyfin</div>
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>כתובת שרת</label>
                      <input value={form.jellyfinServer || ""} onChange={e => setForm(p => ({ ...p, jellyfinServer: e.target.value }))} placeholder="http://207.232.37.250:473" dir="ltr" style={inp} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>API Key</label>
                      <input value={form.jellyfinApiKey || ""} onChange={e => setForm(p => ({ ...p, jellyfinApiKey: e.target.value }))} placeholder="336fae209e67441a927472812b3d6000" dir="ltr" style={inp} />
                    </div>
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={generateAI} disabled={aiLoading} style={{ flex: 1, background: "#34c759", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {aiLoading ? <Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> : "AI תיאור"}
                  </button>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: "#0071e3", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {saving ? <Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> : editingMovie ? "עדכן" : "שמור"}
                  </button>
                </div>
                {editingMovie && (
                  <button onClick={resetForm} style={{ width: "100%", marginTop: 8, background: "#F0F0F5", color: "#6e6e73", border: "1.5px solid #d2d2d7", borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>ביטול עריכה</button>
                )}
                {formStatus.message && (
                  <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: formStatus.type === "success" ? "#f0fff4" : "#fff5f5", color: formStatus.type === "success" ? "#1a7a3a" : "#ff3b30" }}>
                    {formStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}
          {adminTab === "manage" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0F0F5", borderRadius: 12, padding: "9px 12px", marginBottom: 14, border: "1.5px solid #d2d2d7" }}>
                <Search size={15} color="#aaa" />
                <input value={manageQ} onChange={e => setManageQ(e.target.value)} placeholder="חפש סדרה או סרט..." style={{ background: "none", border: "none", outline: "none", flex: 1, fontSize: 13, fontFamily: "inherit" }} />
                {manageQ && <span onClick={() => setManageQ("")} style={{ cursor: "pointer", color: "#aaa", fontSize: 16 }}>✕</span>}
              </div>
              <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 10 }}>תכנים ({movies.length})</div>
              {existingSeriesNames.filter(n => n.toLowerCase().includes(manageQ.toLowerCase())).length > 0 && (
                <div style={{ marginBottom: 12, background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", background: "#e8f0fe", fontSize: 13, fontWeight: 800, color: "#0071e3" }}>סדרות</div>
                  {existingSeriesNames.filter(n => n.toLowerCase().includes(manageQ.toLowerCase())).map(serName => (
                    <AdminSeriesSection key={serName} serName={serName} episodes={seriesMap[serName].episodes} onEdit={startEdit} onDelete={handleDelete} deleting={deleting} />
                  ))}
                </div>
              )}
              {movies.filter(m => !m.series_name && (m.title || "").toLowerCase().includes(manageQ.toLowerCase())).length > 0 && (
                <AdminCategorySection catName="סרטים" items={movies.filter(m => !m.series_name && (m.title || "").toLowerCase().includes(manageQ.toLowerCase()))} onEdit={startEdit} onDelete={handleDelete} deleting={deleting} />
              )}
            </div>
          )}
          {adminTab === "categories" && (
            <div style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>ניהול קטגוריות</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="קטגוריה חדשה..."
                  onKeyDown={e => { if (e.key === "Enter" && newCat.trim()) { saveCats([...categories, newCat.trim()]); setNewCat(""); } }}
                  style={{ ...inp, flex: 1 }} />
                <button onClick={() => { if (newCat.trim()) { saveCats([...categories, newCat.trim()]); setNewCat(""); } }} style={{ background: "#0071e3", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>הוסף</button>
              </div>
              {categories.length === 0 && <p style={{ color: "#6e6e73", fontSize: 13, textAlign: "center" }}>אין קטגוריות עדיין</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {categories.map((cat, i) => (
                  <div key={i} style={{ background: "#F5F5F7", borderRadius: 10, padding: "10px 14px" }}>
                    {editingCat === cat ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input value={editingCatVal} onChange={e => setEditingCatVal(e.target.value)} autoFocus onKeyDown={e => { if (e.key === "Enter") renameCat(cat, editingCatVal); if (e.key === "Escape") setEditingCat(null); }} style={{ ...inp, flex: 1, padding: "6px 10px" }} />
                        <button onClick={() => renameCat(cat, editingCatVal)} style={{ background: "#34c759", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>שמור</button>
                        <button onClick={() => setEditingCat(null)} style={{ background: "#F0F0F5", color: "#6e6e73", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>ביטול</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{cat}</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setEditingCat(cat); setEditingCatVal(cat); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✏️</button>
                          <button onClick={() => saveCats(categories.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: 20 }}>x</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {adminTab === "settings" && (
            <div>
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>הגדרות</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>
                    TMDB API Key <span style={{ color: tmdbKey ? "#34c759" : "#ff3b30", fontWeight: 400 }}>{tmdbKey ? "מוגדר" : "לא מוגדר"}</span>
                  </label>
                  <input type="password" value={tmdbKey} onChange={e => setTmdbKey(e.target.value)} placeholder="32 תווים..." dir="ltr" style={inp} />
                </div>
                <button onClick={() => { try { localStorage.setItem("zovex_tmdb_key", tmdbKey); } catch {} setFormStatus({ type: "success", message: "נשמר!" }); setTimeout(() => setFormStatus({ type: "", message: "" }), 2000); }} style={{ width: "100%", background: "#0071e3", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>שמור מפתח</button>
                {formStatus.message && <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#f0fff4", color: "#1a7a3a" }}>{formStatus.message}</div>}
              </div>
              <KalturaRefreshPanel movies={movies} cardStyle={cardStyle} dot={dot} MovieEntity={Movie} />
              <BulkImportPanel loadMovies={loadMovies} cardStyle={cardStyle} inp={inp} dot={dot} MovieEntity={Movie} />
              <MergeSeriesPanel movies={movies} loadMovies={loadMovies} cardStyle={cardStyle} inp={inp} dot={dot} MovieEntity={Movie} />
              <FindByTypePanel movies={movies} cardStyle={cardStyle} inp={inp} dot={dot} onEdit={startEdit} />
              <SeriesCategoryPanel movies={movies} categories={categories} saveCats={saveCats} loadMovies={loadMovies} cardStyle={cardStyle} inp={inp} dot={dot} MovieEntity={Movie} />
              <ExportContentPanel movies={movies} cardStyle={cardStyle} dot={dot} inp={inp} />
            </div>
          )}
        </div>
      </div>
    );
  }
 
  if (playerMovie) return (
    <CustomVideoPlayer movie={playerMovie} onClose={() => setPlayerMovie(null)} />
  );
 
  if (selectedSeries) {
    const series = seriesMap[selectedSeries];
    const episodes = series?.episodes || [];
    const seasonNums = [...new Set(episodes.map(e => e.season_number || 1))].sort((a, b) => a - b);
    const activeSeason = openSeasons._active !== undefined ? openSeasons._active : seasonNums[0];
    const activeEps = episodes.filter(e => (e.season_number || 1) === activeSeason).sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    return (
      <div style={{ background: "#fff", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", color: "#111" }}>
        <style>{spinnerStyle}</style>
        <button onClick={() => { setSelectedSeries(null); setOpenSeasons({}); }} style={{ position: "fixed", top: 15, right: 15, zIndex: 100, background: "rgba(0,0,0,.7)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowRight size={22} />
        </button>
        <div style={{ position: "relative" }}>
          {series?.thumbnail_url && <img src={series.thumbnail_url} alt="" style={{ width: "100%", height: "55vw", maxHeight: 380, objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 130, background: "linear-gradient(transparent,#fff)" }} />
        </div>
        <div style={{ padding: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px", color: "#111" }}>{selectedSeries}</h1>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {series?.category && <span style={{ background: "#e50914", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold" }}>{series.category}</span>}
            <span style={{ background: "#f0f0f0", color: "#555", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>{episodes.length} פרקים</span>
            <span style={{ background: "#f0f0f0", color: "#555", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>{seasonNums.length} עונות</span>
          </div>
          {series?.description && (
            <div style={{ margin: "0 0 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 6 }}>תיאור הסדרה 🎬:</div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#444", margin: 0 }}>{series.description}</p>
            </div>
          )}
          <div style={{ position: "relative", marginBottom: 18 }}>
            <button onClick={() => setShowSeasonMenu(s => !s)} style={{ display: "flex", alignItems: "center", gap: 10, background: "#111", color: "#fff", border: "none", borderRadius: 10, padding: "12px 18px", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", minWidth: 160 }}>
              <span>עונה {activeSeason}</span>
              <ChevronDown size={18} color="#fff" />
            </button>
            {showSeasonMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,.18)", zIndex: 50, minWidth: 160, overflow: "hidden", border: "1px solid #eee" }}>
                {seasonNums.map(s => (
                  <div key={s} onClick={() => { setOpenSeasons(p => ({ ...p, _active: s })); setShowSeasonMenu(false); }} style={{ padding: "14px 18px", fontSize: 15, fontWeight: s === activeSeason ? 900 : 500, color: s === activeSeason ? "#e50914" : "#111", cursor: "pointer", background: s === activeSeason ? "#fff5f5" : "#fff", borderBottom: "1px solid #f5f5f5" }}>
                    עונה {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeEps.map((ep, i) => (
              <div key={ep.id} onClick={() => setPlayerMovie(ep)} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #eee", cursor: "pointer", alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "#e50914", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Play size={18} fill="white" color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>פרק {ep.episode_number || i + 1}{ep.episode_title ? " - " + ep.episode_title : ""}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{ep.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
 
  if (selectedMovie) return (
    <div style={{ background: "#111", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", color: "#fff" }}>
      <button onClick={() => setSelectedMovie(null)} style={{ position: "fixed", top: 15, right: 15, zIndex: 100, background: "rgba(0,0,0,.7)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <ArrowRight size={22} />
      </button>
      <div style={{ position: "relative" }}>
        {selectedMovie.thumbnail_url && <img src={selectedMovie.thumbnail_url} alt="" style={{ width: "100%", height: "55vw", maxHeight: 380, objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 130, background: "linear-gradient(transparent,#111)" }} />
      </div>
      <div style={{ padding: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>{selectedMovie.title}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {selectedMovie.category && <span style={{ background: "#e50914", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold" }}>{selectedMovie.category}</span>}
          {selectedMovie.year && <span style={{ background: "#222", color: "#888", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>{selectedMovie.year}</span>}
        </div>
        {selectedMovie.description && (
            <div style={{ margin: "0 0 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 6 }}>תיאור הסרט 🎬:</div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#bbb", margin: 0 }}>{selectedMovie.description}</p>
            </div>
          )}
        <button onClick={() => setPlayerMovie(selectedMovie)} style={{ width: "100%", background: "#e50914", color: "#fff", border: "none", padding: 16, fontSize: 17, fontWeight: "bold", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
          <Play fill="white" size={20} /> לצפייה עכשיו
        </button>
        {(() => {
          const baseName = (selectedMovie.title || "").replace(/\s*\d+$/, "").trim();
          const sequels = movies.filter(m =>
            !m.series_name &&
            m.id !== selectedMovie.id &&
            (m.title || "").replace(/\s*\d+$/, "").trim() === baseName
          ).sort((a, b) => (a.year || 0) - (b.year || 0));
          if (sequels.length === 0) return null;
          return (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 12 }}>סרטי המשך</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sequels.map(s => (
                  <div key={s.id} onClick={() => setSelectedMovie(s)} style={{ display: "flex", gap: 12, alignItems: "center", background: "#1a1a1a", borderRadius: 12, padding: 10, cursor: "pointer", border: "1px solid #2a2a2a" }}>
                    {s.thumbnail_url ? <img src={s.thumbnail_url} style={{ width: 48, height: 68, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" onError={e => e.target.style.display="none"} /> : <div style={{ width: 48, height: 68, borderRadius: 8, background: "#333", flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.title}</div>
                      {s.year && <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{s.year}</div>}
                    </div>
                    <Play size={18} fill="#e50914" color="#e50914" />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
 
  return (
    <div style={{ background: "#fff", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif" }}>
      <style>{spinnerStyle}</style>
      <header style={{ padding: "14px 14px 0", position: "sticky", top: 0, background: "#fff", zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>
        <div style={{ overflow: "hidden", maxHeight: showCategories ? 60 : 0, opacity: showCategories ? 1 : 0, transition: "max-height 0.3s ease, opacity 0.3s ease", marginBottom: showCategories ? 12 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ color: "#e50914", fontSize: 26, fontWeight: 900, margin: 0, flexShrink: 0 }}>ZOVEX</h1>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", padding: "9px 14px", borderRadius: 50, border: "1px solid #eee" }}>
              <Search size={16} color="#aaa" />
              <input type="text" placeholder="חפש סרט או סדרה..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: 15, color: "#333" }} />
              {searchTerm && <span onClick={() => setSearchTerm("")} style={{ cursor: "pointer", color: "#aaa", fontSize: 18 }}>x</span>}
            </div>
          </div>
        </div>
        <div style={{ overflow: "hidden", maxHeight: showCategories ? 200 : 0, opacity: showCategories ? 1 : 0, transition: "max-height 0.3s ease, opacity 0.3s ease" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 11 }}>
            {allCategories.map(cat => (
              <span key={cat} onClick={() => setSelectedCategory(cat)} style={{
                cursor: "pointer", fontSize: 13, fontWeight: 700,
                color: selectedCategory === cat ? "#fff" : "#444",
                background: selectedCategory === cat ? "#e50914" : "#f0f0f0",
                border: selectedCategory === cat ? "none" : "1px solid #ddd",
                borderRadius: 50, padding: "6px 16px", flexShrink: 0,
                boxShadow: selectedCategory === cat ? "0 2px 10px rgba(229,9,20,.35)" : "0 1px 4px rgba(0,0,0,.07)",
                transition: "all .2s",
              }}>
                {cat}
              </span>
            ))}
          </div>
        </div>
      </header>
      <main style={{ padding: "18px 14px 100px" }}>
        {allItems.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}><p style={{ fontSize: 18 }}>לא נמצאו תוצאות</p></div>
          : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {allItems.map((item) => {
                const isSer = !!item.episodes;
                const title = isSer ? item.name : item.title;
                const thumb = item.thumbnail_url;
                return (
                  <div key={isSer ? "s-" + item.name : item.id} onClick={() => isSer ? setSelectedSeries(item.name) : setSelectedMovie(item)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "2/3", boxShadow: "0 4px 12px rgba(0,0,0,.12)", background: "#e8e8e8", position: "relative" }}>
                      {thumb ? <img src={thumb} alt={title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>?</div>}
                      {isSer && <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.65)", borderRadius: 8, padding: "3px 8px", fontSize: 10, color: "#fff", fontWeight: 700 }}>סדרה</div>}
                    </div>
                    <h3 style={{ fontSize: 13, fontWeight: "bold", textAlign: "center", margin: 0, color: "#111", lineHeight: 1.3 }}>{title}</h3>
                  </div>
                );
              })}
            </div>
          )
        }
      </main>
      <div style={{ position: "fixed", bottom: 24, left: 16, zIndex: 1000, display: "flex", alignItems: "flex-end", gap: 10 }}>
        {/* Speech bubble */}
        <div style={{ background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 4px 18px rgba(0,0,0,.13)", border: "1px solid #eee", maxWidth: 170, direction: "rtl" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#111", fontFamily: "Arial, sans-serif", marginBottom: 2 }}>רוצה להוסיף סרט? 🎬</div>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "Arial, sans-serif", lineHeight: 1.4 }}>יש בעיה באתר?<br/>דברו איתנו בטלגרם</div>
          {/* bubble tail */}
          <div style={{ position: "absolute", bottom: -8, left: 14, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #fff", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.08))" }} />
        </div>
        {/* Telegram button */}
        <a href="https://t.me/ZOVE8" target="_blank" rel="noreferrer" style={{ background: "#24A1DE", width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 15px rgba(36,161,222,.5)", textDecoration: "none", flexShrink: 0 }}>
          <Send size={22} fill="white" />
        </a>
      </div>
    </div>
  );
}
 
 
function AdminBrowseTab({ movies, seriesMap, existingSeriesNames, categories, onEdit }) {
  const [browsecat, setBrowsecat] = useState("הכל");
  const [openAdminSeries, setOpenAdminSeries] = useState(null);
  const [openAdminSeason, setOpenAdminSeason] = useState({});
  const [showAdminSeasonMenu, setShowAdminSeasonMenu] = useState(false);
 
  const allCats = ["הכל", ...new Set([...categories, ...movies.map(m => m.category).filter(Boolean)])];
 
  // series visible in this category
  const visibleSeries = existingSeriesNames.filter(name => {
    if (browsecat === "הכל") return true;
    return seriesMap[name]?.category === browsecat;
  });
 
  // standalone movies visible in this category
  const visibleMovies = movies.filter(m => {
    if (m.series_name) return false;
    return browsecat === "הכל" || m.category === browsecat;
  });
 
  if (openAdminSeries) {
    const series = seriesMap[openAdminSeries];
    const episodes = series?.episodes || [];
    const seasonNums = [...new Set(episodes.map(e => e.season_number || 1))].sort((a, b) => a - b);
    const activeSeason = openAdminSeason[openAdminSeries] ?? seasonNums[0];
    const activeEps = episodes.filter(e => (e.season_number || 1) === activeSeason).sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
 
    return (
      <div>
        <button onClick={() => setOpenAdminSeries(null)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 12, padding: "9px 14px", marginBottom: 14, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#6e6e73" }}>
          <ArrowRight size={15} /> חזור
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {series?.thumbnail_url && <img src={series.thumbnail_url} style={{ width: 44, height: 62, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" />}
          <div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{openAdminSeries}</div>
            <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 2 }}>{episodes.length} פרקים · {seasonNums.length} עונות</div>
          </div>
        </div>
        {/* Season selector */}
        {seasonNums.length > 1 && (
          <div style={{ position: "relative", marginBottom: 14 }}>
            <button onClick={() => setShowAdminSeasonMenu(s => !s)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#111", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
              עונה {activeSeason} <ChevronDown size={15} color="#fff" />
            </button>
            {showAdminSeasonMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,.18)", zIndex: 50, minWidth: 140, overflow: "hidden", border: "1px solid #eee" }}>
                {seasonNums.map(s => (
                  <div key={s} onClick={() => { setOpenAdminSeason(p => ({ ...p, [openAdminSeries]: s })); setShowAdminSeasonMenu(false); }} style={{ padding: "12px 16px", fontSize: 14, fontWeight: s === activeSeason ? 900 : 500, color: s === activeSeason ? "#e50914" : "#111", cursor: "pointer", background: s === activeSeason ? "#fff5f5" : "#fff", borderBottom: "1px solid #f5f5f5" }}>
                    עונה {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeEps.map((ep, i) => (
            <div key={ep.id} onClick={() => onEdit(ep)} style={{ display: "flex", gap: 12, padding: 12, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", cursor: "pointer", alignItems: "center", border: "1.5px solid #f0f0f0" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#0071e3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 900, color: "#fff" }}>
                {ep.episode_number || i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  פרק {ep.episode_number || i + 1}{ep.episode_title ? " - " + ep.episode_title : ""}
                </div>
                <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.title}</div>
              </div>
              <div style={{ fontSize: 11, color: "#0071e3", fontWeight: 700, flexShrink: 0 }}>✏️ ערוך</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
 
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {allCats.map(cat => (
          <button key={cat} onClick={() => setBrowsecat(cat)} style={{ background: browsecat === cat ? "#0071e3" : "#fff", border: "1.5px solid", borderColor: browsecat === cat ? "#0071e3" : "#d2d2d7", color: browsecat === cat ? "#fff" : "#6e6e73", borderRadius: 20, padding: "5px 13px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>{cat}</button>
        ))}
      </div>
      {visibleSeries.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0071e3", marginBottom: 10, padding: "6px 10px", background: "#e8f0fe", borderRadius: 8 }}>סדרות ({visibleSeries.length})</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {visibleSeries.map(name => {
              const s = seriesMap[name];
              return (
                <div key={name} onClick={() => { setOpenAdminSeries(name); setShowAdminSeasonMenu(false); }} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "2/3", background: "#d0d0d0", cursor: "pointer" }}>
                  {s?.thumbnail_url && <img src={s.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%,rgba(0,0,0,.85))" }} />
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,113,227,.85)", borderRadius: 6, padding: "2px 7px", fontSize: 9, color: "#fff", fontWeight: 700 }}>סדרה</div>
                  <div style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{s?.episodes?.length || 0} פרקים</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {visibleMovies.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#6e6e73", marginBottom: 10, padding: "6px 10px", background: "#F5F5F7", borderRadius: 8 }}>סרטים ({visibleMovies.length})</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {visibleMovies.map(movie => (
              <div key={movie.id} onClick={() => onEdit(movie)} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "2/3", background: "#d0d0d0", cursor: "pointer" }}>
                {movie.thumbnail_url && <img src={movie.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%,rgba(0,0,0,.85))" }} />
                <div style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{movie.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{movie.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {visibleSeries.length === 0 && visibleMovies.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: 13 }}>אין תכנים בקטגוריה זו</div>
      )}
    </div>
  );
}
 
function KalturaRefreshPanel({ movies, cardStyle, dot, MovieEntity }) {
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState("");
  const [kalturaCount, setKalturaCount] = useState(null);
 
  useEffect(() => {
    MovieEntity.list("-created_date", 500).then(allMovies => {
      const count = allMovies.filter(m => m.type === "kaltura" || (m.video_id || "").includes("kaltura.com") || (m.type === "direct" && (m.video_id || "").includes("kaltura"))).length;
      setKalturaCount(count);
    });
  }, []);
 
  const handleRefresh = async () => {
    setRefreshing(true);
    setStatus("טוען רשימת קישורים...");
    const allMovies = await MovieEntity.list("-created_date", 500);
    const kalturaMovies = allMovies.filter(m => m.type === "kaltura" || (m.video_id || "").includes("kaltura.com"));
    if (kalturaMovies.length === 0) { setStatus("אין קישורי Kaltura לרענן"); setRefreshing(false); setTimeout(() => setStatus(""), 3000); return; }
    setStatus(`מרענן ${kalturaMovies.length} קישורים...`);
    let done = 0;
    for (const m of kalturaMovies) {
      try {
        const { id, created_date, updated_date, created_by, ...data } = m;
        await MovieEntity.delete(id);
        await MovieEntity.create(data);
        done++;
      } catch {}
    }
    setStatus(`✅ רועננו ${done} קישורי Kaltura!`);
    setRefreshing(false);
    setTimeout(() => setStatus(""), 4000);
  };
 
  return (
    <div style={{ ...cardStyle, border: "2px solid #e50914" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", color: "#e50914" }}>
        {dot} רענון קישורי Kaltura
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 14, lineHeight: 1.7 }}>
        מרענן את כל הקישורים כדי שלא יפגו. יש כרגע <strong>{kalturaCount ?? "..."}</strong> קישורי Kaltura.<br/>
        <span style={{ color: "#aaa" }}>הרענון האוטומטי קורה כל 3 דקות ברקע.</span>
      </div>
      <button onClick={handleRefresh} disabled={refreshing} style={{ width: "100%", background: refreshing ? "#aaa" : "#e50914", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: refreshing ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {refreshing ? <><Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> מרענן...</> : "🔄 רענן קישורים עכשיו"}
      </button>
      {status && !refreshing && (
        <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#f0fff4", color: "#1a7a3a" }}>{status}</div>
      )}
    </div>
  );
}
 
function BulkImportPanel({ loadMovies, cardStyle, inp, dot, MovieEntity }) {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileRef = React.useRef(null);
 
  const COLUMNS = ["title", "video_url", "category", "series_name", "season_number", "episode_number", "thumbnail_url", "description", "year"];
 
  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    return lines.slice(1).map(line => {
      // Handle quoted commas
      const cols = [];
      let cur = "", inQ = false;
      for (let c of line) {
        if (c === '"') inQ = !inQ;
        else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ""; }
        else cur += c;
      }
      cols.push(cur.trim());
      const row = {};
      headers.forEach((h, i) => { row[h] = (cols[i] || "").replace(/^"|"$/g, "").trim(); });
      return row;
    }).filter(r => r.title || r.video_url);
  };
 
  const handleText = (text) => {
    setCsvText(text);
    const rows = parseCSV(text);
    setPreview(rows.slice(0, 5));
    setStatus({ type: "", message: "" });
  };
 
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleText(ev.target.result);
    reader.readAsText(file, "UTF-8");
  };
 
  const handleImport = async () => {
    const rows = parseCSV(csvText);
    if (!rows.length) { setStatus({ type: "error", message: "אין שורות לייבוא" }); return; }
    setImporting(true);
    let done = 0, failed = 0;
    for (const row of rows) {
      const info = row.video_url ? extractVideoInfo(row.video_url) : { type: "direct", video_id: "" };
      const payload = {
        title: row.title || "",
        video_id: info.video_id,
        video_url: row.video_url || "",
        type: info.type,
        category: row.category || "",
        series_name: row.series_name || null,
        season_number: row.season_number ? Number(row.season_number) : null,
        episode_number: row.episode_number ? Number(row.episode_number) : null,
        thumbnail_url: row.thumbnail_url || null,
        description: row.description || null,
        year: row.year ? Number(row.year) : null,
      };
      try { await MovieEntity.create(payload); done++; } catch { failed++; }
    }
    setStatus({ type: "success", message: `✅ יובאו ${done} רשומות${failed ? ` · ${failed} נכשלו` : ""}` });
    setImporting(false);
    loadMovies();
    setCsvText(""); setPreview([]);
    setTimeout(() => setStatus({ type: "", message: "" }), 5000);
  };
 
  return (
    <div style={{ ...cardStyle, border: "2px solid #5e5ce6" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", color: "#5e5ce6" }}>
        {dot} ייבוא bulk מ-CSV
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 12, lineHeight: 1.6 }}>
        העלה קובץ CSV או הדבק טקסט.<br/>
        עמודות נתמכות: <span style={{ fontFamily: "monospace", fontSize: 10 }}>title, video_url, category, series_name, season_number, episode_number, thumbnail_url, description, year</span>
      </div>
      <button onClick={() => fileRef.current?.click()} style={{ width: "100%", background: "#5e5ce6", color: "#fff", border: "none", borderRadius: 12, padding: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
        📂 העלה קובץ CSV
      </button>
      <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleFile} />
      <textarea
        value={csvText}
        onChange={e => handleText(e.target.value)}
        placeholder={"title,video_url,category,series_name,season_number,episode_number\nאווטאר פרק 1,https://drive.google.com/...,סדרות ילדים,אווטאר,1,1"}
        rows={5}
        style={{ ...inp, resize: "none", minHeight: 90, fontFamily: "monospace", fontSize: 11, direction: "ltr" }}
      />
      {preview.length > 0 && (
        <div style={{ marginTop: 10, background: "#f5f5f7", borderRadius: 10, padding: 10, fontSize: 11, color: "#333" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>תצוגה מקדימה ({preview.length} שורות ראשונות):</div>
          {preview.map((r, i) => (
            <div key={i} style={{ padding: "5px 0", borderBottom: "1px solid #e8e8e8", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700 }}>{r.title}</span>
              {r.series_name && <span style={{ color: "#0071e3" }}>📺 {r.series_name} ע{r.season_number} פ{r.episode_number}</span>}
              {r.category && <span style={{ background: "#e50914", color: "#fff", borderRadius: 8, padding: "1px 7px" }}>{r.category}</span>}
            </div>
          ))}
          <div style={{ marginTop: 6, color: "#6e6e73" }}>סה"כ {parseCSV(csvText).length} שורות לייבוא</div>
        </div>
      )}
      {preview.length > 0 && (
        <button onClick={handleImport} disabled={importing} style={{ width: "100%", background: importing ? "#aaa" : "#5e5ce6", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: importing ? "default" : "pointer", fontFamily: "inherit", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {importing ? <><Loader2 size={14} style={{ animation: "spin .6s linear infinite" }} /> מייבא...</> : `🚀 ייבא ${parseCSV(csvText).length} רשומות`}
        </button>
      )}
      {status.message && (
        <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: status.type === "success" ? "#f0fff4" : "#fff5f5", color: status.type === "success" ? "#1a7a3a" : "#ff3b30" }}>
          {status.message}
        </div>
      )}
    </div>
  );
}
 
function MergeSeriesPanel({ movies, loadMovies, cardStyle, inp, dot, MovieEntity }) {
  const [merging, setMerging] = useState(false);
  const [mergeStatus, setMergeStatus] = useState({ type: "", message: "" });
  const [sourceSeries, setSourceSeries] = useState("");
  const [targetSeries, setTargetSeries] = useState("");
  const [targetSeason, setTargetSeason] = useState("2");
 
  const seriesNames = [...new Set(movies.filter(m => m.series_name).map(m => m.series_name))].sort();
 
  const handleMerge = async () => {
    if (!sourceSeries || !targetSeries) { setMergeStatus({ type: "error", message: "בחר סדרת מקור ויעד" }); return; }
    if (sourceSeries === targetSeries) { setMergeStatus({ type: "error", message: "מקור ויעד זהים" }); return; }
    const toMerge = movies.filter(m => m.series_name === sourceSeries);
    if (!window.confirm(`למזג ${toMerge.length} פרקים מ"${sourceSeries}" לעונה ${targetSeason} של "${targetSeries}"?`)) return;
    setMerging(true);
    let done = 0;
    for (const ep of toMerge) {
      try {
        await MovieEntity.update(ep.id, { series_name: targetSeries, season_number: Number(targetSeason) });
        done++;
      } catch {}
    }
    setMergeStatus({ type: "success", message: `עודכנו ${done} פרקים בהצלחה!` });
    setMerging(false);
    loadMovies();
    setTimeout(() => setMergeStatus({ type: "", message: "" }), 4000);
  };
 
  return (
    <div style={{ ...cardStyle, border: "2px solid #ff9500" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", color: "#ff9500" }}>
        {dot} מיזוג סדרות
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 12 }}>העבר כל פרקי סדרה אחת לתוך עונה של סדרה אחרת</div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>סדרת מקור (שתועבר)</label>
        <select value={sourceSeries} onChange={e => setSourceSeries(e.target.value)} style={inp}>
          <option value="">בחר סדרה...</option>
          {seriesNames.map(n => <option key={n} value={n}>{n} ({movies.filter(m => m.series_name === n).length} פרקים)</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>סדרת יעד (שתקלוט)</label>
        <select value={targetSeries} onChange={e => setTargetSeries(e.target.value)} style={inp}>
          <option value="">בחר סדרה...</option>
          {seriesNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>עונה ביעד</label>
        <input type="number" min="1" value={targetSeason} onChange={e => setTargetSeason(e.target.value)} style={inp} />
      </div>
      <button onClick={handleMerge} disabled={merging} style={{ width: "100%", background: "#ff9500", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: merging ? 0.6 : 1 }}>
        {merging ? "ממזג..." : "מזג סדרות"}
      </button>
      {mergeStatus.message && (
        <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: mergeStatus.type === "success" ? "#f0fff4" : "#fff5f5", color: mergeStatus.type === "success" ? "#1a7a3a" : "#ff3b30" }}>
          {mergeStatus.message}
        </div>
      )}
    </div>
  );
}
 
function AdminSeriesSection({ serName, episodes, onEdit, onDelete, deleting }) {
  const [open, setOpen] = useState(false);
  const sorted = [...episodes].sort((a, b) => (a.season_number || 1) - (b.season_number || 1) || (a.episode_number || 0) - (b.episode_number || 0));
  return (
    <div style={{ borderTop: "1px solid #F5F5F7" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{serName} <span style={{ color: "#6e6e73", fontWeight: 400, fontSize: 11 }}>({episodes.length} פרקים)</span></span>
        {open ? <ChevronUp size={15} color="#6e6e73" /> : <ChevronDown size={15} color="#6e6e73" />}
      </button>
      {open && sorted.map(ep => (
        <div key={ep.id} style={{ display: "flex", gap: 10, padding: "10px 16px", alignItems: "center", borderTop: "1px solid #F5F5F7", background: "#fafafa" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>ע{ep.season_number || 1} פ{ep.episode_number || "?"}{ep.episode_title ? " - " + ep.episode_title : ""}</div>
            <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 1 }}>{ep.title}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => onEdit(ep)} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14 }}>✏️</button>
            <button onClick={() => onDelete(ep.id)} disabled={deleting === ep.id} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14 }}>
              {deleting === ep.id ? <Loader2 size={13} style={{ animation: "spin .6s linear infinite" }} /> : "🗑️"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
 
function AdminCategorySection({ catName, items, onEdit, onDelete, deleting }) {
  const [open, setOpen] = useState(true);
  const sp = `@keyframes spin { to { transform: rotate(360deg); } }`;
  return (
    <div style={{ marginBottom: 12, background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
      <style>{sp}</style>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F0F0F5", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{catName} <span style={{ color: "#6e6e73", fontWeight: 400, fontSize: 12 }}>({items.length})</span></span>
        {open ? <ChevronUp size={16} color="#6e6e73" /> : <ChevronDown size={16} color="#6e6e73" />}
      </button>
      {open && items.map(item => (
        <div key={item.id} style={{ display: "flex", gap: 10, padding: 12, alignItems: "center", borderTop: "1px solid #F5F5F7" }}>
          {item.thumbnail_url ? <img src={item.thumbnail_url} style={{ width: 36, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" onError={e => e.target.style.display = "none"} /> : <div style={{ width: 36, height: 52, borderRadius: 8, background: "#F0F0F5", flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
            <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 2 }}>{item.year || ""} {item.type || ""}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => onEdit(item)} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14 }}>✏️</button>
            <button onClick={() => onDelete(item.id)} disabled={deleting === item.id} style={{ background: "#F0F0F5", border: "1.5px solid #d2d2d7", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 14 }}>
              {deleting === item.id ? <Loader2 size={13} style={{ animation: "spin .6s linear infinite" }} /> : "🗑️"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
 
function FindByTypePanel({ movies, cardStyle, inp, dot, onEdit }) {
  const [selectedSeries, setSelectedSeries] = useState("הכל");
  const [selectedType, setSelectedType] = useState("drive");
 
  const seriesNames = [...new Set(movies.filter(m => m.series_name).map(m => m.series_name))].sort();
 
  const typeLabels = {
    drive: "Google Drive 🔴",
    youtube: "YouTube",
    dailymotion: "Dailymotion",
    rumble: "Rumble",
    vimeo: "Vimeo",
    streamable: "Streamable",
    archive: "Archive.org",
    kan: "כאן",
    okru: "OK.ru",
    direct: "קישור ישיר",
  };
 
  const results = movies.filter(m => {
    const typeMatch = m.type === selectedType;
    const seriesMatch = selectedSeries === "הכל" || m.series_name === selectedSeries;
    return typeMatch && seriesMatch;
  }).sort((a, b) => (a.season_number || 1) - (b.season_number || 1) || (a.episode_number || 0) - (b.episode_number || 0));
 
  return (
    <div style={{ ...cardStyle, border: "2px solid #ff3b30" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", color: "#ff3b30" }}>
        {dot} מצא פרקים לפי סוג קישור
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 12 }}>מצא את כל הפרקים עם סוג קישור מסוים כדי לעדכן אותם</div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>סדרה</label>
        <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)} style={inp}>
          <option value="הכל">כל הסדרות והסרטים</option>
          {seriesNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 5, fontWeight: 700 }}>סוג קישור</label>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={inp}>
          {Object.entries(typeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
      <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 10 }}>
        נמצאו <strong>{results.length}</strong> פרקים
      </div>
      {results.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#aaa", fontSize: 13 }}>אין תוצאות</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 350, overflowY: "auto" }}>
          {results.map(ep => (
            <div key={ep.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff5f5", borderRadius: 10, padding: "10px 12px", border: "1px solid #ffd0d0" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ep.series_name ? `ע${ep.season_number || 1} פ${ep.episode_number || "?"} - ` : ""}{ep.title}
                </div>
                <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 2 }}>{ep.series_name || ep.category}</div>
              </div>
              <button onClick={() => onEdit(ep)} style={{ background: "#ff3b30", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "inherit" }}>
                ✏️ ערוך
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
function ExportContentPanel({ movies, cardStyle, dot }) {
  const getLink = (m) => {
    const vid = m.video_id || "";
    const type = m.type || "";
    if (type === "drive") return `https://drive.google.com/file/d/${vid}/view`;
    if (type === "youtube") return `https://www.youtube.com/watch?v=${vid}`;
    if (type === "archive") return `https://archive.org/details/${vid}`;
    if (type === "vimeo") return `https://vimeo.com/${vid}`;
    if (type === "dailymotion") return `https://www.dailymotion.com/video/${vid}`;
    if (type === "streamable") return `https://streamable.com/${vid}`;
    if (type === "rumble") return `https://rumble.com/embed/${vid}`;
    return vid;
  };
 
  const handleExport = () => {
    if (!movies || movies.length === 0) { alert("אין תוכן לייצוא"); return; }
 
    const lines = [];
    lines.push("=== ייצוא תוכן מאתר ZOVEX ===");
    lines.push(`תאריך: ${new Date().toLocaleDateString("he-IL")}`);
    lines.push(`סה"כ תכנים: ${movies.length}`);
    lines.push("");
 
    const cats = [...new Set(movies.map(m => m.category).filter(Boolean))].sort();
 
    for (const cat of cats) {
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`📂 קטגוריה: ${cat}`);
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      lines.push("");
 
      // סדרות
      const seriesNames = [...new Set(movies.filter(m => m.series_name && m.category === cat).map(m => m.series_name))].sort();
      for (const serName of seriesNames) {
        lines.push(`📺 סדרה: ${serName}`);
        const episodes = movies.filter(m => m.series_name === serName);
        const seasons = [...new Set(episodes.map(e => e.season_number || 1))].sort((a, b) => a - b);
        for (const season of seasons) {
          lines.push(`  עונה ${season}:`);
          const eps = episodes
            .filter(e => (e.season_number || 1) === season)
            .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
          for (const ep of eps) {
            const epName = ep.episode_title || ep.title || "";
            lines.push(`    פרק ${ep.episode_number || "?"} — ${epName}`);
            lines.push(`    🔗 ${getLink(ep)}`);
          }
        }
        lines.push("");
      }
 
      // סרטים עצמאיים
      const standalones = movies
        .filter(m => !m.series_name && m.category === cat)
        .sort((a, b) => (a.title || "").localeCompare(b.title || "", "he"));
      for (const movie of standalones) {
        lines.push(`🎬 ${movie.title}${movie.year ? ` (${movie.year})` : ""}`);
        lines.push(`   🔗 ${getLink(movie)}`);
        lines.push("");
      }
    }
 
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`סה"כ: ${movies.length} תכנים`);
 
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zovex_content_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };
 
  return (
    <div style={{ ...cardStyle, border: "2px solid #30d158" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", color: "#30d158" }}>
        {dot} ייצוא כל התוכן לקובץ
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 14, lineHeight: 1.7 }}>
        מוריד קובץ טקסט מסודר עם כל הסדרות, פרקים, סרטים וקישורים — מחולק לפי קטגוריות ועונות.
      </div>
      <button
        onClick={handleExport}
        style={{ width: "100%", background: "#30d158", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
      >
        📥 הורד קובץ קישורים
      </button>
      <div style={{ marginTop: 8, fontSize: 10, color: "#aaa", textAlign: "center" }}>
        {movies.length} תכנים · לא משנה כלום באתר
      </div>
    </div>
  );
}
 
function SeriesCategoryPanel({ movies, categories, saveCats, loadMovies, cardStyle, inp, dot, MovieEntity }) {
  const [openSeries, setOpenSeries] = useState(null);
  const [selectedCat, setSelectedCat] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
 
  const seriesNames = [...new Set(movies.filter(m => m.series_name).map(m => m.series_name))].sort();
 
  const handleApply = async (seriesName) => {
    const catToApply = selectedCat === "__new__" ? newCatName.trim() : selectedCat;
    if (!catToApply) { setStatus({ type: "error", message: "בחר קטגוריה" }); return; }
    setSaving(true);
    // add new category if needed
    if (selectedCat === "__new__" && !categories.includes(catToApply)) {
      saveCats([...categories, catToApply]);
    }
    const eps = movies.filter(m => m.series_name === seriesName);
    let done = 0;
    for (const ep of eps) {
      try { await MovieEntity.update(ep.id, { category: catToApply }); done++; } catch {}
    }
    setStatus({ type: "success", message: `עודכנו ${done} פרקים ל"${catToApply}"` });
    setSaving(false);
    loadMovies();
    setOpenSeries(null);
    setSelectedCat("");
    setNewCatName("");
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };
 
  return (
    <div style={{ ...cardStyle, border: "2px solid #34c759" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", color: "#34c759" }}>
        {dot} שינוי קטגוריה לסדרה שלמה
      </div>
      <div style={{ fontSize: 11, color: "#6e6e73", marginBottom: 12 }}>בחר סדרה ושנה את הקטגוריה שלה בבת אחת</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {seriesNames.map(name => {
          const currentCat = movies.find(m => m.series_name === name)?.category || "";
          const isOpen = openSeries === name;
          return (
            <div key={name} style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${isOpen ? "#34c759" : "#d2d2d7"}` }}>
              <button onClick={() => { setOpenSeries(isOpen ? null : name); setSelectedCat(""); setNewCatName(""); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: isOpen ? "#f0fff4" : "#fafafa", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 2 }}>{currentCat || "ללא קטגוריה"} · {movies.filter(m => m.series_name === name).length} פרקים</div>
                </div>
                <ChevronDown size={16} color={isOpen ? "#34c759" : "#6e6e73"} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {isOpen && (
                <div style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #e8e8e8" }}>
                  <label style={{ display: "block", fontSize: 11, color: "#6e6e73", marginBottom: 6, fontWeight: 700 }}>בחר קטגוריה</label>
                  <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...inp, marginBottom: 10 }}>
                    <option value="">בחר...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__new__">+ קטגוריה חדשה</option>
                  </select>
                  {selectedCat === "__new__" && (
                    <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="שם הקטגוריה החדשה..." style={{ ...inp, marginBottom: 10 }} />
                  )}
                  <button onClick={() => handleApply(name)} disabled={saving} style={{ width: "100%", background: "#34c759", color: "#fff", border: "none", borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>
                    {saving ? "מעדכן..." : "עדכן קטגוריה לכל הסדרה"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {status.message && (
        <div style={{ marginTop: 10, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: status.type === "success" ? "#f0fff4" : "#fff5f5", color: status.type === "success" ? "#1a7a3a" : "#ff3b30" }}>
          {status.message}
        </div>
      )}
    </div>
  );
}