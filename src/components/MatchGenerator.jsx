import { Swords, RefreshCw, Hash } from 'lucide-react';
import { canGenerateMatches } from '../utils/validation';

export default function MatchGenerator({
  participants,
  defaultMatchCount,
  matchCountInput,
  onMatchCountChange,
  matchType,
  doublesSubMode,
  onGenerate,
  onReset,
  hasMatches,
}) {
  const validation = canGenerateMatches(participants.length, matchType, doublesSubMode);
  const activeCount = matchCountInput || defaultMatchCount;

  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  const description = isFixedDoubles
    ? 'Fixed pairs — full round-robin'
    : matchType === 'doubles'
    ? 'Rotating partners — social doubles format'
    : 'Full round-robin';

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
        {validation.valid && (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-[#E8ECE9]/50 rounded-xl px-4 py-3">
            <Swords size={16} className="text-[#8A9A86]" />
            <span>
              {participants.length} {isFixedDoubles ? 'pairs' : 'players'} →{' '}
              <strong>~{activeCount}</strong> matches ({description})
            </span>
          </div>
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
              max={matchType === 'singles' || isFixedDoubles
                ? (participants.length * (participants.length - 1)) / 2
                : Math.max(participants.length, 4) * Math.floor(participants.length / 4)}
              value={matchCountInput}
              onChange={(e) => onMatchCountChange(e.target.value)}
              placeholder={String(defaultMatchCount)}
              className="w-20 px-3 py-2 rounded-xl border-2 border-[#E8ECE9] text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
            />
            <span className="text-xs text-slate-400">
              (default: {defaultMatchCount})
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!validation.valid}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#8A9A86] text-white rounded-xl text-sm font-semibold hover:bg-[#6B7D67] active:bg-[#5A6B57] transition-all shadow-[0_2px_8px_rgba(138,154,134,0.3)] disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
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

        {!validation.valid && participants.length > 0 && (
          <p className="text-amber-600 text-xs flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            {validation.error}
          </p>
        )}
      </div>
    </div>
  );
}
