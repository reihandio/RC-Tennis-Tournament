import { useMemo, useState } from 'react';
import { Trophy, Pencil, Trash2, Check, X } from 'lucide-react';
import { validateScore } from '../utils/validation';
import { findMatchConflict, getMatchCourt, getMatchRound } from '../utils/scheduler';

/**
 * MatchCard — view mode shows stacked team names + scores.
 * Edit mode shows player dropdowns + score inputs with Save/Cancel.
 */
export default function MatchCard({
  match,
  team1Name,
  team2Name,
  players,
  allMatches,
  matchType,
  doublesSubMode,
  onScoreChange,
  onSaveEdit,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({ team1Score: null, team2Score: null });

  // Edit state
  const [editData, setEditData] = useState(null);

  const conflict = useMemo(() => {
    if (!editing || !editData) return { valid: true, error: null };
    return findMatchConflict(allMatches || [], match.id, editData, players);
  }, [editing, editData, allMatches, match.id, players]);

  // --- View mode helpers ---
  const isComplete =
    match.team1Score !== '' && match.team2Score !== '' &&
    /^\d+$/.test(String(match.team1Score).trim()) &&
    /^\d+$/.test(String(match.team2Score).trim());
  const n1 = isComplete ? parseInt(match.team1Score, 10) : null;
  const n2 = isComplete ? parseInt(match.team2Score, 10) : null;
  const t1Wins = n1 !== null && n1 > n2;
  const t2Wins = n2 !== null && n2 > n1;
  const isDraw = n1 !== null && n1 === n2;

  // --- Score change in view mode ---
  const handleScoreChange = (field, value) => {
    const result = validateScore(value);
    setErrors((prev) => ({ ...prev, [field]: result.error }));
    onScoreChange(match.id, field, value);
  };

  // --- Enter / exit edit mode ---
  const startEditing = () => {
    setEditData({
      team1PlayerIds: [...match.team1PlayerIds],
      team2PlayerIds: [...match.team2PlayerIds],
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      round: getMatchRound(match),
      court: getMatchCourt(match),
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditData(null);
  };

  const saveEditing = () => {
    if (editData && conflict.valid) {
      onSaveEdit(match.id, editData);
      setEditing(false);
      setEditData(null);
    }
  };

  // --- Edit helpers ---
  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  const teamSlots = isFixedDoubles ? 1 : matchType === 'singles' ? 1 : 2;

  const updateEditPlayer = (team, slot, playerId) => {
    if (!editData) return;
    const key = team === 1 ? 'team1PlayerIds' : 'team2PlayerIds';
    const ids = [...editData[key]];
    while (ids.length <= slot) ids.push('');
    ids[slot] = playerId;
    setEditData({ ...editData, [key]: ids.filter(Boolean) });
  };

  const updateEditScore = (team, value) => {
    if (!editData) return;
    const key = team === 1 ? 'team1Score' : 'team2Score';
    setEditData({ ...editData, [key]: value });
  };

  const updateEditField = (field, value) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const playerSelect = (team, slot, value) => (
    <select
      value={value}
      onChange={(e) => updateEditPlayer(team, slot, e.target.value)}
      className="w-full px-2 py-1.5 border-2 border-[#E8ECE9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
    >
      <option value="">— select —</option>
      {players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );

  // --- Render ---

  const teamRow = (teamNum, playerIds, score, scoreField, isWinner, isLoser) => {
    if (editing) {
      const editIds = teamNum === 1 ? editData.team1PlayerIds : editData.team2PlayerIds;
      const editScore = teamNum === 1 ? editData.team1Score : editData.team2Score;
      return (
        <div className="rounded-xl px-3 py-2 bg-[#FAF9F6] border border-[#E8ECE9]">
          <div className="flex flex-col gap-2">
            {/* Player dropdowns */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: teamSlots }).map((_, slot) => (
                <span key={slot} className="flex items-center gap-1">
                  {slot > 0 && <span className="text-xs text-slate-400">&amp;</span>}
                  {playerSelect(teamNum, slot, editIds[slot] || '')}
                </span>
              ))}
            </div>
            {/* Score */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={editScore}
              onChange={(e) => updateEditScore(teamNum, e.target.value)}
              placeholder="Score"
              className="w-full px-3 py-2 rounded-lg text-center font-mono text-sm font-semibold border-2 border-[#E8ECE9] focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
            />
          </div>
        </div>
      );
    }

    // View mode
    return (
      <div
        className={`rounded-xl px-3 py-2 transition-colors ${
          isWinner
            ? 'bg-emerald-50 border border-emerald-200'
            : isLoser
            ? 'bg-rose-50 border border-rose-200'
            : 'bg-[#FAF9F6] border border-[#E8ECE9]'
        }`}
      >
        <div className="flex items-center gap-1.5 mb-2">
          {isWinner && <Trophy size={14} className="text-emerald-600 flex-shrink-0" />}
          <span
            className={`text-sm font-semibold break-words leading-snug ${
              isWinner ? 'text-emerald-800' : isLoser ? 'text-rose-700' : 'text-slate-700'
            }`}
          >
            {teamNum === 1 ? team1Name : team2Name}
          </span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={score}
          onChange={(e) => handleScoreChange(scoreField, e.target.value)}
          placeholder="Score"
          className={`w-full px-3 py-2.5 rounded-xl text-center font-mono text-base font-semibold focus:outline-none focus:ring-2 transition-all ${
            errors[scoreField]
              ? 'border-2 border-red-300 focus:ring-red-400 bg-red-50'
              : isWinner
              ? 'border-2 border-emerald-300 bg-white focus:ring-emerald-400'
              : 'border-2 border-[#E8ECE9] bg-white focus:ring-[#8A9A86]'
          }`}
          aria-label={`Score for ${teamNum === 1 ? team1Name : team2Name}`}
        />
        {errors[scoreField] && (
          <p className="text-red-500 text-xs mt-1 ml-1">{errors[scoreField]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E8ECE9] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Round {getMatchRound(match)}
        </span>
        <span className="inline-flex items-center rounded-full bg-[#E8ECE9] px-2.5 py-1 text-[11px] font-semibold text-[#6B7D67]">
          Court {getMatchCourt(match)}
        </span>
      </div>

      {editing && editData && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <label className="text-xs font-medium text-slate-500">
            Round
            <input
              type="number"
              min={1}
              value={editData.round}
              onChange={(e) => updateEditField('round', e.target.value)}
              className="mt-1 w-full px-2 py-1.5 border-2 border-[#E8ECE9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
            />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Court
            <select
              value={editData.court}
              onChange={(e) => updateEditField('court', e.target.value)}
              className="mt-1 w-full px-2 py-1.5 border-2 border-[#E8ECE9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
            >
              {[1, 2, 3, 4].map((court) => (
                <option key={court} value={court}>
                  Court {court}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {editing && !conflict.valid && (
        <p className="text-red-500 text-xs mb-3 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
          {conflict.error}
        </p>
      )}

      {/* Team 1 */}
      {teamRow(1, match.team1PlayerIds, match.team1Score, 'team1Score', t1Wins, t2Wins)}

      {/* VS divider */}
      <div className="flex items-center justify-center py-2">
        {!editing && isDraw && isComplete ? (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">DRAW</span>
        ) : (
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 w-8 bg-[#E8ECE9]" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">vs</span>
            <span className="h-px flex-1 w-8 bg-[#E8ECE9]" />
          </div>
        )}
      </div>

      {/* Team 2 */}
      {teamRow(2, match.team2PlayerIds, match.team2Score, 'team2Score', t2Wins, t1Wins)}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-[#E8ECE9]">
        {editing ? (
          <>
            <button
              type="button"
              onClick={saveEditing}
              disabled={!conflict.valid}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#8A9A86] text-white hover:bg-[#6B7D67] transition-colors disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              Save
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-[#E8ECE9] transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-[#8A9A86] hover:bg-[#E8ECE9]/50 transition-colors"
              title="Edit match"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(match.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete match"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
