import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EditMovieModal from "../components/admin/EditMovieModal";
import { debounce } from "lodash";

// --- פונקציות עזר מהקוד המקורי ---
function extractVideoId(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", video_id: ytMatch[1] };
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "drive", video_id: driveMatch[1] };
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { type: "vimeo", video_id: vimeoMatch[1] };
  const rumbleMatch = url.match(/rumble\.com\/(v[a-zA-Z0-9]+)/);
  if (rumbleMatch) return { type: "rumble", video_id: rumbleMatch[1] };
  return { type: "other", video_id: url }; 
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
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('rumble.com')) return 'Rumble';
  return 'אחר';
};

// --- קומפוננטת הניהול הראשית ---
export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState("");
  const [uploadedThumbnail, setUploadedThumbnail] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [editingMovie, setEditingMovie] = useState(null);
  const [seriesDescription, setSeriesDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [urlStatus, setUrlStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [year, setYear] = useState("");

  // לוגיקת חיפוש
  const debouncedSetSearch = useCallback(debounce((value) => setDebouncedSearch(value), 300), []);
  useEffect(() => { debouncedSetSearch(searchQuery); }, [searchQuery, debouncedSetSearch]);

  // טעינת נתונים
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const categories = useMemo(() => 
    [...new Set(movies.map((m) => m.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "he")),
    [movies]
  );

  // מוטציות (יצירה, מחיקה, עדכון)
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      resetForm();
    },
  });

  const resetForm = () => {
    setUrl(""); setTitle(""); setDescription(""); setCategory(""); setNewCategory("");
    setUploadedThumbnail(""); setSeriesName(""); setSeasonNumber(""); setEpisodeNumber("");
    setTags([]); setYear("");
  };

  const handleAdd = () => {
    const parsed = extractVideoId(url.trim());
    if (!parsed || !title.trim()) { setError("חסרים פרטים"); return; }
    
    const movieData = {
      title: title.trim(),
      description: description.trim(),
      video_id: parsed.video_id,
      type: parsed.type,
      category: (newCategory.trim() || category).trim(),
      thumbnail_url: uploadedThumbnail || undefined,
      year: year ? parseInt(year) : undefined,
      tags: tags.length > 0 ? tags : undefined
    };

    createMutation.mutate(movieData);
  };

  // --- מסך כניסה (סיסמה) ---
  if (!isAuthorized) {
    return (
      <div style={{ height: "100vh", background: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", direction: "rtl", fontFamily: "Assistant" }}>
        <div style={{ background: "#1e293b", padding: "40px", borderRadius: "12px", border: "2px solid #e50914", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
          <h1 style={{ color: "#e50914", marginBottom: "20px" }}>ZOVEX ADMIN</h1>
          <input 
            type="password" 
            placeholder="הכנס קוד גישה"
            onChange={(e) => setPasscode(e.target.value)}
            style={{ padding: "12px", width: "200px", borderRadius: "6px", border: "none", marginBottom: "20px", display: "block", margin: "0 auto 20px" }}
          />
          <button 
            onClick={() => passcode === "ZOVEX2026" ? setIsAuthorized(true) : alert("קוד שגוי")}
            style={{ background: "#e50914", color: "white", padding: "10px 30px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            כניסה למערכת
          </button>
        </div>
      </div>
    );
  }

  // --- הפאנל המקורי (מוצג רק אחרי סיסמה) ---
  return (
    <div className="admin-page" style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px', direction: 'rtl', fontFamily: 'Assistant' }}>
      <div className="max-w-[800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 style={{ color: '#e50914', fontSize: '30px', fontWeight: '800' }}>ZOVEX - ניהול תוכן</h1>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', border: '1px solid #e50914', padding: '5px 15px', borderRadius: '5px' }}>חזרה לאתר</Link>
        </div>

        {/* טופס הוספה מהקוד המקורי שלך */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid rgba(229,9,20,0.3)' }}>
            <h3 style={{ marginBottom: '15px', color: '#e50914' }}>הוספת סרט/פרק חדש</h3>
            <input placeholder="שם הסרט" value={title} onChange={(e) => setTitle(e.target.value)} style={inStyle} />
            <input placeholder="לינק (YouTube, Drive, וכו')" value={url} onChange={(e) => setUrl(e.target.value)} style={inStyle} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inStyle}>
                <option value="">בחר קטגוריה</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="או קטגוריה חדשה" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={inStyle} />
            <button onClick={handleAdd} style={{ width: '100%', padding: '12px', background: '#e50914', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                {createMutation.isPending ? "שומר..." : "פרסם תוכן"}
            </button>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>

        {/* רשימת סרטים קיימת */}
        <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '10px' }}>סרטים במערכת ({movies.length})</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
                {movies.slice(0, 10).map(movie => (
                    <div key={movie.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{movie.title} ({movie.category})</span>
                        <button onClick={() => base44.entities.Movie.delete(movie.id).then(() => queryClient.invalidateQueries(["movies"]))} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>מחק</button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

const inStyle = { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "5px", border: "1px solid #334155", background: "#0f172a", color: "white" };