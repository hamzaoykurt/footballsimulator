// UEFA Champions League 2024-25 Knockout Stage Teams
// Based on actual league phase results and playoff draw

export const CL_TEAMS = {
  // Direct qualifiers (Top 8 from league phase) - PAIRED for the draw
  // Each pair: one goes LEFT bracket, one goes RIGHT bracket (determined by draw)
  directQualifierPairs: [
    {
      pairId: 1,
      teamA: { id: 'ars', name: 'Arsenal', shortName: 'Arsenal', strength: 89, logo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg' },
      teamB: { id: 'bay', name: 'Bayern München', shortName: 'Bayern', strength: 90, logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg' },
      position: 1, // Top slots (vs BVB/ATA winner on left, vs OLY/B04 winner on right)
    },
    {
      pairId: 2,
      teamA: { id: 'scp', name: 'Sporting CP', shortName: 'Sporting', strength: 82, logo: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg' },
      teamB: { id: 'mci', name: 'Manchester City', shortName: 'Man City', strength: 89, logo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg' },
      position: 2, // Second slots (vs BEN/RMA winner on left, vs BOD/INT winner on right)
    },
    {
      pairId: 3,
      teamA: { id: 'fcb', name: 'Barcelona', shortName: 'Barcelona', strength: 91, logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' },
      teamB: { id: 'che', name: 'Chelsea', shortName: 'Chelsea', strength: 85, logo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg' },
      position: 3, // Third slots (vs ASM/PSG winner on left, vs QRB/NEW winner on right)
    },
    {
      pairId: 4,
      teamA: { id: 'liv', name: 'Liverpool', shortName: 'Liverpool', strength: 92, logo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg' },
      teamB: { id: 'tot', name: 'Tottenham Hotspur', shortName: 'Tottenham', strength: 84, logo: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg' },
      position: 4, // Bottom slots (vs GAL/JUV winner on left, vs CLB/ATM winner on right)
    },
  ],

  // Playoff matchups (9th-24th from league phase) - February 2025
  // LEFT bracket (purple in reference image)
  leftPlayoffs: [
    { 
      id: 'PO-L1',
      home: { id: 'bvb', name: 'Borussia Dortmund', shortName: 'Dortmund', strength: 85, logo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg' },
      away: { id: 'ata', name: 'Atalanta', shortName: 'Atalanta', strength: 85, logo: 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg' },
      position: 1,
    },
    { 
      id: 'PO-L2',
      home: { id: 'ben', name: 'Benfica', shortName: 'Benfica', strength: 83, logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg' },
      away: { id: 'rma', name: 'Real Madrid', shortName: 'Real Madrid', strength: 92, logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg' },
      position: 2,
    },
    { 
      id: 'PO-L3',
      home: { id: 'asm', name: 'Monaco', shortName: 'Monaco', strength: 80, logo: 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg' },
      away: { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', strength: 88, logo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg' },
      position: 3,
    },
    { 
      id: 'PO-L4',
      home: { id: 'gal', name: 'Galatasaray', shortName: 'Galatasaray', strength: 78, logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Galatasaray_Sports_Club_Logo.svg' },
      away: { id: 'juv', name: 'Juventus', shortName: 'Juventus', strength: 84, logo: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg' },
      position: 4,
    },
  ],
  
  // RIGHT bracket (blue in reference image)
  rightPlayoffs: [
    { 
      id: 'PO-R1',
      home: { id: 'oly', name: 'Olympiacos', shortName: 'Olympiacos', strength: 75, logo: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Olympiacos_FC_logo.svg' },
      away: { id: 'b04', name: 'Bayer Leverkusen', shortName: 'Leverkusen', strength: 87, logo: 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg' },
      position: 1,
    },
    { 
      id: 'PO-R2',
      home: { id: 'bod', name: 'Bodø/Glimt', shortName: 'Bodø/Glimt', strength: 72, logo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/FK_Bod%C3%B8-Glimt_logo.svg' },
      away: { id: 'int', name: 'Inter', shortName: 'Inter', strength: 88, logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg' },
      position: 2,
    },
    { 
      id: 'PO-R3',
      home: { id: 'qrb', name: 'Qarabag FK', shortName: 'Qarabag', strength: 70, logo: 'https://upload.wikimedia.org/wikipedia/en/b/b0/Qaraba%C4%9F_FK_logo.svg' },
      away: { id: 'new', name: 'Newcastle United', shortName: 'Newcastle', strength: 82, logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg' },
      position: 3,
    },
    { 
      id: 'PO-R4',
      home: { id: 'bru', name: 'Club Brugge', shortName: 'Club Brugge', strength: 76, logo: 'https://upload.wikimedia.org/wikipedia/en/d/d0/Club_Brugge_KV_logo.svg' },
      away: { id: 'atm', name: 'Atlético Madrid', shortName: 'Atlético', strength: 86, logo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg' },
      position: 4,
    },
  ],
};
