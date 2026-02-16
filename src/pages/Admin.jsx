import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CyberStyles from "../components/cyber/CyberStyles";
import CyberBackground from "../components/cyber/CyberBackground";
import GlassPanel from "../components/cyber/GlassPanel";

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
  // Plain ID
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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Movie.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movies"] }),
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
      setError("לינק לא תקין — הכנס לינק YouTube או Google Drive");
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

    createMutation.mutate({
      title: finalTitle,
      description: description.trim() || undefined,
      video_id: parsed.video_id,
      type: parsed.type,
      category: finalCategory,
    });
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
                <label style={labelStyle}>לינק (YouTube / Google Drive)</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
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
                                : "#4da3ff",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {movie.type === "youtube" ? "▶ YT" : "☁ DRIVE"}
                        </span>
                      </div>
                    </div>

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
                        e.currentTarget.style.background =
                          "rgba(255,0,60,0.2)";
                        e.currentTarget.style.boxShadow =
                          "0 0 12px rgba(255,0,60,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,0,60,0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </>
  );
}