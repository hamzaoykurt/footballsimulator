import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Play, FastForward, GripVertical } from 'lucide-react';

const GroupStage = () => {
  const { 
    groups, 
    standings, 
    groupMatches, 
    simulateMatch, 
    simulateGroup, 
    simulateAllGroups, 
    initializeKnockout, 
    reorderStandings,
    customThirdPlaceOrder,
    setCustomThirdPlaceOrder
  } = useTournament();

  const allMatchesPlayed = Object.values(groupMatches).every(matches => matches.every(m => m.played));

  // Compute 3rd place teams
  const thirdPlaceTeams = [];
  Object.keys(standings).forEach(groupKey => {
    const groupStandings = standings[groupKey];
    if (groupStandings && groupStandings.length >= 3) {
      const team = groupStandings[2]; // 3rd place
      thirdPlaceTeams.push({ ...team, group: groupKey });
    }
  });

  // Default Sort
  thirdPlaceTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  // Apply Custom Order if exists
  let displayThirdPlaces = thirdPlaceTeams;
  if (customThirdPlaceOrder && customThirdPlaceOrder.length > 0) {
      const map = new Map(thirdPlaceTeams.map(t => [t.id, t]));
      const ordered = [];
      const seen = new Set();
      customThirdPlaceOrder.forEach(id => {
          if (map.has(id)) {
              ordered.push(map.get(id));
              seen.add(id);
          }
      });
      // Append others
      thirdPlaceTeams.forEach(t => {
          if (!seen.has(t.id)) ordered.push(t);
      });
      displayThirdPlaces = ordered;
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* HEADER ACTION BAR */}
      <div className="flex justify-between items-center sticky top-20 bg-white/80 p-6 z-40 border-b border-white/20 backdrop-blur-xl shadow-sm rounded-xl mx-4 mt-4">
        <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3 text-slate-900 drop-shadow-sm">
           GROUP STAGE
        </h2>
        
        <div className="flex gap-4">
          {!allMatchesPlayed ? (
            <button 
              onClick={simulateAllGroups}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all text-sm flex items-center gap-2"
            >
              <FastForward size={20} /> SIMULATE TOURNAMENT
            </button>
          ) : (
            <button 
              onClick={initializeKnockout}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all text-sm flex items-center gap-2 animate-pulse-slow"
            >
              PROCEED TO KNOCKOUTS <Play size={20} />
            </button>
          )}
        </div>
      </div>

      {/* GROUPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-8">
        {Object.keys(groups).sort().map(groupKey => {
             const groupStandings = standings[groupKey] || [];
             return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                key={groupKey} 
                className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/50 hover:shadow-2xl transition-all duration-300"
              >
                {/* Group Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex justify-between items-center text-white">
                  <span className="font-black text-2xl tracking-widest">GROUP {groupKey}</span>
                  <button 
                     onClick={() => simulateGroup(groupKey)}
                     disabled={groupMatches[groupKey].every(m => m.played)}
                     className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                     title="Simulate Group"
                  >
                    <Play size={16} fill="white" />
                  </button>
                </div>
                
                {/* Standings Table (Draggable) */}
                <div className="p-1">
                    <div className="grid grid-cols-10 text-[10px] text-slate-400 font-bold px-3 py-2 uppercase tracking-wide border-b border-slate-100/50">
                        <div className="col-span-4">Team</div>
                        <div className="text-center">Pts</div>
                        <div className="text-center">GD</div>
                        <div className="col-span-4 text-right pr-2">Form</div>
                    </div>
                
                    <Reorder.Group 
                        axis="y" 
                        values={groupStandings} 
                        onReorder={(newOrder) => reorderStandings(groupKey, newOrder)}
                        className="flex flex-col"
                    >
                    {groupStandings.map((team, idx) => (
                        <Reorder.Item 
                            key={team.id} 
                            value={team}
                            className={`group relative grid grid-cols-10 items-center py-2 px-3 border-b border-slate-100/50 text-sm cursor-grab active:cursor-grabbing hover:bg-blue-50/50 transition-colors ${idx < 2 ? 'bg-green-50/30' : ''}`}
                            whileDrag={{ scale: 1.02, backgroundColor: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 50 }}
                        >
                            <div className="col-span-4 flex items-center gap-3 font-bold text-slate-700">
                                <span className={`text-xs w-4 ${idx < 2 ? 'text-green-600' : 'text-slate-400'}`}>{idx + 1}</span>
                                <img src={`https://flagcdn.com/w40/${team.code}.png`} alt={team.name} className="w-6 h-4 object-cover rounded shadow-sm" />
                                <span className="truncate">{team.name}</span>
                            </div>
                            <div className="text-center font-bold text-slate-900">{team.points}</div>
                            <div className={`text-center font-mono text-xs ${team.gd > 0 ? 'text-emerald-600' : (team.gd < 0 ? 'text-rose-500' : 'text-slate-400')}`}>
                                {team.gd > 0 ? `+${team.gd}` : team.gd}
                            </div>
                            <div className="col-span-4 flex justify-end items-center gap-2 pr-2">
                                {/* Visualizing form/stats briefly */}
                                <div className="flex gap-0.5">
                                    <span className="text-[10px] text-slate-400 font-normal">W:{team.won}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">L:{team.lost}</span>
                                </div>
                                <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Reorder.Item>
                    ))}
                    </Reorder.Group>
                </div>

                {/* Matches Accordion-like View */}
                <div className="bg-slate-50/80 p-3 pt-2">
                   <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {groupMatches[groupKey] && groupMatches[groupKey].map(match => (
                        <div key={match.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex-1 flex justify-end items-center gap-2 font-semibold text-slate-600">
                                <span className={match.scoreA > match.scoreB ? 'text-slate-900 font-bold' : ''}>{match.teamA.name}</span>
                                <img src={`https://flagcdn.com/w20/${match.teamA.code}.png`} className="w-4 shadow-sm" alt=""/>
                             </div>
                             <div className="px-3 py-1 bg-slate-100 rounded text-slate-800 font-mono font-bold mx-2 min-w-[3rem] text-center">
                                {match.played ? `${match.scoreA} - ${match.scoreB}` : 'vs'}
                             </div>
                             <div className="flex-1 flex justify-start items-center gap-2 font-semibold text-slate-600">
                                <img src={`https://flagcdn.com/w20/${match.teamB.code}.png`} className="w-4 shadow-sm" alt=""/>
                                <span className={match.scoreB > match.scoreA ? 'text-slate-900 font-bold' : ''}>{match.teamB.name}</span>
                             </div>
                             
                             {!match.played && (
                                <button onClick={() => simulateMatch(groupKey, match.id)} className="ml-2 text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded-full">
                                    <Play size={10} fill="currentColor" />
                                </button>
                             )}
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
             );
        })}
      </div>

      {/* BEST 3RD PLACE TABLE */}
      <div className="mt-20 px-8 pb-20 max-w-5xl mx-auto">
        <h3 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <Trophy className="text-yellow-500 fill-yellow-500" /> 
           BEST 3RD PLACE TEAMS
          <span className="text-sm font-normal text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-slate-200 shadow-sm ml-auto">
             Drag rows to reorder • Top 8 qualify
          </span>
        </h3>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
             <div className="col-span-1 text-center">RK</div>
             <div className="col-span-4 pl-4">National Team</div>
             <div className="col-span-1 text-center">GR</div>
             <div className="col-span-1 text-center">MP</div>
             <div className="col-span-1 text-center">W</div>
             <div className="col-span-1 text-center">D</div>
             <div className="col-span-1 text-center">L</div>
             <div className="col-span-1 text-center">GD</div>
             <div className="col-span-1 text-center">PTS</div>
          </div>

          <Reorder.Group 
            axis="y" 
            values={displayThirdPlaces} 
            onReorder={(newOrder) => {
               const newIds = newOrder.map(t => t.id);
               setCustomThirdPlaceOrder(newIds);
            }}
            className="divide-y divide-slate-100"
          >
            {displayThirdPlaces.map((team, index) => (
              <Reorder.Item 
                key={team.id} 
                value={team}
                className={`grid grid-cols-12 gap-4 p-4 items-center text-sm font-medium transition-all cursor-move
                    ${index < 8 ? 'bg-gradient-to-r from-emerald-50/50 to-white hover:from-emerald-100/50' : 'bg-red-50/10 hover:bg-red-50/30'}`}
                whileDrag={{ scale: 1.01, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              >
                <div className="col-span-1 flex justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 
                        ${index < 8 ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 text-slate-400'}`}>
                        {index + 1}
                    </div>
                </div>
                <div className="col-span-4 pl-4 flex items-center gap-4">
                   <GripVertical size={16} className="text-slate-300" />
                   <img src={`https://flagcdn.com/w40/${team.code}.png`} alt={team.name} className="w-8 h-5 object-cover rounded shadow-sm border border-black/10" />
                   <span className={`text-lg tracking-tight ${index < 8 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>{team.name}</span>
                </div>
                <div className="col-span-1 text-center font-bold text-slate-400">{team.group}</div>
                <div className="col-span-1 text-center text-slate-500">{team.played}</div>
                <div className="col-span-1 text-center text-slate-500">{team.won}</div>
                <div className="col-span-1 text-center text-slate-500">{team.drawn}</div>
                <div className="col-span-1 text-center text-slate-500">{team.lost}</div>
                <div className="col-span-1 text-center font-mono font-bold text-slate-700">{team.gd > 0 ? `+${team.gd}` : team.gd}</div>
                <div className="col-span-1 text-center text-xl font-black text-slate-900">{team.points}</div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
};

export default GroupStage;
