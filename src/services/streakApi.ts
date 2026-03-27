import { StreaksApiResponse, StreakTeam } from "@/types/streak";

const API_BASE_URL = "/api";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

// Cache the promise so concurrent callers share one in-flight request,
// and subsequent navigations to this page resolve instantly from cache.
let cache: Promise<{ teams: StreakTeam[] }> | null = null;

export async function fetchStreaks(): Promise<{ teams: StreakTeam[] }> {
  if (!cache) {
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
        cache = null; // allow retry on next call
        throw err;
      });
  }
  return cache;
}
