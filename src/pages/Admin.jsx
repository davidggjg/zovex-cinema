// @auth
import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// פונקציה חכמה לזיהוי לינקים - מעודכנת לכל הסוגים
function extractVideoId(url) {
  if (!url) return null;
  const trimmedUrl = url.trim();

  // בדיקת כאן 11
  if (trimmedUrl.includes('kan.org.il')) {
    const parts = trimmedUrl.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    return { type: "kan", video_id: id };
  }

  // בדיקת יוטיוב
  const ytMatch = trimmedUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", video_id: ytMatch[1] };

  // בדיקת גוגל דרייב
  const driveMatch = trimmedUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "drive", video_id: driveMatch[1] };

  return null;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // משיכת רשימת הסרטים הקיימת
  const { data: movies = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // סינון קטגוריות קיימות בשביל הרשימה הנפתחת
  const categories = useMemo(() => 
    [...new Set(movies.map((m) => m.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "he")),
    [movies]
  );

  // פונקציית ההוספה לבסיס הנתונים
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setUrl(""); 
      setTitle("");
      setNewCategory("");
      alert("הסרט נוסף בהצלחה למערכת!");
    },
    onError: () => {
      alert("הייתה שגיאה בשמירה. נסה שוב.");
    }
  });

  const handleAdd = () => {
    const parsed = extractVideoId(url);
    if (!parsed) return alert("הלינק לא מזוהה. תשתמש ביוטיוב או כאן 11");
    if (!title.trim()) return alert("חובה לתת שם לסרט");

    const finalCategory = newCategory.trim() || category || "כללי";

    createMutation.mutate({
      title: title.trim(),
      video_id: parsed.video_id,
      type: parsed.type,
      category: finalCategory,
    });
  };

  // עיצוב שדות הקלט
  const inputStyle = {
    width: "100%",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "white",
    padding: "12px",
    marginBottom: "15px",
    textAlign: "right",
    fontSize: "16px",
    outline: "none"
  };

  return (
    <div style={{ direction: "rtl", background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "#e50914", margin: 0 }}>פאנל ניהול</h1>
          <Link to="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px" }}>חזרה לאתר ←</Link>
        </div>
        
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>לינק לוידאו (יוטיוב / כאן 11)</label>
          <input 
            style={inputStyle} 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="הדבק כאן את הכתובת..." 
          />
          
          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>שם הסרט / פרק</label>
          <input 
            style={inputStyle} 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="למשל: מנאייק עונה 2 פרק 5" 
          />
          
          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>בחר קטגוריה</label>
          <select 
            style={inputStyle} 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setNewCategory(""); }}
          >
            <option value="">-- בחר מהרשימה --</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>או הוסף קטגוריה חדשה</label>
          <input 
            style={inputStyle} 
            value={newCategory} 
            onChange={(e) => { setNewCategory(e.target.value); setCategory(""); }} 
            placeholder="למשל: סדרות ישראליות" 
          />

          <button 
            onClick={handleAdd} 
            disabled={createMutation.isPending}
            style={{ 
              width: "100%", 
              background: "#e50914", 
              color: "white", 
              border: "none", 
              padding: "16px", 
              borderRadius: "8px", 
              fontWeight: "bold", 
              cursor: "pointer",
              fontSize: "18px",
              marginTop: "10px",
              transition: "opacity 0.2s"
            }}
          >
            {createMutation.isPending ? "שומר..." : "הוסף למאגר"}
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#475569", marginTop: "20px", fontSize: "12px" }}>
          ZOVEX Admin System v2.0
        </p>
      </div>
    </div>
  );
}