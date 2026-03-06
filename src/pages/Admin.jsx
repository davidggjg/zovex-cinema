import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Settings, Plus, Sparkles, ChevronDown, ChevronUp, Image as ImageIcon, Search, Check } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [expandedSeries, setExpandedSeries] = useState(null);
  const queryClient = useQueryClient();

  // TMDB Logic
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem("tmdb_key") || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("movie");
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

  // חיפוש ב-TMDB
  const searchTMDB = async () => {
    if (!tmdbKey) return alert("הזן מפתח TMDB בהגדרות קודם");
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(searchQuery)}&language=he-IL`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) { alert("שגיאה בחיבור ל-TMDB"); }
    finally { setIsSearching(false); }
  };

  // בחירת תוצאה מהחיפוש
  const selectResult = (item) => {
    const name = item.title || item.name;
    const year = (item.release_date || item.first_air_date || "").split("-")[0];
    setTitle(`${name}${year ? ` (${year})` : ""}`);
    setDescription(item.overview || "");
    setThumb(`https://image.tmdb.org/t/p/w500${item.poster_path}`);
    setSearchResults([]);
    setSearchQuery("");
    alert("הנתונים הוזנו בהצלחה!");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadedFile = await base44.uploadFile(file);
      setThumb(uploadedFile.url);
    } catch (err) { alert("שגיאה בהעלאה"); }
    finally { setIsUploading(false); }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["movies"]); resetForm(); alert("נשמר בהצלחה!"); }
  });

  const deleteItem = (id) => {
    if (window.confirm("⚠️ למחוק את הפריט?")) {
      base44.entities.Movie.delete(id).then(() => queryClient.invalidateQueries(["movies"]));
    }
  };

  const resetForm = () => {
    setEditingId(null); setTitle(""); setUrl(""); setThumb(""); 
    setDescription(""); setEpisode(""); setSeason("1");
  };

  const grouped = useMemo(() => {
    const res = { movies: [], series: {} };
    allItems.forEach(item => {
      if (item.category === "סדרות") {
        const baseName = item.title.split(" - ")[0].split(" (")[0].trim();
        if (!res.series[baseName]) res.series[baseName] = [];
        res.series[baseName].push(item);
      } else { res.movies.push(item); }
    });
    return res;
  }, [allItems]);

  if (!isAuthorized) return (
    <div style={authStyle}><div style={cardStyle}><h2>ZOVEX ADMIN</h2><input type="password" placeholder="קוד גישה" onChange={e => setPasscode(e.target.value)} style={inStyle} /><button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("טעות")} style={btnMain}>כניסה</button></div></div>
  );

  return (
    <div style={adminLayout}>
      <header style={headerStyle}>
        <div style={logoStyle}>ZO<span>VEX</span> ADMIN</div>
        <div style={{display:'flex', gap:'15px'}}>
          <button onClick={() => setActiveTab("keys")} style={iconBtn}><Settings/></button>
          <button onClick={() => setActiveTab("content")} style={iconBtn}><Plus/></button>
          <Link to="/" style={linkStyle}>חזרה לאתר</Link>
        </div>
      </header>

      <div style={container}>
        {activeTab === "keys" ? (
          <div style={cardStyle}>
            <h3>הגדרות מפתחות</h3>
            <label>TMDB API Key (חובה לחיפוש אוטומטי):</label>
            <input type="password" placeholder="הדבק כאן את המפתח מ-TMDB" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
          </div>
        ) : (
          <>
            {/* פאנל חיפוש TMDB */}
            <div style={{...cardStyle, background: '#eef6ff', border: '2px solid #0071E3'}}>
              <h4 style={{marginTop: 0, color: '#0071E3'}}><Sparkles size={18} /> חיפוש מהיר ב-TMDB</h4>
              <div style={{display:'flex', gap:'10px'}}>
                <input 
                  placeholder="כתוב שם של סרט או סדרה..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && searchTMDB()}
                  style={inStyle} 
                />
                <button onClick={searchTMDB} style={{...btnMain, width:'120px'}} disabled={isSearching}>
                  {isSearching ? "בודק..." : "חפש"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={resultsBox}>
                  {searchResults.slice(0, 5).map(item => (
                    <div key={item.id} style={resultItem} onClick={() => selectResult(item)}>
                      <img src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : ''} style={resImg} />
                      <div style={{flex:1}}>
                        <div style={{fontWeight:'bold'}}>{item.title || item.name}</div>
                        <div style={{fontSize:'12px', color:'#666'}}>{(item.release_date || item.first_air_date || "").split("-")[0]}</div>
                      </div>
                      <Check size={18} color="#34C759" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h3>{editingId ? "עריכת תוכן" : "פרטי התוכן"}</h3>
              <div style={typeRow}>
                <button onClick={() => {setType("movie"); setCategory("סרטים")}} style={type === "movie" ? activeT : inactiveT}>סרט</button>
                <button onClick={() => {setType("series"); setCategory("סדרות")}} style={type === "series" ? activeT : inactiveT}>סדרה</button>
              </div>

              <label>שם הסרט/סדרה:</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
              
              <label>תמונה (URL או העלאה):</label>
              <div style={{display:'flex', gap:'10px'}}>
                <input value={thumb} onChange={e => setThumb(e.target.value)} style={{...inStyle, flex:1}} />
                <label style={uploadBtn}>
                  {isUploading ? "..." : <ImageIcon size={20}/>}
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{display:'none'}} />
                </label>
              </div>

              {type === "series" && (
                <div style={{display:'flex', gap:'10px'}}>
                  <div style={{flex:1}}><label>עונה:</label><input value={season} onChange={e => setSeason(e.target.value)} style={inStyle} /></div>
                  <div style={{flex:1}}><label>פרק:</label><input value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} /></div>
                </div>
              )}

              <label>קישור לוידאו (Drive / YouTube / Rumble):</label>
              <input placeholder="הדבק קישור כאן" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
              
              <label>תקציר:</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height:'100px'}} />

              <div style={{display:'flex', gap:'10px', marginTop: '10px'}}>
                <button onClick={() => saveMutation.mutate({
                    title: type === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
                    description, video_id: url, category, thumbnail_url: thumb,
                    metadata: { season, episode }
                })} style={btnMain}>{editingId ? "עדכן עכשיו" : "פרסם באתר"}</button>
                {editingId && <button onClick={resetForm} style={{...btnMain, background:'#8e8e93', width:'120px'}}>ביטול</button>}
              </div>
            </div>

            <div style={cardStyle}>
              <h4>ניהול תוכן קיים</h4>
              {/* רשימת פריטים רגילה כפי שהייתה קודם... */}
              {grouped.movies.map(m => (
                <div key={m.id} style={itemRow}>
                  <span>{m.title}</span>
                  <div>
                    <button onClick={() => {setEditingId(m.id); setTitle(m.title); setUrl(m.video_id); setThumb(m.thumbnail_url); setType("movie"); window.scrollTo(0,0);}} style={actionBtn}><Edit2 size={16} color="#0071E3"/></button>
                    <button onClick={() => deleteItem(m.id)} style={actionBtn}><Trash2 size={16} color="#FF3B30"/></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// עיצובים נוספים עבור החיפוש
const resultsBox = { background: '#fff', borderRadius: '12px', marginTop: '10px', border: '1px solid #ddd', overflow: 'hidden' };
const resultItem = { display: 'flex', alignItems: 'center', padding: '10px', gap: '15px', cursor: 'pointer', borderBottom: '1px solid #eee', transition: '0.2s' };
const resImg = { width: '40px', height: '60px', borderRadius: '4px', objectFit: 'cover', background: '#eee' };
const authStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F5F5F7" };
const adminLayout = { background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" };
const headerStyle = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", position:'sticky', top:0, zIndex:100 };
const logoStyle = { fontSize: "20px", fontWeight: "900" };
const container = { maxWidth: "700px", margin: "20px auto", padding: "0 20px" };
const cardStyle = { background: "#fff", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom:'20px' };
const inStyle = { width: "100%", padding: "12px", margin: "6px 0", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px", outline: "none", boxSizing: 'border-box' };
const btnMain = { background: "#0071E3", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" };
const uploadBtn = { background: "#34C759", color: "#fff", padding: "0 15px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center" };
const typeRow = { display: "flex", gap: "10px", marginBottom: "15px" };
const activeT = { flex: 1, padding: "12px", background: "#0071E3", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold" };
const inactiveT = { flex: 1, padding: "12px", background: "#f5f5f7", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" };
const itemRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" };
const actionBtn = { background: "none", border: "none", cursor: "pointer", padding: "8px" };
const iconBtn = { background: "none", border: "none", cursor: "pointer" };
const linkStyle = { color: "#0071E3", textDecoration: "none", fontWeight: "bold" };