import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Admin() {
  const [inputCode, setInputCode] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  // בדיקת הקוד שביקשת
  const handleLogin = () => {
    if (inputCode === "ZOVEX_ADMIN_2026") {
      setIsLogged(true);
    } else {
      alert("קוד שגוי, נסה שוב");
    }
  };

  // הריבוע הלבן הידני עם המסגרת האדומה
  if (!isLogged) {
    return (
      <div style={{ height: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', border: '5px solid #e50914', textAlign: 'center', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: 'black', marginBottom: '20px' }}>כניסה לניהול ZOVEX</h2>
          <input 
            type="text" 
            placeholder="הזן קוד גישה..." 
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '2px solid #ddd', borderRadius: '8px', textAlign: 'center', fontSize: '16px' }}
          />
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '12px', background: '#e50914', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
          >
            התחבר
          </button>
        </div>
      </div>
    );
  }

  // הפאנל שמופיע אחרי הקשת הקוד
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px', direction: 'rtl' }}>
      <h1 style={{ color: '#e50914' }}>ZOVEX Admin Panel</h1>
      <div style={{ background: '#1e293b', padding: '25px', borderRadius: '12px' }}>
        <input placeholder="לינק מיוטיוב או כאן 11" style={iS} value={url} onChange={e => setUrl(e.target.value)} />
        <input placeholder="שם הסרט/פרק" style={iS} value={title} onChange={e => setTitle(e.target.value)} />
        <button style={{ width: '100%', padding: '15px', background: '#e50914', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px' }}>
          הוסף למערכת
        </button>
      </div>
    </div>
  );
}

const iS = { width: '100%', padding: '12px', marginBottom: '15px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '8px', textAlign: 'right' };