// ─── ScoreTab.jsx ──────────────────────────────────────────────
// Displays a row-and-column scoreboard table.
// Each row = one round. Each column = one player.
// Shows role badge (W/S/U) and maal per cell.
// Bold TOTAL row at the bottom.
// ───────────────────────────────────────────────────────────────

/**
 * @param {Array}  players - [{ id, name }]
 * @param {Object} totals  - { playerId: cumulativeScore }
 * @param {Array}  rounds  - All completed round objects
 */
export default function ScoreTab({ players, totals, rounds }) {
  // Show empty state if no rounds have been played yet
  if (!rounds.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">♠️ ♥️ ♣️ ♦️</div>
        <p>No rounds yet</p>
        <p className="empty-sub">Tap <span className="text-gold">+ Round</span> to begin</p>
      </div>
    );
  }

  return (
    // Horizontal scroll wrapper handles narrow screens with many players
    <div className="table-scroll">
      <table className="score-table">

        {/* ── Column headers — one per player ─────────── */}
        <thead>
          <tr>
            {/* Left column: round info */}
            <th className="th-round">Round</th>
            {players.map(p => (
              <th key={p.id} className="th-player">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── One row per round ────────────────────────── */}
        <tbody>
          {rounds.map((round, i) => {
            // Find winner's name for the round label
            const winner = players.find(p => p.id === round.winnerId);
            return (
              <tr key={round.id}>
                {/* Round number + winner label */}
                <td className="td-round">
                  <div className="round-num">R{i + 1}</div>
                  <div className="round-winner">🏆 {winner?.name.slice(0, 6)}</div>
                </td>

                {/* One cell per player showing their delta + role */}
                {players.map(p => {
                  const isWinner = p.id === round.winnerId;
                  const isUnseen = (round.unseenIds || []).includes(p.id);
                  const delta    = round.deltas?.[p.id] ?? 0;
                  const maal     = round.maals?.[p.id];
                  const isDubli    = (round.dubliIds  || []).includes(p.id);
                  const isDubliWin = isWinner && round.isDubliWin;

                  // Role abbreviation: W = Winner, S = Seen, U = Unseen
                  const roleLabel = isWinner  ? (isDubliWin ? "WD" : "W")
                                      : isUnseen  ? "U"
                                      : isDubli   ? "D"
                                      : "S";
                  const roleClass = isWinner ? "gold" : isUnseen ? "red" : isDubli ? "dubli" : "blue";

                  return (
                    <td key={p.id} className="td-player">
                      {/* Point change for this round */}
                      <div className={`delta ${delta > 0 ? "positive" : delta < 0 ? "negative" : "zero"}`}>
                        {delta > 0 ? "+" : ""}{delta}
                      </div>
                      {/* Role badge + maal underneath the score */}
                      <div className="cell-meta">
                        <span className={`role-badge ${roleClass}`}>{roleLabel}</span>
                        {/* Only show maal for seen/winner players */}
                        {!isUnseen && maal !== undefined && (
                          <span className="cell-maal">{maal}m</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>

        {/* ── Total row at the bottom ──────────────────── */}
        <tfoot>
          <tr className="total-row">
            <td className="td-total-label">TOTAL</td>
            {players.map(p => {
              const total = totals[p.id] || 0;
              return (
                <td key={p.id} className="td-total">
                  <span className={`total-score ${total > 0 ? "positive" : total < 0 ? "negative" : "zero"}`}>
                    {total > 0 ? "+" : ""}{total}
                  </span>
                </td>
              );
            })}
          </tr>
        </tfoot>

      </table>
    </div>
  );
}