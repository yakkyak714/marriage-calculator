// ─── HistoryTab.jsx ────────────────────────────────────────────
// Shows a collapsible list of all rounds in reverse order
// (most recent round at the top).
// Tap any round to expand it and see the full breakdown.
// ───────────────────────────────────────────────────────────────

import { useState } from "react";

/**
 * @param {Array} players - [{ id, name }]
 * @param {Array} rounds  - All completed round objects
 */
export default function HistoryTab({ players, rounds }) {
  // Tracks which round card is currently expanded (stores round.id or null)
  const [expandedId, setExpandedId] = useState(null);

  // Quick lookup: playerId → player object
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]));

  // Show empty state if no rounds played yet
  if (!rounds.length) {
    return (
      <div className="empty-state">
        <p>Round history will appear here</p>
      </div>
    );
  }

  // Reverse so most recent round appears at the top
  const reversed = [...rounds].reverse();

  return (
    <div className="history-list">
      {reversed.map((round, ri) => {
        // Display number counts from the original order (oldest = 1)
        const displayNum = rounds.length - ri;
        const winner     = playerMap[round.winnerId];
        const isExpanded = expandedId === round.id;

        // Toggle expanded state for this round
        const handleToggle = () =>
          setExpandedId(isExpanded ? null : round.id);

        return (
          <div key={round.id} className="history-card">

            {/* ── Collapsed header row ─────────────────── */}
            <button className="history-header" onClick={handleToggle}>
              <div className="history-header-left">
                {/* Round number badge */}
                <div className="round-badge">{displayNum}</div>
                <div>
                  <div className="history-winner">🏆 {winner?.name}</div>
                  <div className="history-meta">
                    {(round.seenIds || []).filter(id => id !== round.winnerId).length} seen
                    {" · "}
                    {(round.unseenIds || []).length} unseen
                  </div>
                </div>
              </div>
              {/* Chevron toggles direction when expanded */}
              <span className="history-chevron">{isExpanded ? "▲" : "▼"}</span>
            </button>

            {/* ── Expanded detail rows ──────────────────── */}
            {isExpanded && (
              <div className="history-detail">
                {players.map(p => {
                  const delta    = round.deltas?.[p.id] ?? 0;
                  const isWinner = p.id === round.winnerId;
                  const isUnseen = (round.unseenIds || []).includes(p.id);
                  const maal     = round.maals?.[p.id];
                  const roleClass = isWinner ? "gold" : isUnseen ? "red" : "blue";

                  return (
                    <div key={p.id} className="history-row">
                      {/* Role badge + player name + maal */}
                      <div className="history-row-left">
                        <span className={`role-badge ${roleClass}`}>
                          {isWinner ? "Winner" : isUnseen ? "Unseen" : "Seen"}
                        </span>
                        <span className="history-player-name">{p.name}</span>
                        {/* Only show maal for seen + winner */}
                        {!isUnseen && maal !== undefined && (
                          <span className="history-maal">({maal} maal)</span>
                        )}
                      </div>
                      {/* Point delta for this round */}
                      <span className={`delta ${delta > 0 ? "positive" : delta < 0 ? "negative" : "zero"}`}>
                        {delta > 0 ? "+" : ""}{delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}