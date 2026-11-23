import { describe, expect, it } from "vitest";
import { Prediction } from "@/types/insights";
import { dedupeMatches } from "@/utils/insightsDedup";

function match(overrides: Partial<Prediction> & { id: number }): Prediction {
  return {
    date: "23/11/2026",
    homeTeam: { name: "SL Benfica", country: "Portugal" },
    awayTeam: { name: "FC Porto", country: "Portugal" },
    competition: "Primeira Liga",
    betType: "BTTS",
    url: null,
    confidence: 0.5,
    ...overrides,
  };
}

function names(list: Prediction[]): string[] {
  return list.map(m => `${m.id}`);
}

describe("dedupeMatches", () => {
  it("drops a repeated fixture and keeps the highest confidence one", () => {
    const result = dedupeMatches([
      match({ id: 1, confidence: 0.62 }),
      match({ id: 2, confidence: 0.78 }),
    ]);
    expect(names(result)).toEqual(["2"]);
  });

  it("keeps the same fixture on a different date", () => {
    const result = dedupeMatches([
      match({ id: 1, date: "23/11/2026" }),
      match({ id: 2, date: "30/11/2026" }),
    ]);
    expect(names(result)).toEqual(["1", "2"]);
  });

  it("keeps the same fixture in a different competition", () => {
    const result = dedupeMatches([
      match({ id: 1, competition: "Primeira Liga" }),
      match({ id: 2, competition: "Taça de Portugal" }),
    ]);
    expect(names(result)).toEqual(["1", "2"]);
  });

  it("treats a swapped home/away fixture as a different match", () => {
    const result = dedupeMatches([
      match({ id: 1 }),
      match({
        id: 2,
        homeTeam: { name: "FC Porto", country: "Portugal" },
        awayTeam: { name: "SL Benfica", country: "Portugal" },
      }),
    ]);
    expect(names(result)).toEqual(["1", "2"]);
  });

  it("ignores letter case and extra spaces when comparing fixtures", () => {
    const result = dedupeMatches([
      match({ id: 1, competition: "primeira  liga" }),
      match({
        id: 2,
        confidence: 0.9,
        homeTeam: { name: " sl benfica ", country: "Portugal" },
        awayTeam: { name: "fc PORTO", country: "Portugal" },
        competition: "PRIMEIRA LIGA",
      }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("returns an empty list untouched", () => {
    expect(dedupeMatches([])).toEqual([]);
  });
});
