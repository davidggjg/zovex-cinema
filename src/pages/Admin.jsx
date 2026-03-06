import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Settings, Plus, Sparkles, Loader2, Film, Tv, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

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
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("");

  const { data: movies = [] } = useQuery({ queryKey: ["movies"], queryFn: () => base44.entities.Movie.list("-created_date") });

  // בדיקת תקינות מפתחות
  useEffect(() => {
    const checkKeys = async () => {
      if (groqKey) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${groqKey}` } });
          setStatus(prev => ({ ...prev, groq: res.ok ? "ok" : "invalid" }));
        } catch { setStatus(prev => ({ ...prev, groq: "error" })); }
      }
      if (tmdbKey) {
        try {
          const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`);
          setStatus(prev => ({ ...prev, tmdb: res.ok ? "ok" : "invalid" }));
        } catch { setStatus(prev => ({ ...prev, tmdb: "error" })); }
      }
    };
    checkKeys();
  }, [groqKey, tmdbKey]);

  // פונקציית הקסם: משיכת מידע אוטומטי (תמונה, שנה, תקציר)
  const autoFill = async () => {
    if (!tmdbKey) return alert("חובה מפתח TMDB בהגדרות!");
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&language=he-IL`);
      const data = await res.json();
      if (data.results?.[0]) {
        const item = data.results[0];
        const year = (item.release_date || item.first_air_date || "").split("-")[0];
        setTitle(prev => year ? `${prev} (${year})` : prev);
        setDescription(item.overview);
        const imgUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        // שמירת התמונה בתוך שדה נסתר או מטריקה
        localStorage.setItem("temp_thumb", imgUrl);
        alert("המידע נמשך בהצלחה!");
      }
    } catch { alert("שגיאה במשיכת נתונים"); }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["movies"]); resetForm(); }
  });

  const resetForm = () => { setEditingId(null); setTitle(""); setUrl(""); setDescription(""); setEpisode(""); };

  // קיבוץ סדרות לתצוגת ניהול
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
    <div style={authStyle}>
      <div style={cardStyle}>
        <h2 style={{color:'#0071E3'}}>ZOVEX TERMINAL</h2>
        <input type="password" placeholder="Passcode" onChange={e => setPasscode(e.target.value)} style={inStyle} />
        <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("Access Denied")} style={btnMain}>AUTHORIZE</button>
      </div>
    </div>
  );

  return (
    <div style={adminBg}>
      <header style={headerStyle}>
        <div style={logoStyle}>ZO<span>VEX</span> 🛰️</div>
        <div style={{display:'flex', gap:'10px'}}>
          <button onClick={() => setActiveTab("keys")} style={iconBtn}><Settings/></button>
          <button onClick={() => setActiveTab("content")} style={iconBtn}><Plus/></button>
          <Link to="/" style={linkStyle}>EXIT</Link>
        </div>
      </header>

      <div style={contentWrap}>
        {activeTab === "keys" ? (
          <div style={cardStyle}>
            <h3>Key Management Center</h3>
            <div style={statusGrid}>
              <div style={statusBox}>
                <span>Groq AI (Summaries)</span>
                {status.groq === "ok" ? <CheckCircle color="green"/> : <XCircle color="red"/>}
                <input type="password" value={groqKey} onChange={e => {setGroqKey(e.target.value); localStorage.setItem("groq_key", e.target.value)}} style={inStyle} />
              </div>
              <div style={statusBox}>
                <span>TMDB API (Images/Metadata)</span>
                {status.tmdb === "ok" ? <CheckCircle color="green"/> : <XCircle color="red"/>}
                <input type="password" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <h3>{editingId ? "Edit Content" : "Add Content"}</h3>
                <button onClick={autoFill} style={aiBtn}><Sparkles size={16}/> Auto-Fill Info</button>
              </div>
              <div style={typeRow}>
                <button onClick={() => setType("movie")} style={type === "movie" ? activeT : inactiveT}>Movie</button>
                <button onClick={() => setType("series")} style={type === "series" ? activeT : inactiveT}>Series</button>
              </div>
              <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
              {type === "series" && (
                <div style={{display:'flex', gap:'10px'}}>
                  <input placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inStyle} />
                  <input placeholder="פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} />
                </div>
              )}
              <input placeholder="Rumble ID" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
              <textarea placeholder="תקציר..." value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height:'80px'}} />
              <button onClick={() => saveMutation.mutate({
                title: type === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
                description, video_id: url, category: type === "series" ? "סדרות" : "סרטים",
                thumbnail_url: localStorage.getItem("temp_thumb"),
                metadata: { season, episode }
              })} style={btnMain}>DEPLOY CONTENT</button>
            </div>

            <div style={{marginTop:'30px'}}>
              <h3>Inventory Management</h3>
              <div style={cardStyle}>
                <h4>Movies</h4>
                {groupedContent.movies.map(m => (
                  <div key={m.id} style={itemRow}>
                    <span>{m.title}</span>
                    <div>
                      <button onClick={() => { setEditingId(m.id); setTitle(m.title); setUrl(m.video_id); setType("movie"); }} style={iconBtn}><Edit2 size={14}/></button>
                      <button onClick={() => base44.entities.Movie.delete(m.id).then(()=>queryClient.invalidateQueries(["movies"]))} style={iconBtn}><Trash2 size={14} color="red"/></button>
                    </div>
                  </div>
                ))}

                <h4 style={{marginTop:'20px'}}>Series</h4>
                {Object.entries(groupedContent.series).map(([name, eps]) => (
                  <div key={name} style={{borderBottom:'1px solid #eee', marginBottom:'5px'}}>
                    <div onClick={() => setExpandedSeries(expandedSeries === name ? null : name)} style={{cursor:'pointer', padding:'10px', display:'flex', justifyContent:'space-between', background:'#f9f9f9'}}>
                      <div style={{fontWeight:'bold'}}>{name} ({eps.length} פרקים)</div>
                      {expandedSeries === name ? <ChevronUp/> : <ChevronDown/>}
                    </div>
                    {expandedSeries === name && (
                      <div style={{padding:'10px', background:'#fff'}}>
                        {eps.map(ep => (
                          <div key={ep.id} style={itemRow}>
                            <small>{ep.title}</small>
                            <div>
                              <button onClick={() => { setEditingId(ep.id); setTitle(name); setUrl(ep.video_id); setType("series"); }} style={iconBtn}><Edit2 size={12}/></button>
                              <button onClick={() => base44.entities.Movie.delete(ep.id).then(()=>queryClient.invalidateQueries(["movies"]))} style={iconBtn}><Trash2 size={12} color="red"/></button>
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

// Styles
const adminBg = { background: "#0F172A", minHeight: "100vh", color: "#E2E8F0", direction: "rtl", fontFamily: "Assistant" };
const headerStyle = { background: "#1E293B", padding: "15px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" };
const logoStyle = { fontSize: "24px", fontWeight: "900", color: "#fff" };
const contentWrap = { maxWidth: "800px", margin: "30px auto", padding: "0 20px" };
const cardStyle = { background: "#1E293B", padding: "25px", borderRadius: "15px", border: "1px solid #334155" };
const inStyle = { width: "100%", padding: "12px", margin: "8px 0", borderRadius: "8px", border: "1px solid #334155", background: "#0F172A", color: "#fff", outline: "none" };
const btnMain = { background: "#3B82F6", color: "#fff", border: "none", padding: "14px", borderRadius: "8px", width: "100%", fontWeight: "bold", cursor: "pointer", marginTop: "10px" };
const statusGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" };
const statusBox = { padding: "15px", background: "#334155", borderRadius: "10px", textAlign: "center" };
const aiBtn = { background: "#8B5CF6", color: "#fff", border: "none", padding: "5px 15px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" };
const typeRow = { display: "flex", gap: "10px", margin: "15px 0" };
const activeT = { flex: 1, padding: "10px", background: "#3B82F6", border: "none", color: "#fff", borderRadius: "8px" };
const inactiveT = { flex: 1, padding: "10px", background: "#334155", border: "none", color: "#94A3B8", borderRadius: "8px", cursor: "pointer" };
const itemRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #334155" };
const iconBtn = { background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: "5px" };
const linkStyle = { color: "#3B82F6", textDecoration: "none", fontWeight: "bold" };
const authStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0F172A" };