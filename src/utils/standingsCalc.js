/**
 * Calculate individual player standings from matches.
 *
 * Supports optional extended stats: gamesWon (GW), gamesLost (GL),
 * gameDiff (GD), and points (PTS = wins * pointsPerWin).
 *
 * Tiebreaker: Win% desc → GD desc → Wins desc → Name asc.
 */
export function calculateStandings(players, matches, { pointsPerWin = 2 } = {}) {
  const stats = new Map();
  players.forEach((p) => {
    stats.set(p.id, {
      played: 0,
      wins: 0,
      losses: 0,
      gamesWon: 0,
      gamesLost: 0,
    });
  });

  matches.forEach((m) => {
    const s1 = m.team1Score;
    const s2 = m.team2Score;
    if (!isValidScoreEntry(s1) || !isValidScoreEntry(s2)) return;

    const n1 = parseInt(s1, 10);
    const n2 = parseInt(s2, 10);
    if (isNaN(n1) || isNaN(n2) || n1 < 0 || n2 < 0) return;

    const allPlayerIds = [...m.team1PlayerIds, ...m.team2PlayerIds];
    allPlayerIds.forEach((pid) => {
      const s = stats.get(pid);
      if (s) s.played += 1;
    });

    if (n1 > n2) {
      m.team1PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) { s.wins += 1; s.gamesWon += n1; s.gamesLost += n2; }
      });
      m.team2PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) { s.losses += 1; s.gamesWon += n2; s.gamesLost += n1; }
      });
    } else if (n2 > n1) {
      m.team2PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) { s.wins += 1; s.gamesWon += n2; s.gamesLost += n1; }
      });
      m.team1PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) { s.losses += 1; s.gamesWon += n1; s.gamesLost += n2; }
      });
    } else {
      // Draw: count games but no win/loss
      m.team1PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) { s.gamesWon += n1; s.gamesLost += n2; }
      });
      m.team2PlayerIds.forEach((pid) => {
        const s = stats.get(pid);
        if (s) { s.gamesWon += n2; s.gamesLost += n1; }
      });
    }
  });

  const standings = players
    .map((p) => {
      const s = stats.get(p.id);
      const played = s.played;
      const wins = s.wins;
      const losses = s.losses;
      const winPct = played > 0 ? Math.round((wins / played) * 100 * 100) / 100 : 0;
      const gamesWon = s.gamesWon;
      const gamesLost = s.gamesLost;
      const gameDiff = gamesWon - gamesLost;
      const points = wins * pointsPerWin;
      return {
        playerId: p.id,
        playerName: p.name,
        played,
        wins,
        losses,
        winPct,
        gamesWon,
        gamesLost,
        gameDiff,
        points,
      };
    })
    .sort((a, b) => {
      // Primary: Win%
      if (b.winPct !== a.winPct) return b.winPct - a.winPct;
      // Secondary: Game Difference
      if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
      // Tertiary: Total Wins
      if (b.wins !== a.wins) return b.wins - a.wins;
      // Quaternary: Name
      return a.playerName.localeCompare(b.playerName);
    })
    .map((row, index) => ({ ...row, position: index + 1 }));

  return standings;
}

function isValidScoreEntry(score) {
  if (score === null || score === undefined || score === '') return false;
  return /^\d+$/.test(String(score).trim());
}
