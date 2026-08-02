import { Medal, Trophy } from 'lucide-react';

export default function StandingsTable({
  standings,
  matchType,
  doublesSubMode,
  columnPrefs,
  customValues,
  onCustomValueChange,
}) {
  if (standings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Trophy size={40} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">No standings yet.</p>
        <p className="text-xs mt-1">Generate matches and enter scores to see rankings.</p>
      </div>
    );
  }

  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  const nameLabel = isFixedDoubles ? 'Team / Pair' : 'Player';
  const showCustom = columnPrefs?.custom;

  // Fixed 8-column layout: # (6%) | Name (34%) | P (7%) | W (7%) | L (7%) | +/- (8%) | Win% (10%) | PTS (7%) | ...Note (14%)
  // Note column squeezes evenly from others when shown
  const nameW = showCustom ? '28%' : '34%';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b-2 border-[#E8ECE9]">
            <th className="text-left py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[6%]">#</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider" style={{ width: nameW }}>
              {nameLabel}
            </th>
            <th className="text-center py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[7%]">P</th>
            <th className="text-center py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[7%]">W</th>
            <th className="text-center py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[7%]">L</th>
            <th className="text-center py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[8%] whitespace-nowrap">+/-</th>
            <th className="text-center py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[10%]">Win %</th>
            <th className="text-center py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[7%]">PTS</th>
            {showCustom && (
              <th className="text-center py-3 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[14%]">Note</th>
            )}
          </tr>
        </thead>
        <tbody>
          {standings.map((row, index) => (
            <tr
              key={row.playerId}
              className={`border-b border-[#E8ECE9] transition-colors ${
                index === 0 && row.played > 0 ? 'bg-amber-50/50' : 'hover:bg-[#FAF9F6]'
              }`}
            >
              <td className="py-2.5 px-1">
                <span className="inline-flex items-center justify-center w-7 h-7">
                  {index === 0 && row.played > 0 ? (
                    <Trophy size={17} className="text-amber-500" />
                  ) : index === 1 && row.played > 0 ? (
                    <Medal size={16} className="text-slate-400" />
                  ) : index === 2 && row.played > 0 ? (
                    <Medal size={16} className="text-amber-700" />
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">{row.position}</span>
                  )}
                </span>
              </td>
              <td className="py-2.5 px-2">
                <span className={`font-semibold truncate block ${
                  index === 0 && row.played > 0 ? 'text-slate-800' : 'text-slate-600'
                }`}>
                  {row.playerName}
                </span>
              </td>
              <td className="py-2.5 px-1 text-center font-mono text-slate-600 text-xs">{row.played}</td>
              <td className="py-2.5 px-1 text-center font-mono text-emerald-600 font-semibold text-xs">{row.wins}</td>
              <td className="py-2.5 px-1 text-center font-mono text-rose-500 text-xs">{row.losses}</td>
              <td className="py-2.5 px-1 text-center font-mono font-semibold text-xs">
                <span className={row.gameDiff > 0 ? 'text-emerald-600' : row.gameDiff < 0 ? 'text-rose-500' : 'text-slate-400'}>
                  {row.gameDiff > 0 ? '+' : ''}{row.gameDiff}
                </span>
              </td>
              <td className="py-2.5 px-1 text-center font-mono text-xs">
                <span className={`font-semibold ${
                  row.played > 0 ? row.winPct >= 50 ? 'text-emerald-600' : 'text-rose-500' : 'text-slate-400'
                }`}>
                  {row.played > 0 ? `${row.winPct}%` : '—'}
                </span>
              </td>
              <td className="py-2.5 px-1 text-center font-mono text-slate-700 font-semibold text-xs">{row.points}</td>
              {showCustom && (
                <td className="py-2 px-1 text-center">
                  <input
                    type="text"
                    value={customValues?.[row.playerId] || ''}
                    onChange={(e) => onCustomValueChange?.(row.playerId, e.target.value)}
                    placeholder="—"
                    className="w-full px-2 py-1 border border-[#E8ECE9] rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#8A9A86] bg-white"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
