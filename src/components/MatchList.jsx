import MatchCard from './MatchCard';

export default function MatchList({ matches, players, matchType, onUpdateScore }) {
  if (matches.length === 0) return null;

  const getTeamName = (playerIds) => {
    const names = playerIds
      .map((id) => {
        const player = players.find((p) => p.id === id);
        return player ? player.name : '?';
      })
      .filter(Boolean);
    return names.join(' & ');
  };

  const completedCount = matches.filter((m) => {
    const s1 = m.team1Score;
    const s2 = m.team2Score;
    return (
      s1 !== '' && s2 !== '' &&
      /^\d+$/.test(String(s1).trim()) &&
      /^\d+$/.test(String(s2).trim())
    );
  }).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">
          {matchType === 'doubles' ? 'Doubles Matches' : 'Matches'}
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {completedCount}/{matches.length} completed
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            team1Name={getTeamName(match.team1PlayerIds)}
            team2Name={getTeamName(match.team2PlayerIds)}
            onScoreChange={onUpdateScore}
          />
        ))}
      </div>
    </div>
  );
}
