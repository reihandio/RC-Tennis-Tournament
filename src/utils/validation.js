/**
 * Validate a player name.
 * @param {string} name - The name to validate
 * @param {Array<{id: string, name: string}>} existingPlayers - Already added players
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validatePlayerName(name, existingPlayers) {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be blank' };
  }
  if (trimmed.length > 60) {
    return { valid: false, error: 'Name must be under 60 characters' };
  }
  const isDuplicate = existingPlayers.some(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (isDuplicate) {
    return { valid: false, error: 'This name already exists' };
  }
  return { valid: true, error: null };
}

/**
 * Validate a single score value.
 * Empty string is allowed (incomplete match).
 * @param {string} score
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateScore(score) {
  if (score === '' || score === null || score === undefined) {
    return { valid: true, error: null };
  }
  const trimmed = String(score).trim();
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'Must be a whole number' };
  }
  const num = parseInt(trimmed, 10);
  if (num < 0) {
    return { valid: false, error: 'Cannot be negative' };
  }
  if (num > 999) {
    return { valid: false, error: 'Score too large' };
  }
  return { valid: true, error: null };
}

/**
 * Check if there are enough players to generate matches.
 * @param {number} playerCount
 * @param {'singles'|'doubles'} matchType
 * @returns {{ valid: boolean, error: string|null }}
 */
export function canGenerateMatches(playerCount, matchType = 'singles', doublesSubMode = 'randomized') {
  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  const min = isFixedDoubles ? 2 : matchType === 'doubles' ? 4 : 2;
  if (playerCount < min) {
    return {
      valid: false,
      error: isFixedDoubles
        ? 'Add at least 2 pairs for fixed doubles matches'
        : matchType === 'doubles'
        ? 'Add at least 4 players for social doubles matches'
        : 'Add at least 2 players to generate matches',
    };
  }
  if (playerCount > 32) {
    return { valid: false, error: 'Maximum 32 players supported' };
  }
  return { valid: true, error: null };
}
