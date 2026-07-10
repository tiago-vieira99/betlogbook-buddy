import { Team, Match } from "@/types/team";

const API_BASE_URL = "/api/bhd";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${API_BASE_URL}/teams`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export function getSeasonForTeam(beginSeason: string): string {
  const earlyMonths = ["January", "February", "March", "April", "May"];
  if (earlyMonths.includes(beginSeason)) {
    return "2026";
  }
  return "2026-2027";
}

export async function fetchMatches(teamName: string, season: string): Promise<Match[]> {
  const params = new URLSearchParams({ teamName, season });
  const res = await fetch(`${API_BASE_URL}/historic-matches?${params}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}
