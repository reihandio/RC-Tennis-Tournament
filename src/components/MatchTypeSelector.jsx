import { User, Users } from 'lucide-react';

export default function MatchTypeSelector({ matchType, onChange }) {
  const isSingles = matchType === 'singles';

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Match Type
      </label>
      <div className="flex rounded-2xl overflow-hidden border-2 border-[#E8ECE9] bg-[#F5EDE8]/50 p-1 gap-1">
        <button
          type="button"
          onClick={() => onChange('singles')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
            isSingles
              ? 'bg-[#8A9A86] text-white shadow-[0_2px_8px_rgba(138,154,134,0.4)]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          }`}
        >
          <User size={17} />
          Singles
        </button>
        <button
          type="button"
          onClick={() => onChange('doubles')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
            !isSingles
              ? 'bg-[#C2856C] text-white shadow-[0_2px_8px_rgba(194,133,108,0.4)]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          }`}
        >
          <Users size={17} />
          Doubles
        </button>
      </div>
    </div>
  );
}
