import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const N = "#1a4fad";

const DEGREES = ["Bachelor's","Master's","PhD","Associate's","Diploma","High School","Other"];
const FIELDS  = [
  "Computer Science","Data Science","Engineering","Biology","Chemistry","Physics",
  "Mathematics","Medicine","Law","Business","Economics","Psychology","Education",
  "Environmental Science","Political Science","Other",
];
const SKILL_SUGGEST = [
  "Python","JavaScript","React","Machine Learning","Data Analysis",
  "Research","Writing","Leadership","SQL","Java","C++","Statistics",
  "Project Management","Communication","Problem Solving",
];

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
const SEL_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238098be' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`;
const LBL = { display: "block", fontSize: 11, fontWeight: 700, color: "#4a6490", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" };
const ERR_S = { fontSize: 12, color: "#c0392b", margin: "5px 0 0", fontWeight: 500 };

/* ── Field component defined OUTSIDE main to prevent focus-loss bug ── */
function Field({ name, label, type, ph, opts, required, ta, rows = 3, form, errors, setForm, setErrors }) {
  const hasErr = !!errors[name];

  const handleChange = useCallback(e => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [name]: val }));
    if (hasErr) setErrors(prev => ({ ...prev, [name]: "" }));
  }, [name, hasErr, setForm, setErrors]);

  const onFocus = useCallback(e => {
    Object.assign(e.target.style, {
      borderColor: hasErr ? "#e53e3e" : "#2563eb",
      boxShadow: hasErr ? "0 0 0 3px rgba(229,62,62,0.09)" : "0 0 0 3px rgba(59,130,246,0.12)",
    });
  }, [hasErr]);

  const onBlur = useCallback(e => {
    Object.assign(e.target.style, { borderColor: hasErr ? "#fca5a5" : "rgba(26,79,173,0.15)", boxShadow: "none" });
  }, [hasErr]);

  const borderColor = hasErr ? "#fca5a5" : "rgba(26,79,173,0.15)";

  return (
    <div>
      <label style={{ ...LBL, color: hasErr ? "#c0392b" : "#4a6490" }}>
        {label}{required && <span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>}
      </label>

      {type === "select" ? (
        <select value={form[name]} onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
          style={{ ...IS, cursor: "pointer", borderColor, backgroundImage: SEL_BG, backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", paddingRight: 36, appearance: "none" }}>
          <option value="">Select...</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : ta ? (
        <textarea value={form[name]} onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
          placeholder={ph} rows={rows}
          style={{ ...IS, resize: "vertical", lineHeight: 1.6, borderColor }} />
      ) : (
        <input value={form[name]} onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
          placeholder={ph} style={{ ...IS, borderColor }} />
      )}

      {hasErr && <p style={ERR_S}>{errors[name]}</p>}
    </div>
  );
}

function compressImage(file, maxPx = 200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read failed"));
    reader.onload = ev => {
      const img = new Image();
      img.onerror = () => reject(new Error("Decode failed"));
      img.onload = () => {
        const ratio  = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfileBuilder({ onProfileSaved, profile: saved, user }) {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [step,   setStep]   = useState(1);
  const [avatar, setAvatar] = useState(saved?.avatar || null);
  const [imgErr, setImgErr] = useState("");
  const [errors, setErrors] = useState({});
  const [form,   setForm]   = useState({
    name:       saved?.name       || user?.name  || "",
    email:      saved?.email      || user?.email || "",
    phone:      saved?.phone      || "",
    location:   saved?.location   || "",
    bio:        saved?.bio        || "",
    degree:     saved?.degree     || "",
    field:      saved?.field      || "",
    university: saved?.university || "",
    year:       saved?.year       || "",
    gpa:        saved?.gpa        || "",
    interests:  Array.isArray(saved?.interests) ? saved.interests.join(", ") : (saved?.interests || ""),
    linkedin:   saved?.linkedin   || "",
    github:     saved?.github     || "",
    website:    saved?.website    || "",
  });
  const [skills, setSkills] = useState(saved?.skills || []);
  const [ski,    setSki]    = useState("");
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);

  const handleAvatar = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setImgErr("");
    if (file.size > 15 * 1024 * 1024) { setImgErr("Max file size is 15 MB."); return; }
    try { setAvatar(await compressImage(file)); }
    catch { setImgErr("Could not process image."); }
  };

  const addSkill = useCallback(v => {
    const t = v.trim();
    if (t && !skills.includes(t) && skills.length < 20) {
      setSkills(p => [...p, t]);
      setErrors(p => ({ ...p, skills: "" }));
    }
    setSki("");
  }, [skills]);

  const removeSkill = useCallback(s => setSkills(p => p.filter(x => x !== s)), []);

  const validateStep = s => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim())  e.name  = "Full name is required.";
      if (!form.email.trim()) e.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email.";
    }
    if (s === 2) {
      if (!form.degree)            e.degree     = "Please select your degree level.";
      if (!form.field)             e.field      = "Please select your field of study.";
      if (!form.university.trim()) e.university = "University name is required.";
    }
    if (s === 3) {
      if (skills.length === 0) e.skills = "Please add at least one skill.";
    }
    return e;
  };

  const goNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(p => p + 1);
  };

  const save = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const payload = {
      ...form, avatar, skills,
      interests: form.interests ? form.interests.split(",").map(i => i.trim()).filter(Boolean) : [],
    };
    onProfileSaved(payload);
    setDone(true);
    setTimeout(() => navigate("/dashboard"), 1600);
    setSaving(false);
  };

  const STEPS = ["Personal Info", "Academic", "Skills", "Links"];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const fp = { form, errors, setForm, setErrors };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8faff", padding: "36px 24px 80px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 26 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N, marginBottom: 4 }}>
            {saved ? "Edit Profile" : `Step ${step} of ${STEPS.length}`}
          </p>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 28, color: "#0a1628", letterSpacing: "-0.025em", margin: "0 0 4px" }}>{STEPS[step - 1]}</h1>
          <p style={{ fontSize: 14, color: "#4a6490", margin: "0 0 18px" }}>The more you share, the better your AI matches will be.</p>

          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(26,79,173,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${N}, #2563eb)`, borderRadius: 3, transition: "width 0.35s ease" }} />
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: i + 1 <= step ? `linear-gradient(135deg, ${N}, #2563eb)` : "rgba(26,79,173,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: i + 1 === step ? "0 2px 10px rgba(26,79,173,0.3)" : "none",
                    transition: "all 0.25s",
                  }}
                >
                  {i + 1 < step
                    ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <span style={{ fontSize: 10, fontWeight: 700, color: i + 1 === step ? "#fff" : "#8098be" }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 10, color: i + 1 === step ? N : "#8098be", fontWeight: i + 1 === step ? 700 : 400, marginTop: 5, textAlign: "center" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card ── */}
        <div style={{ background: "#fff", border: "1px solid rgba(26,79,173,0.1)", borderRadius: 18, padding: "28px", boxShadow: "0 2px 12px rgba(10,22,40,0.05)" }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.25s ease" }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, padding: 14, background: "#f8faff", borderRadius: 12, border: "1px solid rgba(26,79,173,0.1)" }}>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ width: 70, height: 70, borderRadius: "50%", background: avatar ? "transparent" : "rgba(26,79,173,0.05)", border: "2px dashed rgba(26,79,173,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0, transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = N}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(26,79,173,0.2)"}
                >
                  {avatar
                    ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4.5" stroke="#8098be" strokeWidth="1.5"/><path d="M2 20c0-4.4 4.03-8 9-8s9 3.6 9 8" stroke="#8098be" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
                <div>
                  <p style={{ fontWeight: 600, color: "#0a1628", margin: "0 0 3px", fontSize: 14 }}>Profile Photo</p>
                  <p style={{ fontSize: 12, color: "#4a6490", margin: "0 0 8px", lineHeight: 1.5 }}>Auto-compressed on upload. JPG, PNG or WEBP.</p>
                  {imgErr && <p style={{ fontSize: 12, color: "#c0392b", margin: "0 0 6px" }}>{imgErr}</p>}
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{ padding: "6px 14px", background: "rgba(26,79,173,0.07)", border: "1px solid rgba(26,79,173,0.15)", borderRadius: 7, color: N, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    {avatar ? "Change photo" : "Upload photo"}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }} className="f2">
                <Field name="name"     label="Full name" ph="Alex Johnson"       required {...fp} />
                <Field name="email"    label="Email"     ph="you@university.edu" required {...fp} />
                <Field name="phone"    label="Phone"     ph="+1 555 000 0000"             {...fp} />
                <Field name="location" label="City"      ph="New York, USA"               {...fp} />
              </div>
              <Field name="bio" label="Short bio" ph="Tell us about your goals and what opportunities you are looking for..." ta {...fp} />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ animation: "fadeUp 0.25s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }} className="f2">
                <Field name="degree"     label="Degree level"   type="select" opts={DEGREES} required {...fp} />
                <Field name="field"      label="Field of study" type="select" opts={FIELDS}  required {...fp} />
                <Field name="university" label="University"      ph="MIT, Stanford, IIT..."  required {...fp} />
                <Field name="year"       label="Graduation year" ph="2025"                            {...fp} />
              </div>
              <Field name="gpa" label="GPA (optional)" ph="3.8 / 4.0" {...fp} />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ animation: "fadeUp 0.25s ease" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...LBL, margin: 0, color: errors.skills ? "#c0392b" : "#4a6490" }}>
                    Skills<span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>
                  </label>
                  <span style={{ fontSize: 12, color: "#8098be" }}>{skills.length}/20</span>
                </div>

                <div style={{ position: "relative", marginBottom: 10 }}>
                  <input
                    value={ski}
                    onChange={e => setSki(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(ski); } }}
                    onFocus={e => Object.assign(e.target.style, { borderColor: "#2563eb", boxShadow: "0 0 0 3px rgba(59,130,246,0.12)" })}
                    onBlur={e  => Object.assign(e.target.style, { borderColor: "rgba(26,79,173,0.15)", boxShadow: "none" })}
                    placeholder="Type a skill and press Enter..."
                    style={{ ...IS, paddingRight: 68, borderColor: errors.skills ? "#fca5a5" : "rgba(26,79,173,0.15)" }}
                  />
                  <button type="button" onClick={() => addSkill(ski)}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: `linear-gradient(135deg, ${N}, #2563eb)`, border: "none", borderRadius: 7, padding: "5px 12px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Add
                  </button>
                </div>

                {errors.skills && <p style={ERR_S}>{errors.skills}</p>}

                {/* Suggestions */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: skills.length > 0 ? 12 : 0 }}>
                  {SKILL_SUGGEST.filter(s => !skills.includes(s)).slice(0, 9).map(s => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      style={{ padding: "4px 11px", borderRadius: 6, background: "rgba(26,79,173,0.05)", border: "1px solid rgba(26,79,173,0.13)", color: N, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,79,173,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,79,173,0.05)"; }}>
                      + {s}
                    </button>
                  ))}
                </div>

                {/* Added skills */}
                {skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                    {skills.map(s => (
                      <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(26,79,173,0.07)", border: "1px solid rgba(26,79,173,0.15)", color: N, borderRadius: 8, padding: "5px 11px", fontSize: 13, fontWeight: 500 }}>
                        {s}
                        <button type="button" onClick={() => removeSkill(s)}
                          style={{ background: "none", border: "none", color: "rgba(26,79,173,0.4)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Field name="interests" label="Research interests (optional)" ph="Machine Learning, Climate Research... (comma-separated)" ta rows={2} {...fp} />
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={{ animation: "fadeUp 0.25s ease" }}>
              <div style={{ marginBottom: 18, padding: 14, background: "rgba(26,79,173,0.04)", border: "1px solid rgba(26,79,173,0.1)", borderRadius: 11 }}>
                <p style={{ fontWeight: 600, color: "#0a1628", margin: "0 0 2px", fontSize: 14 }}>🎉 Almost done</p>
                <p style={{ fontSize: 13, color: "#4a6490", margin: 0 }}>These are optional but help complete your profile.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field name="linkedin" label="LinkedIn" ph="linkedin.com/in/yourname" {...fp} />
                <Field name="github"   label="GitHub"   ph="github.com/yourname"      {...fp} />
                <Field name="website"  label="Website"  ph="yourname.com"             {...fp} />
              </div>

              {/* Profile preview */}
              {form.name && (
                <div style={{ marginTop: 22, padding: 16, background: "#f8faff", border: "1px solid rgba(26,79,173,0.1)", borderRadius: 13 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8098be", margin: "0 0 12px" }}>Preview</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatar ? "transparent" : `linear-gradient(135deg, ${N}, #2563eb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 8px rgba(26,79,173,0.25)" }}>
                      {avatar ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : form.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, color: "#0a1628", margin: 0 }}>{form.name}</p>
                      <p style={{ fontSize: 13, color: "#4a6490", margin: 0 }}>
                        {[form.degree, form.field, form.university].filter(Boolean).join(" · ")}
                      </p>
                      {skills.length > 0 && (
                        <p style={{ fontSize: 11, color: N, margin: "3px 0 0", fontWeight: 600 }}>
                          {skills.slice(0, 4).join(" · ")}{skills.length > 4 ? ` +${skills.length - 4} more` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30, paddingTop: 20, borderTop: "1px solid rgba(26,79,173,0.08)" }}>
            <button
              onClick={() => step > 1 ? setStep(p => p - 1) : navigate("/")}
              style={{ padding: "9px 20px", background: "transparent", border: "1px solid rgba(26,79,173,0.15)", borderRadius: 9, color: "#4a6490", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(26,79,173,0.3)"; e.target.style.color = N; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(26,79,173,0.15)"; e.target.style.color = "#4a6490"; }}
            >
              {step === 1 ? "← Back" : "← Previous"}
            </button>

            {step < STEPS.length ? (
              <button
                onClick={goNext}
                style={{ padding: "9px 26px", background: `linear-gradient(135deg, ${N}, #2563eb)`, color: "#fff", borderRadius: 9, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 10px rgba(26,79,173,0.25)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.target.style.boxShadow = "0 4px 18px rgba(26,79,173,0.38)"; e.target.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.target.style.boxShadow = "0 2px 10px rgba(26,79,173,0.25)"; e.target.style.transform = ""; }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={save}
                disabled={saving || done}
                style={{ padding: "9px 26px", background: done ? "#059669" : saving ? "rgba(26,79,173,0.4)" : `linear-gradient(135deg, ${N}, #2563eb)`, color: "#fff", borderRadius: 9, border: "none", fontSize: 14, fontWeight: 600, cursor: saving || done ? "not-allowed" : "pointer", boxShadow: saving || done ? "none" : "0 2px 10px rgba(26,79,173,0.25)", transition: "all 0.2s" }}
              >
                {done ? "✓ Saved — redirecting..." : saving ? "Saving..." : "Save profile →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:560px){.f2{grid-template-columns:1fr!important}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
