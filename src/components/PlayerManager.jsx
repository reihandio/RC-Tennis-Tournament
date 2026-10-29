import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { validatePlayerName } from '../utils/validation';

export default function PlayerManager({ players, matchType, doublesSubMode, onAddPlayer, onRemovePlayer }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);

  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  const placeholder = isFixedDoubles
    ? 'Enter pair name (e.g. Alcaraz & Nadal)...'
    : 'Enter player name...';

  const minLabel = isFixedDoubles ? '2 pairs' : matchType === 'singles' ? '2' : '4';

  const handleAdd = () => {
    const result = validatePlayerName(inputValue, players);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    const addResult = onAddPlayer(inputValue);
    if (addResult) {
      setInputValue('');
      setError(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {isFixedDoubles ? 'Pairs / Teams' : 'Players'}
        <span className="text-slate-500 font-normal ml-1">({players.length})</span>
      </label>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); if (error) setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 border-2 border-[#7A8C76] rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5A6B57] focus:border-transparent transition-shadow bg-white"
          maxLength={60}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex min-h-11 items-center justify-center gap-1.5 px-5 py-2.5 bg-[#5A6B57] text-white rounded-xl text-sm font-semibold hover:bg-[#4F5F4C] active:bg-[#435043] transition-colors shadow-[0_2px_8px_rgba(90,107,87,0.3)]"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-xs mb-2 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600" />
          {error}
        </p>
      )}

      {players.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {players.map((player) => (
            <span
              key={player.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8ECE9] border border-[#DDE2DD] rounded-full text-sm text-slate-700 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-[#8A9A86]" />
              {player.name}
              <button
                type="button"
                onClick={() => onRemovePlayer(player.id)}
                className="relative ml-0.5 p-0.5 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors before:absolute before:-inset-2 before:content-['']"
                aria-label={`Remove ${player.name}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {players.length === 0 && (
        <p className="text-sm text-slate-500 italic">
          Add at least {minLabel} players to generate matches
        </p>
      )}
    </div>
  );
}
