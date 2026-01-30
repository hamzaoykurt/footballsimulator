import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEAMS } from '../data/teams';

const TournamentContext = createContext();

export const useTournament = () => useContext(TournamentContext);

const GROUPS_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Helper to calculate match result based on strength
const calculateMatchResult = (teamA, teamB) => {
  const strengthDiff = teamA.strength - teamB.strength;
  
  // Realism Tuning:
  // Volatility should decrease drastically as the strength gap increases.
  
  let baseVolatility = 12; 
  // Dampen volatility based on strength difference.
  // If diff is 0, volatility is 12.
  // If diff is > 15, volatility drops to near zero to ensure consistency.
  const dampener = Math.min(1, Math.abs(strengthDiff) / 20); 
  const volatility = baseVolatility * (1 - dampener) + 2; // Minimum volatility 2

  const randomFactor = (Math.random() - 0.5) * (volatility * 2);
  let matchPerformance = strengthDiff + randomFactor;
  
  // "Giant Killer" Prevention - STRICTER
  // If a team is much stronger (>12 diff), ensure they almost never lose.
  if (strengthDiff > 12) matchPerformance += 4; 
  if (strengthDiff < -12) matchPerformance -= 4;

  // Expected Goals (xG) Calculation
  let xGA = 1.35 + (matchPerformance / 16); // Increased sensitivity (divisor 16 instead of 18/20)
  let xGB = 1.35 - (matchPerformance / 16);
  
  // Ensure non-negative
  xGA = Math.max(0.05, xGA);
  xGB = Math.max(0.05, xGB);
  
  // Poisson-like distribution for actual goals
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
  
  // Outlier Check: FORCE CORRECT unexpected losses for Giants
  // If diff > 15 (e.g. Spain 92 vs Saudi 71 = 21 diff), Spain should NOT lose.
  if (strengthDiff > 15 && scoreB >= scoreA) {
      if (Math.random() > 0.05) { // 95% chance to force win if dropping points
          scoreA = scoreB + 1 + Math.floor(Math.random() * 2); 
      }
  } else if (strengthDiff < -15 && scoreA >= scoreB) {
       if (Math.random() > 0.05) {
          scoreB = scoreA + 1 + Math.floor(Math.random() * 2);
      }
  }

  // CASE 3: Avoid 0-0 in huge mismatches naturally by boosting the favorite if they have 0 goals
  if (strengthDiff > 18 && scoreA === 0 && Math.random() < 0.7) scoreA = 1;
  if (strengthDiff < -18 && scoreB === 0 && Math.random() < 0.7) scoreB = 1;
  
  return { scoreA, scoreB };
};

export const TournamentProvider = ({ children }) => {
  // State
  const [phase, setPhase] = useState('SETUP'); // SETUP, DRAW, GROUPS, KNOCKOUT
  const [pots, setPots] = useState({ 1: [], 2: [], 3: [], 4: [] });
  const [groups, setGroups] = useState({});
  const [groupMatches, setGroupMatches] = useState({}); // Stores match results
  const [standings, setStandings] = useState({}); // Stores calculated standings
  const [knockoutMatches, setKnockoutMatches] = useState([]); // Array of rounds
  const [champion, setChampion] = useState(null);
  const [currentPotToDraw, setCurrentPotToDraw] = useState(1);
  const [drawHistory, setDrawHistory] = useState([]);
  const [customThirdPlaceOrder, setCustomThirdPlaceOrder] = useState(null); // Array of Team IDs
  
  // Initialize
  useEffect(() => {
    resetTournament('SETUP');
  }, []);

  const resetTournament = (targetPhase = 'GROUPS') => {
    // Organize teams into pots


    // Initialize empty groups and matches
    const newGroups = {};
    const newMatches = {};
    const newStandings = {};
    
    GROUPS_KEYS.forEach(key => {
      newGroups[key] = [];
      newMatches[key] = []; // Will hold match objects
      newStandings[key] = [];
    });

    // FIXED GROUPS A-J Assignment
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

    // Populate fixed groups and track used team IDs
    const usedTeamIds = new Set();
    
    Object.keys(FIXED_GROUPS).forEach(groupKey => {
        const teamIds = FIXED_GROUPS[groupKey];
        teamIds.forEach(id => {
            const team = TEAMS.find(t => t.id === id);
            if (team) {
                newGroups[groupKey].push(team);
                usedTeamIds.add(id);
            } else {
                console.warn(`Initial seed team not found: ${id}`);
            }
        });
    });

    // Populate Pots with REMAINING teams only
    const newPots = { 1: [], 2: [], 3: [], 4: [] };
    TEAMS.forEach(team => {
      if (!usedTeamIds.has(team.id)) {
        if (newPots[team.pot]) {
          newPots[team.pot].push(team);
        }
      }
    });

    // Shuffle pots
    Object.keys(newPots).forEach(key => {
      newPots[key] = newPots[key].sort(() => Math.random() - 0.5);
    });

    setPots(newPots);
    setGroups(newGroups);
    setGroupMatches(newMatches);
    setStandings(newStandings);
    setKnockoutMatches([]);
    setChampion(null);
    setCurrentPotToDraw(1);
    setDrawHistory([]);
    
    // INSTANTLY START TOURNAMENT
    // Create temporary copies to simulate the draw for the REST of the groups
    const tempGroups = { ...newGroups };
    const tempPots = { ...newPots };
    
    // Simulate Draw Logic 1->4 for Remaining Groups (F-L)
    // We only need to fill groups that are not full.
    // Fixed groups A-E have 4 teams. Others have 0.
    
    // For each pot 1-4
    for (let p = 1; p <= 4; p++) {
       const potTeams = tempPots[p];
       
       // Distribute to groups F-L (and others if not full)
       GROUPS_KEYS.forEach((groupKey) => {
          // Skip if group is already full (Fixed Groups)
          if (tempGroups[groupKey].length >= 4) return;
          
          // We need to be careful: Fixed groups might have used up teams from various pots.
          // Remaining teams in tempPots[p] should be distributed to remaining empty slots.
          // Since we filtered TEAMS into newPots by excluding usedIds, newPots contains exactly the right number of teams for the remaining slots?
          // Let's check:
          // 5 groups fixed (4 teams each = 20 teams).
          // Total 48 teams. 28 teams remaining.
          // 7 groups (F-L) empty. 7 * 4 = 28 slots.
          // So we just need to distribute the remaining 28 teams into the 7 empty groups.
          // But are they evenly distributed by pot?
          // Fixed groups A-E used teams from various pots.
          // e.g. Group A: den(4), mex(1), kor(2), rsa(3). (1,2,3,4 used)
          // Group B: sui(2), ita(4), can(1), qat(3). (1,2,3,4 used)
          // It seems the user's fixed groups DO respect "one from each pot" roughly?
          // If so, the remaining pots should have even numbers (7 each).
          // If not, we might have issues if we strictly draw "Pot 1 goes to Group F, G, H..."
          // If Pot 1 has 7 teams left, and we have 7 groups left, it matches perfectly.
          
          // However, if the user picks unevenly, we might have 6 Pot 1s and 8 Pot 2s left.
          // My standard "A->L" draw loop in lines 80+ (original code) assumed strict structure.
          // Now I should just fill the groups round-robin with whatever is available?
          // Or stick to the Pot 1 -> Pot 2 -> Pot 3 -> Pot 4 structure if possible.
          
          // Let's try to fill by pot.
           if (potTeams.length > 0) {
              // Only add if this group needs a team (and ideally from this pot, but we just push what we have)
              // Since we iterate p 1->4 and loop groups, we will fill layer by layer.
              tempGroups[groupKey].push(potTeams.shift());
           }
       });
       
       // If there are still teams left in this pot (because we skipped full groups), 
       // we should ensure they find a home?
       // The loop above iterates GROUPS_KEYS (A-L). It skips A-E. It goes F-L.
       // If potTeams has 7 items, and F-L is 7 groups, it works perfectly.
    }
    
    // Safety check: Fill any remaining gaps if pot logic was imperfect
    // Collect any stragglers
    const stragglers = [];
    for(let p=1; p<=4; p++) {
        stragglers.push(...tempPots[p]);
    }
    
    if (stragglers.length > 0) {
        GROUPS_KEYS.forEach(key => {
            while (tempGroups[key].length < 4 && stragglers.length > 0) {
                tempGroups[key].push(stragglers.shift());
            }
        });
    }

    setGroups(tempGroups);
    setPots({ 1: [], 2: [], 3: [], 4: [] }); // Empty pots
    setCurrentPotToDraw(5);
    
    // Initialize matches
    initializeGroupMatches(tempGroups, newMatches, newStandings);
    
    setPhase(targetPhase);
  };

  // Keep drawNextTeam/fastSimulateDraw for legacy or if we want to revert, 
  // but resetTournament now bypasses them.
  // We can remove them if we want to be clean, but keeping them as unused helper functions is fine for now
  // or I will simplify the Context by removing unused detailed draw logic if requested.
  // Given instructions, let's keep the context clean but functional.
  
  const drawNextTeam = () => {}; // Disabled
  const fastSimulateDraw = () => {}; // Disabled


  const swapTeams = (groupKey1, teamId1, groupKey2, teamId2) => {
    setGroups(prev => {
      const newGroups = { ...prev };
      const group1 = [...newGroups[groupKey1]];
      const group2 = [...newGroups[groupKey2]];

      const team1Index = group1.findIndex(t => t.id === teamId1);
      const team2Index = group2.findIndex(t => t.id === teamId2);

      if (team1Index === -1 || team2Index === -1) return prev;

      const team1 = group1[team1Index];
      const team2 = group2[team2Index];

      // Validation: Must be same pot
      if (team1.pot !== team2.pot) return prev;

      group1[team1Index] = team2;
      group2[team2Index] = team1;

      newGroups[groupKey1] = group1;
      newGroups[groupKey2] = group2;

      return newGroups;
    });
  };

  const initializeGroupMatches = (currentGroups, optionalNewMatchesRef = null, optionalNewStandingsRef = null) => {
    const newMatches = optionalNewMatchesRef || {};
    const newStandings = optionalNewStandingsRef || {};

    GROUPS_KEYS.forEach(groupKey => {
      const teams = currentGroups[groupKey];
      const matches = [];
      // Create round robin schedule
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            id: `${groupKey}-${teams[i].id}-${teams[j].id}`,
            teamA: teams[i],
            teamB: teams[j],
            scoreA: null,
            scoreB: null,
            played: false
          });
        }
      }
      newMatches[groupKey] = matches;
      newStandings[groupKey] = teams.map(t => ({
        ...t,
        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0
      }));
    });
    
    // Only set state if we are not passing refs (meaning we are running it standalone)
    if (!optionalNewMatchesRef) {
        setGroupMatches(newMatches);
        setStandings(newStandings);
    }
  };

  const simulateMatch = (groupKey, matchId) => {
    setGroupMatches(prev => {
      const groupMatchesList = [...prev[groupKey]];
      const matchIndex = groupMatchesList.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = groupMatchesList[matchIndex];
      if (match.played) return prev; // Already played

      const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
      
      const updatedMatch = { ...match, scoreA, scoreB, played: true };
      groupMatchesList[matchIndex] = updatedMatch;

      // Update standings immediately
      updateGroupStandings(groupKey, groupMatchesList);

      return { ...prev, [groupKey]: groupMatchesList };
    });
  };

  const simulateGroup = (groupKey) => {
    setGroupMatches(prev => {
      const groupMatchesList = [...prev[groupKey]];
      let updated = false;
      
      const updatedList = groupMatchesList.map(match => {
        if (!match.played) {
          updated = true;
          const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
          return { ...match, scoreA, scoreB, played: true };
        }
        return match;
      });

      if (updated) {
        updateGroupStandings(groupKey, updatedList);
      }

      return { ...prev, [groupKey]: updatedList };
    });
  };

  const simulateAllGroups = () => {
    GROUPS_KEYS.forEach(key => simulateGroup(key));
  };

  const updateGroupStandings = (groupKey, matches) => {
    setStandings(prev => {
      const groupTeams = groups[groupKey];
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

      // Sort: Points > GD > GF
      newGroupStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      return { ...prev, [groupKey]: newGroupStandings };
    });
  };

  const initializeKnockout = () => {
    // 1. Identify Qualifiers
    let winners = [];
    let runnersUp = [];
    let thirdPlaces = [];

    GROUPS_KEYS.forEach(key => {
      const groupStandings = standings[key];
      if (groupStandings.length > 0) {
        winners.push(groupStandings[0]);
        runnersUp.push(groupStandings[1]);
        thirdPlaces.push(groupStandings[2]);
      }
    });

    // Sort 3rd places
    if (customThirdPlaceOrder && customThirdPlaceOrder.length > 0) {
        // Map current third places to a lookup for easy access
        const thirdPlaceMap = new Map(thirdPlaces.map(t => [t.id, t]));
        
        // Rebuild ranking based on custom order
        const newRanking = [];
        const seenIds = new Set();
        
        customThirdPlaceOrder.forEach(id => {
            if (thirdPlaceMap.has(id)) {
                newRanking.push(thirdPlaceMap.get(id));
                seenIds.add(id);
            }
        });
        
        // Append any 3rd place teams that weren't in the custom order (fallback)
        thirdPlaces.forEach(t => {
            if (!seenIds.has(t.id)) {
                newRanking.push(t);
            }
        });
        
        // Update the main array
        thirdPlaces = newRanking;
        
    } else {
        // Default Sorting: Points > GD > GF
        thirdPlaces.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
        });
    }

    const bestThirds = thirdPlaces.slice(0, 8);
    
    // 2. Seed Teams (1-32)
    // Seeds 1-12: Group Winners (sorted by performance)
    winners.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    // Seeds 13-24: Runners Up
    runnersUp.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    // Seeds 25-32: Best 3rds
    // bestThirds is already sorted

    const allQualified = [...winners, ...runnersUp, ...bestThirds];
    
    // 3. Create Bracket (Round of 32)
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
  };

  const simulateKnockoutMatch = (roundIndex, matchId) => {
    setKnockoutMatches(prev => {
      const newKnockout = [...prev];
      const currentRound = [...newKnockout[roundIndex]];
      const matchIndex = currentRound.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) return prev;
      const match = currentRound[matchIndex];
      if (match.played) return prev; // Already played

      const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
      
      // Ensure no draws in knockout
      let finalScoreA = scoreA;
      let finalScoreB = scoreB;
      
      if (finalScoreA === finalScoreB) {
        // Penalty shootout logic (simplified: random winner)
        if (Math.random() > 0.5) finalScoreA += 1;
        else finalScoreB += 1;
      }

      const winner = finalScoreA > finalScoreB ? match.teamA : match.teamB;
      
      currentRound[matchIndex] = {
        ...match,
        scoreA: finalScoreA,
        scoreB: finalScoreB,
        winner,
        played: true
      };
      
      newKnockout[roundIndex] = currentRound;

      // Check if round is complete to generate next round
      if (currentRound.every(m => m.played)) {
        if (currentRound.length === 1) {
          // Final played
          setChampion(winner);
        } else {
          // Generate next round
          const nextRoundMatches = [];
          for (let i = 0; i < currentRound.length; i += 2) {
            const m1 = currentRound[i];
            const m2 = currentRound[i+1];
            
            nextRoundMatches.push({
              id: `R${currentRound.length/2}-${i/2}`,
              round: currentRound.length / 2,
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
  };

  const simulateRound = () => {
    setKnockoutMatches(prev => {
      const newKnockout = [...prev];
      const currentRoundIndex = newKnockout.length - 1;
      const currentRound = [...newKnockout[currentRoundIndex]];
      
      // Check if round is already finished
      if (currentRound.every(m => m.played)) return prev;

      let roundChanged = false;
      const updatedRound = currentRound.map(match => {
        if (!match.played) {
          roundChanged = true;
          const { scoreA, scoreB } = calculateMatchResult(match.teamA, match.teamB);
          
          let finalScoreA = scoreA;
          let finalScoreB = scoreB;
          
          if (finalScoreA === finalScoreB) {
            if (Math.random() > 0.5) finalScoreA += 1;
            else finalScoreB += 1;
          }

          const winner = finalScoreA > finalScoreB ? match.teamA : match.teamB;
          
          return {
            ...match,
            scoreA: finalScoreA,
            scoreB: finalScoreB,
            winner,
            played: true
          };
        }
        return match;
      });

      if (!roundChanged) return prev;

      newKnockout[currentRoundIndex] = updatedRound;

      // Generate next round immediately if round is complete
      if (updatedRound.every(m => m.played)) {
        if (updatedRound.length === 1) {
          setChampion(updatedRound[0].winner);
        } else {
          const nextRoundMatches = [];
          for (let i = 0; i < updatedRound.length; i += 2) {
            const m1 = updatedRound[i];
            const m2 = updatedRound[i+1];
            nextRoundMatches.push({
              id: `R${updatedRound.length/2}-${i/2}`,
              round: updatedRound.length / 2,
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
  };

  const updateMatchScore = (groupKey, matchId, team, change) => {
    setGroupMatches(prev => {
      const groupMatchesList = [...prev[groupKey]];
      const matchIndex = groupMatchesList.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = { ...groupMatchesList[matchIndex] };
      
      // Initialize scores if null
      if (match.scoreA === null) match.scoreA = 0;
      if (match.scoreB === null) match.scoreB = 0;

      if (team === 'A') {
        match.scoreA = Math.max(0, match.scoreA + change);
      } else {
        match.scoreB = Math.max(0, match.scoreB + change);
      }
      
      match.played = true; // Mark as played if manually edited
      
      groupMatchesList[matchIndex] = match;
      updateGroupStandings(groupKey, groupMatchesList);
      
      return { ...prev, [groupKey]: groupMatchesList };
    });
  };

  const reorderStandings = (groupKey, newOrder) => {
    setStandings(prev => ({
      ...prev,
      [groupKey]: newOrder
    }));
    // We should probably also ensure the 'groups' state reflects this order if used for display, 
    // but usually 'standings' is what is displayed. 
    // However, if we re-simulate, it will overwrite this.
    // The user accepts that manual overrides are for "WHAT IF" scenarios or final adjustments.
  };

  const manualAdvanceTeam = (roundIndex, matchId, winnerId) => {
    setKnockoutMatches(prev => {
      const newKnockout = [...prev];
      const currentRound = [...newKnockout[roundIndex]];
      const matchIndex = currentRound.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) return prev;
      
      const match = { ...currentRound[matchIndex] };
      const winner = match.teamA.id === winnerId ? match.teamA : match.teamB;
      
      // If manually advancing, we might not have scores, so set some defaults or leave as is
      if (!match.played) {
        match.scoreA = match.teamA.id === winnerId ? 1 : 0;
        match.scoreB = match.teamB.id === winnerId ? 1 : 0;
        match.played = true;
      }
      
      match.winner = winner;
      currentRound[matchIndex] = match;
      newKnockout[roundIndex] = currentRound;

      // Check if round is complete to generate next round
      if (currentRound.every(m => m.played)) {
        if (currentRound.length === 1) {
          setChampion(winner);
        } else {
          // Check if next round already exists
          if (newKnockout.length <= roundIndex + 1) {
             const nextRoundMatches = [];
             for (let i = 0; i < currentRound.length; i += 2) {
               const m1 = currentRound[i];
               const m2 = currentRound[i+1];
               nextRoundMatches.push({
                 id: `R${currentRound.length/2}-${i/2}`,
                 round: currentRound.length / 2,
                 teamA: m1.winner,
                 teamB: m2.winner,
                 scoreA: null,
                 scoreB: null,
                 winner: null,
                 played: false
               });
             }
             newKnockout.push(nextRoundMatches);
          } else {
             // Update existing next round matches
             const nextRound = [...newKnockout[roundIndex + 1]];
             const nextMatchIndex = Math.floor(matchIndex / 2);
             if (nextRound[nextMatchIndex]) {
                const nextMatch = { ...nextRound[nextMatchIndex] };
                if (matchIndex % 2 === 0) nextMatch.teamA = winner;
                else nextMatch.teamB = winner;
                // Reset next match if it was played
                nextMatch.played = false;
                nextMatch.scoreA = null;
                nextMatch.scoreB = null;
                nextMatch.winner = null;
                nextRound[nextMatchIndex] = nextMatch;
                newKnockout[roundIndex + 1] = nextRound;
             }
          }
        }
      }

      return newKnockout;
    });
  };

  const manualDrawTeam = (team, groupKey) => {
    // Validation: Check if group already has a team from this pot
    const group = groups[groupKey];
    if (group.some(t => t.pot === team.pot)) {
      return false; // Invalid move
    }

    setPots(prev => {
      const newPots = { ...prev };
      newPots[team.pot] = newPots[team.pot].filter(t => t.id !== team.id);
      return newPots;
    });

    setGroups(prev => ({
      ...prev,
      [groupKey]: [...prev[groupKey], team]
    }));

    return true;
  };

  return (
    <TournamentContext.Provider value={{
      phase, setPhase,
      pots, groups, groupMatches, standings,
      knockoutMatches, champion,
      currentPotToDraw,
      customThirdPlaceOrder, setCustomThirdPlaceOrder,
      drawNextTeam,
      fastSimulateDraw,
      manualDrawTeam,
      swapTeams,
      simulateMatch,
      simulateGroup,
      simulateAllGroups,
      initializeGroupMatches,
      initializeKnockout,
      simulateKnockoutMatch,
      simulateRound,
      updateMatchScore,
      reorderStandings,
      manualAdvanceTeam,
      resetTournament
    }}>
      {children}
    </TournamentContext.Provider>
  );
};
