import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { clampCourt, clampRound, findMatchConflict } from '../utils/scheduler';

function buildDefaultSlots(players, teamSlots, offset) {
  return Array.from({ length: teamSlots }).map((_, slot) => {
    const player = players[offset + slot];
    return player ? player.id : '';
  });
}

export default function CustomFixtureForm({
  players,
  matches,
  matchType,
  doublesSubMode,
  defaultRound,
  onSubmit,
  onCancel,
}) {
  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  const teamSlots = isFixedDoubles || matchType === 'singles' ? 1 : 2;

  const [round, setRound] = useState(String(defaultRound || 1));
  const [court, setCourt] = useState('1');
  const [team1, setTeam1] = useState(() => buildDefaultSlots(players, teamSlots, 0));
  const [team2, setTeam2] = useState(() => buildDefaultSlots(players, teamSlots, teamSlots));
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');

  const team1PlayerIds = team1.filter(Boolean);
  const team2PlayerIds = team2.filter(Boolean);

  const conflict = useMemo(
    () =>
      findMatchConflict(
        matches,
        null,
        {
          round,
          court,
          team1PlayerIds,
          team2PlayerIds,
        },
        players
      ),
    [matches, round, court, team1PlayerIds, team2PlayerIds, players]
  );

  const updatePlayer = (team, slot, playerId) => {
    const setter = team === 1 ? setTeam1 : setTeam2;
    setter((prev) => {
      const next = [...prev];
      next[slot] = playerId;
      return next;
    });
  };

  const selectedElsewhere = (team, slot) => {
    const ids = [];
    team1.forEach((id, index) => {
      if (team !== 1 || index !== slot) ids.push(id);
    });
    team2.forEach((id, index) => {
      if (team !== 2 || index !== slot) ids.push(id);
    });
    return new Set(ids.filter(Boolean));
  };

  const playerSelect = (team, slot, value) => {
    const hidden = selectedElsewhere(team, slot);
    return (
      <select
        value={value || ''}
        onChange={(e) => updatePlayer(team, slot, e.target.value)}
        className="w-full px-2 py-1.5 border-2 border-[#E8ECE9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
      >
        <option value="">— select —</option>
        {players
          .filter((player) => !hidden.has(player.id))
          .map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
      </select>
    );
  };

  const handleSubmit = () => {
    if (!conflict.valid) return;
    onSubmit({
      round: clampRound(round),
      court: clampCourt(court),
      team1PlayerIds,
      team2PlayerIds,
      team1Score,
      team2Score,
    });
  };

  return (
    <div className="mt-3 rounded-2xl border-2 border-dashed border-[#DDE2DD] bg-[#FAF9F6] p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold text-slate-700">Add Custom Fixture</h4>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#E8ECE9] transition-colors"
          aria-label="Cancel custom fixture"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <label className="text-xs font-medium text-slate-500">
          Round
          <input
            type="number"
            min={1}
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="mt-1 w-full px-2 py-1.5 border-2 border-[#E8ECE9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
          />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Court
          <select
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            className="mt-1 w-full px-2 py-1.5 border-2 border-[#E8ECE9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
          >
            {[1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>
                Court {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        {[{ team: 1, slots: team1 }, { team: 2, slots: team2 }].map(({ team, slots }) => (
          <div
            key={team}
            className="rounded-xl px-3 py-2 bg-white border border-[#E8ECE9]"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {slots.map((value, slot) => (
                <span key={slot} className="flex items-center gap-1 flex-1 min-w-[120px]">
                  {slot > 0 && <span className="text-xs text-slate-400">&amp;</span>}
                  {playerSelect(team, slot, value)}
                </span>
              ))}
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={team === 1 ? team1Score : team2Score}
              onChange={(e) =>
                team === 1 ? setTeam1Score(e.target.value) : setTeam2Score(e.target.value)
              }
              placeholder={`Team ${team} score`}
              className="mt-2 w-full px-3 py-2 rounded-lg text-center font-mono text-sm font-semibold border-2 border-[#E8ECE9] focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
            />
          </div>
        ))}
      </div>

      {!conflict.valid && (
        <p className="text-red-500 text-xs mt-3 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
          {conflict.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-[#E8ECE9] transition-colors"
        >
          <X size={14} />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!conflict.valid}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[#8A9A86] text-white hover:bg-[#6B7D67] transition-colors disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <Check size={14} />
          Add Fixture
        </button>
      </div>
    </div>
  );
}
