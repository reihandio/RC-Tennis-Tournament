/**
 * Fisher-Yates shuffle (returns new array).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate unique round-robin pairings for singles.
 * Uses the fixed-circle algorithm. For n players, max = n*(n-1)/2 matches.
 *
 * @param {Array<{id: string, name: string}>} players
 * @param {number} [targetCount] - desired match count (default: all possible)
 * @returns {Array} matches in unified format
 */
export function generateRoundRobin(players, targetCount) {
  const n = players.length;
  if (n < 2) return [];

  const participants = players.map((p) => ({ ...p }));
  const allPairings = [];

  if (n % 2 === 0) {
    const fixed = participants[0];
    const rotating = participants.slice(1);
    const numRounds = n - 1;
    for (let round = 0; round < numRounds; round++) {
      allPairings.push({ p1: fixed, p2: rotating[0] });
      for (let i = 1; i < rotating.length / 2; i++) {
        allPairings.push({ p1: rotating[i], p2: rotating[rotating.length - i] });
      }
      rotating.unshift(rotating.pop());
    }
  } else {
    const numRounds = n;
    let rotating = [...participants];
    for (let round = 0; round < numRounds; round++) {
      for (let i = 1; i <= Math.floor(rotating.length / 2); i++) {
        allPairings.push({ p1: rotating[i], p2: rotating[rotating.length - i] });
      }
      rotating = [rotating[0], ...rotating.slice(2), rotating[1]];
    }
  }

  const maxMatches = allPairings.length;
  const count = targetCount && targetCount > 0 ? Math.min(targetCount, maxMatches) : maxMatches;

  // If we need fewer than max, pick a fair subset:
  // take matches in round-robin order (already balanced), with a shuffle
  // to avoid always taking the first N
  if (count < maxMatches) {
    // Shuffle then take `count`, which naturally distributes across rounds
    const shuffled = shuffle(allPairings.map((p, i) => ({ ...p, _origIdx: i })));
    const selected = shuffled.slice(0, count);
    return selected.map(({ p1, p2 }, idx) => ({
      id: `match-${idx + 1}`,
      team1PlayerIds: [p1.id],
      team2PlayerIds: [p2.id],
      team1Score: '',
      team2Score: '',
      winnerId: null,
    }));
  }

  return allPairings.map(({ p1, p2 }, idx) => ({
    id: `match-${idx + 1}`,
    team1PlayerIds: [p1.id],
    team2PlayerIds: [p2.id],
    team1Score: '',
    team2Score: '',
    winnerId: null,
  }));
}

/**
 * Generate social/rotating doubles matches.
 * Each match: (P_A & P_B) vs (P_C & P_D) with rotating partners.
 *
 * @param {Array<{id: string, name: string}>} players
 * @param {number} [targetCount] - desired number of matches
 * @returns {Array} matches in unified format
 */
export function generateSocialDoubles(players, targetCount) {
  const n = players.length;
  if (n < 4) return [];

  const maxPerRound = Math.floor(n / 4);
  const maxRounds = Math.max(n, 4);
  const maxPossible = maxRounds * maxPerRound;

  const count = targetCount && targetCount > 0 ? Math.min(targetCount, maxPossible) : maxPossible;

  const playCount = {};
  const partnerHistory = {}; // "idA-idB" -> count (sorted to normalize)
  players.forEach((p) => { playCount[p.id] = 0; });

  function partnerKey(a, b) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }

  const allMatches = [];
  let matchId = 1;
  let safety = 0;

  while (allMatches.length < count && safety < count * 4) {
    safety++;

    // Sort by play count (least played first), then shuffle within same count
    const sorted = [...players].sort((a, b) => {
      const diff = (playCount[a.id] || 0) - (playCount[b.id] || 0);
      if (diff !== 0) return diff;
      return Math.random() - 0.5;
    });

    // Take first 4 players for this match
    const group4 = sorted.slice(0, 4);

    // Find best pairing: try a few shuffles, pick the one with least-repeated partnerships
    let bestPairing = null;
    let bestRepeatScore = Infinity;

    for (let attempt = 0; attempt < 8; attempt++) {
      const shuf = shuffle(group4);
      const t1 = [shuf[0].id, shuf[1].id];
      const t2 = [shuf[2].id, shuf[3].id];
      const key1 = partnerKey(t1[0], t1[1]);
      const key2 = partnerKey(t2[0], t2[1]);
      const score = (partnerHistory[key1] || 0) + (partnerHistory[key2] || 0);

      if (score < bestRepeatScore) {
        bestRepeatScore = score;
        bestPairing = { t1, t2 };
      }
    }

    const { t1, t2 } = bestPairing;

    // Track partnerships
    partnerHistory[partnerKey(t1[0], t1[1])] = (partnerHistory[partnerKey(t1[0], t1[1])] || 0) + 1;
    partnerHistory[partnerKey(t2[0], t2[1])] = (partnerHistory[partnerKey(t2[0], t2[1])] || 0) + 1;

    // Update play counts
    [...t1, ...t2].forEach((pid) => {
      playCount[pid] = (playCount[pid] || 0) + 1;
    });

    allMatches.push({
      id: `match-${matchId++}`,
      team1PlayerIds: t1,
      team2PlayerIds: t2,
      team1Score: '',
      team2Score: '',
      winnerId: null,
    });
  }

  return allMatches;
}
