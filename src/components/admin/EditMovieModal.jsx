import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function EditMovieModal({ movie, onClose, onUpdate }) {
  const [title, setTitle] = useState(movie.title);
  const [description, setDescription] = useState(movie.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(movie.thumbnail_url || "");
  const [videoId, setVideoId] = useState(movie.video_id);
  const [category, setCategory] = useState(movie.category);
  const [seriesName, setSeriesName] = useState(movie.series_name || "");
  const [seasonNumber, setSeasonNumber] = useState(movie.season_number || "");
  const [episodeNumber, setEpisodeNumber] = useState(movie.episode_number || "");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSave = () => {
    const updatedData = {
      title,
      description: description.trim() || null,
      thumbnail_url: thumbnailUrl || undefined,
      video_id: videoId,
      category,
      series_name: seriesName.trim() || undefined,
      season_number: seasonNumber ? parseInt(seasonNumber) : undefined,
      episode_number: episodeNumber ? parseInt(episodeNumber) : undefined,
    };
    onUpdate(movie.id, updatedData);
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(0,210,255,0.15)",
    borderRadius: 4,
    color: "var(--cyber-text)",
    fontFamily: "'Share Tech Mono',monospace",
    fontSize: 13,
    padding: "10px 14px",
    outline: "none",
    direction: "rtl",
  };

  const labelStyle = {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 10,
    color: "var(--cyber-text-dim)",
    letterSpacing: "0.12em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="w-full max-w-[600px] rounded-lg p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,210,255,0.08) 0%, rgba(0,128,255,0.04) 100%)",
          border: "1px solid rgba(0,210,255,0.25)",
          backdropFilter: "blur(12px)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,210,255,0.06)",
          animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div
          className="mb-5 flex items-center justify-between"
          style={{
            fontFamily: "'Orbitron',sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--cyber-neon)",
            letterSpacing: "0.12em",
          }}
        >
          <span>✏️ עריכת סרט</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{
              background: "rgba(255,0,60,0.1)",
              border: "1px solid rgba(255,0,60,0.3)",
              color: "#ff4466",
            }}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>שם הסרט</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.15)")
              }
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
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.15)")
              }
            />
          </div>

          <div>
            <label style={labelStyle}>קישור וידאו (ID)</label>
            <input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.15)")
              }
            />
          </div>

          <div>
            <label style={labelStyle}>קטגוריה</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.15)")
              }
            />
          </div>

          <div>
            <label style={labelStyle}>תמונת תצוגה (URL)</label>
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="או העלה תמונה חדשה למטה"
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.15)")
              }
            />
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingImage(true);
                    try {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setThumbnailUrl(file_url);
                    } catch (err) {
                      alert("שגיאה בהעלאת התמונה");
                    }
                    setUploadingImage(false);
                  }
                }}
                style={{
                  ...inputStyle,
                  padding: "8px",
                }}
              />
              {uploadingImage && (
                <div
                  className="mt-2"
                  style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: 11,
                    color: "var(--cyber-neon)",
                  }}
                >
                  מעלה תמונה...
                </div>
              )}
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="thumbnail"
                  className="mt-2 w-32 h-20 object-cover rounded"
                />
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>שם הסדרה (אופציונלי)</label>
            <input
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              placeholder="למשל: Breaking Bad"
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,210,255,0.15)")
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>עונה</label>
              <input
                type="number"
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                placeholder="1, 2, 3..."
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(0,210,255,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(0,210,255,0.15)")
                }
              />
            </div>

            <div>
              <label style={labelStyle}>פרק</label>
              <input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                placeholder="1, 2, 3..."
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(0,210,255,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(0,210,255,0.15)")
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 cursor-pointer transition-all duration-200 py-2.5 rounded"
              style={{
                background: "rgba(255,0,60,0.08)",
                border: "1px solid rgba(255,0,60,0.35)",
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 11,
                color: "#ff4466",
                letterSpacing: "0.1em",
              }}
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              className="flex-1 cursor-pointer transition-all duration-200 py-2.5 rounded"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,210,255,0.2), rgba(0,128,255,0.15))",
                border: "1px solid rgba(0,210,255,0.5)",
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--cyber-neon)",
                letterSpacing: "0.1em",
              }}
            >
              💾 שמור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}