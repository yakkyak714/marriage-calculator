// ─── MoneyTab.jsx ──────────────────────────────────────────────
// Converts points to money.
// User picks a denomination (¢25 / ¢50 / $1 / $5) or types a custom value.
// Shows a table identical to ScoreTab but with dollar amounts.
// ───────────────────────────────────────────────────────────────

import { DENOMS } from "../../utils/constants";

/**
 * @param {Array}    players   - Sorted [{ id, name }] (highest score first)
 * @param {Object}   totals    - { playerId: cumulativeScore }
 * @param {Array}    rounds    - All completed round objects
 * @param {number}   effDenom  - The active dollar value per point
 * @param {number}   denom     - Selected denomination button value
 * @param {Function} setDenom  - Updates selected denomination
 * @param {string}   custom    - Custom input value (string, may be empty)
 * @param {Function} setCustom - Updates custom input value
 */
export default function MoneyTab({
  players, totals, rounds,
  effDenom, denom, setDenom, custom, setCustom,
}) {
  /**
   * Format a point value as a dollar string.
   * e.g. formatMoney(15, 0.25) → "+$3.75"
   *      formatMoney(-8, 1)    → "-$8.00"
   */
  const formatMoney = (points) => {
    const abs = Math.abs(points * effDenom).toFixed(2);
    if (points > 0) return `+$${abs}`;
    if (points < 0) return `-$${abs}`;
    return `$0.00`;
  };

  return (
    <div>
      {/* ── Denomination selector ────────────────────── */}
      <div className="denom-section">
        <label className="field-label">1 point equals</label>
        <div className="denom-row">
          {/* Preset denomination buttons */}
          {DENOMS.map(d => (
            <button
              key={d.val}
              // Deselect if custom is active — only highlight when no custom value
              className={`btn-denom ${denom === d.val && !custom ? "active" : ""}`}
              onClick={() => { setDenom(d.val); setCustom(""); }}
            >
              {d.label}
            </button>
          ))}
          {/* Custom value input — clears the preset selection */}
          <input
            type="number"
            step="0.01"
            min="0"
            className="denom-input"
            value={custom}
            placeholder="Custom $"
            onChange={e => setCustom(e.target.value)}
          />
        </div>
      </div>

      {/* ── Empty state ──────────────────────────────── */}
      {!rounds.length ? (
        <div className="empty-state">
          <p>No rounds yet</p>
        </div>
      ) : (
        // ── Money table (same layout as ScoreTab) ─────
        <div className="table-scroll">
          <table className="score-table">

            {/* Column headers */}
            <thead>
              <tr>
                <th className="th-round">Round</th>
                {players.map(p => (
                  <th key={p.id} className="th-player">{p.name}</th>
                ))}
              </tr>
            </thead>

            {/* One row per round */}
            <tbody>
              {rounds.map((round, i) => {
                const winner = players.find(p => p.id === round.winnerId);
                return (
                  <tr key={round.id}>
                    <td className="td-round">
                      <div className="round-num">R{i + 1}</div>
                      <div className="round-winner">{winner?.name.slice(0, 6)}</div>
                    </td>
                    {players.map(p => {
                      const delta = round.deltas?.[p.id] ?? 0;
                      return (
                        <td key={p.id} className="td-player">
                          <div className={`delta ${delta > 0 ? "positive" : delta < 0 ? "negative" : "zero"}`}>
                            {formatMoney(delta)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Total row */}
            <tfoot>
              <tr className="total-row">
                <td className="td-total-label">TOTAL</td>
                {players.map(p => {
                  const total = totals[p.id] || 0;
                  return (
                    <td key={p.id} className="td-total">
                      <span className={`total-score ${total > 0 ? "positive" : total < 0 ? "negative" : "zero"}`}>
                        {formatMoney(total)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>

          </table>
        </div>
      )}
    </div>
  );
}