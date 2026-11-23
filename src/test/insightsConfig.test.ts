import { describe, expect, it } from "vitest";
import {
  BANKROLL_BY_TYPE,
  BET_TYPES,
  HIGHLIGHT_THRESHOLD,
} from "@/pages/InsightsPage";

describe("insights bet types", () => {
  it("offers only BTTS and 1X && Over", () => {
    expect(BET_TYPES).toEqual(["BTTS", "1X && Over"]);
  });

  it("no longer offers MyStreaks", () => {
    expect(BET_TYPES).not.toContain("MyStreaks");
    expect(BANKROLL_BY_TYPE).not.toHaveProperty("MyStreaks");
    expect(HIGHLIGHT_THRESHOLD).not.toHaveProperty("MyStreaks");
  });

  it("creates BTTS bets in bankroll 20", () => {
    expect(BANKROLL_BY_TYPE.BTTS).toBe(20);
  });

  it("creates 1X && Over bets in bankroll 21", () => {
    expect(BANKROLL_BY_TYPE["1X && Over"]).toBe(21);
  });

  it("highlights BTTS predictions from 70% confidence", () => {
    expect(HIGHLIGHT_THRESHOLD.BTTS).toBe(0.7);
  });

  it("highlights 1X && Over predictions from 45% confidence", () => {
    expect(HIGHLIGHT_THRESHOLD["1X && Over"]).toBe(0.45);
  });
});
