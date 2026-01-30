import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Medal, FastForward, Users } from 'lucide-react';
import StartingElevenView from './StartingElevenView';
import { generateStartingEleven } from '../data/players';

// Memoized Match Card Component to prevent excessive re-renders
const MatchCard = React.memo(({ match, roundIndex, onSimulate, onAdvance, onOpenLineup }) => {
  const isWinnerA = match.winner?.id === match.teamA.id;
  const isWinnerB = match.winner?.id === match.teamB.id;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        relative flex flex-col bg-white border rounded-lg overflow-hidden shadow-sm
        ${match.played ? 'border-slate-300' : 'border-slate-200'}
        ${match.winner ? 'shadow-md ring-1 ring-football-grass/20' : ''}
      `}
    >
      {/* Team A */}
      <div 
        onClick={() => !match.played && onAdvance(roundIndex, match.id, match.teamA.id)}
        className={`
          flex justify-between items-center p-2 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors
          ${isWinnerA ? 'bg-green-50 text-football-grass font-semibold' : 'text-slate-600'}
        `}
      >
        <div className="flex items-center gap-2">
          <img src={`https://flagcdn.com/w20/${match.teamA.code}.png`} className="w-5 h-auto opacity-100 shadow-sm" alt={match.teamA.name} />
          <span className="text-sm">{match.teamA.name}</span>
          <button 
            onClick={(e) => onOpenLineup(e, match.teamA)}
            className="text-slate-400 hover:text-football-accent transition-colors p-1"
            title="View Starting XI"
          >
            <Users size={12} />
          </button>
        </div>
        <span className="font-mono font-bold text-slate-800">{match.scoreA ?? '-'}</span>
      </div>

      {/* Team B */}
      <div 
        onClick={() => !match.played && onAdvance(roundIndex, match.id, match.teamB.id)}
        className={`
          flex justify-between items-center p-2 cursor-pointer hover:bg-slate-50 transition-colors
          ${isWinnerB ? 'bg-green-50 text-football-grass font-semibold' : 'text-slate-600'}
        `}
      >
        <div className="flex items-center gap-2">
          <img src={`https://flagcdn.com/w20/${match.teamB.code}.png`} className="w-5 h-auto opacity-100 shadow-sm" alt={match.teamB.name} />
          <span className="text-sm">{match.teamB.name}</span>
          <button 
            onClick={(e) => onOpenLineup(e, match.teamB)}
            className="text-slate-400 hover:text-football-accent transition-colors p-1"
            title="View Starting XI"
          >
            <Users size={12} />
          </button>
        </div>
        <span className="font-mono font-bold text-slate-800">{match.scoreB ?? '-'}</span>
      </div>

      {/* Play Button Overlay */}
      {!match.played && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 opacity-0 hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-[1px]">
          <button 
            onClick={() => onSimulate(roundIndex, match.id)}
            className="bg-football-accent text-white text-xs font-bold px-3 py-1 rounded-full transform hover:scale-110 transition-transform pointer-events-auto shadow-md"
          >
            SIMULATE
          </button>
        </div>
      )}
    </motion.div>
  );
});

const KnockoutStage = () => {
  const { knockoutMatches, champion, simulateKnockoutMatch, resetTournament, manualAdvanceTeam, simulateRound } = useTournament();
  const [lineupModalData, setLineupModalData] = useState(null); // { team, lineup }

  const handleOpenLineup = useCallback((e, team) => {
    e.stopPropagation(); // Prevent advancing team if that logic is on the row
    const lineup = generateStartingEleven(team);
    setLineupModalData({ team, lineup });
  }, []);

  // Wrappers to keeping function references stable/clean if needed, primarily passing down
  const rounds = ['Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final'];

  return (
    <div className="overflow-x-auto pb-8">
      <div className="flex justify-between items-center mb-8 sticky left-0">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-football-text">
          <Trophy className="text-football-accent" /> KNOCKOUT STAGE
        </h2>
        {champion && (
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex items-center gap-4 bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-lg"
          >
            <Medal size={24} />
            CHAMPION: {champion.name}
            <button 
              onClick={resetTournament}
              className="ml-4 text-xs bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition-colors"
            >
              RESTART
            </button>
          </motion.div>
        )}
        {!champion && (
           <button 
             onClick={simulateRound}
             className="football-button flex items-center gap-2"
           >
             <FastForward size={18} /> SIMULATE ROUND
           </button>
        )}
      </div>

      <div className="flex gap-12 min-w-max px-4">
        {knockoutMatches.map((roundMatches, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around gap-4 min-w-[250px]">
            <h3 className="text-center font-bold text-football-accent mb-4 sticky top-0 bg-white/95 py-2 z-10 border-b border-slate-200">
              {rounds[roundIndex] || `Round ${roundIndex + 1}`}
            </h3>
            
            {roundMatches.map((match) => (
              <MatchCard 
                key={match.id}
                match={match}
                roundIndex={roundIndex}
                onSimulate={simulateKnockoutMatch}
                onAdvance={manualAdvanceTeam}
                onOpenLineup={handleOpenLineup}
              />
            ))}
          </div>
        ))}
        
        {/* Champion Column */}
        {champion && (
          <div className="flex flex-col justify-center items-center min-w-[250px]">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-center space-y-4"
            >
              <Trophy size={64} className="text-yellow-500 mx-auto drop-shadow-md" />
              <div>
                <div className="text-football-accent text-sm uppercase tracking-widest mb-1 font-bold">World Champion</div>
                <div className="text-4xl font-black text-slate-900">{champion.name}</div>
              </div>

              <img 
                src={`https://flagcdn.com/w160/${champion.code}.png`} 
                className="w-32 h-auto rounded shadow-xl mx-auto border-4 border-white" 
              />
            </motion.div>
          </div>
        )}
      </div>

      <StartingElevenView 
        team={lineupModalData?.team} 
        lineup={lineupModalData?.lineup} 
        onClose={() => setLineupModalData(null)} 
      />
    </div>
  );
};

export default KnockoutStage;
