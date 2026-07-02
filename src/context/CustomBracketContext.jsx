// src/context/CustomBracketContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const CustomBracketContext = createContext();

export const useCustomBracket = () => useContext(CustomBracketContext);

// Simulates a single match based on team strength
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
  
  // No draws in knockout, resolve with extra goals
  if (scoreA === scoreB) {
    if (Math.random() > 0.5) scoreA += 1;
    else scoreB += 1;
  }

  return { scoreA, scoreB };
};

export const CustomBracketProvider = ({ children }) => {
  const [phase, setPhase] = useState('SETUP'); // 'SETUP' | 'BRACKET'
  const [mode, setMode] = useState('clubs'); // 'national' | 'clubs'
  const [bracketSize, setBracketSize] = useState(8); // 4, 8, 16, 32
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [rounds, setRounds] = useState([]); // array of match arrays
  const [champion, setChampion] = useState(null);

  // Initialize bracket with selected teams (shuffled and paired)
  const initializeBracket = useCallback((teams) => {
    console.log('[CustomBracketContext] Initializing bracket with teams:', teams.length);
    
    // Shuffle teams
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    
    const initialMatches = [];
    const matchCount = teams.length / 2;
    
    for (let i = 0; i < matchCount; i++) {
      initialMatches.push({
        id: `R0-M${i}`,
        teamA: shuffled[i * 2],
        teamB: shuffled[i * 2 + 1],
        scoreA: null,
        scoreB: null,
        winner: null,
        played: false,
      });
    }
    
    setRounds([initialMatches]);
    setChampion(null);
    setPhase('BRACKET');
  }, []);

  // Helper to find match coordinates
  const findMatchIndex = useCallback((allRounds, matchId) => {
    for (let ri = 0; ri < allRounds.length; ri++) {
      const matchIndex = allRounds[ri].findIndex(m => m.id === matchId);
      if (matchIndex !== -1) return { roundIndex: ri, matchIndex };
    }
    return null;
  }, []);

  // Set manual winner by clicking a team
  const setManualWinner = useCallback((matchId, winnerId) => {
    setRounds(prev => {
      const coords = findMatchIndex(prev, matchId);
      if (!coords) return prev;

      const { roundIndex, matchIndex } = coords;

      // 1. Trim subsequent rounds
      const trimmedRounds = prev.slice(0, roundIndex + 1);
      setChampion(null);

      // 2. Update the clicked match
      const updatedRounds = trimmedRounds.map((round, ri) => {
        if (ri !== roundIndex) return round;
        return round.map(match => {
          if (match.id !== matchId) return match;
          
          const teamA = match.teamA;
          const teamB = match.teamB;
          const winner = teamA.id === winnerId ? teamA : teamB;
          
          return {
            ...match,
            scoreA: teamA.id === winnerId ? 2 : 0,
            scoreB: teamB.id === winnerId ? 0 : 2,
            winner,
            played: true
          };
        });
      });

      // 3. Generate or merge next round if current round is complete
      const currentRound = updatedRounds[roundIndex];
      if (currentRound.every(m => m.played)) {
        if (currentRound.length === 1) {
          // Final match complete
          setChampion(currentRound[0].winner);
        } else {
          // Build next round matches
          const nextMatches = [];
          for (let i = 0; i < currentRound.length; i += 2) {
            const m1 = currentRound[i];
            const m2 = currentRound[i + 1];
            nextMatches.push({
              id: `R${roundIndex + 1}-M${i / 2}`,
              teamA: m1.winner,
              teamB: m2.winner,
              scoreA: null,
              scoreB: null,
              winner: null,
              played: false
            });
          }
          updatedRounds.push(nextMatches);
        }
      }

      return updatedRounds;
    });
  }, [findMatchIndex]);

  // Reset a specific match
  const resetMatch = useCallback((matchId) => {
    setRounds(prev => {
      const coords = findMatchIndex(prev, matchId);
      if (!coords) return prev;

      const { roundIndex } = coords;
      const trimmedRounds = prev.slice(0, roundIndex + 1);
      setChampion(null);

      return trimmedRounds.map((round, ri) => {
        if (ri !== roundIndex) return round;
        return round.map(match => {
          if (match.id !== matchId) return match;
          return {
            ...match,
            scoreA: null,
            scoreB: null,
            winner: null,
            played: false
          };
        });
      });
    });
  }, [findMatchIndex]);

  // Simulate all remaining matches in the active round
  const simulateActiveRound = useCallback(() => {
    setRounds(prev => {
      const newRounds = [...prev];
      const activeRoundIndex = newRounds.length - 1;
      const roundMatches = [...newRounds[activeRoundIndex]];
      
      if (roundMatches.every(m => m.played)) return prev;

      const simulatedRound = roundMatches.map(match => {
        if (match.played) return match;
        const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
        const winner = scoreA > scoreB ? match.teamA : match.teamB;
        return {
          ...match,
          scoreA,
          scoreB,
          winner,
          played: true
        };
      });

      newRounds[activeRoundIndex] = simulatedRound;

      // Create next round if complete
      if (simulatedRound.length === 1) {
        setChampion(simulatedRound[0].winner);
      } else {
        const nextMatches = [];
        for (let i = 0; i < simulatedRound.length; i += 2) {
          nextMatches.push({
            id: `R${activeRoundIndex + 1}-M${i / 2}`,
            teamA: simulatedRound[i].winner,
            teamB: simulatedRound[i + 1].winner,
            scoreA: null,
            scoreB: null,
            winner: null,
            played: false
          });
        }
        newRounds.push(nextMatches);
      }

      return newRounds;
    });
  }, []);

  const resetTournament = useCallback(() => {
    setPhase('SETUP');
    setRounds([]);
    setChampion(null);
    setSelectedTeams([]);
  }, []);

  return (
    <CustomBracketContext.Provider value={{
      phase,
      mode,
      setMode,
      bracketSize,
      setBracketSize,
      selectedTeams,
      setSelectedTeams,
      rounds,
      champion,
      initializeBracket,
      setManualWinner,
      resetMatch,
      simulateActiveRound,
      resetTournament
    }}>
      {children}
    </CustomBracketContext.Provider>
  );
};
