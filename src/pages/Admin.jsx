import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Settings, Plus, Sparkles, Loader2, Film, Tv } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); // content | keys
  const [isAiLoading, setIsAiLoading] = useState(false);
  const queryClient = useQueryClient();

  // מפתחות
  const [groqKey, setGroqKey] = useState(localStorage.getItem("groq_key") || "");
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem("tmdb_key") || "");

  // טופס
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("movie");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("");

  const { data: movies = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const categories = useMemo(() => [...new Set(movies.map(m => m.category).filter(Boolean))], [movies]);

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["movies"]); resetForm(); alert("נשמר בהצלחה!"); }
  });

  const resetForm = () => { setEditingId(null); setTitle(""); setUrl(""); setDescription(""); setEpisode(""); setCategory(""); setNewCategory(""); };

  if (!isAuthorized) return (
    <div style={authContainer}>
      <div style={authCard}>
        <h2>ZOVEX ADMIN</h2>
        <input type="password" placeholder="קוד כניסה" onChange={e => setPasscode(e.target.value)} style={inStyle} />
        <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי")} style={btnMain}>כניסה</button>
      </div>
    </div>
  );

  return (
    <div style={adminLayout}>
      <header style={header}>
        <div style={logo}>ZO<span>VEX</span> <small>ADMIN</small></div>
        <div style={nav}>
          <button onClick={() => setActiveTab("keys")} style={iconBtn}><Settings size={20}/></button>
          <button onClick={() => setActiveTab("content")} style={iconBtn}><Plus size={20}/></button>
          <Link to="/" style={link}>חזרה לאתר</Link>
        </div>
      </header>

      <div style={container}>
        {activeTab === "keys" ? (
          <div style={card}>
            <h3>ניהול מפתחות מערכת</h3>
            <label>Groq API Key (לתקצירים):</label>
            <input type="password" value={groqKey} onChange={e => {setGroqKey(e.target.value); localStorage.setItem("groq_key", e.target.value)}} style={inStyle} />
            <label>TMDB API Key (למידע נוסף):</label>
            <input type="password" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
            <button onClick={() => alert("המפתחות נשמרו בדפדפן")} style={btnMain}>עדכן מפתחות</button>
          </div>
        ) : (
          <>
            <div style={card}>
              <h3>{editingId ? "עריכת תוכן" : "הוספת סרט או סדרה"}</h3>
              <div style={typeSwitch}>
                <button onClick={() => setType("movie")} style={type === "movie" ? activeT : inactiveT}>🎬 סרט</button>
                <button onClick={() => setType("series")} style={type === "series" ? activeT : inactiveT}>📺 סדרה</button>
              </div>

              <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
              
              <div style={rowInput}>
                <select value={category} onChange={e => setCategory(e.target.value)} style={inStyle}>
                  <option value="">בחר קטגוריה...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="או הוסף קטגוריה חדשה" value={newCategory} onChange={e => setNewCategory(e.target.value)} style={inStyle} />
              </div>

              {type === "series" && (
                <div style={rowInput}>
                  <input type="number" placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inStyle} />
                  <input type="number" placeholder="מספר פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} />
                </div>
              )}

              <input placeholder="מזהה וידאו (Video ID)" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
              <textarea placeholder="תקציר..." value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height: '100px'}} />

              <button onClick={() => saveMutation.mutate({
                title: type === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
                description, video_id: url, category: newCategory || category,
                metadata: type === "series" ? { season, episode } : {}
              })} style={btnMain}>שמור ופרסם</button>
            </div>

            <div style={{marginTop: '40px'}}>
              <h3>רשימת תוכן (ניהול מלאי)</h3>
              <div style={card}>
                {movies.map(m => (
                  <div key={m.id} style={itemRow}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', flex:1}}>
                      {m.category === "סדרות" ? <Tv size={16}/> : <Film size={16}/>}
                      <div style={{fontWeight:'bold'}}>{m.title} <small style={{color:'#888'}}>({m.category})</small></div>
                    </div>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={() => { setEditingId(m.id); setTitle(m.title); setUrl(m.video_id); setDescription(m.description); setCategory(m.category); window.scrollTo(0,0); }} style={iconBtn}><Edit2 size={14}/></button>
                      <button onClick={() => window.confirm("למחוק?") && base44.entities.Movie.delete(m.id).then(() => queryClient.invalidateQueries(["movies"]))} style={iconBtn}><Trash2 size={14} color="red"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Styles
const adminLayout = { background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant, sans-serif" };
const header = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd" };
const logo = { fontSize: "22px", fontWeight: "900" };
const nav = { display: "flex", gap: "15px", alignItems: "center" };
const container = { maxWidth: "900px", margin: "30px auto", padding: "0 20px" };
const card = { background: "#fff", padding: "25px", borderRadius: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" };
const inStyle = { width: "100%", padding: "12px", margin: "8px 0", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px" };
const btnMain = { background: "#0071E3", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", width: "100%", fontWeight: "bold", cursor: "pointer", marginTop: "10px" };
const typeSwitch = { display: "flex", gap: "10px", marginBottom: "15px" };
const activeT = { flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#0071E3", color: "#fff", fontWeight: "bold" };
const inactiveT = { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
const rowInput = { display: "flex", gap: "10px" };
const itemRow = { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f0f0f0" };
const iconBtn = { background: "#f5f5f7", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" };
const link = { textDecoration: "none", color: "#0071E3", fontWeight: "bold" };
const authContainer = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F5F5F7" };
const authCard = { background: "#fff", padding: "40px", borderRadius: "20px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" };