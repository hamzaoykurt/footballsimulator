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
  
  // Live data state
  const [dataSource, setDataSource] = useState('static'); // 'static' | 'live'
  const [apiKey, setApiKey] = useState(localStorage.getItem('wc_api_key') || '');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fixed group assignments for World Cup 2026
  const FIXED_GROUPS = {
    'A': ['cze', 'mex', 'rsa', 'kor'],
    'B': ['bih', 'can', 'qat', 'sui'],
    'C': ['bra', 'hai', 'mar', 'sco'],
    'D': ['aus', 'par', 'tur', 'usa'],
    'E': ['cur', 'ecu', 'ger', 'civ'],
    'F': ['jpn', 'ned', 'swe', 'tun'],
    'G': ['bel', 'egy', 'irn', 'nzl'],
    'H': ['cpv', 'ksa', 'esp', 'uru'],
    'I': ['fra', 'irq', 'nor', 'sen'],
    'J': ['alg', 'arg', 'aut', 'jor'],
    'K': ['col', 'cod', 'por', 'uzb'],
    'L': ['cro', 'eng', 'gha', 'pan']
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

    // Respect manual ordering of thirds if user has customized it
    // Otherwise sort by points/gd/gf
    let bestThirds;
    if (customThirds && customThirds.length > 0) {
      // User has manually reordered thirds — restore their order
      const thirdsById = Object.fromEntries(thirdPlaces.map(t => [t.id, t]));
      const orderedThirds = customThirds
        .map(id => thirdsById[id])
        .filter(Boolean);
      // Append any that weren't in customThirds (safety)
      thirdPlaces.forEach(t => {
        if (!orderedThirds.find(o => o.id === t.id)) orderedThirds.push(t);
      });
      bestThirds = orderedThirds.slice(0, 8);
    } else {
      thirdPlaces.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });
      bestThirds = thirdPlaces.slice(0, 8);
    }
    
    // IMPORTANT: Do NOT re-sort winners/runnersUp here.
    // The user may have manually reordered standings — respect their order.
    // standings[key][0] is always winner, [1] is runner-up per the user's manual arrangement.
    const allQualified = [...winners, ...runnersUp, ...bestThirds];
    
    // Create Round of 32
    const round32Matches = [];
    const totalTeams = 32;
    
    for (let i = 0; i < totalTeams / 2; i++) {
      const teamA = allQualified[i];
      const teamB = allQualified[totalTeams - 1 - i];
      
      if (!teamA || !teamB) continue;

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
  }, [standings, customThirds]);

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
    setDataSource('static');
    setLastUpdated(null);
  }, []);

  // === LIVE DATA FUNCTIONS ===
  
  // Save API key to localStorage and state
  const saveApiKey = useCallback((key) => {
    setApiKey(key);
    if (key) localStorage.setItem('wc_api_key', key);
    else localStorage.removeItem('wc_api_key');
  }, []);

  // Load live data from API (transformed data)
  const loadLiveData = useCallback((transformedData) => {
    if (!transformedData) return;
    console.log('[TournamentContext] Loading live data. Phase:', transformedData.phase);
    
    const incomingPhase = transformedData.phase;

    // Always load groups/standings for context (even if we're in knockout)
    if (transformedData.groups && Object.keys(transformedData.groups).length > 0) {
      setGroups(transformedData.groups);
    }
    if (transformedData.groupMatches && Object.keys(transformedData.groupMatches).length > 0) {
      setGroupMatches(transformedData.groupMatches);
    }
    if (transformedData.standings && Object.keys(transformedData.standings).length > 0) {
      setStandings(transformedData.standings);
    }

    // Knockout matches — only update played/finished ones to preserve manual edits
    if (transformedData.knockoutMatches && transformedData.knockoutMatches.length > 0) {
      setKnockoutMatches(prev => {
        // If we have no local knockout data yet, just set the API data
        if (!prev || prev.length === 0) {
          return transformedData.knockoutMatches;
        }
        // Merge: update only matches that are now FINISHED in the API
        // but don't overwrite matches the user has manually edited
        return transformedData.knockoutMatches.map((round, ri) => {
          const localRound = prev[ri];
          if (!localRound) return round;
          return round.map(match => {
            const localMatch = localRound.find(m => m.id === match.id);
            // If user manually played this match, keep their data
            if (localMatch && localMatch.played && match.played) {
              // Both played — prefer local (user may have corrected a score)
              return localMatch;
            }
            // API says played but local doesn't — take API data
            if (match.played) return match;
            // Not played in API — keep local
            return localMatch || match;
          });
        });
      });
    }

    if (transformedData.champion !== undefined) setChampion(transformedData.champion);
    if (transformedData.lastUpdated) setLastUpdated(new Date(transformedData.lastUpdated));
    
    setDataSource('live');
    setIsReady(true);
    
    // Set phase — if API says KNOCKOUT and we have knockout data, go directly to KNOCKOUT
    if (incomingPhase === 'KNOCKOUT' || incomingPhase === 'COMPLETE') {
      setPhase('KNOCKOUT');
    } else if (incomingPhase) {
      setPhase(incomingPhase);
    }
  }, []);

  // Switch back to static mode
  const switchToStatic = useCallback(() => {
    resetTournament();
    setDataSource('static');
  }, [resetTournament]);

  // === MANUAL CONTROL FUNCTIONS ===
  
  // Helper: find round index for a match
  const findMatchRound = useCallback((allRounds, matchId) => {
    for (let i = 0; i < allRounds.length; i++) {
      if (allRounds[i].some(m => m.id === matchId)) return i;
    }
    return -1;
  }, []);

  // Set match result with custom scores (knockout only)
  // When a match result changes, all subsequent rounds are cleared and rebuilt
  const setMatchResult = useCallback((matchId, scoreA, scoreB) => {
    console.log('[TournamentContext] setMatchResult:', matchId, scoreA, scoreB);
    setKnockoutMatches(prev => {
      const roundIndex = findMatchRound(prev, matchId);
      if (roundIndex === -1) return prev;

      // 1. Trim all subsequent rounds (they become invalid)
      const trimmedRounds = prev.slice(0, roundIndex + 1);
      
      // 2. Clear champion
      setChampion(null);

      // 3. Update the match with new scores
      const updatedRounds = trimmedRounds.map((round, ri) => {
        if (ri !== roundIndex) return round;
        return round.map(match => {
          if (match.id !== matchId) return match;
          
          const winner = scoreA > scoreB ? match.teamA : match.teamB;
          
          return { 
            ...match, 
            scoreA, 
            scoreB, 
            winner, 
            played: true 
          };
        });
      });

      // 4. Generate next round if current round is complete
      const currentRound = updatedRounds[roundIndex];
      if (currentRound.every(m => m.played)) {
        if (currentRound.length === 1) {
          // Final
          setChampion(currentRound[0].winner);
        } else {
          // Generate next round
          const nextRoundMatches = [];
          for (let i = 0; i < currentRound.length; i += 2) {
            const m1 = currentRound[i];
            const m2 = currentRound[i + 1];
            if (m1.winner && m2.winner) {
              nextRoundMatches.push({
                id: `R${currentRound.length / 2}-${i / 2}`,
                round: currentRound.length / 2,
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
            updatedRounds.push(nextRoundMatches);
          }
        }
      }

      return updatedRounds;
    });
  }, [findMatchRound]);

  // Reset a match result (undo) — clears subsequent rounds too
  const resetMatchResult = useCallback((matchId) => {
    console.log('[TournamentContext] resetMatchResult:', matchId);
    setKnockoutMatches(prev => {
      const roundIndex = findMatchRound(prev, matchId);
      if (roundIndex === -1) return prev;

      // Trim subsequent rounds and clear champion
      const trimmedRounds = prev.slice(0, roundIndex + 1);
      setChampion(null);

      // Reset the match
      const updatedRounds = trimmedRounds.map((round, ri) => {
        if (ri !== roundIndex) return round;
        return round.map(match => {
          if (match.id !== matchId) return match;
          return { ...match, scoreA: null, scoreB: null, winner: null, played: false };
        });
      });

      return updatedRounds;
    });
  }, [findMatchRound]);

  // Backward compat: setManualWinner now delegates to setMatchResult with default 2-0 score
  const setManualWinner = useCallback((matchId, winnerId) => {
    setKnockoutMatches(prev => {
      const roundIndex = findMatchRound(prev, matchId);
      if (roundIndex === -1) return prev;
      
      const match = prev[roundIndex].find(m => m.id === matchId);
      if (!match) return prev;
      
      const scoreA = match.teamA?.id === winnerId ? 2 : 0;
      const scoreB = match.teamB?.id === winnerId ? 2 : 0;
      
      // Can't call setMatchResult from inside setKnockoutMatches, so inline the logic
      const trimmedRounds = prev.slice(0, roundIndex + 1);
      setChampion(null);
      
      const updatedRounds = trimmedRounds.map((round, ri) => {
        if (ri !== roundIndex) return round;
        return round.map(m => {
          if (m.id !== matchId) return m;
          const winner = m.teamA?.id === winnerId ? m.teamA : m.teamB;
          return { ...m, scoreA, scoreB, winner, played: true };
        });
      });

      const currentRound = updatedRounds[roundIndex];
      if (currentRound.every(m => m.played)) {
        if (currentRound.length === 1) {
          setChampion(currentRound[0].winner);
        } else {
          const nextRoundMatches = [];
          for (let i = 0; i < currentRound.length; i += 2) {
            const m1 = currentRound[i];
            const m2 = currentRound[i + 1];
            if (m1.winner && m2.winner) {
              nextRoundMatches.push({
                id: `R${currentRound.length / 2}-${i / 2}`,
                round: currentRound.length / 2,
                teamA: m1.winner,
                teamB: m2.winner,
                scoreA: null,
                scoreB: null,
                winner: null,
                played: false
              });
            }
          }
          if (nextRoundMatches.length > 0) updatedRounds.push(nextRoundMatches);
        }
      }

      return updatedRounds;
    });
  }, [findMatchRound]);

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
      dataSource,
      apiKey,
      lastUpdated,
      startTournament,
      simulateMatch,
      simulateGroup,
      simulateAllGroups,
      initializeKnockout,
      simulateRound,
      resetTournament,
      setPhase,
      setManualWinner,
      setMatchResult,
      resetMatchResult,
      reorderStandings,
      setManualMatchResult,
      moveTeamUp,
      moveTeamDown,
      updateTeamPoints,
      setManualThirdsOrder,
      loadLiveData,
      saveApiKey,
      switchToStatic,
    }}>
      {children}
    </TournamentContext.Provider>
  );
};
