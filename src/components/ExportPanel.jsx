import { Download, Loader2, AlertCircle, Palette } from 'lucide-react';
import { THEMES, THEME_ORDER } from '../constants/themes';

export default function ExportPanel({
  selectedTheme,
  onThemeChange,
  onExport,
  exporting,
  error,
  hasStandings,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Palette size={16} className="text-[#C2856C]" />
        <h3 className="text-sm font-semibold text-slate-700">Grand Slam Export</h3>
      </div>

      {/* Theme selector cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {THEME_ORDER.map((key) => {
          const theme = THEMES[key];
          const isSelected = selectedTheme === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onThemeChange(key)}
              className={`relative rounded-xl p-3 text-left transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-[#C2856C] shadow-[0_2px_12px_rgba(194,133,108,0.3)] scale-[1.03]'
                  : 'border-[#E8ECE9] hover:border-[#DDE2DD]'
              }`}
              style={{ background: theme.gradient, minHeight: '84px' }}
              aria-label={`Select ${theme.name} theme`}
            >
              <span className="block text-xs font-bold mb-1" style={{ color: theme.text }}>
                {theme.name}
              </span>
              <span className="block text-[10px] opacity-75" style={{ color: theme.text }}>
                {key === 'roland-garros' && 'Clay Court'}
                {key === 'wimbledon' && 'Grass Court'}
                {key === 'us-open' && 'Hard Court'}
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white shadow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Export button */}
      <button
        type="button"
        onClick={onExport}
        disabled={!hasStandings || exporting}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#C2856C] to-[#B07058] text-white rounded-xl text-sm font-semibold hover:from-[#B07058] hover:to-[#A06048] active:from-[#A06048] active:to-[#905038] transition-all shadow-[0_2px_12px_rgba(194,133,108,0.3)] disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {exporting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={16} />
            Export Standings as PNG
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2 text-center">
        High-res PNG (2x) with selected Grand Slam styling
      </p>
    </div>
  );
}
