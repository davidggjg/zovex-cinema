import { useRef, useState, useEffect, useCallback } from "react";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function IframePlayer({ movie, onClose }) {
  const vid = movie.video_id || movie.video_url || "";
  const type = movie.type || "direct";
  const fr = { width: "100%", height: "100%", border: "none" };
  let src = vid;

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
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 15, right: 15, zIndex: 10, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <X size={24} />
      </button>
      <p style={{ color: "#aaa", fontSize: 13, padding: "52px 55px 6px", textAlign: "center", fontFamily: "Arial", flexShrink: 0 }}>{movie.title}</p>
      <iframe src={src} style={{ ...fr, flex: 1 }} allowFullScreen allow="autoplay" />
    </div>
  );
}

export default function CustomVideoPlayer({ movie, onClose }) {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const longPressTimer = useRef(null);
  const lastTap = useRef({ left: 0, right: 0 });

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [skipAnim, setSkipAnim] = useState(null); // "left" | "right"
  const [speedOn, setSpeedOn] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);

  const vid = movie.video_id || movie.video_url || "";
  const type = movie.type || "direct";

  // Determine if direct playable video
  const isDirectMp4 = type === "direct" || vid.includes(".mp4") || vid.includes("stream.mp4") || vid.includes("/Videos/");

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => {
      clearTimeout(hideTimer.current);
      clearTimeout(longPressTimer.current);
    };
  }, []);

  if (!isDirectMp4) {
    return <IframePlayer movie={movie} onClose={onClose} />;
  }

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
    resetHideTimer();
  };

  const skip = (secs) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs));
    setSkipAnim(secs > 0 ? "right" : "left");
    setTimeout(() => setSkipAnim(null), 700);
    resetHideTimer();
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * duration;
    resetHideTimer();
  };

  const handleTap = (side) => {
    const now = Date.now();
    if (now - lastTap.current[side] < 300) {
      skip(side === "right" ? 10 : -10);
      lastTap.current[side] = 0;
    } else {
      lastTap.current[side] = now;
      setTimeout(() => {
        if (Date.now() - lastTap.current[side] >= 280) togglePlay();
      }, 310);
    }
  };

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (v) v.playbackRate = 2;
      setIsLongPress(true);
      setSpeedOn(true);
    }, 500);
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
    if (isLongPress) {
      const v = videoRef.current;
      if (v) v.playbackRate = 1;
      setIsLongPress(false);
      setSpeedOn(false);
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onPointerMove={resetHideTimer}
    >
      <style>{`@keyframes fadeOut { 0%{opacity:1} 60%{opacity:1} 100%{opacity:0} }`}</style>

      <video
        ref={videoRef}
        src={vid}
        autoPlay
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onClick={togglePlay}
      />

      {/* Tap zones for double-tap skip */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", pointerEvents: "none" }}>
        {/* Left zone */}
        <div
          style={{ width: "40%", height: "100%", pointerEvents: "auto", cursor: "pointer" }}
          onClick={() => handleTap("left")}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {/* Center zone */}
        <div style={{ flex: 1, height: "100%", pointerEvents: "auto" }} onClick={togglePlay} />
        {/* Right zone */}
        <div
          style={{ width: "40%", height: "100%", pointerEvents: "auto", cursor: "pointer" }}
          onClick={() => handleTap("right")}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* Skip animations */}
      {skipAnim === "left" && (
        <div style={{ position: "absolute", left: "8%", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.65)", borderRadius: 40, padding: "12px 20px", color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "Arial", pointerEvents: "none", zIndex: 5, animation: "fadeOut .7s ease forwards" }}>
          ◀◀ 10s
        </div>
      )}
      {skipAnim === "right" && (
        <div style={{ position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.65)", borderRadius: 40, padding: "12px 20px", color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "Arial", pointerEvents: "none", zIndex: 5, animation: "fadeOut .7s ease forwards" }}>
          10s ▶▶
        </div>
      )}

      {/* Speed indicator */}
      {speedOn && (
        <div style={{ position: "absolute", top: "14%", left: "50%", transform: "translateX(-50%)", background: "rgba(229,9,20,.9)", borderRadius: 20, padding: "8px 22px", color: "#fff", fontSize: 17, fontWeight: 900, fontFamily: "Arial", pointerEvents: "none", zIndex: 5 }}>
          ⚡ מהירות x2
        </div>
      )}

      {/* Big play button when paused */}
      {!playing && (
        <div
          onClick={togglePlay}
          style={{ position: "absolute", zIndex: 4, background: "rgba(0,0,0,.55)", borderRadius: "50%", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <Play size={36} fill="white" color="white" />
        </div>
      )}

      {/* Controls overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        opacity: showControls ? 1 : 0,
        transition: "opacity .3s",
        pointerEvents: showControls ? "auto" : "none",
        background: "linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 18%, transparent 75%, rgba(0,0,0,.75) 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between"
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
          <div style={{ color: "#fff", fontSize: 14, fontFamily: "Arial", fontWeight: 700, flex: 1, textAlign: "center", marginRight: 44 }}>{movie.title}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={22} />
          </button>
        </div>

        {/* Bottom controls */}
        <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "rgba(255,255,255,.8)", fontSize: 11, fontFamily: "Arial", minWidth: 36 }}>{formatTime(currentTime)}</span>
            <div
              onClick={handleSeek}
              style={{ flex: 1, height: 4, background: "rgba(255,255,255,.3)", borderRadius: 4, cursor: "pointer", position: "relative" }}
            >
              <div style={{ width: `${progress}%`, height: "100%", background: "#e50914", borderRadius: 4, position: "relative" }}>
                <div style={{ position: "absolute", right: -6, top: -4, width: 12, height: 12, borderRadius: "50%", background: "#fff", boxShadow: "0 0 4px rgba(0,0,0,.5)" }} />
              </div>
            </div>
            <span style={{ color: "rgba(255,255,255,.8)", fontSize: 11, fontFamily: "Arial", minWidth: 36, textAlign: "right" }}>{formatTime(duration)}</span>
          </div>

          {/* Buttons row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={togglePlay} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {playing ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
            </button>
            <button onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } resetHideTimer(); }}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontFamily: "Arial", marginRight: "auto" }}>
              לחץ ×2 לדילוג · לחיצה ארוכה x2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}