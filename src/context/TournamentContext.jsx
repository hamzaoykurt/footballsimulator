import React, { createContext, useContext, useState, useCallback } from 'react';
import { TEAMS } from '../data/teams';

const TournamentContext = createContext();

export const useTournament = () => useContext(TournamentContext);

const GROUPS_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

/**
 * SIMPLIFIED TOURNAMENT CONTEXT
 * 
 * Key changes:
 * - Added `isReady` flag to prevent rendering before data is initialized
 * - All state updates happen in a single synchronous block
 * - Cleaner match calculation
 */

// Helper to calculate match result based on strength
const calculateMatchResult = (teamA, teamB) => {
  const strengthDiff = teamA.strength - teamB.strength;
  
  // Adjusted for more realism/form-like behavior (Fifa style ranking respect)
  let baseVolatility = 2; // Reduced to 2 (Minimal Randomness) for STRICT realism
  const dampener = Math.min(1, Math.abs(strengthDiff) / 25); 
  const volatility = baseVolatility * (1 - dampener) + 0.2; 

  // Skew random factor slightly towards the stronger team
  const randomFactor = (Math.random() - 0.5) * (volatility * 1.5);
  let matchPerformance = strengthDiff * 2.5 + randomFactor; // 2.5 weight to strength (Huge impact)
  
  // Powerhouse bonus (Teams 85+ are dominant)
  if (teamA.strength >= 85 && strengthDiff > 0) matchPerformance += 6; // Massive bonus for top tier
  if (teamB.strength >= 85 && strengthDiff < 0) matchPerformance -= 6;
  
  // Underdog penalty (Teams < 75 struggle against big teams)
  if (teamA.strength < 75 && strengthDiff < -10) matchPerformance -= 4;
  if (teamB.strength < 75 && strengthDiff > 10) matchPerformance += 4;

  if (strengthDiff > 15) matchPerformance += 5; 
  if (strengthDiff < -15) matchPerformance -= 5;

  let xGA = 1.35 + (matchPerformance / 14);
  let xGB = 1.35 - (matchPerformance / 14);
  
  xGA = Math.max(0.1, xGA);
  xGB = Math.max(0.1, xGB);
  
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
  
  // Prevent unrealistic upsets for major gaps
  if (strengthDiff > 12 && scoreB > scoreA) {
     // 70% chance to correct an upset if gap is large
     if (Math.random() < 0.7) {
        scoreA = scoreB + Math.floor(Math.random() * 2);
     }
  } else if (strengthDiff < -12 && scoreA > scoreB) {
     if (Math.random() < 0.7) {
        scoreB = scoreA + Math.floor(Math.random() * 2);
     }
  }
  
  return { scoreA, scoreB };
};

export const TournamentProvider = ({ children }) => {
  // Core state
  const [phase, setPhase] = useState('SETUP');
  const [isReady, setIsReady] = useState(false);
  const [groups, setGroups] = useState({});
  const [groupMatches, setGroupMatches] = useState({});
  const [standings, setStandings] = useState({});
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [champion, setChampion] = useState(null);
  const [customThirds, setCustomThirds] = useState([]); // Array of team IDs in custom order

  // Fixed group assignments for World Cup 2026
  const FIXED_GROUPS = {
    'A': ['den', 'mex', 'kor', 'rsa'],
    'B': ['sui', 'ita', 'can', 'qat'],
    'C': ['bra', 'mar', 'sco', 'hai'],
    'D': ['tur', 'par', 'aus', 'usa'],
    'E': ['ecu', 'ger', 'civ', 'cur'],
    'F': ['ned', 'jpn', 'ukr', 'tun'],
    'G': ['bel', 'irn', 'egy', 'nzl'],
    'H': ['esp', 'uru', 'ksa', 'cpv'],
    'I': ['fra', 'nor', 'sen', 'irq'],
    'J': ['arg', 'aut', 'alg', 'jor'],
    'K': ['por', 'col', 'uzb', 'cod'],
    'L': ['eng', 'cro', 'pan', 'gha']
  };

  // Initialize tournament
  const startTournament = useCallback(() => {
    console.log('[TournamentContext] Starting tournament...');
    
    // Build groups
    const newGroups = {};
    const newMatches = {};
    const newStandings = {};

    GROUPS_KEYS.forEach(key => {
      const teamIds = FIXED_GROUPS[key];
      const teams = teamIds
        .map(id => TEAMS.find(t => t.id === id))
        .filter(Boolean);
      
      newGroups[key] = teams;
      
      // Create matches for this group (round robin)
      const matches = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            id: `${key}-${teams[i].id}-${teams[j].id}`,
            teamA: teams[i],
            teamB: teams[j],
            scoreA: null,
            scoreB: null,
            played: false
          });
        }
      }
      newMatches[key] = matches;
      
      // Initialize standings
      newStandings[key] = teams.map(t => ({
        ...t,
        played: 0, won: 0, drawn: 0, lost: 0, 
        gf: 0, ga: 0, gd: 0, points: 0
      }));
    });

    console.log('[TournamentContext] Groups built:', Object.keys(newGroups).length);
    console.log('[TournamentContext] Sample group A:', newGroups['A']?.map(t => t.name));

    // Set all state at once
    setGroups(newGroups);
    setGroupMatches(newMatches);
    setStandings(newStandings);
    setKnockoutMatches([]);
    setChampion(null);
    setIsReady(true);
    setPhase('GROUPS');
    
    console.log('[TournamentContext] Phase set to GROUPS, isReady=true');
  }, []);

  // Update standings for a group
  const updateStandings = useCallback((groupKey) => {
    setStandings(prev => {
      setGroupMatches(currentMatches => {
        const matches = currentMatches[groupKey];
        const groupTeams = groups[groupKey];
        
        if (!groupTeams || !matches) return currentMatches;
        
        const newGroupStandings = groupTeams.map(team => {
          let stats = { ...team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
          
          matches.forEach(m => {
            if (m.played) {
              if (m.teamA.id === team.id) {
                stats.played++;
                stats.gf += m.scoreA;
                stats.ga += m.scoreB;
                if (m.scoreA > m.scoreB) { stats.won++; stats.points += 3; }
                else if (m.scoreA === m.scoreB) { stats.drawn++; stats.points += 1; }
                else { stats.lost++; }
              } else if (m.teamB.id === team.id) {
                stats.played++;
                stats.gf += m.scoreB;
                stats.ga += m.scoreA;
                if (m.scoreB > m.scoreA) { stats.won++; stats.points += 3; }
                else if (m.scoreB === m.scoreA) { stats.drawn++; stats.points += 1; }
                else { stats.lost++; }
              }
            }
          });
          stats.gd = stats.gf - stats.ga;
          return stats;
        });

        // Sort standings
        newGroupStandings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });

        setStandings(prevStandings => ({ ...prevStandings, [groupKey]: newGroupStandings }));
        return currentMatches;
      });
      
      return prev;
    });
  }, [groups]);

  // Simulate a single match
  const simulateMatch = useCallback((groupKey, matchId) => {
    setGroupMatches(prev => {
      const groupMatchesList = [...prev[groupKey]];
      const matchIndex = groupMatchesList.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = groupMatchesList[matchIndex];
      if (match.played) return prev;

      const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
      groupMatchesList[matchIndex] = { ...match, scoreA, scoreB, played: true };

      return { ...prev, [groupKey]: groupMatchesList };
    });
    
    // Update standings after match
    setTimeout(() => updateStandings(groupKey), 0);
  }, [updateStandings]);

  // Simulate all matches in a group
  const simulateGroup = useCallback((groupKey) => {
    setGroupMatches(prev => {
      const groupMatchesList = prev[groupKey].map(match => {
        if (match.played) return match;
        const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
        return { ...match, scoreA, scoreB, played: true };
      });
      return { ...prev, [groupKey]: groupMatchesList };
    });
    
    setTimeout(() => updateStandings(groupKey), 0);
  }, [updateStandings]);

  // Simulate all groups
  const simulateAllGroups = useCallback(() => {
    console.log('[TournamentContext] simulateAllGroups triggered');
    
    setGroupMatches(prev => {
      const newMatchesState = { ...prev };
      let hasUpdates = false;
      
      GROUPS_KEYS.forEach(key => {
        if (!newMatchesState[key]) return;
        
        newMatchesState[key] = newMatchesState[key].map(match => {
          if (match.played) return match;
          
          const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
          hasUpdates = true;
          return { ...match, scoreA, scoreB, played: true };
        });
      });

      if (!hasUpdates) {
        console.log('[TournamentContext] No new matches to simulate.');
        return prev; 
      }

      // Schedule standings update
      setTimeout(() => {
        console.log('[TournamentContext] Updating standings for all groups...');
        GROUPS_KEYS.forEach(key => updateStandings(key));
      }, 50);

      return newMatchesState;
    });
  }, [updateStandings]);

  // Initialize knockout stage
  const initializeKnockout = useCallback(() => {
    let winners = [];
    let runnersUp = [];
    let thirdPlaces = [];

    GROUPS_KEYS.forEach(key => {
      const groupStandings = standings[key];
      if (groupStandings && groupStandings.length > 0) {
        winners.push(groupStandings[0]);
        runnersUp.push(groupStandings[1]);
        if (groupStandings[2]) thirdPlaces.push(groupStandings[2]);
      }
    });

    // Sort third places
    thirdPlaces.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    const bestThirds = thirdPlaces.slice(0, 8);
    
    // Seed all qualifiers
    winners.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    runnersUp.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

    const allQualified = [...winners, ...runnersUp, ...bestThirds];
    
    // Create Round of 32
    const round32Matches = [];
    const totalTeams = 32;
    
    for (let i = 0; i < totalTeams / 2; i++) {
      const teamA = allQualified[i];
      const teamB = allQualified[totalTeams - 1 - i];
      
      round32Matches.push({
        id: `R32-${i}`,
        round: 32,
        teamA,
        teamB,
        scoreA: null,
        scoreB: null,
        winner: null,
        played: false
      });
    }
    
    setKnockoutMatches([round32Matches]);
    setPhase('KNOCKOUT');
  }, [standings]);

  // Simulate knockout round
  const simulateRound = useCallback(() => {
    setKnockoutMatches(prev => {
      const newKnockout = [...prev];
      const currentRoundIndex = newKnockout.length - 1;
      const currentRound = [...newKnockout[currentRoundIndex]];
      
      if (currentRound.every(m => m.played)) return prev;

      const updatedRound = currentRound.map(match => {
        if (match.played) return match;
        
        const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
        
        let finalScoreA = scoreA;
        let finalScoreB = scoreB;
        
        // No draws in knockout
        if (finalScoreA === finalScoreB) {
          if (Math.random() > 0.5) finalScoreA += 1;
          else finalScoreB += 1;
        }

        const winner = finalScoreA > finalScoreB ? match.teamA : match.teamB;
        
        return { ...match, scoreA: finalScoreA, scoreB: finalScoreB, winner, played: true };
      });

      newKnockout[currentRoundIndex] = updatedRound;

      // Generate next round if this one is complete
      if (updatedRound.every(m => m.played)) {
        if (updatedRound.length === 1) {
          setChampion(updatedRound[0].winner);
        } else {
          const nextRoundMatches = [];
          for (let i = 0; i < updatedRound.length; i += 2) {
            const m1 = updatedRound[i];
            const m2 = updatedRound[i + 1];
            nextRoundMatches.push({
              id: `R${updatedRound.length / 2}-${i / 2}`,
              round: updatedRound.length,
              teamA: m1.winner,
              teamB: m2.winner,
              scoreA: null,
              scoreB: null,
              winner: null,
              played: false
            });
          }
          newKnockout.push(nextRoundMatches);
        }
      }

      return newKnockout;
    });
  }, []);

  // Reset tournament
  const resetTournament = useCallback(() => {
    setPhase('SETUP');
    setIsReady(false);
    setGroups({});
    setGroupMatches({});
    setStandings({});
    setKnockoutMatches([]);
    setChampion(null);
  }, []);

  // === MANUAL CONTROL FUNCTIONS ===
  
  // Manually select winner for a knockout match
  const setManualWinner = useCallback((matchId, winnerId) => {
    console.log('[TournamentContext] setManualWinner called:', matchId, winnerId);
    setKnockoutMatches(prev => {
      const newKnockout = prev.map((round, roundIndex) => {
        const updatedRound = round.map(match => {
          if (match.id !== matchId) return match;
          
          const winner = match.teamA?.id === winnerId ? match.teamA : match.teamB;
          const loser = match.teamA?.id === winnerId ? match.teamB : match.teamA;
          
          // Generate a plausible score favoring the winner
          const scoreA = match.teamA?.id === winnerId ? 2 : 0;
          const scoreB = match.teamB?.id === winnerId ? 2 : 0;
          
          return { ...match, scoreA, scoreB, winner, played: true };
        });
        return updatedRound;
      });
      
      // Check if current round is complete and generate next round
      const currentRoundIndex = newKnockout.length - 1;
      const currentRound = newKnockout[currentRoundIndex];
      
      if (currentRound.every(m => m.played)) {
        if (currentRound.length === 1) {
          setChampion(currentRound[0].winner);
        } else if (!prev[currentRoundIndex + 1]) {
          // Generate next round only if it doesn't exist
          const nextRoundMatches = [];
          for (let i = 0; i < currentRound.length; i += 2) {
            const m1 = currentRound[i];
            const m2 = currentRound[i + 1];
            if (m1.winner && m2.winner) {
              nextRoundMatches.push({
                id: `R${currentRound.length / 2}-${i / 2}`,
                round: currentRound.length,
                teamA: m1.winner,
                teamB: m2.winner,
                scoreA: null,
                scoreB: null,
                winner: null,
                played: false
              });
            }
          }
          if (nextRoundMatches.length > 0) {
            newKnockout.push(nextRoundMatches);
          }
        }
      }
      
      return newKnockout;
    });
  }, []);

  // Manually reorder standings for a group
  const reorderStandings = useCallback((groupKey, newOrder) => {
    setStandings(prev => ({
      ...prev,
      [groupKey]: newOrder
    }));
  }, []);

  // Manually set match result for group stage
  const setManualMatchResult = useCallback((groupKey, matchId, scoreA, scoreB) => {
    setGroupMatches(prev => {
      const groupMatchesList = [...prev[groupKey]];
      const matchIndex = groupMatchesList.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      groupMatchesList[matchIndex] = { 
        ...groupMatchesList[matchIndex], 
        scoreA, 
        scoreB, 
        played: true 
      };

      return { ...prev, [groupKey]: groupMatchesList };
    });
    
    setTimeout(() => updateStandings(groupKey), 0);
  }, [updateStandings]);

  // Move team up in group standings
  const moveTeamUp = useCallback((groupKey, teamIndex) => {
    console.log('[TournamentContext] moveTeamUp called:', groupKey, teamIndex);
    if (teamIndex <= 0) return;
    setStandings(prev => {
      const newStandings = [...prev[groupKey]];
      [newStandings[teamIndex - 1], newStandings[teamIndex]] = [newStandings[teamIndex], newStandings[teamIndex - 1]];
      return { ...prev, [groupKey]: newStandings };
    });
  }, []);

  // Manually update points for a team
  const updateTeamPoints = useCallback((groupKey, teamId, increment) => {
    setStandings(prev => {
      const newGroupStandings = prev[groupKey].map(team => {
        if (team.id !== teamId) return team;
        return { ...team, points: Math.max(0, team.points + increment) };
      });

      // Sort standings
      newGroupStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      return { ...prev, [groupKey]: newGroupStandings };
    });
  }, []);

  // Move team down in group standings
  const moveTeamDown = useCallback((groupKey, teamIndex) => {
    console.log('[TournamentContext] moveTeamDown called:', groupKey, teamIndex);
    setStandings(prev => {
      if (teamIndex >= prev[groupKey].length - 1) return prev;
      const newStandings = [...prev[groupKey]];
      [newStandings[teamIndex], newStandings[teamIndex + 1]] = [newStandings[teamIndex + 1], newStandings[teamIndex]];
      return { ...prev, [groupKey]: newStandings };
    });
  }, []);

  // Manually reorder best thirds
  const setManualThirdsOrder = useCallback((newOrderIds) => {
    setCustomThirds(newOrderIds);
  }, []);

  return (
    <TournamentContext.Provider value={{
      phase,
      isReady,
      groups,
      groupMatches,
      standings,
      knockoutMatches,
      champion,
      customThirds,
      startTournament,
      simulateMatch,
      simulateGroup,
      simulateAllGroups,
      initializeKnockout,
      simulateRound,
      resetTournament,
      setPhase,
      setManualWinner,
      reorderStandings,
      setManualMatchResult,
      moveTeamUp,
      moveTeamDown,
      updateTeamPoints,
      setManualThirdsOrder
    }}>
      {children}
    </TournamentContext.Provider>
  );
};
