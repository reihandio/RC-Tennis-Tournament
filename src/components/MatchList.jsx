import { useState } from 'react';
import { Plus } from 'lucide-react';
import MatchCard from './MatchCard';
import CustomFixtureForm from './CustomFixtureForm';
import { getMatchCourt, getMatchRound } from '../utils/scheduler';

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
  const [addingFixture, setAddingFixture] = useState(false);

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

  const normalizedMatches = matches.map((match, index) => ({
    ...match,
    round: getMatchRound(match, index),
    court: getMatchCourt(match),
  }));

  const rounds = [];
  const roundMap = new Map();
  normalizedMatches.forEach((match) => {
    if (!roundMap.has(match.round)) {
      const group = { round: match.round, matches: [] };
      roundMap.set(match.round, group);
      rounds.push(group);
    }
    roundMap.get(match.round).matches.push(match);
  });
  rounds.sort((a, b) => a.round - b.round);
  rounds.forEach((group) => {
    group.matches.sort((a, b) => a.court - b.court);
  });

  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1].round : 0;

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

      {/* Match cards grouped by round */}
      {rounds.map(({ round, matches: roundMatches }) => {
        const roundPlayerIds = new Set(
          roundMatches.flatMap((match) => [
            ...match.team1PlayerIds,
            ...match.team2PlayerIds,
          ])
        );
        const resting = players.filter((player) => !roundPlayerIds.has(player.id));

        return (
          <section key={round} className="mb-5 last:mb-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#8A9A86] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Round {round}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {roundMatches.length} {roundMatches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
            </div>

            {resting.length > 0 && (
              <p className="text-xs text-slate-500 bg-[#FAF9F6] border border-[#E8ECE9] rounded-xl px-3 py-2 mb-2">
                <span className="font-semibold text-slate-600">Resting:</span>{' '}
                {resting.map((player) => player.name).join(', ')}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {roundMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  team1Name={getTeamName(match.team1PlayerIds)}
                  team2Name={getTeamName(match.team2PlayerIds)}
                  players={players}
                  allMatches={normalizedMatches}
                  matchType={matchType}
                  doublesSubMode={doublesSubMode}
                  onScoreChange={onUpdateScore}
                  onSaveEdit={onSaveEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Add Custom Fixture */}
      {onAddCustom && addingFixture && (
        <CustomFixtureForm
          players={players}
          matches={normalizedMatches}
          matchType={matchType}
          doublesSubMode={doublesSubMode}
          defaultRound={lastRound + 1}
          onSubmit={(fixture) => {
            onAddCustom(fixture);
            setAddingFixture(false);
          }}
          onCancel={() => setAddingFixture(false)}
        />
      )}

      {onAddCustom && !addingFixture && (
        <button
          type="button"
          onClick={() => setAddingFixture(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-[#DDE2DD] rounded-xl text-sm font-medium text-slate-500 hover:border-[#8A9A86] hover:text-[#8A9A86] hover:bg-[#E8ECE9]/30 transition-all"
        >
          <Plus size={16} />
          Add Custom Fixture
        </button>
      )}
    </div>
  );
}
