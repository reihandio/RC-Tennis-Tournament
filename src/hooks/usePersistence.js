import { useEffect, useCallback, useRef } from 'react';
import { clampCourtCount, normalizeMatches } from '../utils/scheduler';

export const STORAGE_KEY = 'tennis_app_state';
const STATE_VERSION = 3;

function buildState(matchType, players, matches, selectedTheme, matchCountInput, customTitle, tournamentDate, doublesSubMode, columnPrefs, customValues, pointsPerWin, courtCount) {
  return {
    version: STATE_VERSION,
    timestamp: new Date().toISOString(),
    matchType,
    doublesSubMode: doublesSubMode || 'randomized',
    players,
    matches: normalizeMatches(matches),
    selectedTheme,
    matchCountInput,
    customTitle,
    tournamentDate,
    columnPrefs: columnPrefs || { gd: false, pts: false, custom: false },
    customValues: customValues || {},
    pointsPerWin: pointsPerWin || 2,
    courtCount: clampCourtCount(courtCount),
  };
}

function isValidState(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.players)) return false;
  if (!Array.isArray(data.matches)) return false;
  if (typeof data.matchType !== 'string') return false;
  for (const m of data.matches) {
    if (!Array.isArray(m.team1PlayerIds) || !Array.isArray(m.team2PlayerIds)) return false;
    if (typeof m.team1Score !== 'string' || typeof m.team2Score !== 'string') return false;
  }
  return true;
}

export function usePersistence({
  matchType,
  doublesSubMode,
  players,
  matches,
  selectedTheme,
  matchCountInput,
  customTitle,
  tournamentDate,
  columnPrefs,
  customValues,
  pointsPerWin,
  courtCount,
  setMatchType,
  setDoublesSubMode,
  setPlayers,
  setMatches,
  setSelectedTheme,
  setMatchCountInput,
  setCustomTitle,
  setTournamentDate,
  setColumnPrefs,
  setCustomValues,
  setPointsPerWin,
  setCourtCount,
  resetAll,
  removeLogo,
}) {
  const isRestoring = useRef(false);
  const hasRestored = useRef(false);

  // --- Auto-restore from localStorage on mount ---
  useEffect(() => {
    if (hasRestored.current) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!isValidState(data)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      isRestoring.current = true;
      if (data.players && data.players.length > 0) setPlayers(data.players);
      if (data.matches) setMatches(normalizeMatches(data.matches));
      if (data.matchType) setMatchType(data.matchType);
      if (data.courtCount !== undefined) setCourtCount(data.courtCount);
      if (data.selectedTheme) setSelectedTheme(data.selectedTheme);
      if (data.matchCountInput !== undefined) setMatchCountInput(data.matchCountInput || '');
      if (data.customTitle !== undefined) setCustomTitle(data.customTitle || '');
      if (data.tournamentDate !== undefined) setTournamentDate(data.tournamentDate || '');
      if (data.doublesSubMode) setDoublesSubMode(data.doublesSubMode);
      if (data.columnPrefs) setColumnPrefs(data.columnPrefs);
      if (data.customValues) setCustomValues(data.customValues);
      if (data.pointsPerWin !== undefined) setPointsPerWin(data.pointsPerWin);
      hasRestored.current = true;
      setTimeout(() => { isRestoring.current = false; }, 100);
    } catch (e) {
      console.warn('Failed to restore state from localStorage:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Auto-save to localStorage on state changes ---
  useEffect(() => {
    if (isRestoring.current || !hasRestored.current) return;
    if (players.length === 0) return;
    try {
      const state = buildState(matchType, players, matches, selectedTheme, matchCountInput, customTitle, tournamentDate, doublesSubMode, columnPrefs, customValues, pointsPerWin, courtCount);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }, [matchType, doublesSubMode, players, matches, selectedTheme, matchCountInput, customTitle, tournamentDate, columnPrefs, customValues, pointsPerWin, courtCount]);

  // Mark as restored so auto-save can begin after first load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasRestored.current && players.length > 0) {
        hasRestored.current = true;
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [players.length]);

  // --- JSON Export ---
  const exportJSON = useCallback(() => {
    try {
      const state = buildState(matchType, players, matches, selectedTheme, matchCountInput, customTitle, tournamentDate, doublesSubMode, columnPrefs, customValues, pointsPerWin, courtCount);
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tennis-tournament-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export JSON:', e);
    }
  }, [matchType, doublesSubMode, players, matches, selectedTheme, matchCountInput, customTitle, tournamentDate, columnPrefs, customValues, pointsPerWin, courtCount]);

  // --- JSON Import ---
  const importJSON = useCallback(
    (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!isValidState(data)) {
            alert('Invalid tournament file. The JSON structure is not recognized.\n\nPlease select a valid Tennis Match Manager export file.');
            return;
          }
          isRestoring.current = true;
          if (data.players) setPlayers(data.players);
          if (data.matches) setMatches(normalizeMatches(data.matches));
          if (data.matchType) setMatchType(data.matchType);
          if (data.courtCount !== undefined) setCourtCount(data.courtCount);
          if (data.selectedTheme) setSelectedTheme(data.selectedTheme);
          if (data.matchCountInput !== undefined) setMatchCountInput(data.matchCountInput || '');
          if (data.customTitle !== undefined) setCustomTitle(data.customTitle || '');
          if (data.tournamentDate !== undefined) setTournamentDate(data.tournamentDate || '');
          if (data.doublesSubMode) setDoublesSubMode(data.doublesSubMode);
          if (data.columnPrefs) setColumnPrefs(data.columnPrefs);
          if (data.customValues) setCustomValues(data.customValues);
          if (data.pointsPerWin !== undefined) setPointsPerWin(data.pointsPerWin);
          if (removeLogo) removeLogo();
          const state = buildState(
            data.matchType || 'singles',
            data.players || [],
            data.matches || [],
            data.selectedTheme || 'roland-garros',
            data.matchCountInput || '',
            data.customTitle || '',
            data.tournamentDate || '',
            data.doublesSubMode || 'randomized',
            data.columnPrefs || { gd: false, pts: false, custom: false },
            data.customValues || {},
            data.pointsPerWin || 2,
            data.courtCount ?? 1
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          hasRestored.current = true;
          setTimeout(() => { isRestoring.current = false; }, 100);
        } catch (err) {
          alert('Failed to parse the JSON file. Please check the file format.');
          console.error('JSON import error:', err);
        }
      };
      reader.readAsText(file);
    },
    [setPlayers, setMatches, setMatchType, setSelectedTheme, setMatchCountInput, setCustomTitle, setTournamentDate, setDoublesSubMode, setColumnPrefs, setCustomValues, setPointsPerWin, setCourtCount, removeLogo]
  );

  // --- Reset ---
  const handleReset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    hasRestored.current = false;
    if (removeLogo) removeLogo();
    resetAll();
  }, [resetAll, removeLogo]);

  return { exportJSON, importJSON, handleReset };
}
