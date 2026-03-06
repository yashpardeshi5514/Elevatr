import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const AUTH_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/deadlines", label: "Deadlines" },
  { to: "/profile",   label: "Profile"   },
];

export default function Navbar({ profile, user, onLogout }) {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const dropRef = useRef(null);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const fn = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const displayName = user?.name || profile?.name;
  const initial     = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const avatar      = profile?.avatar || user?.avatar;
  const isLoggedIn  = !!displayName;

  const NAV_LINK_STYLE = ({ isActive }) => ({
    padding: "6px 16px",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: isActive ? 700 : 500,
    letterSpacing: "0.01em",
    color: isActive ? "#1a4fad" : "#4a6490",
    borderBottom: isActive ? "2px solid #1a4fad" : "2px solid transparent",
    transition: "color 0.18s, border-color 0.18s",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 300,
          height: 64,
          background: scrolled ? "rgba(248,250,255,0.95)" : "rgba(248,250,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${scrolled ? "rgba(26,79,173,0.12)" : "rgba(26,79,173,0.06)"}`,
          boxShadow: scrolled ? "0 1px 0 rgba(26,79,173,0.06), 0 4px 20px rgba(10,22,40,0.05)" : "none",
          transition: "all 0.25s",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            height: "100%",
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ── Logo ── */}
          <div
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 9,
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "linear-gradient(135deg, #1a4fad, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(26,79,173,0.3)",
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 11, color: "#fff", letterSpacing: "0.5px" }}>EL</span>
            </div>
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "#0a1628",
                letterSpacing: "-0.03em",
              }}
            >
              Elevatr
            </span>
          </div>

          {/* ── Center nav (authenticated) ── */}
          {isLoggedIn && (
            <div
              className="nav-desk"
              style={{ display: "flex", alignItems: "center", gap: 0, height: "100%" }}
            >
              {AUTH_LINKS.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  style={NAV_LINK_STYLE}
                  onMouseEnter={e => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.color = "#1a4fad";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.color = "#4a6490";
                    }
                  }}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* ── Right side ── */}
          <div className="nav-desk" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isLoggedIn ? (
              <div ref={dropRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropOpen(p => !p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 12px 5px 5px",
                    borderRadius: 99,
                    background: dropOpen ? "rgba(26,79,173,0.07)" : "transparent",
                    border: `1px solid ${dropOpen ? "rgba(26,79,173,0.15)" : "transparent"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(26,79,173,0.06)";
                    e.currentTarget.style.borderColor = "rgba(26,79,173,0.12)";
                  }}
                  onMouseLeave={e => {
                    if (!dropOpen) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1a4fad, #2563eb)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {avatar ? (
                      <img src={avatar} style={{ width: 30, height: 30, objectFit: "cover" }} alt="" />
                    ) : initial}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0a1628",
                      maxWidth: 90,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName.split(" ")[0]}
                  </span>
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    style={{ transition: "transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "" }}
                  >
                    <path d="M1 1l4 3.5L9 1" stroke="#8098be" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {dropOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      right: 0,
                      background: "#fff",
                      border: "1px solid rgba(26,79,173,0.12)",
                      borderRadius: 14,
                      boxShadow: "0 12px 40px rgba(10,22,40,0.12)",
                      minWidth: 188,
                      overflow: "hidden",
                      animation: "scaleIn 0.14s ease",
                    }}
                  >
                    <div
                      style={{
                        padding: "13px 16px",
                        borderBottom: "1px solid rgba(26,79,173,0.08)",
                        background: "rgba(26,79,173,0.02)",
                      }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0a1628", margin: 0 }}>{displayName}</p>
                      <p style={{ fontSize: 11, color: "#8098be", margin: "2px 0 0" }}>{user?.email || ""}</p>
                    </div>
                    {[{ label: "Profile", to: "/profile" }, { label: "Dashboard", to: "/dashboard" }].map(item => (
                      <button
                        key={item.label}
                        onClick={() => { setDropOpen(false); navigate(item.to); }}
                        style={{
                          width: "100%", padding: "10px 16px",
                          background: "transparent", border: "none",
                          textAlign: "left", fontSize: 13, fontWeight: 400,
                          color: "#2c3c55", cursor: "pointer", transition: "background 0.12s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,79,173,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(26,79,173,0.08)" }}>
                      <button
                        onClick={() => { setDropOpen(false); onLogout(); navigate("/"); }}
                        style={{
                          width: "100%", padding: "10px 16px",
                          background: "transparent", border: "none",
                          textAlign: "left", fontSize: 13, fontWeight: 400,
                          color: "#c0392b", cursor: "pointer", transition: "background 0.12s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fef5f5"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    background: "transparent",
                    border: "1px solid rgba(26,79,173,0.18)",
                    color: "#4a6490",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.16s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "rgba(26,79,173,0.35)"; e.target.style.color = "#1a4fad"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(26,79,173,0.18)"; e.target.style.color = "#4a6490"; }}
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #1a4fad, #2563eb)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(26,79,173,0.25)",
                    transition: "all 0.16s",
                  }}
                  onMouseEnter={e => { e.target.style.boxShadow = "0 4px 16px rgba(26,79,173,0.38)"; e.target.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.target.style.boxShadow = "0 2px 10px rgba(26,79,173,0.25)"; e.target.style.transform = ""; }}
                >
                  Get started
                </button>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="nav-mob"
            style={{
              display: "none",
              width: 36, height: 36,
              borderRadius: 8,
              background: "rgba(26,79,173,0.05)",
              border: "1px solid rgba(26,79,173,0.12)",
              color: "#1a4fad",
              fontSize: 18,
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            {mobileOpen ? "×" : "≡"}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          className="nav-mob"
          style={{
            position: "fixed",
            top: 72, left: 16, right: 16,
            zIndex: 299,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(26,79,173,0.12)",
            padding: 12,
            boxShadow: "0 16px 50px rgba(10,22,40,0.12)",
            animation: "scaleIn 0.15s ease",
          }}
        >
          {isLoggedIn &&
            AUTH_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "11px 14px",
                  borderRadius: 9,
                  marginBottom: 3,
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  color: isActive ? "#1a4fad" : "#2c3c55",
                  background: isActive ? "rgba(26,79,173,0.07)" : "transparent",
                })}
              >
                {l.label}
              </NavLink>
            ))}
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid rgba(26,79,173,0.08)",
              display: "flex",
              gap: 8,
            }}
          >
            {isLoggedIn ? (
              <button
                onClick={() => { setMobileOpen(false); onLogout(); navigate("/"); }}
                style={{
                  flex: 1, padding: 10,
                  background: "#fef5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 9,
                  color: "#b91c1c",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Sign out
              </button>
            ) : (
              <>
                <button
                  onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  style={{
                    flex: 1, padding: 10,
                    background: "transparent",
                    border: "1px solid rgba(26,79,173,0.18)",
                    borderRadius: 9,
                    color: "#4a6490",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Sign in
                </button>
                <button
                  onClick={() => { navigate("/signup"); setMobileOpen(false); }}
                  style={{
                    flex: 1, padding: 10,
                    background: "linear-gradient(135deg, #1a4fad, #2563eb)",
                    color: "#fff",
                    borderRadius: 9,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity:0; transform: scale(0.95) translateY(-6px); }
          to   { opacity:1; transform: scale(1)    translateY(0);    }
        }
        @media(max-width:720px){
          .nav-desk { display:none!important; }
          .nav-mob  { display:flex!important; }
        }
      `}</style>
    </>
  );
}
