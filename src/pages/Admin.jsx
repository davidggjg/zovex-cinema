import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Edit2, Trash2, ChevronLeft, Film, Tv } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("movies");
  const [inventoryCat, setInventoryCat] = useState("הכל");
  const queryClient = useQueryClient();

  // שדות טופס (להוספה ועריכה)
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("סרטים");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("");

  // טעינת כל התוכן מהמסד נתונים
  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // שליפת רשימת קטגוריות ייחודית מהפריטים הקיימים
  const existingCategories = useMemo(() => {
    const cats = new Set(allItems.map(i => i.category).filter(Boolean));
    return ["הכל", ...Array.from(cats)];
  }, [allItems]);

  // סינון הפריטים לתצוגת הניהול למטה
  const filteredInventory = useMemo(() => {
    return allItems.filter(item => inventoryCat === "הכל" || item.category === inventoryCat);
  }, [allItems, inventoryCat]);

  // מוטציות
  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      resetForm();
      alert(editingId ? "עודכן בהצלחה" : "פורסם בהצלחה");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Movie.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movies"] }),
  });

  const resetForm = () => {
    setEditingId(null); setTitle(""); setUrl(""); setDescription(""); setEpisode("");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title.split(" - עונה")[0]);
    setUrl(item.video_id);
    setDescription(item.description);
    setCategory(item.category);
    if (item.metadata?.season) {
      setSeason(item.metadata.season);
      setEpisode(item.metadata.episode);
      setActiveTab("series");
    } else {
      setActiveTab("movies");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthorized) {
    return (
      <div style={authContainer}>
        <div style={authCard}>
          <h1 style={{ fontWeight: "900", color: "#1d1d1f" }}>ZOVEX CONTROL</h1>
          <input type="password" placeholder="קוד גישה" onChange={(e) => setPasscode(e.target.value)} style={inputStyle} />
          <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("טעות")} style={btnPrimary}>כניסה</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" }}>
      <header style={headerStyle}>
        <div style={{ fontSize: "24px", fontWeight: "900" }}>ZO<span style={{color: "#0071E3"}}>VEX</span> <small style={{fontSize: "12px", color: "#666"}}>ADMIN</small></div>
        <Link to="/" style={{ textDecoration: "none", color: "#0071E3", fontWeight: "700" }}>צפה באתר →</Link>
      </header>

      <div style={{ max_width: "1000px", margin: "30px auto", padding: "0 20px" }}>
        
        {/* חלק 1: טופס הוספה/עריכה */}
        <div style={cardStyle}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
             <h2 style={{margin: 0}}>{editingId ? "עריכת תוכן קיים" : "הוספת תוכן חדש"}</h2>
             {editingId && <button onClick={resetForm} style={{background: "#eee", border: "none", padding: "5px 15px", borderRadius: "8px", cursor: "pointer"}}>ביטול עריכה</button>}
          </div>
          
          <div style={tabContainer}>
            <button style={activeTab === "movies" ? activeTabStyle : tabStyle} onClick={() => setActiveTab("movies")}>🎬 סרט</button>
            <button style={activeTab === "series" ? activeTabStyle : tabStyle} onClick={() => setActiveTab("series")}>📺 סדרה (פרקים)</button>
          </div>

          <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          
          {activeTab === "series" && (
            <div style={{display: "flex", gap: "10px"}}>
              <input type="number" placeholder="עונה" value={season} onChange={e => setSeason(e.target.value)} style={inputStyle} />
              <input type="number" placeholder="פרק" value={episode} onChange={e => setEpisode(e.target.value)} style={inputStyle} />
            </div>
          )}

          <input placeholder="לינק וידאו" value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} />
          <textarea placeholder="תקציר..." value={description} onChange={e => setDescription(e.target.value)} style={{...inputStyle, height: "80px"}} />
          
          <button onClick={() => saveMutation.mutate({
            title: activeTab === "series" ? `${title} - עונה ${season} פרק ${episode}` : title,
            description,
            video_id: url,
            category: activeTab === "series" ? "סדרות" : category,
            metadata: activeTab === "series" ? { season, episode } : {}
          })} style={btnPrimary}>
            {editingId ? "עדכן שינויים" : "פרסם עכשיו"}
          </button>
        </div>

        {/* חלק 2: ניהול מלאי ותוכן קיים (Inventory) */}
        <div style={{marginTop: "50px"}}>
          <h2 style={{marginBottom: "20px"}}>ניהול כל הסרטים והסדרות</h2>
          
          {/* סרגל קטגוריות לסינון */}
          <div style={{display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "10px"}}>
            {existingCategories.map(c => (
              <button 
                key={c} 
                onClick={() => setInventoryCat(c)}
                style={{
                  padding: "8px 16px", borderRadius: "20px", border: "none", 
                  background: inventoryCat === c ? "#0071E3" : "#E8E8ED",
                  color: inventoryCat === c ? "#fff" : "#1d1d1f",
                  cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap"
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* טבלת פריטים */}
          <div style={cardStyle}>
            {isLoading ? <p>טוען רשימה...</p> : (
              <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                {filteredInventory.map(item => (
                  <div key={item.id} style={itemRowStyle}>
                    <div style={{display: "flex", alignItems: "center", gap: "15px", flex: 1}}>
                      <div style={itemIconStyle}>
                        {item.category === "סדרות" ? <Tv size={18} /> : <Film size={18} />}
                      </div>
                      <div>
                        <div style={{fontWeight: "700", fontSize: "15px"}}>{item.title}</div>
                        <div style={{fontSize: "12px", color: "#86868B"}}>{item.category}</div>
                      </div>
                    </div>
                    
                    <div style={{display: "flex", gap: "8px"}}>
                      <button onClick={() => startEdit(item)} style={actionBtnStyle} title="ערוך">
                        <Edit2 size={16} color="#0071E3" />
                      </button>
                      <button onClick={() => window.confirm("למחוק את התוכן הזה?") && deleteMutation.mutate(item.id)} style={actionBtnStyle} title="מחק">
                        <Trash2 size={16} color="#FF3B30" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredInventory.length === 0 && <p style={{textAlign: "center", color: "#999"}}>אין פריטים בקטגוריה זו</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// סטיילים (CSS-in-JS)
const headerStyle = { background: "#fff", padding: "15px 5%", display: "flex", justifyContent: "space-between", align_items: "center", borderBottom: "1px solid #E5E5E5" };
const cardStyle = { background: "#fff", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" };
const inputStyle = { width: "100%", padding: "12px", margin: "8px 0", borderRadius: "10px", border: "1px solid #DDD", fontSize: "16px", outline: "none" };
const btnPrimary = { background: "#0071E3", color: "white", padding: "14px", border: "none", borderRadius: "10px", width: "100%", fontWeight: "700", cursor: "pointer", marginTop: "10px" };
const tabContainer = { display: "flex", gap: "10px", marginBottom: "15px" };
const tabStyle = { flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#E8E8ED", cursor: "pointer", fontWeight: "600" };
const activeTabStyle = { ...tabStyle, background: "#0071E3", color: "#fff" };
const authContainer = { height: "100vh", background: "#F5F5F7", display: "flex", justifyContent: "center", align_items: "center", direction: "rtl" };
const authCard = { background: "#fff", padding: "40px", borderRadius: "25px", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" };

const itemRowStyle = { 
  display: "flex", justifyContent: "space-between", alignItems: "center", 
  padding: "12px", background: "#F9F9FB", borderRadius: "12px", border: "1px solid #F0F0F2" 
};
const itemIconStyle = { 
  width: "36px", height: "36px", borderRadius: "8px", background: "#fff", 
  display: "flex", alignItems: "center", justifyContent: "center", color: "#888", border: "1px solid #EEE" 
};
const actionBtnStyle = { 
  background: "#fff", border: "1px solid #EEE", width: "34px", height: "34px", 
  borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" 
};