import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Settings, Plus, Sparkles, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [expandedSeries, setExpandedSeries] = useState(null);
  const queryClient = useQueryClient();

  // מפתחות והגדרות
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem("tmdb_key") || "");
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("movie");
  
  // שדות הטופס
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [thumb, setThumb] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("סרטים");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("");

  const { data: allItems = [] } = useQuery({ 
    queryKey: ["movies"], 
    queryFn: () => base44.entities.Movie.list("-created_date") 
  });

  // פונקציית הקסם - משיכת נתונים אוטומטית (כולל תמונה ותיאור)
  const fetchAutoData = async () => {
    if (!tmdbKey) return alert("חובה להזין מפתח TMDB בהגדרות!");
    if (!title) return alert("רשום קודם את שם הסרט/סדרה");
    
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&language=he-IL`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        const item = data.results[0];
        setDescription(item.overview || "");
        setThumb(`https://image.tmdb.org/t/p/w500${item.poster_path}`);
        alert("הנתונים (תמונה ותיאור) נמשכו בהצלחה!");
      } else {
        alert("לא נמצאו תוצאות לשם זה.");
      }
    } catch (e) { alert("שגיאה בחיבור לשרת הנתונים"); }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["movies"]); resetForm(); alert("נשמר בהצלחה!"); }
  });

  const deleteItem = (id) => {
    if (window.confirm("אתה בטוח שאתה רוצה למחוק את זה? הפעולה לא ניתנת לביטול.")) {
      base44.entities.Movie.delete(id).then(() => queryClient.invalidateQueries(["movies"]));
    }
  };

  const resetForm = () => { setEditingId(null); setTitle(""); setUrl(""); setThumb(""); setDescription(""); setEpisode(""); };

  // סידור הסדרות לקבוצות
  const grouped = useMemo(() => {
    const res = { movies: [], series: {} };
    allItems.forEach(item => {
      if (item.category === "סדרות") {
        const baseName = item.title.split(" - ")[0];
        if (!res.series[baseName]) res.series[baseName] = [];
        res.series[baseName].push(item);
      } else {
        res.movies.push(item);
      }
    });
    return res;
  }, [allItems]);

  if (!isAuthorized) return (
    <div style={authStyle}>
      <div style={cardStyle}>
        <h2>כניסת מנהל</h2>
        <input type="password" placeholder="קוד גישה" onChange={e => setPasscode(e.target.value)} style={inStyle} />
        <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי")} style={btnMain}>כניסה</button>
      </div>
    </div>
  );

  return (
    <div style={adminLayout}>
      <header style={headerStyle}>
        <div style={logoStyle}>ZO<span>VEX</span></div>
        <div style={{display:'flex', gap:'15px'}}>
          <button onClick={() => setActiveTab("keys")} style={iconBtn}><Settings/></button>
          <button onClick={() => setActiveTab("content")} style={iconBtn}><Plus/></button>
          <Link to="/" style={linkStyle}>חזרה לאתר</Link>
        </div>
      </header>

      <div style={container}>
        {activeTab === "keys" ? (
          <div style={cardStyle}>
            <h3>הגדרות מערכת</h3>
            <label>מפתח TMDB (למשיכת תמונות ותקצירים):</label>
            <input type="password" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
            <button onClick={() => alert("המפתח נשמר!")} style={btnMain}>שמור הגדרות</button>
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                <h3>{editingId ? "עריכת תוכן" : "הוספת תוכן"}</h3>
                <button onClick={fetchAutoData} style={aiBtn}><Sparkles size={16}/> משוך תמונה ותקציר אוטומטית</button>
              </div>

              <div style={typeRow}>
                <button onClick={() => {setType("movie"); setCategory("סרטים")}} style={type === "movie" ? activeT : inactiveT}>סרט</button>
                <button onClick={() => {setType("series"); setCategory("סדרות")}} style={type === "series" ? activeT : inactiveT}>סדרה</button>
              </div>

              <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
              <input placeholder="קישור לתמונה (URL)" value={thumb} onChange={e => setThumb(e.target.value)} style={inStyle} />
              
              {type === "series" && (
                <div style={{display:'flex', gap:'10px'}}>
                  <input placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inStyle} />
                  <input placeholder="מספר פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} />
                </div>
              )}

              <input placeholder="מזהה וידאו (Rumble ID)" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
              <textarea placeholder="תקציר..." value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height:'100px'}} />

              <button onClick={() => saveMutation.mutate({
                title: type === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
                description, video_id: url, category, thumbnail_url: thumb,
                metadata: { season, episode }
              })} style={btnMain}>שמור ופרסם</button>
            </div>

            <div style={{marginTop:'30px'}}>
              <h3>ניהול סרטים</h3>
              <div style={cardStyle}>
                {grouped.movies.map(m => (
                  <div key={m.id} style={itemRow}>
                    <span>{m.title}</span>
                    <div>
                      <button onClick={() => { setEditingId(m.id); setTitle(m.title); setUrl(m.video_id); setThumb(m.thumbnail_url); setType("movie"); }} style={actionBtn}><Edit2 size={14}/></button>
                      <button onClick={() => deleteItem(m.id)} style={actionBtn}><Trash2 size={14} color="red"/></button>
                    </div>
                  </div>
                ))}

                <h3 style={{marginTop:'30px'}}>ניהול סדרות</h3>
                {Object.entries(grouped.series).map(([name, eps]) => (
                  <div key={name} style={seriesContainer}>
                    <div onClick={() => setExpandedSeries(expandedSeries === name ? null : name)} style={seriesHeader}>
                      <span>{name} ({eps.length} פרקים)</span>
                      {expandedSeries === name ? <ChevronUp/> : <ChevronDown/>}
                    </div>
                    {expandedSeries === name && (
                      <div style={epListAdmin}>
                        {eps.map(ep => (
                          <div key={ep.id} style={itemRow}>
                            <small>עונה {ep.metadata?.season} פרק {ep.metadata?.episode}</small>
                            <div>
                              <button onClick={() => { 
                                setEditingId(ep.id); 
                                setTitle(name); 
                                setUrl(ep.video_id); 
                                setThumb(ep.thumbnail_url);
                                setType("series");
                                setSeason(ep.metadata?.season || "1");
                                setEpisode(ep.metadata?.episode || "");
                              }} style={actionBtn}><Edit2 size={12}/></button>
                              <button onClick={() => deleteItem(ep.id)} style={actionBtn}><Trash2 size={12} color="red"/></button>
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

// Styles (Apple White Clean)
const adminLayout = { background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" };
const headerStyle = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd" };
const logoStyle = { fontSize: "24px", fontWeight: "900" };
const container = { maxWidth: "800px", margin: "30px auto", padding: "0 20px" };
const cardStyle = { background: "#fff", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #eee" };
const inStyle = { width: "100%", padding: "12px", margin: "8px 0", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px", outline: "none" };
const btnMain = { background: "#0071E3", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", width: "100%", fontWeight: "bold", cursor: "pointer", marginTop: "10px" };
const aiBtn = { background: "#F5F5F7", color: "#0071E3", border: "1px solid #0071E3", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" };
const typeRow = { display: "flex", gap: "10px", marginBottom: "15px" };
const activeT = { flex: 1, padding: "12px", background: "#0071E3", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold" };
const inactiveT = { flex: 1, padding: "12px", background: "#f5f5f7", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" };
const itemRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9f9f9" };
const actionBtn = { background: "none", border: "none", cursor: "pointer", padding: "5px" };
const seriesContainer = { border: "1px solid #eee", borderRadius: "10px", marginBottom: "10px", overflow: "hidden" };
const seriesHeader = { padding: "15px", background: "#fbfbfd", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "bold" };
const epListAdmin = { padding: "10px 20px", background: "#fff" };
const iconBtn = { background: "none", border: "none", cursor: "pointer", color: "#555" };
const linkStyle = { color: "#0071E3", textDecoration: "none", fontWeight: "bold" };
const authStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F5F5F7" };