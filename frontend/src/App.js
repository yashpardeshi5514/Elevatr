import {
  BrowserRouter, Routes, Route, Navigate,
  useLocation, useNavigate, useSearchParams
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar         from "./components/Navbar";
import AIAssistant    from "./components/AIAssistant";
import LandingPage    from "./components/LandingPage";
import ProfileBuilder from "./components/ProfileBuilder";
import Dashboard      from "./components/Dashboard";
import Deadlines      from "./components/Deadlines";
import Login          from "./components/Login";
import Signup         from "./components/Signup";
import ResetPassword  from "./components/ResetPassword";
import { getMatch }   from "./api";

/* ───────── Safe localStorage ───────── */

function lsGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function lsRemove(...keys) {
  keys.forEach(k => {
    try { localStorage.removeItem(k); } catch {}
  });
}

function loadProfileFromStorage(user) {
  if (!user) return null;

  const p = lsGet(`elevatr_profile_${user.email}`);
  if (!p) return null;

  const avatar = localStorage.getItem(`elevatr_avatar_${user.email}`) || null;
  return avatar ? { ...p, avatar } : p;
}

/* ───────── Protected Route ───────── */

function ProtectedRoute({ user, authLoading, children }) {
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ───────── Layout ───────── */

const HIDE_NAV = ["/login", "/signup", "/auth-callback"];

function Layout({ children, profile, user, onLogout }) {
  const location = useLocation();
  const showNav =
    !HIDE_NAV.includes(location.pathname) &&
    !location.pathname.startsWith("/reset-password");

  return (
    <>
      {showNav && <Navbar profile={profile} user={user} onLogout={onLogout} />}
      <div style={{ paddingTop: showNav ? 84 : 0 }}>{children}</div>
      {user && <AIAssistant user={user} />}
    </>
  );
}

/* ───────── OAuth Callback ───────── */

function AuthCallback({ onLogin }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userStr));
        lsSet("elevatr_user", parsed);
        localStorage.setItem("elevatr_token", token);
        onLogin(parsed);
        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center"
    }}>
      <p>Signing you in...</p>
    </div>
  );
}

/* ───────── Root App ───────── */

export default function App() {

  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* Restore user + profile */
  useEffect(() => {
    try {
      const u = lsGet("elevatr_user");
      if (u) {
        setUser(u);
        const p = loadProfileFromStorage(u);
        if (p) setProfile(p);
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /* Fetch AI matches */
  useEffect(() => {
    if (!profile) return;

    setLoading(true);

    getMatch(profile)
      .then(d => setMatches(Array.isArray(d) ? d : []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));

  }, [profile]);

  /* Login */
  function handleLogin(userData) {
    setUser(userData);
    lsSet("elevatr_user", userData);
  }

  /* Logout */
  function handleLogout() {
    setUser(null);
    setProfile(null);
    setMatches([]);
    lsRemove("elevatr_user", "elevatr_token");
  }

  /* Save Profile */
  function saveProfile(payload) {
    if (!user) return;

    setProfile(payload);

    const { avatar, ...rest } = payload;

    lsSet(`elevatr_profile_${user.email}`, rest);

    if (avatar) {
      try {
        localStorage.setItem(`elevatr_avatar_${user.id}`, avatar);
      } catch {}
    }
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={
          <Layout profile={profile} user={user} onLogout={handleLogout}>
            <LandingPage user={user}/>
          </Layout>
        }/>

        <Route path="/login" element={<Login onLogin={handleLogin}/>}/>
        <Route path="/signup" element={<Signup onLogin={handleLogin}/>}/>
        <Route path="/auth-callback" element={<AuthCallback onLogin={handleLogin}/>}/>
        <Route path="/reset-password/:token" element={<ResetPassword/>}/>

        <Route path="/profile" element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <Layout profile={profile} user={user} onLogout={handleLogout}>
              <ProfileBuilder
                onProfileSaved={saveProfile}
                profile={profile}
                user={user}
              />
            </Layout>
          </ProtectedRoute>
        }/>

        <Route path="/dashboard" element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <Layout profile={profile} user={user} onLogout={handleLogout}>
              <Dashboard
                matches={matches}
                loading={loadingMatches}
                profile={profile}
                user={user}
              />
            </Layout>
          </ProtectedRoute>
        }/>

        <Route path="/deadlines" element={
          <ProtectedRoute user={user} authLoading={authLoading}>
            <Layout profile={profile} user={user} onLogout={handleLogout}>
              <Deadlines/>
            </Layout>
          </ProtectedRoute>
        }/>

        <Route path="*" element={<Navigate to="/" replace/>}/>

      </Routes>
    </BrowserRouter>
  );
}