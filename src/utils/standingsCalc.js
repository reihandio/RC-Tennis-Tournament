/**
 * Calculate individual player standings from matches.
 *
 * For singles: each match has 1 player per team.
 * For doubles: each match has 2 players per team — both players
 * on the winning team get +1 Win, both on losing team get +1 Loss.
 *
 * @param {Array<{id: string, name: string}>} players
 * @param {Array<{id: string, team1PlayerIds: string[], team2PlayerIds: string[], team1Score: string, team2Score: string, winnerId: string|null}>} matches
 * @returns {Array<{playerId: string, playerName: string, played: number, wins: number, losses: number, winPct: number, position: number}>}
 */
export function calculateStandings(players, matches) {
  // Initialize stats map
  const stats = new Map();
  players.forEach((p) => {
    stats.set(p.id, { played: 0, wins: 0, losses: 0 });
  });

  matches.forEach((m) => {
    const s1 = m.team1Score;
    const s2 = m.team2Score;

    // Skip incomplete matches
    if (!isValidScoreEntry(s1) || !isValidScoreEntry(s2)) return;

    const n1 = parseInt(s1, 10);
    const n2 = parseInt(s2, 10);
    if (isNaN(n1) || isNaN(n2) || n1 < 0 || n2 < 0) return;

    // All players in both teams get +1 played
    const allPlayerIds = [...m.team1PlayerIds, ...m.team2PlayerIds];

    allPlayerIds.forEach((pid) => {
      const s = stats.get(pid);
      if (s) s.played += 1;
    });

    // Assign wins/losses
    if (n1 > n2) {
      // Team 1 wins
      m.team1PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) s.wins += 1;
      });
      m.team2PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) s.losses += 1;
      });
    } else if (n2 > n1) {
      // Team 2 wins
      m.team2PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) s.wins += 1;
      });
      m.team1PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) s.losses += 1;
      });
    }
    // Draw: no win/loss assigned (played already counted)
  });

  // Build sorted standings array
  const standings = players
    .map((p) => {
      const s = stats.get(p.id);
      const played = s.played;
      const wins = s.wins;
      const losses = s.losses;
      const winPct = played > 0 ? Math.round((wins / played) * 100 * 100) / 100 : 0;
      return {
        playerId: p.id,
        playerName: p.name,
        played,
        wins,
        losses,
        winPct,
      };
    })
    .sort((a, b) => {
      if (b.winPct !== a.winPct) return b.winPct - a.winPct;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.playerName.localeCompare(b.playerName);
    })
    .map((row, index) => ({ ...row, position: index + 1 }));

  return standings;
}

function isValidScoreEntry(score) {
  if (score === null || score === undefined || score === '') return false;
  return /^\d+$/.test(String(score).trim());
}
