import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Settings, Plus, ExternalLink, Loader2, PlayCircle, Lock } from "lucide-react";

const formatVideoUrl = (url) => {
  if (!url) return "";
  let formatted = url.trim();
  if (formatted.includes("watch?v=")) {
    formatted = formatted.replace("watch?v=", "embed/").split("&")[0];
  } else if (formatted.includes("youtu.be/")) {
    formatted = `https://www.youtube.com/embed/${formatted.split("/").pop()}`;
  }
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
  const [formData, setFormData] = useState({
    title: "", url: "", thumb: "", description: "", category: "", type: "movie"
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Movie.create({
      title: data.title,
      description: data.description,
      video_id: formatVideoUrl(data.url),
      thumbnail_url: data.thumb,
      category: data.category,
      type: data.type
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setFormData({ title: "", url: "", thumb: "", description: "", category: "", type: "movie" });
      alert("התוכן פורסם בהצלחה!");
    }
  });

  if (!isAuthorized) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', direction: 'rtl' }}>
      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px solid #333', width: '350px' }}>
        <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px' }}>ZO<span style={{color:'#e50914'}}>VEX</span> ADMIN</h2>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Lock size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: '#666' }} />
          <input 
            type="password" 
            placeholder="קוד גישה" 
            style={{ width: '100%', padding: '15px 40px 15px 15px', borderRadius: '10px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', boxSizing: 'border-box' }}
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && passcode === "ZovexAdmin2026" && setIsAuthorized(true)}
          />
        </div>
        <button 
          onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי!")}
          style={{ width: '100%', padding: '15px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          כניסה למערכת
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', direction: 'rtl', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>ZO<span style={{color:'#e50914'}}>VEX</span> <small style={{fontSize:'14px', color:'#666'}}>ניהול תוכן</small></h1>
        <Link to="/" style={{ color: '#fff' }}><ExternalLink /></Link>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1a1a1a', padding: '30px', borderRadius: '20px', border: '1px solid #333' }}>
        <label style={labelStyle}>שם הסרט/סדרה</label>
        <input style={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        
        <label style={labelStyle}>קישור וידאו (YouTube/Drive)</label>
        <input style={inputStyle} value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="הדבק לינק כאן..." />
        
        <label style={labelStyle}>קישור לתמונה (Thumbnail)</label>
        <input style={inputStyle} value={formData.thumb} onChange={e => setFormData({...formData, thumb: e.target.value})} />
        
        <label style={labelStyle}>תקציר</label>
        <textarea style={{...inputStyle, height: '100px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

        <button 
          onClick={() => saveMutation.mutate(formData)} 
          style={{ width: '100%', padding: '18px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', marginTop: '20px' }}
        >
          {saveMutation.isLoading ? "מפרסם..." : "פרסם תוכן ב-ZOVEX"}
        </button>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', boxSizing: 'border-box' };