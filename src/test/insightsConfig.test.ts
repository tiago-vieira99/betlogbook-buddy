import { describe, expect, it } from "vitest";
import {
  BANKROLL_BY_TYPE,
  BET_TYPES,
  HIGHLIGHT_THRESHOLD,
} from "@/pages/InsightsPage";

describe("insights bet types", () => {
  it("offers MyStreaks as a bet type", () => {
    expect(BET_TYPES).toContain("MyStreaks");
  });

  it("creates MyStreaks bets in bankroll 23", () => {
    expect(BANKROLL_BY_TYPE.MyStreaks).toBe(23);
  });

  it("highlights MyStreaks predictions from 70% confidence", () => {
    expect(HIGHLIGHT_THRESHOLD.MyStreaks).toBe(0.7);
  });
});
