import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const N = "#1a4fad";
const TYPE_COLORS = {
  Scholarship: { c: "#1a4fad", bg: "#eff4ff", b: "rgba(26,79,173,0.2)"  },
  Fellowship:  { c: "#7c3aed", bg: "#f5f3ff", b: "rgba(124,58,237,0.2)" },
  Grant:       { c: "#d97706", bg: "#fffbeb", b: "rgba(217,119,6,0.2)"  },
  Internship:  { c: "#059669", bg: "#f0fdf4", b: "rgba(5,150,105,0.2)"  },
};
const def = { c: "#4a6490", bg: "#f8faff", b: "rgba(74,100,144,0.2)" };

export default function OpportunityCard({ opp, index = 0, expanded, onExpand }) {
  const [hov, setHov] = useState(false);

  const score    = Number(opp.matchScore) || 0;
  const daysLeft = opp.deadline
    ? Math.ceil((new Date(opp.deadline) - new Date()) / 86400000)
    : null;
  const urg =
    daysLeft === null ? null
    : daysLeft <= 0   ? { c: "#dc2626", bg: "#fef2f2", label: "Expired"  }
    : daysLeft <= 7   ? { c: "#dc2626", bg: "#fef2f2", label: "Critical" }
    : daysLeft <= 14  ? { c: "#d97706", bg: "#fffbeb", label: "Soon"     }
    : daysLeft <= 30  ? { c: N,         bg: "#eff4ff", label: "Open"     }
    : { c: "#4a6490", bg: "#f8faff", label: "Future" };

  const tc = TYPE_COLORS[opp.type] || def;
  const sc = score >= 90 ? "#059669" : score >= 75 ? N : "#8098be";

  const rawURL   = opp.applyUrl || opp.apply_url || opp.url || opp.link || "";
  const applyURL =
    rawURL && rawURL !== "#" && rawURL !== "n/a" && rawURL !== "N/A"
      ? rawURL.startsWith("http") ? rawURL : `https://${rawURL}`
      : null;
  const applyDomain = applyURL
    ? applyURL.replace(/^https?:\/\//, "").split("/")[0]
    : null;

  // Lock body scroll when modal open
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);

  const handleApply = e => {
    e.stopPropagation();
    if (applyURL) {
      const a = document.createElement("a");
      a.href = applyURL; a.target = "_blank"; a.rel = "noopener noreferrer";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  return (
    <>
      {/* ── Card ── */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "#fff",
          border: `1px solid ${hov ? "rgba(26,79,173,0.22)" : "rgba(26,79,173,0.1)"}`,
          borderRadius: 20,
          padding: 24,
          transition: "all 0.25s",
          boxShadow: hov ? "0 8px 32px rgba(26,79,173,0.1)" : "0 1px 4px rgba(10,22,40,0.04)",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          animation: `fadeUp 0.45s ease ${index * 0.06}s both`,
        }}
      >
        {/* Accent bar */}
        {hov && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${N}, #3b82f6)`, borderRadius: "3px 3px 0 0" }} />
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            {opp.type && (
              <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 6, background: tc.bg, border: `1px solid ${tc.b}`, color: tc.c, marginBottom: 8 }}>
                {opp.type}
              </span>
            )}
            {opp.city && (
              <p style={{ fontSize: 12, color: "#8098be", margin: "0 0 2px", display: "flex", alignItems: "center", gap: 4 }}>
                📍 {opp.city}{opp.country ? `, ${opp.country}` : ""}
              </p>
            )}
            <p style={{ fontSize: 12, color: "#8098be", margin: "0 0 5px", fontWeight: 500 }}>{opp.org || opp.organization}</p>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "#0a1628", margin: 0, lineHeight: 1.3 }}>{opp.title}</h3>
          </div>

          {/* Score ring */}
          <div style={{ flexShrink: 0, position: "relative", width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(26,79,173,0.1)" strokeWidth="3.5" />
              <circle cx="28" cy="28" r="23" fill="none" stroke={sc} strokeWidth="3.5"
                strokeDasharray={`${(score / 100) * 144.5} 144.5`}
                strokeLinecap="round" transform="rotate(-90 28 28)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", lineHeight: 1 }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: sc, display: "block" }}>{score}%</span>
              <span style={{ fontSize: 8.5, color: sc, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.05em" }}>match</span>
            </div>
          </div>
        </div>

        {opp.amount && (
          <p style={{ fontSize: 14, color: N, fontWeight: 700, margin: "0 0 10px" }}>💰 {opp.amount}</p>
        )}

        <div style={{ height: 3, background: "rgba(26,79,173,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${sc}, ${sc}99)`, borderRadius: 3, transition: "width 1s ease" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {opp.deadline && (
              <span style={{ fontSize: 13, color: "#4a6490" }}>📅 <strong style={{ color: "#0a1628" }}>{opp.deadline}</strong></span>
            )}
            {urg && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 7, background: urg.bg, color: urg.c }}>
                {daysLeft > 0 ? `${daysLeft}d · ${urg.label}` : "Expired"}
              </span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onExpand(); }}
            style={{
              background: "rgba(26,79,173,0.07)",
              border: "1px solid rgba(26,79,173,0.15)",
              color: N,
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              padding: "5px 14px",
              borderRadius: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg,${N},#2563eb)`; e.currentTarget.style.color = "#fff"; e.currentTarget.style.border = `1px solid ${N}`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,79,173,0.07)"; e.currentTarget.style.color = N; e.currentTarget.style.border = "1px solid rgba(26,79,173,0.15)"; }}
          >
            ▼ Details
          </button>
        </div>
      </div>

      {/* ── Modal popup ── */}
      {expanded && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={onExpand}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(10,22,40,0.45)",
              backdropFilter: "blur(4px)",
              zIndex: 9998,
              animation: "backdropIn 0.2s ease",
            }}
          />

          {/* Modal panel */}
          <div
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(680px, calc(100vw - 32px))",
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 24px 80px rgba(10,22,40,0.22), 0 4px 20px rgba(26,79,173,0.12)",
              border: "1px solid rgba(26,79,173,0.12)",
              zIndex: 9999,
              animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(26,79,173,0.2) transparent",
            }}
          >
            {/* Modal header */}
            <div style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "#fff",
              borderBottom: "1px solid rgba(26,79,173,0.08)",
              padding: "18px 24px 14px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {opp.type && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 6, background: tc.bg, border: `1px solid ${tc.b}`, color: tc.c }}>
                      {opp.type}
                    </span>
                  )}
                  {urg && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 7, background: urg.bg, color: urg.c }}>
                      {daysLeft > 0 ? `${daysLeft}d · ${urg.label}` : "Expired"}
                    </span>
                  )}
                </div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: "#0a1628", margin: "0 0 3px", lineHeight: 1.25 }}>{opp.title}</h2>
                <p style={{ fontSize: 13, color: "#8098be", margin: 0 }}>{opp.org || opp.organization}{opp.city ? ` · 📍 ${opp.city}` : ""}</p>
              </div>

              {/* Score + close */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ position: "relative", width: 52, height: 52 }}>
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(26,79,173,0.1)" strokeWidth="3.5" />
                      <circle cx="26" cy="26" r="21" fill="none" stroke={sc} strokeWidth="3.5"
                        strokeDasharray={`${(score / 100) * 132} 132`}
                        strokeLinecap="round" transform="rotate(-90 26 26)"
                      />
                    </svg>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", lineHeight: 1 }}>
                      <span style={{ fontWeight: 800, fontSize: 12, color: sc, display: "block" }}>{score}%</span>
                      <span style={{ fontSize: 8, color: sc, opacity: 0.65, textTransform: "uppercase" }}>match</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onExpand}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(26,79,173,0.06)", border: "1px solid rgba(26,79,173,0.12)", color: "#4a6490", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", lineHeight: 1 }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fecaca"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,79,173,0.06)"; e.currentTarget.style.color = "#4a6490"; e.currentTarget.style.borderColor = "rgba(26,79,173,0.12)"; }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Amount + deadline strip */}
              {(opp.amount || opp.deadline) && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {opp.amount && (
                    <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: "#eff4ff", border: "1px solid rgba(26,79,173,0.15)", borderRadius: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: N, margin: "0 0 4px" }}>Award</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#0a1628", margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif" }}>💰 {opp.amount}</p>
                    </div>
                  )}
                  {opp.deadline && (
                    <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: urg ? urg.bg : "#f8faff", border: `1px solid ${urg ? urg.c + "33" : "rgba(26,79,173,0.1)"}`, borderRadius: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: urg ? urg.c : "#8098be", margin: "0 0 4px" }}>Deadline</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#0a1628", margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif" }}>📅 {opp.deadline}</p>
                    </div>
                  )}
                </div>
              )}

              {/* About */}
              {opp.description && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8098be", margin: "0 0 8px" }}>About This Opportunity</p>
                  <p style={{ fontSize: 14, color: "#2c3c55", lineHeight: 1.75, margin: 0 }}>{opp.description}</p>
                </div>
              )}

              {/* Why matched */}
              {opp.reasons && opp.reasons.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8098be", margin: "0 0 10px" }}>Why You're Matched</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {opp.reasons.map((r, i) => (
                      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "#eff4ff", border: "1px solid rgba(26,79,173,0.15)", borderRadius: 8, fontSize: 12, color: N, fontWeight: 600 }}>✓ {r}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility */}
              {opp.eligibility && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8098be", margin: "0 0 8px" }}>Eligibility</p>
                  <p style={{ fontSize: 14, color: "#2c3c55", lineHeight: 1.65, margin: 0 }}>{opp.eligibility}</p>
                </div>
              )}

              {/* Skills */}
              {opp.skills && opp.skills.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8098be", margin: "0 0 8px" }}>Required Skills</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {opp.skills.map((s, i) => (
                      <span key={i} style={{ padding: "4px 10px", background: "#f8faff", border: "1px solid rgba(26,79,173,0.12)", borderRadius: 7, fontSize: 12, color: "#2c3c55", fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {(opp.city || opp.location_details) && (
                <div style={{ padding: "12px 14px", background: "#f8faff", border: "1px solid rgba(26,79,173,0.1)", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0a1628", margin: "0 0 2px" }}>{opp.city}{opp.country ? `, ${opp.country}` : ""}</p>
                    {opp.location_details && <p style={{ fontSize: 12, color: "#4a6490", margin: 0 }}>{opp.location_details}</p>}
                    {opp.remote && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#eff4ff", color: N, borderRadius: 6, marginTop: 4, display: "inline-block" }}>Remote Available</span>}
                  </div>
                </div>
              )}

              {/* How to apply */}
              <div style={{ background: "#f8faff", border: "1px solid rgba(26,79,173,0.1)", borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: N, margin: "0 0 14px" }}>📋 How to Apply</p>
                {(opp.howToApply ? [opp.howToApply] : [
                  "Review full eligibility requirements on the official website",
                  "Prepare your application materials — essays, transcripts, references",
                  "Submit via the official portal before the stated deadline",
                  "Track your application in your Elevatr dashboard",
                ]).map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg,${N},#2563eb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{i + 1}</span>
                    <p style={{ fontSize: 13, color: "#2c3c55", margin: 0, lineHeight: 1.6 }}>{step}</p>
                  </div>
                ))}
              </div>

              {/* Apply CTA */}
              {applyURL ? (
                <div>
                  <button
                    onClick={handleApply}
                    style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg,${N},#2563eb)`, color: "#fff", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 18px rgba(26,79,173,0.3)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Bricolage Grotesque',sans-serif" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,79,173,0.42)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(26,79,173,0.3)"; e.currentTarget.style.transform = ""; }}
                  >
                    Apply on official website
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H4M11 1V8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <p style={{ fontSize: 11, color: "#8098be", textAlign: "center", margin: "8px 0 0" }}>
                    Opens <strong style={{ color: "#4a6490" }}>{applyDomain}</strong> in a new tab
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#4a6490", textAlign: "center", padding: "12px", background: "#f8faff", borderRadius: 9, border: "1px solid rgba(26,79,173,0.1)" }}>
                  Visit the official website to apply.
                </p>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      <style>{`
        @keyframes backdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn    { from { opacity: 0; transform: translate(-50%,-48%) scale(0.95) } to { opacity: 1; transform: translate(-50%,-50%) scale(1) } }
        @keyframes fadeUp     { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </>
  );
}