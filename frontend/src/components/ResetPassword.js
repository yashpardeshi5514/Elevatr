import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const N = "#1a4fad";

const I = {
  width: "100%", padding: "11px 14px",
  background: "#fff",
  border: "1px solid rgba(26,79,173,0.15)",
  borderRadius: 10, color: "#0a1628",
  fontSize: 14, outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};
const fo = e => Object.assign(e.target.style, { borderColor: "#2563eb", boxShadow: "0 0 0 3px rgba(59,130,246,0.12)" });
const fb = e => Object.assign(e.target.style, { borderColor: "rgba(26,79,173,0.15)", boxShadow: "none" });

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoad]     = useState(false);
  const [showPwd,  setShow]     = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (!password || !confirm)       { setError("Both fields are required."); return; }
    if (password !== confirm)        { setError("Passwords do not match."); return; }
    if (password.length < 6)         { setError("Password must be at least 6 characters."); return; }
    setLoad(true);
    try {
      const res  = await fetch("http://localhost:5000/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    }
    setLoad(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faff", padding: "24px" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(26,79,173,0.12)",
          borderRadius: 22,
          padding: "44px 40px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 8px 40px rgba(26,79,173,0.1)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${N}, #2563eb)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(26,79,173,0.3)" }}>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 12, color: "#fff" }}>EL</span>
          </div>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: "#0a1628", letterSpacing: "-0.025em" }}>Elevatr</span>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(5,150,105,0.1)", border: "2px solid rgba(5,150,105,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>✓</div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, color: "#0a1628", margin: "0 0 8px" }}>Password Updated!</h2>
            <p style={{ color: "#4a6490", fontSize: 14, margin: "0 0 22px" }}>Redirecting you to sign in…</p>
            <div style={{ height: 3, background: "rgba(26,79,173,0.1)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${N}, #2563eb)`, animation: "progressFill 2.5s linear forwards", borderRadius: 2 }} />
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 26, color: "#0a1628", margin: "0 0 8px", letterSpacing: "-0.025em" }}>Set New Password</h1>
            <p style={{ fontSize: 14, color: "#4a6490", margin: "0 0 28px" }}>Enter your new password below.</p>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 15 }}>⚠️</span>
                <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={submit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#4a6490", marginBottom: 8 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={fo} onBlur={fb}
                    placeholder="Min. 6 characters"
                    style={{ ...I, paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8098be", cursor: "pointer", fontSize: 16, padding: 0 }}
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#4a6490", marginBottom: 8 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onFocus={fo} onBlur={fb}
                  placeholder="Repeat new password"
                  style={{
                    ...I,
                    borderColor: confirm && confirm !== password ? "#dc2626" : confirm && confirm === password ? "#059669" : "rgba(26,79,173,0.15)",
                  }}
                />
                {confirm && confirm === password && (
                  <p style={{ fontSize: 12, color: "#059669", margin: "5px 0 0", fontWeight: 600 }}>✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: loading ? "rgba(26,79,173,0.4)" : `linear-gradient(135deg, ${N}, #2563eb)`,
                  color: "#fff",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 11,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 2px 14px rgba(26,79,173,0.28)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!loading) { e.target.style.boxShadow = "0 4px 20px rgba(26,79,173,0.4)"; e.target.style.transform = "translateY(-1px)"; }}}
                onMouseLeave={e => { e.target.style.boxShadow = "0 2px 14px rgba(26,79,173,0.28)"; e.target.style.transform = ""; }}
              >
                {loading ? "Updating…" : "Update Password →"}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`@keyframes progressFill{from{width:0}to{width:100%}}`}</style>
    </div>
  );
}
