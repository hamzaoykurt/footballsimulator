// src/services/clDataTransformer.js
// Transforms raw football-data.org Champions League matches into CLContext structure

import { CL_TEAMS } from '../data/clTeams';

// Helper to normalize team structure and inject strength from clTeams if known
const mapTeam = (apiTeam) => {
  if (!apiTeam) return null;
  
  // Find strength and logo in our static CL_TEAMS data
  let staticTeam = null;
  
  // Search in direct qualifiers
  CL_TEAMS.directQualifierPairs.forEach(p => {
    if (p.teamA.id === apiTeam.tla?.toLowerCase() || p.teamA.name === apiTeam.name) staticTeam = p.teamA;
    if (p.teamB.id === apiTeam.tla?.toLowerCase() || p.teamB.name === apiTeam.name) staticTeam = p.teamB;
  });
  
  // Search in left playoffs
  CL_TEAMS.leftPlayoffs.forEach(m => {
    if (m.home.id === apiTeam.tla?.toLowerCase() || m.home.name === apiTeam.name) staticTeam = m.home;
    if (m.away.id === apiTeam.tla?.toLowerCase() || m.away.name === apiTeam.name) staticTeam = m.away;
  });

  // Search in right playoffs
  CL_TEAMS.rightPlayoffs.forEach(m => {
    if (m.home.id === apiTeam.tla?.toLowerCase() || m.home.name === apiTeam.name) staticTeam = m.home;
    if (m.away.id === apiTeam.tla?.toLowerCase() || m.away.name === apiTeam.name) staticTeam = m.away;
  });

  return {
    id: apiTeam.tla?.toLowerCase() || apiTeam.id?.toString(),
    name: apiTeam.name,
    shortName: apiTeam.shortName || apiTeam.name,
    strength: staticTeam?.strength || 80, // Default strength
    logo: staticTeam?.logo || apiTeam.crest
  };
};

// Groups two-legged matches together and calculates aggregate scores
const groupTwoLeggedMatches = (matches) => {
  const grouped = {};
  
  matches.forEach(match => {
    const home = match.homeTeam;
    const away = match.awayTeam;
    if (!home || !away) return;
    
    // Create a unique key regardless of home/away swap
    const sortedIds = [home.id, away.id].sort();
    const key = `${match.stage}-${sortedIds[0]}-${sortedIds[1]}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(match);
  });

  const result = [];

  Object.values(grouped).forEach(legs => {
    // Sort by date to determine Leg 1 and Leg 2
    legs.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    
    const leg1 = legs[0];
    const leg2 = legs[1]; // might be null if only Leg 1 is scheduled
    
    const teamA = mapTeam(leg1.homeTeam); // Let's define teamA as the home team of Leg 1 (or home team of the matchup)
    const teamB = mapTeam(leg1.awayTeam);
    
    const status1 = leg1.status;
    const status2 = leg2?.status || 'SCHEDULED';
    
    const played1 = status1 === 'FINISHED';
    const played2 = status2 === 'FINISHED';
    
    // Leg 1 Scores
    const leg1ScoreA = played1 ? leg1.score?.fullTime?.home : null;
    const leg1ScoreB = played1 ? leg1.score?.fullTime?.away : null;
    
    // Leg 2 Scores
    // Note: In Leg 2, homeTeam is teamB, awayTeam is teamA
    let leg2ScoreA = null; // score of teamA (away in leg 2)
    let leg2ScoreB = null; // score of teamB (home in leg 2)
    
    if (played2 && leg2) {
      if (leg2.homeTeam?.id === leg1.awayTeam?.id) {
        leg2ScoreA = leg2.score?.fullTime?.away;
        leg2ScoreB = leg2.score?.fullTime?.home;
      } else {
        leg2ScoreA = leg2.score?.fullTime?.home;
        leg2ScoreB = leg2.score?.fullTime?.away;
      }
    }
    
    const played = played1 && (leg2 ? played2 : true);
    
    const aggScoreA = played ? (leg1ScoreA + (leg2ScoreA ?? 0)) : null;
    const aggScoreB = played ? (leg1ScoreB + (leg2ScoreB ?? 0)) : null;
    
    let winner = null;
    if (played) {
      if (aggScoreA > aggScoreB) winner = teamA;
      else if (aggScoreB > aggScoreA) winner = teamB;
      else {
        // Penalty shootout or extra time winner from API
        const apiWinner = leg2?.score?.winner || leg1.score?.winner;
        if (apiWinner === 'HOME_TEAM') {
          winner = leg2 ? teamB : teamA;
        } else if (apiWinner === 'AWAY_TEAM') {
          winner = leg2 ? teamA : teamB;
        } else {
          winner = Math.random() > 0.5 ? teamA : teamB;
        }
      }
    }

    result.push({
      id: `${leg1.stage}-${teamA.id}-${teamB.id}`,
      stage: leg1.stage,
      home: teamA, // for playoffs compat
      away: teamB,
      teamA, // for knockout rounds compat
      teamB,
      leg1ScoreA,
      leg1ScoreB,
      leg2ScoreA,
      leg2ScoreB,
      aggScoreA,
      aggScoreB,
      played,
      winner
    });
  });

  return result;
};

// Determines if a team belongs to the Left bracket side
const isLeftBracketTeam = (teamId) => {
  // Left Direct Qualifiers
  const leftDirect = ['ars', 'scp', 'fcb', 'liv'];
  if (leftDirect.includes(teamId)) return true;
  
  // Left Playoffs
  const leftPlayoffTeams = ['bvb', 'ata', 'ben', 'rma', 'asm', 'psg', 'gal', 'juv'];
  if (leftPlayoffTeams.includes(teamId)) return true;
  
  return false;
};

export function transformCLData(apiResponse) {
  const matches = apiResponse.matches || [];
  
  // Group matches by stage
  const playoffMatchesRaw = matches.filter(m => m.stage === 'PLAYOFFS');
  const r16MatchesRaw = matches.filter(m => m.stage === 'LAST_16');
  const qfMatchesRaw = matches.filter(m => m.stage === 'QUARTER_FINALS');
  const sfMatchesRaw = matches.filter(m => m.stage === 'SEMI_FINALS');
  const finalMatchRaw = matches.filter(m => m.stage === 'FINAL');

  // Process and group two-legged matches
  const playoffs = groupTwoLeggedMatches(playoffMatchesRaw);
  const r16 = groupTwoLeggedMatches(r16MatchesRaw);
  const qf = groupTwoLeggedMatches(qfMatchesRaw);
  const sf = groupTwoLeggedMatches(sfMatchesRaw);
  
  // Process final (one-legged)
  let finalMatch = null;
  if (finalMatchRaw.length > 0) {
    const f = finalMatchRaw[0];
    const teamA = mapTeam(f.homeTeam);
    const teamB = mapTeam(f.awayTeam);
    const played = f.status === 'FINISHED';
    const scoreA = played ? f.score?.fullTime?.home : null;
    const scoreB = played ? f.score?.fullTime?.away : null;
    let winner = null;
    if (played) {
      winner = scoreA > scoreB ? teamA : scoreB > scoreA ? teamB : null;
      if (!winner) {
        winner = f.score?.winner === 'HOME_TEAM' ? teamA : teamB;
      }
    }
    finalMatch = {
      id: 'FINAL',
      stage: 'FINAL',
      teamA,
      teamB,
      scoreA,
      scoreB,
      played,
      winner
    };
  }

  // Separate Left and Right Playoffs
  const leftPlayoffs = [];
  const rightPlayoffs = [];
  
  playoffs.forEach(m => {
    if (isLeftBracketTeam(m.home?.id) || isLeftBracketTeam(m.away?.id)) {
      leftPlayoffs.push(m);
    } else {
      rightPlayoffs.push(m);
    }
  });

  // Separate Left and Right R16
  const leftR16 = [];
  const rightR16 = [];
  
  r16.forEach(m => {
    if (isLeftBracketTeam(m.teamA?.id) || isLeftBracketTeam(m.teamB?.id)) {
      leftR16.push(m);
    } else {
      rightR16.push(m);
    }
  });

  // Separate QF
  const leftQF = [];
  const rightQF = [];
  
  qf.forEach(m => {
    if (isLeftBracketTeam(m.teamA?.id) || isLeftBracketTeam(m.teamB?.id)) {
      leftQF.push(m);
    } else {
      rightQF.push(m);
    }
  });

  // Separate SF
  let leftSF = null;
  let rightSF = null;
  
  sf.forEach(m => {
    if (isLeftBracketTeam(m.teamA?.id) || isLeftBracketTeam(m.teamB?.id)) {
      leftSF = m;
    } else {
      rightSF = m;
    }
  });

  // Detect Phase
  let phase = 'SETUP';
  if (finalMatch?.played) phase = 'COMPLETE';
  else if (finalMatch) phase = 'FINAL';
  else if (sf.length > 0) phase = 'SF';
  else if (qf.length > 0) phase = 'QF';
  else if (r16.length > 0) phase = 'R16';
  else if (playoffs.length > 0) phase = 'PLAYOFF';

  const champion = finalMatch?.winner || null;

  return {
    phase,
    leftPlayoffs,
    rightPlayoffs,
    leftR16,
    rightR16,
    leftQF,
    rightQF,
    leftSF,
    rightSF,
    finalMatch,
    champion,
    lastUpdated: new Date().toISOString()
  };
}
