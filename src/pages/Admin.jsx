import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
    /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/
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
  
  // Rumble
  const rumbleMatch = url.match(
    /rumble\.com\/(v[a-zA-Z0-9]+)/
  );
  if (rumbleMatch) return { type: "rumble", video_id: rumbleMatch[1] };
  
  return null;
}

const detectPlatform = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('rumble.com')) return 'Rumble';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('dailymotion.com')) return 'Dailymotion';
  if (url.includes('blogger.com') || url.includes('blogspot.com') || url.includes('hakavod.com')) return 'Blogger/Hakavod (חסום)';
  if (url.includes('streamable.com')) return 'Streamable';
  if (url.includes('archive.org')) return 'Archive.org';
  return 'אחר';
};

const canEmbedPlatform = (platform) => {
  return !platform.includes('חסום');
};

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
  const [seriesDescription, setSeriesDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [urlStatus, setUrlStatus] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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
      setSeriesDescription("");
      setPlatform("");
      setUrlStatus("");
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

  const checkUrl = (inputUrl) => {
    if (!inputUrl) {
      setUrlStatus("");
      setPlatform("");
      return;
    }

    setUrlStatus("checking");
    
    setTimeout(() => {
      const detectedPlatform = detectPlatform(inputUrl);
      setPlatform(detectedPlatform);
      setUrlStatus(canEmbedPlatform(detectedPlatform) ? "valid" : "blocked");
    }, 500);
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    checkUrl(newUrl);
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
      if (seriesDescription.trim()) {
        movieData.description = seriesDescription.trim();
      }
    }

    createMutation.mutate(movieData);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;800&display=swap');
        
        .admin-page {
          background: #0f172a;
          color: #f8fafc;
          font-family: 'Assistant', sans-serif;
          min-height: 100vh;
          direction: rtl;
        }
        
        .admin-page ::-webkit-scrollbar { width: 8px; }
        .admin-page ::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
      `}</style>

      <div className="admin-page relative min-h-screen"
        style={{
          background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)',
        }}
      >

        <div className="relative z-[2] max-w-[800px] mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h1
              style={{
                fontFamily: "'Assistant',sans-serif",
                fontSize: 32,
                fontWeight: 800,
                color: "#e50914",
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              ZOVEX - פאנל ניהול
            </h1>
            <Link
              to={createPageUrl("Home")}
              className="no-underline px-4 py-2 rounded transition-all duration-200"
              style={{
                background: "rgba(229,9,20,0.1)",
                border: "2px solid #e50914",
                fontFamily: "'Assistant',sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              ← חזרה לסינמה
            </Link>
          </div>

          {/* Category Manager */}
          <div style={{ 
            padding: 24, 
            marginBottom: 32,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid rgba(229,9,20,0.2)',
          }}>
            <div
              className="mb-5"
              style={{
                fontFamily: "'Assistant',sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#e50914",
              }}
            >
              ניהול קטגוריות
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="cursor-pointer transition-all duration-200 py-2.5 px-4 rounded flex items-center justify-between"
                style={{
                  background: "rgba(229,9,20,0.1)",
                  border: "1px solid rgba(229,9,20,0.3)",
                  fontFamily: "'Assistant',sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
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
                    border: "1px solid rgba(229,9,20,0.2)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Assistant',sans-serif",
                      fontSize: 13,
                      color: "#cbd5e1",
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
                        background: "rgba(229,9,20,0.2)",
                        border: "1px solid #e50914",
                        fontFamily: "'Assistant',sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      🗑 מחק קטגוריה וסרטים
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Movie Form */}
          <div style={{ 
            padding: 24, 
            marginBottom: 32,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid rgba(229,9,20,0.2)',
          }}>
            <div
              className="mb-5"
              style={{
                fontFamily: "'Assistant',sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#e50914",
              }}
            >
              הוסף סרט חדש
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>לינק וידאו</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={url}
                    onChange={handleUrlChange}
                    placeholder="YouTube, Drive, Vimeo, Rumble..."
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "#e50914")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                    }
                  />
                  {urlStatus === 'checking' && (
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      ⏳
                    </div>
                  )}
                  {urlStatus === 'valid' && (
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e' }}>
                      ✓
                    </div>
                  )}
                  {urlStatus === 'blocked' && (
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#f97316' }}>
                      ⚠
                    </div>
                  )}
                </div>
                {platform && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: urlStatus === 'valid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                    color: urlStatus === 'valid' ? '#22c55e' : '#f97316',
                  }}>
                    {platform}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>שם הסרט</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="הכנס שם..."
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "#e50914")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                  }
                />
              </div>

              {!((category && category.toLowerCase().includes("סדר")) || 
                (newCategory && newCategory.toLowerCase().includes("סדר"))) && (
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
                      (e.target.style.borderColor = "#e50914")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                    }
                  />
                </div>
              )}

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
                        background: "rgba(229,9,20,0.2)",
                        border: "1px solid #e50914",
                        color: "#fff",
                        fontFamily: "'Assistant',sans-serif",
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
                    (e.target.style.borderColor = "#e50914")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                  }
                />
              </div>

              {url.includes("cloudinary") && !extractVideoId(url)?.cloudinary_cloud_name && (
                <div>
                  <label style={labelStyle}>Cloudinary Cloud Name</label>
                  <input
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    placeholder="demo"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "#e50914")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                    }
                  />
                </div>
              )}

              {((category && category.toLowerCase().includes("סדר")) || 
                (newCategory && newCategory.toLowerCase().includes("סדר"))) && (
                <>
                  <div>
                    <label style={labelStyle}>תיאור הסדרה (אופציונלי)</label>
                    <textarea
                      value={seriesDescription}
                      onChange={(e) => setSeriesDescription(e.target.value)}
                      placeholder="הוסף תיאור לסדרה..."
                      rows={3}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        minHeight: 80,
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "#e50914")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                      }
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>בחר סדרה</label>
                    {(() => {
                      const existingSeries = [...new Set(movies.filter(m => m.series_name).map(m => m.series_name))].sort((a, b) =>
                        a.localeCompare(b, "he")
                      );
                      return (
                        <>
                          <select
                            value={seriesName}
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              setSeriesName(selectedName);
                              if (selectedName) {
                                const firstEpisode = movies.find(m => m.series_name === selectedName);
                                if (firstEpisode && firstEpisode.description) {
                                  setSeriesDescription(firstEpisode.description);
                                }
                              }
                            }}
                            style={{
                              ...inputStyle,
                              cursor: "pointer",
                            }}
                          >
                            <option value="">צור סדרה חדשה...</option>
                            {existingSeries.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                          {!seriesName && (
                            <input
                              value={seriesName}
                              onChange={(e) => setSeriesName(e.target.value)}
                              placeholder="הקלד שם לסדרה חדשה..."
                              style={{ ...inputStyle, marginTop: 8 }}
                              onFocus={(e) =>
                                (e.target.style.borderColor = "#e50914")
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                              }
                            />
                          )}
                        </>
                      );
                    })()}
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
                          (e.target.style.borderColor = "#e50914")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "rgba(229,9,20,0.2)")
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
                          (e.target.style.borderColor = "#e50914")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "rgba(229,9,20,0.2)")
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
                    background: "rgba(229,9,20,0.2)",
                    border: "1px solid #e50914",
                    fontFamily: "'Assistant',sans-serif",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={createMutation.isPending}
                className="cursor-pointer transition-all duration-200 py-3 rounded"
                style={{
                  background: "#e50914",
                  border: "none",
                  fontFamily: "'Assistant',sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  opacity: createMutation.isPending ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!createMutation.isPending) {
                    e.currentTarget.style.background = "#c40812";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#e50914";
                }}
              >
                {createMutation.isPending ? "מוסיף..." : "➕ הוסף סרט"}
              </button>
            </div>
          </div>

          {/* Movie List - Grouped by Categories */}
          <div style={{ 
            padding: 24,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid rgba(229,9,20,0.2)',
          }}>
            <div
              className="mb-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  style={{
                    fontFamily: "'Assistant',sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#e50914",
                  }}
                >
                  סרטים ({movies.length})
                </span>
              </div>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש סרט לפי שם, תיאור או קטגוריה..."
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#e50914")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(229,9,20,0.2)")
                }
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{
                    border: "2px solid rgba(229,9,20,0.3)",
                    borderTop: "2px solid #e50914",
                    animation: "spin 0.9s linear infinite",
                  }}
                />
              </div>
            ) : movies.length === 0 ? (
              <div
                className="text-center py-10 opacity-50"
                style={{
                  fontFamily: "'Assistant',sans-serif",
                  fontSize: 14,
                  color: "#cbd5e1",
                }}
              >
                אין סרטים עדיין
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {categories.map((cat) => {
                  const categoryMovies = movies.filter(m => {
                    const matchesCategory = m.category === cat;
                    const matchesSearch = searchQuery === "" || 
                      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.category?.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });
                  
                  if (categoryMovies.length === 0) return null;
                  
                  const isExpanded = expandedCategories[cat] ?? true;
                  
                  return (
                    <div key={cat}>
                      <button
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [cat]: !isExpanded }))}
                        className="w-full flex items-center justify-between p-3 rounded cursor-pointer transition-all duration-200"
                        style={{
                          background: "rgba(229,9,20,0.15)",
                          border: "1px solid rgba(229,9,20,0.3)",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Assistant',sans-serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {cat} ({categoryMovies.length})
                        </span>
                        <span style={{ fontSize: 14, color: "#fff" }}>
                          {isExpanded ? "▼" : "◀"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="flex flex-col gap-2 mt-2">
                          {categoryMovies.map((movie) => (
                            <div
                              key={movie.id}
                              className="flex items-center justify-between gap-3 p-3 rounded transition-colors duration-200"
                              style={{
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid rgba(229,9,20,0.1)",
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div
                                  className="truncate"
                                  style={{
                                    fontFamily: "'Assistant',sans-serif",
                                    fontWeight: 600,
                                    fontSize: 16,
                                    color: "#f8fafc",
                                  }}
                                >
                                  {movie.title}
                                </div>
                                {movie.description && (
                                  <div
                                    className="truncate mt-1"
                                    style={{
                                      fontFamily: "'Assistant',sans-serif",
                                      fontSize: 13,
                                      color: "#cbd5e1",
                                      opacity: 0.7,
                                    }}
                                  >
                                    {movie.description}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    style={{
                                      fontFamily: "'Assistant',sans-serif",
                                      fontSize: 11,
                                      color: "#94a3b8",
                                    }}
                                  >
                                    {movie.type === "youtube" ? "▶ YT" : movie.type === "cloudinary" ? "☁ CLOUD" : movie.type === "archive" ? "📚 ARCHIVE" : movie.type === "rumble" ? "🎬 RUMBLE" : "☁ DRIVE"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingMovie(movie)}
                                  className="shrink-0 w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-all duration-200"
                                  style={{
                                    background: "rgba(229,9,20,0.1)",
                                    border: "1px solid rgba(229,9,20,0.3)",
                                    color: "#fff",
                                    fontFamily: "'Assistant',sans-serif",
                                    fontSize: 14,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#e50914";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(229,9,20,0.1)";
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
                                    background: "rgba(220,38,38,0.1)",
                                    border: "1px solid rgba(220,38,38,0.3)",
                                    color: "#fff",
                                    fontFamily: "'Assistant',sans-serif",
                                    fontSize: 14,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#dc2626";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(220,38,38,0.1)";
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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