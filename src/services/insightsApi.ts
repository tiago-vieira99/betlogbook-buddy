import { Prediction } from "@/types/insights";

const API_BASE_URL = "/api/betstrat";

export async function fetchPredictions(
  betType: string,
  date: string,
): Promise<Prediction[]> {
  const url = `${API_BASE_URL}/predictions/by-type-from-date?betType=${encodeURIComponent(
    betType,
  )}&date=${encodeURIComponent(date)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json() as Promise<Prediction[]>;
}
