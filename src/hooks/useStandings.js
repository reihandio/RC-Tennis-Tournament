import { useMemo } from 'react';
import { calculateStandings } from '../utils/standingsCalc';

/**
 * @param {Array} matches
 * @param {Array<{id: string, name: string}>} participants - individual players
 */
export function useStandings(matches, participants) {
  const standings = useMemo(() => {
    return calculateStandings(participants, matches);
  }, [matches, participants]);

  return standings;
}
