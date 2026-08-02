import { useMemo } from 'react';
import { calculateStandings } from '../utils/standingsCalc';

export function useStandings(matches, participants, { pointsPerWin = 2 } = {}) {
  const standings = useMemo(() => {
    return calculateStandings(participants, matches, { pointsPerWin });
  }, [matches, participants, pointsPerWin]);

  return standings;
}
