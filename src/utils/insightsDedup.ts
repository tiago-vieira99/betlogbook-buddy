import { Prediction } from "@/types/insights";

function teamName(team: { name: string } | string): string {
  return typeof team === "string" ? team : team.name;
}

function norm(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function fixtureKey(m: Prediction): string {
  return [
    norm(m.date),
    norm(teamName(m.homeTeam)),
    norm(teamName(m.awayTeam)),
    norm(m.competition),
  ].join("|");
}

/**
 * Keeps one prediction per fixture (same date, same teams, same competition).
 * When a fixture appears more than once, the prediction with the highest
 * confidence wins.
 */
export function dedupeMatches(matches: Prediction[]): Prediction[] {
  const best = new Map<string, Prediction>();
  for (const m of matches) {
    const key = fixtureKey(m);
    const current = best.get(key);
    if (!current || m.confidence > current.confidence) best.set(key, m);
  }
  return [...best.values()];
}
