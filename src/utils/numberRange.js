export const MIN_NUMBER = 1;
export const MAX_NUMBER = 1000;
export function clampNumber(input, fallback = MIN_NUMBER) {
  const numeric = Number(input);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(MAX_NUMBER, Math.max(MIN_NUMBER, Math.trunc(numeric)));
}
export function normalizeRange(start, end) {
  const lower = clampNumber(start, MIN_NUMBER);
  return { start: lower, end: Math.max(lower, clampNumber(end, MAX_NUMBER)) };
}
