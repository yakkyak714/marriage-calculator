// ─── Unique ID generator ───────────────────────────────────────
// Generates a short random string used as player/round IDs
export const uid = () => Math.random().toString(36).slice(2, 9);

// ─── localStorage key ──────────────────────────────────────────
// All game data is saved under this single key
export const STORAGE_KEY = "marriage_v1";

// ─── Money denominations ───────────────────────────────────────
// Used in the Money tab to convert points → dollars
export const DENOMS = [
  { label: "¢25", val: 0.25 },
  { label: "¢50", val: 0.50 },
  { label: "$1",  val: 1.00 },
  { label: "$5",  val: 5.00 },
];

// ─── Initial app state ─────────────────────────────────────────
// Used when starting fresh (no saved game)
export const INITIAL_STATE = {
  screen:     "setup",
  players:    [],
  savedNames: [],
  rounds:     [],
  totals:     {},
};