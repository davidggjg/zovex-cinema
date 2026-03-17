import { X } from "lucide-react";

function buildSrc(movie) {
  const vid = (movie.video_id || movie.video_url || "").trim();
  const type = movie.type || "direct";
  if (!vid) return null;

  if (type === "youtube" || vid.includes("youtube") || vid.includes("youtu.be")) {
    const m = vid.match(/(?:v=|youtu\.be\/)([^&/?]+)/);
    const id = m ? m[1] : vid;
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (type === "drive" || vid.includes("drive.google")) {
    const m = vid.match(/\/d\/([^/?]+)/);
    const id = m ? m[1] : vid;
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  if (type === "vimeo" || vid.includes("vimeo")) {
    const m = vid.match(/vimeo\.com\/(\d+)/);
    const id = m ? m[1] : vid;
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  if (type === "dailymotion" || vid.includes("dailymotion") || vid.includes("dai.ly")) {
    const m = vid.match(/(?:video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
    const id = m ? m[1] : vid;
    return `https://www.dailymotion.com/embed/video/${id}?autoplay=1`;
  }
  if (type === "streamable" || vid.includes("streamable")) {
    const m = vid.match(/streamable\.com\/([a-zA-Z0-9]+)/);
    const id = m ? m[1] : vid;
    return `https://streamable.com/e/${id}?autoplay=1`;
  }
  if (type === "rumble" || vid.includes("rumble")) {
    const m = vid.match(/(?:embed\/|video\/)([a-zA-Z0-9]+)/);
    const id = m ? m[1] : vid;
    return `https://rumble.com/embed/${id}/`;
  }
  if (type === "archive" || vid.includes("archive.org")) {
    const m = vid.match(/archive\.org\/(?:embed|details)\/([^/?]+)/);
    const id = m ? m[1] : vid;
    return `https://archive.org/embed/${id}`;
  }
  if (type === "kan" || vid.includes("kan.org")) {
    return `https://www.kan.org.il/General/Embed.aspx?id=${vid}`;
  }
  if (type === "okru" || vid.includes("ok.ru")) {
    const m = vid.match(/ok\.ru\/video\/(\d+)/);
    const id = m ? m[1] : vid;
    return `https://ok.ru/videoembed/${id}`;
  }
  if (type === "telegram" || vid.includes("t.me")) {
    return vid; // telegram doesn't embed well, just show link
  }
  if (type === "jellyfin") {
    const server = (movie.jellyfin_server || "").replace(/\/$/, "");
    const apiKey = movie.jellyfin_api_key || "";
    if (server && vid) {
      return `${server}/web/index.html#!/video?id=${vid}&serverId=&api_key=${apiKey}`;
    }
    return null;
  }
  // direct mp4 or any other URL
  return vid.startsWith("http") ? vid : null;
}

export default function CustomVideoPlayer({ movie, onClose }) {
  const src = buildSrc(movie);
  const useVideoTag = movie.type === "jellyfin" || movie.type === "direct";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column" }}>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 15, right: 15, zIndex: 10, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20 }}
      >
        <X size={24} />
      </button>
      <p style={{ color: "#aaa", fontSize: 13, padding: "52px 55px 6px", textAlign: "center", fontFamily: "Arial", flexShrink: 0 }}>{movie.title}</p>

      {!src ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: 15, fontFamily: "Arial" }}>
          אין קישור וידאו זמין
        </div>
      ) : useVideoTag ? (
        <video
          src={src}
          controls
          autoPlay
          controlsList="nodownload"
          style={{ flex: 1, width: "100%", background: "#000" }}
        />
      ) : (
        <iframe
          src={src}
          style={{ flex: 1, width: "100%", border: "none" }}
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      )}
    </div>
  );
}