import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const N = "#1a4fad";

const FEATURES = [
  { title: "Smart AI Matching",       desc: "Amazon Bedrock analyzes your profile and instantly ranks every relevant scholarship, fellowship, and internship by fit score.", badge: "AWS Bedrock",     icon: "🤖" },
  { title: "Deadline Tracking",       desc: "Never miss an application window. Track all your opportunities in one unified calendar with urgency indicators.",              badge: "Real-time",       icon: "📅" },
  { title: "Deep Opportunity Search", desc: "Search across thousands of opportunities by type, field, deadline, amount or skill requirement with intelligent filters.",    badge: "Semantic Search",  icon: "🔍" },
  { title: "Match Insights",          desc: "Understand exactly why each opportunity matched, what to strengthen, and how to improve your profile score.",                  badge: "AI Analysis",     icon: "📊" },
  { title: "Application Guidance",    desc: "Step-by-step guidance on how to apply for each opportunity — from essays to recommendations to submission portals.",          badge: "How-to Apply",    icon: "📝" },
  { title: "EL AI Assistant",         desc: "Your personal AI advisor powered by Amazon Nova. Ask anything about opportunities, deadlines, applications, or strategy.",    badge: "Amazon Nova",     icon: "✨" },
];

const TYPES = [
  { label: "Scholarships", count: "12,400+", icon: "🎓" },
  { label: "Fellowships",  count: "4,800+",  icon: "🔬" },
  { label: "Internships",  count: "18,200+", icon: "💼" },
  { label: "Grants",       count: "6,300+",  icon: "💰" },
];

const HOW = [
  { n: "01", title: "Build your profile",    desc: "Add your degree, field of study, skills, and goals in under 2 minutes." },
  { n: "02", title: "AI finds your matches", desc: "Amazon Bedrock scans thousands of opportunities and ranks the best fits for your profile." },
  { n: "03", title: "Apply with confidence", desc: "Get step-by-step guidance on how to apply for each matched opportunity." },
];

function FeatureCard({ f, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "24px",
        background: "#fff",
        border: `1px solid ${hover ? "rgba(26,79,173,0.2)" : "rgba(26,79,173,0.1)"}`,
        borderRadius: 18,
        transition: "all 0.22s ease",
        boxShadow: hover ? "0 8px 28px rgba(26,79,173,0.12)" : "0 1px 4px rgba(10,22,40,0.05)",
        transform: hover ? "translateY(-5px)" : "translateY(0)",
        animation: `fadeUp 0.45s ease ${delay}s both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(26,79,173,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {f.icon}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: N, background: "rgba(26,79,173,0.07)", padding: "3px 10px", borderRadius: 999 }}>
          {f.badge}
        </span>
      </div>
      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#0a1628" }}>{f.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: "#4a6490", margin: 0 }}>{f.desc}</p>
    </div>
  );
}

export default function LandingPage({ user }) {
  const navigate  = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);
  const ctaPath = user ? "/dashboard" : "/signup";

  const fade = (delay = 0) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ══════════════════════ HERO — fully centered ══════════════════════ */}
      <section
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #eef3ff 0%, #f4f8ff 45%, #fff 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "5%",   right: "8%",  width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "8%", left: "-4%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,79,173,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(26,79,173,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(26,79,173,0.09) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        {/* Content — single centered column */}
        <div style={{ maxWidth: 780, width: "100%", margin: "0 auto", padding: "56px 28px", position: "relative", zIndex: 10, textAlign: "center" }}>

          {/* Eyebrow */}
          <div style={fade(0)}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: N, background: "rgba(26,79,173,0.08)", border: "1px solid rgba(26,79,173,0.15)",
              borderRadius: 999, padding: "6px 16px", marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: N, display: "inline-block", animation: "pulseDot 2s ease-in-out infinite" }} />
              AI-Powered Opportunity Matching
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            fontSize: "clamp(46px, 6.5vw, 76px)",
            color: "#0a1628",
            margin: "0 0 24px",
            ...fade(0.1),
          }}>
            Find every{" "}
            <span style={{ background: `linear-gradient(135deg, ${N} 0%, #2563eb 55%, #60a5fa 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              opportunity
            </span>{" "}
            you deserve.
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 18, fontWeight: 400, color: "#4a6490",
            lineHeight: 1.72, maxWidth: 520, margin: "0 auto 36px",
            ...fade(0.2),
          }}>
            Opportunity Navigator analyzes your profile, skills, and goals to surface internships,
            grants, fellowships, and scholarships matched precisely to you — before deadlines slip by.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 16, ...fade(0.3) }}>
            <button
              onClick={() => navigate(ctaPath)}
              style={{ padding: "14px 32px", borderRadius: 11, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, background: `linear-gradient(135deg, ${N}, #2563eb)`, color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(26,79,173,0.3)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.boxShadow = "0 6px 30px rgba(26,79,173,0.44)"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.boxShadow = "0 4px 20px rgba(26,79,173,0.3)"; e.target.style.transform = ""; }}
            >
              Build Your Profile
            </button>
            <button
              onClick={() => navigate(ctaPath)}
              style={{ padding: "14px 30px", borderRadius: 11, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, background: "transparent", color: "#4a6490", border: "1px solid rgba(26,79,173,0.2)", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.color = N; e.target.style.background = "rgba(26,79,173,0.05)"; e.target.style.borderColor = "rgba(26,79,173,0.32)"; }}
              onMouseLeave={e => { e.target.style.color = "#4a6490"; e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(26,79,173,0.2)"; }}
            >
              Explore Dashboard
            </button>
          </div>

          {/* Nudge */}
          

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 28, borderTop: "1px solid rgba(26,79,173,0.1)", flexWrap: "wrap", ...fade(0.45) }}>
            {[
              { value: "12,400+", label: "Active opportunities"  },
              { value: "94%",     label: "Match accuracy"        },
              { value: "3.2×",    label: "More applications won" },
            ].map((stat, i) => (
              <div key={stat.label} style={{ flex: "1 1 160px", textAlign: "center", padding: "0 28px", borderRight: i < 2 ? "1px solid rgba(26,79,173,0.1)" : "none" }}>
                <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 30, fontWeight: 800, color: "#0a1628", margin: 0, letterSpacing: "-0.02em" }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: "#8098be", marginTop: 4 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TYPES ══════════════════════ */}
      <section style={{ padding: "80px 28px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N, marginBottom: 10 }}>Every Category</p>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 34, color: "#0a1628", letterSpacing: "-0.025em", marginBottom: 12 }}>Every type of opportunity</h2>
          <p style={{ fontSize: 16, color: "#4a6490", maxWidth: 480, margin: "0 auto 44px" }}>From prestigious fellowships to industry internships — we cover them all.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {TYPES.map(t => (
              <div
                key={t.label}
                onClick={() => navigate(ctaPath)}
                style={{ padding: "28px 20px", border: "1px solid rgba(26,79,173,0.1)", borderRadius: 18, cursor: "pointer", transition: "all 0.2s", background: "#f8faff", textAlign: "center" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(26,79,173,0.22)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,79,173,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8faff"; e.currentTarget.style.borderColor = "rgba(26,79,173,0.1)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = ""; }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
                <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, color: "#0a1628", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{t.count}</p>
                <p style={{ fontSize: 14, color: "#4a6490", margin: 0, fontWeight: 500 }}>{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section style={{ padding: "80px 28px", background: "#f8faff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N, marginBottom: 10 }}>Features</p>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 34, color: "#0a1628", letterSpacing: "-0.025em", marginBottom: 12 }}>Everything you need to succeed</h2>
            <p style={{ fontSize: 16, color: "#4a6490", maxWidth: 480, margin: "0 auto" }}>A complete platform to discover, track, and apply for opportunities.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} delay={i * 0.05} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section style={{ padding: "80px 28px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N, marginBottom: 10 }}>How It Works</p>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 34, color: "#0a1628", letterSpacing: "-0.025em", marginBottom: 48 }}>Three steps to your next opportunity</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
            {HOW.map(step => (
              <div
                key={step.n}
                style={{ padding: "28px 24px", border: "1px solid rgba(26,79,173,0.1)", borderRadius: 18, transition: "all 0.2s", background: "#f8faff", textAlign: "left" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(26,79,173,0.22)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,79,173,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8faff"; e.currentTarget.style.borderColor = "rgba(26,79,173,0.1)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = ""; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, ${N}, #2563eb)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 2px 10px rgba(26,79,173,0.25)" }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>{step.n}</span>
                </div>
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: "#0a1628", margin: "0 0 8px" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#4a6490", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section style={{ padding: "80px 28px", background: `linear-gradient(135deg, #0f3585, ${N} 50%, #2563eb)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 36, color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>
            Ready to find your opportunity?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 36, lineHeight: 1.65 }}>
            Join thousands of students and researchers who have found their perfect match on Elevatr.
          </p>
          <button
            onClick={() => navigate(ctaPath)}
            style={{ padding: "14px 36px", borderRadius: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, background: "#fff", color: N, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(0,0,0,0.25)"; }}
            onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}
          >
            {user ? "Go to Dashboard →" : "Get started free →"}
          </button>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 14 }}>No credit card required · Setup in 3 minutes</p>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
    </div>
  );
}
