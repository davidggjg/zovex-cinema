import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EditMovieModal from "../components/admin/EditMovieModal";
import { debounce } from "lodash";

function extractVideoId(url) {
  if (!url) return null;
  
  // כאן 11 - Kan 11
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
  if (url.includes('rumble.com/embed/')) {
    const embedMatch = url.match(/rumble\.com\/embed\/(v[a-zA-Z0-9]+)/);
    if (embedMatch) return { type: "rumble", video_id: url };
  }
  const rumbleMatch = url.match(/rumble\.com\/(v[a-zA-Z0-9]+)/);
  if (rumbleMatch) return { type: "rumble", video_id: rumbleMatch[1] };
  
  return null;
}

function extractEpisodeInfo(text) {
  if (!text) return {};
  const result = {};
  const pattern1 = text.match(/S(?:eason)?\s*(\d+)\s*E(?:pisode)?\s*(\d+)/i);
  if (pattern1) { result.season = parseInt(pattern1[1]); result.episode = parseInt(pattern1[2]); return result; }
  const pattern2 = text.match(/עונה\s*(\d+).*?פרק\s*(\d+)/);
  if (pattern2) { result.season = parseInt(pattern2[1]); result.episode = parseInt(pattern2[2]); return result; }
  return result;
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
  
  // --- מנגנון סיסמה ---
  const [passInput, setPassInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const ADMIN_PASSWORD = "1234"; // שנו כאן את הסיסמה למה שתרצו

  // --- States לשאר הטופס ---
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [uploadedThumbnail, setUploadedThumbnail] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [platform, setPlatform] = useState("");
  const [urlStatus, setUrlStatus] = useState("");

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
      setUrl(""); setTitle(""); setError(""); setUploadedThumbnail("");
    },
  });

  const handleAdd = () => {
    setError("");
    const parsed = extractVideoId(url.trim());
    if (!parsed) return setError("לינק לא תקין");
    
    const finalCategory = (newCategory.trim() || category || "").trim();
    if (!finalCategory) return setError("חובה לבחור קטגוריה");

    createMutation.mutate({
      title: title.trim(),
      video_id: parsed.video_id,
      type: parsed.type,
      category: finalCategory,
      thumbnail_url: uploadedThumbnail || undefined,
      series_name: seriesName || undefined,
      season_number: seasonNumber ? parseInt(seasonNumber) : undefined,
      episode_number: episodeNumber ? parseInt(episodeNumber) : undefined,
    });
  };

  // --- תצוגת מסך כניסה ---
  if (!isAuthorized) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Assistant' }}>
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e50914' }}>
          <h2 style={{ color: '#e50914', marginBottom: '20px' }}>כניסת מנהל ZOVEX</h2>
          <input 
            type="password" 
            placeholder="הכנס סיסמה" 
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: 'none', marginBottom: '15px', width: '200px', textAlign: 'center' }}
          />
          <br />
          <button 
            onClick={() => passInput === ADMIN_PASSWORD ? setIsAuthorized(true) : alert("סיסמה שגויה")}
            style={{ background: '#e50914', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '5px', cursor: 'pointer' }}
          >כניסה</button>
        </div>
      </div>
    );
  }

  // --- תצוגת פאנל הניהול (אחרי סיסמה) ---
  return (
    <div className="admin-page" style={{ direction: 'rtl', padding: '20px', background: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'Assistant' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#e50914', margin: 0 }}>ZOVEX - ניהול</h1>
          <Link to="/" style={{ color: '#ccc', textDecoration: 'none', border: '1px solid #e50914', padding: '5px 15px', borderRadius: '5px' }}>חזרה לאתר ←</Link>
        </div>

        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <label style={labelS}>לינק (יוטיוב, כאן 11, דרייב)</label>
          <input style={inputS} value={url} onChange={(e) => { setUrl(e.target.value); setPlatform(detectPlatform(e.target.value)); }} placeholder="הדבק לינק כאן..." />
          
          {platform && <div style={{ fontSize: '12px', color: '#e50914', marginBottom: '10px' }}>מקור זוהה: {platform}</div>}

          <label style={labelS}>שם הסרט / פרק</label>
          <input style={inputS} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="לדוגמה: המפקדת עונה 1 פרק 1" />

          <label style={labelS}>קטגוריה</label>
          <select style={inputS} value={category} onChange={(e) => { setCategory(e.target.value); if(e.target.value) setNewCategory(""); }}>
            <option value="">בחר קטגוריה...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={inputS} value={newCategory} onChange={(e) => { setNewCategory(e.target.value); if(e.target.value) setCategory(""); }} placeholder="או צור קטגוריה חדשה..." />

          {error && <p style={{ color: '#ff4444' }}>{error}</p>}
          
          <button onClick={handleAdd} style={{ width: '100%', background: '#e50914', color: '#fff', border: 'none', padding: '15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {createMutation.isPending ? "מעלה..." : "הוסף למאגר"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputS = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' };
const labelS = { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#94a3b8' };