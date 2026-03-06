// @auth
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { debounce } from "lodash";

// פונקציה לזיהוי לינקים כולל כאן 11
function extractVideoId(url) {
  if (!url) return null;
  
  // כאן 11
  if (url.includes('kan.org.il')) {
    const parts = url.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return { type: "kan", video_id: lastPart };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", video_id: ytMatch[1] };
  
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "drive", video_id: driveMatch[1] };
  
  // Rumble
  const rumbleMatch = url.match(/rumble\.com\/(?:embed\/|v)?([a-zA-Z0-9]+)/);
  if (rumbleMatch) return { type: "rumble", video_id: rumbleMatch[1] };
  
  return null;
}

const detectPlatform = (url) => {
  if (!url) return '';
  if (url.includes('kan.org.il')) return 'כאן 11';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('rumble.com')) return 'Rumble';
  return 'אחר';
};

export default function Admin() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState("");

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const categories = useMemo(() => 
    [...new Set(movies.map((m) => m.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "he")),
    [movies]
  );

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setUrl(""); setTitle(""); setError("");
      alert("הסרט נוסף בהצלחה!");
    },
  });

  const handleAdd = () => {
    setError("");
    const parsed = extractVideoId(url.trim());
    if (!parsed) return setError("לינק לא תקין - נסה יוטיוב או כאן 11");
    
    const finalCategory = (newCategory.trim() || category || "כללי").trim();
    if (!title.trim()) return setError("חובה להזין שם לסרט");

    createMutation.mutate({
      title: title.trim(),
      video_id: parsed.video_id,
      type: parsed.type,
      category: finalCategory,
    });
  };

  const inputStyle = {
    width: "100%", background: "#1e293b", border: "1px solid #334155",
    borderRadius: "8px", color: "white", padding: "12px", marginBottom: "15px",
    textAlign: "right", direction: "rtl", fontSize: "16px"
  };

  return (
    <div style={{ direction: "rtl", background: "#0f172a", minHeight: "100vh", color: "white", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "#e50914", fontSize: "28px" }}>ZOVEX - ניהול</h1>
          <Link to="/" style={{ color: "#94a3b8", textDecoration: "none" }}>← חזרה לאתר</Link>
        </div>

        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #e5091433" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#94a3b8" }}>לינק לוידאו</label>
          <input 
            style={inputStyle} 
            value={url} 
            onChange={(e) => { setUrl(e.target.value); setPlatform(detectPlatform(e.target.value)); }} 
            placeholder="הדבק לינק מיוטיוב או כאן 11..." 
          />
          {platform && <div style={{ color: "#e50914", fontSize: "12px", marginTop: "-10px", marginBottom: "10px" }}>זוהה: {platform}</div>}

          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#94a3b8" }}>שם הסרט/הפרק</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="לדוגמה: המפקדת עונה 1 פרק 1" />

          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#94a3b8" }}>בחר קטגוריה</label>
          <select style={inputStyle} value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(""); }}>
            <option value="">בחר קטגוריה קיימת...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={inputStyle} value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setCategory(""); }} placeholder="או הקלד קטגוריה חדשה..." />

          {error && <div style={{ color: "#ff4444", marginBottom: "15px", fontSize: "14px" }}>{error}</div>}

          <button 
            onClick={handleAdd} 
            disabled={createMutation.isPending}
            style={{ width: "100%", background: "#e50914", color: "white", border: "none", padding: "15px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}
          >
            {createMutation.isPending ? "שומר..." : "הוסף למאגר"}
          </button>
        </div>
      </div>
    </div>
  );
}