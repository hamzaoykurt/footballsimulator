// UEFA Champions League 2025-26 Knockout Stage Teams
// Based on actual league phase results and playoff draw

export const CL_TEAMS = {
  // Direct qualifiers (Top 8 from league phase)
  directQualifierPairs: [
    {
      pairId: 1,
      teamA: { id: 'ars', name: 'Arsenal', shortName: 'Arsenal', strength: 89, logo: 'https://tmssl.akamaized.net//images/wappen/head/11.png' },
      teamB: { id: 'bay', name: 'Bayern München', shortName: 'Bayern', strength: 90, logo: 'https://tmssl.akamaized.net//images/wappen/head/27.png' },
      position: 1,
    },
    {
      pairId: 2,
      teamA: { id: 'scp', name: 'Sporting CP', shortName: 'Sporting', strength: 82, logo: 'https://tmssl.akamaized.net//images/wappen/head/336.png' },
      teamB: { id: 'mci', name: 'Manchester City', shortName: 'Man City', strength: 89, logo: 'https://tmssl.akamaized.net//images/wappen/head/281.png' },
      position: 2,
    },
    {
      pairId: 3,
      teamA: { id: 'fcb', name: 'Barcelona', shortName: 'Barcelona', strength: 91, logo: 'https://tmssl.akamaized.net//images/wappen/head/131.png' },
      teamB: { id: 'che', name: 'Chelsea', shortName: 'Chelsea', strength: 85, logo: 'https://tmssl.akamaized.net//images/wappen/head/631.png' },
      position: 3,
    },
    {
      pairId: 4,
      teamA: { id: 'liv', name: 'Liverpool', shortName: 'Liverpool', strength: 92, logo: 'https://tmssl.akamaized.net//images/wappen/head/31.png' },
      teamB: { id: 'tot', name: 'Tottenham Hotspur', shortName: 'Tottenham', strength: 84, logo: 'https://tmssl.akamaized.net//images/wappen/head/148.png' },
      position: 4,
    },
  ],

  // Playoff matchups
  leftPlayoffs: [
    {
      id: 'PO-L1',
      home: { id: 'bvb', name: 'Borussia Dortmund', shortName: 'Dortmund', strength: 85, logo: 'https://tmssl.akamaized.net/images/wappen/head/16.png' },
      away: { id: 'ata', name: 'Atalanta', shortName: 'Atalanta', strength: 85, logo: 'https://tmssl.akamaized.net/images/wappen/head/800.png' },
      position: 1,
    },
    { 
      id: 'PO-L2',
      home: { id: 'ben', name: 'Benfica', shortName: 'Benfica', strength: 83, logo: 'https://tmssl.akamaized.net/images/wappen/head/294.png' },
      away: { id: 'rma', name: 'Real Madrid', shortName: 'Real Madrid', strength: 92, logo: 'https://tmssl.akamaized.net/images/wappen/head/418.png' },
      position: 2,
    },
    { 
      id: 'PO-L3',
      home: { id: 'asm', name: 'Monaco', shortName: 'Monaco', strength: 80, logo: 'https://tmssl.akamaized.net/images/wappen/head/162.png' },
      away: { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', strength: 88, logo: 'https://tmssl.akamaized.net/images/wappen/head/583.png' },
      position: 3,
    },
    { 
      id: 'PO-L4',
      home: { id: 'gal', name: 'Galatasaray', shortName: 'Galatasaray', strength: 78, logo: 'https://tmssl.akamaized.net/images/wappen/head/141.png' },
      away: { id: 'juv', name: 'Juventus', shortName: 'Juventus', strength: 84, logo: 'https://tmssl.akamaized.net/images/wappen/head/506.png' },
      position: 4,
    },
  ],
  
  // RIGHT bracket
  rightPlayoffs: [
    { 
      id: 'PO-R1',
      home: { id: 'oly', name: 'Olympiacos', shortName: 'Olympiacos', strength: 75, logo: 'https://tmssl.akamaized.net/images/wappen/head/683.png' },
      away: { id: 'b04', name: 'Bayer Leverkusen', shortName: 'Leverkusen', strength: 87, logo: 'https://tmssl.akamaized.net/images/wappen/head/15.png' },
      position: 1,
    },
    { 
      id: 'PO-R2',
      home: { id: 'bod', name: 'Bodø/Glimt', shortName: 'Bodø/Glimt', strength: 72, logo: 'https://tmssl.akamaized.net/images/wappen/head/501.png' },
      away: { id: 'int', name: 'Inter', shortName: 'Inter', strength: 88, logo: 'https://tmssl.akamaized.net/images/wappen/head/46.png' },
      position: 2,
    },
    { 
      id: 'PO-R3',
      home: { id: 'qrb', name: 'Qarabag FK', shortName: 'Qarabag', strength: 70, logo: 'https://tmssl.akamaized.net/images/wappen/head/1062.png' },
      away: { id: 'new', name: 'Newcastle United', shortName: 'Newcastle', strength: 82, logo: 'https://tmssl.akamaized.net/images/wappen/head/762.png' },
      position: 3,
    },
    { 
      id: 'PO-R4',
      home: { id: 'bru', name: 'Club Brugge', shortName: 'Club Brugge', strength: 76, logo: 'https://tmssl.akamaized.net/images/wappen/head/2282.png' },
      away: { id: 'atm', name: 'Atlético Madrid', shortName: 'Atlético', strength: 86, logo: 'https://tmssl.akamaized.net/images/wappen/head/13.png' },
      position: 4,
    },
  ],
};
