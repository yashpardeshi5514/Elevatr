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
const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const strengthLevel = p => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoad]    = useState(false);
  const [showPwd, setShow]    = useState(false);
  const [success, setSuccess] = useState(false);

  const str      = strengthLevel(form.password);
  const strLabel = ["", "Weak", "Fair", "Good", "Strong"][str];
  const strColor = ["", "#ef4444", "#f59e0b", "#3b82f6", N][str];

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name     = "Full name is required.";
    if (!form.email.trim()) e.email    = "Email address is required.";
    else if (!validateEmail(form.email)) e.email = "Please use a valid email.";
    if (!form.password)     e.password = "Password is required.";
    else if (str < 2)       e.password = "Use 8+ characters with at least one number and uppercase letter.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleEmailChange = v => {
    setForm(p => ({ ...p, email: v }));
    if (v && !validateEmail(v)) setErrors(p => ({ ...p, email: "Please match the format: name@domain.com" }));
    else setErrors(p => ({ ...p, email: "" }));
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoad(true);
    try {
      const res  = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("elevatr_user",  JSON.stringify(data.user));
      localStorage.setItem("elevatr_token", data.token || "");
      if (onLogin) onLogin(data.user);
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1600);
    } catch (err) {
      setErrors({ global: err.message });
    }
    setLoad(false);
  };

  const LBL = { display: "block", fontSize: 11, fontWeight: 700, color: "#4a6490", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" };
  const ERR = { fontSize: 12, color: "#c0392b", marginTop: 5, fontWeight: 500 };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faff" }}>
        <div style={{ textAlign: "center", maxWidth: 340, padding: "0 24px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${N}, #2563eb)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 20px rgba(26,79,173,0.3)" }}>
            <span style={{ color: "#fff", fontSize: 24, lineHeight: 1 }}>✓</span>
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, color: "#0a1628", margin: "0 0 8px" }}>Account created!</h2>
          <p style={{ fontSize: 14, color: "#4a6490" }}>Redirecting you to profile setup…</p>
          <div style={{ marginTop: 20, height: 3, background: "rgba(26,79,173,0.1)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, ${N}, #2563eb)`, borderRadius: 3, animation: "progress 1.5s linear forwards" }} />
          </div>
        </div>
        <style>{`@keyframes progress{from{width:0}to{width:100%}}`}</style>
      </div>
    );
  }

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
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
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
          {["Powered by Amazon Bedrock","Location-based filtering","Real-time deadline tracking"].map(b => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(147,197,253,0.7)", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 26, color: "#0a1628", margin: "0 0 6px", letterSpacing: "-0.025em" }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: "#4a6490", margin: 0 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: N, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
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
            <span style={{ fontSize: 11, color: "#8098be", fontWeight: 500 }}>or sign up with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(26,79,173,0.1)" }} />
          </div>

          {errors.global && (
            <div style={{ padding: "10px 14px", background: "#fef5f5", border: "1px solid #fecaca", borderRadius: 9, marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>{errors.global}</p>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label style={LBL}>Full name</label>
              <input type="text" value={form.name} placeholder="Alex Johnson"
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                onFocus={fo} onBlur={fb} style={IS} />
              {errors.name && <p style={ERR}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={LBL}>Email address</label>
              <input type="email" value={form.email} placeholder="name@example.com"
                onChange={e => handleEmailChange(e.target.value)}
                onFocus={fo} onBlur={fb} style={IS} />
              {errors.email && <p style={ERR}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={LBL}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPwd ? "text" : "password"} value={form.password}
                  placeholder="Min. 8 characters"
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  onFocus={fo} onBlur={fb} style={{ ...IS, paddingRight: 52 }} />
                <button type="button" onClick={() => setShow(p => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8098be", cursor: "pointer", fontSize: 12, padding: 0, fontWeight: 600 }}>
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 7 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= str ? strColor : "rgba(26,79,173,0.1)", transition: "background 0.2s" }} />
                    ))}
                  </div>
                  {strLabel && <p style={{ fontSize: 11, color: strColor, margin: 0, fontWeight: 600 }}>{strLabel}</p>}
                </div>
              )}
              {errors.password && <p style={ERR}>{errors.password}</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={LBL}>Confirm password</label>
              <input type={showPwd ? "text" : "password"} value={form.confirm}
                placeholder="Repeat your password"
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                onFocus={fo} onBlur={fb}
                style={{
                  ...IS,
                  borderColor: form.confirm && form.confirm !== form.password ? "#dc2626" : form.confirm && form.confirm === form.password ? "#16a34a" : "rgba(26,79,173,0.15)",
                }} />
              {form.confirm && form.confirm === form.password && (
                <p style={{ fontSize: 12, color: "#16a34a", margin: "5px 0 0", fontWeight: 600 }}>✓ Passwords match</p>
              )}
              {errors.confirm && <p style={ERR}>{errors.confirm}</p>}
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p style={{ fontSize: 11, color: "#8098be", textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
            By signing up you agree to our{" "}
            <span style={{ color: "#4a6490", cursor: "pointer" }}>Terms of Service</span> and{" "}
            <span style={{ color: "#4a6490", cursor: "pointer" }}>Privacy Policy</span>.
          </p>
        </div>
      </div>

      <style>{`@media(max-width:720px){.auth-panel{display:none!important}}`}</style>
    </div>
  );
}
