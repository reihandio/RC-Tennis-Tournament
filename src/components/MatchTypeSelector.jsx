import { User, Users, Shuffle, UsersRound } from 'lucide-react';

export default function MatchTypeSelector({
  matchType,
  doublesSubMode,
  onChange,
  onSubModeChange,
}) {
  const isSingles = matchType === 'singles';
  const isFixed = doublesSubMode === 'fixed';

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Match Type
      </label>

      {/* Singles / Doubles toggle */}
      <div className="flex rounded-2xl overflow-hidden border-2 border-[#E8ECE9] bg-[#F5EDE8]/50 p-1 gap-1">
        <button
          type="button"
          onClick={() => onChange('singles')}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
            isSingles
              ? 'bg-[#5A6B57] text-white shadow-[0_2px_8px_rgba(90,107,87,0.4)]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          }`}
        >
          <User size={17} />
          Singles
        </button>
        <button
          type="button"
          onClick={() => onChange('doubles')}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
            !isSingles
              ? 'bg-[#A06048] text-white shadow-[0_2px_8px_rgba(160,96,72,0.4)]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          }`}
        >
          <Users size={17} />
          Doubles
        </button>
      </div>

      {/* Doubles sub-mode toggle — only visible when Doubles is active */}
      {!isSingles && (
        <div className="mt-3 flex rounded-2xl overflow-hidden border-2 border-[#E8ECE9] bg-[#F5EDE8]/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => onSubModeChange('randomized')}
            className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
              !isFixed
                ? 'bg-[#5A6B57] text-white shadow-[0_2px_6px_rgba(90,107,87,0.3)]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            <Shuffle size={14} />
            Randomized
          </button>
          <button
            type="button"
            onClick={() => onSubModeChange('fixed')}
            className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
              isFixed
                ? 'bg-[#A06048] text-white shadow-[0_2px_6px_rgba(160,96,72,0.3)]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            <UsersRound size={14} />
            Fixed Pairs
          </button>
        </div>
      )}
    </div>
  );
}
