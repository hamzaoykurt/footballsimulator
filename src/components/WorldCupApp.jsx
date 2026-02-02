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

  // Build third place list from standings - SIMPLE VERSION
  const computedThirds = React.useMemo(() => {
    if (!standings || Object.keys(standings).length === 0) return [];
    return Object.entries(standings).map(([group, teams]) => {
      const team = teams[2]; 
      return team ? { ...team, group } : null;
    }).filter(Boolean).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  }, [standings]);

  // Local state for drag - sync with latest computed data
  const [thirdsList, setThirdsList] = useState([]);
  const isDragging = useRef(false);
  
  useEffect(() => {
    // Don't update while user is dragging
    if (isDragging.current) return;
    
    if (computedThirds.length === 0) {
      setThirdsList([]);
      return;
    }
    
    // Always update to reflect current 3rd place teams
    setThirdsList(prev => {
      if (prev.length === 0) return computedThirds;
      
      // Get current team IDs
      const computedIds = computedThirds.map(t => t.id);
      const prevIds = prev.map(t => t.id);
      
      // Check if the teams themselves changed (not just data)
      const teamsChanged = !computedIds.every(id => prevIds.includes(id)) || 
                           !prevIds.every(id => computedIds.includes(id));
      
      if (teamsChanged) {
        // Teams changed - use computed order but try to preserve positions for unchanged teams
        return computedThirds;
      }
      
      // Same teams - update data but preserve order
      return prev.map(oldTeam => 
        computedThirds.find(t => t.id === oldTeam.id) || oldTeam
      );
    });
  }, [computedThirds]);

  const handleReorderThirds = (newOrder) => {
    setThirdsList(newOrder); // Immediate UI update only
    setManualThirdsOrder(newOrder.map(t => t.id)); // Persist
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
        
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-900/30 backdrop-blur-md rounded-2xl flex items-center justify-center border border-green-500/20 shadow-2xl shadow-green-900/20">
                <Globe className="text-green-500 drop-shadow-lg" size={24} />
              </div>
              <div>
                  <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">
                    FIFA KUPASI <span className="text-green-500">2026</span>
                  </h1>
                <p className="text-sm text-zinc-400 font-medium tracking-wide border-l-2 border-green-600 pl-2 ml-1">
                  Resmi Turnuva Simülasyonu
                </p>
              </div>
            </div>
          </header>

          {/* SETUP VIEW - REFINED FOR MOBILE */}
          {phase === 'SETUP' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] relative"
            >
              <div className="w-full max-w-md">
                <button 
                  onClick={handleStart}
                  className="w-full group relative h-[28rem] rounded-[2.5rem] overflow-hidden text-left transition-all hover:scale-[1.02] shadow-2xl shadow-black/50 ring-1 ring-white/10 group-hover:ring-green-500/30"
                >
                  {/* Liquid Background Layer */}
                  <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-3xl transition-colors z-0" />
                  
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/en/thumb/6/65/2026_FIFA_World_Cup_logo.svg/800px-2026_FIFA_World_Cup_logo.svg.png')] opacity-10 bg-contain bg-center bg-no-repeat group-hover:opacity-20 transition-opacity mix-blend-overlay" />
                  
                  <div className="relative z-10 p-10 h-full flex flex-col justify-between items-center text-center">
                    <div className="w-20 h-20 bg-green-900/40 rounded-3xl flex items-center justify-center backdrop-blur-md ring-1 ring-green-500/30 group-hover:bg-green-800 group-hover:text-white transition-all text-green-400 shadow-xl shadow-green-900/30">
                      <Trophy size={40} />
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black text-white tracking-tighter group-hover:text-green-400 transition-colors">
                        Turnuvayı Başlat
                      </h2>
                      <p className="text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
                        Dünyanın en prestijli kupası için mücadele et. Tarih yazmaya hazır ol.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-lg font-bold text-white bg-gradient-to-r from-green-800 to-green-600 px-8 py-4 rounded-2xl shadow-lg shadow-green-900/40 group-hover:shadow-green-600/50 group-hover:scale-105 transition-all duration-300">
                      <Play size={20} fill="currentColor" />
                      <span>HEMEN BAŞLA</span>
                    </div>
                  </div>
                </button>
              </div>
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

              {/* BEST 3RD PLACE TABLE - DRAGGABLE & RESPONSIVE */}
              <div className="mt-12 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-8 max-w-4xl mx-auto shadow-2xl">
                 <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 ring-1 ring-emerald-500/20 flex-shrink-0">
                       <Star size={20} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-2xl font-black text-white tracking-tight">En İyi 3.ler</h3>
                      <p className="text-zinc-400 text-xs md:text-sm font-medium hidden sm:block">Sürükleyip bırakarak sıralayın</p>
                    </div>
                 </div>

                 {/* Desktop Header - hidden on mobile */}
                 <div className="hidden md:grid grid-cols-[2.5rem_1fr_3rem_3rem_3rem_4rem] gap-3 px-4 py-2 text-[10px] uppercase tracking-wider text-zinc-500 border-b border-white/5 font-bold">
                    <div>#</div>
                    <div>Takım</div>
                    <div className="text-center">P</div>
                    <div className="text-center">AV</div>
                    <div className="text-center">Grp</div>
                    <div className="text-right">Durum</div>
                 </div>

                 {/* REORDER LIST - Responsive */}
                 <Reorder.Group axis="y" values={thirdsList} onReorder={handleReorderThirds} className="space-y-1.5 md:space-y-1">
                   {thirdsList.map((team, index) => {
                      const isQualified = index < 8;
                      return (
                        <Reorder.Item 
                          key={team.id} 
                          value={team}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, borderRadius: "0.75rem" }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 30,
                            mass: 0.8
                          }}
                          onDragStart={() => { isDragging.current = true; }}
                          onDragEnd={() => { isDragging.current = false; }}
                          whileDrag={{ 
                            scale: 1.02, 
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                            zIndex: 50,
                            borderRadius: "0.75rem"
                          }}
                          style={{ borderRadius: "0.75rem" }}
                          className={`grid grid-cols-[2rem_1fr_auto] md:grid-cols-[2.5rem_1fr_3rem_3rem_3rem_4rem] gap-2 md:gap-3 p-2.5 md:p-3 cursor-grab select-none items-center
                            ${isQualified ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10' : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 opacity-70'}
                          `}
                        >
                          {/* Rank Badge */}
                          <span className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg font-bold text-xs md:text-sm shadow-lg ${isQualified ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                            {index + 1}
                          </span>
                          
                          {/* Flag + Name + Mobile Info */}
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                             <img src={`https://flagcdn.com/w40/${team.code}.png`} alt="" className="w-5 h-3.5 md:w-6 md:h-4 object-contain flex-shrink-0" />
                             <span className={`font-bold text-sm md:text-base truncate ${isQualified ? 'text-white' : 'text-zinc-400'}`}>{team.name}</span>
                             {/* Mobile: Show points inline */}
                             <span className="md:hidden text-xs font-bold text-zinc-400 ml-auto">{team.points}P | {team.group}</span>
                          </div>
                          
                          {/* Desktop: Points */}
                          <span className="hidden md:flex font-bold text-white bg-black/30 px-2 py-1 rounded text-sm justify-center">{team.points}</span>
                          
                          {/* Desktop: GD */}
                          <span className={`hidden md:flex font-mono text-sm justify-center ${team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                          </span>
                          
                          {/* Desktop: Group */}
                          <span className="hidden md:flex text-zinc-500 font-mono text-sm justify-center">{team.group}</span>
                          
                          {/* Status Badge */}
                          <span className={`px-2 py-1 rounded text-[9px] md:text-[10px] font-black uppercase whitespace-nowrap ${isQualified ? 'bg-emerald-500 text-black' : 'bg-red-500/20 text-red-400'}`}>
                            {isQualified ? 'Geçti' : 'Elendi'}
                          </span>
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
                        {/* Round Header - Premium Design */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
                          <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                            <div className="relative px-6 py-3 bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-2xl shadow-green-900/20">
                              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 uppercase tracking-wider drop-shadow-lg">
                                {getRoundName(round.length * 2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
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
                                <div key={pIdx} style={{ backfaceVisibility: 'hidden' }} className="bg-gradient-to-b from-[#1a1f1c] to-[#0d0d0d] rounded-3xl p-5 ring-1 ring-inset ring-zinc-700/50 flex flex-col gap-4 relative group hover:ring-green-600/40 transition-all duration-300 w-full md:w-[22rem] shadow-xl shadow-black/40 transform-gpu">
                                    {/* Match Number Badge */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                      <div className="px-4 py-1.5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full border border-white/10 shadow-lg">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Eşleşme {pIdx + 1}</span>
                                      </div>
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
                  className="relative p-12 mt-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#0a2818] via-[#051a0f] to-black border border-green-500/30 text-center group shadow-[0_0_80px_rgba(34,197,94,0.15)]"
                >
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 via-green-800/10 to-transparent" />
                  
                  <div className="relative z-10 flex flex-col items-center py-8">
                      {/* Flag at top with animated glow */}
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0, y: -30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative mb-10"
                      >
                        {/* Animated pulsing glow behind flag */}
                        <motion.div 
                          animate={{ 
                            scale: [1.3, 1.6, 1.3],
                            opacity: [0.3, 0.5, 0.3]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          className="absolute inset-0 bg-gradient-radial from-green-400/40 via-green-500/20 to-transparent blur-3xl rounded-full"
                        />
                        
                        {/* Flag container with shine effect */}
                        <div className="relative overflow-hidden rounded-xl">
                          {/* Shine sweep effect */}
                          <div 
                            className="absolute inset-0 z-10 pointer-events-none"
                            style={{
                              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)",
                              backgroundSize: "250% 100%",
                              animation: "shimmer 4s infinite ease-in-out"
                            }}
                          />
                          <img 
                            src={`https://flagcdn.com/w320/${champion?.code}.png`} 
                            alt={champion.name}
                            className="relative h-32 md:h-40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                          />
                        </div>
                      </motion.div>
                      
                      {/* Title text */}
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-green-500 font-bold tracking-[0.3em] uppercase mb-6 block text-sm md:text-base"
                      >
                        2026 DÜNYA KUPASI ŞAMPİYONU
                      </motion.span>
                     
                      {/* Country Name - Large */}
                      <motion.span 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight"
                      >
                        {champion.name}
                      </motion.span>
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
          className="pointer-events-auto flex items-center gap-2 p-2 bg-green-950/90 backdrop-blur-2xl border border-green-500/20 rounded-2xl shadow-2xl shadow-green-900/50 ring-1 ring-green-400/10 max-w-[95vw] overflow-x-auto custom-scrollbar"
        >
            {/* BACK BUTTON */}
            <button 
              onClick={handleBack}
              className="p-3 hover:bg-green-500/20 rounded-xl transition-all text-green-300 hover:text-white group relative shrink-0"
              title="Ana Menü"
            >
              <Home size={22} />
            </button>

            {phase !== 'SETUP' && (
              <>
                <div className="h-8 w-px bg-green-500/20 mx-1 shrink-0" />

                {/* Reset Button */}
               <button 
                  onClick={() => resetTournament('SETUP')}
                  className="flex items-center gap-2 px-4 py-3 bg-green-900/30 hover:bg-green-800/50 text-green-200 hover:text-white rounded-xl transition-all border border-green-500/10 hover:border-green-400/30 font-medium text-sm shrink-0"
                  title="Sıfırla"
                >
                  <RotateCcw size={18} />
                  <span className="hidden sm:inline">Sıfırla</span>
                </button>
               
                {/* CENTER: Progress Info */}
                <div className="hidden md:flex flex-col items-center px-4 shrink-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                    {champion ? 'DÜNYA ŞAMPİYONU' : 
                     phase === 'GROUPS' ? 'GRUP AŞAMASI' : 
                     knockoutMatches.length === 1 ? 'SON 32 TURU' :
                     knockoutMatches.length === 2 ? 'SON 16 TURU' :
                     knockoutMatches.length === 3 ? 'ÇEYREK FİNAL' :
                     knockoutMatches.length === 4 ? 'YARI FİNAL' :
                     knockoutMatches.length === 5 ? 'BÜYÜK FİNAL' : 'ELEME TURU'}
                  </span>
                  <div className="flex gap-1 h-1 mt-1">
                     {/* Manual mapping for visual progress */}
                     {['GROUPS', 'R32', 'R16', 'QF', 'SF', 'FINAL'].map((p, i) => {
                        // Determine active state based on phase and knockout rounds
                        let isActive = false;
                        if (phase === 'GROUPS' && i === 0) isActive = true;
                        if (phase === 'KNOCKOUT') {
                           if (i === 0) isActive = true; // Groups done
                           // i=1 (R32) -> knockoutMatches.length >= 1
                           if (i >= 1 && knockoutMatches.length >= i) isActive = true; 
                        }
                        if (champion) isActive = true; // All done

                        // highlight current step
                        let isCurrent = false;
                        if (phase === 'GROUPS' && i === 0) isCurrent = true;
                         if (phase === 'KNOCKOUT') {
                           if (i === knockoutMatches.length) isCurrent = true;
                         }

                        return (
                          <motion.div
                            key={p}
                            initial={false}
                            animate={{
                              backgroundColor: isActive ? '#22c55e' : '#27272a', // green-500 vs zinc-800
                              width: isCurrent ? 16 : 4
                            }}
                            className="h-1 rounded-full"
                          />
                        );
                     })}
                  </div>
                </div>

                <div className="h-8 w-px bg-green-500/20 mx-1 shrink-0" />

                {/* Dynamic Action Button */}
                <WCActionButton 
                   phase={phase}
                   allGroupsComplete={allGroupsComplete}
                   champion={champion}
                   simulateAllGroups={simulateAllGroups}
                   initializeKnockout={initializeKnockout}
                   simulateRound={simulateRound}
                />
              </>
            )}
        </motion.div>
      </div>
    </div>
  );
};


// ... SUBCOMPONENTS (Styled) ...

const WCActionButton = ({ phase, allGroupsComplete, champion, simulateAllGroups, initializeKnockout, simulateRound }) => {
  const btnBase = "h-11 px-4 text-sm rounded-xl font-bold flex items-center gap-2.5 transition-all active:scale-95 shadow-lg whitespace-nowrap";
  const btnPrimary = `${btnBase} bg-gradient-to-r from-green-700 to-green-600 text-white hover:brightness-110 shadow-green-900/40 border border-green-500/20`;

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
    return null;
  }
  return null;
};

const GroupCard = ({ name, teams, matches, onSimulate, onReorder, onUpdatePoints }) => {
  const allPlayed = matches.length > 0 && matches.every(m => m.played);
  return (
    <div style={{ backfaceVisibility: 'hidden' }} className="group bg-gradient-to-b from-[#0f1f15] to-[#0d0d0d] rounded-2xl ring-1 ring-inset ring-green-900/40 overflow-hidden hover:ring-green-600/40 transition-all shadow-xl shadow-black/40 transform-gpu">
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
                ${i < 2 ? 'bg-gradient-to-r from-green-500/10 to-transparent' : 
                  isThird ? 'bg-gradient-to-r from-emerald-600/10 to-transparent border border-emerald-600/20' : 'hover:bg-white/5'}`}
            >
              <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg 
                ${i < 2 ? 'bg-green-600 text-white' : 
                  isThird ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                {i + 1}
              </span>
              <img src={`https://flagcdn.com/w40/${team.code}.png`} className="w-5 h-3.5 object-contain shadow-sm" alt="" />
              <span className={`flex-1 text-sm font-medium truncate ${i < 2 ? 'text-white' : isThird ? 'text-emerald-200' : 'text-zinc-400'}`}>{team.name}</span>
              
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
    <div style={{ backfaceVisibility: 'hidden' }} className={`relative bg-gradient-to-b from-zinc-900 to-[#0d0d0d] ring-2 ring-inset ${isFinal ? 'ring-emerald-500/60 shadow-[0_0_60px_rgba(52,211,153,0.25)]' : 'ring-zinc-700/50 hover:ring-green-600/40'} rounded-2xl overflow-hidden transition-all transform-gpu ${isFinal ? 'min-w-[28rem]' : ''}`}>
      {isFinal && <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />}
      {isFinal && <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />}
      
      <div className={`${isFinal ? 'px-10 py-8 space-y-8' : 'p-1 space-y-0.5'}`}>
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
      ${isWinner ? 'bg-emerald-500/10' : 'hover:bg-white/5'} 
      ${!isPlayable && !isWinner ? 'opacity-50' : ''}
      ${isFinal ? 'py-4' : ''}
    `}
  >
    {isWinner && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
    
    <div className={`relative flex-shrink-0 rounded overflow-hidden shadow-sm ${isFinal ? 'w-14 h-10' : 'w-6 h-4'}`}>
       <img src={`https://flagcdn.com/${isFinal ? 'w80' : 'w40'}/${team?.code || 'placeholder'}.png`} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} alt="" />
    </div>
    
    <span className={`flex-1 text-left text-sm truncate font-medium ${isWinner ? 'text-green-400' : 'text-zinc-400 group-hover:text-zinc-200'} ${isFinal ? 'text-lg' : ''}`}>
      {team?.name || '...'}
    </span>
    
    {score !== undefined && (
      <span className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold ${isWinner ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500'} ${isFinal ? 'scale-125' : ''}`}>
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
