import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { SupportMessage } from "@/entities/SupportMessage";

export function formatMsgTime(d) {
  try {
    return new Date(d).toLocaleString("he-IL", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// צ'אט משותף למשתמש ולאדמין — מתעדכן בזמן אמת
export default function SupportChat({ conversationId, who, userName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    let alive = true;
    const fetchMsgs = () => {
      SupportMessage.filter({ conversation_id: conversationId }, "created_date", 500)
        .then((msgs) => { if (alive) setMessages(msgs || []); })
        .catch(() => {});
    };
    fetchMsgs();
    const unsub = SupportMessage.subscribe((event) => {
      if (event?.data?.conversation_id === conversationId) fetchMsgs();
    });
    return () => { alive = false; if (unsub) unsub(); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await SupportMessage.create({
        conversation_id: conversationId,
        content: t,
        sender: who,
        user_name: who === "user" ? (userName || "אורח") : "תמיכה",
      });
      setText("");
    } catch {}
    setSending(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{
        flex: 1, overflowY: "auto", padding: "14px 14px 6px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,.35)", fontSize: 13, padding: 30 }}>
            אין הודעות עדיין — כתבו את ההודעה הראשונה
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender === who;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", borderRadius: 14,
                padding: "9px 13px", fontSize: 14, lineHeight: 1.45,
                background: mine ? "linear-gradient(135deg,#a855f7,#ec4899)" : "rgba(255,255,255,.09)",
                color: "#fff", whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {m.content}
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 3, textAlign: mine ? "left" : "right" }}>
                  {formatMsgTime(m.created_date)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: 12, borderTop: "1px solid rgba(255,255,255,.08)",
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="כתבו הודעה..."
          style={{
            flex: 1, background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.14)", borderRadius: 22,
            padding: "10px 14px", fontSize: 14, color: "#fff",
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: (sending || !text.trim())
              ? "rgba(168,85,247,.35)"
              : "linear-gradient(135deg,#a855f7,#ec4899)",
            border: "none", color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {sending
            ? <Loader2 size={17} style={{ animation: "spin .7s linear infinite" }} />
            : <Send size={17} />}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}