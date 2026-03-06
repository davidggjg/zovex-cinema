import { useState, useMemo, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Edit2, Trash2, Settings, Plus, Sparkles, ChevronDown, 
  ChevronUp, Image as ImageIcon, ExternalLink, Loader2, CheckCircle, AlertCircle, X, Search 
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("content");
  
  const [formData, setFormData] = useState({
    id: null, title: "", url: "", thumb: "", description: "",
    category: "כללי", type: "movie", season: 1, episode: ""
  });

  const [tmdbResults, setTmdbResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedSeries, setExpandedSeries] = useState(null);

  // רשימת קטגוריות נפוצות - אפשר להוסיף כאן עוד
  const categoryOptions = ["פעולה", "קומדיה", "דרמה", "ילדים", "אימה", "אנימציה", "דוקו", "מדע בדיוני", "כללי"];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date")
  });

  // חיפוש אוטומטי תוך כדי הקלדה (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.length > 2 && !formData.id) {
        searchTMDB(formData.title);
      } else {
        setTmdbResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.title]);

  const searchTMDB = async (query) => {
    const key = localStorage.getItem("tmdb_key");
    if (!key) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&language=he-IL`);
      const data = await res.json();
      setTmdbResults(data.results || []);
    } catch (err) {
      console.error("TMDB Error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectTmdbItem = (item) => {
    // מיפוי ז'אנרים לקטגוריות שלנו (ה-AI ה"חכם" שביקשת)
    const genreMap = { 28: "פעולה", 35: "קומדיה", 18: "דרמה", 10751: "ילדים", 16: "אנימציה", 27: "אימה", 99: "דוקו" };
    const autoCat = item.genre_ids ? genreMap[item.genre_ids[0]] || "כללי" : "כללי";

    setFormData(prev => ({
      ...prev,
      title: item.title || item.name,
      description: item.overview,
      thumb: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : prev.thumb,
      category: autoCat
    }));
    setTmdbResults([]);
  };

  const verifyKey = async () => {
    const key = localStorage.getItem("tmdb_key");
    if (!key) return showToast("אנא הכנס מפתח קודם", "error");
    setIsVerifying(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key}`);
      if (res.ok) showToast("המפתח תקין! המערכת מסונכרנת");
      else throw new Error();
    } catch (err) {
      showToast("מפתח לא תקין", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => formData.id ? base44.entities.Movie.update(formData.id, data) : base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      resetForm();
      showToast("נשמר בהצלחה");
    }
  });

  const resetForm = () => setFormData({ id: null, title: "", url: "", thumb: "", description: "", category: "כללי", type: "movie", season: 1, episode: "" });

  const startEdit = (item) => {
    setFormData({
      id: item.id, title: item.title.split(" - ")[0], url: item.video_id,
      thumb: item.thumbnail_url, description: item.description,
      category: item.category || "כללי", type: item.category === "סדרות" ? "series" : "movie",
      season: item.metadata?.season || 1, episode: item.metadata?.episode || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthorized) return (
    <div className="admin-login-screen">
      <style>{CSS}</style>
      <div className="login-box">
        <h2>ZOVEX <span>ADMIN</span></h2>
        <input type="password" placeholder="קוד גישה" onChange={e => setPasscode(e.target.value)} onKeyDown={e => e.key === 'Enter' && passcode === "ZovexAdmin2026" && setIsAuthorized(true)} />
        <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : showToast("קוד שגוי", "error")}>כניסה</button>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <style>{CSS}</style>
      <header className="admin-nav">
        <div className="admin-logo">ZO<span>VEX</span></div>
        <div className="nav-group">
          <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}><Plus/></button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings/></button>
          <Link to="/" className="exit-btn"><ExternalLink size={18}/></Link>
        </div>
      </header>

      <main className="admin-content">
        {activeTab === 'settings' ? (
          <section className="card fade-in">
            <h3>הגדרות וסריקה</h3>
            <div className="field">
              <label>מפתח TMDB API</label>
              <div className="input-with-action">
                <input type="password" placeholder="הכנס מפתח..." defaultValue={localStorage.getItem("tmdb_key")} onChange={e => localStorage.setItem("tmdb_key", e.target.value)} />
                <button className="ai-btn" onClick={verifyKey} disabled={isVerifying}>
                  {isVerifying ? <Loader2 className="spin" size={18}/> : "סרוק מפתח"}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="fade-in">
            <section className="card editor-card">
              <div className="type-toggle">
                <button className={formData.type === 'movie' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'movie'})}>סרט</button>
                <button className={formData.type === 'series' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'series'})}>סדרה</button>
              </div>

              <div className="field" style={{position: 'relative'}}>
                <label>שם הכותר (הקלד להצעות)</label>
                <div className="input-with-action">
                  <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="למשל: ספיידרמן" />
                  {isSearching && <Loader2 className="spin input-loader" size={18}/>}
                </div>
                
                {tmdbResults.length > 0 && (
                  <div className="suggestions-dropdown">
                    {tmdbResults.slice(0, 5).map(item => (
                      <div key={item.id} className="suggestion-item" onClick={() => selectTmdbItem(item)}>
                        <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" />
                        <span>{item.title || item.name} ({new Date(item.release_date || item.first_air_date).getFullYear()})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>קטגוריה</label>
                  <select className="admin-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="סדרות">סדרות (אוטומטי)</option>
                  </select>
                </div>
                {formData.type === 'series' && (
                  <div className="field">
                    <label>פרק</label>
                    <input type="number" value={formData.episode} onChange={(e) => setFormData({...formData, episode: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="field">
                <label>קישור וידאו</label>
                <input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="הדבק לינק כאן" />
              </div>

              <div className="field">
                <label>תקציר</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <button className="save-btn" onClick={() => saveMutation.mutate({
                title: formData.type === 'series' ? `${formData.title} - עונה ${formData.season} פרק ${formData.episode}` : formData.title,
                description: formData.description, video_id: formData.url,
                category: formData.type === 'series' ? "סדרות" : formData.category,
                thumbnail_url: formData.thumb, metadata: { season: formData.season, episode: formData.episode }
              })}>
                {saveMutation.isLoading ? "שומר..." : "פרסם עכשיו"}
              </button>
            </section>

            <section className="card">
              <h4>תוכן קיים</h4>
              {movies.map(m => (
                <div key={m.id} className="row">
                  <span>{m.title} <small>({m.category})</small></span>
                  <div className="actions">
                    <button onClick={() => startEdit(m)}><Edit2 size={14}/></button>
                    <button className="del" onClick={() => base44.entities.Movie.delete(m.id).then(() => queryClient.invalidateQueries(["movies"]))}><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

const CSS = `
  .admin-page { background: #f2f2f7; min-height: 100vh; direction: rtl; font-family: 'Assistant', sans-serif; }
  .admin-nav { background: #fff; padding: 15px; display: flex; justify-content: space-between; border-bottom: 1px solid #d1d1d6; position: sticky; top:0; z-index:100; }
  .admin-logo span { color: #007aff; font-weight: 900; }
  .nav-group { display: flex; gap: 15px; }
  .nav-group button.active { color: #007aff; }
  .admin-content { max-width: 500px; margin: 20px auto; padding: 0 15px; }
  .card { background: #fff; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 20px; }
  .field { margin-bottom: 15px; }
  .field label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 5px; }
  input, textarea, select { width: 100%; padding: 12px; border: 1px solid #d1d1d6; border-radius: 10px; font-size: 15px; box-sizing: border-box; }
  .input-with-action { display: flex; gap: 10px; }
  .ai-btn { background: #007aff; color: #fff; border: none; padding: 0 15px; border-radius: 10px; cursor: pointer; white-space: nowrap; }
  .suggestions-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #d1d1d6; border-radius: 10px; z-index: 50; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  .suggestion-item { display: flex; align-items: center; gap: 10px; padding: 10px; cursor: pointer; border-bottom: 1px solid #f2f2f7; }
  .suggestion-item:hover { background: #f2f2f7; }
  .suggestion-item img { width: 35px; height: 50px; border-radius: 4px; object-fit: cover; }
  .save-btn { width: 100%; background: #007aff; color: #fff; border: none; padding: 15px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 10px; }
  .type-toggle { display: flex; background: #e3e3e8; padding: 3px; border-radius: 10px; margin-bottom: 20px; }
  .type-toggle button { flex: 1; border: none; padding: 8px; border-radius: 8px; cursor: pointer; font-weight: 600; background: none; }
  .type-toggle button.active { background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f2f2f7; font-size: 14px; }
  .actions { display: flex; gap: 10px; }
  .del { color: #ff3b30; }
  .input-loader { position: absolute; left: 60px; top: 38px; color: #007aff; }
  .toast-message { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #1c1c1e; color: #fff; padding: 12px 20px; border-radius: 50px; display: flex; align-items: center; gap: 10px; z-index: 1000; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;