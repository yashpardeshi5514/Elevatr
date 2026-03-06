import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const N = "#1a3a6b";

const SUGGESTIONS = [
  "What AI fellowships can I apply to?",
  "Best scholarships for CS students",
  "How do I write a strong application?",
  "What internships are available this year?",
];

const SYSTEM_PROMPT = `You are EL, Elevatr's AI assistant — precise and expert in academic and career opportunities.

Your expertise:
- Scholarships, fellowships, grants, internships for students
- Application strategy, essays, recommendations
- Deadline planning and prioritization
- Profile optimization for better AI matches

Personality:
- Clear, concise, no fluff
- Use bullet points and structure for clarity
- Give actionable, specific advice
- Always be constructive and direct

When giving opportunity recommendations: mention specific organizations, realistic deadlines, and concrete next steps.`;

export default function AIAssistant({ user }) {
  const [open,    setOpen]   = useState(false);
  const [msgs,    setMsgs]   = useState([{
    role: "assistant",
    text: `Hello${user?.name ? ` ${user.name.split(" ")[0]}` : ""}. I'm **EL**, your Elevatr AI assistant.\n\nI can help you find opportunities, improve applications, and plan your deadlines.\n\nWhat can I help you with?`,
  }]);
  const [input,   setInput]  = useState("");
  const [loading, setLoad]   = useState(false);
  const [offline, setOffline]= useState(false);
  const [fabHover, setFabHover] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setOffline(false);

    const userMsg  = { role: "user", text: msg };
    const newMsgs  = [...msgs, userMsg];
    setMsgs(newMsgs);
    setLoad(true);

    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("http://localhost:5000/assistant", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  controller.signal,
        body: JSON.stringify({
          query:        msg,
          systemPrompt: SYSTEM_PROMPT,
          history:      newMsgs.slice(-8),
        }),
      });

      clearTimeout(timeout);
      const data = await res.json();

      if (!res.ok) {
        const errText = data.error || `Server error (${res.status})`;
        setMsgs(p => [...p, {
          role: "assistant",
          text: `I encountered an issue: ${errText}\n\nIf this is a configuration problem, please check:\n- AWS credentials in your .env file\n- Backend server is running on port 5000`,
          isError: true,
        }]);
      } else {
        setMsgs(p => [...p, { role: "assistant", text: data.reply || "No response received." }]);
      }

    } catch (err) {
      if (err.name === "AbortError") {
        setMsgs(p => [...p, {
          role: "assistant",
          text: "The request timed out. The AI model may be slow to respond. Please try again.",
          isError: true,
        }]);
      } else {
        setOffline(true);
        setMsgs(p => [...p, {
          role: "assistant",
          text: "Cannot reach the backend server. Please make sure the server is running:\n```\ncd backend\nnode server.js\n```",
          isError: true,
        }]);
      }
    }

    setLoad(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearChat = () => {
    setMsgs([{
      role: "assistant",
      text: `Hello${user?.name ? ` ${user.name.split(" ")[0]}` : ""}. I'm **EL**, your Elevatr AI assistant.\n\nWhat can I help you with?`,
    }]);
    setOffline(false);
  };

  return (
    <>
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>

        {/* Chat panel */}
        {open && (
          <div style={{
            width: 360, marginBottom: 10,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(13,21,32,0.14)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "aiSlideUp 0.2s ease",
            maxHeight: "min(520px, calc(100vh - 120px))",
          }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: N, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "#fff" }}>EL</span>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: "#fff", margin: 0 }}>EL Assistant</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: offline ? "#fbbf24" : "#4ade80", display: "inline-block" }}/>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                      {offline ? "Offline" : "Online · Amazon Nova"}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={clearChat}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.75)", cursor: "pointer", fontSize: 11, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
                  Clear
                </button>
                <button onClick={() => setOpen(false)}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, width: 26, height: 26, color: "rgba(255,255,255,0.75)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
                  ×
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 7 }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: m.isError ? "#fef2f2" : N, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 8, color: m.isError ? "#dc2626" : "#fff" }}>EL</span>
                    </div>
                  )}
                  <div style={{
                    maxWidth: "80%",
                    background: m.role === "user" ? N : m.isError ? "#fef2f2" : "#f4f6fa",
                    color: m.role === "user" ? "#fff" : m.isError ? "#dc2626" : "var(--text)",
                    border: m.isError ? "1px solid #fecaca" : "none",
                    borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    padding: "9px 12px",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}>
                    {m.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}
                        components={{
                          p:      ({ children }) => <p style={{ margin: "0 0 5px" }}>{children}</p>,
                          ul:     ({ children }) => <ul style={{ margin: "4px 0", paddingLeft: 16 }}>{children}</ul>,
                          ol:     ({ children }) => <ol style={{ margin: "4px 0", paddingLeft: 16 }}>{children}</ol>,
                          li:     ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
                          code:   ({ children, inline }) => inline
                            ? <code style={{ background: "rgba(0,0,0,0.07)", padding: "1px 5px", borderRadius: 3, fontSize: 12, fontFamily: "monospace" }}>{children}</code>
                            : <pre style={{ background: "rgba(0,0,0,0.05)", padding: "8px 10px", borderRadius: 6, overflow: "auto", fontSize: 12, margin: "6px 0", fontFamily: "monospace" }}><code>{children}</code></pre>,
                          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                        }}>
                        {m.text}
                      </ReactMarkdown>
                    ) : m.text}
                  </div>
                  {m.role === "user" && (
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: N, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2, fontSize: 9, fontWeight: 700, color: "#fff" }}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: N, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 8, color: "#fff" }}>EL</span>
                  </div>
                  <div style={{ background: "#f4f6fa", borderRadius: "12px 12px 12px 3px", padding: "10px 14px", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#aab4c4", display: "inline-block", animation: `aiBounce 1.2s ease ${i * 0.2}s infinite` }}/>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {msgs.length === 1 && !loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)}
                      style={{ textAlign: "left", padding: "7px 11px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-2)", cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "var(--border-2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 7, flexShrink: 0, background: "#fff" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask about opportunities..."
                disabled={loading}
                style={{ flex: 1, padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = N}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{ width: 34, height: 34, borderRadius: 8, background: input.trim() && !loading ? N : "var(--border)", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M11.5 6.5H1.5M7.5 2.5L11.5 6.5L7.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── FAB with pulse ring + glow ── */}
        <div style={{ position: "relative", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Pulse rings — only when chat is closed */}
          {!open && (
            <>
              <span style={{
                position: "absolute", inset: -6,
                borderRadius: "50%",
                border: "2px solid rgba(26,58,107,0.35)",
                animation: "fabPulse 2.4s ease-out infinite",
                pointerEvents: "none",
              }} />
              <span style={{
                position: "absolute", inset: -6,
                borderRadius: "50%",
                border: "2px solid rgba(26,58,107,0.2)",
                animation: "fabPulse 2.4s ease-out 0.8s infinite",
                pointerEvents: "none",
              }} />
            </>
          )}

          <button
            onClick={() => setOpen(p => !p)}
            onMouseEnter={() => setFabHover(true)}
            onMouseLeave={() => setFabHover(false)}
            title={open ? "Close assistant" : "Chat with EL"}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: open
                ? "linear-gradient(135deg, #374151, #1f2937)"
                : `linear-gradient(135deg, ${N}, #2563eb)`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: fabHover
                ? open
                  ? "0 6px 24px rgba(55,65,81,0.45)"
                  : "0 6px 28px rgba(26,58,107,0.55), 0 0 0 4px rgba(37,99,235,0.15)"
                : open
                  ? "0 4px 16px rgba(55,65,81,0.3)"
                  : "0 4px 20px rgba(26,58,107,0.4), 0 0 0 3px rgba(37,99,235,0.1)",
              transition: "all 0.22s ease",
              transform: fabHover ? "scale(1.08) translateY(-1px)" : "scale(1)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {open ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <span style={{
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.5px",
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}>
                EL
              </span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes aiBounce  { 0%,100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-4px); opacity: 1; } }
        @keyframes aiSlideUp { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fabPulse  { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.7); opacity: 0; } }
      `}</style>
    </>
  );
}
