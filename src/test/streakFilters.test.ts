import { describe, it, expect } from "vitest";
import { matchesFilter, hasFilter, EMPTY_FILTER } from "@/utils/streakFilters";

describe("streak range filters", () => {
  it("keeps every value when both bounds are empty", () => {
    expect(matchesFilter(3, EMPTY_FILTER)).toBe(true);
    expect(matchesFilter(99, EMPTY_FILTER)).toBe(true);
    expect(hasFilter(EMPTY_FILTER)).toBe(false);
  });

  it("applies the position lower bound only", () => {
    expect(matchesFilter(3, { min: "5", max: "" })).toBe(false);
    expect(matchesFilter(5, { min: "5", max: "" })).toBe(true);
    expect(matchesFilter(18, { min: "5", max: "" })).toBe(true);
  });

  it("applies both position bounds inclusively", () => {
    expect(matchesFilter(4, { min: "5", max: "15" })).toBe(false);
    expect(matchesFilter(5, { min: "5", max: "15" })).toBe(true);
    expect(matchesFilter(15, { min: "5", max: "15" })).toBe(true);
    expect(matchesFilter(16, { min: "5", max: "15" })).toBe(false);
  });

  it("applies the current neg streak lower bound", () => {
    expect(matchesFilter(2, { min: "5", max: "" })).toBe(false);
    expect(matchesFilter(9, { min: "5", max: "" })).toBe(true);
  });

  it("reports a filter as active only when a bound is filled in", () => {
    expect(hasFilter({ min: "", max: "10" })).toBe(true);
    expect(hasFilter({ min: "  ", max: "" })).toBe(false);
    expect(hasFilter({ min: "abc", max: "" })).toBe(false);
  });
});
