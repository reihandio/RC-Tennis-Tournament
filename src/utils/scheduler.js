/**
 * Multi-court scheduling utilities.
 *
 * A schedule is a list of matches grouped by `round`. Matches in the same round
 * are played simultaneously, one per court, so no player may appear twice in a
 * round and no court may be used twice in a round.
 */

export const MIN_COURTS = 1;
export const MAX_COURTS = 4;
const MAX_GENERATION_ATTEMPTS = 6;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function clampCourtCount(value) {
  return clampInt(value, MIN_COURTS, MAX_COURTS, MIN_COURTS);
}

export function clampRound(value) {
  return clampInt(value, 1, Number.MAX_SAFE_INTEGER, 1);
}

export function clampCourt(value) {
  return clampInt(value, MIN_COURTS, MAX_COURTS, MIN_COURTS);
}

/**
 * Number of participant entries required for one match.
 * In Fixed mode each participant entry is already a pair, so a match needs
 * two entries. In randomized doubles a match needs four individual players.
 */
export function getPlayersPerMatch(matchType, doublesSubMode) {
  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  return matchType === 'doubles' && !isFixedDoubles ? 4 : 2;
}

export function getEffectiveCourtCount(courtCount, participantCount, matchType, doublesSubMode) {
  const requested = clampCourtCount(courtCount);
  const perMatch = getPlayersPerMatch(matchType, doublesSubMode);
  return Math.min(requested, Math.max(0, Math.floor(participantCount / perMatch)));
}

/**
 * Upper bound of matches supported by the existing formats.
 */
export function maxMatchesFor(participantCount, matchType, doublesSubMode) {
  if (participantCount < getPlayersPerMatch(matchType, doublesSubMode)) return 0;
  if (matchType === 'doubles' && doublesSubMode !== 'fixed') {
    return Math.max(participantCount, 4) * Math.floor(participantCount / 4);
  }
  return (participantCount * (participantCount - 1)) / 2;
}

export function getMatchRound(match, index = 0) {
  const round = parseInt(match?.round, 10);
  return Number.isFinite(round) && round >= 1 ? round : index + 1;
}

export function getMatchCourt(match) {
  return clampCourt(match?.court);
}

/**
 * Fill missing `round`/`court` values for data created before multi-court
 * support: round = index + 1 and court = 1.
 */
export function normalizeMatches(matches) {
  if (!Array.isArray(matches)) return [];
  return matches.map((match, index) => ({
    ...match,
    round: getMatchRound(match, index),
    court: getMatchCourt(match),
  }));
}

function playerIdsOf(match) {
  return [...(match.team1PlayerIds || []), ...(match.team2PlayerIds || [])];
}

/**
 * Validate that a schedule has no player/court clashes within any round.
 */
export function validateSchedule(matches) {
  if (!Array.isArray(matches)) return { valid: true, errors: [] };

  const errors = [];
  const playersByRound = new Map();
  const courtsByRound = new Map();

  matches.forEach((match, index) => {
    const round = getMatchRound(match, index);
    const court = getMatchCourt(match);

    if (!playersByRound.has(round)) playersByRound.set(round, new Map());
    if (!courtsByRound.has(round)) courtsByRound.set(round, new Map());

    const seenPlayers = playersByRound.get(round);
    const seenCourts = courtsByRound.get(round);

    playerIdsOf(match).forEach((pid) => {
      if (!pid) return;
      if (seenPlayers.has(pid)) {
        errors.push(
          `Player conflict in Round ${round}: a player appears in more than one match.`
        );
      } else {
        seenPlayers.set(pid, match.id);
      }
    });

    if (seenCourts.has(court)) {
      errors.push(`Court conflict in Round ${round}: Court ${court} is used twice.`);
    } else {
      seenCourts.set(court, match.id);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Check a match being edited/added against every other match in the same round.
 *
 * @param {Array} matches - all current matches
 * @param {string|null} matchId - id of the match being edited (excluded)
 * @param {{round:number|string, court:number|string, team1PlayerIds:string[], team2PlayerIds:string[]}} candidate
 * @param {Array<{id:string,name:string}>} players
 * @returns {{valid:boolean, error:string|null, type:'player'|'court'|null}}
 */
export function findMatchConflict(matches, matchId, candidate, players = []) {
  const round = clampRound(candidate?.round);
  const court = clampCourt(candidate?.court);
  const candidateIds = new Set([
    ...(candidate?.team1PlayerIds || []),
    ...(candidate?.team2PlayerIds || []),
  ]);
  const nameOf = (id) => players.find((p) => p.id === id)?.name || 'A selected player';

  for (let i = 0; i < (matches || []).length; i++) {
    const match = matches[i];
    if (match.id === matchId) continue;
    if (getMatchRound(match, i) !== round) continue;

    const existingIds = playerIdsOf(match);
    const clashingId = existingIds.find((id) => candidateIds.has(id));
    if (clashingId) {
      return {
        valid: false,
        type: 'player',
        error: `${nameOf(clashingId)} is already playing in Round ${round} (Court ${getMatchCourt(match)}).`,
      };
    }

    if (getMatchCourt(match) === court) {
      return {
        valid: false,
        type: 'court',
        error: `Court ${court} is already used in Round ${round}.`,
      };
    }
  }

  return { valid: true, error: null, type: null };
}

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function bump(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function matchupKey(t1, t2, isDoubles) {
  if (isDoubles) {
    return [pairKey(t1[0], t1[1]), pairKey(t2[0], t2[1])].sort().join('::');
  }
  return pairKey(t1[0], t2[0]);
}

function doubleScore(t1, t2, history) {
  const partnerA = pairKey(t1[0], t1[1]);
  const partnerB = pairKey(t2[0], t2[1]);
  let score =
    (history.partners.get(partnerA) || 0) * 10 +
    (history.partners.get(partnerB) || 0) * 10;

  for (const a of t1) {
    for (const b of t2) {
      score += (history.opponents.get(pairKey(a, b)) || 0) * 3;
    }
  }

  score += (history.matchups.get(matchupKey(t1, t2, true)) || 0) * 30;
  return score;
}

function singlesScore(a, b, history) {
  const key = pairKey(a, b);
  return (
    (history.opponents.get(key) || 0) * 8 +
    (history.matchups.get(key) || 0) * 30
  );
}

function bestPairingForGroup(group, history) {
  const [a, b, c, d] = group;
  const options = [
    { t1: [a, b], t2: [c, d] },
    { t1: [a, c], t2: [b, d] },
    { t1: [a, d], t2: [b, c] },
  ];

  let best = options[0];
  let bestScore = doubleScore(best.t1, best.t2, history);
  for (let i = 1; i < options.length; i++) {
    const score = doubleScore(options[i].t1, options[i].t2, history);
    if (score < bestScore) {
      best = options[i];
      bestScore = score;
    }
  }
  return { ...best, score: bestScore };
}

function buildDoublesRound(selected, matchCount, history) {
  const playerIds = selected.map((p) => p.id);
  const attempts = Math.max(40, matchCount * 25);
  let bestRound = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const shuffled = shuffle(playerIds);
    const pairings = [];
    let total = 0;

    for (let i = 0; i < matchCount; i++) {
      const group = shuffled.slice(i * 4, i * 4 + 4);
      const pairing = bestPairingForGroup(group, history);
      total += pairing.score;
      pairings.push(pairing);
    }

    if (total < bestScore) {
      bestScore = total;
      bestRound = pairings;
    }
  }

  return bestRound || [];
}

function buildSinglesRound(selected, matchCount, history) {
  const playerIds = selected.map((p) => p.id);
  const attempts = Math.max(60, matchCount * 35);
  let bestRound = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const shuffled = shuffle(playerIds);
    const pairings = [];
    let total = 0;

    for (let i = 0; i < matchCount; i++) {
      const t1 = [shuffled[i * 2]];
      const t2 = [shuffled[i * 2 + 1]];
      total += singlesScore(t1[0], t2[0], history);
      pairings.push({ t1, t2 });
    }

    if (total < bestScore) {
      bestScore = total;
      bestRound = pairings;
    }
  }

  return bestRound || [];
}

function buildSchedule({ players, targetCount, effectiveCourts, matchType, doublesSubMode }) {
  const isRandomDoubles = matchType === 'doubles' && doublesSubMode !== 'fixed';
  const perMatch = getPlayersPerMatch(matchType, doublesSubMode);
  const stats = new Map(
    players.map((p) => [p.id, { played: 0, rest: 0 }])
  );
  const history = {
    partners: new Map(),
    opponents: new Map(),
    matchups: new Map(),
  };

  const matches = [];
  let remaining = targetCount;
  let round = 1;
  let matchId = 1;

  while (remaining > 0) {
    const matchesThisRound = Math.min(effectiveCourts, remaining);
    const slots = matchesThisRound * perMatch;

    // Fewest matches played first; rested players get priority on ties.
    const ordered = [...players].sort((a, b) => {
      const statsA = stats.get(a.id);
      const statsB = stats.get(b.id);
      if (statsA.played !== statsB.played) return statsA.played - statsB.played;
      if (statsA.rest !== statsB.rest) return statsB.rest - statsA.rest;
      return Math.random() - 0.5;
    });
    const selected = ordered.slice(0, slots);

    const pairings = isRandomDoubles
      ? buildDoublesRound(selected, matchesThisRound, history)
      : buildSinglesRound(selected, matchesThisRound, history);

    pairings.forEach((pairing, index) => {
      const { t1, t2 } = pairing;
      matches.push({
        id: `match-${matchId++}`,
        team1PlayerIds: [...t1],
        team2PlayerIds: [...t2],
        team1Score: '',
        team2Score: '',
        winnerId: null,
        round,
        court: index + 1,
      });

      if (isRandomDoubles) {
        bump(history.partners, pairKey(t1[0], t1[1]));
        bump(history.partners, pairKey(t2[0], t2[1]));
        for (const a of t1) {
          for (const b of t2) bump(history.opponents, pairKey(a, b));
        }
      } else {
        bump(history.opponents, pairKey(t1[0], t2[0]));
      }
      bump(history.matchups, matchupKey(t1, t2, isRandomDoubles));

      [...t1, ...t2].forEach((pid) => {
        const stat = stats.get(pid);
        if (stat) stat.played += 1;
      });
    });

    const playingIds = new Set(selected.map((p) => p.id));
    players.forEach((p) => {
      if (!playingIds.has(p.id)) {
        const stat = stats.get(p.id);
        if (stat) stat.rest += 1;
      }
    });

    remaining -= matchesThisRound;
    round += 1;
  }

  return { matches, rounds: round - 1 };
}

/**
 * Generate a conflict-free round-based schedule.
 */
export function generateSchedule({
  players,
  matchCount,
  courtCount = 1,
  matchType = 'singles',
  doublesSubMode = 'randomized',
}) {
  const participantCount = players.length;
  const requestedCourts = clampCourtCount(courtCount);
  const effectiveCourts = getEffectiveCourtCount(
    requestedCourts,
    participantCount,
    matchType,
    doublesSubMode
  );
  const perMatch = getPlayersPerMatch(matchType, doublesSubMode);

  if (effectiveCourts < 1) {
    return {
      matches: [],
      rounds: 0,
      requestedCourts,
      effectiveCourts: 0,
      error: `Not enough participants to fill one court. ${perMatch} participants are needed per match.`,
    };
  }

  const maxMatches = maxMatchesFor(participantCount, matchType, doublesSubMode);
  const requestedMatches =
    matchCount && matchCount > 0 ? Math.floor(matchCount) : maxMatches;
  // Honor the requested match count exactly. When the request exceeds the
  // number of unique match-ups, the variety rules are relaxed (matches repeat)
  // but the no-clash constraint is still enforced per round.
  const targetCount = Math.max(1, requestedMatches);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const schedule = buildSchedule({
      players,
      targetCount,
      effectiveCourts,
      matchType,
      doublesSubMode,
    });

    if (validateSchedule(schedule.matches).valid) {
      return {
        ...schedule,
        requestedCourts,
        effectiveCourts,
        error: null,
      };
    }
  }

  return {
    matches: [],
    rounds: 0,
    requestedCourts,
    effectiveCourts,
    error: 'Could not generate a schedule without player or court clashes. Please try again.',
  };
}
