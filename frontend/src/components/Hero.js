import React, { useEffect, useState } from "react";

function Hero({ onGetStarted }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
  };

  const fadeStyle = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <section
  style={{
    minHeight: "100vh", // subtract navbar height
    display: "flex",
    alignItems: "flex-start",
    paddingTop: showNav ? 84 : 0,
    position: "relative",
    overflow: "hidden",
        background: "#080C14",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 60% at 65% -5%, rgba(0,229,195,0.13) 0%, transparent 65%)",
        }}
      />

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(0,229,195,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,195,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
            padding: "40px 0",
          }}
          className="hero-grid"
        >
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <div style={fadeStyle(0)}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#00E5C3",
                  background: "rgba(0,229,195,0.08)",
                  border: "1px solid rgba(0,229,195,0.2)",
                  borderRadius: 999,
                  padding: "6px 14px",
                  marginBottom: 20,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#00E5C3",
                    display: "inline-block",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                AI-Powered Opportunity Matching
              </span>
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                fontSize: "clamp(42px, 6vw, 68px)",
                marginBottom: 20,
                color: "#F0F4F8",
                ...fadeStyle(0.1),
              }}
            >
              Find every <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #00E5C3 0%, #00B89A 50%, #00E5A0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                opportunity
              </span>{" "}
              <br />
              you deserve.
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: 17,
                fontWeight: 300,
                color: "#7A8FA8",
                lineHeight: 1.7,
                maxWidth: 420,
                marginBottom: 36,
                fontFamily: "'DM Sans', sans-serif",
                ...fadeStyle(0.2),
              }}
            >
              Opportunity Navigator analyzes your profile, skills, and goals to
              surface internships, grants, fellowships, and scholarships matched
              precisely to you — before deadlines slip by.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16,
                ...fadeStyle(0.3),
              }}
            >
              <button
                onClick={handleGetStarted}
                style={{
                  padding: "14px 32px",
                  borderRadius: 12,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  background:
                    "linear-gradient(135deg, #00E5C3 0%, #00B89A 100%)",
                  color: "#080C14",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 28px rgba(0,229,195,0.3)",
                  transition: "all 0.2s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 0 48px rgba(0,229,195,0.5)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "0 0 28px rgba(0,229,195,0.3)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Build Your Profile
              </button>

              <button
                onClick={handleGetStarted}
                style={{
                  padding: "14px 32px",
                  borderRadius: 12,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  background: "transparent",
                  color: "#7A8FA8",
                  border: "1px solid rgba(26,38,64,0.9)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#F0F4F8";
                  e.target.style.background = "rgba(255,255,255,0.04)";
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#7A8FA8";
                  e.target.style.background = "transparent";
                  e.target.style.borderColor = "rgba(26,38,64,0.9)";
                }}
              >
                Explore Dashboard
              </button>
            </div>

            <p
              style={{
                fontSize: 13,
                color: "#7A8FA8",
                fontFamily: "'DM Sans', sans-serif",
                ...fadeStyle(0.35),
              }}
            >
              <strong style={{ color: "#F0F4F8" }}>No credit card required.</strong>{" "}
              Setup takes under 3 minutes.
            </p>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: 40,
                marginTop: 48,
                paddingTop: 32,
                borderTop: "1px solid rgba(26,38,64,0.8)",
                flexWrap: "wrap",
                ...fadeStyle(0.45),
              }}
            >
              {[
                { value: "12,400+", label: "Active opportunities" },
                { value: "94%", label: "Match accuracy" },
                { value: "3.2×", label: "More applications won" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 30,
                      fontWeight: 800,
                      color: "#F0F4F8",
                      margin: 0,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#7A8FA8",
                      marginTop: 4,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Preview Card */}
          <div
            className="hidden lg:block"
            style={{ ...fadeStyle(0.3) }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(15,23,36,0.95) 0%, rgba(12,21,32,0.95) 100%)",
                border: "1px solid rgba(26,38,64,0.8)",
                borderRadius: 24,
                padding: 28,
                boxShadow:
                  "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Top label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#7A8FA8",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: 0,
                  }}
                >
                  Today's Top Match
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    color: "#00E5C3",
                    background: "rgba(0,229,195,0.08)",
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Live
                </span>
              </div>

              {/* Main card */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(26,38,64,0.9)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#F0F4F8",
                        margin: "0 0 4px",
                      }}
                    >
                      NSF Graduate Fellowship
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#7A8FA8",
                        fontFamily: "'DM Sans', sans-serif",
                        margin: 0,
                      }}
                    >
                      National Science Foundation · $37,000/yr
                    </p>
                  </div>
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,229,195,0.15), rgba(0,184,154,0.08))",
                      border: "1px solid rgba(0,229,195,0.2)",
                      borderRadius: 8,
                      padding: "4px 10px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: 15,
                        color: "#00E5C3",
                      }}
                    >
                      97%
                    </span>
                  </div>
                </div>

                {/* Match bar */}
                <div
                  style={{
                    height: 4,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "97%",
                      background:
                        "linear-gradient(90deg, #00E5C3, #00E5A0)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              {/* Other matches */}
              {[
                { title: "Gates Millennium Scholar", org: "Bill & Melinda Gates Foundation", match: 89, days: 24 },
                { title: "STEM Excellence Grant", org: "Department of Education", match: 82, days: 31 },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(26,38,64,0.6)",
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#F0F4F8",
                        margin: "0 0 2px",
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#7A8FA8",
                        margin: 0,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {item.org}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#00E5C3",
                        margin: "0 0 2px",
                      }}
                    >
                      {item.match}%
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: "#FF6B6B",
                        margin: 0,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {item.days}d left
                    </p>
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(26,38,64,0.6)",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#7A8FA8",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  12 days left on top match
                </span>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00E5C3",
                    fontSize: 13,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Apply Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;