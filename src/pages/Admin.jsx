import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Lock, ExternalLink, Film, Plus } from "lucide-react";

// פונקציה חכמה שמתקנת את הלינקים לפני שהם נשמרים בבסיס הנתונים
const formatVideoUrl = (url) => {
  if (!url) return "";
  let formatted = url.trim();
  
  // תיקון יוטיוב לפורמט Embed
  if (formatted.includes("youtube.com/watch?v=")) {
    formatted = formatted.replace("watch?v=", "embed/").split("&")[0];
  } else if (formatted.includes("youtu.be/")) {
    formatted = `https://www.youtube.com/embed/${formatted.split("/").pop()}`;
  }
  
  // תיקון גוגל דרייב לפורמט Preview
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
      video_id: formatVideoUrl(data.url), // כאן התיקון שמונע 404
      thumbnail_url: data.thumb,
      category: data.category,
      type: data.type
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setFormData({ title: "", url: "", thumb: "", description: "", category: "", type: "movie" });
      alert("הסרט עלה בהצלחה ל-ZOVEX!");
    }
  });

  // מסך כניסה - תיקנתי את הראות של הטקסט
  if (!isAuthorized) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px solid #333', width: '350px' }}>
        <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px' }}>ZO<span style={{color:'#e50914'}}>VEX</span> ADMIN</h2>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <input 
            type="password" 
            placeholder="הכנס קוד גישה" 
            style={{ 
                width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #333', 
                background: '#262626', color: '#ffffff', boxSizing: 'border-box', fontSize: '16px', textAlign: 'center' 
            }}
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && passcode === "ZovexAdmin2026" && setIsAuthorized(true)}
          />
        </div>
        <button 
          onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("קוד שגוי!")}
          style={{ width: '100%', padding: '15px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          כניסה למערכת
        </button>
      </div>
    </div>
  );

  // פאנל הניהול הראשי
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', direction: 'rtl', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '32px' }}>ZO<span style={{color:'#e50914'}}>VEX</span> <small style={{fontSize:'16px', color:'#666'}}>ניהול תוכן</small></h1>
        <Link to="/" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
            חזרה לאתר <ExternalLink size={18} />
        </Link>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1a1a1a', padding: '30px', borderRadius: '20px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#e50914' }}>
            <Plus size={24} />
            <h2 style={{ margin: 0, color: '#fff' }}>הוספת סרט חדש</h2>
        </div>

        <label style={labelStyle}>שם הסרט</label>
        <input style={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="למשל: מהיר ועצבני 10" />
        
        <label style={labelStyle}>קישור וידאו (YouTube / Google Drive)</label>
        <input style={inputStyle} value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="הדבק כאן את הלינק המלא מהדפדפן..." />
        
        <label style={labelStyle}>קישור לתמונת פוסטר (URL)</label>
        <input style={inputStyle} value={formData.thumb} onChange={e => setFormData({...formData, thumb: e.target.value})} placeholder="הדבק לינק לתמונה..." />
        
        <label style={labelStyle}>תקציר העלילה</label>
        <textarea style={{...inputStyle, height: '120px', resize: 'none'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="כתוב כמה מילים על הסרט..." />

        <label style={labelStyle}>קטגוריה</label>
        <select style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="">בחר קטגוריה</option>
            <option value="פעולה">פעולה</option>
            <option value="דרמה">דרמה</option>
            <option value="קומדיה">קומדיה</option>
            <option value="מתח">מתח</option>
            <option value="אימה">אימה</option>
            <option value="ילדים">ילדים</option>
        </select>

        <button 
          onClick={() => saveMutation.mutate(formData)} 
          disabled={saveMutation.isLoading}
          style={{ 
            width: '100%', padding: '18px', background: '#e50914', color: '#fff', 
            border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', 
            cursor: 'pointer', marginTop: '20px', transition: '0.3s' 
          }}
        >
          {saveMutation.isLoading ? "מעלה נתונים..." : "פרסם עכשיו ב-ZOVEX"}
        </button>
      </div>
    </div>
  );
}

// עיצובים קבועים כדי שהקוד יהיה נקי
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa', fontWeight: 'bold' };
const inputStyle = { 
    width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '10px', 
    border: '1px solid #333', background: '#0a0a0a', color: '#ffffff', 
    boxSizing: 'border-box', fontSize: '16px', outline: 'none' 
};