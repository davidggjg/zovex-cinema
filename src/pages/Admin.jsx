import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Edit2, Trash2, Settings, Plus, Sparkles, ChevronDown, 
  ChevronUp, Image as ImageIcon, ExternalLink, Loader2, CheckCircle, AlertCircle, X 
} from "lucide-react";

// --- רכיב עזר להודעות (Toasts) ---
const Toast = ({ message, type, onClose }) => (
  <div className={`toast-message ${type}`}>
    {type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
    <span>{message}</span>
    <button onClick={onClose}><X size={14}/></button>
  </div>
);

export default function Admin() {
  const queryClient = useQueryClient();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [activeTab, setActiveTab] = useState("content"); // content | settings
  
  // ניהול State מאוחד לטופס
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    url: "",
    thumb: "",
    description: "",
    category: "סרטים",
    type: "movie",
    season: 1,
    episode: ""
  });

  const [tmdbResults, setTmdbResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedSeries, setExpandedSeries] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Queries ---
  const { data: movies = [], isLoading, isError } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
    onError: () => showToast("שגיאה בטעינת הנתונים", "error")
  });

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: (data) => formData.id 
      ? base44.entities.Movie.update(formData.id, data) 
      : base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      resetForm();
      showToast("התוכן נשמר בהצלחה");
    },
    onError: () => showToast("שגיאה בשמירת הנתונים", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Movie.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      showToast("הפריט נמחק");
    }
  });

  // --- פונקציות עזר ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id: null, title: "", url: "", thumb: "", description: "", category: "סרטים", type: "movie", season: 1, episode: "" });
    setTmdbResults([]);
  };

  const startEdit = (item) => {
    const isSeries = item.category === "סדרות";
    // חילוץ שם הסדרה המקורי אם קיים (לפני ה- " - ")
    const baseTitle = isSeries ? item.title.split(" - ")[0] : item.title;
    
    setFormData({
      id: item.id,
      title: baseTitle,
      url: item.video_id,
      thumb: item.thumbnail_url,
      description: item.description,
      category: item.category,
      type: isSeries ? "series" : "movie",
      season: item.metadata?.season || 1,
      episode: item.metadata?.episode || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchTMDB = async () => {
    const key = localStorage.getItem("tmdb_key");
    if (!key) return showToast("חסר מפתח TMDB בהגדרות", "error");
    if (!formData.title) return showToast("הכנס שם לחיפוש", "error");

    setIsSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(formData.title)}&language=he-IL`);
      const data = await res.json();
      setTmdbResults(data.results || []);
    } catch (err) {
      showToast("שגיאה בחיפוש ב-TMDB", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const selectTmdbItem = (item) => {
    setFormData(prev => ({
      ...prev,
      title: item.title || item.name,
      description: item.overview,
      thumb: `https://image.tmdb.org/t/p/w500${item.poster_path}`
    }));
    setTmdbResults([]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast("קובץ גדול מדי (מקסימום 5MB)", "error");

    setIsUploading(true);
    try {
      const uploaded = await base44.uploadFile(file);
      setFormData(prev => ({ ...prev, thumb: uploaded.url }));
      showToast("התמונה הועלתה");
    } catch (err) {
      showToast("שגיאה בהעלאה", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // --- לוגיקת קיבוץ סדרות מתוקנת ---
  const groupedContent = useMemo(() => {
    const res = { movies: [], series: {} };
    movies.forEach(item => {
      if (item.category === "סדרות") {
        // קיבוץ לפי ה-Title שלפני ה-dash
        const baseName = item.title.includes(" - ") ? item.title.split(" - ")[0].trim() : item.title;
        if (!res.series[baseName]) res.series[baseName] = [];
        res.series[baseName].push(item);
      } else {
        res.movies.push(item);
      }
    });
    return res;
  }, [movies]);

  if (!isAuthorized) return (
    <div className="admin-login-screen">
      <style>{CSS}</style>
      <div className="login-box">
        <h2>ZOVEX <span>ADMIN</span></h2>
        <input 
          type="password" 
          placeholder="קוד גישה" 
          value={passcode} 
          onChange={e => setPasscode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && passcode === "ZovexAdmin2026" && setIsAuthorized(true)}
        />
        <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : showToast("קוד שגוי", "error")}>כניסה</button>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );

  return (
    <div className="admin-page">
      <style>{CSS}</style>
      
      <header className="admin-nav">
        <div className="admin-logo">ZO<span>VEX</span></div>
        <div className="nav-group">
          <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}><Plus size={20}/></button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={20}/></button>
          <Link to="/" className="exit-btn"><ExternalLink size={18}/></Link>
        </div>
      </header>

      <main className="admin-content">
        {activeTab === 'settings' ? (
          <section className="card fade-in">
            <h3>הגדרות מערכת</h3>
            <div className="field">
              <label>מפתח TMDB API</label>
              <input 
                type="password" 
                placeholder="הכנס מפתח..." 
                defaultValue={localStorage.getItem("tmdb_key")} 
                onChange={e => localStorage.setItem("tmdb_key", e.target.value)} 
              />
            </div>
          </section>
        ) : (
          <div className="fade-in">
            {/* טופס הוספה/עריכה */}
            <section className="card editor-card">
              <h3>{formData.id ? "עריכת תוכן" : "הוספת תוכן חדש"}</h3>
              
              <div className="type-toggle">
                <button 
                  className={formData.type === 'movie' ? 'active' : ''} 
                  onClick={() => setFormData(prev => ({...prev, type: 'movie', category: 'סרטים'}))}
                >סרט</button>
                <button 
                  className={formData.type === 'series' ? 'active' : ''} 
                  onClick={() => setFormData(prev => ({...prev, type: 'series', category: 'סדרות'}))}
                >סדרה</button>
              </div>

              <div className="field">
                <label>שם הכותר</label>
                <div className="input-with-action">
                  <input name="title" value={formData.title} onChange={handleInputChange} placeholder="למשל: וונדה ויז'ן" />
                  <button className="ai-btn" onClick={searchTMDB} disabled={isSearching}>
                    {isSearching ? <Loader2 className="spin" size={18}/> : <Sparkles size={18}/>}
                  </button>
                </div>
              </div>

              {/* רשימת תוצאות TMDB */}
              {tmdbResults.length > 0 && (
                <div className="tmdb-picker">
                  {tmdbResults.slice(0, 5).map(item => (
                    <div key={item.id} className="tmdb-item" onClick={() => selectTmdbItem(item)}>
                      <img src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : ""} alt="" />
                      <div>
                        <strong>{item.title || item.name}</strong>
                        <span>{item.release_date || item.first_air_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.type === 'series' && (
                <div className="grid-2">
                  <div className="field">
                    <label>עונה</label>
                    <input type="number" name="season" value={formData.season} onChange={handleInputChange} />
                  </div>
                  <div className="field">
                    <label>פרק</label>
                    <input type="number" name="episode" value={formData.episode} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              <div className="field">
                <label>קישור וידאו</label>
                <input name="url" value={formData.url} onChange={handleInputChange} placeholder="Drive / YouTube URL" />
              </div>

              <div className="field">
                <label>תמונה (URL או העלאה)</label>
                <div className="input-with-action">
                  <input name="thumb" value={formData.thumb} onChange={handleInputChange} placeholder="קישור לתמונה..." />
                  <label className="upload-btn">
                    {isUploading ? <Loader2 className="spin" size={18}/> : <ImageIcon size={18}/>}
                    <input type="file" onChange={handleFileUpload} hidden />
                  </label>
                </div>
              </div>

              <div className="field">
                <label>תקציר</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} />
              </div>

              <div className="form-buttons">
                <button 
                  className="save-btn" 
                  disabled={saveMutation.isLoading || !formData.title || !formData.url}
                  onClick={() => {
                    const finalTitle = formData.type === 'series' 
                      ? `${formData.title} - עונה ${formData.season} פרק ${formData.episode}` 
                      : formData.title;
                    saveMutation.mutate({
                      title: finalTitle,
                      description: formData.description,
                      video_id: formData.url,
                      category: formData.category,
                      thumbnail_url: formData.thumb,
                      metadata: { season: formData.season, episode: formData.episode }
                    });
                  }}
                >
                  {saveMutation.isLoading ? "שומר..." : "שמור ופרסם"}
                </button>
                {formData.id && <button className="cancel-btn" onClick={resetForm}>ביטול</button>}
              </div>
            </section>

            {/* רשימת תוכן קיים */}
            <section className="list-section">
              <h3>תוכן במערכת</h3>
              {isLoading ? <Loader2 className="spin center" /> : (
                <div className="card list-card">
                  {/* סרטים */}
                  <div className="list-group">
                    <h4>🎬 סרטים ({groupedContent.movies.length})</h4>
                    {groupedContent.movies.map(m => (
                      <div key={m.id} className="row">
                        <span>{m.title}</span>
                        <div className="actions">
                          <button onClick={() => startEdit(m)}><Edit2 size={16}/></button>
                          <button className="del" onClick={() => window.confirm("למחוק?") && deleteMutation.mutate(m.id)}><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* סדרות */}
                  <div className="list-group">
                    <h4>📺 סדרות</h4>
                    {Object.entries(groupedContent.series).map(([name, eps]) => (
                      <div key={name} className="series-accordion">
                        <div className="accordion-head" onClick={() => setExpandedSeries(expandedSeries === name ? null : name)}>
                          <span>{name} ({eps.length} פרקים)</span>
                          {expandedSeries === name ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </div>
                        {expandedSeries === name && (
                          <div className="accordion-body">
                            {eps.map(ep => (
                              <div key={ep.id} className="row sub-row">
                                <span>{ep.title}</span>
                                <div className="actions">
                                  <button onClick={() => startEdit(ep)}><Edit2 size={14}/></button>
                                  <button className="del" onClick={() => window.confirm("למחוק?") && deleteMutation.mutate(ep.id)}><Trash2 size={14}/></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// --- CSS ---
const CSS = `
  .admin-page { background: #f2f2f7; min-height: 100vh; direction: rtl; font-family: 'Assistant', sans-serif; color: #1c1c1e; }
  .admin-nav { background: #fff; padding: 12px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #d1d1d6; position: sticky; top: 0; z-index: 100; }
  .admin-logo { font-weight: 900; font-size: 20px; }
  .admin-logo span { color: #007aff; }
  .nav-group { display: flex; gap: 10px; }
  .nav-group button { background: none; border: none; padding: 8px; border-radius: 8px; cursor: pointer; color: #8e8e93; }
  .nav-group button.active { color: #007aff; background: #f2f2f7; }
  
  .admin-content { max-width: 600px; margin: 20px auto; padding: 0 15px; }
  .card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px; }
  .field { margin-bottom: 15px; }
  .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #3a3a3c; }
  input, textarea { width: 100%; padding: 12px; border: 1px solid #d1d1d6; border-radius: 10px; font-size: 15px; box-sizing: border-box; }
  textarea { height: 80px; resize: none; }
  
  .type-toggle { display: flex; background: #e3e3e8; padding: 3px; border-radius: 10px; margin-bottom: 20px; }
  .type-toggle button { flex: 1; border: none; padding: 8px; border-radius: 8px; cursor: pointer; font-weight: 600; background: none; }
  .type-toggle button.active { background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  
  .input-with-action { display: flex; gap: 8px; }
  .ai-btn, .upload-btn { background: #1c1c1e; color: #fff; border: none; padding: 0 15px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .upload-btn { background: #f2f2f7; color: #1c1c1e; border: 1px solid #d1d1d6; }
  
  .tmdb-picker { background: #fff; border: 1px solid #d1d1d6; border-radius: 10px; margin-top: 5px; overflow: hidden; }
  .tmdb-item { display: flex; gap: 10px; padding: 8px; border-bottom: 1px solid #f2f2f7; cursor: pointer; }
  .tmdb-item:hover { background: #f9f9f9; }
  .tmdb-item img { width: 40px; height: 60px; object-fit: cover; border-radius: 4px; }
  .tmdb-item div { display: flex; flex-direction: column; justify-content: center; }
  .tmdb-item strong { font-size: 14px; }
  .tmdb-item span { font-size: 11px; color: #8e8e93; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .form-buttons { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
  .save-btn { background: #007aff; color: #fff; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 16px; }
  .save-btn:disabled { opacity: 0.5; }
  .cancel-btn { background: none; color: #ff3b30; border: none; font-weight: 600; cursor: pointer; }

  .list-group h4 { font-size: 14px; margin-bottom: 10px; color: #8e8e93; border-bottom: 1px solid #f2f2f7; padding-bottom: 5px; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f2f2f7; }
  .actions { display: flex; gap: 8px; }
  .actions button { background: #f2f2f7; border: none; padding: 6px; border-radius: 6px; cursor: pointer; }
  .actions button.del { color: #ff3b30; }
  
  .series-accordion { border: 1px solid #f2f2f7; border-radius: 10px; margin-bottom: 8px; }
  .accordion-head { padding: 12px; display: flex; justify-content: space-between; cursor: pointer; font-weight: 600; }
  .accordion-body { background: #f9f9f9; padding: 0 10px; }
  .sub-row { font-size: 13px; }

  .toast-message { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1c1c1e; color: #fff; padding: 12px 20px; border-radius: 50px; display: flex; align-items: center; gap: 10px; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: slideDown 0.3s ease; }
  .toast-message.error { background: #ff3b30; }
  @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .admin-login-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f2f2f7; }
  .login-box { background: #fff; padding: 30px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.1); width: 300px; }
  .fade-in { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;