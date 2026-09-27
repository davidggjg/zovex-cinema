import React from "react";

// רקע: נקודות + כדורי זוהר סטטיים (בלי אנימציות כבדות)
export default function BackgroundFX() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,.05) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }} />
      <div style={{
        position: "absolute", top: "-10%", right: "-10%",
        width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,.2), transparent 70%)",
        filter: "blur(50px)",
      }} />
      <div style={{
        position: "absolute", top: "45%", left: "-12%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,72,153,.15), transparent 70%)",
        filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-8%", right: "20%",
        width: 220, height: 220, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,.12), transparent 70%)",
        filter: "blur(50px)",
      }} />
    </div>
  );
}