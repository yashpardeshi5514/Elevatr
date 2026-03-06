// api.js

const BASE_URL = "http://localhost:5000";

export async function getMatch(profile) {
  const res = await fetch(`${BASE_URL}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  });

  if (!res.ok) throw new Error("Match fetch failed");
  return res.json();
}

export async function getDeadlines() {
  const res = await fetch(`${BASE_URL}/deadlines`);
  if (!res.ok) throw new Error("Deadline fetch failed");
  return res.json();
}

export async function askAssistant(message) {
  const res = await fetch(`${BASE_URL}/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  if (!res.ok) throw new Error("Assistant failed");
  return res.json();
}