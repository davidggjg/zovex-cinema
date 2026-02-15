export default function GlassPanel({ children, className = "", style = {} }) {
  return (
    <div
      className={className}
      style={{
        background:
          "linear-gradient(135deg, rgba(0,210,255,0.04) 0%, rgba(0,128,255,0.02) 100%)",
        border: "1px solid rgba(0,210,255,0.12)",
        borderRadius: 8,
        backdropFilter: "blur(12px)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,210,255,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}