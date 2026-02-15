export default function CyberBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,210,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,210,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,210,255,0.05) 0%, transparent 70%)",
        }}
      />
      {/* Scanline */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-25"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,210,255,0.5), transparent)",
          animation: "scanline 10s linear infinite",
        }}
      />
    </div>
  );
}