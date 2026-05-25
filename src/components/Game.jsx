// ─── Game.jsx ──────────────────────────────────────────────────
// Main game screen shown after Setup.
// Renders the header, tab navigation, and the active tab content.
// Also handles the "End Calculator" confirmation modal.
// ───────────────────────────────────────────────────────────────

import { useState } from "react";

// The three tab views
import ScoreTab   from "./tabs/ScoreTab";
import HistoryTab from "./tabs/HistoryTab";
import MoneyTab   from "./tabs/MoneyTab";

/**
 * @param {Array}    players    - [{ id, name }]
 * @param {Array}    rounds     - All completed round objects
 * @param {Object}   totals     - { playerId: cumulativeScore }
 * @param {Function} onNewRound - Switches screen to Round entry
 * @param {Function} onEnd      - Ends the game and returns to Setup
 */
export default function Game({ players, rounds, totals, onNewRound, onEnd }) {
  // Which tab is currently visible: "score" | "history" | "money"
  const [activeTab, setActiveTab] = useState("score");

  // Controls visibility of the "End Calculator?" confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);

  // Money tab state lives here so it persists when switching tabs
  const [denom,  setDenom]  = useState(0.25); // selected denomination button
  const [custom, setCustom] = useState("");    // custom dollar value input

  // The effective denomination: custom input takes priority over button selection
  const effDenom = custom ? (parseFloat(custom) || 0) : denom;

  // Sort players by score descending for display purposes
  const sortedPlayers = [...players].sort(
    (a, b) => (totals[b.id] || 0) - (totals[a.id] || 0)
  );

  // Tab config — label shown in the tab bar
  const TABS = [
    { key: "score",   label: "Scoreboard" },
    { key: "history", label: "History"    },
    { key: "money",   label: "Money 💰"   },
  ];

  return (
    <div className="game-screen">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="game-header">
        <div className="game-header-info">
          <div className="game-title">Marriage Calculator </div>
               <div className="game-title">♠️ ♥️ ♣️ ♦️</div>
          <div className="game-meta">
            {rounds.length} round{rounds.length !== 1 ? "s" : ""} · {players.length} players
          </div>
        </div>
        <div className="game-header-actions">
          {/* Opens the Round entry screen */}
          <button className="btn-primary btn-sm" onClick={onNewRound}>
            + Round
          </button>
          {/* Shows the end-game confirmation modal */}
          <button className="btn-ghost btn-sm" onClick={() => setShowConfirm(true)}>
            End
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────── */}
      <div className="tab-bar">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      <div className="tab-content">
        {activeTab === "score" && (
          <ScoreTab
            players={players}
            totals={totals}
            rounds={rounds}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab
            players={players}
            rounds={rounds}
          />
        )}
        {activeTab === "money" && (
          <MoneyTab
            players={sortedPlayers}
            totals={totals}
            rounds={rounds}
            effDenom={effDenom}
            denom={denom}
            setDenom={setDenom}
            custom={custom}
            setCustom={setCustom}
          />
        )}
      </div>

      {/* ── End Game Confirmation Modal ───────────────────── */}
      {showConfirm && (
        // Dark backdrop — clicking it dismisses the modal
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          {/* Stop clicks inside the modal from closing it */}
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">End Calculator?</h2>
            <p className="modal-body">
              All scores and rounds will be cleared.
              Player names will be remembered for next time.
            </p>
            <div className="modal-actions">
              <button
                className="btn-ghost btn-full"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger btn-full"
                onClick={onEnd}
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}