import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CyberStyles from "../components/cyber/CyberStyles";
import CyberBackground from "../components/cyber/CyberBackground";
import GlassPanel from "../components/cyber/GlassPanel";
import EditMovieModal from "../components/admin/EditMovieModal";

function extractVideoId(url) {
  if (!url) return null;
  
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return { type: "youtube", video_id: ytMatch[1] };
  
  // Google Drive
  const driveMatch = url.match(
    /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/
  );
  if (driveMatch) return { type: "drive", video_id: driveMatch[1] };
  
  // Vimeo
  const vimeoMatch = url.match(
    /vimeo\.com\/(?:video\/)?(\d+)/
  );
  if (vimeoMatch) return { type: "vimeo", video_id: vimeoMatch[1] };
  
  // Dailymotion
  const dailymotionMatch = url.match(
    /dailymotion\.com\/video\/([a-zA-Z0-9]+)/
  );
  if (dailymotionMatch) return { type: "dailymotion", video_id: dailymotionMatch[1] };
  
  // Streamable
  const streamableMatch = url.match(
    /streamable\.com\/([a-zA-Z0-9]+)/
  );
  if (streamableMatch) return { type: "streamable", video_id: streamableMatch[1] };
  
  // Archive.org
  const archiveMatch = url.match(
    /archive\.org\/details\/([^\/\?]+)/
  );
  if (archiveMatch) return { type: "archive", video_id: archiveMatch[1] };
  
  return null;
}

export default function Admin() {
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
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState("");
  const [editingMovie, setEditingMovie] = useState(null);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => base44.entities.Movie.list("-created_date"),
  });

  const categories = [...new Set(movies.map((m) => m.category))].sort((a, b) =>
    a.localeCompare(b, "he")
  );

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Movie.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setUrl("");
      setTitle("");
      setDescription("");
      setCategory("");
      setNewCategory("");
      setError("");
      setUploadedThumbnail("");
      setSeriesName("");
      setSeasonNumber("");
      setEpisodeNumber("");
      setCloudinaryCloudName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Movie.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movies"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Movie.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setEditingMovie(null);
    },
  });

  const handleDeleteCategory = async () => {
    if (!selectedCategoryToDelete) return;
    
    const moviesToDelete = movies.filter(m => m.category === selectedCategoryToDelete);
    
    if (window.confirm(`למחוק ${moviesToDelete.length} סרטים בקטגוריה "${selectedCategoryToDelete}"?`)) {
      for (const movie of moviesToDelete) {
        await base44.entities.Movie.delete(movie.id);
      }
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setSelectedCategoryToDelete("");
      setShowCategoryManager(false);
    }
  };

  const handleAdd = () => {
    setError("");
    const parsed = extractVideoId(url.trim());
    if (!parsed) {
      setError("לינק לא תקין — הכנס לינק מאחד המקורות הנתמכים");
      return;
    }
    const finalTitle = title.trim();
    if (!finalTitle) {
      setError("חובה לכתוב שם לסרט");
      return;
    }
    const finalCategory = (newCategory.trim() || category || "").trim();
    if (!finalCategory) {
      setError("חובה לבחור או ליצור קטגוריה");
      return;
    }

    const movieData = {
      title: finalTitle,
      description: description.trim() || undefined,
      video_id: parsed.video_id,
      type: parsed.type,
      category: finalCategory,
      thumbnail_url: uploadedThumbnail || undefined,
    };

    // Add Cloudinary cloud name if needed
    if (parsed.type === "cloudinary") {
      if (parsed.cloudinary_cloud_name) {
        movieData.cloudinary_cloud_name = parsed.cloudinary_cloud_name;
      } else if (cloudinaryCloudName.trim()) {
        movieData.cloudinary_cloud_name = cloudinaryCloudName.trim();
      } else {
        setError("חובה להזין שם Cloud של Cloudinary");
        return;
      }
    }

    // Add series fields if category is "סדרות"
    if (finalCategory.toLowerCase().includes("סדר")) {
      if (seriesName.trim()) {
        movieData.series_name = seriesName.trim();
      }
      if (seasonNumber && !isNaN(seasonNumber)) {
        movieData.season_number = parseInt(seasonNumber);
      }
      if (episodeNumber && !isNaN(episodeNumber)) {
        movieData.episode_number = parseInt(episodeNumber);
      }
    }

    createMutation.mutate(movieData);
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
    transition: "border-color 0.2s",
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
    <>
      <CyberStyles />

      <div className="cyber-page relative min-h-screen z-[1]">
        <CyberBackground />

        <div className="relative z-[2] max-w-[800px] mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h1
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: "clamp(18px,4vw,28px)",
                fontWeight: 900,
                color: "var(--cyber-neon)",
                letterSpacing: "0.15em",
              }}
            >
              פאנל ניהול
            </h1>
            <Link
              to={createPageUrl("Home")}
              className="no-underline px-4 py-2 rounded transition-all duration-200"
              style={{
                background: "rgba(0,210,255,0.08)",
                border: "1px solid rgba(0,210,255,0.25)",
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 10,
                color: "var(--cyber-neon)",
                letterSpacing: "0.1em",
              }}
            >
              ← חזרה לסינמה
            </Link>
          </div>

          {/* Category Manager */}
          <GlassPanel style={{ padding: 24, marginBottom: 32 }}>
            <div
              className="mb-5"
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--cyber-neon)",
                letterSpacing: "0.1em",
              }}
            >
              ניהול קטגוריות
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="cursor-pointer transition-all duration-200 py-2.5 px-4 rounded flex items-center justify-between"
                style={{
                  background: "rgba(0,210,255,0.08)",
                  border: "1px solid rgba(0,210,255,0.25)",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 11,
                  color: "var(--cyber-neon)",
                  letterSpacing: "0.1em",
                }}
              >
                <span>קטגוריות קיימות ({categories.length})</span>
                <span style={{ fontSize: 14 }}>
                  {showCategoryManager ? "▼" : "◀"}
                </span>
              </button>

              {showCategoryManager && categories.length > 0 && (
                <div
                  className="flex flex-col gap-2 p-3 rounded"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(0,210,255,0.1)",
                    animation: "slideIn 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: 10,
                      color: "var(--cyber-text-dim)",
                      marginBottom: 8,
                    }}
                  >
                    בחר קטגוריה למחיקה:
                  </div>
                  
                  <select
                    value={selectedCategoryToDelete}
                    onChange={(e) => setSelectedCategoryToDelete(e.target.value)}
                    style={{
                      ...inputStyle,
                      marginBottom: 8,
                      cursor: "pointer",
                    }}
                  >
                    <option value="">בחר קטגוריה...</option>
                    {categories.map((cat) => {
                      const count = movies.filter(m => m.category === cat).length;
                      return (
                        <option key={cat} value={cat}>
                          {cat} ({count} סרטים)
                        </option>
                      );
                    })}
                  </select>

                  {selectedCategoryToDelete && (
                    <button
                      onClick={handleDeleteCategory}
                      className="cursor-pointer transition-all duration-200 py-2 rounded"
                      style={{
                        background: "rgba(255,0,60,0.15)",
                        border: "1px solid rgba(255,0,60,0.4)",
                        fontFamily: "'Orbitron',sans-serif",
                        fontSize: 11,
                        color: "#ff4466",
                        letterSpacing: "0.1em",
                      }}
                    >
                      🗑 מחק קטגוריה וסרטים
                    </button>
                  )}
                </div>
              )}
            </div>
          </GlassPanel>

          {/* Add Movie Form */}
          <GlassPanel style={{ padding: 24, marginBottom: 32 }}>
            <div
              className="mb-5"
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--cyber-neon)",
                letterSpacing: "0.1em",
              }}
            >
              הוסף סרט חדש
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>לינק וידאו</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="YouTube, Drive, Vimeo, Dailymotion, Streamable..."
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
                <label style={labelStyle}>שם הסרט</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="הכנס שם..."
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
                <label style={labelStyle}>תיאור (אופציונלי)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="הוסף תיאור לסרט..."
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
                <label style={labelStyle}>תמונה לסרט (אופציונלי)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setUploadedThumbnail(file_url);
                      } catch (err) {
                        setError("שגיאה בהעלאת התמונה");
                      }
                    }
                  }}
                  style={{
                    ...inputStyle,
                    padding: "8px",
                  }}
                />
                {uploadedThumbnail && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={uploadedThumbnail}
                      alt="thumbnail"
                      className="w-20 h-12 object-cover rounded"
                    />
                    <button
                      onClick={() => setUploadedThumbnail("")}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: "rgba(255,0,60,0.1)",
                        border: "1px solid rgba(255,0,60,0.3)",
                        color: "#ff4466",
                        fontFamily: "'Orbitron',sans-serif",
                      }}
                    >
                      הסר
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>קטגוריה</label>
                {categories.length > 0 && (
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value) setNewCategory("");
                    }}
                    style={{
                      ...inputStyle,
                      marginBottom: 8,
                      cursor: "pointer",
                    }}
                  >
                    <option value="">בחר קטגוריה קיימת...</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    if (e.target.value) setCategory("");
                  }}
                  placeholder="...או צור קטגוריה חדשה"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(0,210,255,0.5)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(0,210,255,0.15)")
                  }
                />
              </div>

              {/* Cloudinary Cloud Name - Show only if URL contains cloudinary */}
              {url.includes("cloudinary") && !extractVideoId(url)?.cloudinary_cloud_name && (
                <div>
                  <label style={labelStyle}>Cloudinary Cloud Name</label>
                  <input
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    placeholder="demo"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(0,210,255,0.5)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(0,210,255,0.15)")
                    }
                  />
                </div>
              )}

              {/* Series Fields - Show only if category contains "סדר" */}
              {((category && category.toLowerCase().includes("סדר")) || 
                (newCategory && newCategory.toLowerCase().includes("סדר"))) && (
                <>
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
                      <label style={labelStyle}>מספר העונה (אופציונלי)</label>
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
                      <label style={labelStyle}>מספר הפרק (אופציונלי)</label>
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
                </>
              )}

              {error && (
                <div
                  className="rounded px-3 py-2"
                  style={{
                    background: "rgba(255,0,60,0.1)",
                    border: "1px solid rgba(255,0,60,0.3)",
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: 11,
                    color: "#ff4466",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={createMutation.isPending}
                className="cursor-pointer transition-all duration-200 py-2.5 rounded"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,210,255,0.2), rgba(0,128,255,0.15))",
                  border: "1px solid rgba(0,210,255,0.5)",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--cyber-neon)",
                  letterSpacing: "0.12em",
                  opacity: createMutation.isPending ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(0,210,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {createMutation.isPending ? "מוסיף..." : "➕ הוסף סרט"}
              </button>
            </div>
          </GlassPanel>

          {/* Movie List */}
          <GlassPanel style={{ padding: 24 }}>
            <div
              className="mb-5 flex items-center justify-between"
            >
              <span
                style={{
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--cyber-neon)",
                  letterSpacing: "0.1em",
                }}
              >
                סרטים ({movies.length})
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{
                    border: "2px solid rgba(0,210,255,0.3)",
                    borderTop: "2px solid var(--cyber-neon)",
                    animation: "spin 0.9s linear infinite",
                  }}
                />
              </div>
            ) : movies.length === 0 ? (
              <div
                className="text-center py-10 opacity-50"
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: 12,
                  color: "var(--cyber-text-dim)",
                }}
              >
                אין סרטים עדיין
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex items-center justify-between gap-3 p-3 rounded transition-colors duration-200"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(0,210,255,0.08)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="truncate"
                        style={{
                          fontFamily: "'Rajdhani',sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "var(--cyber-text)",
                        }}
                      >
                        {movie.title}
                      </div>
                      {movie.description && (
                        <div
                          className="truncate mt-1"
                          style={{
                            fontFamily: "'Share Tech Mono',monospace",
                            fontSize: 11,
                            color: "var(--cyber-text-dim)",
                            opacity: 0.7,
                          }}
                        >
                          {movie.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="rounded px-2 py-0.5"
                          style={{
                            background: "rgba(0,210,255,0.08)",
                            border: "1px solid rgba(0,210,255,0.15)",
                            fontFamily: "'Orbitron',sans-serif",
                            fontSize: 8,
                            color: "var(--cyber-neon3)",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {movie.category}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Orbitron',sans-serif",
                            fontSize: 8,
                            color:
                              movie.type === "youtube"
                                ? "#ff6666"
                                : movie.type === "cloudinary"
                                  ? "#34d399"
                                  : "#4da3ff",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {movie.type === "youtube" ? "▶ YT" : movie.type === "cloudinary" ? "☁ CLOUD" : movie.type === "archive" ? "📚 ARCHIVE" : "☁ DRIVE"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMovie(movie)}
                        className="shrink-0 w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{
                          background: "rgba(0,210,255,0.08)",
                          border: "1px solid rgba(0,210,255,0.25)",
                          color: "var(--cyber-neon)",
                          fontFamily: "'Orbitron',sans-serif",
                          fontSize: 12,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(0,210,255,0.2)";
                          e.currentTarget.style.boxShadow = "0 0 12px rgba(0,210,255,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(0,210,255,0.08)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`למחוק את "${movie.title}"?`))
                            deleteMutation.mutate(movie.id);
                        }}
                        className="shrink-0 w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{
                          background: "rgba(255,0,60,0.08)",
                          border: "1px solid rgba(255,0,60,0.25)",
                          color: "#ff4466",
                          fontFamily: "'Orbitron',sans-serif",
                          fontSize: 12,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,0,60,0.2)";
                          e.currentTarget.style.boxShadow = "0 0 12px rgba(255,0,60,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,0,60,0.08)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      {editingMovie && (
        <EditMovieModal
          movie={editingMovie}
          onClose={() => setEditingMovie(null)}
          onUpdate={(id, data) => updateMutation.mutate({ id, data })}
        />
      )}
    </>
  );
}