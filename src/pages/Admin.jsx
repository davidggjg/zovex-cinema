import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Settings, Plus, Sparkles, Image as ImageIcon, Search, Check, Loader2 } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const queryClient = useQueryClient();

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

  // חיפוש חי (Live Search)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2 && tmdbKey) performLiveSearch();
      else setSearchResults([]);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performLiveSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(searchQuery)}&language=he-IL`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) { console.error(e); }
    finally { setIsSearching(false); }
  };

  // פונקציה שמביאה את התיאור המלא והארוך ביותר
  const selectResult = async (item) => {
    setIsSearching(true);
    try {
      // שליפת מידע מפורט לפי ID כדי לקבל תיאור מלא
      const typePath = item.media_type === "tv" ? "tv" : "movie";
      const detailRes = await fetch(`https://api.themoviedb.org/3/${typePath}/${item.id}?api_key=${tmdbKey}&language=he-IL`);
      const details = await detailRes.json();

      const name = details.title || details.name;
      const year = (details.release_date || details.first_air_date || "").split("-")[0];
      
      setTitle(`${name}${year ? ` (${year})` : ""}`);
      setDescription(details.overview || "אין תיאור זמין"); // התיאור הארוך
      setThumb(details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "");
      
      if (item.media_type === "tv") {
        setType("series");
        setCategory("סדרות");
      } else {
        setType("movie");
        setCategory("סרטים");
      }
      setSearchResults([]);
      setSearchQuery("");
    } catch (e) { alert("שגיאה במשיכת תיאור מלא"); }
    finally { setIsSearching(false); }
  };

  const { data: allItems = [] } = useQuery({ 
    queryKey: ["movies"], 
    queryFn: () => base44.entities.Movie.list("-created_date") 
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["movies"]); resetForm(); alert("נשמר בהצלחה!"); }
  });

  const resetForm = () => {
    setEditingId(null); setTitle(""); setUrl(""); setThumb(""); 
    setDescription(""); setEpisode(""); setSeason("1");
  };

  if (!isAuthorized) return (
    <div style={authStyle}><div style={cardStyle}><h2>ZOVEX ADMIN</h2><input type="password" placeholder="קוד גישה" onChange={e => setPasscode(e.target.value)} style={inStyle} /><button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("טעות")} style={btnMain}>כניסה</button></div></div>
  );

  return (
    <div style={adminLayout}>
      <header style={headerStyle}>
        <div style={logoStyle}>ZO<span>VEX</span> ADMIN</div>
        <div style={{display:'flex', gap:'15px'}}>
          <button onClick={() => setActiveTab("keys")} style={iconBtn}><Settings size={22}/></button>
          <button onClick={() => setActiveTab("content")} style={iconBtn}><Plus size={22}/></button>
          <Link to="/" style={linkStyle}>חזרה לאתר</Link>
        </div>
      </header>

      <div style={container}>
        {activeTab === "keys" ? (
          <div style={cardStyle}>
            <h3>הגדרות מפתחות</h3>
            <label>TMDB API Key:</label>
            <input type="password" value={tmdbKey} onChange={e => {setTmdbKey(e.target.value); localStorage.setItem("tmdb_key", e.target.value)}} style={inStyle} />
          </div>
        ) : (
          <>
            <div style={{...cardStyle, border: '2px solid #0071E3'}}>
              <h4 style={{marginTop: 0, color: '#0071E3'}}><Sparkles size={18} /> חיפוש חכם (מושך תיאור מלא)</h4>
              <div style={{position:'relative'}}>
                <input placeholder="הקלד שם..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={inStyle} />
                <div style={{position:'absolute', left:'12px', top:'18px'}}>
                  {isSearching && <Loader2 size={20} className="animate-spin" color="#0071E3" />}
                </div>
              </div>

              {searchResults.length > 0 && (
                <div style={resultsBox}>
                  {searchResults.slice(0, 5).map(item => (
                    <div key={item.id} style={resultItem} onClick={() => selectResult(item)}>
                      <img src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : ''} style={resImg} />
                      <div style={{flex:1}}>
                        <div style={{fontWeight:'bold'}}>{item.title || item.name}</div>
                        <div style={{fontSize:'12px', color:'#666'}}>{item.media_type === 'tv' ? 'סדרה' : 'סרט'}</div>
                      </div>
                      <Check size={16} color="#34C759" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h3>פרסום תוכן</h3>
              <label>שם:</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={inStyle} />
              
              <div style={typeRow}>
                <button onClick={() => {setType("movie"); setCategory("סרטים")}} style={type === "movie" ? activeT : inactiveT}>סרט</button>
                <button onClick={() => {setType("series"); setCategory("סדרות")}} style={type === "series" ? activeT : inactiveT}>סדרה</button>
              </div>

              {type === "series" && (
                <div style={{display:'flex', gap:'10px'}}>
                  <div style={{flex:1}}><label>עונה:</label><input value={season} onChange={e => setSeason(e.target.value)} style={inStyle} /></div>
                  <div style={{flex:1}}><label>פרק:</label><input value={episode} onChange={e => setEpisode(e.target.value)} style={inStyle} /></div>
                </div>
              )}

              <label>קישור לצפייה:</label>
              <input placeholder="הדבק כאן קישור וידאו" value={url} onChange={e => setUrl(e.target.value)} style={inStyle} />
              
              <label>תקציר מלא:</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} style={{...inStyle, height:'150px'}} />

              <button onClick={() => saveMutation.mutate({
                  title: type === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
                  description, video_id: url, category, thumbnail_url: thumb,
                  metadata: { season, episode }
              })} style={{...btnMain, width: '100%', marginTop: '10px'}}>
                {editingId ? "עדכן תוכן" : "פרסם עכשיו"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// עיצובים
const resultsBox = { background: '#fff', borderRadius: '12px', marginTop: '5px', border: '1px solid #ddd', overflow: 'hidden' };
const resultItem = { display: 'flex', alignItems: 'center', padding: '10px', gap: '15px', cursor: 'pointer', borderBottom: '1px solid #eee' };
const resImg = { width: '35px', height: '50px', borderRadius: '4px', objectFit: 'cover' };
const adminLayout = { background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" };
const container = { maxWidth: "600px", margin: "20px auto", padding: "0 20px" };
const cardStyle = { background: "#fff", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom:'20px' };
const inStyle = { width: "100%", padding: "12px", margin: "6px 0", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px", outline: "none", boxSizing: 'border-box' };
const btnMain = { background: "#0071E3", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" };
const typeRow = { display: "flex", gap: "10px", margin: "15px 0" };
const activeT = { flex: 1, padding: "12px", background: "#0071E3", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold" };
const inactiveT = { flex: 1, padding: "12px", background: "#f5f5f7", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" };
const headerStyle = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", alignItems:'center' };
const logoStyle = { fontSize: "20px", fontWeight: "900" };
const iconBtn = { background: "none", border: "none", cursor: "pointer" };
const linkStyle = { color: "#0071E3", textDecoration: "none", fontWeight: "bold" };
const authStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F5F5F7" };