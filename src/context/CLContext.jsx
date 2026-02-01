import React, { createContext, useContext, useState, useCallback } from 'react';
import { CL_TEAMS } from '../data/clTeams';

const CLContext = createContext();

export const useCL = () => useContext(CLContext);

/**
 * SIMPLIFIED CL CONTEXT
 * 
 * Key changes:
 * - Added `isReady` flag  
 * - Cleaner state management
 * - Single initialization path
 */

// Match result calculator
const calculateMatchResult = (teamA, teamB) => {
  const strengthDiff = teamA.strength - teamB.strength;
  
  let baseVolatility = 12;
  const dampener = Math.min(1, Math.abs(strengthDiff) / 20);
  const volatility = baseVolatility * (1 - dampener) + 2;

  const randomFactor = (Math.random() - 0.5) * (volatility * 2);
  let matchPerformance = strengthDiff + randomFactor;
  
  if (strengthDiff > 12) matchPerformance += 4;
  if (strengthDiff < -12) matchPerformance -= 4;

  let xGA = 1.35 + (matchPerformance / 16);
  let xGB = 1.35 - (matchPerformance / 16);
  
  xGA = Math.max(0.05, xGA);
  xGB = Math.max(0.05, xGB);
  
  const getGoals = (lambda) => {
    let l = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
      k++;
      p *= Math.random();
    } while (p > l);
    return k - 1;
  };
  
  return { scoreA: getGoals(xGA), scoreB: getGoals(xGB) };
};

// Simulate two-leg match
const simulateTwoLegMatch = (teamA, teamB) => {
  const leg1 = calculateMatchResult(teamB, teamA);
  const leg2 = calculateMatchResult(teamA, teamB);

  const aggA = leg1.scoreB + leg2.scoreA;
  const aggB = leg1.scoreA + leg2.scoreB;

  let winner;
  if (aggA > aggB) winner = teamA;
  else if (aggB > aggA) winner = teamB;
  else winner = Math.random() > 0.5 ? teamA : teamB;

  return {
    leg1ScoreA: leg1.scoreB,
    leg1ScoreB: leg1.scoreA,
    leg2ScoreA: leg2.scoreA,
    leg2ScoreB: leg2.scoreB,
    aggScoreA: aggA,
    aggScoreB: aggB,
    winner,
  };
};

export const CLProvider = ({ children }) => {
  const [phase, setPhase] = useState('SETUP');
  const [isReady, setIsReady] = useState(false);
  
  // Playoff matches
  const [leftPlayoffs, setLeftPlayoffs] = useState([]);
  const [rightPlayoffs, setRightPlayoffs] = useState([]);
  
  // R16 matches
  const [leftR16, setLeftR16] = useState([]);
  const [rightR16, setRightR16] = useState([]);
  
  // QF, SF, Final
  const [leftQF, setLeftQF] = useState([]);
  const [rightQF, setRightQF] = useState([]);
  const [leftSF, setLeftSF] = useState(null);
  const [rightSF, setRightSF] = useState(null);
  const [finalMatch, setFinalMatch] = useState(null);
  const [champion, setChampion] = useState(null);

  // Initialize tournament
  const startTournament = useCallback(() => {
    console.log('[CLContext] Starting tournament...');
    
    const leftMatches = CL_TEAMS.leftPlayoffs.map(p => ({
      ...p,
      leg1ScoreA: null, leg1ScoreB: null,
      leg2ScoreA: null, leg2ScoreB: null,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    const rightMatches = CL_TEAMS.rightPlayoffs.map(p => ({
      ...p,
      leg1ScoreA: null, leg1ScoreB: null,
      leg2ScoreA: null, leg2ScoreB: null,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    setLeftPlayoffs(leftMatches);
    setRightPlayoffs(rightMatches);
    setLeftR16([]);
    setRightR16([]);
    setLeftQF([]);
    setRightQF([]);
    setLeftSF(null);
    setRightSF(null);
    setFinalMatch(null);
    setChampion(null);
    setIsReady(true);
    setPhase('PLAYOFF');
    
    console.log('[CLContext] Phase set to PLAYOFF');
  }, []);

  // Simulate playoff
  const simulatePlayoff = useCallback((matchId, side) => {
    const setter = side === 'left' ? setLeftPlayoffs : setRightPlayoffs;
    
    setter(prev => prev.map(m => {
      if (m.id !== matchId || m.played) return m;
      const result = simulateTwoLegMatch(m.home, m.away);
      return { ...m, ...result, played: true };
    }));
  }, []);

  // Simulate all playoffs
  const simulateAllPlayoffs = useCallback(() => {
    setLeftPlayoffs(prev => prev.map(m => {
      if (m.played) return m;
      const result = simulateTwoLegMatch(m.home, m.away);
      return { ...m, ...result, played: true };
    }));
    
    setRightPlayoffs(prev => prev.map(m => {
      if (m.played) return m;
      const result = simulateTwoLegMatch(m.home, m.away);
      return { ...m, ...result, played: true };
    }));
  }, []);

  // Initialize R16
  const initializeR16 = useCallback(() => {
    const leftWinners = leftPlayoffs.filter(m => m.played).map(m => m.winner);
    const rightWinners = rightPlayoffs.filter(m => m.played).map(m => m.winner);
    
    if (!leftWinners || !rightWinners || leftWinners.length < 4 || rightWinners.length < 4) return;

    // Draw: randomly assign direct qualifiers
    const drawnPairs = CL_TEAMS.directQualifierPairs.map(pair => {
      const goesLeft = Math.random() > 0.5;
      return {
        leftTeam: goesLeft ? pair.teamA : pair.teamB,
        rightTeam: goesLeft ? pair.teamB : pair.teamA,
      };
    });

    const leftR16Matches = leftWinners.map((playoffWinner, i) => ({
      id: `R16-L${i}`,
      teamA: drawnPairs[i].leftTeam,
      teamB: playoffWinner,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    const rightR16Matches = rightWinners.map((playoffWinner, i) => ({
      id: `R16-R${i}`,
      teamA: drawnPairs[i].rightTeam,
      teamB: playoffWinner,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    setLeftR16(leftR16Matches);
    setRightR16(rightR16Matches);
    setPhase('R16');
  }, [leftPlayoffs, rightPlayoffs]);

  // Simulate R16
  const simulateAllR16 = useCallback(() => {
    setLeftR16(prev => prev.map(m => {
      if (m.played) return m;
      const result = simulateTwoLegMatch(m.teamA, m.teamB);
      return { ...m, ...result, played: true };
    }));
    
    setRightR16(prev => prev.map(m => {
      if (m.played) return m;
      const result = simulateTwoLegMatch(m.teamA, m.teamB);
      return { ...m, ...result, played: true };
    }));
  }, []);

  // Initialize QF
  const initializeQF = useCallback(() => {
    const leftWinners = leftR16.filter(m => m.played).map(m => m.winner);
    const rightWinners = rightR16.filter(m => m.played).map(m => m.winner);

    if (leftWinners.length < 4 || rightWinners.length < 4) return;

    setLeftQF([
      { id: 'QF-L0', teamA: leftWinners[0], teamB: leftWinners[1], winner: null, played: false },
      { id: 'QF-L1', teamA: leftWinners[2], teamB: leftWinners[3], winner: null, played: false },
    ]);
    setRightQF([
      { id: 'QF-R0', teamA: rightWinners[0], teamB: rightWinners[1], winner: null, played: false },
      { id: 'QF-R1', teamA: rightWinners[2], teamB: rightWinners[3], winner: null, played: false },
    ]);
    setPhase('QF');
  }, [leftR16, rightR16]);

  // Simulate QF
  const simulateAllQF = useCallback(() => {
    setLeftQF(prev => prev.map(m => {
      if (m.played) return m;
      const result = simulateTwoLegMatch(m.teamA, m.teamB);
      return { ...m, ...result, played: true };
    }));
    
    setRightQF(prev => prev.map(m => {
      if (m.played) return m;
      const result = simulateTwoLegMatch(m.teamA, m.teamB);
      return { ...m, ...result, played: true };
    }));
  }, []);

  // Initialize SF
  const initializeSF = useCallback(() => {
    const leftWinners = leftQF.filter(m => m.played).map(m => m.winner);
    const rightWinners = rightQF.filter(m => m.played).map(m => m.winner);

    if (leftWinners.length < 2 || rightWinners.length < 2) return;

    setLeftSF({ id: 'SF-L', teamA: leftWinners[0], teamB: leftWinners[1], winner: null, played: false });
    setRightSF({ id: 'SF-R', teamA: rightWinners[0], teamB: rightWinners[1], winner: null, played: false });
    setPhase('SF');
  }, [leftQF, rightQF]);

  // Simulate SF
  const simulateAllSF = useCallback(() => {
    if (leftSF && !leftSF.played) {
      const result = simulateTwoLegMatch(leftSF.teamA, leftSF.teamB);
      setLeftSF({ ...leftSF, ...result, played: true });
    }
    if (rightSF && !rightSF.played) {
      const result = simulateTwoLegMatch(rightSF.teamA, rightSF.teamB);
      setRightSF({ ...rightSF, ...result, played: true });
    }
  }, [leftSF, rightSF]);

  // Initialize Final
  const initializeFinal = useCallback(() => {
    if (!leftSF?.played || !rightSF?.played) return;
    
    setFinalMatch({
      id: 'FINAL',
      teamA: leftSF.winner,
      teamB: rightSF.winner,
      scoreA: null,
      scoreB: null,
      winner: null,
      played: false,
    });
    setPhase('FINAL');
  }, [leftSF, rightSF]);

  // Simulate Final
  const simulateFinal = useCallback(() => {
    if (!finalMatch || finalMatch.played) return;
    
    const result = calculateMatchResult(finalMatch.teamA, finalMatch.teamB);
    let winner;
    if (result.scoreA > result.scoreB) winner = finalMatch.teamA;
    else if (result.scoreB > result.scoreA) winner = finalMatch.teamB;
    else winner = Math.random() > 0.5 ? finalMatch.teamA : finalMatch.teamB;
    
    setFinalMatch({ ...finalMatch, scoreA: result.scoreA, scoreB: result.scoreB, winner, played: true });
    setChampion(winner);
    setPhase('COMPLETE');
  }, [finalMatch]);

  // Reset
  const resetTournament = useCallback(() => {
    setPhase('SETUP');
    setIsReady(false);
    setLeftPlayoffs([]);
    setRightPlayoffs([]);
    setLeftR16([]);
    setRightR16([]);
    setLeftQF([]);
    setRightQF([]);
    setLeftSF(null);
    setRightSF(null);
    setFinalMatch(null);
    setChampion(null);
  }, []);

  // === MANUAL CONTROL ===
  
  // Manually select winner for any match
  const setManualWinner = useCallback((matchId, winnerId, stage) => {
    const createWinResult = (match, winnerId) => {
      const teamA = match.home || match.teamA;
      const teamB = match.away || match.teamB;
      const winner = teamA?.id === winnerId ? teamA : teamB;
      return {
        leg1ScoreA: teamA?.id === winnerId ? 2 : 0,
        leg1ScoreB: teamA?.id === winnerId ? 0 : 2,
        leg2ScoreA: teamA?.id === winnerId ? 1 : 0,
        leg2ScoreB: teamA?.id === winnerId ? 0 : 1,
        aggScoreA: teamA?.id === winnerId ? 3 : 0,
        aggScoreB: teamB?.id === winnerId ? 3 : 0,
        winner,
        played: true
      };
    };

    if (stage === 'PLAYOFF') {
      const isLeft = matchId.includes('-L');
      const setter = isLeft ? setLeftPlayoffs : setRightPlayoffs;
      setter(prev => prev.map(m => {
        if (m.id !== matchId || m.played) return m;
        return { ...m, ...createWinResult(m, winnerId) };
      }));
    } else if (stage === 'R16') {
      const isLeft = matchId.includes('-L');
      const setter = isLeft ? setLeftR16 : setRightR16;
      setter(prev => prev.map(m => {
        if (m.id !== matchId || m.played) return m;
        return { ...m, ...createWinResult(m, winnerId) };
      }));
    } else if (stage === 'QF') {
      const isLeft = matchId.includes('-L');
      const setter = isLeft ? setLeftQF : setRightQF;
      setter(prev => prev.map(m => {
        if (m.id !== matchId || m.played) return m;
        return { ...m, ...createWinResult(m, winnerId) };
      }));
    } else if (stage === 'SF') {
      const isLeft = matchId.includes('-L');
      if (isLeft && leftSF && !leftSF.played) {
        setLeftSF({ ...leftSF, ...createWinResult(leftSF, winnerId) });
      } else if (!isLeft && rightSF && !rightSF.played) {
        setRightSF({ ...rightSF, ...createWinResult(rightSF, winnerId) });
      }
    } else if (stage === 'FINAL') {
      if (finalMatch && !finalMatch.played) {
        const teamA = finalMatch.teamA;
        const teamB = finalMatch.teamB;
        const winner = teamA?.id === winnerId ? teamA : teamB;
        setFinalMatch({
          ...finalMatch,
          scoreA: teamA?.id === winnerId ? 2 : 0,
          scoreB: teamB?.id === winnerId ? 2 : 0,
          winner,
          played: true
        });
        setChampion(winner);
        setPhase('COMPLETE');
      }
    }
  }, [leftSF, rightSF, finalMatch]);

  // Computed states
  const allPlayoffsPlayed = leftPlayoffs.length > 0 && leftPlayoffs.every(m => m.played) && rightPlayoffs.every(m => m.played);
  const allR16Played = leftR16.length > 0 && leftR16.every(m => m.played) && rightR16.every(m => m.played);
  const allQFPlayed = leftQF.length > 0 && leftQF.every(m => m.played) && rightQF.every(m => m.played);
  const allSFPlayed = leftSF?.played && rightSF?.played;

  return (
    <CLContext.Provider value={{
      phase,
      isReady,
      leftPlayoffs, rightPlayoffs,
      leftR16, rightR16,
      leftQF, rightQF,
      leftSF, rightSF,
      finalMatch, champion,
      
      startTournament,
      simulatePlayoff, simulateAllPlayoffs,
      initializeR16, simulateAllR16,
      initializeQF, simulateAllQF,
      initializeSF, simulateAllSF,
      initializeFinal, simulateFinal,
      resetTournament,
      setManualWinner,
      
      allPlayoffsPlayed, allR16Played, allQFPlayed, allSFPlayed,
    }}>
      {children}
    </CLContext.Provider>
  );
};
