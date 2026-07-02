// src/data/allNationalTeams.js
// 80 National Teams with flag codes and realistic strengths

export const NATIONAL_TEAMS = [
  // Europe (UEFA)
  { id: 'esp', name: 'İspanya', shortName: 'İspanya', strength: 92, code: 'es', region: 'UEFA' },
  { id: 'fra', name: 'Fransa', shortName: 'Fransa', strength: 91, code: 'fr', region: 'UEFA' },
  { id: 'eng', name: 'İngiltere', shortName: 'İngiltere', strength: 89, code: 'gb-eng', region: 'UEFA' },
  { id: 'ger', name: 'Almanya', shortName: 'Almanya', strength: 88, code: 'de', region: 'UEFA' },
  { id: 'por', name: 'Portekiz', shortName: 'Portekiz', strength: 87, code: 'pt', region: 'UEFA' },
  { id: 'ned', name: 'Hollanda', shortName: 'Hollanda', strength: 86, code: 'nl', region: 'UEFA' },
  { id: 'ita', name: 'İtalya', shortName: 'İtalya', strength: 85, code: 'it', region: 'UEFA' },
  { id: 'cro', name: 'Hırvatistan', shortName: 'Hırvatistan', strength: 82, code: 'hr', region: 'UEFA' },
  { id: 'bel', name: 'Belçika', shortName: 'Belçika', strength: 81, code: 'be', region: 'UEFA' },
  { id: 'tur', name: 'Türkiye', shortName: 'Türkiye', strength: 83, code: 'tr', region: 'UEFA' },
  { id: 'sui', name: 'İsviçre', shortName: 'İsviçre', strength: 80, code: 'ch', region: 'UEFA' },
  { id: 'den', name: 'Danimarka', shortName: 'Danimarka', strength: 80, code: 'dk', region: 'UEFA' },
  { id: 'aut', name: 'Avusturya', shortName: 'Avusturya', strength: 81, code: 'at', region: 'UEFA' },
  { id: 'ukr', name: 'Ukrayna', shortName: 'Ukrayna', strength: 77, code: 'ua', region: 'UEFA' },
  { id: 'nor', name: 'Norveç', shortName: 'Norveç', strength: 78, code: 'no', region: 'UEFA' },
  { id: 'swe', name: 'İsveç', shortName: 'İsveç', strength: 78, code: 'se', region: 'UEFA' },
  { id: 'pol', name: 'Polonya', shortName: 'Polonya', strength: 76, code: 'pl', region: 'UEFA' },
  { id: 'sco', name: 'İskoçya', shortName: 'İskoçya', strength: 74, code: 'gb-sct', region: 'UEFA' },
  { id: 'wal', name: 'Galler', shortName: 'Galler', strength: 73, code: 'gb-wls', region: 'UEFA' },
  { id: 'cze', name: 'Çekya', shortName: 'Çekya', strength: 76, code: 'cz', region: 'UEFA' },
  { id: 'hun', name: 'Macaristan', shortName: 'Macaristan', strength: 75, code: 'hu', region: 'UEFA' },
  { id: 'srb', name: 'Sırbistan', shortName: 'Sırbistan', strength: 77, code: 'rs', region: 'UEFA' },
  { id: 'rou', name: 'Romanya', shortName: 'Romanya', strength: 73, code: 'ro', region: 'UEFA' },
  { id: 'slovak', name: 'Slovakya', shortName: 'Slovakya', strength: 74, code: 'sk', region: 'UEFA' },
  { id: 'svn', name: 'Slovenya', shortName: 'Slovenya', strength: 73, code: 'si', region: 'UEFA' },
  { id: 'gre', name: 'Yunanistan', shortName: 'Yunanistan', strength: 74, code: 'gr', region: 'UEFA' },

  // South America (CONMEBOL)
  { id: 'arg', name: 'Arjantin', shortName: 'Arjantin', strength: 91, code: 'ar', region: 'CONMEBOL' },
  { id: 'bra', name: 'Brezilya', shortName: 'Brezilya', strength: 89, code: 'br', region: 'CONMEBOL' },
  { id: 'col', name: 'Kolombiya', shortName: 'Kolombiya', strength: 86, code: 'co', region: 'CONMEBOL' },
  { id: 'uru', name: 'Uruguay', shortName: 'Uruguay', strength: 85, code: 'uy', region: 'CONMEBOL' },
  { id: 'ecu', name: 'Ekvador', shortName: 'Ekvador', strength: 80, code: 'ec', region: 'CONMEBOL' },
  { id: 'par', name: 'Paraguay', shortName: 'Paraguay', strength: 74, code: 'py', region: 'CONMEBOL' },
  { id: 'chi', name: 'Şili', shortName: 'Şili', strength: 75, code: 'cl', region: 'CONMEBOL' },
  { id: 'ven', name: 'Venezuela', shortName: 'Venezuela', strength: 74, code: 've', region: 'CONMEBOL' },
  { id: 'per', name: 'Peru', shortName: 'Peru', strength: 73, code: 'pe', region: 'CONMEBOL' },
  { id: 'bol', name: 'Bolivya', shortName: 'Bolivya', strength: 68, code: 'bo', region: 'CONMEBOL' },

  // North America (CONCACAF)
  { id: 'usa', name: 'ABD', shortName: 'ABD', strength: 81, code: 'us', region: 'CONCACAF' },
  { id: 'mex', name: 'Meksika', shortName: 'Meksika', strength: 79, code: 'mx', region: 'CONCACAF' },
  { id: 'can', name: 'Kanada', shortName: 'Kanada', strength: 78, code: 'ca', region: 'CONCACAF' },
  { id: 'pan', name: 'Panama', shortName: 'Panama', strength: 72, code: 'pa', region: 'CONCACAF' },
  { id: 'crc', name: 'Kosta Rika', shortName: 'Kosta Rika', strength: 72, code: 'cr', region: 'CONCACAF' },
  { id: 'jam', name: 'Jamaika', shortName: 'Jamaika', strength: 71, code: 'jm', region: 'CONCACAF' },
  { id: 'hon', name: 'Honduras', shortName: 'Honduras', strength: 68, code: 'hn', region: 'CONCACAF' },
  { id: 'slv', name: 'El Salvador', shortName: 'El Salvador', strength: 65, code: 'sv', region: 'CONCACAF' },

  // Africa (CAF)
  { id: 'mar', name: 'Fas', shortName: 'Fas', strength: 84, code: 'ma', region: 'CAF' },
  { id: 'sen', name: 'Senegal', shortName: 'Senegal', strength: 80, code: 'sn', region: 'CAF' },
  { id: 'nig', name: 'Nijerya', shortName: 'Nijerya', strength: 79, code: 'ng', region: 'CAF' },
  { id: 'egy', name: 'Mısır', shortName: 'Mısır', strength: 77, code: 'eg', region: 'CAF' },
  { id: 'civ', name: 'Fildişi Sahili', shortName: 'Fildişi S.', strength: 78, code: 'ci', region: 'CAF' },
  { id: 'alg', name: 'Cezayir', shortName: 'Cezayir', strength: 77, code: 'dz', region: 'CAF' },
  { id: 'cmr', name: 'Kamerun', shortName: 'Kamerun', strength: 76, code: 'cm', region: 'CAF' },
  { id: 'tun', name: 'Tunus', shortName: 'Tunus', strength: 73, code: 'tn', region: 'CAF' },
  { id: 'gha', name: 'Gana', shortName: 'Gana', strength: 74, code: 'gh', region: 'CAF' },
  { id: 'rsa', name: 'Güney Afrika', shortName: 'G. Afrika', strength: 72, code: 'za', region: 'CAF' },
  { id: 'mli', name: 'Mali', shortName: 'Mali', strength: 73, code: 'ml', region: 'CAF' },

  // Asia (AFC)
  { id: 'jpn', name: 'Japonya', shortName: 'Japonya', strength: 82, code: 'jp', region: 'AFC' },
  { id: 'kor', name: 'Güney Kore', shortName: 'G. Kore', strength: 79, code: 'kr', region: 'AFC' },
  { id: 'irn', name: 'İran', shortName: 'İran', strength: 77, code: 'ir', region: 'AFC' },
  { id: 'aus', name: 'Avustralya', shortName: 'Avustralya', strength: 76, code: 'au', region: 'AFC' },
  { id: 'ksa', name: 'Suudi Arabistan', shortName: 'S. Arabistan', strength: 72, code: 'sa', region: 'AFC' },
  { id: 'qat', name: 'Katar', shortName: 'Katar', strength: 70, code: 'qa', region: 'AFC' },
  { id: 'irq', name: 'Irak', shortName: 'Irak', strength: 70, code: 'iq', region: 'AFC' },
  { id: 'uzb', name: 'Özbekistan', shortName: 'Özbekistan', strength: 73, code: 'uz', region: 'AFC' },
  { id: 'uae', name: 'BAE', shortName: 'BAE', strength: 68, code: 'ae', region: 'AFC' },

  // Oceania (OFC)
  { id: 'nzl', name: 'Yeni Zelanda', shortName: 'Yeni Zelanda', strength: 68, code: 'nz', region: 'OFC' }
];
