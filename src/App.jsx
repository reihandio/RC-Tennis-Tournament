import { useState, useRef, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useTournament } from './hooks/useTournament';
import { useStandings } from './hooks/useStandings';
import { useLogos } from './hooks/useLogos';
import { useExport } from './hooks/useExport';
import { usePersistence } from './hooks/usePersistence';
import { THEMES } from './constants/themes';
import Toolbar from './components/Toolbar';
import MatchTypeSelector from './components/MatchTypeSelector';
import PlayerManager from './components/PlayerManager';
import LogoUploader from './components/LogoUploader';
import MatchGenerator from './components/MatchGenerator';
import MatchList from './components/MatchList';
import StandingsTable from './components/StandingsTable';
import ExportPanel from './components/ExportPanel';

export default function App() {
  const {
    matchType,
    setMatchType,
    setMatchTypeRaw,
    doublesSubMode,
    setDoublesSubMode,
    players,
    setPlayers,
    addPlayer,
    removePlayer,
    matches,
    setMatches,
    generateMatches,
    updateScore,
    deleteMatch,
    saveMatchEdit,
    addCustomMatch,
    resetMatches,
    resetAll,
    defaultMatchCount,
    matchCountInput,
    setMatchCountInput,
    participants,
  } = useTournament();

  const standings = useStandings(matches, participants);
  const { logo, handleLogoUpload, removeLogo } = useLogos();
  const { exportPNG, exporting, error: exportError } = useExport();

  const [selectedTheme, setSelectedTheme] = useState('roland-garros');
  const exportRef = useRef(null);
  const theme = THEMES[selectedTheme];

  // Editable title & date for the export poster
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [customTitle, setCustomTitle] = useState(theme.name);
  const [tournamentDate, setTournamentDate] = useState(todayStr);

  // Sync customTitle when theme changes (if user hasn't customized it)
  const prevThemeRef = useRef(selectedTheme);
  useEffect(() => {
    if (prevThemeRef.current !== selectedTheme) {
      // Reset title to new theme's default name
      setCustomTitle(THEMES[selectedTheme].name);
      prevThemeRef.current = selectedTheme;
    }
  }, [selectedTheme]);

  // Format date for display inside export container
  const displayDate = (() => {
    if (!tournamentDate) return '';
    const d = new Date(tournamentDate + 'T00:00:00');
    if (isNaN(d.getTime())) return tournamentDate;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  })();

  // Persistence: auto-save, JSON export/import, reset
  const { exportJSON, importJSON, handleReset } = usePersistence({
    matchType,
    doublesSubMode,
    players,
    matches,
    selectedTheme,
    matchCountInput,
    customTitle,
    tournamentDate,
    setMatchType: setMatchTypeRaw,
    setDoublesSubMode,
    setPlayers,
    setMatches,
    setSelectedTheme,
    setMatchCountInput,
    setCustomTitle,
    setTournamentDate,
    resetAll,
    removeLogo,
  });

  const handleExport = () => {
    if (exportRef.current && standings.length > 0) {
      exportPNG(exportRef.current, theme);
    }
  };

  // Load default players on first visit (when no localStorage data exists)
  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current && players.length === 0) {
      didInit.current = true;
      resetAll();
    }
  }, [players.length, resetAll]);

  const hasStandings = standings.length > 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8ECE9] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#8A9A86] shadow-[0_2px_8px_rgba(138,154,134,0.3)]">
                <Trophy size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  RC-Tennis Match Manager
                </h1>
                <p className="text-xs text-slate-400">
                  Round-Robin Generator &amp; Results Exporter
                </p>
              </div>
            </div>

            {/* Toolbar: Save / Load / Reset */}
            <Toolbar
              onExportJSON={exportJSON}
              onImportJSON={importJSON}
              onReset={handleReset}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8ECE9] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-5">
              <MatchTypeSelector
                matchType={matchType}
                doublesSubMode={doublesSubMode}
                onChange={setMatchType}
                onSubModeChange={setDoublesSubMode}
              />
              <PlayerManager
                players={players}
                matchType={matchType}
                doublesSubMode={doublesSubMode}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
              />
              <LogoUploader
                logo={logo}
                onLogoUpload={handleLogoUpload}
                onLogoRemove={removeLogo}
              />
            </div>

            <div className="bg-white rounded-2xl border border-[#E8ECE9] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <MatchGenerator
                participants={participants}
                defaultMatchCount={defaultMatchCount}
                matchCountInput={matchCountInput}
                onMatchCountChange={setMatchCountInput}
                matchType={matchType}
                doublesSubMode={doublesSubMode}
                onGenerate={generateMatches}
                onReset={resetMatches}
                hasMatches={matches.length > 0}
              />
              {matchType === 'doubles' && players.length > 0 && (
                (doublesSubMode === 'fixed' && players.length < 2) ||
                (doublesSubMode === 'randomized' && players.length < 4)
              ) && (
                <p className="text-amber-600 text-xs mt-3 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {doublesSubMode === 'fixed'
                    ? 'Add at least 2 pairs for fixed doubles matches'
                    : 'Add at least 4 players for social doubles matches'}
                </p>
              )}
            </div>

            {players.length >= 2 && (
              <div className="bg-white rounded-2xl border border-[#E8ECE9] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <MatchList
                  matches={matches}
                  players={players}
                  matchType={matchType}
                  doublesSubMode={doublesSubMode}
                  onUpdateScore={updateScore}
                  onSaveEdit={saveMatchEdit}
                  onDelete={deleteMatch}
                  onAddCustom={addCustomMatch}
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8ECE9] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-[#8A9A86]" />
                {matchType === 'doubles' && doublesSubMode === 'fixed'
                  ? 'Team / Pair Standings'
                  : 'Individual Standings'}
                {standings.length > 0 && (
                  <span className="text-xs text-slate-400 font-normal">
                    ({matchType === 'singles'
                      ? 'Singles'
                      : doublesSubMode === 'fixed'
                      ? 'Fixed Doubles'
                      : 'Social Doubles'})
                  </span>
                )}
              </h3>
              <StandingsTable standings={standings} matchType={matchType} doublesSubMode={doublesSubMode} />
            </div>

            <div className="bg-white rounded-2xl border border-[#E8ECE9] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <ExportPanel
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                onExport={handleExport}
                exporting={exporting}
                error={exportError}
                hasStandings={hasStandings}
              />
            </div>

            {hasStandings && (
              <div className="bg-white rounded-2xl border border-[#E8ECE9] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-[#C2856C]" />
                  Export Preview — {theme.name}
                </h3>

                {/* Editable controls — OUTSIDE the export container (won't appear in PNG) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 no-export">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Custom Poster Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder={theme.name}
                      className="w-full px-3 py-2 border-2 border-[#E8ECE9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Tournament Date
                    </label>
                    <input
                      type="date"
                      value={tournamentDate}
                      onChange={(e) => setTournamentDate(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#E8ECE9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A86] focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                <div className="export-canvas-wrapper">
                  <div
                    ref={exportRef}
                    className="export-container"
                    style={{
                      background: theme.gradient,
                      color: theme.text,
                      fontFamily: theme.fontFamily,
                      border: `${theme.borderWidth} solid ${theme.border}`,
                    }}
                  >
                    {/* Header: logo + titles */}
                    <div className="export-header-row">
                      {logo.objectURL && (
                        <img src={logo.objectURL} alt="Tournament Logo" className="export-logo" />
                      )}
                      <div className="export-titles">
                        <div className="export-title" style={{ color: theme.text }}>
                          {customTitle || theme.name}
                        </div>
                        <div className="export-subtitle" style={{ color: theme.text }}>
                          {displayDate} |{' '}
                          {matchType === 'singles'
                            ? 'Singles'
                            : doublesSubMode === 'fixed'
                            ? 'Fixed Doubles'
                            : 'Social Doubles'}{' '}
                          Standings
                        </div>
                      </div>
                    </div>
                    <div className="export-header-rule" style={{ backgroundColor: theme.headerRule }} />

                    <table className="standings-table" style={{ color: theme.text }}>
                      <thead>
                        <tr style={{
                          borderBottomColor: theme.accent + '60',
                          borderBottomWidth: 2,
                          borderBottomStyle: 'solid',
                        }}>
                          <th className="col-pos">#</th>
                          <th className="col-name">
                            {matchType === 'doubles' && doublesSubMode === 'fixed'
                              ? 'Team / Pair'
                              : 'Player'}
                          </th>
                          <th className="col-stat">P</th>
                          <th className="col-stat">W</th>
                          <th className="col-stat">L</th>
                          <th className="col-stat">Win %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((row, idx) => {
                          const badgeBg =
                            idx === 0 ? theme.badgeGold
                              : idx === 1 ? theme.badgeSilver
                              : idx === 2 ? theme.badgeBronze
                              : 'transparent';
                          const badgeColor =
                            idx <= 2 ? (theme.logoStyle === 'dark' ? '#1A1A1A' : '#FFFFFF') : theme.text;
                          return (
                            <tr key={row.playerId} style={{
                              borderBottomColor: theme.accent + '40',
                              borderBottomWidth: 1,
                              borderBottomStyle: 'solid',
                            }}>
                              <td className="col-pos">
                                {idx <= 2 ? (
                                  <span className="pos-badge" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                                    {idx + 1}
                                  </span>
                                ) : (
                                  <span style={{ opacity: 0.5, paddingLeft: 8 }}>{row.position}</span>
                                )}
                              </td>
                              <td className="col-name" style={{
                                fontWeight: idx === 0 ? 700 : 500,
                                fontSize: idx === 0 ? '1rem' : '0.9375rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {row.playerName}
                              </td>
                              <td className="col-stat">{row.played}</td>
                              <td className="col-stat" style={{ color: theme.winnerColor, fontWeight: 600 }}>{row.wins}</td>
                              <td className="col-stat" style={{ color: theme.loserColor }}>{row.losses}</td>
                              <td className="col-stat" style={{ fontWeight: 700 }}>
                                {row.played > 0 ? `${row.winPct}%` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E8ECE9] bg-white/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-400">
          ReiCyn 2026 - All rights reserved.
        </div>
      </footer>
    </div>
  );
}
