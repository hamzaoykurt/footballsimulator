import React, { useState, useEffect, useRef } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, RotateCcw, Play, Zap, Globe, Shield, 
  ChevronLeft, Swords, Star, Crown, GripVertical, 
  LayoutTemplate, ArrowUpRight, Home
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import AnimatedBackground from './AnimatedBackground';

/**
 * WORLD CUP APP - FLOATING ISLAND EDITION
 * 
 * - Background: Consistent AnimatedBackground
 * - Navigation: Consolidated in Bottom Floating Island
 * - Header: Removed
 */

const WorldCupApp = ({ onBack, view }) => {
  const { 
    phase, 
    isReady,
    groups, 
    standings, 
    groupMatches, 
    knockoutMatches,
    champion,
    startTournament, 
    simulateGroup, 
    simulateAllGroups,
    initializeKnockout,
    simulateRound,
    resetTournament,
    setManualWinner,
    reorderStandings,
    updateTeamPoints,
    customThirds,
    setManualThirdsOrder
  } = useTournament();

  const allGroupsComplete = React.useMemo(() => {
    if (!groupMatches || Object.keys(groupMatches).length === 0) return false;
    return Object.values(groupMatches).every(matches => 
      matches && matches.every(m => m.played)
    );
  }, [groupMatches]);

  // Local state for draggable list to ensure stability
  const [thirdsList, setThirdsList] = useState([]);

  // Sync thirdsList with standings and customThirds changes
  useEffect(() => {
    if (!standings) return;

    let computedThirds = Object.entries(standings).map(([group, teams]) => {
        const team = teams[2]; 
        return team ? { ...team, group, uniqueId: `${group}-${team.id}` } : null;
    }).filter(Boolean);

    // Initial Sort
    if (customThirds.length > 0) {
      computedThirds.sort((a, b) => {
        const indexA = customThirds.indexOf(a.id);
        const indexB = customThirds.indexOf(b.id);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Prioritize precise manual order
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        // Fallback for new teams not in manual list
        return b.points - a.points || b.gd - a.gd || b.gf - a.gf;
      });
    } else {
        // Default Logic
        computedThirds.sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    }
    
    // CRITICAL FIX: Only update local state if the DATA has changed or EXTERNAL order implies a change NOT originated by us.
    // To simplify: We just check if IDs are different from current thirdsList
    setThirdsList(prev => {
        const prevIds = prev.map(t => t.id).join(',');
        const newIds = computedThirds.map(t => t.id).join(',');
        if (prevIds === newIds) return prev; // No change, keep stable ref
        return computedThirds;
    });
  }, [standings, customThirds]);

  const handleReorderThirds = (newOrder) => {
      setThirdsList(newOrder); // Immediate UI update
      const newIds = newOrder.map(t => t.id);
      setManualThirdsOrder(newIds); // Persist
  };

  // Refs for Auto-scroll
  const groupsRef = useRef(null);
  const round32Ref = useRef(null);
  const round16Ref = useRef(null);
  const qfRef = useRef(null);
  const sfRef = useRef(null);
  const finalRef = useRef(null);
  const championRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    const scroll = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    let timeoutId;

    if (phase === 'GROUPS' && groupsRef.current) {
      timeoutId = setTimeout(() => scroll(groupsRef), 500);
    } else if (phase === 'KNOCKOUT' || phase === 'COMPLETE') {
      const rounds = knockoutMatches.length;
      
      if (champion && championRef.current) {
        timeoutId = setTimeout(() => scroll(championRef), 500);
      } else if (rounds === 5 && finalRef.current) { 
        timeoutId = setTimeout(() => scroll(finalRef), 500);
      } else if (rounds === 4 && sfRef.current) {
        timeoutId = setTimeout(() => scroll(sfRef), 500);
      } else if (rounds === 3 && qfRef.current) {
        timeoutId = setTimeout(() => scroll(qfRef), 500);
      } else if (rounds === 2 && round16Ref.current) {
        timeoutId = setTimeout(() => scroll(round16Ref), 500);
      } else if (rounds === 1 && round32Ref.current) {
        timeoutId = setTimeout(() => scroll(round32Ref), 500);
      }
    }
    return () => clearTimeout(timeoutId);
  }, [phase, knockoutMatches.length, champion]);

  const handleStart = () => startTournament();
  const handleBack = () => onBack();
  const handleSelectWinner = (matchId, winnerId) => setManualWinner(matchId, winnerId);
  const handleReorder = (groupName, newOrder) => reorderStandings(groupName, newOrder);

  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* 1. Consistent Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBackground variant="worldcup" />
        {/* Removed solid black overlay, used very subtle gradient for text readability only at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* 2. Main Scroll Area (No Top Header) */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-6 pb-40">
        <div className="container mx-auto max-w-7xl">
        
          {/* SETUP PHASE or TITLE (In-flow) */}
          {phase !== 'SETUP' && (
             <div className="flex flex-col items-center justify-center mb-10 mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 backdrop-blur-md">
                     <Globe className="text-emerald-400 animate-pulse" size={24} />
                  </div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white drop-shadow-lg">
                    Dünya Kupası <span className="text-emerald-400">2026</span>
                  </h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/5">
                   <div className={`h-1.5 w-1.5 rounded-full ${phase === 'GROUPS' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-white/20'}`} />
                   <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{phase === 'GROUPS' ? 'GRUP AŞAMASI' : 'ELEME TURU'}</span>
                   <div className={`h-1.5 w-1.5 rounded-full ${phase === 'KNOCKOUT' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-white/20'}`} />
                </div>
             </div>
          )}

          {/* SETUP VIEW */}
          {phase === 'SETUP' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh] py-10"
            >
              <button 
                onClick={handleStart}
                className="group relative w-full max-w-2xl aspect-[16/9] rounded-[2rem] overflow-hidden border border-white/20 hover:border-emerald-400/50 transition-all duration-500 shadow-2xl shadow-black/50"
              >
                {/* Glass Effect Background instead of Solid */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm group-hover:bg-black/30 transition-colors" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-24 h-24 mb-6 glass-panel rounded-3xl flex items-center justify-center border border-white/20 shadow-[0_0_40px_rgba(52,211,153,0.2)] group-hover:shadow-[0_0_60px_rgba(52,211,153,0.4)] transition-all"
                  >
                    <Trophy size={40} className="text-emerald-400 drop-shadow-md" />
                  </motion.div>
                  
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl italic">
                    BAŞLAMA<br/>VURUŞU
                  </h2>
                  
                  <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-white/80 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-400 transition-colors uppercase tracking-widest">
                    Turnuvayı Başlat
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {/* GROUPS PHASE */}
          {phase === 'GROUPS' && isReady && (
            <div className="space-y-10" ref={groupsRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(groups).map(([groupName, teams]) => (
                    <GroupCard 
                    key={groupName}
                    name={groupName}
                    teams={standings[groupName] || teams}
                    matches={groupMatches[groupName] || []}
                    onSimulate={() => simulateGroup(groupName)}
                    onReorder={(newOrder) => handleReorder(groupName, newOrder)}
                    onUpdatePoints={(teamId, inc) => updateTeamPoints(groupName, teamId, inc)}
                  />
                ))}
              </div>

              {/* BEST 3RD PLACE TABLE - DRAGGABLE */}
              <div className="mt-12 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 max-w-4xl mx-auto shadow-2xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 ring-1 ring-orange-500/20">
                       <Star size={24} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">En İyi 3.ler Tablosu</h3>
                      <p className="text-zinc-400 text-sm font-medium">Sıralamayı değiştirmek için <span className="text-orange-400 font-bold">sürükleyip bırakabilirsiniz</span></p>
                    </div>
                 </div>

                 {/* HEADER ROW */}
                 <div className="grid grid-cols-[3rem_2fr_1fr_1fr_1fr_1fr_1fr] gap-4 p-4 text-xs uppercase tracking-wider text-zinc-500 border-b border-white/5 font-bold">
                    <div>Sıra</div>
                    <div>Takım</div>
                    <div>Grup</div>
                    <div className="text-center">P</div>
                    <div className="text-center">AV</div>
                    <div className="text-center">AG</div>
                    <div className="text-right">Durum</div>
                 </div>

                 {/* REORDER LIST */}
                 <Reorder.Group axis="y" values={thirdsList} onReorder={handleReorderThirds} className="space-y-1">
                   {thirdsList.map((team, index) => {
                      const isQualified = index < 8;
                      return (
                        <Reorder.Item 
                          key={team.uniqueId} 
                          value={team}
                          className={`grid grid-cols-[3rem_2fr_1fr_1fr_1fr_1fr_1fr] gap-4 p-3 rounded-xl border border-transparent cursor-grab active:cursor-grabbing transition-all
                            ${isQualified ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/10' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/10 opacity-70'}
                          `}
                        >
                          <div className="flex items-center">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm shadow-lg ${isQualified ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                              {index + 1}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-8 h-6 flex-shrink-0 bg-black/20 rounded flex items-center justify-center">
                               <img src={`https://flagcdn.com/w40/${team.code}.png`} alt="" className="w-full h-full object-contain" />
                             </div>
                             <span className={`font-bold truncate ${isQualified ? 'text-white' : 'text-zinc-400'}`}>{team.name}</span>
                          </div>

                          <div className="flex items-center font-mono text-zinc-400 font-bold">{team.group}</div>
                          
                          <div className="flex items-center justify-center font-bold text-white bg-black/20 rounded-lg">{team.points}</div>
                          <div className="flex items-center justify-center font-mono text-zinc-400">{team.gd > 0 ? `+${team.gd}` : team.gd}</div>
                          <div className="flex items-center justify-center font-mono text-zinc-500">{team.gf}</div>
                          
                          <div className="flex items-center justify-end">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isQualified ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-red-500/10 text-red-500'}`}>
                              {isQualified ? 'Son 32' : 'Elendi'}
                            </span>
                          </div>
                        </Reorder.Item>
                      );
                   })}
                 </Reorder.Group>
              </div>
            </div>
          )}

          {/* KNOCKOUT PHASE */}
          {phase === 'KNOCKOUT' && isReady && (
            <div className="space-y-16">
              <div className="space-y-12">
                {knockoutMatches.map((round, roundIndex) => {
                    let sectionRef = null;
                    if (roundIndex === 0) sectionRef = round32Ref;
                    if (roundIndex === 1) sectionRef = round16Ref;
                    if (roundIndex === 2) sectionRef = qfRef;
                    if (roundIndex === 3) sectionRef = sfRef;
                    if (roundIndex === 4) sectionRef = finalRef;
                    
                    const isFinal = round.length === 1;
                    
                    // Group pairs (Match A's winner plays Match B's winner)
                    const pairs = [];
                    if (!isFinal) {
                        for (let i = 0; i < round.length; i += 2) {
                            pairs.push([round[i], round[i + 1]]);
                        }
                    }

                    return (
                      <motion.div 
                        key={roundIndex} 
                        ref={sectionRef} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-px w-8 bg-amber-500/50" />
                          <span className="text-sm font-bold text-amber-500 uppercase tracking-widest">
                             {getRoundName(round[0]?.round)}
                          </span>
                          <div className="h-px flex-1 bg-white/10" />
                        </div>
                        
                        {isFinal ? (
                            <div className="flex justify-center">
                                <BracketMatchCard 
                                  match={round[0]} 
                                  onSelectWinner={(winnerId) => handleSelectWinner(round[0].id, winnerId)}
                                  matchIndex={0}
                                  isFinal={true}
                                />
                            </div>
                        ) : (
                            // Changed from grid to flex for better centering scaling
                            <div className="flex flex-wrap justify-center gap-8 max-w-[90rem] mx-auto">
                              {pairs.map((pair, pIdx) => (
                                <div key={pIdx} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-4 relative group hover:bg-white/10 transition-colors w-full md:w-[22rem]">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-wider shadow-xl z-20">
                                        Eşleşme {pIdx + 1}
                                    </div>
                                    
                                    {/* Match 1 */}
                                    {pair[0] && (
                                        <div className="relative">
                                            <BracketMatchCard 
                                                match={pair[0]} 
                                                onSelectWinner={(winnerId) => handleSelectWinner(pair[0].id, winnerId)}
                                                matchIndex={pIdx * 2}
                                            />
                                            {/* Connector Down */}
                                            <div className="absolute -bottom-4 left-1/2 w-px h-4 bg-white/10 z-0" />
                                        </div>
                                    )}

                                    {/* VS Badge */}
                                    <div className="flex items-center justify-center py-2 relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] text-zinc-600 font-black shadow-lg">
                                            VS
                                        </div>
                                    </div>

                                    {/* Match 2 */}
                                    {pair[1] && (
                                         <div className="relative">
                                             {/* Connector Up */}
                                            <div className="absolute -top-4 left-1/2 w-px h-4 bg-white/10 z-0" />
                                            <BracketMatchCard 
                                                match={pair[1]} 
                                                onSelectWinner={(winnerId) => handleSelectWinner(pair[1].id, winnerId)}
                                                matchIndex={(pIdx * 2) + 1}
                                            />
                                         </div>
                                    )}
                                </div>
                              ))}
                            </div>
                        )}
                      </motion.div>
                    );
                })}
              </div>

               {/* CHAMPION REVEAL */}
              {champion && (
                <motion.div 
                  ref={championRef}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="relative p-12 mt-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#1a1a1a] to-black border border-amber-500/30 text-center group"
                >
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-50" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                     <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="w-24 h-24 mb-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.4)] rotate-3"
                     >
                        <Trophy size={48} className="text-black drop-shadow-md" />
                     </motion.div>
                     
                     <h2 className="text-sm font-bold text-amber-500/80 uppercase tracking-[0.4em] mb-4">Dünya Şampiyonu</h2>
                     
                     <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        <img 
                          src={`https://flagcdn.com/w160/${champion?.code}.png`} 
                          alt={champion.name}
                          className="h-24 md:h-32 shadow-2xl rounded-lg rotate-[-3deg] ring-4 ring-white/5" 
                        />
                        <span className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                          {champion.name}
                        </span>
                     </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM FLOATING CONTROL ISLAND (Combined Navigation) */}
      <div className="fixed bottom-8 left-0 w-full flex justify-center z-[100] pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto flex items-center gap-2 p-2 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black ring-1 ring-white/10"
        >
            {/* BACK BUTTON (Integrated) */}
            <button 
              onClick={handleBack}
              className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/10"
              title="Ana Menü"
            >
              <Home size={20} />
            </button>

            <div className="h-8 w-px bg-white/10" />

            {/* Reset Button */}
           <button 
              onClick={() => resetTournament('SETUP')}
              className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/10"
              title="Sıfırla"
            >
              <RotateCcw size={20} />
            </button>
           
            <div className="h-8 w-px bg-white/10" />

            {/* Dynamic Action Button */}
            {phase !== 'SETUP' && (
              <WCActionButton 
                 phase={phase}
                 allGroupsComplete={allGroupsComplete}
                 champion={champion}
                 simulateAllGroups={simulateAllGroups}
                 initializeKnockout={initializeKnockout}
                 simulateRound={simulateRound}
              />
            )}
            
            {phase === 'SETUP' && (
               <div className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                 HAZIR
               </div>
            )}
        </motion.div>
      </div>
    </div>
  );
};


// ... SUBCOMPONENTS (Styled) ...

const WCActionButton = ({ phase, allGroupsComplete, champion, simulateAllGroups, initializeKnockout, simulateRound }) => {
  const btnBase = "h-11 px-6 rounded-xl font-bold flex items-center gap-2.5 transition-all active:scale-95 shadow-lg";
  const btnPrimary = `${btnBase} bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:brightness-110 shadow-amber-900/20`;

  if (phase === 'GROUPS') {
    if (!allGroupsComplete) return (
      <button onClick={simulateAllGroups} className={btnPrimary}>
        <Zap size={18} fill="currentColor" /> 
        <span>Tümünü Simüle Et</span>
      </button>
    );
    return (
      <button onClick={initializeKnockout} className={btnPrimary}>
        <span>Eleme Turuna Geç</span>
        <ArrowUpRight size={18} />
      </button>
    );
  }
  if (phase === 'KNOCKOUT') {
    if (!champion) return (
      <button onClick={simulateRound} className={btnPrimary}>
        <Play size={18} fill="currentColor" />
        <span>Turu Oyna</span>
      </button>
    );
    return (
     <div className="h-11 px-6 rounded-xl font-bold flex items-center gap-2 bg-zinc-800 text-zinc-500 cursor-default border border-white/5">
       <span>Turnuva Tamamlandı</span>
     </div>
    );
  }
  return null;
};

const GroupCard = ({ name, teams, matches, onSimulate, onReorder, onUpdatePoints }) => {
  const allPlayed = matches.length > 0 && matches.every(m => m.played);
  return (
    <div className="group bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
            {name}
          </div>
          <span className="font-bold text-zinc-200 text-sm">Grup {name}</span>
        </div>
        {!allPlayed && (
           <div />
        )}
      </div>
      
      <Reorder.Group axis="y" values={teams} onReorder={onReorder} className="p-2 space-y-1">
        {teams.map((team, i) => {
          const isThird = i === 2;
          return (
            <Reorder.Item 
              key={team.id} 
              value={team} 
              className={`flex items-center gap-3 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-colors 
                ${i < 2 ? 'bg-gradient-to-r from-emerald-500/10 to-transparent' : 
                  isThird ? 'bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20' : 'hover:bg-white/5'}`}
            >
              <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg 
                ${i < 2 ? 'bg-emerald-500 text-black' : 
                  isThird ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                {i + 1}
              </span>
              <img src={`https://flagcdn.com/w40/${team.code}.png`} className="w-5 h-3.5 object-contain shadow-sm" alt="" />
              <span className={`flex-1 text-sm font-medium truncate ${i < 2 ? 'text-white' : isThird ? 'text-orange-200' : 'text-zinc-400'}`}>{team.name}</span>
              
              {/* POINT CONTROLS */}
              <div className="flex items-center gap-1.5">
                 <button onClick={() => onUpdatePoints(team.id, -1)} className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700 text-xs">-</button>
                 <span className="text-xs font-bold tabular-nums text-white w-5 text-center">{team.points}</span>
                 <button onClick={() => onUpdatePoints(team.id, 1)} className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700 text-xs">+</button>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
};

const BracketMatchCard = ({ match, onSelectWinner, matchIndex }) => {
  const isFinal = match.round === 2;
  const isPlayable = !match.played && match.teamA && match.teamB;
  
  return (
    <div className={`relative bg-zinc-900/80 backdrop-blur-sm border ${isFinal ? 'border-amber-500/50 shadow-2xl shadow-amber-900/10' : 'border-white/5 hover:border-white/10'} rounded-2xl overflow-hidden transition-colors`}>
      {isFinal && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />}
      
      <div className={`p-1 space-y-0.5 ${isFinal ? 'p-6 space-y-4' : ''}`}>
         <TeamRow team={match.teamA} score={match.scoreA} isWinner={match.winner?.id === match.teamA?.id} isPlayable={isPlayable} onClick={() => onSelectWinner(match.teamA?.id)} isFinal={isFinal} />
         
         {!isFinal && <div className="h-px bg-white/5 mx-2" />}
         
         <TeamRow team={match.teamB} score={match.scoreB} isWinner={match.winner?.id === match.teamB?.id} isPlayable={isPlayable} onClick={() => onSelectWinner(match.teamB?.id)} isFinal={isFinal} />
      </div>
    </div>
  );
};

const TeamRow = ({ team, score, isWinner, isPlayable, onClick, isFinal }) => (
  <button 
    disabled={!isPlayable} 
    onClick={onClick} 
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group
      ${isWinner ? 'bg-amber-500/10' : 'hover:bg-white/5'} 
      ${!isPlayable && !isWinner ? 'opacity-50' : ''}
      ${isFinal ? 'py-4' : ''}
    `}
  >
    {isWinner && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
    
    <div className={`relative w-6 h-4 flex-shrink-0 rounded overflow-hidden shadow-sm ${isFinal ? 'w-10 h-7 scale-110' : ''}`}>
       <img src={`https://flagcdn.com/w40/${team?.code || 'placeholder'}.png`} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} alt="" />
    </div>
    
    <span className={`flex-1 text-left text-sm truncate font-medium ${isWinner ? 'text-amber-500' : 'text-zinc-400 group-hover:text-zinc-200'} ${isFinal ? 'text-lg' : ''}`}>
      {team?.name || '...'}
    </span>
    
    {score !== undefined && (
      <span className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold ${isWinner ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'} ${isFinal ? 'scale-125' : ''}`}>
        {score}
      </span>
    )}
  </button>
);

// Helpers
const getRoundName = (round) => {
  if (round === 32) return 'Son 32';
  if (round === 16) return 'Son 16';
  if (round === 8) return 'Çeyrek Final';
  if (round === 4) return 'Yarı Final';
  if (round === 2) return 'Final';
  return 'Tur';
};

const getGridCols = (count) => {
  if (count <= 1) return 'grid-cols-1 max-w-md mx-auto'; // Final
  if (count <= 2) return 'grid-cols-1 md:grid-cols-2 lg:max-w-4xl lg:mx-auto'; // SF
  if (count <= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'; // QF
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'; // R16 etc
};

export default WorldCupApp;
