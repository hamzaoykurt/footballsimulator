
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt } from 'lucide-react';

const StartingElevenView = ({ team, lineup, onClose }) => {
  if (!team || !lineup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src={`https://flagcdn.com/w40/${team.code}.png`} 
                alt={team.name} 
                className="w-8 h-auto rounded shadow-sm"
              />
              <div>
                <h3 className="font-bold text-lg leading-tight">{team.name}</h3>
                <p className="text-slate-400 text-xs font-mono">Formation: {lineup.formation}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Pitch Visual */}
          <div className="relative flex-1 bg-green-600 p-4 overflow-y-auto">
            {/* Pitch Markings */}
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b-2 border-x-2 border-white/30 rounded-b-lg"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-2 border-x-2 border-white/30 rounded-t-lg"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30"></div>
            </div>

            {/* Players Grid (Simplified Visualization) */}
             <div className="relative z-10 grid grid-cols-1 gap-2 pt-2">
                {/* Goalkeeper */}
                 <PlayerRow players={lineup.players.filter(p => p.position === 'GK')} />
                
                {/* Defenders */}
                 <PlayerRow players={lineup.players.filter(p => ['CB', 'LB', 'RB', 'RWB', 'LWB'].includes(p.position))} />

                {/* Midfielders */}
                 <PlayerRow players={lineup.players.filter(p => ['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(p.position))} />

                {/* Forwards */}
                 <PlayerRow players={lineup.players.filter(p => ['ST', 'CF', 'RW', 'LW'].includes(p.position))} />
             </div>
          </div>
          
           {/* Simple Squad List (Optional footer or generic stat) */}
           <div className="bg-slate-50 p-3 text-center border-t border-slate-200 text-xs text-slate-500">
                Team Strength: <span className="font-bold text-slate-800">{team.strength}</span>
           </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const PlayerRow = ({ players }) => (
    <div className="flex justify-center gap-4 py-4">
        {players.map(player => (
            <div key={player.id} className="flex flex-col items-center gap-1 group">
                 <div className="
                    w-10 h-10 rounded-full bg-white text-slate-900 border-2 border-slate-200
                    flex items-center justify-center font-bold text-sm shadow-md
                    group-hover:scale-110 transition-transform cursor-default
                 ">
                     {player.number}
                 </div>
                 <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium text-center max-w-[80px] truncate border border-white/10">
                    {player.name}
                 </div>
                 <div className="text-[9px] text-white/80 font-mono tracking-tighter uppercase">{player.position}</div>
            </div>
        ))}
    </div>
);

export default StartingElevenView;
