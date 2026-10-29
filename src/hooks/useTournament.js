import { useState, useCallback, useEffect, useRef } from 'react';
import {
  clampCourtCount,
  clampCourt,
  clampRound,
  generateSchedule,
} from '../utils/scheduler';

let nextId = 1;
function generateId(prefix) {
  return `${prefix}-${nextId++}-${Date.now()}`;
}

function winnerFromScores(s1, s2) {
  if (
    s1 !== '' && s2 !== '' &&
    /^\d+$/.test(String(s1).trim()) &&
    /^\d+$/.test(String(s2).trim())
  ) {
    const n1 = parseInt(s1, 10);
    const n2 = parseInt(s2, 10);
    if (n1 > n2) return 'team1';
    if (n2 > n1) return 'team2';
    return 'draw';
  }
  return null;
}

function defaultCustomTeams(players, matchType, doublesSubMode) {
  const isFixedDoubles = matchType === 'doubles' && doublesSubMode === 'fixed';
  if (matchType === 'singles' || isFixedDoubles) {
    return {
      team1PlayerIds: players.length > 0 ? [players[0].id] : [],
      team2PlayerIds: players.length > 1 ? [players[1].id] : [],
    };
  }
  return {
    team1PlayerIds: players.length > 1
      ? [players[0].id, players[1].id]
      : players.length > 0 ? [players[0].id] : [],
    team2PlayerIds: players.length > 3
      ? [players[2].id, players[3].id]
      : players.length > 2 ? [players[2].id] : [],
  };
}

const DEFAULT_SINGLES = [
  'Carlos Alcaraz',
  'Novak Djokovic',
  'Jannik Sinner',
  'Daniil Medvedev',
];

const DEFAULT_DOUBLES_FIXED = [
  'Alcaraz & Nadal',
  'Sinner & Medvedev',
  'Djokovic & Murray',
  'Ruud & Rune',
];

const DEFAULT_DOUBLES_RANDOM = [
  'Cynthia',
  'Rei',
  'Alex',
  'Jordan',
];

export function useTournament() {
  const [matchType, setMatchType] = useState('singles');
  const [doublesSubMode, setDoublesSubMode] = useState('randomized');
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchCountInput, setMatchCountInput] = useState('');
  const [courtCount, setCourtCountState] = useState(1);
  const [generationError, setGenerationError] = useState(null);

  // Column preferences & custom values
  const [columnPrefs, setColumnPrefs] = useState({ gd: false, pts: false, custom: false });
  const [customValues, setCustomValues] = useState({}); // { playerId: string }
  const [pointsPerWin, setPointsPerWin] = useState(2);
  const playersRef = useRef(players);
  const subModeRef = useRef(doublesSubMode);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    subModeRef.current = doublesSubMode;
  }, [doublesSubMode]);

  const setCourtCount = useCallback((value) => {
    setCourtCountState(clampCourtCount(value));
  }, []);

  const setMatchTypeWithReset = useCallback((type) => {
    setMatchType(type);
    setMatchCountInput('');
    setMatches([]);
    setGenerationError(null);
  }, []);

  // --- Player Management ---

  const addPlayer = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    let added = false;
    setPlayers((prev) => {
      if (prev.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      added = true;
      return [...prev, { id: generateId('player'), name: trimmed }];
    });
    return added;
  }, []);

  const removePlayer = useCallback((id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setMatches((prev) =>
      prev.filter(
        (m) => !m.team1PlayerIds.includes(id) && !m.team2PlayerIds.includes(id)
      )
    );
  }, []);

  // --- Match Generation ---

  const generateMatches = useCallback((customCount) => {
    const currentPlayers = playersRef.current;
    const targetCount = customCount || undefined;
    const currentSubMode = subModeRef.current;

    setGenerationError(null);

    const result = generateSchedule({
      players: currentPlayers,
      matchCount: targetCount,
      courtCount,
      matchType,
      doublesSubMode: currentSubMode,
    });

    if (result.error) {
      setGenerationError(result.error);
      return;
    }

    setMatches(result.matches);
  }, [matchType, courtCount]);

  const updateScore = useCallback((matchId, field, value) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const updated = { ...m, [field]: value };
        const s1 = field === 'team1Score' ? value : m.team1Score;
        const s2 = field === 'team2Score' ? value : m.team2Score;
        if (
          s1 !== '' && s2 !== '' &&
          /^\d+$/.test(String(s1).trim()) &&
          /^\d+$/.test(String(s2).trim())
        ) {
          const n1 = parseInt(s1, 10);
          const n2 = parseInt(s2, 10);
          if (n1 > n2) updated.winnerId = 'team1';
          else if (n2 > n1) updated.winnerId = 'team2';
          else updated.winnerId = 'draw';
        } else {
          updated.winnerId = null;
        }
        return updated;
      })
    );
  }, []);

  const resetMatches = useCallback(() => {
    setMatches([]);
    setMatchCountInput('');
    setGenerationError(null);
  }, []);

  // --- Match Editing ---

  const deleteMatch = useCallback((matchId) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  }, []);

  const saveMatchEdit = useCallback((matchId, editData) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const updated = {
          ...m,
          team1PlayerIds: editData.team1PlayerIds,
          team2PlayerIds: editData.team2PlayerIds,
          team1Score: editData.team1Score,
          team2Score: editData.team2Score,
          round: clampRound(editData.round ?? m.round),
          court: clampCourt(editData.court ?? m.court),
        };
        // Recalculate winner
        const s1 = updated.team1Score;
        const s2 = updated.team2Score;
        if (
          s1 !== '' && s2 !== '' &&
          /^\d+$/.test(String(s1).trim()) &&
          /^\d+$/.test(String(s2).trim())
        ) {
          const n1 = parseInt(s1, 10);
          const n2 = parseInt(s2, 10);
          if (n1 > n2) updated.winnerId = 'team1';
          else if (n2 > n1) updated.winnerId = 'team2';
          else updated.winnerId = 'draw';
        } else {
          updated.winnerId = null;
        }
        return updated;
      })
    );
  }, []);

  const addCustomMatch = useCallback((fixture) => {
    const currentPlayers = playersRef.current;
    const currentSubMode = subModeRef.current;
    const defaults = defaultCustomTeams(currentPlayers, matchType, currentSubMode);

    const team1PlayerIds = fixture?.team1PlayerIds || defaults.team1PlayerIds;
    const team2PlayerIds = fixture?.team2PlayerIds || defaults.team2PlayerIds;
    const team1Score = fixture?.team1Score ?? '';
    const team2Score = fixture?.team2Score ?? '';

    setMatches((prev) => {
      const maxRound = prev.reduce((max, match, index) => {
        const round = parseInt(match.round, 10);
        const safeRound = Number.isFinite(round) && round >= 1 ? round : index + 1;
        return Math.max(max, safeRound);
      }, 0);

      return [
        ...prev,
        {
          id: generateId('match'),
          team1PlayerIds,
          team2PlayerIds,
          team1Score,
          team2Score,
          winnerId: winnerFromScores(team1Score, team2Score),
          round: clampRound(fixture?.round ?? maxRound + 1),
          court: clampCourt(fixture?.court ?? 1),
        },
      ];
    });
  }, [matchType]);

  // --- Reset All ---

  const resetAll = useCallback(() => {
    setMatchType('singles');
    setDoublesSubMode('randomized');
    setMatchCountInput('');
    setMatches([]);
    setCourtCountState(1);
    setGenerationError(null);
    const defaultPlayers = DEFAULT_SINGLES.map((name) => ({
      id: generateId('player'),
      name,
    }));
    setPlayers(defaultPlayers);
  }, []);

  // --- Computed ---

  const participantCount = players.length;
  const defaultMatchCount =
    matchType === 'singles'
      ? participantCount >= 2 ? (participantCount * (participantCount - 1)) / 2 : 0
      : doublesSubMode === 'fixed'
      ? participantCount >= 2 ? (participantCount * (participantCount - 1)) / 2 : 0
      : participantCount >= 4 ? Math.max(participantCount, 4) * Math.floor(participantCount / 4) : 0;

  return {
    matchType,
    setMatchTypeRaw: setMatchType,
    setMatchType: setMatchTypeWithReset,
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
    courtCount,
    setCourtCount,
    generationError,
    columnPrefs,
    setColumnPrefs,
    customValues,
    setCustomValues,
    pointsPerWin,
    setPointsPerWin,
    participants: players,
  };
}
