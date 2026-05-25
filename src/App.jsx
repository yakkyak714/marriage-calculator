// ─── App.jsx ───────────────────────────────────────────────────
// Root component. Owns all top-level state and decides which
// screen to show: Setup → Game → Round → back to Game.
//
// This file should stay small — it only manages state and routing.
// All UI lives in the components/ folder.
// ───────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

// Screens (components)
import Setup from "./components/Setup";
import Game  from "./components/Game";
import Round from "./components/Round";

// Utilities
import { saveData, loadData } from "./utils/storage";
import { uid }                from "./utils/constants";

// Global styles
import "./styles/index.css";

export default function App() {
  // ── State ─────────────────────────────────────────────────
  const [screen,     setScreen]     = useState("setup");  // "setup" | "game" | "round"
  const [players,    setPlayers]    = useState([]);        // [{ id, name }]
  const [savedNames, setSavedNames] = useState([]);        // names remembered for next session
  const [rounds,     setRounds]     = useState([]);        // all completed rounds
  const [totals,     setTotals]     = useState({});        // { playerId: cumulativeScore }
  const [loaded,     setLoaded]     = useState(false);     // prevents saving before loading

  // ── Load saved game on first render ───────────────────────
  useEffect(() => {
    const saved = loadData();
    if (saved) {
      setSavedNames(saved.savedNames || []);
      // Resume an in-progress game if one was saved
      if (saved.screen === "game" && saved.players?.length) {
        setPlayers(saved.players);
        setRounds(saved.rounds   || []);
        setTotals(saved.totals   || {});
        setScreen("game");
      }
    }
    setLoaded(true); // safe to start auto-saving now
  }, []);

  // ── Auto-save whenever state changes ──────────────────────
  // Only runs after the initial load to avoid overwriting saved data
  useEffect(() => {
    if (!loaded) return;
    saveData({ screen, players, savedNames, rounds, totals });
  }, [screen, players, savedNames, rounds, totals, loaded]);

  // ── Handlers passed down to child components ──────────────

  /** Called by Setup when the user taps "Start Calculator" */
  const handleStartGame = (newPlayers) => {
    // Build a fresh totals map with 0 for each player
    const freshTotals = Object.fromEntries(newPlayers.map(p => [p.id, 0]));
    setPlayers(newPlayers);
    setSavedNames(newPlayers.map(p => p.name)); // remember names for next time
    setRounds([]);
    setTotals(freshTotals);
    setScreen("game");
  };

  /** Called by Round when a round is confirmed */
  const handleAddRound = (round, deltas) => {
    setRounds(prev => [...prev, round]);
    // Add this round's deltas on top of existing totals
    setTotals(prev => {
      const next = { ...prev };
      Object.entries(deltas).forEach(([id, delta]) => {
        next[id] = (next[id] || 0) + delta;
      });
      return next;
    });
    setScreen("game");
  };

  /** Called by Game when the user confirms "End Calculator" */
  const handleEndGame = () => {
    // Clear scores but keep player names for the setup screen
    setPlayers([]);
    setRounds([]);
    setTotals({});
    setScreen("setup");
  };

  // ── Loading screen ────────────────────────────────────────
  // Shown briefly while localStorage is being read
  if (!loaded) {
    return (
      <div className="loading-screen">
        <span>🃏</span>
      </div>
    );
  }

  // ── Screen routing ────────────────────────────────────────
  if (screen === "setup") {
    return (
      <Setup
        savedNames={savedNames}
        onStart={handleStartGame}
      />
    );
  }

  if (screen === "round") {
    return (
      <Round
        players={players}
        roundNum={rounds.length + 1}
        onConfirm={handleAddRound}
        onBack={() => setScreen("game")}
      />
    );
  }

  // Default: "game" screen
  return (
    <Game
      players={players}
      rounds={rounds}
      totals={totals}
      onNewRound={() => setScreen("round")}
      onEnd={handleEndGame}
    />
  );
}