import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const N = "#1a4fad";

const IS = {
  width: "100%", padding: "10px 14px",
  background: "#fff",
  border: "1px solid rgba(26,79,173,0.15)",
  borderRadius: 9, color: "#0a1628",
  fontSize: 14, outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};
const fo = e => Object.assign(e.target.style, { borderColor: "#2563eb", boxShadow: "0 0 0 3px rgba(59,130,246,0.12)" });
const fb = e => Object.assign(e.target.style, { borderColor: "rgba(26,79,173,0.15)", boxShadow: "none" });
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const LBL = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#4a6490", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.07em",
};
const ERR = { fontSize: 12, color: "#c0392b", marginTop: 5, fontWeight: 500 };

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [err,      setErr]      = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [loading,  setLoad]     = useState(false);
  const [showPwd,  setShow]     = useState(false);
  const [forgot,   setForgot]   = useState(false);
  const [fEmail,   setFEmail]   = useState("");
  const [fSent,    setFSent]    = useState(false);
  const [fLoad,    setFLoad]    = useState(false);

  const handleEmailChange = v => {
    setForm(p => ({ ...p, email: v }));
    if (v && !validEmail(v)) setEmailErr("Please match the format: name@domain.com");
    else setEmailErr("");
  };

  const submit = async e => {
    e.preventDefault();
    setErr(""); setEmailErr("");
    if (!form.email || !form.password) { setErr("Please fill in all fields."); return; }
    if (!validEmail(form.email)) { setEmailErr("Please use a valid email."); return; }
    setLoad(true);
    try {
      const res  = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(res.status === 401 ? "No account found with that email. Please create an account first." : data.error || "Sign in failed.");
        setLoad(false); return;
      }
      localStorage.setItem("elevatr_user", JSON.stringify(data.user));
      localStorage.setItem("elevatr_token", data.token);
      if (onLogin) onLogin(data.user);
      navigate("/dashboard", { replace: true });
    } catch {
      setErr("Connection failed. Make sure the server is running.");
    }
    setLoad(false);
  };

  const sendForgot = async () => {
    if (!fEmail.trim()) { setErr("Please enter your email."); return; }
    if (!validEmail(fEmail)) { setErr("Please use a valid email."); return; }
    setFLoad(true); setErr("");
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFSent(true);
    } catch (e) {
      setErr(e.message);
    }
    setFLoad(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f8faff", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Left brand panel ── */}
      <div
        className="auth-panel"
        style={{
          flex: "0 0 44%",
          background: `linear-gradient(160deg, #0f3585 0%, ${N} 55%, #2563eb 100%)`,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "64px 52px", position: "relative", overflow: "hidden",
        }}
      >
        {/* Dot grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: "15%", right: "-10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(147,197,253,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>EL</span>
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Find opportunities<br />that elevate you
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 300 }}>
            AI-powered matching for scholarships, fellowships, internships, and grants.
          </p>
          {["50,000+ matched opportunities","Powered by Amazon Bedrock","Location-based filtering","Real-time deadline tracking"].map(b => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(147,197,253,0.7)", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 390 }}>

          {forgot ? (
            <>
              {fSent ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(26,79,173,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2 7l9 6 9-6M2 7v10a1 1 0 001 1h16a1 1 0 001-1V7a1 1 0 00-1-1H3a1 1 0 00-1 1z" stroke={N} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, color: "#0a1628", margin: "0 0 8px" }}>Check your inbox</h2>
                  <p style={{ fontSize: 13, color: "#4a6490", margin: "0 0 22px", lineHeight: 1.6 }}>
                    If that email exists, a reset link was sent to <strong style={{ color: "#0a1628" }}>{fEmail}</strong>.
                  </p>
                  <button onClick={() => { setForgot(false); setFSent(false); }}
                    style={{ fontSize: 13, color: N, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 26 }}>
                    <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: "#0a1628", margin: "0 0 6px" }}>Reset your password</h1>
                    <p style={{ fontSize: 13, color: "#4a6490" }}>Enter your email and we'll send a reset link.</p>
                  </div>
                  {err && <p style={{ fontSize: 13, color: "#c0392b", marginBottom: 14 }}>{err}</p>}
                  <label style={LBL}>Email address</label>
                  <input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} onFocus={fo} onBlur={fb} placeholder="name@example.com" style={{ ...IS, marginBottom: 14 }} />
                  <button onClick={sendForgot} disabled={fLoad}
                    style={{ width: "100%", padding: "11px", borderRadius: 9, background: fLoad ? "rgba(26,79,173,0.4)" : `linear-gradient(135deg, ${N}, #2563eb)`, color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: fLoad ? "not-allowed" : "pointer", boxShadow: fLoad ? "none" : "0 2px 10px rgba(26,79,173,0.25)", marginBottom: 14 }}>
                    {fLoad ? "Sending…" : "Send reset link"}
                  </button>
                  <button onClick={() => setForgot(false)}
                    style={{ fontSize: 13, color: N, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    ← Back to sign in
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 30 }}>
                <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 26, color: "#0a1628", margin: "0 0 6px", letterSpacing: "-0.025em" }}>
                  Welcome back
                </h1>
                <p style={{ fontSize: 14, color: "#4a6490", margin: 0 }}>
                  No account?{" "}
                  <Link to="/signup" style={{ color: N, fontWeight: 600, textDecoration: "none" }}>Create one</Link>
                </p>
              </div>

              {/* OAuth */}
              <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
                {[{ label: "Google", href: "http://localhost:5000/auth/google" }, { label: "GitHub", href: "http://localhost:5000/auth/github" }].map(o => (
                  <a
                    key={o.label}
                    href={o.href}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 12px", border: "1px solid rgba(26,79,173,0.15)", borderRadius: 9, background: "#fff", fontSize: 13, fontWeight: 500, color: "#0a1628", textDecoration: "none", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(26,79,173,0.3)"; e.currentTarget.style.background = "#f8faff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(26,79,173,0.15)"; e.currentTarget.style.background = "#fff"; }}
                  >
                    {o.label}
                  </a>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(26,79,173,0.1)" }} />
                <span style={{ fontSize: 11, color: "#8098be", fontWeight: 500 }}>or sign in with email</span>
                <div style={{ flex: 1, height: 1, background: "rgba(26,79,173,0.1)" }} />
              </div>

              {err && (
                <div style={{ padding: "10px 14px", background: "#fef5f5", border: "1px solid #fecaca", borderRadius: 9, marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>{err}</p>
                  {err.includes("create an account") && (
                    <Link to="/signup" style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: N, fontWeight: 600, textDecoration: "none" }}>
                      Create an account →
                    </Link>
                  )}
                </div>
              )}

              <form onSubmit={submit} noValidate>
                <div style={{ marginBottom: 16 }}>
                  <label style={LBL}>Email address</label>
                  <input type="email" value={form.email} placeholder="name@example.com"
                    onChange={e => handleEmailChange(e.target.value)}
                    onFocus={fo} onBlur={fb} style={IS} />
                  {emailErr && <p style={ERR}>{emailErr}</p>}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={LBL}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPwd ? "text" : "password"} value={form.password} placeholder="Your password"
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      onFocus={fo} onBlur={fb} style={{ ...IS, paddingRight: 52 }} />
                    <button type="button" onClick={() => setShow(p => !p)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8098be", cursor: "pointer", fontSize: 12, padding: 0, fontWeight: 600 }}>
                      {showPwd ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "right", marginBottom: 22 }}>
                  <button type="button" onClick={() => setForgot(true)}
                    style={{ fontSize: 12, color: "#4a6490", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = N}
                    onMouseLeave={e => e.target.style.color = "#4a6490"}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "11px",
                    borderRadius: 9,
                    background: loading ? "rgba(26,79,173,0.4)" : `linear-gradient(135deg, ${N}, #2563eb)`,
                    color: "#fff", fontSize: 14, fontWeight: 600,
                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 2px 12px rgba(26,79,173,0.28)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (!loading) { e.target.style.boxShadow = "0 4px 18px rgba(26,79,173,0.38)"; e.target.style.transform = "translateY(-1px)"; }}}
                  onMouseLeave={e => { e.target.style.boxShadow = "0 2px 12px rgba(26,79,173,0.28)"; e.target.style.transform = ""; }}>
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`@media(max-width:720px){.auth-panel{display:none!important}}`}</style>
    </div>
  );
}
