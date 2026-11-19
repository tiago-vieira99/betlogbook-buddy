// Numeric range filter used by the Streaks page (position / current neg streak).

export type NumFilter = { min: string; max: string };

export const EMPTY_FILTER: NumFilter = { min: "", max: "" };

function toNumber(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Empty bounds are ignored; a value must sit inside [min, max] when both are set. */
export function matchesFilter(value: number, f: NumFilter): boolean {
  const min = toNumber(f.min);
  const max = toNumber(f.max);
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

export function hasFilter(f: NumFilter): boolean {
  return toNumber(f.min) !== null || toNumber(f.max) !== null;
}
