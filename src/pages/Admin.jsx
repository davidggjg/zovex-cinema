import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Tv, Film, Settings, Sparkles, Loader2 } from "lucide-react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); 
  const [inventoryCat, setInventoryCat] = useState("הכל");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const queryClient = useQueryClient();

  const [groqKey, setGroqKey] = useState(localStorage.getItem("groq_key") || "");
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("movie");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("פעולה");

  const { data: allItems = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  // פונקציית ה-AI להשלמת תקצירים
  const autoFillDescriptions = async () => {
    if (!groqKey) return alert("חובה להזין מפתח Groq בהגדרות!");
    const missing = allItems.filter(i => !i.description || i.description.length < 5);
    if (missing.length === 0) return alert("לא נמצאו סרטים ללא תקציר.");
    
    setIsAiLoading(true);
    try {
      for (const item of missing) {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: `Write a 2-sentence movie summary in Hebrew for: ${item.title}. Only the summary.` }]
          })
        });
        const json = await res.json();
        const aiText = json.choices[0].message.content;
        await base44.entities.Movie.update(item.id, { description: aiText });
      }
      queryClient.invalidateQueries(["movies"]);
      alert(`סיימתי! השלמתי ${missing.length} תקצירים.`);
    } catch (e) { alert("שגיאה בחיבור ל-AI"); }
    setIsAiLoading(false);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? base44.entities.Movie.update(editingId, data) : base44.entities.Movie.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["movies"]); resetForm(); }
  });

  const resetForm = () => { setEditingId(null); setTitle(""); setUrl(""); setDescription(""); };

  if (!isAuthorized) return (
    <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#F5F5F7'}}>
      <div style={{background:'#fff', padding:'40px', borderRadius:'25px', textAlign:'center', boxShadow:'0 10px 40px rgba(0,0,0,0.05)'}}>
        <h2 style={{color: '#0071E3'}}>ZOVEX CONTROL</h2>
        <input type="password" placeholder="קוד גישה" onChange={e => setPasscode(e.target.value)} style={{width:'100%', padding:'12px', margin:'10px 0', borderRadius:'10px', border:'1px solid #ddd'}} />
        <button onClick={() => passcode === "ZovexAdmin2026" ? setIsAuthorized(true) : alert("טעות")} style={{width:'100%', padding:'12px', background:'#0071E3', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold'}}>כניסה</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", direction: "rtl", fontFamily: "Assistant" }}>
      <header style={{background:'#fff', padding:'15px 5%', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #EEE'}}>
        <div style={{fontWeight:900, fontSize:'22px'}}>ZO<span style={{color:'#0071E3'}}>VEX</span> ADMIN</div>
        <div style={{display:'flex', gap:'10px'}}>
            <button onClick={autoFillDescriptions} disabled={isAiLoading} style={{background:'#E8F2FF', color:'#0071E3', border:'none', padding:'8px 15px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold'}}>
                {isAiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                השלם תקצירים (AI)
            </button>
            <button onClick={() => setActiveTab('keys')} style={{background:'none', border:'none', cursor:'pointer'}}><Settings size={20}/></button>
            <Link to="/" style={{textDecoration:'none', color:'#0071E3', fontWeight:700}}>לאתר</Link>
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "30px auto", padding: "0 20px" }}>
        {activeTab === 'keys' ? (
            <div style={{background:'#fff', padding:'25px', borderRadius:'20px'}}>
                <h3>הגדרות AI</h3>
                <input type="password" placeholder="Groq API Key" value={groqKey} onChange={e => {setGroqKey(e.target.value); localStorage.setItem("groq_key", e.target.value)}} style={{width:'100%', padding:'12px', margin:'10px 0', borderRadius:'10px', border:'1px solid #ddd'}} />
                <button onClick={() => setActiveTab('add')} style={{width:'100%', padding:'12px', background:'#0071E3', color:'#fff', border:'none', borderRadius:'10px'}}>חזור</button>
            </div>
        ) : (
            <div style={{background:'#fff', padding:'25px', borderRadius:'20px'}}>
                <h3>{editingId ? "עריכה" : "הוספה"}</h3>
                <input placeholder="שם הסרט/סדרה" value={title} onChange={e => setTitle(e.target.value)} style={{width:'100%', padding:'12px', margin:'8px 0', borderRadius:'10px', border:'1px solid #ddd'}} />
                <input placeholder="מזהה וידאו" value={url} onChange={e => setUrl(e.target.value)} style={{width:'100%', padding:'12px', margin:'8px 0', borderRadius:'10px', border:'1px solid #ddd'}} />
                <textarea placeholder="תקציר (השאר ריק ל-AI)" value={description} onChange={e => setDescription(e.target.value)} style={{width:'100%', padding:'12px', margin:'8px 0', borderRadius:'10px', border:'1px solid #ddd', height:'80px'}} />
                <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%', padding:'12px', margin:'8px 0', borderRadius:'10px', border:'1px solid #ddd'}}>
                    <option value="פעולה">פעולה</option><option value="ילדים">ילדים</option><option value="סדרות">סדרות</option>
                </select>
                <button onClick={() => saveMutation.mutate({title, description, video_id: url, category})} style={{width:'100%', padding:'14px', background:'#0071E3', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>שמור</button>
            </div>
        )}
      </div>
    </div>
  );
}