import express          from "express";
import cors             from "cors";
import dotenv           from "dotenv";
import crypto           from "crypto";
import session          from "express-session";
import passport         from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";


import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

dotenv.config();

/* ═══════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════ */
const PORT        = process.env.PORT        || 5000;
const CLIENT_URL  = process.env.CLIENT_URL  || "http://localhost:3000";
const SERVER_URL  = process.env.SERVER_URL  || "http://localhost:5000";

const app = express();
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ─── Session (required for passport OAuth flow) ─── */
app.use(session({
  secret:            process.env.SESSION_SECRET || "elevatr_session_secret",
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done)   => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/* ═══════════════════════════════════════════════════
   AWS BEDROCK
═══════════════════════════════════════════════════ */
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

/* ═══════════════════════════════════════════════════
   IN-MEMORY STORES  (swap → DynamoDB in production)
═══════════════════════════════════════════════════ */
const users       = new Map();  // email → user
const profiles    = new Map();  // userId → profile
const resetTokens = new Map();  // token → { email, exp }

/* ─── Auth helpers ─── */
const hashPwd = pwd =>
  crypto.createHash("sha256")
    .update(pwd + (process.env.PASSWORD_SALT || "elevatr_salt_2024"))
    .digest("hex");

const genJWT = userId => {
  const payload = Buffer.from(JSON.stringify({
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })).toString("base64url");
  const sig = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "elevatr_jwt_secret")
    .update(payload).digest("hex");
  return `${payload}.${sig}`;
};

const verifyJWT = token => {
  try {
    const [payload, sig] = token.split(".");
    const expected = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "elevatr_jwt_secret")
      .update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
};

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const data = verifyJWT(auth.slice(7));
  if (!data) return res.status(401).json({ error: "Token invalid or expired" });
  req.userId = data.userId;
  next();
};

/* ─── Email helper ─── */
async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n📧 [DEV - NO SMTP] Email would send to: ${to}`);
    console.log(`   Subject: ${subject}`);
    // For password reset — print the link directly so devs can test
    const match = html.match(/href="([^"]*reset-password[^"]*)"/);
    if (match) console.log(`\n🔑 RESET LINK (copy into browser): ${match[1]}\n`);
    return;
  }
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host:   process.env.SMTP_HOST || "smtp.gmail.com",
      port:   parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from:    `"Elevatr" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
    console.log(`✅ Email sent → ${to}`);
  } catch (err) {
    console.error("📧 Email error:", err.message);
  }
}

/* ═══════════════════════════════════════════════════
   GOOGLE OAUTH STRATEGY
   ─────────────────────────────────────────────────
   IMPORTANT: The callbackURL below MUST exactly match
   what you add in Google Cloud Console:
   http://localhost:5000/auth/google/callback
═══════════════════════════════════════════════════ */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use("google", new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${SERVER_URL}/auth/google/callback`,
      // ↑ This must match EXACTLY in Google Console
      scope:        ["profile", "email"],
    },
    async (_accessToken, _refreshToken, googleProfile, done) => {
      try {
        const email = googleProfile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("No email from Google"));

        let user = users.get(email);
        if (!user) {
          user = {
            id:           crypto.randomUUID(),
            name:         googleProfile.displayName,
            email,
            provider:     "google",
            avatar:       googleProfile.photos?.[0]?.value || "",
            createdAt:    new Date().toISOString(),
            passwordHash: "",
          };
          users.set(email, user);
          console.log(`✅ New Google user: ${email}`);
        }
        const token = genJWT(user.id);
        const { passwordHash, ...safeUser } = user;
        return done(null, { user: safeUser, token });
      } catch (err) {
        return done(err);
      }
    }
  ));
  console.log("🔑 Google OAuth strategy registered");
} else {
  console.log("⚠️  Google OAuth not configured — running in demo mode");
}

/* ═══════════════════════════════════════════════════
   GITHUB OAUTH STRATEGY
   ─────────────────────────────────────────────────
   callbackURL must match GitHub OAuth App settings:
   http://localhost:5000/auth/github/callback
═══════════════════════════════════════════════════ */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use("github", new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  `${SERVER_URL}/auth/github/callback`,
      // ↑ This must match EXACTLY in GitHub Developer Settings
      scope:        ["user:email"],
    },
    async (_accessToken, _refreshToken, githubProfile, done) => {
      try {
        const email = (
          githubProfile.emails?.[0]?.value ||
          `${githubProfile.username}@github.users.noreply`
        ).toLowerCase();

        let user = users.get(email);
        if (!user) {
          user = {
            id:           crypto.randomUUID(),
            name:         githubProfile.displayName || githubProfile.username,
            email,
            provider:     "github",
            avatar:       githubProfile.photos?.[0]?.value || "",
            createdAt:    new Date().toISOString(),
            passwordHash: "",
          };
          users.set(email, user);
          console.log(`✅ New GitHub user: ${email}`);
        }
        const token = genJWT(user.id);
        const { passwordHash, ...safeUser } = user;
        return done(null, { user: safeUser, token });
      } catch (err) {
        return done(err);
      }
    }
  ));
  console.log("🐙 GitHub OAuth strategy registered");
} else {
  console.log("⚠️  GitHub OAuth not configured — running in demo mode");
}

/* ═══════════════════════════════════════════════════
   AUTH ROUTES
═══════════════════════════════════════════════════ */

/* ── Signup ── */
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: "Name, email and password are required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Please enter a valid email address." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });

  const normalizedEmail = email.toLowerCase().trim();
  if (users.has(normalizedEmail))
    return res.status(409).json({ error: "An account with this email already exists." });

  const id   = crypto.randomUUID();
  const user = {
    id, name: name.trim(), email: normalizedEmail,
    passwordHash: hashPwd(password),
    createdAt: new Date().toISOString(), provider: "email",
  };
  users.set(normalizedEmail, user);

  const { passwordHash, ...safeUser } = user;
  const token = genJWT(id);

  sendEmail({
    to: normalizedEmail, subject: "Welcome to Elevatr 🎓",
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
      <h2 style="color:#1e4080">Welcome to Elevatr, ${name.trim()}!</h2>
      <p style="color:#4a6490;font-size:15px;line-height:1.6">Your account is ready. Build your profile to unlock AI-powered opportunity matching.</p>
      <a href="${CLIENT_URL}/profile" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#1e4080;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">Build My Profile →</a>
    </div>`,
  });

  console.log(`✅ Signup: ${normalizedEmail}`);
  res.status(201).json({ message: "Account created.", token, user: safeUser });
});

/* ── Login ── */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.get(normalizedEmail);
  if (!user || user.passwordHash !== hashPwd(password))
    return res.status(401).json({ error: "Invalid email or password." });

  const { passwordHash, ...safeUser } = user;
  const token = genJWT(user.id);
  console.log(`✅ Login: ${normalizedEmail}`);
  res.json({ message: "Login successful.", token, user: safeUser });
console.log("LOGIN SUCCESS:", safeUser.email);
});

/* ── Google: initiate ── */
app.get("/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    // Demo fallback — no credentials configured
    const demo = {
      id: "google-demo-" + crypto.randomUUID(),
      name: "Demo Google User", email: "google-demo@elevatr.app",
      provider: "google", avatar: "",
    };
    users.set(demo.email, { ...demo, passwordHash: "" });
    const token = genJWT(demo.id);
    return res.redirect(
      `${CLIENT_URL}/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(demo))}`
    );
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

/* ── Google: callback ──
   This URL must be EXACTLY registered in Google Cloud Console:
   http://localhost:5000/auth/google/callback
*/
app.get("/auth/google/callback", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${CLIENT_URL}/login?error=not_configured`);
  }
  passport.authenticate("google", { session: false, failureRedirect: `${CLIENT_URL}/login?error=google_failed` },
    (err, result) => {
      if (err || !result) {
        console.error("Google auth error:", err?.message);
        return res.redirect(`${CLIENT_URL}/login?error=google_failed`);
      }
      const { user, token } = result;
      res.redirect(
        `${CLIENT_URL}/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
      );
    }
  )(req, res, next);
});

/* ── GitHub: initiate ── */
app.get("/auth/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    const demo = {
      id: "github-demo-" + crypto.randomUUID(),
      name: "Demo GitHub User", email: "github-demo@elevatr.app",
      provider: "github", avatar: "",
    };
    users.set(demo.email, { ...demo, passwordHash: "" });
    const token = genJWT(demo.id);
    return res.redirect(
      `${CLIENT_URL}/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(demo))}`
    );
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

/* ── GitHub: callback ──
   This URL must be EXACTLY registered in GitHub Developer Settings:
   http://localhost:5000/auth/github/callback
*/
app.get("/auth/github/callback", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.redirect(`${CLIENT_URL}/login?error=not_configured`);
  }
  passport.authenticate("github", { session: false, failureRedirect: `${CLIENT_URL}/login?error=github_failed` },
    (err, result) => {
      if (err || !result) {
        console.error("GitHub auth error:", err?.message);
        return res.redirect(`${CLIENT_URL}/login?error=github_failed`);
      }
      const { user, token } = result;
      res.redirect(
        `${CLIENT_URL}/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
      );
    }
  )(req, res, next);
});

/* ── Forgot Password ── */
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  // Always return OK to prevent user enumeration
  res.json({ message: "If that email exists, a reset link has been sent." });

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.get(normalizedEmail);
  if (!user) return;

  const token    = crypto.randomBytes(32).toString("hex");
  const resetUrl = `${CLIENT_URL}/reset-password/${token}`;
  resetTokens.set(token, { email: normalizedEmail, exp: Date.now() + 60 * 60 * 1000 });

  await sendEmail({
    to: normalizedEmail, subject: "Elevatr — Reset Your Password",
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
      <h2 style="color:#1e4080">Reset Your Password</h2>
      <p style="color:#4a6490;font-size:15px;line-height:1.6">Click below to set a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#1e4080;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">Reset Password →</a>
      <p style="color:#8098be;font-size:13px;margin-top:24px">If you didn't request this, ignore this email.</p>
    </div>`,
  });
});

/* ── Reset Password ── */
app.post("/reset-password", (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and password required." });

  const data = resetTokens.get(token);
  if (!data || data.exp < Date.now())
    return res.status(400).json({ error: "Reset link is invalid or has expired." });

  const user = users.get(data.email);
  if (!user) return res.status(404).json({ error: "User not found." });

  user.passwordHash = hashPwd(password);
  users.set(data.email, user);
  resetTokens.delete(token);

  console.log(`✅ Password reset: ${data.email}`);
  res.json({ message: "Password updated successfully." });
});

/* ── Get current user ── */
app.get("/me", requireAuth, (req, res) => {
  const user = [...users.values()].find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

/* ── Save / Get profile ── */
app.post("/profile", requireAuth, (req, res) => {
  profiles.set(req.userId, { ...req.body, updatedAt: new Date().toISOString() });
  res.json({ message: "Profile saved.", profile: profiles.get(req.userId) });
});
app.get("/profile", requireAuth, (req, res) => {
  const p = profiles.get(req.userId);
  if (!p) return res.status(404).json({ error: "No profile found." });
  res.json(p);
});

/* ═══════════════════════════════════════════════════
   EL AI ASSISTANT (Amazon Bedrock — Nova Micro)
═══════════════════════════════════════════════════ */
app.post("/assistant", async (req, res) => {
  const { query, systemPrompt, history } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: "Query is required." });

  const DEFAULT_SYSTEM = `You are EL, Elevatr's AI assistant. Help students find scholarships, fellowships, internships, and grants. Be concise, specific, and actionable. Use markdown. For city-related queries, mention location-specific opportunities.`;

  // Bedrock rules:
  //  1. First message must be "user"
  //  2. Roles must strictly alternate user → assistant → user …
  //  3. Last message must be "user" (the current query)
  //
  // The frontend history includes the initial assistant greeting — we must
  // skip any leading assistant messages before sending to Bedrock.

  const queryText  = query.trim();
  const rawHistory = Array.isArray(history) ? history.slice(-12) : [];

  // Filter to only user+assistant turns, skip leading assistant messages,
  // and exclude any message that is just the current query (we'll add it once at the end).
  const filtered = [];
  for (const h of rawHistory) {
    const role = h.role === "user" ? "user" : "assistant";
    const text = (h.text || "").trim();
    if (!text) continue;
    // Drop leading assistant messages — Bedrock must start with user
    if (filtered.length === 0 && role === "assistant") continue;
    // Merge back-to-back same-role messages (Bedrock rejects them)
    if (filtered.length > 0 && filtered[filtered.length - 1].role === role) {
      filtered[filtered.length - 1].content[0].text += "\n" + text;
    } else {
      filtered.push({ role, content: [{ text }] });
    }
  }

  // Remove any trailing assistant entries — last must be user
  while (filtered.length > 0 && filtered[filtered.length - 1].role === "assistant") {
    filtered.pop();
  }

  // Remove the last user message if it duplicates the current query
  // (prevents sending the same message twice)
  if (
    filtered.length > 0 &&
    filtered[filtered.length - 1].role === "user" &&
    filtered[filtered.length - 1].content[0].text.trim() === queryText
  ) {
    filtered.pop();
  }

  // Now append the current user query as the final message
  filtered.push({ role: "user", content: [{ text: queryText }] });

  const messages = filtered;

  // Validate AWS is configured before attempting Bedrock call
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return res.status(503).json({
      error: "AWS credentials not configured. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to your .env file, then restart the server."
    });
  }

  // Use ConverseCommand — the correct API for Nova models (InvokeModel uses different schema)
  // Try nova-micro first (cheapest), fall back to nova-lite
  const MODELS = ["amazon.nova-micro-v1:0", "amazon.nova-lite-v1:0"];
  let lastError = null;

  for (const modelId of MODELS) {
    try {
      const command = new ConverseCommand({
        modelId,
        system: [{ text: systemPrompt || DEFAULT_SYSTEM }],
        messages,
        inferenceConfig: { maxTokens: 800, temperature: 0.7, topP: 0.9 },
      });
      const response = await bedrock.send(command);
      const reply = response.output?.message?.content?.[0]?.text || "No response from AI.";
      console.log(`[Assistant] OK via ${modelId} (${reply.length} chars)`);
      return res.json({ reply });
    } catch (err) {
      lastError = err;
      const code = err.name || err.__type || "UnknownError";
      console.error(`[Assistant] ${modelId} FAILED [${code}]: ${err.message}`);
      // Only try the fallback model for access/not-found errors
      const tryNext = code.includes("AccessDenied") || code.includes("ResourceNotFound")
                   || (err.message || "").includes("AccessDenied")
                   || (err.message || "").includes("ResourceNotFound");
      if (!tryNext) break;
    }
  }

  // Build a useful error message for the user
  const errMsg = lastError?.message || "Unknown error";
  const errCode = lastError?.name || lastError?.__type || "";
  console.error(`[Assistant] All models failed. Code=${errCode} Message=${errMsg}`);

  let userFacing;
  if (errCode.includes("AccessDenied") || errMsg.includes("AccessDenied")) {
    userFacing = "AWS access denied. Go to AWS Console → Bedrock → Model access → enable Amazon Nova Micro & Nova Lite in us-east-1, then make sure your IAM user has the bedrock:InvokeModel permission.";
  } else if (errCode.includes("ResourceNotFound") || errMsg.includes("ResourceNotFound")) {
    userFacing = "Bedrock model not found. Enable Amazon Nova models in AWS Bedrock Model Access (us-east-1 region).";
  } else if (errCode.includes("Throttling") || errMsg.includes("Throttling")) {
    userFacing = "Rate limited by AWS. Please wait a few seconds and try again.";
  } else if (errMsg.includes("credential") || errMsg.includes("signature")) {
    userFacing = "AWS credentials are invalid or expired. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.";
  } else if (errMsg.includes("region") || errMsg.includes("endpoint")) {
    userFacing = "AWS region error. Make sure AWS_REGION=us-east-1 is in your .env file (Nova models are only in us-east-1).";
  } else {
    userFacing = `Bedrock error: ${errMsg}`;
  }

  res.status(500).json({ error: userFacing });
});


/* ═══════════════════════════════════════════════════
   HEALTH CHECK
═══════════════════════════════════════════════════ */
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "Elevatr API v2.1", ts: new Date().toISOString() })
);
/* ═══════════════════════════════════════════════════
   AI PROFILE ANALYSIS (Amazon Bedrock - Nova Micro)
═══════════════════════════════════════════════════ */
async function analyzeProfileWithAI(profile) {

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured");
  }

  const prompt = `
You are an AI Career Intelligence Engine.

Analyze this student profile deeply and return ONLY valid JSON.

Profile:
Degree: ${profile.degree}
Field: ${profile.field || ""}
Year: ${profile.year || ""}
Skills: ${(profile.skills || []).join(", ")}
Interests: ${(profile.interests || []).join(", ")}

Return JSON in this format:

{
  "strengthSummary": "2-3 sentence summary of strengths",
  "careerFit": "Best suited career direction explanation",
  "skillGaps": ["gap1", "gap2"],
  "recommendedPaths": ["Path 1", "Path 2"],
  "actionPlan": ["Step 1", "Step 2", "Step 3"]
}
`;

  const command = new ConverseCommand({
    modelId: "amazon.nova-micro-v1:0",
    system: [{ text: "You are a professional AI career advisor." }],
    messages: [
      {
        role: "user",
        content: [{ text: prompt }]
      }
    ],
    inferenceConfig: {
      maxTokens: 700,
      temperature: 0.6
    }
  });

  const response = await bedrock.send(command);

  const output =
    response.output?.message?.content?.[0]?.text || "{}";

  try {
    return JSON.parse(output);
  } catch {
    throw new Error("AI returned invalid JSON");
  }
}
app.post("/analyze-profile", async (req, res) => {
  const profile = req.body;

  if (!profile.degree) {
    return res.status(400).json({ error: "Profile missing" });
  }

  try {
    const analysis = await analyzeProfileWithAI(profile);
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});
/* ═══════════════════════════════════════════════════
   LIVE INTERNSHIPS
═══════════════════════════════════════════════════ */
app.get("/live-internships", async (req, res) => {
  const { field = "", degree = "", skills = "" } = req.query;

  const skillList = skills
    ? skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const queryTerm = (field || degree || "software") + " internship";

  try {
    const [remote, india] = await Promise.allSettled([
      fetch(
        `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(queryTerm)}&limit=10`
      ).then(r => r.ok ? r.json() : { jobs: [] }),

      fetch(
        `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&results_per_page=10&what=${encodeURIComponent(queryTerm)}&where=India`
      ).then(r => r.ok ? r.json() : { results: [] })
    ]);

    const results = [];

    if (remote.status === "fulfilled") {
      (remote.value.jobs || []).forEach(job => {
        results.push({
          id: `remote-${job.id}`,
          title: job.title,
          org: job.company_name,
          type: "Internship",
          description: (job.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
          deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          amount: job.salary || "Stipend / Competitive",
          city: "Remote",
          remote: true,
          applyUrl: job.url,
          source: "Remotive"
        });
      });
    }

    if (india.status === "fulfilled") {
      (india.value.results || []).forEach(job => {
        results.push({
          id: `india-${job.id}`,
          title: job.title,
          org: job.company?.display_name || "Company",
          type: "Internship",
          description: (job.description || "").slice(0, 300),
          deadline: new Date(Date.now() + 40 * 86400000).toISOString().split("T")[0],
          amount: job.salary_min
            ? `₹${job.salary_min} - ₹${job.salary_max}`
            : "As per company",
          city: job.location?.display_name || "India",
          remote: false,
          applyUrl: job.redirect_url,
          source: "Adzuna India"
        });
      });
    }

    res.json(results);
  } catch (err) {
    console.error("INTERNSHIP FETCH ERROR:", err.message);
    res.status(500).json({ error: "Internship fetch failed." });
  }
});


/* ═══════════════════════════════════════════════════
   LIVE SCHOLARSHIPS
═══════════════════════════════════════════════════ */
app.get("/live-scholarships", async (req, res) => {
  const { field = "", degree = "" } = req.query;

  const queryTerm = (field || degree || "engineering") + " scholarship";

  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&results_per_page=10&what=${encodeURIComponent(queryTerm)}`
    );

    const data = response.ok ? await response.json() : { results: [] };

    const results = (data.results || []).map(job => ({
      id: `sch-${job.id}`,
      title: job.title,
      org: job.company?.display_name || "Organization",
      type: "Scholarship",
      description: (job.description || "").slice(0, 300),
      deadline: new Date(Date.now() + 60 * 86400000)
        .toISOString()
        .split("T")[0],
      amount: job.salary_min
        ? `₹${job.salary_min} - ₹${job.salary_max}`
        : "Varies",
      city: job.location?.display_name || "India",
      remote: true,
      applyUrl: job.redirect_url,
      source: "Adzuna Scholarship Search"
    }));

    res.json(results);

  } catch (err) {
    console.error("SCHOLARSHIP FETCH ERROR:", err.message);
    res.status(500).json({ error: "Scholarship fetch failed." });
  }
});

/* ═══════════════════════════════════════════════════
   AI MATCH ROUTE (Bedrock Powered)
═══════════════════════════════════════════════════ */
app.post("/match", async (req, res) => {
  try {
    const profile = {
      degree: req.body.degree || "",
      field: req.body.field || "",
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      interests: Array.isArray(req.body.interests) ? req.body.interests : []
    };

    if (!profile.degree && !profile.field) {
      return res.status(400).json({ error: "Profile incomplete." });
    }

    // Fetch internships + scholarships
    const [internRes, scholarshipRes] = await Promise.all([
      fetch(`http://localhost:${PORT}/live-internships?field=${encodeURIComponent(profile.field)}`),
      fetch(`http://localhost:${PORT}/live-scholarships?field=${encodeURIComponent(profile.field)}`)
    ]);

    const internships = internRes.ok ? await internRes.json() : [];
    const scholarships = scholarshipRes.ok ? await scholarshipRes.json() : [];

    const jobs = [...internships, ...scholarships];

    if (!jobs.length) return res.json([]);

    const limitedJobs = jobs.slice(0, 5);
    const matchedResults = [];

    for (const job of limitedJobs) {
      try {
        const aiMatch = await getAIMatchScore(profile, job);

        matchedResults.push({
          ...job,
          matchScore: aiMatch.matchScore || 50,
          reason: aiMatch.reason || "",
          strengthAlignment: aiMatch.strengthAlignment || "",
          skillGap: aiMatch.skillGap || ""
        });

      } catch {
        matchedResults.push({
          ...job,
          matchScore: 50,
          reason: "AI scoring failed",
          strengthAlignment: "",
          skillGap: ""
        });
      }
    }

    matchedResults.sort((a, b) => b.matchScore - a.matchScore);
    res.json(matchedResults);

  } catch (err) {
    console.error("MATCH ROUTE ERROR:", err);
    res.status(500).json({ error: "AI matching failed." });
  }
});
/* ═══════════════════════════════════════════════════
   DEADLINES ROUTE
═══════════════════════════════════════════════════ */

app.get("/deadlines", async (req, res) => {
  try {

    // Fetch internships + scholarships
    const [internRes, scholarshipRes] = await Promise.all([
      fetch(`http://localhost:${PORT}/live-internships`),
      fetch(`http://localhost:${PORT}/live-scholarships`)
    ]);

    const internships = internRes.ok ? await internRes.json() : [];
    const scholarships = scholarshipRes.ok ? await scholarshipRes.json() : [];

    const all = [...internships, ...scholarships];

    // Only keep items that have a deadline
    const withDeadlines = all
      .filter(item => item.deadline)
      .map(item => ({
        title: item.title,
        org: item.org,
        type: item.type,
        city: item.city,
        deadline: item.deadline
      }));

    res.json(withDeadlines);

  } catch (err) {
    console.error("DEADLINES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch deadlines." });
  }
});
/* ═══════════════════════════════════════════════════
   START
═══════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n  Elevatr API running at http://localhost:${PORT}`);
  console.log(`  Frontend:       ${CLIENT_URL}`);
  console.log(`\n  OAuth callbacks to register:`);
  console.log(`    Google:  ${SERVER_URL}/auth/google/callback`);
  console.log(`    GitHub:  ${SERVER_URL}/auth/github/callback`);
  console.log(`\n  Google OAuth  → ${process.env.GOOGLE_CLIENT_ID  ? "Configured" : "Not configured (demo mode)"}`);
  console.log(`  GitHub OAuth  → ${process.env.GITHUB_CLIENT_ID  ? "Configured" : "Not configured (demo mode)"}`);
  console.log(`  AWS Bedrock   → ${process.env.AWS_ACCESS_KEY_ID ? "Configured" : "Not configured — AI assistant unavailable"}`);
  console.log(`  Email (SMTP)  → ${process.env.SMTP_USER         ? "Configured" : "Not configured (reset links log to console)"}`);
 
});
