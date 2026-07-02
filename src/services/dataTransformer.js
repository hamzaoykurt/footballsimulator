// src/services/dataTransformer.js
// Transforms raw API data into the app's internal tournament format

/**
 * Maps football-data.org team to app team format
 */
function mapTeam(apiTeam) {
  const code = apiTeam?.shortName?.toLowerCase() 
    || apiTeam?.tla?.toLowerCase() 
    || apiTeam?.name?.slice(0, 3).toLowerCase();
  
  // Map country names to flagcdn codes
  const flagCodeMap = {
    'usa': 'us', 'united states': 'us',
    'england': 'gb-eng', 'scotland': 'gb-sct',
    'korea republic': 'kr', 'south korea': 'kr',
    'saudi arabia': 'sa',
    'costa rica': 'cr',
    'new zealand': 'nz',
    'côte d\'ivoire': 'ci', 'ivory coast': 'ci',
    'cape verde': 'cv',
    'dr congo': 'cd',
    'curacao': 'cw',
    'turkey': 'tr',
  };

  const normalizedName = apiTeam?.name?.toLowerCase() || '';
  const flagCode = flagCodeMap[normalizedName] || code;

  return {
    id: apiTeam?.id?.toString() || code,
    name: apiTeam?.name || apiTeam?.shortName || 'Unknown',
    code: flagCode,
    strength: 70, // default, will be overridden if known
    logo: apiTeam?.crest,
  };
}

/**
 * Maps football-data.org match to app match format
 */
function mapMatch(apiMatch) {
  const home = apiMatch?.homeTeam;
  const away = apiMatch?.awayTeam;
  const score = apiMatch?.score?.fullTime;
  const status = apiMatch?.status;

  const isPlayed = status === 'FINISHED' || status === 'IN_PLAY' || status === 'PAUSED';
  const isLive = status === 'IN_PLAY' || status === 'PAUSED';

  return {
    id: apiMatch?.id?.toString() || `${home?.id}-${away?.id}`,
    teamA: mapTeam(home),
    teamB: mapTeam(away),
    scoreA: score?.home ?? null,
    scoreB: score?.away ?? null,
    played: isPlayed,
    status: status, // SCHEDULED, LIVE, IN_PLAY, FINISHED, etc.
    date: apiMatch?.utcDate,
    stage: apiMatch?.stage, // GROUP_STAGE, ROUND_OF_16, QUARTER_FINAL, etc.
    group: apiMatch?.group,
    isLive,
    winner: isPlayed && score
      ? (score.home > score.away ? mapTeam(home) : score.home < score.away ? mapTeam(away) : null)
      : null,
  };
}

/**
 * Determine tournament phase from matches
 */
export function detectPhase(matches) {
  if (!matches || matches.length === 0) return 'SETUP';

  const finished = matches.filter(m => m.status === 'FINISHED');
  const inPlay = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  
  // If any group matches are in play or finished, we're in GROUPS
  const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE' || m.group);
  const groupFinished = groupMatches.filter(m => m.status === 'FINISHED');
  const allGroupFinished = groupMatches.length > 0 && groupFinished.length === groupMatches.length;

  // Check knockout stages
  const knockoutStages = ['ROUND_OF_32', 'LAST_16', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL', 'THIRD_PLACE'];
  const knockoutMatches = matches.filter(m => knockoutStages.includes(m.stage));
  const hasKnockout = knockoutMatches.length > 0;
  const knockoutFinished = knockoutMatches.filter(m => m.status === 'FINISHED');
  const allKnockoutFinished = knockoutMatches.length > 0 && knockoutFinished.length === knockoutMatches.length;
  const finalMatch = matches.find(m => m.stage === 'FINAL');
  const finalFinished = finalMatch?.status === 'FINISHED';

  if (finalFinished) return 'COMPLETE';
  if (hasKnockout && !allKnockoutFinished) return 'KNOCKOUT';
  if (hasKnockout && allGroupFinished) return 'KNOCKOUT';
  if (groupMatches.length > 0 && !allGroupFinished) return 'GROUPS';
  if (allGroupFinished && !hasKnockout) return 'GROUPS'; // Groups done, waiting for knockout
  
  return 'SETUP';
}

/**
 * Build groups from matches
 */
export function buildGroupsFromMatches(matches) {
  const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE' || m.group);
  const groups = {};

  groupMatches.forEach(match => {
    const groupName = match.group?.replace('GROUP_', '') || 'A';
    if (!groups[groupName]) {
      groups[groupName] = { teams: new Map(), matches: [] };
    }
    
    // Add teams to group
    if (match.teamA) groups[groupName].teams.set(match.teamA.id, match.teamA);
    if (match.teamB) groups[groupName].teams.set(match.teamB.id, match.teamB);
    
    groups[groupName].matches.push(match);
  });

  // Convert to arrays
  const result = {};
  Object.entries(groups).forEach(([key, val]) => {
    result[key] = {
      teams: Array.from(val.teams.values()),
      matches: val.matches,
    };
  });

  return result;
}

/**
 * Calculate standings from group matches
 */
export function calculateStandings(groupMatches, teams) {
  const standings = teams.map(team => ({
    ...team,
    played: 0, won: 0, drawn: 0, lost: 0,
    gf: 0, ga: 0, gd: 0, points: 0,
  }));

  groupMatches.filter(m => m.played).forEach(match => {
    const teamA = standings.find(t => t.id === match.teamA.id);
    const teamB = standings.find(t => t.id === match.teamB.id);
    
    if (!teamA || !teamB) return;

    teamA.played++;
    teamB.played++;
    teamA.gf += match.scoreA || 0;
    teamA.ga += match.scoreB || 0;
    teamB.gf += match.scoreB || 0;
    teamB.ga += match.scoreA || 0;

    if (match.scoreA > match.scoreB) {
      teamA.won++; teamA.points += 3;
      teamB.lost++;
    } else if (match.scoreA < match.scoreB) {
      teamB.won++; teamB.points += 3;
      teamA.lost++;
    } else {
      teamA.drawn++; teamA.points += 1;
      teamB.drawn++; teamB.points += 1;
    }
  });

  standings.forEach(t => { t.gd = t.gf - t.ga; });
  
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return standings;
}

/**
 * Build knockout bracket from matches
 */
export function buildKnockoutMatches(matches) {
  const stageOrder = ['ROUND_OF_32', 'LAST_16', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL', 'THIRD_PLACE'];
  
  const rounds = {};
  
  matches.filter(m => m.stage && m.stage !== 'GROUP_STAGE').forEach(match => {
    if (!rounds[match.stage]) rounds[match.stage] = [];
    rounds[match.stage].push(match);
  });

  // Sort rounds by stage order
  const result = [];
  stageOrder.forEach(stage => {
    if (rounds[stage] && rounds[stage].length > 0) {
      // Sort by date within round
      rounds[stage].sort((a, b) => new Date(a.date) - new Date(b.date));
      result.push(rounds[stage]);
    }
  });

  return result;
}

/**
 * Main transform function for football-data.org response
 */
export function transformFootballData(apiResponse) {
  const matches = (apiResponse.matches || []).map(mapMatch);
  const phase = detectPhase(matches);
  const groups = buildGroupsFromMatches(matches);
  
  // Calculate standings for each group
  const standings = {};
  Object.entries(groups).forEach(([groupName, groupData]) => {
    standings[groupName] = calculateStandings(groupData.matches, groupData.teams);
  });

  const knockoutMatches = buildKnockoutMatches(matches);
  
  // Find champion
  const finalMatch = matches.find(m => m.stage === 'FINAL' && m.status === 'FINISHED');
  const champion = finalMatch?.winner || null;

  return {
    phase,
    groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.teams])),
    groupMatches: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.matches])),
    standings,
    knockoutMatches,
    champion,
    rawMatches: matches,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Transform ESPN data (different format)
 */
export function transformEspnData(apiResponse) {
  const events = apiResponse?.events || [];
  
  const matches = events.map(event => {
    const home = event.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home');
    const away = event.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away');
    const status = event.status?.type?.name; // STATUS_SCHEDULED, STATUS_IN_PROGRESS, STATUS_FINAL
    
    const isPlayed = status === 'STATUS_FINAL' || status === 'STATUS_IN_PROGRESS';
    const isLive = status === 'STATUS_IN_PROGRESS';
    const scoreA = home?.score?.value ?? null;
    const scoreB = away?.score?.value ?? null;
    
    const teamA = home?.team ? { id: home.team.id, name: home.team.displayName, code: home.team.abbreviation?.toLowerCase() } : null;
    const teamB = away?.team ? { id: away.team.id, name: away.team.displayName, code: away.team.abbreviation?.toLowerCase() } : null;
    
    const winner = isPlayed && scoreA !== null && scoreB !== null
      ? (scoreA > scoreB ? teamA : scoreA < scoreB ? teamB : null)
      : null;
    
    return {
      id: event.id?.toString() || `${teamA?.id}-${teamB?.id}`,
      teamA,
      teamB,
      scoreA,
      scoreB,
      played: isPlayed,
      status,
      date: event.date,
      stage: event.season?.type,
      group: null, // ESPN doesn't have group info in scoreboard
      isLive,
      winner,
    };
  });

  // ESPN doesn't give us group info directly, so we return partial data
  return {
    phase: detectPhase(matches),
    groups: {},
    groupMatches: {},
    standings: {},
    knockoutMatches: buildKnockoutMatches(matches),
    champion: matches.find(m => m.stage === 'FINAL' && m.status === 'STATUS_FINAL')?.winner || null,
    rawMatches: matches,
    lastUpdated: new Date().toISOString(),
  };
}
