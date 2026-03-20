import { StreaksApiResponse, StreakTeam } from "@/types/streak";

const API_BASE_URL = "/api/bhd";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

export async function fetchStreaks(): Promise<{ teams: StreakTeam[] }> {
  const res = await fetch(`${API_BASE_URL}/streaks`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch streaks");
  const raw: StreaksApiResponse = await res.json();

  const teams: StreakTeam[] = Object.entries(raw).map(([name, data]) => {
    const { teamID, position, ...markets } = data;
    return { name, teamID, position, ...markets } as StreakTeam;
  });

  return { teams };
}
