// ─── Setup.jsx ─────────────────────────────────────────────────
// First screen the user sees.
// Lets them choose how many players (3–5) and enter their names.
// Pre-fills names from the last session if they exist.
// ───────────────────────────────────────────────────────────────

import { useState } from "react";
import { uid }      from "../utils/constants";

/**
 * @param {string[]} savedNames - Names from the previous session (may be empty)
 * @param {Function} onStart    - Called with an array of player objects when ready
 */
export default function Setup({ savedNames, onStart }) {
  // Default player count: match saved count, or fall back to 3
  const [count, setCount] = useState(
    Math.min(5, Math.max(3, savedNames.length || 3)) 
  );

  // Pre-fill name inputs with saved names; empty string for any new slots
  const [names, setNames] = useState(
    Array(5).fill("").map((_, i) => savedNames[i] || "")
  );

  /** Update a single name field without touching the others */
  const handleNameChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  /** Build player objects and hand off to App.jsx */
  const handleStart = () => {
    const players = names.slice(0, count).map((name, i) => ({
      id:   uid(),                            // unique ID for this player
      name: name.trim() || `Player ${i + 1}`, // fallback if name left blank
    }));
    onStart(players);
  };

  return (
    <div className="screen-center">
      <div className="setup-container">

        {/* ── Logo / Title ─────────────────────────────── */}
        <div className="setup-header">
          <div className="setup-logo">♠️ ♥️ ♣️ ♦️</div>
          <h1 className="setup-title">Marriage Calculator</h1>
          <p className="setup-subtitle">Score Calculator</p>
        </div>

        {/* ── Card ─────────────────────────────────────── */}
        <div className="card">

          {/* Player count selector */}
          <label className="field-label">Number of players</label>
          <div className="btn-group">
            {[3, 4, 5, 6].map(n => (
              <button
                key={n}
                className={`btn-count ${count === n ? "active" : ""}`}
                onClick={() => setCount(n)}
              >
                {n} Players
              </button>
            ))}
          </div>

          {/* Name inputs — only show slots for selected count */}
          <label className="field-label" style={{ marginTop: 20 }}>Player names</label>
          <div className="name-inputs">
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="name-row">
                {/* Number badge */}
                <div className="name-badge">{i + 1}</div>
                <input
                  className="name-input"
                  value={names[i]}
                  placeholder={`Player ${i + 1}`}
                  onChange={e => handleNameChange(i, e.target.value)}
                  // Allow pressing Enter to move to the next field
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const next = document.querySelectorAll(".name-input")[i + 1];
                      if (next) next.focus();
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Start button */}
          <button className="btn-primary" onClick={handleStart}>
            Start Calculator
          </button>

          {/* Subtle hint if names were remembered */}
          {savedNames.length > 0 && (
            <p className="setup-hint">Names remembered from last session</p>
          )}
        </div>

      </div>
    </div>
  );
}