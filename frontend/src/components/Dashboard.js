import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpportunityCard from "./OpportunityCard";

const N = "#1a4fad";
const TYPES = ["All", "Scholarship", "Fellowship", "Grant", "Internship"];

export default function Dashboard({ profile, user }) {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expand, setExpand] = useState(null);

  const [liveData, setLiveData] = useState([]);
  const [matchedData, setMatchedData] = useState([]);

  const [liveLoading, setLiveLoading] = useState(false);
  const [matchedLoading, setMatchedLoading] = useState(false);
  const [dataSource, setDataSource] = useState("matched");

  const name = user?.name || profile?.name;

  /* ───────── Fetch Live Data ───────── */
  useEffect(() => {
    if (!profile?.degree && !profile?.field) return;

    setLiveLoading(true);

    Promise.all([
      fetch(`http://localhost:5000/live-internships?field=${encodeURIComponent(profile?.field || "")}`),
      fetch(`http://localhost:5000/live-scholarships?field=${encodeURIComponent(profile?.field || "")}`)
    ])
      .then(async ([i, s]) => {
        const internships = i.ok ? await i.json() : [];
        const scholarships = s.ok ? await s.json() : [];
        setLiveData([...internships, ...scholarships]);
      })
      .catch(() => {})
      .finally(() => setLiveLoading(false));

  }, [profile]);

  /* ───────── Fetch Matched Data ───────── */
  useEffect(() => {
    if (!profile?.degree && !profile?.field) return;

    setMatchedLoading(true);

    fetch("http://localhost:5000/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        degree: profile?.degree || "",
        field: profile?.field || "",
        skills: profile?.skills || [],
        interests: profile?.interests || [],
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setMatchedData(d);
      })
      .catch(() => {})
      .finally(() => setMatchedLoading(false));

  }, [profile]);

  const combined = dataSource === "live" ? liveData : matchedData;

  /* ───────── FILTERING (Search + Type Only) ───────── */
  const shown = combined
    .filter(o => {
      const matchType =
        filter === "All" || o.type === filter;

      const matchSearch =
        !search ||
        o.title?.toLowerCase().includes(search.toLowerCase()) ||
        o.org?.toLowerCase().includes(search.toLowerCase());

      return matchType && matchSearch;
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8faff", padding: "36px 28px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ───────── Header ───────── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N }}>
            {dataSource === "live" ? "Live Feed" : "AI Matched"}
          </p>

          <h1 style={{ fontWeight: 800, fontSize: 30, margin: "6px 0" }}>
            {name ? `Welcome back, ${name.split(" ")[0]}` : "Dashboard"}
          </h1>
        </div>
{/* ───────── Source Toggle ───────── */}
<div
  style={{
    display: "flex",
    gap: 1,
    background: "rgba(26,79,173,0.06)",
    border: "1px solid rgba(26,79,173,0.12)",
    borderRadius: 11,
    padding: 4,
    marginBottom: 20,
    width: "fit-content"
  }}
>
  {[["matched", "Matched"], ["live", "Live"]].map(([v, l]) => (
    <button
      key={v}
      onClick={() => setDataSource(v)}
      style={{
        padding: "8px 18px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 13,
        background:
          dataSource === v
            ? `linear-gradient(135deg, ${N}, #2563eb)`
            : "transparent",
        color: dataSource === v ? "#fff" : "#4a6490",
        transition: "all 0.18s",
        boxShadow:
          dataSource === v
            ? "0 2px 8px rgba(26,79,173,0.25)"
            : "none",
      }}
    >
      {l}
    </button>
  ))}
</div>
        {/* ───────── Filters Bar ───────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search opportunities..."
            style={{
              flex: 1,
              minWidth: 220,
              padding: "10px 14px",
              border: "1px solid rgba(26,79,173,0.15)",
              borderRadius: 10,
              fontSize: 14,
            }}
          />

          {/* Type Filters */}
          <div style={{ display: "flex", gap: 6 }}>
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    filter === t
                      ? `linear-gradient(135deg, ${N}, #2563eb)`
                      : "rgba(26,79,173,0.08)",
                  color: filter === t ? "#fff" : "#4a6490",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ───────── Cards Grid ───────── */}
        {!liveLoading && !matchedLoading && shown.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
            {shown.map((opp, i) => {
              const id = opp.id ?? i;
              return (
                <OpportunityCard
                  key={id}
                  opp={opp}
                  expanded={expand === id}
                  onExpand={() => setExpand(prev => prev === id ? null : id)}
                />
              );
            })}
          </div>
        )}

        {/* ───────── Empty State ───────── */}
        {!liveLoading && !matchedLoading && shown.length === 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <h3>No opportunities found</h3>
            <p>Try adjusting your search or filters.</p>
            <button
              onClick={() => navigate("/profile")}
              style={{
                padding: "10px 24px",
                background: `linear-gradient(135deg, ${N}, #2563eb)`,
                color: "#fff",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Update Profile →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}