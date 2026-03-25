import { UpcomingMatch } from "@/types/insights";

const API_BASE_URL = "/api/bhd";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

export async function fetchUpcomingMatches(): Promise<UpcomingMatch[]> {
  const res = await fetch(`${API_BASE_URL}/upcomming-matches`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch upcoming matches");
  return res.json();
}
