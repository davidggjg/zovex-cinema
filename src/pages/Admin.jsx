import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Edit2, Trash2, Tv, Film, Settings, PlusCircle } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); // add | keys
  const [inventoryCat, setInventoryCat] = useState("הכל");
  const queryClient = useQueryClient();

  // מפתחות API
  const [groqKey, setGroqKey] = useState(localStorage.getItem("groq_key") || "");
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem("tmdb_key") || "");

  // שדות טופס
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("movie"); // movie | series
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("פעולה");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("");

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const categories = useMemo(() => ["הכל", ...new Set(allItems.map(i => i.category).filter(Boolean))], [allItems]);

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      resetForm();
      alert("נשמר בהצלחה!");
    },
  });

  const resetForm = () => {
    setEditingId(null); setTitle(""); setUrl(""); setDescription(""); setEpisode("");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title.split(" - עונה")[0]);
    setUrl(item.video_id);
    setDescription(item.description);
    setCategory(item.category);
    if (item.metadata?.season) { setType("series"); setSeason(item.metadata.season); setEpisode(item.metadata.episode); }
    else { setType("movie"); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthorized) {
    return (
      <div style={authBg}>
        <div style={authCard}>
          <h2 style={{color: '#0071E3'}}>ZOVEX CONTROL</h2>
          <input type="password" placeholder="קוד גישה סודי" onChange={e => setPasscode(e.target.value)} style={inStyle} />
          <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי")} style={btnStyle}>כניסה למערכת</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" }}>
      <header style={headStyle}>
        <div style={{fontWeight:900, fontSize:'22px'}}>ZO<span style={{color:'#0071E3'}}>VEX</span> ADMIN</div>
        <div style={{display:'flex', gap:'15px'}}>
            <button onClick={() => setActiveTab('keys')} style={tabIconBtn}><Settings size={18} /></button>
            <Link to="/" style={{textDecoration:'none', color:'#0071E3', fontWeight:700}}>חזרה לאתר</Link>
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "30px auto", padding: "0 20px" }}>
        
        {activeTab === 'keys' ? (
          <div style={card}>
            <h3>הגדרות מפתחות API</h3>
            <input type="password" placeholder="Groq API Key" value={groqKey} onChange={e => {setGroqKey(e.target.value); localStorage.setItem("groq_key", e.target.value)}} style={inStyle} />
            <input type="password" placeholder="TMDB API Key" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
            <button onClick={() => setActiveTab('add')} style={btnStyle}>חזור לניהול תוכן</button>
          </div>
        ) : (
          <div style={card}>
            <h3>{editingId ? "עריכת תוכן" : "הוספת תוכן חדש"}</h3>
            <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                <button onClick={() => setType('movie')} style={type === 'movie' ? activeType : inactiveType}>🎬 סרט</button>
                <button onClick={() => setType('series')} style={type === 'series' ? activeType : inactiveType}>📺 סדרה</button>
            </div>
            <input placeholder="שם" value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
            {type === 'series' && (
                <div style={{display:'flex', gap:'10px'}}>
                    <input type="number" placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inStyle} />
                    <input type="number" placeholder="פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} />
                </div>
            )}
            <input placeholder="מזהה וידאו (ID)" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
            <textarea placeholder="תקציר..." value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height:'80px'}} />
            <select value={category} onChange={e => setCategory(e.target.value)} style={inStyle}>
                <option value="פעולה">פעולה</option>
                <option value="דרמה">דרמה</option>
                <option value="קומדיה">קומדיה</option>
                <option value="ילדים">ילדים</option>
                <option value="סדרות">סדרות</option>
            </select>
            <button onClick={() => saveMutation.mutate({
                title: type === 'series' ? `${title} - עונה ${season} פרק ${episode}` : title,
                description, video_id: url, category, metadata: type === 'series' ? {season, episode} : {}
            })} style={btnStyle}>{editingId ? "עדכן שינויים" : "פרסם עכשיו"}</button>
            {editingId && <button onClick={resetForm} style={{background:'none', border:'none', color:'red', width:'100%', marginTop:'10px', cursor:'pointer'}}>ביטול עריכה</button>}
          </div>
        )}

        <div style={{marginTop:'40px'}}>
            <h2>ניהול מלאי</h2>
            <div style={{display:'flex', gap:'10px', overflowX:'auto', marginBottom:'20px'}}>
                {categories.map(c => (
                    <button key={c} onClick={() => setInventoryCat(c)} style={inventoryCat === c ? activeCatBtn : inactiveCatBtn}>{c}</button>
                ))}
            </div>
            <div style={card}>
                {allItems.filter(i => inventoryCat === "הכל" || i.category === inventoryCat).map(item => (
                    <div key={item.id} style={row}>
                        <span>{item.title}</span>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={() => startEdit(item)} style={iconBtn}><Edit2 size={14}/></button>
                            <button onClick={() => base44.entities.Movie.delete(item.id).then(() => queryClient.invalidateQueries(["movies"]))} style={iconBtn}><Trash2 size={14} color="red"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const authBg = { height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#F5F5F7' };
const authCard = { background:'#fff', padding:'40px', borderRadius:'25px', textAlign:'center', boxShadow:'0 10px 40px rgba(0,0,0,0.05)' };
const headStyle = { background:'#fff', padding:'15px 5%', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #E5E5E5' };
const card = { background:'#fff', padding:'25px', borderRadius:'20px', boxShadow:'0 4px 20px rgba(0,0,0,0.03)' };
const inStyle = { width:'100%', padding:'12px', margin:'8px 0', borderRadius:'10px', border:'1px solid #DDD', fontSize:'16px' };
const btnStyle = { background:'#0071E3', color:'#fff', border:'none', padding:'14px', borderRadius:'10px', width:'100%', fontWeight:'bold', cursor:'pointer' };
const row = { display:'flex', justifyContent:'space-between', padding:'12px', borderBottom:'1px solid #F5F5F7' };
const iconBtn = { background:'#F5F5F7', border:'none', padding:'8px', borderRadius:'8px', cursor:'pointer' };
const tabIconBtn = { background:'none', border:'none', cursor:'pointer', color:'#666' };
const inactiveType = { flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #DDD', background:'#fff', cursor:'pointer' };
const activeType = { ...inactiveType, background:'#0071E3', color:'#fff', border:'none' };
const inactiveCatBtn = { padding:'8px 15px', borderRadius:'20px', border:'none', background:'#E8E8ED', whiteSpace:'nowrap', cursor:'pointer' };
const activeCatBtn = { ...inactiveCatBtn, background:'#0071E3', color:'#fff' };