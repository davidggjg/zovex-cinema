import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// פונקציית זיהוי לינקים (יוטיוב, כאן 11)
function extractVideoId(url) {
  if (!url) return null;
  const t = url.trim();
  if (t.includes('kan.org.il')) {
    const p = t.split('/').filter(Boolean);
    return { type: "kan", video_id: p[p.length - 1] };
  }
  const yt = t.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { type: "youtube", video_id: yt[1] };
  return null;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [passInput, setPassInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // בדיקה אם כבר נכנסת בעבר מהמכשיר הזה
  useEffect(() => {
    const savedAuth = localStorage.getItem("zovex_admin_auth");
    if (savedAuth === "true") setIsAuthorized(true);
  }, []);

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const { data: movies = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const categories = useMemo(() => 
    [...new Set(movies.map((m) => m.category).filter(Boolean))].sort(),
    [movies]
  );

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.Movie.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setUrl(""); setTitle(""); alert("הסרט נוסף בהצלחה!");
    }
  });

  // פונקציית הכניסה עם הקוד שביקשת
  const handleLogin = () => {
    if (passInput === "ZOVEX_ADMIN_2026") {
      setIsAuthorized(true);
      localStorage.setItem("zovex_admin_auth", "true"); // זוכר אותך לפעם הבאה
    } else {
      alert("קוד גישה שגוי!");
    }
  };

  const handleAdd = () => {
    const p = extractVideoId(url);
    if (!p || !title.trim()) return alert("משהו חסר בפרטים");
    createMutation.mutate({
      title: title.trim(),
      video_id: p.video_id,
      type: p.type,
      category: newCategory.trim() || category || "כללי",
    });
  };

  // אם המשתמש לא מחובר - מציג את הריבוע הלבן של הסיסמה
  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', direction: 'rtl', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', border: '5px solid #e50914', width: '320px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: 'black', marginBottom: '10px', fontSize: '24px' }}>כניסה למערכת</h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>הזן את קוד הגישה של ZOVEX</p>
          <input 
            type="text" // שונה ל-text כדי שתראה מה אתה מקליד
            placeholder="הקלד קוד כאן..." 
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #ddd', borderRadius: '8px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}
          />
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '12px', background: '#e50914', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
          >
            התחבר עכשיו
          </button>
        </div>
      </div>
    );
  }

  // תפריט הניהול האמיתי (נפתח רק אחרי סיסמה)
  return (
    <div style={{ direction: "rtl", background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: "#e50914", margin: 0 }}>ZOVEX - ניהול</h1>
            <button onClick={() => { localStorage.removeItem("zovex_admin_auth"); setIsAuthorized(false); }} style={{ background: 'none', border: '1px solid #444', color: '#94a3b8', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>יציאה</button>
        </div>
        
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px" }}>
          <input style={iS} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="לינק מיוטיוב או כאן 11" />
          <input style={iS} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="שם הסרט/הפרק" />
          <select style={iS} value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(""); }}>
            <option value="">בחר קטגוריה קיימת...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={iS} value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setCategory(""); }} placeholder="או קטגוריה חדשה..." />
          <button onClick={handleAdd} disabled={createMutation.isPending} style={{ width: "100%", background: "#e50914", color: "white", border: "none", padding: "15px", borderRadius: "8px", fontWeight: "bold", fontSize: '18px', cursor: 'pointer' }}>
            {createMutation.isPending ? "מעלה..." : "הוסף למאגר"}
          </button>
        </div>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: '#94a3b8', textDecoration: 'none' }}>חזרה לאתר</Link>
      </div>
    </div>
  );
}

const iS = { width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "white", padding: "12px", marginBottom: "15px", textAlign: "right", fontSize: '16px' };