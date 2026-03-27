import { UpcomingMatch } from "@/types/insights";

const API_BASE_URL = "/api/bhd";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cache: Promise<UpcomingMatch[]> | null = null;
let cacheTimestamp = 0;

export async function fetchUpcomingMatches(): Promise<UpcomingMatch[]> {
  if (cache && Date.now() - cacheTimestamp < CACHE_TTL_MS) return cache;
  cacheTimestamp = Date.now();
  cache = fetch(`${API_BASE_URL}/upcomming-matches`, {
    method: "GET",
    headers: getHeaders(),
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch upcoming matches");
      return res.json() as Promise<UpcomingMatch[]>;
    })
    .catch(err => {
      cache = null;
      throw err;
    });
  return cache;
}
