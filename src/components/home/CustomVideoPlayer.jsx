import { useRef, useState, useEffect, useCallback } from "react";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function CustomVideoPlayer({ movie, onClose }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimer = useRef(null);
  const longPressTimer = useRef(null);
  const lastTapTime = useRef({ left: 0, right: 0 });

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLongPress, setIsLongPress] = useState(false);
  const [skipIndicator, setSkipIndicator] = useState(null); // "left" | "right" | null
  const [speedIndicator, setSpeedIndicator] = useState(false);

  const vid = movie.video_id || movie.video_url || "";
  const type = movie.type || "direct";

  // Only works for direct MP4 links
  const isDirectVideo = type === "direct" || vid.startsWith("http") && (vid.includes(".mp4") || vid.includes("stream") || vid.includes("video"));

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => {
      clearTimeout(hideControlsTimer.current);
      clearTimeout(longPressTimer.current);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    resetHideTimer();
  };

  const skip = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
    setSkipIndicator(seconds > 0 ? "right" : "left");
    setTimeout(() => setSkipIndicator(null), 700);
    resetHideTimer();
  };

  // Double tap detection
  const handleTap = (side) => {
    const now = Date.now();
    const last = lastTapTime.current[side];
    if (now - last < 300) {
      // Double tap
      skip(side === "right" ? 10 : -10);
      lastTapTime.current[side] = 0;
    } else {
      lastTapTime.current[side] = now;
      // Single tap — toggle controls / play
      setTimeout(() => {
        if (Date.now() - lastTapTime.current[side] >= 280) {
          togglePlay();
        }
      }, 310);
    }
  };

  // Long press for 2x speed
  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (v) v.playbackRate = 2;
      setIsLongPress(true);
      setSpeedIndicator(true);
    }, 500);
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
    if (isLongPress) {
      const v = videoRef.current;
      if (v) v.playbackRate = 1;
      setIsLongPress(false);
      setSpeedIndicator(false);
    }
  };

  // If not a direct video, show iframe player
  if (!isDirectVideo) {
    // fallback to iframe
    const fr = { width: "100%", height: "100%", border: "none" };
    let src = "";
    if (type === "youtube" || vid.includes("youtube") || vid.includes("youtu.be")) {
      const id = vid.replace(/.*[?&]v=/, "").replace(/.*youtu\.be\//, "").split("&")[0];
      src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    } else if (type === "drive" || vid.includes("drive.google")) {
      const id = vid.replace(/.*\/d\//, "").replace(/\/.*/, "").split("?")[0];
      src = `https://drive.google.com/file/d/${id}/preview`;
    } else if (type === "vimeo" || vid.includes("vimeo")) {
      const id = vid.replace(/.*vimeo\.com\//, "").split("?")[0];
      src = `https://player.vimeo.com/video/${id}?autoplay=1`;
    } else if (type === "dailymotion" || vid.includes("dailymotion")) {
      const id = vid.replace(/.*video\//, "").split(/[?_]/)[0];
      src = `https://www.dailymotion.com/embed/video/${id}?autoplay=1`;
    } else if (type === "streamable" || vid.includes("streamable")) {
      const id = vid.replace(/.*streamable\.com\//, "").split("?")[0];
      src = `https://streamable.com/e/${id}?autoplay=1`;
    } else if (type === "rumble" || vid.includes("rumble")) {
      const id = vid.replace(/.*rumble\.com\/embed\//, "").replace(/.*rumble\.com\/video\//, "").split(/[/?]/)[0];
      src = `https://rumble.com/embed/${id}/`;
    } else if (type === "archive" || vid.includes("archive.org")) {
      const id = vid.replace(/.*archive\.org\/(?:embed|details)\//, "").split("?")[0];
      src = `https://archive.org/embed/${id}`;
    } else {
      src = vid;
    }

    return (
      <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 15, right: 15, zIndex: 10, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={24} />
        </button>
        <p style={{ color: "#aaa", fontSize: 13, padding: "50px 55px 8px", textAlign: "center", fontFamily: "Arial" }}>{movie.title}</p>
        <iframe src={src} style={fr} allowFullScreen allow="autoplay" />
      </div>
    );
  }

  // Direct video with custom controls
  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none" }}
      onPointerMove={resetHideTimer}
    >
      <video
        ref={videoRef}
        src={vid}
        autoPlay
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Left tap zone */}
      <div
        style={{ position: "absolute", left: 0, top: 0, width: "40%", height: "100%", zIndex: 2 }}
        onClick={() => handleTap("left")}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Right tap zone */}
      <div
        style={{ position: "absolute", right: 0, top: 0, width: "40%", height: "100%", zIndex: 2 }}
        onClick={() => handleTap("right")}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Center tap zone (play/pause only) */}
      <div
        style={{ position: "absolute", left: "40%", top: 0, width: "20%", height: "100%", zIndex: 2 }}
        onClick={togglePlay}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Skip indicator */}
      {skipIndicator && (
        <div style={{
          position: "absolute",
          [skipIndicator === "right" ? "right" : "left"]: "10%",
          top: "50%", transform: "translateY(-50%)",
          background: "rgba(0,0,0,.6)", borderRadius: 50, padding: "12px 18px",
          color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "Arial",
          pointerEvents: "none", zIndex: 5,
          animation: "fadeOut .7s ease forwards"
        }}>
          {skipIndicator === "right" ? "▶▶ 10s" : "10s ◀◀"}
        </div>
      )}

      {/* Speed indicator */}
      {speedIndicator && (
        <div style={{
          position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
          background: "rgba(229,9,20,.85)", borderRadius: 20, padding: "8px 20px",
          color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: "Arial",
          pointerEvents: "none", zIndex: 5
        }}>
          ⚡ x2
        </div>
      )}

      {/* Controls overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        opacity: showControls ? 1 : 0,
        transition: "opacity .3s",
        pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,.7) 100%)"
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 15, right: 15, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", pointerEvents: "auto" }}
        >
          <X size={24} />
        </button>

        {/* Title */}
        <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", color: "#fff", fontSize: 14, fontFamily: "Arial", fontWeight: 700, maxWidth: "60%", textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,.8)" }}>
          {movie.title}
        </div>

        {/* Bottom controls */}
        <div style={{ position: "absolute", bottom: 20, left: 16, right: 16, display: "flex", alignItems: "center", gap: 14, pointerEvents: "auto" }}>
          <button onClick={togglePlay} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
            {playing ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </button>
          <button onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } resetHideTimer(); }}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontFamily: "Arial", marginRight: "auto" }}>
            לחץ פעמיים לדילוג 10 שניות · לחיצה ארוכה x2
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeOut { 0%{opacity:1} 60%{opacity:1} 100%{opacity:0} }`}</style>
    </div>
  );
}