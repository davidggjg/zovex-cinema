import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// פונקציה לזיהוי לינקים
function extractVideoId(url) {
  if (!url) return null;
  const trimmedUrl = url.trim();
  if (trimmedUrl.includes('kan.org.il')) {
    const parts = trimmedUrl.split('/').filter(Boolean);
    return { type: "kan", video_id: parts[parts.length - 1] };
  }
  const ytMatch = trimmedUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", video_id: ytMatch[1] };
  return null;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [passInput, setPassInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
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
    mutationFn: (data) => base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setUrl(""); setTitle(""); alert("הסרט נוסף בהצלחה!");
    }
  });

  const handleLogin = () => {
    if (passInput === "ZOVEX_ADMIN_2026") {
      setIsAuthorized(true);
    } else {
      alert("קוד שגוי!");
    }
  };

  const handleAdd = () => {
    const parsed = extractVideoId(url);
    if (!parsed || !title.trim()) return alert("פרטים חסרים");
    createMutation.mutate({
      title: title.trim(),
      video_id: parsed.video_id,
      type: parsed.type,
      category: newCategory.trim() || category || "כללי",
    });
  };

  const iS = { width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "white", padding: "12px", marginBottom: "15px", textAlign: "right" };

  // מסך כניסה (הריבוע הלבן)
  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', direction: 'rtl' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '4px solid #e50914', width: '300px' }}>
          <h2 style={{ color: 'black', marginBottom: '20px' }}>כניסה למנהל</h2>
          <input 
            type="password" 
            placeholder="הזן קוד גישה..." 
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}
          />
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '10px', background: '#e50914', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            המשך
          </button>
        </div>
      </div>
    );
  }

  // פאנל הניהול האמיתי (מוצג רק אחרי הקשת הקוד)
  return (
    <div style={{ direction: "rtl", background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1 style={{ color: "#e50914" }}>ZOVEX - ניהול</h1>
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px" }}>
          <input style={iS} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="לינק מיוטיוב או כאן 11" />
          <input style={iS} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="שם הסרט" />
          <select style={iS} value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(""); }}>
            <option value="">בחר קטגוריה...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={iS} value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setCategory(""); }} placeholder="או קטגוריה חדשה" />
          <button onClick={handleAdd} style={{ width: "100%", background: "#e50914", color: "white", border: "none", padding: "15px", borderRadius: "8px", fontWeight: "bold" }}>
            הוסף למאגר
          </button>
        </div>
      </div>
    </div>
  );
}