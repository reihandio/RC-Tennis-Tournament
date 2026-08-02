import { useState, useCallback, useEffect, useRef } from 'react';
import { generateRoundRobin, generateSocialDoubles } from '../utils/roundRobin';

let nextId = 1;
function generateId(prefix) {
  return `${prefix}-${nextId++}-${Date.now()}`;
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
  const [doublesSubMode, setDoublesSubMode] = useState('randomized'); // 'fixed' | 'randomized'
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchCountInput, setMatchCountInput] = useState('');
  const playersRef = useRef(players);
  const subModeRef = useRef(doublesSubMode);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    subModeRef.current = doublesSubMode;
  }, [doublesSubMode]);

  const setMatchTypeWithReset = useCallback((type) => {
    setMatchType(type);
    setMatchCountInput('');
    setMatches([]);
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

    if (matchType === 'singles') {
      if (currentPlayers.length < 2) return;
      setMatches(generateRoundRobin(currentPlayers, targetCount));
    } else {
      // Doubles — check sub-mode
      if (subModeRef.current === 'fixed') {
        // Fixed pairs: each player entry IS a pair
        if (currentPlayers.length < 2) return;
        setMatches(generateRoundRobin(currentPlayers, targetCount));
      } else {
        // Randomized/social doubles
        if (currentPlayers.length < 4) return;
        setMatches(generateSocialDoubles(currentPlayers, targetCount));
      }
    }
  }, [matchType]);

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

  const addCustomMatch = useCallback(() => {
    const currentPlayers = playersRef.current;
    const matchId = generateId('match');
    const currentSubMode = subModeRef.current;

    let team1Ids, team2Ids;

    if (matchType === 'singles') {
      team1Ids = currentPlayers.length > 0 ? [currentPlayers[0].id] : [];
      team2Ids = currentPlayers.length > 1 ? [currentPlayers[1].id] : [];
    } else if (currentSubMode === 'fixed') {
      team1Ids = currentPlayers.length > 0 ? [currentPlayers[0].id] : [];
      team2Ids = currentPlayers.length > 1 ? [currentPlayers[1].id] : [];
    } else {
      // Randomized doubles: 2 players per team
      team1Ids = currentPlayers.length > 1
        ? [currentPlayers[0].id, currentPlayers[1].id]
        : currentPlayers.length > 0 ? [currentPlayers[0].id] : [];
      team2Ids = currentPlayers.length > 3
        ? [currentPlayers[2].id, currentPlayers[3].id]
        : currentPlayers.length > 2 ? [currentPlayers[2].id] : [];
    }

    setMatches((prev) => [
      ...prev,
      {
        id: matchId,
        team1PlayerIds: team1Ids,
        team2PlayerIds: team2Ids,
        team1Score: '',
        team2Score: '',
        winnerId: null,
      },
    ]);
  }, [matchType]);

  // --- Reset All ---

  const resetAll = useCallback(() => {
    setMatchType('singles');
    setDoublesSubMode('randomized');
    setMatchCountInput('');
    setMatches([]);
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
    participants: players,
  };
}
