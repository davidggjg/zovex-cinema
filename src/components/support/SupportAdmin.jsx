import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { SupportMessage } from "@/entities/SupportMessage";
import SupportChat, { formatMsgTime } from "./SupportChat";

const cardStyle = {
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 18, padding: 18,
};

// ניהול שיחות התמיכה בפאנל האדמין
export default function SupportAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      SupportMessage.list("-created_date", 1000)
        .then((all) => { if (alive) setMessages(all || []); })
        .catch(() => {})
        .finally(() => { if (alive) setLoading(false); });
    };
    load();
    const unsub = SupportMessage.subscribe(load);
    return () => { alive = false; if (unsub) unsub(); };
  }, []);

  const convs = useMemo(() => {
    const g = {};
    (messages || []).forEach((m) => {
      if (!g[m.conversation_id]) g[m.conversation_id] = [];
      g[m.conversation_id].push(m);
    });
    return Object.entries(g)
      .map(([id, msgs]) => {
        const sorted = [...msgs].sort(
          (a, b) => new Date(a.created_date) - new Date(b.created_date)
        );
        const last = sorted[sorted.length - 1];
        return {
          id,
          name: last.user_name || "אורח",
          lastMsg: last.content,
          lastTime: last.created_date,
          awaiting: last.sender === "user",
          count: sorted.length,
        };
      })
      .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
  }, [messages]);

  if (active) {
    const conv = convs.find((c) => c.id === active);
    return (
      <div style={{
        ...cardStyle, display: "flex", flexDirection: "column",
        height: "calc(100vh - 210px)", minHeight: 360,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 10, flexShrink: 0,
        }}>
          <button
            onClick={() => setActive(null)}
            style={{
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)", color: "#fff",
              borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ArrowRight size={16} />
          </button>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>
            {conv?.name || "אורח"} · {conv?.count || 0} הודעות
          </div>
        </div>
        <SupportChat conversationId={active} who="admin" />
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
        שיחות תמיכה ({convs.length})
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,.4)" }}>
          <Loader2 size={20} style={{ animation: "spin .7s linear infinite" }} />
        </div>
      ) : convs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,.4)", fontSize: 13 }}>
          אין שיחות עדיין
        </div>
      ) : (
        convs.map((c) => (
          <div
            key={c.id}
            onClick={() => setActive(c.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", cursor: "pointer",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#a855f7,#ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 15, fontWeight: 900,
            }}>
              {(c.name || "א").trim()[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.name}
                </span>
                {c.awaiting && (
                  <span style={{
                    background: "rgba(236,72,153,.2)", color: "#ec4899",
                    borderRadius: 50, padding: "1px 8px", fontSize: 10, fontWeight: 800, flexShrink: 0,
                  }}>
                    ממתין לתשובה
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.lastMsg}
              </div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", flexShrink: 0 }}>
              {formatMsgTime(c.lastTime)}
            </div>
          </div>
        ))
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}