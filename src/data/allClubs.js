// src/data/allClubs.js
// 60+ Top Clubs with Transfermarkt logo URLs and realistic strengths

export const CLUBS = [
  // Premier League
  { id: 'mci', name: 'Manchester City', shortName: 'Man City', strength: 89, logo: 'https://tmssl.akamaized.net/images/wappen/head/281.png', league: 'Premier League' },
  { id: 'ars', name: 'Arsenal', shortName: 'Arsenal', strength: 88, logo: 'https://tmssl.akamaized.net/images/wappen/head/11.png', league: 'Premier League' },
  { id: 'liv', name: 'Liverpool', shortName: 'Liverpool', strength: 89, logo: 'https://tmssl.akamaized.net/images/wappen/head/31.png', league: 'Premier League' },
  { id: 'che', name: 'Chelsea', shortName: 'Chelsea', strength: 85, logo: 'https://tmssl.akamaized.net/images/wappen/head/631.png', league: 'Premier League' },
  { id: 'tot', name: 'Tottenham Hotspur', shortName: 'Tottenham', strength: 83, logo: 'https://tmssl.akamaized.net/images/wappen/head/148.png', league: 'Premier League' },
  { id: 'mun', name: 'Manchester United', shortName: 'Man United', strength: 82, logo: 'https://tmssl.akamaized.net/images/wappen/head/985.png', league: 'Premier League' },
  { id: 'new', name: 'Newcastle United', shortName: 'Newcastle', strength: 82, logo: 'https://tmssl.akamaized.net/images/wappen/head/762.png', league: 'Premier League' },
  { id: 'avl', name: 'Aston Villa', shortName: 'Aston Villa', strength: 81, logo: 'https://tmssl.akamaized.net/images/wappen/head/405.png', league: 'Premier League' },

  // La Liga
  { id: 'rma', name: 'Real Madrid', shortName: 'Real Madrid', strength: 91, logo: 'https://tmssl.akamaized.net/images/wappen/head/418.png', league: 'La Liga' },
  { id: 'fcb', name: 'Barcelona', shortName: 'Barcelona', strength: 89, logo: 'https://tmssl.akamaized.net/images/wappen/head/131.png', league: 'La Liga' },
  { id: 'atm', name: 'Atlético Madrid', shortName: 'Atlético', strength: 85, logo: 'https://tmssl.akamaized.net/images/wappen/head/13.png', league: 'La Liga' },
  { id: 'rso', name: 'Real Sociedad', shortName: 'Real Sociedad', strength: 80, logo: 'https://tmssl.akamaized.net/images/wappen/head/681.png', league: 'La Liga' },
  { id: 'ath', name: 'Athletic Bilbao', shortName: 'Athletic', strength: 80, logo: 'https://tmssl.akamaized.net/images/wappen/head/621.png', league: 'La Liga' },
  { id: 'gir', name: 'Girona', shortName: 'Girona', strength: 79, logo: 'https://tmssl.akamaized.net/images/wappen/head/12321.png', league: 'La Liga' },
  { id: 'sev', name: 'Sevilla', shortName: 'Sevilla', strength: 77, logo: 'https://tmssl.akamaized.net/images/wappen/head/368.png', league: 'La Liga' },

  // Bundesliga
  { id: 'bay', name: 'Bayern München', shortName: 'Bayern', strength: 89, logo: 'https://tmssl.akamaized.net/images/wappen/head/27.png', league: 'Bundesliga' },
  { id: 'b04', name: 'Bayer Leverkusen', shortName: 'Leverkusen', strength: 87, logo: 'https://tmssl.akamaized.net/images/wappen/head/15.png', league: 'Bundesliga' },
  { id: 'bvb', name: 'Borussia Dortmund', shortName: 'Dortmund', strength: 84, logo: 'https://tmssl.akamaized.net/images/wappen/head/16.png', league: 'Bundesliga' },
  { id: 'rbl', name: 'RB Leipzig', shortName: 'Leipzig', strength: 83, logo: 'https://tmssl.akamaized.net/images/wappen/head/23826.png', league: 'Bundesliga' },
  { id: 'vfb', name: 'VfB Stuttgart', shortName: 'Stuttgart', strength: 80, logo: 'https://tmssl.akamaized.net/images/wappen/head/79.png', league: 'Bundesliga' },
  { id: 'sge', name: 'Eintracht Frankfurt', shortName: 'Frankfurt', strength: 79, logo: 'https://tmssl.akamaized.net/images/wappen/head/24.png', league: 'Bundesliga' },

  // Serie A
  { id: 'int', name: 'Inter Milan', shortName: 'Inter', strength: 87, logo: 'https://tmssl.akamaized.net/images/wappen/head/46.png', league: 'Serie A' },
  { id: 'juv', name: 'Juventus', shortName: 'Juventus', strength: 84, logo: 'https://tmssl.akamaized.net/images/wappen/head/506.png', league: 'Serie A' },
  { id: 'acm', name: 'AC Milan', shortName: 'Milan', strength: 83, logo: 'https://tmssl.akamaized.net/images/wappen/head/5.png', league: 'Serie A' },
  { id: 'ata', name: 'Atalanta', shortName: 'Atalanta', strength: 84, logo: 'https://tmssl.akamaized.net/images/wappen/head/800.png', league: 'Serie A' },
  { id: 'rom', name: 'AS Roma', shortName: 'Roma', strength: 81, logo: 'https://tmssl.akamaized.net/images/wappen/head/12.png', league: 'Serie A' },
  { id: 'nap', name: 'Napoli', shortName: 'Napoli', strength: 83, logo: 'https://tmssl.akamaized.net/images/wappen/head/6195.png', league: 'Serie A' },
  { id: 'laz', name: 'Lazio', shortName: 'Lazio', strength: 80, logo: 'https://tmssl.akamaized.net/images/wappen/head/398.png', league: 'Serie A' },

  // Ligue 1
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', strength: 87, logo: 'https://tmssl.akamaized.net/images/wappen/head/583.png', league: 'Ligue 1' },
  { id: 'asm', name: 'Monaco', shortName: 'Monaco', strength: 81, logo: 'https://tmssl.akamaized.net/images/wappen/head/162.png', league: 'Ligue 1' },
  { id: 'losc', name: 'Lille OSC', shortName: 'Lille', strength: 79, logo: 'https://tmssl.akamaized.net/images/wappen/head/1082.png', league: 'Ligue 1' },
  { id: 'om', name: 'Olympique Marseille', shortName: 'Marseille', strength: 80, logo: 'https://tmssl.akamaized.net/images/wappen/head/244.png', league: 'Ligue 1' },
  { id: 'ol', name: 'Olympique Lyon', shortName: 'Lyon', strength: 78, logo: 'https://tmssl.akamaized.net/images/wappen/head/1041.png', league: 'Ligue 1' },

  // Süper Lig
  { id: 'gal', name: 'Galatasaray', shortName: 'Galatasaray', strength: 82, logo: 'https://tmssl.akamaized.net/images/wappen/head/141.png', league: 'Süper Lig' },
  { id: 'fen', name: 'Fenerbahçe', shortName: 'Fenerbahçe', strength: 81, logo: 'https://tmssl.akamaized.net/images/wappen/head/36.png', league: 'Süper Lig' },
  { id: 'bes', name: 'Beşiktaş', shortName: 'Beşiktaş', strength: 79, logo: 'https://tmssl.akamaized.net/images/wappen/head/114.png', league: 'Süper Lig' },
  { id: 'tra', name: 'Trabzonspor', shortName: 'Trabzonspor', strength: 76, logo: 'https://tmssl.akamaized.net/images/wappen/head/449.png', league: 'Süper Lig' },
  { id: 'ibfk', name: 'Başakşehir', shortName: 'Başakşehir', strength: 73, logo: 'https://tmssl.akamaized.net/images/wappen/head/6890.png', league: 'Süper Lig' },

  // Other Europe
  { id: 'ben', name: 'Benfica', shortName: 'Benfica', strength: 82, logo: 'https://tmssl.akamaized.net/images/wappen/head/294.png', league: 'Diğer' },
  { id: 'por', name: 'FC Porto', shortName: 'Porto', strength: 81, logo: 'https://tmssl.akamaized.net/images/wappen/head/720.png', league: 'Diğer' },
  { id: 'scp', name: 'Sporting CP', shortName: 'Sporting', strength: 82, logo: 'https://tmssl.akamaized.net/images/wappen/head/336.png', league: 'Diğer' },
  { id: 'aja', name: 'Ajax', shortName: 'Ajax', strength: 78, logo: 'https://tmssl.akamaized.net/images/wappen/head/610.png', league: 'Diğer' },
  { id: 'psv', name: 'PSV Eindhoven', shortName: 'PSV', strength: 81, logo: 'https://tmssl.akamaized.net/images/wappen/head/383.png', league: 'Diğer' },
  { id: 'fey', name: 'Feyenoord', shortName: 'Feyenoord', strength: 78, logo: 'https://tmssl.akamaized.net/images/wappen/head/234.png', league: 'Diğer' },
  { id: 'cel', name: 'Celtic', shortName: 'Celtic', strength: 75, logo: 'https://tmssl.akamaized.net/images/wappen/head/371.png', league: 'Diğer' },
  { id: 'ran', name: 'Rangers', shortName: 'Rangers', strength: 73, logo: 'https://tmssl.akamaized.net/images/wappen/head/124.png', league: 'Diğer' },
  { id: 'clu', name: 'Club Brugge', shortName: 'Club Brugge', strength: 76, logo: 'https://tmssl.akamaized.net/images/wappen/head/2282.png', league: 'Diğer' },
  { id: 'oly', name: 'Olympiacos', shortName: 'Olympiacos', strength: 75, logo: 'https://tmssl.akamaized.net/images/wappen/head/683.png', league: 'Diğer' },
  { id: 'shk', name: 'Shakhtar Donetsk', shortName: 'Shakhtar', strength: 74, logo: 'https://tmssl.akamaized.net/images/wappen/head/660.png', league: 'Diğer' },
  { id: 'dkv', name: 'Dynamo Kyiv', shortName: 'Dynamo Kyiv', strength: 73, logo: 'https://tmssl.akamaized.net/images/wappen/head/338.png', league: 'Diğer' }
];
