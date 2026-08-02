import { Plus } from 'lucide-react';
import MatchCard from './MatchCard';

export default function MatchList({
  matches,
  players,
  matchType,
  doublesSubMode,
  onUpdateScore,
  onSaveEdit,
  onDelete,
  onAddCustom,
}) {
  if (matches.length === 0 && !onAddCustom) return null;

  const getTeamName = (playerIds) => {
    const names = playerIds
      .map((id) => {
        const player = players.find((p) => p.id === id);
        return player ? player.name : '?';
      })
      .filter(Boolean);
    return names.length > 0 ? names.join(' & ') : 'No players';
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
          {matchType === 'doubles'
            ? doublesSubMode === 'fixed'
              ? 'Fixed Doubles Matches'
              : 'Doubles Matches'
            : 'Matches'}
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {matches.length > 0 && `${completedCount}/${matches.length} completed`}
        </span>
      </div>

      {/* Match cards */}
      {matches.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              team1Name={getTeamName(match.team1PlayerIds)}
              team2Name={getTeamName(match.team2PlayerIds)}
              players={players}
              matchType={matchType}
              doublesSubMode={doublesSubMode}
              onScoreChange={onUpdateScore}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Add Custom Match button */}
      {onAddCustom && (
        <button
          type="button"
          onClick={onAddCustom}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-[#DDE2DD] rounded-xl text-sm font-medium text-slate-500 hover:border-[#8A9A86] hover:text-[#8A9A86] hover:bg-[#E8ECE9]/30 transition-all"
        >
          <Plus size={16} />
          Add Custom Match
        </button>
      )}
    </div>
  );
}
