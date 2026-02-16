import { useState } from "react";

export default function SearchBar({ value, onChange, theme = "dark" }) {
  const [focused, setFocused] = useState(false);
  const isDark = theme === "dark";

  return (
    <div
      className="max-w-[480px] mx-auto mb-7"
      style={{ animation: "fadeUp 0.5s ease 0.5s both" }}
    >
      <div className="relative">
        <span
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors duration-200"
          style={{
            color: focused 
              ? (isDark ? "var(--cyber-neon)" : "#3b82f6")
              : (isDark ? "var(--cyber-text-dim)" : "#94A3B8"),
          }}
        >
          ⌕
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="חפש סרט או קטגוריה..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full outline-none transition-all duration-250"
          style={{
            background: isDark
              ? (focused ? "rgba(0,210,255,0.06)" : "rgba(0,0,0,0.4)")
              : (focused ? "#FFFFFF" : "#F8FAFC"),
            border: isDark
              ? `1px solid ${focused ? "rgba(0,210,255,0.5)" : "rgba(0,210,255,0.15)"}`
              : `1px solid ${focused ? "#3b82f6" : "#E2E8F0"}`,
            borderRadius: 4,
            color: isDark ? "var(--cyber-text)" : "#1a1a1a",
            fontFamily: isDark ? "'Share Tech Mono',monospace" : "'Assistant', sans-serif",
            fontSize: 13,
            padding: "10px 14px 10px 40px",
            paddingRight: 40,
            direction: "rtl",
            boxShadow: focused
              ? (isDark ? "0 0 20px rgba(0,210,255,0.15), inset 0 0 8px rgba(0,210,255,0.04)" : "0 0 0 3px rgba(59,130,246,0.1)")
              : "none",
          }}
        />
        {focused && isDark && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--cyber-neon), transparent)",
              borderRadius: "0 0 4px 4px",
            }}
          />
        )}
      </div>
    </div>
  );
}