import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Edit2, Trash2, Settings, Plus, Sparkles, ChevronDown, 
  ChevronUp, Image as ImageIcon, ExternalLink, Loader2, CheckCircle, AlertCircle, X, Cpu 
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
  
  // State לטופס
  const [formData, setFormData] = useState({
    id: null, title: "", url: "", thumb: "", description: "",
    category: "", type: "movie", season: 1, episode: ""
  });

  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedSeries, setExpandedSeries] = useState(null);

  // שליפת קטגוריות קיימות מהדאטה כדי להציע למשתמש
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date")
  });

  const existingCategories = useMemo(() => {
    const cats = new Set(movies.map(m => m.category).filter(Boolean));
    return Array.from(cats);
  }, [movies]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // חיפוש אוטומטי ב-TMDB
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.length > 2 && !formData.id) searchTMDB(formData.title);
    }, 600);
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
    } catch (err) { console.error(err); }
    finally { setIsSearching(false); }
  };

  const selectTmdbItem = (item) => {
    setFormData(prev => ({
      ...prev,
      title: item.title || item.name,
      description: item.overview,
      thumb: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : prev.thumb
    }));
    setTmdbResults([]);
    showToast("הנתונים נמשכו מ-TMDB");
  };

  const saveMutation = useMutation({
    mutationFn: (data) => formData.id ? base44.entities.Movie.update(formData.id, data) : base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      resetForm();
      showToast("פורסם בהצלחה!");
    }
  });

  const resetForm = () => {
    setFormData({ id: null, title: "", url: "", thumb: "", description: "", category: "", type: "movie", season: 1, episode: "" });
    setIsAddingNewCategory(false);
    setNewCategoryName("");
  };

  const startEdit = (item) => {
    setFormData({
      id: item.id, title: item.title.split(" - ")[0], url: item.video_id,
      thumb: item.thumbnail_url, description: item.description,
      category: item.category || "", type: item.category === "סדרות" ? "series" : "movie",
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
            <h3>מפתחות מערכת (AI)</h3>
            <div className="field">
              <label>מפתח TMDB (למידע ותמונות)</label>
              <input type="password" placeholder="TMDB API Key..." defaultValue={localStorage.getItem("tmdb_key")} onChange={e => localStorage.setItem("tmdb_key", e.target.value)} />
            </div>
            <div className="field">
              <label>מפתח Groq (לתיאורים חכמים)</label>
              <div className="input-with-icon">
                <Cpu size={18} className="input-icon"/>
                <input type="password" placeholder="Groq API Key..." defaultValue={localStorage.getItem("groq_key")} onChange={e => localStorage.setItem("groq_key", e.target.value)} style={{paddingRight: '40px'}} />
              </div>
            </div>
            <p className="hint">מפתחות אלו מאפשרים למערכת למשוך נתונים ולכתוב תקצירים באופן אוטומטי.</p>
          </section>
        ) : (
          <div className="fade-in">
            <section className="card editor-card">
              <div className="type-toggle">
                <button className={formData.type === 'movie' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'movie'})}>🎬 סרט</button>
                <button className={formData.type === 'series' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'series', category: 'סדרות'})}>📺 סדרה</button>
              </div>

              <div className="field" style={{position: 'relative'}}>
                <label>שם הסרט/סדרה</label>
                <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="הקלד שם..." />
                {isSearching && <Loader2 className="spin input-loader" size={18}/>}
                
                {tmdbResults.length > 0 && (
                  <div className="suggestions">
                    {tmdbResults.slice(0, 4).map(item => (
                      <div key={item.id} className="sug-item" onClick={() => selectTmdbItem(item)}>
                        <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" />
                        <span>{item.title || item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>קטגוריה</label>
                  {!isAddingNewCategory ? (
                    <select 
                      value={formData.category} 
                      onChange={(e) => {
                        if (e.target.value === "NEW") setIsAddingNewCategory(true);
                        else setFormData({...formData, category: e.target.value});
                      }}
                    >
                      <option value="">ללא קטגוריה</option>
                      {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="NEW" style={{fontWeight: 'bold', color: '#007aff'}}>+ קטגוריה חדשה...</option>
                    </select>
                  ) : (
                    <div className="input-with-action">
                      <input 
                        autoFocus 
                        placeholder="שם הקטגוריה..." 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <button className="small-cancel" onClick={() => setIsAddingNewCategory(false)}><X size={14}/></button>
                    </div>
                  )}
                </div>
                {formData.type === 'series' && (
                  <div className="field">
                    <label>פרק</label>
                    <input type="number" value={formData.episode} onChange={(e) => setFormData({...formData, episode: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="field">
                <label>לינק לוידאו</label>
                <input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="YouTube / Drive Link" />
              </div>

              <div className="field">
                <label>תקציר</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <button className="save-btn" onClick={() => {
                const finalCategory = isAddingNewCategory ? newCategoryName : formData.category;
                saveMutation.mutate({
                  title: formData.type === 'series' ? `${formData.title} - עונה ${formData.season} פרק ${formData.episode}` : formData.title,
                  description: formData.description,
                  video_id: formData.url,
                  category: formData.type === 'series' ? "סדרות" : finalCategory,
                  thumbnail_url: formData.thumb,
                  metadata: { season: formData.season, episode: formData.episode }
                });
              }}>
                {saveMutation.isLoading ? <Loader2 className="spin" size={20}/> : (formData.id ? "עדכן תוכן" : "פרסם עכשיו")}
              </button>
            </section>

            <section className="list-section">
              <h3>ניהול תוכן</h3>
              {movies.map(m => (
                <div key={m.id} className="item-row">
                  <div className="item-info">
                    <strong>{m.title}</strong>
                    {m.category && <span className="tag">{m.category}</span>}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEdit(m)}><Edit2 size={16}/></button>
                    <button className="del" onClick={() => window.confirm("למחוק?") && base44.entities.Movie.delete(m.id).then(() => queryClient.invalidateQueries(["movies"]))}><Trash2 size={16}/></button>
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
  .admin-page { background: #f2f2f7; min-height: 100vh; direction: rtl; font-family: 'Assistant', sans-serif; padding-bottom: 40px; }
  .admin-nav { background: #fff; padding: 15px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #d1d1d6; position: sticky; top:0; z-index:100; }
  .admin-logo span { color: #007aff; font-weight: 900; }
  .nav-group { display: flex; gap: 15px; }
  .nav-group button.active { color: #007aff; }
  .admin-content { max-width: 500px; margin: 20px auto; padding: 0 15px; }
  .card { background: #fff; padding: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); margin-bottom: 20px; }
  .field { margin-bottom: 15px; }
  .field label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #3a3a3c; }
  input, textarea, select { width: 100%; padding: 14px; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 16px; box-sizing: border-box; background: #f9f9fb; transition: 0.2s; }
  input:focus { border-color: #007aff; outline: none; background: #fff; }
  .input-with-icon { position: relative; }
  .input-icon { position: absolute; right: 12px; top: 14px; color: #8e8e93; }
  .suggestions { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border-radius: 12px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); z-index: 50; overflow: hidden; }
  .sug-item { display: flex; align-items: center; gap: 12px; padding: 10px; cursor: pointer; border-bottom: 1px solid #f2f2f7; }
  .sug-item:hover { background: #f2f2f7; }
  .sug-item img { width: 35px; height: 50px; border-radius: 4px; object-fit: cover; }
  .type-toggle { display: flex; background: #e3e3e8; padding: 4px; border-radius: 12px; margin-bottom: 20px; }
  .type-toggle button { flex: 1; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 700; background: none; transition: 0.2s; }
  .type-toggle button.active { background: #fff; color: #007aff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .save-btn { width: 100%; background: #007aff; color: #fff; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
  .item-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f2f2f7; }
  .tag { font-size: 11px; background: #eef6ff; color: #007aff; padding: 2px 8px; border-radius: 6px; margin-right: 8px; font-weight: 700; }
  .item-actions { display: flex; gap: 10px; }
  .item-actions button { background: #f2f2f7; border: none; padding: 8px; border-radius: 8px; cursor: pointer; }
  .del { color: #ff3b30; }
  .input-loader { position: absolute; left: 15px; top: 40px; color: #007aff; }
  .small-cancel { background: #ff3b30; color: #fff; border: none; padding: 0 10px; border-radius: 10px; margin-right: 5px; cursor: pointer; }
  .hint { font-size: 12px; color: #8e8e93; margin-top: 10px; }
  .toast-message { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1c1c1e; color: #fff; padding: 14px 24px; border-radius: 50px; display: flex; align-items: center; gap: 12px; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .login-box { background: #fff; padding: 40px; border-radius: 25px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.1); width: 320px; }
`;