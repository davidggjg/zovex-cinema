import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Settings, Plus, Sparkles, ChevronDown, ChevronUp, Image as ImageIcon, XCircle, CheckCircle } from "lucide-react";

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
  const [isUploading, setIsUploading] = useState(false);

  const { data: allItems = [] } = useQuery({ 
    queryKey: ["movies"], 
    queryFn: () => base44.entities.Movie.list("-created_date") 
  });

  // העלאת תמונה מהגלריה בטלפון
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const uploadedFile = await base44.uploadFile(file);
      setThumb(uploadedFile.url); // הכתובת של התמונה נכנסת אוטומטית לשדה הקישור
      alert("התמונה הועלתה בהצלחה!");
    } catch (err) {
      alert("שגיאה בהעלאת הקובץ");
    } finally {
      setIsUploading(false);
    }
  };

  // משיכת נתונים אוטומטית מ-TMDB
  const fetchAutoData = async () => {
    if (!tmdbKey) return alert("חובה להזין מפתח TMDB בהגדרות!");
    if (!title) return alert("רשום קודם את שם הסרט/סדרה");
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&language=he-IL`);
      const data = await res.json();
      if (data.results?.[0]) {
        const item = data.results[0];
        setDescription(item.overview || "");
        setThumb(`https://image.tmdb.org/t/p/w500${item.poster_path}`);
        alert("הנתונים נמשכו בהצלחה!");
      }
    } catch (e) { alert("שגיאה בחיבור"); }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { 
        queryClient.invalidateQueries(["movies"]); 
        resetForm(); 
        alert(editingId ? "התוכן עודכן בהצלחה!" : "התוכן פורסם בהצלחה!"); 
    }
  });

  const deleteItem = (id) => {
    if (window.confirm("⚠️ אתה בטוח שאתה רוצה למחוק את זה? הפעולה היא סופית!")) {
      base44.entities.Movie.delete(id).then(() => queryClient.invalidateQueries(["movies"]));
    }
  };

  const resetForm = () => { 
    setEditingId(null); setTitle(""); setUrl(""); setThumb(""); 
    setDescription(""); setEpisode(""); setSeason("1"); setType("movie");
  };

  const grouped = useMemo(() => {
    const res = { movies: [], series: {} };
    allItems.forEach(item => {
      if (item.category === "סדרות") {
        const baseName = item.title.split(" - ")[0].trim();
        if (!res.series[baseName]) res.series[baseName] = [];
        res.series[baseName].push(item);
      } else {
        res.movies.push(item);
      }
    });
    return res;
  }, [allItems]);

  if (!isAuthorized) return (
    <div style={authStyle}><div style={cardStyle}><h2>כניסת מנהל</h2><input type="password" placeholder="קוד גישה" onChange={e => setPasscode(e.target.value)} style={inStyle} /><button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי")} style={btnMain}>כניסה</button></div></div>
  );

  return (
    <div style={adminLayout}>
      <header style={headerStyle}>
        <div style={logoStyle}>ZO<span>VEX</span> ניהול</div>
        <div style={{display:'flex', gap:'15px'}}>
          <button onClick={() => setActiveTab("keys")} style={iconBtn}><Settings/></button>
          <button onClick={() => setActiveTab("content")} style={iconBtn}><Plus/></button>
          <Link to="/" style={linkStyle}>לאתר</Link>
        </div>
      </header>

      <div style={container}>
        {activeTab === "keys" ? (
          <div style={cardStyle}>
            <h3>הגדרות API</h3>
            <input type="password" placeholder="מפתח TMDB" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
            <button onClick={() => alert("נשמר!")} style={btnMain}>שמור</button>
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                <h3>{editingId ? "🛠️ עריכת תוכן" : "➕ הוספת תוכן"}</h3>
                <button onClick={fetchAutoData} style={aiBtn}><Sparkles size={16}/> משיכת נתונים אוטומטית</button>
              </div>

              <div style={typeRow}>
                <button onClick={() => {setType("movie"); setCategory("סרטים")}} style={type === "movie" ? activeT : inactiveT}>סרט</button>
                <button onClick={() => {setType("series"); setCategory("סדרות")}} style={type === "series" ? activeT : inactiveT}>סדרה</button>
              </div>

              <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
              
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <input placeholder="קישור לתמונה" value={thumb} onChange={e => setThumb(e.target.value)} style={{...inStyle, flex: 1}} />
                <label style={uploadBtn}>
                    {isUploading ? "טוען..." : <><ImageIcon size={18}/> גלריה</>}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{display:'none'}} />
                </label>
              </div>
              
              {type === "series" && (
                <div style={{display:'flex', gap:'10px'}}>
                  <input placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inStyle} />
                  <input placeholder="מספר פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} />
                </div>
              )}

              <input placeholder="מזהה Rumble ID" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
              <textarea placeholder="תקציר..." value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height:'80px'}} />

              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => saveMutation.mutate({
                    title: type === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
                    description, video_id: url, category, thumbnail_url: thumb,
                    metadata: { season, episode }
                })} style={btnMain}>
                    {editingId ? "עדכן תוכן עכשיו" : "פרסם באתר"}
                </button>
                {editingId && (
                    <button onClick={resetForm} style={{...btnMain, background:'#FF3B30', width:'150px'}}>ביטול</button>
                )}
              </div>
            </div>

            <div style={{marginTop:'30px'}}>
              <h3>מלאי סרטים</h3>
              <div style={cardStyle}>
                {grouped.movies.map(m => (
                  <div key={m.id} style={itemRow}>
                    <span>{m.title}</span>
                    <div>
                      <button onClick={() => { setEditingId(m.id); setTitle(m.title); setUrl(m.video_id); setThumb(m.thumbnail_url); setType("movie"); window.scrollTo(0,0); }} style={actionBtn}><Edit2 size={16} color="#0071E3"/></button>
                      <button onClick={() => deleteItem(m.id)} style={actionBtn}><Trash2 size={16} color="#FF3B30"/></button>
                    </div>
                  </div>
                ))}

                <h3 style={{marginTop:'30px'}}>מלאי סדרות</h3>
                {Object.entries(grouped.series).map(([name, eps]) => (
                  <div key={name} style={seriesBox}>
                    <div onClick={() => setExpandedSeries(expandedSeries === name ? null : name)} style={seriesHeader}>
                      <span>{name} ({eps.length} פרקים)</span>
                      {expandedSeries === name ? <ChevronUp/> : <ChevronDown/>}
                    </div>
                    {expandedSeries === name && (
                      <div style={epListAdmin}>
                        {eps.map(ep => (
                          <div key={ep.id} style={itemRow}>
                            <span style={{fontSize:'14px'}}>עונה {ep.metadata?.season} פרק {ep.metadata?.episode}</span>
                            <div>
                              <button onClick={() => { 
                                setEditingId(ep.id); setTitle(name); setUrl(ep.video_id); 
                                setThumb(ep.thumbnail_url); setType("series");
                                setSeason(ep.metadata?.season || "1"); setEpisode(ep.metadata?.episode || "");
                                window.scrollTo(0,0);
                              }} style={actionBtn}><Edit2 size={14} color="#0071E3"/></button>
                              <button onClick={() => deleteItem(ep.id)} style={actionBtn}><Trash2 size={14} color="#FF3B30"/></button>
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
const adminLayout = { background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" };
const headerStyle = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", position:'sticky', top:0, zIndex:100 };
const logoStyle = { fontSize: "22px", fontWeight: "900" };
const container = { maxWidth: "800px", margin: "20px auto", padding: "0 20px" };
const cardStyle = { background: "#fff", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #eee", marginBottom:'20px' };
const inStyle = { width: "100%", padding: "12px", margin: "8px 0", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px", outline: "none" };
const btnMain = { background: "#0071E3", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", width: "100%", fontWeight: "bold", cursor: "pointer" };
const uploadBtn = { background: "#34C759", color: "#fff", padding: "12px 20px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", whiteSpace:'nowrap' };
const aiBtn = { background: "#F5F5F7", color: "#0071E3", border: "1px solid #0071E3", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" };
const typeRow = { display: "flex", gap: "10px", marginBottom: "15px" };
const activeT = { flex: 1, padding: "12px", background: "#0071E3", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold" };
const inactiveT = { flex: 1, padding: "12px", background: "#f5f5f7", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" };
const itemRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f9f9f9" };
const actionBtn = { background: "#F5F5F7", border: "none", cursor: "pointer", padding: "8px", borderRadius: "8px", marginLeft: "5px" };
const seriesBox = { border: "1px solid #eee", borderRadius: "12px", marginBottom: "10px", overflow: "hidden" };
const seriesHeader = { padding: "15px", background: "#fbfbfd", display: "flex", justifyContent: "space-between", cursor: "pointer", fontWeight: "bold" };
const epListAdmin = { padding: "10px 20px", background: "#fff" };
const iconBtn = { background: "none", border: "none", cursor: "pointer", color: "#555" };
const linkStyle = { color: "#0071E3", textDecoration: "none", fontWeight: "bold" };
const authStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F5F5F7" };