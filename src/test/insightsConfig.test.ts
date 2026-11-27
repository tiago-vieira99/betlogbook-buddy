import { describe, expect, it } from "vitest";
import {
  BANKROLL_BY_TYPE,
  BET_TYPES,
  HIGHLIGHT_THRESHOLD,
} from "@/pages/InsightsPage";

describe("insights bet types", () => {
  it("offers only BTTS", () => {
    expect(BET_TYPES).toEqual(["BTTS"]);
  });

  it("no longer offers 1X && Over", () => {
    expect(BET_TYPES).not.toContain("1X && Over");
    expect(BANKROLL_BY_TYPE).not.toHaveProperty("1X && Over");
    expect(HIGHLIGHT_THRESHOLD).not.toHaveProperty("1X && Over");
  });

  it("no longer offers MyStreaks", () => {
    expect(BET_TYPES).not.toContain("MyStreaks");
    expect(BANKROLL_BY_TYPE).not.toHaveProperty("MyStreaks");
    expect(HIGHLIGHT_THRESHOLD).not.toHaveProperty("MyStreaks");
  });

  it("creates BTTS bets in bankroll 20", () => {
    expect(BANKROLL_BY_TYPE.BTTS).toBe(20);
  });

  it("highlights BTTS predictions from 70% confidence", () => {
    expect(HIGHLIGHT_THRESHOLD.BTTS).toBe(0.7);
  });
});
