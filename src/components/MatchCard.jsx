import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { validateScore } from '../utils/validation';

/**
 * Stacked vertical layout — no truncation, full name visibility.
 *
 * ┌──────────────────────────────┐
 * │  🏆 Player A & Player B      │
 * │  ┌──────────────────────┐    │
 * │  │        Score         │    │
 * │  └──────────────────────┘    │
 * │            vs                 │
 * │  🏆 Player C & Player D      │
 * │  ┌──────────────────────┐    │
 * │  │        Score         │    │
 * │  └──────────────────────┘    │
 * └──────────────────────────────┘
 */
export default function MatchCard({ match, team1Name, team2Name, onScoreChange }) {
  const [errors, setErrors] = useState({ team1Score: null, team2Score: null });

  const isComplete =
    match.team1Score !== '' &&
    match.team2Score !== '' &&
    /^\d+$/.test(String(match.team1Score).trim()) &&
    /^\d+$/.test(String(match.team2Score).trim());

  const n1 = isComplete ? parseInt(match.team1Score, 10) : null;
  const n2 = isComplete ? parseInt(match.team2Score, 10) : null;
  const t1Wins = n1 !== null && n1 > n2;
  const t2Wins = n2 !== null && n2 > n1;
  const isDraw = n1 !== null && n1 === n2;

  const handleScoreChange = (field, value) => {
    const result = validateScore(value);
    setErrors((prev) => ({ ...prev, [field]: result.error }));
    onScoreChange(match.id, field, value);
  };

  const teamRow = (name, score, field, isWinner, isLoser, hasResult) => (
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
            isWinner
              ? 'text-emerald-800'
              : isLoser
              ? 'text-rose-700'
              : 'text-slate-700'
          }`}
        >
          {name}
        </span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={score}
        onChange={(e) => handleScoreChange(field, e.target.value)}
        placeholder="Score"
        className={`w-full px-3 py-2.5 rounded-xl text-center font-mono text-base font-semibold focus:outline-none focus:ring-2 transition-all ${
          errors[field]
            ? 'border-2 border-red-300 focus:ring-red-400 bg-red-50'
            : isWinner
            ? 'border-2 border-emerald-300 bg-white focus:ring-emerald-400'
            : 'border-2 border-[#E8ECE9] bg-white focus:ring-[#8A9A86]'
        }`}
        aria-label={`Score for ${name}`}
      />
      {errors[field] && (
        <p className="text-red-500 text-xs mt-1 ml-1">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-[#E8ECE9] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
      {/* Team 1 */}
      {teamRow(team1Name, match.team1Score, 'team1Score', t1Wins, t2Wins, isComplete)}

      {/* VS divider */}
      <div className="flex items-center justify-center py-2">
        {isDraw && isComplete ? (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            DRAW
          </span>
        ) : (
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 w-8 bg-[#E8ECE9]" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
              vs
            </span>
            <span className="h-px flex-1 w-8 bg-[#E8ECE9]" />
          </div>
        )}
      </div>

      {/* Team 2 */}
      {teamRow(team2Name, match.team2Score, 'team2Score', t2Wins, t1Wins, isComplete)}
    </div>
  );
}
