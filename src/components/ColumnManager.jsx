import { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ColumnManager({
  columnPrefs,
  onToggleColumn,
  pointsPerWin,
  onPointsPerWinChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-[#8A9A86] transition-colors"
      >
        <Settings2 size={14} />
        Table Settings
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="mt-3 p-4 bg-[#FAF9F6] border border-[#E8ECE9] rounded-2xl space-y-3">
          <p className="text-xs text-slate-400 mb-1">
            Columns <strong>+/-</strong> (Game Difference) and <strong>PTS</strong> are always shown.
          </p>

          {/* Points per win */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Points per win:</label>
            <input
              type="number"
              min={1}
              max={10}
              value={pointsPerWin}
              onChange={(e) => onPointsPerWinChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 px-2 py-1 border-2 border-[#E8ECE9] rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#8A9A86]"
            />
          </div>

          {/* Custom Column Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={columnPrefs.custom || false}
              onChange={() => onToggleColumn('custom', !columnPrefs.custom)}
              className="w-4 h-4 rounded accent-[#8A9A86]"
            />
            <span className="text-sm text-slate-700">
              Custom Note Column <span className="text-xs text-slate-400">(e.g., Club, Seed)</span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
