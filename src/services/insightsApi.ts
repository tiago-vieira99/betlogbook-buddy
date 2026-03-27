import { UpcomingMatch } from "@/types/insights";

const API_BASE_URL = "/api/bhd";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

// Cache the promise so concurrent callers share one in-flight request,
// and subsequent navigations to this page resolve instantly from cache.
let cache: Promise<UpcomingMatch[]> | null = null;

export async function fetchUpcomingMatches(): Promise<UpcomingMatch[]> {
  if (!cache) {
    cache = fetch(`${API_BASE_URL}/upcomming-matches`, {
      method: "GET",
      headers: getHeaders(),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch upcoming matches");
        return res.json() as Promise<UpcomingMatch[]>;
      })
      .catch(err => {
        cache = null; // allow retry on next call
        throw err;
      });
  }
  return cache;
}
