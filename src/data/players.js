
import { REAL_PLAYERS } from './realPlayers';

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Names Database
const NAMES = {
  UEFA: {
    first: ['Liam', 'Noah', 'Oliver', 'James', 'Mateo', 'Lucas', 'Leo', 'Arthur', 'Louis', 'Adam', 'Müller', 'Schmidt', 'Silva', 'Santos', 'Rossi', 'Ferrari', 'Popov', 'Ivanov', 'Novak', 'Horvat'],
    last: ['Smith', 'Johnson', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
  },
  CONMEBOL: {
    first: ['Santiago', 'Mateo', 'Sebastian', 'Matias', 'Nicolas', 'Benjamin', 'Lucas', 'Joaquin', 'Samuel', 'Felipe', 'Gabriel', 'Daniel', 'Carlos', 'Luis', 'Jorge', 'Jose', 'Antonio', 'Miguel'],
    last: ['Gonzalez', 'Rodriguez', 'Gomez', 'Fernandez', 'Lopez', 'Diaz', 'Martinez', 'Perez', 'Garcia', 'Sanchez', 'Romero', 'Sosa', 'Torres', 'Ramirez', 'Benitez', 'Flores', 'Acosta', 'Silva']
  },
  CONCACAF: {
    first: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Jose', 'Luis', 'Juan', 'Jorge', 'Pedro', 'Jesus', 'Manuel', 'Carlos'],
    last: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson']
  },
  CAF: {
    first: ['Mohamed', 'Ahmed', 'Youssef', 'Ibrahim', 'Mahmoud', 'Ali', 'Omar', 'Hassan', 'Mustafa', 'Khaled', 'Emmanuel', 'Samuel', 'David', 'Joseph', 'Francis', 'John', 'Paul', 'Peter'],
    last: ['Ndiaye', 'Traore', 'Camara', 'Diallo', 'Toure', 'Coulibaly', 'Sow', 'Cisse', 'Diop', 'Keita', 'Mensah', 'Owusu', 'Boateng', 'Osei', 'Appiah', 'Adu', 'Sarr', 'Fall']
  },
  AFC: {
    first: ['Wei', 'Hao', 'Yi', 'Xin', 'Lei', 'Jun', 'Bo', 'Jie', 'Min', 'Jin', 'Hiroshi', 'Kenji', 'Takeshi', 'Yuki', 'Sato', 'Suzuki', 'Takahashi', 'Tanaka'],
    last: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Yoon', 'Lim']
  }
};

const POSITIONS = [
  { id: 'GK', name: 'Goalkeeper', type: 'GK' },
  { id: 'RB', name: 'Right Back', type: 'DF' },
  { id: 'CB', name: 'Center Back', type: 'DF' },
  { id: 'LB', name: 'Left Back', type: 'DF' },
  { id: 'CDM', name: 'Defensive Mid', type: 'MF' },
  { id: 'CM', name: 'Center Mid', type: 'MF' },
  { id: 'CAM', name: 'Attacking Mid', type: 'MF' },
  { id: 'RW', name: 'Right Wing', type: 'FW' },
  { id: 'ST', name: 'Striker', type: 'FW' },
  { id: 'LW', name: 'Left Wing', type: 'FW' }
];

// Formations simple definitions
const FORMATIONS = {
    '4-3-3': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CM', 'RW', 'ST', 'LW'],
    '4-4-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'RWB', 'CDM', 'CM', 'CAM', 'LWB', 'ST', 'ST'],
    '4-2-3-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CDM', 'CAM', 'RW', 'ST', 'LW']
};

export const generateStartingEleven = (team) => {
  // Check for Real Player Data
  if (REAL_PLAYERS[team.id]) {
    return REAL_PLAYERS[team.id];
  }

  const regionNames = NAMES[team.region] || NAMES.UEFA;

  
  // Decide formation based on team strength or random
  const formationKeys = Object.keys(FORMATIONS);
  const formationStr = getRandom(formationKeys);
  const formationRoles = FORMATIONS[formationStr];

  const players = formationRoles.map((role, index) => {
    const firstName = getRandom(regionNames.first);
    const lastName = getRandom(regionNames.last);
    
    // Rating variation based on team strength
    // e.g. team strength 85 -> player ratings between 80 and 90
    const baseRating = team.strength;
    const variation = Math.floor(Math.random() * 10) - 5; // -5 to +4
    let rating = baseRating + variation;
    
    // Star player boost for some players
    if (Math.random() > 0.8) rating += 5;
    
    return {
      id: `${team.id}-p${index}`,
      name: `${firstName} ${lastName}`,
      position: role,
      rating: Math.min(99, Math.max(50, rating)),
      number: index === 0 ? 1 : Math.floor(Math.random() * 22) + 2
    };
  });

  return {
    formation: formationStr,
    players: players
  };
};
