import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function EditMovieModal({ movie, onClose, onUpdate }) {
  const [title, setTitle] = useState(movie.title || "");
  const [description, setDescription] = useState(movie.description || "");
  const [videoId, setVideoId] = useState(movie.video_id || "");
  const [category, setCategory] = useState(movie.category || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(movie.thumbnail_url || "");
  const [seriesName, setSeriesName] = useState(movie.series_name || "");
  const [seasonNumber, setSeasonNumber] = useState(movie.season_number || "");
  const [episodeNumber, setEpisodeNumber] = useState(movie.episode_number || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tags, setTags] = useState(movie.tags || []);
  const [newTag, setNewTag] = useState("");
  const [year, setYear] = useState(movie.year || "");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSave = () => {
    const updatedData = {
      title: title.trim(),
      description: description.trim() || undefined,
      video_id: videoId.trim(),
      category: category.trim(),
      thumbnail_url: thumbnailUrl || undefined,
      series_name: seriesName.trim() || undefined,
      season_number: seasonNumber ? parseInt(seasonNumber) : undefined,
      episode_number: episodeNumber ? parseInt(episodeNumber) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      year: year ? parseInt(year) : undefined,
    };

    onUpdate(movie.id, updatedData);
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(229,9,20,0.2)",
    borderRadius: 6,
    color: "#f8fafc",
    fontFamily: "'Assistant',sans-serif",
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    direction: "rtl",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "'Assistant',sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "30px",
          background: "#1e293b",
          borderRadius: "12px",
          border: "2px solid rgba(229,9,20,0.3)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            borderBottom: "2px solid #e50914",
            paddingBottom: "15px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: "#e50914",
              fontFamily: "'Assistant',sans-serif",
            }}
          >
            ✏️ עריכת סרט
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              padding: "8px 15px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>שם הסרט</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
            />
          </div>

          <div>
            <label style={labelStyle}>תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 80,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
            />
          </div>

          <div>
            <label style={labelStyle}>קישור וידאו</label>
            <input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="https://youtube.com/watch?v=... או https://rumble.com/v..."
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
            />
          </div>

          <div>
            <label style={labelStyle}>קטגוריה</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
            />
          </div>

          <div>
            <label style={labelStyle}>תמונה מקדימה</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setUploadingImage(true);
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setThumbnailUrl(file_url);
                  } catch (err) {
                    alert("שגיאה בהעלאת התמונה");
                  } finally {
                    setUploadingImage(false);
                  }
                }
              }}
              style={{
                ...inputStyle,
                padding: "8px",
              }}
            />
            {thumbnailUrl && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={thumbnailUrl}
                  alt="thumbnail"
                  style={{
                    width: "100px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              </div>
            )}
          </div>

          {/* Series Fields */}
          <div>
            <label style={labelStyle}>שם סדרה (אופציונלי)</label>
            <input
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>מספר עונה</label>
              <input
                type="number"
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#e50914")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
              />
            </div>

            <div>
              <label style={labelStyle}>מספר פרק</label>
              <input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#e50914")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>שנת יציאה</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#e50914")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
            />
          </div>

          <div>
            <label style={labelStyle}>תגיות</label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  background: 'rgba(229,9,20,0.2)',
                  border: '1px solid #e50914',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    e.preventDefault();
                    if (!tags.includes(newTag.trim())) {
                      setTags([...tags, newTag.trim()]);
                    }
                    setNewTag('');
                  }
                }}
                placeholder="הוסף תגית (Enter)"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => (e.target.style.borderColor = "#e50914")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(229,9,20,0.2)")}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "'Assistant',sans-serif",
              }}
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "6px",
                background: "#e50914",
                color: "white",
                cursor: "pointer",
                fontFamily: "'Assistant',sans-serif",
              }}
            >
              💾 שמור שינויים
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}