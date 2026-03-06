import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Edit2, Trash2, Settings, Plus, Sparkles, Image as ImageIcon, 
  ExternalLink, Loader2, CheckCircle, AlertCircle, X, PlayCircle 
} from "lucide-react";

// פונקציית עזר לתיקון לינקים לפני שמירה
const formatVideoUrl = (url) => {
  if (!url) return "";
  let formatted = url.trim();
  // תיקון יוטיוב
  if (formatted.includes("youtube.com/watch?v=")) {
    formatted = formatted.replace("watch?v=", "embed/").split("&")[0];
  } else if (formatted.includes("youtu.be/")) {
    formatted = `https://www.youtube.com/embed/${formatted.split("/").pop()}`;
  }
  // תיקון גוגל דרייב
  if (formatted.includes("drive.google.com")) {
    if (formatted.includes("/view")) {
      formatted = formatted.replace("/view", "/preview");
    } else if (formatted.includes("id=")) {
      const id = formatted.split("id=")[1].split("&")[0];
      formatted = `https://drive.google.com/file/d/${id}/preview`;
    }
  }
  return formatted;
};

export default function Admin() {
  const queryClient = useQueryClient();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  
  const [formData, setFormData] = useState({
    id: null, title: "", url: "", thumb: "", description: "",
    category: "", type: "movie"
  });

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date")
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // כאן אנחנו מוודאים שמות שדות שמתאימים ל-DetailView
      const payload = {
        title: data.title,
        description: data.description,
        video_id: formatVideoUrl(data.url), // התיקון הקריטי
        thumbnail_url: data.thumb,
        category: data.category,
        type: data.type
      };
      return formData.id ? base44.entities.Movie.update(formData.id, payload) : base44.entities.Movie.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setFormData({ id: null, title: "", url: "", thumb: "", description: "", category: "", type: "movie" });
      alert("פורסם בהצלחה!");
    }
  });

  if (!isAuthorized) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1c1c1e', color: 'white', direction: 'rtl' }}>
        <div style={{ background: '#2c2c2e', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
            <h2>כניסת מנהל</h2>
            <input type="password" placeholder="קוד גישה" style={{ display: 'block', margin: '15px 0', padding: '10px', borderRadius: '5px', border: 'none' }} onChange={e => setPasscode(e.target.value)} />
            <button onClick={() => passcode === "ZovexAdmin2026" && setIsAuthorized(true)} style={{ background: '#007aff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>כניסה</button>
        </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <h1>ניהול תוכן ZOVEX</h1>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <input placeholder="כותרת" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
        <input placeholder="לינק לוידאו (יוטיוב/דרייב)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={inputStyle} />
        <input placeholder="לינק לתמונה (Thumbnail)" value={formData.thumb} onChange={e => setFormData({...formData, thumb: e.target.value})} style={inputStyle} />
        <textarea placeholder="תיאור / תקציר" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{...inputStyle, height: '100px'}} />
        
        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle}>
            <option value="">בחר קטגוריה</option>
            <option value="פעולה">פעולה</option>
            <option value="דרמה">דרמה</option>
            <option value="קומדיה">קומדיה</option>
            <option value="ילדים">ילדים</option>
        </select>

        <button onClick={() => saveMutation.mutate(formData)} style={{ width: '100%', padding: '15px', background: '#007aff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {saveMutation.isLoading ? "מפרסם..." : "פרסם תוכן חדש"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };