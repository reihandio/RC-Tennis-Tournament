import { Medal, Trophy } from 'lucide-react';

export default function StandingsTable({ standings, matchType }) {
  if (standings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Trophy size={40} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">No standings yet.</p>
        <p className="text-xs mt-1">Generate matches and enter scores to see rankings.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#E8ECE9]">
            <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
              #
            </th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Player
            </th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
              P
            </th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
              W
            </th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
              L
            </th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">
              Win %
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, index) => (
            <tr
              key={row.playerId}
              className={`border-b border-[#E8ECE9] transition-colors ${
                index === 0 && row.played > 0
                  ? 'bg-amber-50/50'
                  : 'hover:bg-[#FAF9F6]'
              }`}
            >
              <td className="py-3 px-3">
                <span className="inline-flex items-center justify-center w-7 h-7">
                  {index === 0 && row.played > 0 ? (
                    <Trophy size={17} className="text-amber-500" />
                  ) : index === 1 && row.played > 0 ? (
                    <Medal size={16} className="text-slate-400" />
                  ) : index === 2 && row.played > 0 ? (
                    <Medal size={16} className="text-amber-700" />
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">
                      {row.position}
                    </span>
                  )}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={`font-semibold ${
                  index === 0 && row.played > 0 ? 'text-slate-800' : 'text-slate-600'
                }`}>
                  {row.playerName}
                </span>
              </td>
              <td className="py-3 px-3 text-center font-mono text-slate-600">
                {row.played}
              </td>
              <td className="py-3 px-3 text-center font-mono text-emerald-600 font-semibold">
                {row.wins}
              </td>
              <td className="py-3 px-3 text-center font-mono text-rose-500">
                {row.losses}
              </td>
              <td className="py-3 px-3 text-center font-mono">
                <span
                  className={`font-semibold ${
                    row.played > 0
                      ? row.winPct >= 50
                        ? 'text-emerald-600'
                        : 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {row.played > 0 ? `${row.winPct}%` : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
