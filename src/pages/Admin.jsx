import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { debounce } from "lodash";

// --- פונקציות עזר מעודכנות ---
function extractVideoId(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", video_id: ytMatch[1] };
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "drive", video_id: driveMatch[1] };
  const rumbleMatch = url.match(/rumble\.com\/(?:embed\/|v)?([a-zA-Z0-9]+)/);
  if (rumbleMatch) return { type: "rumble", video_id: rumbleMatch[1] };
  const dailyMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dailyMatch) return { type: "dailymotion", video_id: dailyMatch[1] };
  return { type: "other", video_id: url }; 
}

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("movies"); // 'movies' | 'series' | 'keys'
  const queryClient = useQueryClient();

  // מפתחות API
  const [groqKey, setGroqKey] = useState(localStorage.getItem("groq_key") || "");
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem("tmdb_key") || "");
  const [keyStatus, setKeyStatus] = useState({ groq: "idle", tmdb: "idle" });

  // שדות טופס
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("סרטים");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  // טעינת נתונים
  const { data: movies = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // בדיקת מפתחות API
  const testKeys = async () => {
    setKeyStatus({ groq: "testing", tmdb: "testing" });
    
    // בדיקת Groq
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { "Authorization": `Bearer ${groqKey}` }
      });
      if (res.ok) {
        setKeyStatus(prev => ({ ...prev, groq: "ok" }));
        localStorage.setItem("groq_key", groqKey);
      } else {
        setKeyStatus(prev => ({ ...prev, groq: "error" }));
      }
    } catch { setKeyStatus(prev => ({ ...prev, groq: "error" })); }

    // בדיקת TMDB
    try {
      const res = await fetch(`https://api.themoviedb.org/3/authentication?api_key=${tmdbKey}`);
      if (res.ok) {
        setKeyStatus(prev => ({ ...prev, tmdb: "ok" }));
        localStorage.setItem("tmdb_key", tmdbKey);
      } else {
        setKeyStatus(prev => ({ ...prev, tmdb: "error" }));
      }
    } catch { setKeyStatus(prev => ({ ...prev, tmdb: "error" })); }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      alert("נשמר בהצלחה!");
      setTitle(""); setUrl(""); setDescription(""); setEpisode("");
    },
  });

  const handleSave = () => {
    const videoData = extractVideoId(url);
    if (!videoData || !title || !description) return alert("חובה למלא שם, תקציר ולינק תקין");

    const payload = {
      title: activeTab === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
      description,
      video_id: videoData.video_id,
      type: videoData.type,
      category: activeTab === "series" ? "סדרות" : category,
      thumbnail_url: posterUrl,
      metadata: activeTab === "series" ? { season, episode } : {}
    };

    createMutation.mutate(payload);
  };

  // --- מסך כניסה ---
  if (!isAuthorized) {
    return (
      <div style={authContainer}>
        <div style={authCard}>
          <h1 style={{ color: "#1d1d1f", fontWeight: "800", marginBottom: "20px" }}>ZOVEX CINEMA</h1>
          <input 
            type="password" 
            placeholder="הזן קוד גישה" 
            onKeyDown={(e) => e.key === "Enter" && passcode === "ZovexAdmin2026" && setIsAuthorized(true)}
            onChange={(e) => setPasscode(e.target.value)} 
            style={inputStyle} 
          />
          <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי")} style={btnPrimary}>כניסה למערכת</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" }}>
      <header style={headerStyle}>
        <div style={{ fontSize: "24px", fontWeight: "900" }}>ZO<span style={{color: "#0071E3"}}>VEX</span></div>
        <Link to="/" style={{ textDecoration: "none", color: "#666" }}>חזרה לאתר</Link>
      </header>

      <div style={{ max_width: "900px", margin: "40px auto", padding: "0 20px" }}>
        <div style={tabContainer}>
          <button style={activeTab === "movies" ? activeTabStyle : tabStyle} onClick={() => setActiveTab("movies")}>🎬 סרטים</button>
          <button style={activeTab === "series" ? activeTabStyle : tabStyle} onClick={() => setActiveTab("series")}>📺 סדרות</button>
          <button style={activeTab === "keys" ? activeTabStyle : tabStyle} onClick={() => setActiveTab("keys")}>⚙️ מפתחות (AI/API)</button>
        </div>

        <div style={cardStyle}>
          {activeTab === "keys" ? (
            <div>
              <h3>הגדרות מערכת</h3>
              <label>Groq API Key (AI):</label>
              <input type="password" value={groqKey} onChange={e => setGroqKey(e.target.value)} style={inputStyle} />
              <StatusIndicator status={keyStatus.groq} />
              
              <label style={{marginTop: "20px", display: "block"}}>TMDB API Key (מידע/פוסטרים):</label>
              <input type="password" value={tmdbKey} onChange={e => setTmdbKey(e.target.value)} style={inputStyle} />
              <StatusIndicator status={keyStatus.tmdb} />

              <button onClick={testKeys} style={{...btnPrimary, marginTop: "20px", background: "#333"}}>בצע בדיקת תקינות</button>
            </div>
          ) : (
            <div>
              <h3>{activeTab === "movies" ? "הוספת סרט חדש" : "הוספת פרק לסדרה"}</h3>
              <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
              
              {activeTab === "series" && (
                <div style={{display: "flex", gap: "10px"}}>
                  <input type="number" placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inputStyle} />
                  <input type="number" placeholder="מספר פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inputStyle} />
                </div>
              )}

              <input placeholder="לינק לוידאו (Rumble, YT, Drive...)" value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} />
              <textarea placeholder="תקציר חובה (יופיע מתחת לתמונה)" value={description} onChange={e => setDescription(e.target.value)} style={{...inputStyle, height: "100px"}} />
              
              <label>העלאת פוסטר (מהטלפון):</label>
              <input type="file" accept="image/*" style={inputStyle} />

              <button onClick={handleSave} style={btnPrimary}>
                {createMutation.isPending ? "שומר..." : "שמור ופרסם באתר"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- קומפוננטות עזר פנימיות ---
const StatusIndicator = ({ status }) => {
  const colors = { idle: "#ccc", testing: "#ff9500", ok: "#34c759", error: "#ff3b30" };
  const labels = { idle: "לא נבדק", testing: "בודק...", ok: "תקין ומחובר", error: "שגיאה במפתח" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", marginTop: "5px" }}>
      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: colors[status] }}></div>
      <span>{labels[status]}</span>
    </div>
  );
};

// --- סטייל (Cinema Light Mode) ---
const authContainer = { height: "100vh", background: "#F5F5F7", display: "flex", justifyContent: "center", alignItems: "center", direction: "rtl" };
const authCard = { background: "#fff", padding: "50px", borderRadius: "30px", boxShadow: "0 20px 60px rgba(0,0,0,0.05)", textAlign: "center", width: "350px" };
const headerStyle = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E5E5" };
const inputStyle = { width: "100%", padding: "14px", margin: "10px 0", borderRadius: "12px", border: "1px solid #DDD", fontSize: "16px", outline: "none" };
const btnPrimary = { background: "#0071E3", color: "white", padding: "14px 30px", border: "none", borderRadius: "12px", width: "100%", fontWeight: "700", cursor: "pointer" };
const cardStyle = { background: "#fff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" };
const tabContainer = { display: "flex", gap: "10px", marginBottom: "20px" };
const tabStyle = { background: "#E5E5E7", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", color: "#666" };
const activeTabStyle = { ...tabStyle, background: "#0071E3", color: "white" };