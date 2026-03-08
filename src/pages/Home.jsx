const startEdit = (movie) => {
  setEditingMovie(movie);
  setIsSeries(!!movie.series_name);
  setForm({
    title: movie.title || "",
    thumbnail_url: movie.thumbnail_url || "",
    category: movie.category || "",
    description: movie.description || "",
    year: String(movie.year || new Date().getFullYear()),
    series_name: movie.series_name || "",
    season_number: String(movie.season_number || ""),
    episode_number: String(movie.episode_number || ""),
    episode_title: movie.episode_title || "",
  });

  // בנה את הקישור המלא מה-video_id + type
  let fullUrl = "";
  const vid = movie.video_id || "";
  const type = movie.type || "direct";

  if (movie.video_url && movie.video_url.startsWith("http")) {
    // אם יש video_url מלא — תשתמש בו
    fullUrl = movie.video_url;
  } else if (vid) {
    // בנה קישור מלא לפי הסוג
    if (type === "youtube") fullUrl = `https://www.youtube.com/watch?v=${vid}`;
    else if (type === "drive") fullUrl = `https://drive.google.com/file/d/${vid}/view`;
    else if (type === "vimeo") fullUrl = `https://vimeo.com/${vid}`;
    else if (type === "dailymotion") fullUrl = `https://www.dailymotion.com/video/${vid}`;
    else if (type === "streamable") fullUrl = `https://streamable.com/${vid}`;
    else if (type === "rumble") fullUrl = `https://rumble.com/embed/${vid}`;
    else if (type === "archive") fullUrl = `https://archive.org/details/${vid}`;
    else if (type === "kan") fullUrl = `https://www.kan.org.il/item/?itemId=${vid}`;
    else fullUrl = vid; // direct / mp4
  }

  setVideoUrlInput(fullUrl);
  setAdminTab("add");
};