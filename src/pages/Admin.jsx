// @auth
import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// פונקציה לזיהוי לינקים (כולל כאן 11)
function extractVideoId(url) {
  if (!url) return null;
  if (url.includes('kan.org.il')) {
    const parts = url.split('/').filter(Boolean);
    return { type: "kan", video_id: parts[parts.length - 1] };
  }
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", video_id: ytMatch[1] };
  return null;
}

export default function Admin() {
  const queryClient = useQueryClient();
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
      setUrl(""); setTitle("");
      alert("הסרט נוסף בהצלחה!");
    },
  });

  const handleAdd = () => {
    const parsed = extractVideoId(url.trim());
    if (!parsed) return alert("לינק לא תקין");
    if (!title.trim()) return alert("חובה להזין שם");

    createMutation.mutate({
      title: title.trim(),
      video_id: parsed.video_id,
      type: parsed.type,
      category: newCategory.trim() || category || "כללי",
    });
  };

  const iS = { width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "white", padding: "12px", marginBottom: "15px", textAlign: "right" };

  return (
    <div style={{ direction: "rtl", background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1 style={{ color: "#e50914" }}>ניהול סרטים</h1>
        <Link to="/" style={{ color: "#94a3b8", display: "block", marginBottom: "20px" }}>חזרה לאתר</Link>
        
        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px" }}>
          <input style={iS} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="לינק מיוטיוב או כאן 11" />
          <input style={iS} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="שם הסרט" />
          
          <select style={iS} value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(""); }}>
            <option value="">בחר קטגוריה קיימת...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={iS} value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setCategory(""); }} placeholder="או קטגוריה חדשה" />

          <button onClick={handleAdd} style={{ width: "100%", background: "#e50914", color: "white", border: "none", padding: "15px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            {createMutation.isPending ? "שומר..." : "הוסף למאגר"}
          </button>
        </div>
      </div>
    </div>
  );
}