import React, { useState, useMemo, useEffect } from "react";
import { Search, Send, Play, ArrowRight, X, Plus, Trash2, Film, Hash, Loader2, CheckCircle, AlertCircle, Edit2, Save } from "lucide-react";
import { Movie } from "@/entities/Movie";
import { UploadFile } from "@/integrations/Core";

const spinnerStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;
const SECRET_TRIGGER = "ZovexAdmin2026";
const PIN_CODE = "123456";
const LETTER_CODE = "ZOVIX";

const CATEGORIES = ["סרטים", "סדרות", "סרטי 2026", "מצוירים"];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [letterInput, setLetterInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState({ title: "", thumbnail_url: "", category: CATEGORIES[0], video_url: "", description: "" });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => { loadMovies(); }, []);

  const loadMovies = () => {
    Movie.list("-created_date").then(data => {
      setMovies(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (searchTerm === SECRET_TRIGGER) {
      setSearchTerm("");
      setShowAdminLogin(true);
    }
  }, [searchTerm]);

  const handleAdminLogin = () => {
    if (pinInput === PIN_CODE && letterInput === LETTER_CODE) {
      setShowAdminLogin(false);
      setShowAdmin(true);
      setPinInput(""); setLetterInput(""); setLoginError("");
    } else {
      setLoginError("קודים שגויים. נסה שוב.");
    }
  };

  const handleImageUpload = async (file, isEdit = false) => {
    if (!file) return;
    if (isEdit) setUploadingEdit(true);
    else { setUploadingNew(true); setPreviewUrl(URL.createObjectURL(file)); }
    try {
      const { file_url } = await UploadFile({ file });
      if (isEdit) setEditData(p => ({ ...p, thumbnail_url: file_url }));
      else setFormData(p => ({ ...p, thumbnail_url: file_url }));
    } catch { setFormStatus({ type: "error", message: "שגיאה בהעלאת תמונה" }); }
    if (isEdit) setUploadingEdit(false);
    else setUploadingNew(false);
  };

  const handleAddMovie = async () => {
    if (!formData.title || !formData.thumbnail_url || !formData.category) {
      setFormStatus({ type: "error", message: "חובה למלא שם, קטגוריה ותמונה" });
      return;
    }
    setAdding(true);
    try {
      await Movie.create(formData);
      setFormData({ title: "", thumbnail_url: "", category: CATEGORIES[0], video_url: "", description: "" });
      setPreviewUrl("");
      setFormStatus({ type: "success", message: "הסרט נוסף בהצלחה!" });
      loadMovies();
    } catch { setFormStatus({ type: "error", message: "שגיאה בהוספת הסרט" }); }
    setAdding(false);
    setTimeout(() => setFormStatus({ type: "", message: "" }), 3000);
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm("בטוח שברצונך למחוק?")) return;
    setDeleting(id);
    try { await Movie.delete(id); loadMovies(); } catch {}
    setDeleting(null);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await Movie.update(editingMovie.id, editData);
      setEditingMovie(null);
      loadMovies();
    } catch {}
    setSaving(false);
  };

  const categories = useMemo(() => {
    if (!movies.length) return ["הכל"];
    return ["הכל", ...new Set(movies.map(m => m.category).filter(Boolean))];
  }, [movies]);

  const moviesByCategory = useMemo(() => {
    const grouped = {};
    movies.forEach(movie => {
      const cat = movie.category || "אחר";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(movie);
    });
    return grouped;
  }, [movies]);

  const filteredMovies = useMemo(() => {
    if (searchTerm === SECRET_TRIGGER) return [];
    return movies.filter(movie => {
      const title = movie.title || "";
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "הכל" || movie.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [movies, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#fff" }}>
        <style>{spinnerStyle}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 50, height: 50, border: "5px solid #eee", borderTop: "5px solid #e50914", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 15px" }} />
          <p dir="rtl" style={{ color: "#999", fontFamily: "Arial" }}>טוען סרטים...</p>
        </div>
      </div>
    );
  }

  if (showAdminLogin) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#111", fontFamily: "Arial", direction: "rtl" }}>
        <div style={{ background: "#1e1e1e", padding: "40px", borderRadius: "20px", width: "320px", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
          <h2 style={{ color: "#e50914", textAlign: "center", marginBottom: "30px", fontSize: "22px" }}>🔐 כניסת מנהל</h2>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "8px" }}>קוד PIN</label>
            <input type="password" inputMode="numeric" value={pinInput} onChange={e => setPinInput(e.target.value)} placeholder="הזן קוד PIN" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#2a2a2a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "25px" }}>
            <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "8px" }}>קוד אותיות</label>
            <input type="password" value={letterInput} onChange={e => setLetterInput(e.target.value.toUpperCase())} placeholder="הזן קוד אותיות" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#2a2a2a", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
          </div>
          {loginError && <p style={{ color: "#ff4d4d", textAlign: "center", marginBottom: "15px", fontSize: "14px" }}>{loginError}</p>}
          <button onClick={handleAdminLogin} style={{ width: "100%", background: "#e50914", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>כניסה</button>
          <button onClick={() => { setShowAdminLogin(false); setPinInput(""); setLetterInput(""); setLoginError(""); }} style={{ width: "100%", background: "none", color: "#666", border: "none", padding: "10px", marginTop: "10px", cursor: "pointer", fontSize: "14px" }}>ביטול</button>
        </div>
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div style={{ background: "#f9f9f9", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", marginBottom: "30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Film size={32} color="#e50914" />
            <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#111", margin: 0 }}>ניהול תוכן - ZOVEX</h1>
          </div>
          <button onClick={() => setShowAdmin(false)} style={{ background: "#eee", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "Arial" }}>יציאה</button>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gap: "30px" }}>

          {/* טופס הוספה */}
          <section style={{ background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={20} color="#e50914" /> הוספת תוכן חדש
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>שם הסרט/סדרה</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f5f5f5", padding: "10px 15px", borderRadius: "8px", border: "1px solid #eee" }}>
                  <Film size={16} color="#aaa" />
                  <input style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: "14px" }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="לדוגמה: אופנהיימר" />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>קטגוריה</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f5f5f5", padding: "10px 15px", borderRadius: "8px", border: "1px solid #eee" }}>
                  <Hash size={16} color="#aaa" />
                  <select style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: "14px" }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "span 2" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>תמונה</label>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} style={{ fontSize: "14px" }} />
                {uploadingNew && <p style={{ color: "#aaa", fontSize: "13px" }}>מעלה תמונה...</p>}
                {previewUrl && <img src={previewUrl} style={{ width: "100px", height: "150px", objectFit: "cover", borderRadius: "8px", marginTop: "8px" }} alt="תצוגה מקדימה" />}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "span 2" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>קישור וידאו</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f5f5f5", padding: "10px 15px", borderRadius: "8px", border: "1px solid #eee" }}>
                  <Play size={16} color="#aaa" />
                  <input style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: "14px" }} value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://example.com/video.mp4" />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "span 2" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>תיאור</label>
                <textarea style={{ background: "#f5f5f5", border: "1px solid #eee", borderRadius: "8px", padding: "10px 15px", fontSize: "14px", outline: "none", resize: "vertical", minHeight: "80px", fontFamily: "Arial" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="תיאור קצר..." />
              </div>

              <button onClick={handleAddMovie} disabled={adding || uploadingNew} style={{ gridColumn: "span 2", background: "#e50914", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {adding ? <Loader2 size={20} /> : "הוסף למערכת"}
              </button>
            </div>

            {formStatus.message && (
              <div style={{ marginTop: "15px", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", background: formStatus.type === "success" ? "#e6f4ea" : "#fce8e6", color: formStatus.type === "success" ? "#1e7e34" : "#d93025" }}>
                {formStatus.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {formStatus.message}
              </div>
            )}
          </section>

          {/* רשימת סרטים לפי קטגוריות */}
          {Object.entries(moviesByCategory).map(([cat, catMovies]) => (
            <section key={cat} style={{ background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#e50914" }}>{cat} ({catMovies.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {catMovies.map(movie => (
                  <div key={movie.id}>
                    {editingMovie?.id === movie.id ? (
                      <div style={{ padding: "15px", border: "2px solid #e50914", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }} value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="שם" />
                        <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }} value={editData.category || ""} onChange={e => setEditData({ ...editData, category: e.target.value })}>
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }} value={editData.video_url || ""} onChange={e => setEditData({ ...editData, video_url: e.target.value })} placeholder="קישור וידאו" />
                        <textarea style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical", minHeight: "60px", fontFamily: "Arial" }} value={editData.description || ""} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="תיאור" />
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "13px", color: "#555" }}>החלף תמונה</label>
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], true)} style={{ fontSize: "13px" }} />
                          {uploadingEdit && <p style={{ color: "#aaa", fontSize: "13px" }}>מעלה...</p>}
                          {editData.thumbnail_url && <img src={editData.thumbnail_url} style={{ width: "60px", height: "90px", objectFit: "cover", borderRadius: "6px" }} alt="" />}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={handleEditSave} disabled={saving} style={{ flex: 1, background: "#e50914", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            {saving ? <Loader2 size={16} /> : <><Save size={16} /> שמור</>}
                          </button>
                          <button onClick={() => setEditingMovie(null)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>ביטול</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid #eee", borderRadius: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <img src={movie.thumbnail_url} style={{ width: "50px", height: "75px", objectFit: "cover", borderRadius: "6px" }} alt="" />
                          <div>
                            <div style={{ fontWeight: "bold" }}>{movie.title}</div>
                            <div style={{ fontSize: "12px", color: "#666" }}>{movie.category}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => { setEditingMovie(movie); setEditData({ ...movie }); }} style={{ background: "#f0f0f0", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer" }}>
                            <Edit2 size={18} color="#555" />
                          </button>
                          <button onClick={() => handleDeleteMovie(movie.id)} disabled={deleting === movie.id} style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", padding: "8px" }}>
                            {deleting === movie.id ? <Loader2 size={18} /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (playerOpen && selectedMovie) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <button onClick={() => setPlayerOpen(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          <X size={24} />
        </button>
        <p style={{ color: "#aaa", fontSize: "16px", marginBottom: "15px", fontFamily: "Arial" }}>{selectedMovie.title}</p>
        <video controls autoPlay style={{ width: "100%", maxHeight: "80vh" }} src={selectedMovie.video_url} />
      </div>
    );
  }

  if (selectedMovie) {
    return (
      <div style={{ background: "#111", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", color: "#fff" }}>
        <button onClick={() => setSelectedMovie(null)} style={{ position: "fixed", top: "15px", right: "15px", zIndex: 100, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowRight size={22} />
        </button>
        <div style={{ position: "relative" }}>
          <img src={selectedMovie.thumbnail_url} alt={selectedMovie.title} style={{ width: "100%", height: "55vw", maxHeight: "400px", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(transparent, #111)" }} />
        </div>
        <div style={{ padding: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 10px 0", color: "#fff" }}>{selectedMovie.title}</h1>
          {selectedMovie.category && <span style={{ background: "#e50914", color: "#fff", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>{selectedMovie.category}</span>}
          {selectedMovie.description && <p style={{ marginTop: "15px", fontSize: "15px", lineHeight: "1.8", color: "#bbb" }}>{selectedMovie.description}</p>}
          <button onClick={() => setPlayerOpen(true)} style={{ marginTop: "25px", width: "100%", background: "#e50914", color: "#fff", border: "none", padding: "16px", fontSize: "18px", fontWeight: "bold", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", boxShadow: "0 4px 20px rgba(229,9,20,0.4)" }}>
            <Play fill="white" size={22} /> לצפייה עכשיו
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif" }}>
      <header style={{ padding: "15px 15px 0 15px", position: "sticky", top: 0, background: "#fff", zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
          <h1 style={{ color: "#e50914", fontSize: "28px", fontWeight: 900, margin: 0, flexShrink: 0 }}>ZOVEX</h1>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "#f5f5f5", padding: "10px 16px", borderRadius: "50px", border: "1px solid #eee" }}>
            <Search size={17} color="#aaa" />
            <input type="text" placeholder="חפש סרט או סדרה..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: "none", border: "none", outline: "none", width: "100%", fontSize: "15px", color: "#333" }} />
            {searchTerm && <span onClick={() => setSearchTerm("")} style={{ cursor: "pointer", color: "#aaa", fontSize: "18px" }}>×</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "22px", overflowX: "auto", paddingBottom: "12px", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <span key={cat} onClick={() => setSelectedCategory(cat)} style={{ cursor: "pointer", fontSize: "15px", fontWeight: "bold", color: selectedCategory === cat ? "#e50914" : "#666", borderBottom: selectedCategory === cat ? "3px solid #e50914" : "3px solid transparent", paddingBottom: "6px", transition: "all 0.2s" }}>
              {cat}
            </span>
          ))}
        </div>
      </header>

      <main style={{ padding: "20px 15px 100px 15px" }}>
        {selectedCategory === "הכל" ? (
          Object.entries(moviesByCategory).map(([cat, catMovies]) => (
            <div key={cat} style={{ marginBottom: "35px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#111", marginBottom: "15px", borderRight: "4px solid #e50914", paddingRight: "10px" }}>{cat}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {catMovies.map(movie => (
                  <div key={movie.id} onClick={() => setSelectedMovie(movie)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", margin: 0, color: "#111", lineHeight: "1.3", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{movie.title}</h3>
                    <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "2/3", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", background: "#f0f0f0" }}>
                      <img src={movie.thumbnail_url} alt={movie.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = "https://via.placeholder.com/200x300?text=ZOVEX"; }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          filteredMovies.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
              <p style={{ fontSize: "18px" }}>😕 לא נמצאו תוצאות</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {filteredMovies.map(movie => (
                <div key={movie.id} onClick={() => setSelectedMovie(movie)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", margin: 0, color: "#111", lineHeight: "1.3", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{movie.title}</h3>
                  <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "2/3", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", background: "#f0f0f0" }}>
                    <img src={movie.thumbnail_url} alt={movie.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = "https://via.placeholder.com/200x300?text=ZOVEX"; }} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      <a href="https://t.me/ZOVE8" target="_blank" rel="noreferrer" style={{ position: "fixed", bottom: "25px", left: "25px", background: "#24A1DE", width: "58px", height: "58px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", zIndex: 1000, textDecoration: "none" }}>
        <Send size={28} fill="white" />
      </a>
    </div>
  );
}