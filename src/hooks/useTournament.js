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

const DEFAULT_DOUBLES_PLAYERS = [
  'Cynthia',
  'Rei',
  'Alex',
  'Jordan',
];

export function useTournament() {
  const [matchType, setMatchType] = useState('singles');
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchCountInput, setMatchCountInput] = useState('');
  const playersRef = useRef(players);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

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
      if (currentPlayers.length < 4) return;
      setMatches(generateSocialDoubles(currentPlayers, targetCount));
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

  // --- Reset All ---

  const resetAll = useCallback(() => {
    setMatchType('singles');
    setMatchCountInput('');
    setMatches([]);
    // Load fresh defaults
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
      : participantCount >= 4 ? Math.max(participantCount, 4) * Math.floor(participantCount / 4) : 0;

  return {
    matchType,
    setMatchTypeRaw: setMatchType,
    setMatchType: setMatchTypeWithReset,
    players,
    setPlayers,
    addPlayer,
    removePlayer,
    matches,
    setMatches,
    generateMatches,
    updateScore,
    resetMatches,
    resetAll,
    defaultMatchCount,
    matchCountInput,
    setMatchCountInput,
    participants: players,
  };
}
