import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Film, Image as ImageIcon, Hash, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function Admin() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: "", thumbnail_url: "", category: "", video_url: "" });
  const [status, setStatus] = useState({ type: "", message: "" });

  // משיכת הסרטים הקיימים
  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // מוטציה להוספת סרט
  const addMutation = useMutation({
    mutationFn: (newMovie) => base44.entities.Movie.create(newMovie),
    onSuccess: () => {
      queryClient.invalidateQueries(["movies"]);
      setFormData({ title: "", thumbnail_url: "", category: "", video_url: "" });
      showStatus("success", "הסרט נוסף בהצלחה!");
    },
    onError: () => showStatus("error", "שגיאה בהוספת הסרט. נסה שוב.")
  });

  // מוטציה למחיקת סרט
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Movie.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["movies"]);
      showStatus("success", "הסרט נמחק.");
    }
  });

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.thumbnail_url || !formData.category) {
      return showStatus("error", "חובה למלא את כל שדות החובה");
    }
    addMutation.mutate(formData);
  };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Loader2 className="animate-spin" size={40} color="#e50914" />
    </div>
  );

  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", direction: "rtl", fontFamily: "Arial, sans-serif", padding: "20px" }}>
      
      {/* Header */}
      <div style={{ maxWidth: "900px", margin: "0 auto", marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Film size={32} color="#e50914" />
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#111", margin: 0 }}>ניהול תוכן - ZOVEX</h1>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
        
        {/* טופס הוספה */}
        <section style={{ background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={20} color="#e50914" /> הוספת סרט חדש
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>שם הסרט</label>
              <div style={inputWrapperStyle}>
                <Film size={16} color="#aaa" />
                <input 
                  style={inputStyle} 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="לדוגמה: אופנהיימר"
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>קטגוריה (חשוב לסינון בדף הבית)</label>
              <div style={inputWrapperStyle}>
                <Hash size={16} color="#aaa" />
                <input 
                  style={inputStyle} 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  placeholder="לדוגמה: פעולה, דרמה..."
                />
              </div>
            </div>

            <div style={{ ...inputGroupStyle, gridColumn: "span 2" }}>
              <label style={labelStyle}>קישור לתמונה (Thumbnail URL)</label>
              <div style={inputWrapperStyle}>
                <ImageIcon size={16} color="#aaa" />
                <input 
                  style={inputStyle} 
                  value={formData.thumbnail_url} 
                  onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <button 
              disabled={addMutation.isPending}
              style={{
                gridColumn: "span 2", background: "#e50914", color: "#fff", border: "none",
                padding: "14px", borderRadius: "10px", fontSize: "16px", fontWeight: "bold",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "opacity 0.2s"
              }}
            >
              {addMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : "הוסף סרט למערכת"}
            </button>
          </form>

          {status.message && (
            <div style={{ 
              marginTop: "15px", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px",
              background: status.type === "success" ? "#e6f4ea" : "#fce8e6",
              color: status.type === "success" ? "#1e7e34" : "#d93025"
            }}>
              {status.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </div>
          )}
        </section>

        {/* רשימת ניהול */}
        <section style={{ background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>סרטים קיימים ({movies?.length || 0})</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {movies?.map(movie => (
              <div key={movie.id} style={{ 
                display: "flex", alignItems: "center", justifyContent: "space-between", 
                padding: "12px", border: "1px solid #eee", borderRadius: "12px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <img src={movie.thumbnail_url} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }} alt="" />
                  <div>
                    <div style={{ fontWeight: "bold" }}>{movie.title}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>קטגוריה: {movie.category}</div>
                  </div>
                </div>
                <button 
                  onClick={() => { if(window.confirm("בטוח שברצונך למחוק?")) deleteMutation.mutate(movie.id) }}
                  style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", padding: "8px" }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Styles
const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontSize: "14px", fontWeight: "bold", color: "#555" };
const inputWrapperStyle = { 
  display: "flex", alignItems: "center", gap: "10px", background: "#f5f5f5", 
  padding: "10px 15px", borderRadius: "8px", border: "1px solid #eee" 
};
const inputStyle = { background: "none", border: "none", outline: "none", width: "100%", fontSize: "14px" };