import { StreaksResponse } from "@/types/streak";

const API_BASE_URL = "/api/bhd";

function getHeaders(): HeadersInit {
  return {
    accept: "*/*",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
  };
}

export async function fetchStreaks(): Promise<StreaksResponse> {
  const res = await fetch(`${API_BASE_URL}/streaks`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch streaks");
  return res.json();
}
