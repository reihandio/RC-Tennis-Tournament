import { Swords, RefreshCw, Hash, LayoutGrid } from 'lucide-react';
import { canGenerateMatches } from '../utils/validation';
import {
  MAX_COURTS,
  getEffectiveCourtCount,
  getPlayersPerMatch,
  maxMatchesFor,
} from '../utils/scheduler';

export default function MatchGenerator({
  participants,
  defaultMatchCount,
  matchCountInput,
  onMatchCountChange,
  matchType,
  doublesSubMode,
  courtCount,
  onCourtCountChange,
  onGenerate,
  onReset,
  hasMatches,
  generationError,
}) {
  const validation = canGenerateMatches(participants.length, matchType, doublesSubMode);
  const activeCount = matchCountInput || defaultMatchCount;

  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  const description = isFixedDoubles
    ? 'Fixed pairs — full round-robin'
    : matchType === 'doubles'
    ? 'Rotating partners — social doubles format'
    : 'Full round-robin';

  const playersPerMatch = getPlayersPerMatch(matchType, doublesSubMode);
  const effectiveCourts = getEffectiveCourtCount(
    courtCount,
    participants.length,
    matchType,
    doublesSubMode
  );
  const courtsReduced = effectiveCourts >= 1 && effectiveCourts < courtCount;
  const noCourt = effectiveCourts < 1;
  const unitLabel = isFixedDoubles ? 'pairs' : 'players';
  const maxMatches = maxMatchesFor(participants.length, matchType, doublesSubMode);
  const requestedMatches = parseInt(activeCount, 10);
  const plannedMatches = requestedMatches > 0 ? requestedMatches : maxMatches;
  const rounds = effectiveCourts >= 1
    ? Math.ceil(Math.max(1, plannedMatches) / effectiveCourts)
    : 0;

  const handleGenerate = () => {
    const count = matchCountInput ? parseInt(matchCountInput, 10) : undefined;
    onGenerate(isNaN(count) ? undefined : count);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-3">
        Match Generation
      </label>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap flex items-center gap-1">
            <LayoutGrid size={14} />
            Courts:
          </label>
          <div className="flex flex-1 rounded-xl overflow-hidden border-2 border-[#E8ECE9] bg-[#F5EDE8]/50 p-1 gap-1">
            {Array.from({ length: MAX_COURTS }).map((_, index) => {
              const value = index + 1;
              const active = courtCount === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onCourtCountChange(value)}
                  className={`flex min-h-11 flex-1 items-center justify-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-[#5A6B57] text-white shadow-[0_2px_6px_rgba(90,107,87,0.3)]'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                  }`}
                  aria-pressed={active}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        {validation.valid && (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-[#E8ECE9]/50 rounded-xl px-4 py-3">
            <Swords size={16} className="text-[#8A9A86]" />
            <span>
              {participants.length} {isFixedDoubles ? 'pairs' : 'players'} →{' '}
              <strong>{plannedMatches}</strong> matches • <strong>{rounds}</strong>{' '}
              {rounds === 1 ? 'round' : 'rounds'} ({description})
            </span>
          </div>
        )}

        {courtsReduced && (
          <p className="text-amber-700 text-xs flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            Only {effectiveCourts} {effectiveCourts === 1 ? 'court' : 'courts'} can be
            used with {participants.length} {unitLabel}.
          </p>
        )}

        {validation.valid && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Hash size={14} />
              Matches:
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={matchCountInput}
              onChange={(e) => onMatchCountChange(e.target.value)}
              placeholder={String(defaultMatchCount)}
              className="w-20 min-h-11 px-3 py-2 rounded-xl border-2 border-[#7A8C76] text-sm text-center font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5A6B57] focus:border-transparent bg-white"
            />
            <span className="text-xs text-slate-500">
              (default: {defaultMatchCount})
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!validation.valid || noCourt}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#5A6B57] text-white rounded-xl text-sm font-semibold hover:bg-[#4F5F4C] active:bg-[#435043] transition-all shadow-[0_2px_8px_rgba(90,107,87,0.3)] disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Swords size={16} />
            Generate {isFixedDoubles ? 'Fixed Doubles' : matchType === 'doubles' ? 'Doubles' : 'All'} Matches
          </button>

          {hasMatches && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#E8ECE9] text-slate-600 rounded-xl text-sm font-medium hover:bg-[#DDE2DD] active:bg-[#CFD6CF] transition-colors"
              title="Reset all matches"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {noCourt && (
          <p className="text-amber-700 text-xs flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            Not enough {unitLabel} for even one court. {playersPerMatch}{' '}
            {unitLabel} are required per match.
          </p>
        )}

        {!noCourt && !validation.valid && participants.length > 0 && (
          <p className="text-amber-700 text-xs flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            {validation.error}
          </p>
        )}

        {generationError && (
          <p className="text-red-600 text-xs flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600" />
            {generationError}
          </p>
        )}
      </div>
    </div>
  );
}
