import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Settings, Plus, Sparkles, Loader2, Film, Tv, CheckCircle, XCircle, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [status, setStatus] = useState({ groq: "pending", tmdb: "pending" });
  const queryClient = useQueryClient();

  const [groqKey, setGroqKey] = useState(localStorage.getItem("groq_key") || "");
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem("tmdb_key") || "");

  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("movie");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [thumb, setThumb] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("סרטים");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("");

  const { data: movies = [] } = useQuery({ queryKey: ["movies"], queryFn: () => base44.entities.Movie.list("-created_date") });

  // בדיקת תקינות מפתחות (בעברית)
  useEffect(() => {
    const checkKeys = async () => {
      if (groqKey) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${groqKey}` } });
          setStatus(prev => ({ ...prev, groq: res.ok ? "תקין" : "שגיאה" }));
        } catch { setStatus(prev => ({ ...prev, groq: "אין חיבור" })); }
      }
      if (tmdbKey) {
        try {
          const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`);
          setStatus(prev => ({ ...prev, tmdb: res.ok ? "תקין" : "שגיאה" }));
        } catch { setStatus(prev => ({ ...prev, tmdb: "אין חיבור" })); }
      }
    };
    checkKeys();
  }, [groqKey, tmdbKey]);

  const autoFill = async () => {
    if (!tmdbKey) return alert("חובה להזין מפתח TMDB בהגדרות!");
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&language=he-IL`);
      const data = await res.json();
      if (data.results?.[0]) {
        const item = data.results[0];
        const year = (item.release_date || item.first_air_date || "").split("-")[0];
        if (year) setTitle(`${title} (${year})`);
        setDescription(item.overview);
        setThumb(`https://image.tmdb.org/t/p/w500${item.poster_path}`);
        alert("הנתונים נמשכו בהצלחה!");
      }
    } catch { alert("שגיאה במשיכת נתונים"); }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["movies"]); resetForm(); alert("נשמר בהצלחה!"); }
  });

  const resetForm = () => { setEditingId(null); setTitle(""); setUrl(""); setThumb(""); setDescription(""); setEpisode(""); };

  const groupedContent = useMemo(() => {
    const groups = { movies: [], series: {} };
    movies.forEach(m => {
      if (m.category === "סדרות" || m.metadata?.season) {
        const base = m.title.split(" - ")[0];
        if (!groups.series[base]) groups.series[base] = [];
        groups.series[base].push(m);
      } else { groups.movies.push(m); }
    });
    return groups;
  }, [movies]);

  if (!isAuthorized) return (
    <div style={authContainer}>
      <div style={card}>
        <h2 style={{color:'#0071E3', marginBottom:'20px'}}>ZOVEX ניהול</h2>
        <input type="password" placeholder="קוד גישה" onChange={e => setPasscode(e.target.value)} style={inStyle} />
        <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי")} style={btnMain}>כניסה למערכת</button>
      </div>
    </div>
  );

  return (
    <div style={adminLayout}>
      <header style={header}>
        <div style={logo}>ZO<span>VEX</span> <small>ניהול</small></div>
        <div style={nav}>
          <button onClick={() => setActiveTab("keys")} style={iconBtn} title="הגדרות"><Settings size={20}/></button>
          <button onClick={() => setActiveTab("content")} style={iconBtn} title="הוספת תוכן"><Plus size={20}/></button>
          <Link to="/" style={exitLink}>יציאה לאתר</Link>
        </div>
      </header>

      <div style={mainContainer}>
        {activeTab === "keys" ? (
          <div style={card}>
            <h3>מרכז בקרת מפתחות</h3>
            <div style={statusRow}>
              <div style={statusItem}>
                <span>מפתח Groq (תקצירים): <b>{status.groq}</b></span>
                <input type="password" value={groqKey} onChange={e => {setGroqKey(e.target.value); localStorage.setItem("groq_key", e.target.value)}} style={inStyle} />
              </div>
              <div style={statusItem}>
                <span>מפתח TMDB (תמונות): <b>{status.tmdb}</b></span>
                <input type="password" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                <h3>{editingId ? "עריכת תוכן" : "הוספת תוכן חדש"}</h3>
                <button onClick={autoFill} style={aiBtn}><Sparkles size={16}/> משיכת נתונים אוטומטית</button>
              </div>
              
              <div style={typeBar}>
                <button onClick={() => setType("movie")} style={type === "movie" ? activeType : inactiveType}>🎬 סרט</button>
                <button onClick={() => setType("series")} style={type === "series" ? activeType : inactiveType}>📺 סדרה</button>
              </div>

              <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
              
              <div style={gridIn}>
                <input placeholder="קישור לתמונה (URL)" value={thumb} onChange={e => setThumb(e.target.value)} style={inStyle} />
                <select value={category} onChange={e => setCategory(e.target.value)} style={inStyle}>
                  <option value="סרטים">סרטים</option>
                  <option value="סדרות">סדרות</option>
                  <option value="ילדים">ילדים</option>
                  <option value="פעולה">פעולה</option>
                </select>
              </div>

              {type === "series" && (
                <div style={gridIn}>
                  <input placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inStyle} />
                  <input placeholder="מספר פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} />
                </div>
              )}

              <input placeholder="מזהה Rumble (Video ID)" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
              <textarea placeholder="תקציר..." value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height:'100px'}} />

              <button onClick={() => saveMutation.mutate({
                title: type === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
                description, video_id: url, category, thumbnail_url: thumb,
                metadata: { season, episode }
              })} style={btnMain}>שמור ופרסם באתר</button>
            </div>

            <div style={{marginTop:'30px'}}>
              <h3>ניהול מלאי קיים</h3>
              <div style={card}>
                <h4 style={subLabel}>סרטים</h4>
                {groupedContent.movies.map(m => (
                  <div key={m.id} style={row}>
                    <span>{m.title}</span>
                    <div style={{display:'flex', gap:'10px'}}>
                      <button onClick={() => { setEditingId(m.id); setTitle(m.title); setUrl(m.video_id); setThumb(m.thumbnail_url); setType("movie"); }} style={actionBtn}><Edit2 size={14}/></button>
                      <button onClick={() => base44.entities.Movie.delete(m.id).then(()=>queryClient.invalidateQueries(["movies"]))} style={actionBtn}><Trash2 size={14} color="red"/></button>
                    </div>
                  </div>
                ))}

                <h4 style={{...subLabel, marginTop:'20px'}}>סדרות</h4>
                {Object.entries(groupedContent.series).map(([name, eps]) => (
                  <div key={name} style={seriesBox}>
                    <div onClick={() => setExpandedSeries(expandedSeries === name ? null : name)} style={seriesHeader}>
                      <span style={{fontWeight:'bold'}}>{name} ({eps.length} פרקים)</span>
                      {expandedSeries === name ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </div>
                    {expandedSeries === name && (
                      <div style={epList}>
                        {eps.map(ep => (
                          <div key={ep.id} style={epRow}>
                            <span>{ep.title}</span>
                            <div style={{display:'flex', gap:'10px'}}>
                              <button onClick={() => { setEditingId(ep.id); setTitle(name); setUrl(ep.video_id); setThumb(ep.thumbnail_url); setType("series"); setSeason(ep.metadata?.season); setEpisode(ep.metadata?.episode); }} style={actionBtn}><Edit2 size={12}/></button>
                              <button onClick={() => base44.entities.Movie.delete(ep.id).then(()=>queryClient.invalidateQueries(["movies"]))} style={actionBtn}><Trash2 size={12} color="red"/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

// עיצוב (CSS-in-JS) - לבן ונקי
const adminLayout = { background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant, sans-serif", color: "#1D1D1F" };
const header = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E5E5E5", position: "sticky", top: 0, zIndex: 100 };
const logo = { fontSize: "24px", fontWeight: "900" };
const nav = { display: "flex", gap: "20px", alignItems: "center" };
const exitLink = { color: "#0071E3", textDecoration: "none", fontWeight: "bold" };
const mainContainer = { maxWidth: "850px", margin: "40px auto", padding: "0 20px" };
const card = { background: "#fff", padding: "30px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #E5E5E5" };
const inStyle = { width: "100%", padding: "12px", margin: "8px 0", borderRadius: "12px", border: "1px solid #D2D2D7", background: "#FBFBFD", fontSize: "16px", outline: "none" };
const btnMain = { background: "#0071E3", color: "#fff", border: "none", padding: "16px", borderRadius: "12px", width: "100%", fontWeight: "bold", cursor: "pointer", marginTop: "15px", fontSize: "16px" };
const typeBar = { display: "flex", gap: "10px", marginBottom: "20px" };
const activeType = { flex: 1, padding: "12px", background: "#0071E3", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold" };
const inactiveType = { flex: 1, padding: "12px", background: "#F5F5F7", color: "#1D1D1F", border: "1px solid #D2D2D7", borderRadius: "10px", cursor: "pointer" };
const gridIn = { display: "flex", gap: "10px" };
const aiBtn = { background: "#F5F5F7", color: "#0071E3", border: "1px solid #0071E3", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold" };
const row = { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F5F5F7" };
const actionBtn = { background: "#F5F5F7", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" };
const iconBtn = { background: "none", border: "none", cursor: "pointer", color: "#86868B" };
const subLabel = { color: "#86868B", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" };
const seriesBox = { border: "1px solid #F5F5F7", borderRadius: "12px", marginBottom: "10px", overflow: "hidden" };
const seriesHeader = { padding: "15px", background: "#FBFBFD", display: "flex", justifyContent: "space-between", cursor: "pointer" };
const epList = { padding: "10px 20px", background: "#fff" };
const epRow = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F5F5F7", fontSize: "14px" };
const authContainer = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F5F5F7" };
const statusRow = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" };
const statusItem = { padding: "15px", background: "#F5F5F7", borderRadius: "12px", textAlign: "right" };