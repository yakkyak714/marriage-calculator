// ─── Storage Helpers ───────────────────────────────────────────
// Wraps localStorage so the rest of the app never touches it directly.
// If localStorage is unavailable (private browsing, storage full),
// the try/catch silently fails instead of crashing the app.
// ───────────────────────────────────────────────────────────────

import { STORAGE_KEY } from "./constants";

/**
 * Save the entire game state to localStorage.
 * Called automatically whenever state changes in App.jsx.
 *
 * @param {Object} data - The full game state object to persist
 */
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Storage might be full or disabled — fail silently
    console.warn("Could not save game data:", e);
  }
}

/**
 * Load the saved game state from localStorage.
 * Called once when the app first loads.
 *
 * @returns {Object|null} - The saved state, or null if nothing is saved
 */
export function loadData() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    // If nothing saved yet, return null so app starts fresh
    return value ? JSON.parse(value) : null;
  } catch (e) {
    // JSON might be corrupted — return null and start fresh
    console.warn("Could not load game data:", e);
    return null;
  }
}

/**
 * Clear all saved game data from localStorage.
 * Called when the user clicks "End Calculator" and confirms.
 */
export function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear game data:", e);
  }
}