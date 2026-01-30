import React, { createContext, useContext, useState } from 'react';
import { CL_TEAMS } from '../data/clTeams';

const CLContext = createContext();

export const useCL = () => useContext(CLContext);

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
  
  let scoreA = getGoals(xGA);
  let scoreB = getGoals(xGB);
  
  if (strengthDiff > 15 && scoreB >= scoreA) {
    if (Math.random() > 0.05) {
      scoreA = scoreB + 1 + Math.floor(Math.random() * 2);
    }
  } else if (strengthDiff < -15 && scoreA >= scoreB) {
    if (Math.random() > 0.05) {
      scoreB = scoreA + 1 + Math.floor(Math.random() * 2);
    }
  }
  
  return { scoreA, scoreB };
};

// Simulate two-leg match
const simulateTwoLegMatch = (teamA, teamB) => {
  const leg1 = calculateMatchResult(teamB, teamA);
  const leg2 = calculateMatchResult(teamA, teamB);

  const aggA = leg1.scoreB + leg2.scoreA;
  const aggB = leg1.scoreA + leg2.scoreB;

  let winner;
  if (aggA > aggB) {
    winner = teamA;
  } else if (aggB > aggA) {
    winner = teamB;
  } else {
    winner = Math.random() > 0.5 ? teamA : teamB;
  }

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
  
  // Playoff matches - separated by side
  const [leftPlayoffs, setLeftPlayoffs] = useState([]);
  const [rightPlayoffs, setRightPlayoffs] = useState([]);
  
  // R16 potential opponents (before draw)
  const [r16Potentials, setR16Potentials] = useState([]);
  const [drawComplete, setDrawComplete] = useState(false);
  
  // R16 matches after draw
  const [leftR16, setLeftR16] = useState([]);
  const [rightR16, setRightR16] = useState([]);
  
  // Further rounds
  const [leftQF, setLeftQF] = useState([]);
  const [rightQF, setRightQF] = useState([]);
  const [leftSF, setLeftSF] = useState(null);
  const [rightSF, setRightSF] = useState(null);
  const [finalMatch, setFinalMatch] = useState(null);
  const [champion, setChampion] = useState(null);

  // Initialize tournament
  const initializeTournament = () => {
    // Create left playoff matches
    const leftMatches = CL_TEAMS.leftPlayoffs.map(p => ({
      ...p,
      leg1ScoreA: null, leg1ScoreB: null,
      leg2ScoreA: null, leg2ScoreB: null,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    // Create right playoff matches
    const rightMatches = CL_TEAMS.rightPlayoffs.map(p => ({
      ...p,
      leg1ScoreA: null, leg1ScoreB: null,
      leg2ScoreA: null, leg2ScoreB: null,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    // Set up potential R16 opponents (pairs)
    const potentials = CL_TEAMS.directQualifierPairs.map(pair => ({
      ...pair,
      leftTeam: null, // Will be assigned after draw
      rightTeam: null,
    }));

    setLeftPlayoffs(leftMatches);
    setRightPlayoffs(rightMatches);
    setR16Potentials(potentials);
    setPhase('PLAYOFF');
  };

  // Simulate a playoff match
  const simulatePlayoff = (matchId, side) => {
    const setter = side === 'left' ? setLeftPlayoffs : setRightPlayoffs;
    
    setter(prev => prev.map(m => {
      if (m.id !== matchId || m.played) return m;
      
      const result = simulateTwoLegMatch(m.home, m.away);
      return { ...m, ...result, played: true };
    }));
  };

  // Select playoff winner manually
  const selectPlayoffWinner = (matchId, winnerId, side) => {
    const setter = side === 'left' ? setLeftPlayoffs : setRightPlayoffs;
    
    setter(prev => prev.map(m => {
      if (m.id !== matchId || m.played) return m;
      
      const winner = m.home.id === winnerId ? m.home : m.away;
      const isHomeWin = m.home.id === winnerId;
      
      return {
        ...m,
        leg1ScoreA: isHomeWin ? 2 : 0,
        leg1ScoreB: isHomeWin ? 0 : 1,
        leg2ScoreA: isHomeWin ? 1 : 0,
        leg2ScoreB: isHomeWin ? 0 : 2,
        aggScoreA: isHomeWin ? 3 : 0,
        aggScoreB: isHomeWin ? 0 : 3,
        winner,
        played: true,
      };
    }));
  };

  // Simulate all playoffs
  const simulateAllPlayoffs = () => {
    leftPlayoffs.forEach(m => { if (!m.played) simulatePlayoff(m.id, 'left'); });
    rightPlayoffs.forEach(m => { if (!m.played) simulatePlayoff(m.id, 'right'); });
  };

  // Perform R16 draw - assigns direct qualifiers to left/right
  const performR16Draw = () => {
    const leftWinners = leftPlayoffs.filter(m => m.played).map(m => m.winner);
    const rightWinners = rightPlayoffs.filter(m => m.played).map(m => m.winner);
    
    if (leftWinners.length < 4 || rightWinners.length < 4) return;

    // Draw: for each pair, randomly assign one to left, one to right
    const drawnPairs = CL_TEAMS.directQualifierPairs.map(pair => {
      const goesLeft = Math.random() > 0.5;
      return {
        ...pair,
        leftTeam: goesLeft ? pair.teamA : pair.teamB,
        rightTeam: goesLeft ? pair.teamB : pair.teamA,
      };
    });

    // Create R16 matches
    // Left R16: playoff winner vs drawn direct qualifier
    const leftR16Matches = leftWinners.map((playoffWinner, i) => ({
      id: `R16-L${i}`,
      teamA: drawnPairs[i].leftTeam,
      teamB: playoffWinner,
      position: i,
      leg1ScoreA: null, leg1ScoreB: null,
      leg2ScoreA: null, leg2ScoreB: null,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    const rightR16Matches = rightWinners.map((playoffWinner, i) => ({
      id: `R16-R${i}`,
      teamA: drawnPairs[i].rightTeam,
      teamB: playoffWinner,
      position: i,
      leg1ScoreA: null, leg1ScoreB: null,
      leg2ScoreA: null, leg2ScoreB: null,
      aggScoreA: null, aggScoreB: null,
      winner: null, played: false,
    }));

    setR16Potentials(drawnPairs);
    setLeftR16(leftR16Matches);
    setRightR16(rightR16Matches);
    setDrawComplete(true);
    setPhase('R16');
  };

  // Simulate R16 match
  const simulateR16 = (matchId, side) => {
    const setter = side === 'left' ? setLeftR16 : setRightR16;
    
    setter(prev => prev.map(m => {
      if (m.id !== matchId || m.played) return m;
      const result = simulateTwoLegMatch(m.teamA, m.teamB);
      return { ...m, ...result, played: true };
    }));
  };

  const selectR16Winner = (matchId, winnerId, side) => {
    const setter = side === 'left' ? setLeftR16 : setRightR16;
    
    setter(prev => prev.map(m => {
      if (m.id !== matchId || m.played) return m;
      const winner = m.teamA.id === winnerId ? m.teamA : m.teamB;
      return { ...m, winner, played: true, aggScoreA: winner === m.teamA ? 3 : 0, aggScoreB: winner === m.teamB ? 3 : 0 };
    }));
  };

  const simulateAllR16 = () => {
    leftR16.forEach(m => { if (!m.played) simulateR16(m.id, 'left'); });
    rightR16.forEach(m => { if (!m.played) simulateR16(m.id, 'right'); });
  };

  // Initialize QF
  const initializeQF = () => {
    const leftWinners = leftR16.filter(m => m.played).map(m => m.winner);
    const rightWinners = rightR16.filter(m => m.played).map(m => m.winner);

    if (leftWinners.length < 4 || rightWinners.length < 4) return;

    // QF matches: 0vs1, 2vs3
    setLeftQF([
      { id: 'QF-L0', teamA: leftWinners[0], teamB: leftWinners[1], winner: null, played: false, aggScoreA: null, aggScoreB: null },
      { id: 'QF-L1', teamA: leftWinners[2], teamB: leftWinners[3], winner: null, played: false, aggScoreA: null, aggScoreB: null },
    ]);
    setRightQF([
      { id: 'QF-R0', teamA: rightWinners[0], teamB: rightWinners[1], winner: null, played: false, aggScoreA: null, aggScoreB: null },
      { id: 'QF-R1', teamA: rightWinners[2], teamB: rightWinners[3], winner: null, played: false, aggScoreA: null, aggScoreB: null },
    ]);
    setPhase('QF');
  };

  // Simulate QF
  const simulateQF = (matchId, side) => {
    const setter = side === 'left' ? setLeftQF : setRightQF;
    setter(prev => prev.map(m => {
      if (m.id !== matchId || m.played) return m;
      const result = simulateTwoLegMatch(m.teamA, m.teamB);
      return { ...m, ...result, played: true };
    }));
  };

  const selectQFWinner = (matchId, winnerId, side) => {
    const setter = side === 'left' ? setLeftQF : setRightQF;
    setter(prev => prev.map(m => {
      if (m.id !== matchId || m.played) return m;
      const winner = m.teamA.id === winnerId ? m.teamA : m.teamB;
      return { ...m, winner, played: true, aggScoreA: winner === m.teamA ? 2 : 0, aggScoreB: winner === m.teamB ? 2 : 0 };
    }));
  };

  const simulateAllQF = () => {
    leftQF.forEach(m => { if (!m.played) simulateQF(m.id, 'left'); });
    rightQF.forEach(m => { if (!m.played) simulateQF(m.id, 'right'); });
  };

  // Initialize SF
  const initializeSF = () => {
    const leftWinners = leftQF.filter(m => m.played).map(m => m.winner);
    const rightWinners = rightQF.filter(m => m.played).map(m => m.winner);

    if (leftWinners.length < 2 || rightWinners.length < 2) return;

    setLeftSF({ id: 'SF-L', teamA: leftWinners[0], teamB: leftWinners[1], winner: null, played: false, aggScoreA: null, aggScoreB: null });
    setRightSF({ id: 'SF-R', teamA: rightWinners[0], teamB: rightWinners[1], winner: null, played: false, aggScoreA: null, aggScoreB: null });
    setPhase('SF');
  };

  // Simulate SF
  const simulateSF = (side) => {
    const setter = side === 'left' ? setLeftSF : setRightSF;
    const match = side === 'left' ? leftSF : rightSF;
    
    if (!match || match.played) return;
    
    const result = simulateTwoLegMatch(match.teamA, match.teamB);
    setter({ ...match, ...result, played: true });
  };

  const selectSFWinner = (winnerId, side) => {
    const setter = side === 'left' ? setLeftSF : setRightSF;
    const match = side === 'left' ? leftSF : rightSF;
    
    if (!match || match.played) return;
    
    const winner = match.teamA.id === winnerId ? match.teamA : match.teamB;
    setter({ ...match, winner, played: true, aggScoreA: winner === match.teamA ? 2 : 0, aggScoreB: winner === match.teamB ? 2 : 0 });
  };

  const simulateAllSF = () => {
    if (leftSF && !leftSF.played) simulateSF('left');
    if (rightSF && !rightSF.played) simulateSF('right');
  };

  // Initialize Final
  const initializeFinal = () => {
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
  };

  // Simulate Final
  const simulateFinal = () => {
    if (!finalMatch || finalMatch.played) return;
    
    const result = calculateMatchResult(finalMatch.teamA, finalMatch.teamB);
    let winner;
    if (result.scoreA > result.scoreB) winner = finalMatch.teamA;
    else if (result.scoreB > result.scoreA) winner = finalMatch.teamB;
    else winner = Math.random() > 0.5 ? finalMatch.teamA : finalMatch.teamB;
    
    setFinalMatch({ ...finalMatch, scoreA: result.scoreA, scoreB: result.scoreB, winner, played: true });
    setChampion(winner);
    setPhase('COMPLETE');
  };

  const selectFinalWinner = (winnerId) => {
    if (!finalMatch || finalMatch.played) return;
    
    const winner = finalMatch.teamA.id === winnerId ? finalMatch.teamA : finalMatch.teamB;
    setFinalMatch({ ...finalMatch, scoreA: winner === finalMatch.teamA ? 2 : 1, scoreB: winner === finalMatch.teamB ? 2 : 1, winner, played: true });
    setChampion(winner);
    setPhase('COMPLETE');
  };

  // Reset
  const resetTournament = () => {
    setPhase('SETUP');
    setLeftPlayoffs([]);
    setRightPlayoffs([]);
    setR16Potentials([]);
    setDrawComplete(false);
    setLeftR16([]);
    setRightR16([]);
    setLeftQF([]);
    setRightQF([]);
    setLeftSF(null);
    setRightSF(null);
    setFinalMatch(null);
    setChampion(null);
  };

  // Computed states
  const allPlayoffsPlayed = leftPlayoffs.every(m => m.played) && rightPlayoffs.every(m => m.played) && leftPlayoffs.length > 0;
  const allR16Played = leftR16.every(m => m.played) && rightR16.every(m => m.played) && leftR16.length > 0;
  const allQFPlayed = leftQF.every(m => m.played) && rightQF.every(m => m.played) && leftQF.length > 0;
  const allSFPlayed = leftSF?.played && rightSF?.played;

  return (
    <CLContext.Provider value={{
      phase,
      leftPlayoffs, rightPlayoffs,
      r16Potentials, drawComplete,
      leftR16, rightR16,
      leftQF, rightQF,
      leftSF, rightSF,
      finalMatch, champion,
      
      initializeTournament,
      simulatePlayoff, selectPlayoffWinner, simulateAllPlayoffs,
      performR16Draw,
      simulateR16, selectR16Winner, simulateAllR16,
      initializeQF, simulateQF, selectQFWinner, simulateAllQF,
      initializeSF, simulateSF, selectSFWinner, simulateAllSF,
      initializeFinal, simulateFinal, selectFinalWinner,
      resetTournament,
      
      allPlayoffsPlayed, allR16Played, allQFPlayed, allSFPlayed,
    }}>
      {children}
    </CLContext.Provider>
  );
};
