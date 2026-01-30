import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTournament } from '../context/TournamentContext';

const DrawPhase = () => {
  const { pots, groups, currentPotToDraw, drawNextTeam, fastSimulateDraw, manualDrawTeam, swapTeams, setPhase, initializeGroupMatches } = useTournament();
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [swapSource, setSwapSource] = React.useState(null); // { groupKey, team }

  const isDrawComplete = currentPotToDraw > 4;

  const handleProceed = () => {
    // Ensure matches are initialized with final groups
    initializeGroupMatches(groups);
    setPhase('GROUPS');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold neon-text">DRAW PHASE - POT {currentPotToDraw}</h2>
        <div className="space-x-4 flex items-center">
          {!isDrawComplete && (
            <>
              <button 
                onClick={drawNextTeam}
                className="cyber-button"
              >
                DRAW NEXT TEAM
              </button>
              <button 
                onClick={fastSimulateDraw}
                className="cyber-button border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10"
              >
                FAST FORWARD
              </button>
            </>
          )}
          {isDrawComplete && (
            <button 
              onClick={handleProceed}
              className="cyber-button bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30 animate-pulse"
            >
              PROCEED TO GROUP STAGE
            </button>
          )}
        </div>
      </div>

      {/* POTS DISPLAY */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(potNum => (
          <div key={potNum} className={`cyber-card p-4 ${currentPotToDraw === potNum ? 'border-cyber-blue shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'opacity-50'}`}>
            <h3 className="text-xl font-bold mb-2 text-center">POT {potNum}</h3>
            <div className="h-40 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-cyber-blue/20">
              <AnimatePresence>
                {pots[potNum].map(team => (
                  <motion.div 
                    key={team.id}
                    layoutId={`team-${team.id}`}
                    onClick={() => currentPotToDraw === potNum && setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
                    className={`
                      flex items-center gap-2 p-2 rounded border transition-all
                      ${currentPotToDraw === potNum ? 'cursor-pointer' : ''}
                      ${selectedTeam?.id === team.id 
                        ? 'bg-cyber-blue text-black border-cyber-blue shadow-[0_0_15px_rgba(0,240,255,0.5)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyber-blue/50'}
                    `}
                  >
                    <img 
                      src={`https://flagcdn.com/w20/${team.code}.png`} 
                      alt={team.name}
                      className="w-5 h-auto rounded-sm"
                    />
                    <span className="truncate">{team.name}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* GROUPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
        {Object.entries(groups).map(([groupKey, teams]) => {
          const isGroupFull = teams.length >= 4;
          
          // Manual Placement Logic
          const hasPotConflict = selectedTeam && teams.some(t => t.pot === selectedTeam.pot);
          const isValidPlacementTarget = selectedTeam && !isGroupFull && !hasPotConflict;

          return (
            <div 
              key={groupKey} 
              onClick={() => {
                if (isValidPlacementTarget) {
                  manualDrawTeam(selectedTeam, groupKey);
                  setSelectedTeam(null);
                }
              }}
              className={`
                cyber-card p-4 min-h-[200px] transition-all
                ${isValidPlacementTarget ? 'cursor-pointer ring-2 ring-cyber-blue ring-offset-2 ring-offset-slate-950 bg-cyber-blue/5' : ''}
                ${selectedTeam && !isValidPlacementTarget ? 'opacity-50' : ''}
              `}
            >
              <h3 className="text-lg font-bold mb-3 text-cyber-blue flex justify-between items-center">
                GROUP {groupKey}
                {isValidPlacementTarget && <span className="text-[10px] bg-cyber-blue text-black px-1.5 py-0.5 rounded font-bold">PLACE</span>}
              </h3>
              <div className="space-y-2">
                {teams.map((team, index) => {
                  const isSwapTarget = swapSource && swapSource.team.id !== team.id && swapSource.team.pot === team.pot;
                  const isSwapSource = swapSource?.team.id === team.id;

                  return (
                    <motion.div 
                      key={team.id}
                      layoutId={`team-${team.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isDrawComplete) {
                          if (swapSource) {
                            if (isSwapTarget) {
                              swapTeams(swapSource.groupKey, swapSource.team.id, groupKey, team.id);
                              setSwapSource(null);
                            } else if (isSwapSource) {
                              setSwapSource(null); // Deselect
                            } else {
                              setSwapSource({ groupKey, team }); // Change selection
                            }
                          } else {
                            setSwapSource({ groupKey, team });
                          }
                        }
                      }}
                      className={`
                        flex items-center gap-3 p-2 rounded border transition-all
                        ${isDrawComplete ? 'cursor-pointer hover:bg-white/10' : 'bg-white/5 border-white/5'}
                        ${isSwapSource ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200' : ''}
                        ${isSwapTarget ? 'bg-green-500/20 border-green-500 text-green-200 animate-pulse' : ''}
                      `}
                    >
                      <span className="text-xs text-slate-500 font-mono w-4">{index + 1}</span>
                      <img 
                        src={`https://flagcdn.com/w40/${team.code}.png`} 
                        alt={team.name}
                        className="w-6 h-auto rounded-sm shadow-sm"
                      />
                      <span className="font-medium">{team.name}</span>
                      <span className="ml-auto text-xs text-slate-600">{team.strength}</span>
                    </motion.div>
                  );
                })}
                {/* Placeholders */}
                {[...Array(4 - teams.length)].map((_, i) => (
                  <div key={i} className="h-10 border border-dashed border-white/10 rounded flex items-center justify-center">
                    <span className="text-white/10 text-xs">TBD</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DrawPhase;
