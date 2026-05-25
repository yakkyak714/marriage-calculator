// ─── Marriage Card Game — Scoring Logic ────────────────────────
//
// Rules:
//   From each UNSEEN player:
//     → Winner receives:      10 + winner's maal
//     → Each Seen player gets: their own maal
//
//   Between WINNER and each SEEN player:
//     → Winner receives: 3 + winner's maal - seen's maal
//     → (negative = winner PAYS that seen player)
//
//   Between SEEN players (each pair):
//     → Each seen player receives their own maal from every other seen player
//     → Net between Si and Sj: Si gets (Si.maal - Sj.maal)
//
//   This is zero-sum — all deltas add up to 0.
// ───────────────────────────────────────────────────────────────

/**
 * Calculate point changes for one round.
 *
/**
 * Calculate point changes for one round.
 *
 * @param {string}   winnerId    - ID of the winning player
 * @param {Array}    seenList    - Array of { id, maal, isDubli } for winner + seen players
 * @param {string[]} unseenIds   - Array of IDs for unseen players
 * @param {boolean}  isDubliWin  - True if winner won via 8 pairs (rare) → extra 5 from everyone
 * @returns {Object} deltas      - Map of { playerId: pointChange }
 */
export function calcDeltas(winnerId, seenList, unseenIds, isDubliWin = false) {
  const winner = seenList.find(p => p.id === winnerId);
  const Mw     = winner?.maal ?? 0;
  const seen   = seenList.filter(p => p.id !== winnerId);
  const nU     = unseenIds.length;
  const deltas = {};

  // ── Base amount between winner and a seen player ────────────
  // Dubli seen → 0  (Dubli seen never pays the base 3, regardless of winner type)
  // Normal seen → 3
  const getBase = (seenIsDubli) => seenIsDubli ? 0 : 3;

  // ── Winner's delta ──────────────────────────────────────────
  // Gets (10 + Mw) from each unseen player
  // Gets (base + Mw - Ms) from each seen player (can be negative)
  let winnerDelta = nU * (10 + Mw);
  seen.forEach(s => { winnerDelta += getBase(s.isDubli) + Mw - s.maal; });
  deltas[winnerId] = winnerDelta;

  // ── Each seen player's delta ────────────────────────────────
  // Gets their own maal from each unseen player
  // Net from winner: (their maal - winner's maal - base)
  // Net from each other seen player: (their maal - other's maal)
  seen.forEach(si => {
    let d = nU * si.maal;                     // from unseen players
    d += si.maal - Mw - getBase(si.isDubli);  // net from winner
    seen.forEach(sj => {                      // net from other seen players
      if (sj.id !== si.id) d += si.maal - sj.maal;
    });
    deltas[si.id] = d;
  });

  // ── Each unseen player's delta ──────────────────────────────
  // Pays (10 + Mw) to winner + each seen player's maal
  const totalSeenMaal = seen.reduce((sum, p) => sum + p.maal, 0);
  unseenIds.forEach(id => {
    deltas[id] = -(10 + Mw + totalSeenMaal);
  });

  // ── Dubli Win bonus ─────────────────────────────────────────
  // Rare: winner won via 8 pairs → extra 5 from every other player
  // Dubli seen still pays this 5 (they're exempt from base 3, not this bonus)
  if (isDubliWin) {
    const others = [...seen.map(p => p.id), ...unseenIds];
    others.forEach(id => {
      deltas[id]      = (deltas[id]      || 0) - 5; // each player pays 5
      deltas[winnerId] = (deltas[winnerId] || 0) + 5; // winner gets 5 from each
    });
  }

  return deltas;
}