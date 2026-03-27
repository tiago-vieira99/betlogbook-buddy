import { StreaksApiResponse, StreakTeam } from "@/types/streak";

const API_BASE_URL = "/api";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cache: Promise<{ teams: StreakTeam[] }> | null = null;
let cacheTimestamp = 0;

export async function fetchStreaks(): Promise<{ teams: StreakTeam[] }> {
  if (cache && Date.now() - cacheTimestamp < CACHE_TTL_MS) return cache;
  cacheTimestamp = Date.now();
  cache = fetch(`${API_BASE_URL}/betstrat/sync/streaks`, {
    method: "GET",
    headers: getHeaders(),
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch streaks");
      return res.json() as Promise<StreaksApiResponse>;
    })
    .then(raw => {
      const teams: StreakTeam[] = Object.entries(raw).map(([name, data]) => {
        const { teamID, position, ...markets } = data;
        return { name, teamID, position, ...markets } as StreakTeam;
      });
      return { teams };
    })
    .catch(err => {
      cache = null;
      throw err;
    });
  return cache;
}
