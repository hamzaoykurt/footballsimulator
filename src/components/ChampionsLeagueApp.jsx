import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ChevronLeft, Calendar, Shield, Users, Crown, 
  ArrowRight, Play, RotateCcw, AlertCircle, Star, Sparkles,
  Swords, Zap, Shuffle, ChevronRight, Home
} from 'lucide-react';
import { useCL } from '../context/CLContext';
import AnimatedBackground from './AnimatedBackground';

/**
 * CHAMPIONS LEAGUE APP - PREMIUM EDITION
 * 
 * Modern bracket design with:
 * - Glassmorphism cards
 * - Team logos
 * - Premium animations
 * - Proper visual hierarchy
 */

// ===== HELPERS =====
const getPhaseTitle = (phase) => {
  switch(phase) {
    case 'PLAYOFF': return 'Playoff Turu';
    case 'R16': return 'Son 16';
    case 'QF': return 'Çeyrek Final';
    case 'SF': return 'Yarı Final';
    case 'FINAL': return 'Final';
    case 'COMPLETE': return 'Tamamlandı';
    default: return 'Turnuva';
  }
};

const getGridCols = (count) => {
  if (count <= 1) return 'grid-cols-1 max-w-md mx-auto';
  if (count <= 2) return 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto';
  if (count <= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  if (count <= 8) return 'grid-cols-2 md:grid-cols-4';
  return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8';
};

const ChampionsLeagueApp = ({ onBack, view }) => {
  const { 
    phase, 
    isReady,
    leftPlayoffs, rightPlayoffs,
    leftR16, rightR16,
    leftQF, rightQF,
    leftSF, rightSF,
    finalMatch, champion,
    
    startTournament,
    simulateAllPlayoffs,
    initializeR16, simulateAllR16,
    initializeQF, simulateAllQF,
    initializeSF, simulateAllSF,
    initializeFinal, simulateFinal,
    resetTournament,
    setManualWinner,
    
    allPlayoffsPlayed, allR16Played, allQFPlayed, allSFPlayed,
  } = useCL();

  const r16Ref = useRef(null);
  const qfRef = useRef(null);
  const sfRef = useRef(null);
  const finalRef = useRef(null);
  const championRef = useRef(null);
  
  // Auto-scroll effect
  useEffect(() => {
    if (phase === 'R16' && r16Ref.current) {
      setTimeout(() => r16Ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    } else if (phase === 'QF' && qfRef.current) {
      setTimeout(() => qfRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    } else if (phase === 'SF' && sfRef.current) {
      setTimeout(() => sfRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    } else if (phase === 'FINAL' && finalMatch) {
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 500);
    } else if (champion && championRef.current) {
      setTimeout(() => championRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [phase, finalMatch, champion]);

  const handleStart = () => startTournament();
  const handleBack = () => onBack(); // Don't reset immediately

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />
      
      {/* Header Removed - Replaced by Floating Island */}

      {/* CONTENT */}
      <main className="container mx-auto px-4 py-8 pb-40 relative">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl shadow-blue-500/10">
              <Star className="text-blue-400 drop-shadow-lg" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">Şampiyonlar Ligi</h1>
              <p className="text-sm text-zinc-400 font-medium tracking-wide border-l-2 border-blue-500 pl-2 ml-1">
                2025-26 Sezonu
              </p>
            </div>
          </div>
        </header>
        
        {/* SETUP VIEW */}
        {phase === 'SETUP' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] relative"
          >
            <div className="w-full max-w-md">
                <button 
                  onClick={handleStart}
                  className="w-full group relative h-[28rem] rounded-[2.5rem] overflow-hidden text-left transition-all hover:scale-[1.02] shadow-2xl shadow-black/50 ring-1 ring-white/10 group-hover:ring-blue-500/50"
                >
                  {/* Liquid Background Layer */}
                  <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-3xl transition-colors z-0" />
                  
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628172828628-91fb57d425f1?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center group-hover:opacity-30 transition-opacity mix-blend-overlay" />
                  
                  <div className="relative z-10 p-10 h-full flex flex-col justify-between items-center text-center">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center backdrop-blur-md ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-all text-blue-400 shadow-xl shadow-blue-900/20">
                      <Trophy size={40} />
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
                        Turnuvayı Başlat
                      </h2>
                      <p className="text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
                        Avrupa'nın en büyük kupası için mücadele et. Final yolu seni bekliyor.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300">
                      <Play size={20} fill="currentColor" />
                      <span>HEMEN BAŞLA</span>
                    </div>
                  </div>
                </button>
            </div>
          </motion.div>
        )}

        {/* TOURNAMENT VIEW */}
        {phase !== 'SETUP' && isReady && (
          <div className="space-y-8">
            
            {/* Header + Actions */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Swords className="text-blue-400" size={20} />
                  </div>
                  {getPhaseTitle(phase)}
                </h2>
                <p className="text-zinc-500 mt-1">Kazananı seçmek için takıma tıkla</p>
              </div>
            </div>

            {/* Champion Display */}


            {/* ROUNDS */}
            
            {/* Playoffs */}
            <RoundSection 
              title="Playoffs"
              matches={[...leftPlayoffs, ...rightPlayoffs]}
              stage="PLAYOFF"
              onSelectWinner={setManualWinner}
              show={true}
            />

            {/* Round of 16 */}
            <RoundSection 
              title="Son 16"
              matches={[...leftR16, ...rightR16]}
              stage="R16"
              onSelectWinner={setManualWinner}
              show={leftR16.length > 0}
              sectionRef={r16Ref}
            />

            {/* Quarter Finals */}
            <RoundSection 
              title="Çeyrek Final"
              matches={[...leftQF, ...rightQF]}
              stage="QF"
              onSelectWinner={setManualWinner}
              show={phase === 'QF' || phase === 'SF' || phase === 'FINAL' || phase === 'COMPLETE'}
              sectionRef={qfRef}
            />

            {/* Semi Finals - Unified */}
            <RoundSection
              title="Yarı Final"
              matches={[leftSF, rightSF].filter(Boolean)}
              stage="SF"
              onSelectWinner={setManualWinner}
              show={phase === 'SF' || phase === 'FINAL' || phase === 'COMPLETE'}
              sectionRef={sfRef}
            />

            {finalMatch && (
              <RoundSection
                title="Büyük Final"
                matches={[finalMatch]}
                stage="FINAL"
                onSelectWinner={setManualWinner}
                show={phase === 'FINAL' || phase === 'COMPLETE'}
              />
            )}

            {champion && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-20 bg-gradient-to-b from-blue-900/40 via-blue-950/20 to-transparent rounded-[3rem] border border-blue-500/30 shadow-2xl shadow-blue-900/40 overflow-hidden relative"
                ref={championRef}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)] animate-pulse" />
                
                 {/* Rotating Logo Effect */}
                 <div className="relative mb-12">
                  <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                     {/* Try to use team logo if available, otherwise Trophy */}
                     {champion.logo ? (
                        <div className="w-40 h-40 drop-shadow-[0_0_50px_rgba(245,158,11,0.6)]">
                          <img src={champion.logo} alt={champion.name} className="w-full h-full object-contain" />
                        </div>
                     ) : (
                        <Trophy size={120} className="text-amber-500 drop-shadow-2xl" />
                     )}
                  </motion.div>
                </div>

                <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="text-center relative z-10"
                >
                  <span className="text-blue-400 font-black tracking-[0.5em] uppercase mb-4 block text-sm">2025-26 ŞAMPİYONU</span>
                  <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">{champion.name}</h2>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* FLOATING CONTROL ISLAND (PORTALLED) */}
      {createPortal(
        <AnimatePresence>
          {view === 'championsleague' && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="flex items-center gap-2 p-2 bg-blue-950/90 backdrop-blur-2xl border border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-900/50 ring-1 ring-blue-400/10 pointer-events-auto max-w-[95vw] overflow-x-auto custom-scrollbar"
              >
                <button
                  onClick={handleBack}
                  className="p-3 hover:bg-blue-500/20 rounded-xl transition-all text-blue-300 hover:text-white group relative shrink-0"
                  title="Ana Menü"
                >
                  <Home size={22} />
                </button>

                {phase !== 'SETUP' && (
                  <>
                    <div className="w-px h-8 bg-blue-500/20 mx-1 shrink-0" />

                    <button
                      onClick={() => resetTournament('SETUP')}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-900/30 hover:bg-blue-800/50 text-blue-200 hover:text-white rounded-xl transition-all border border-blue-500/10 hover:border-blue-400/30 font-medium text-sm shrink-0"
                      title="Turnuvayı Sıfırla"
                    >
                      <RotateCcw size={18} />
                      <span className="hidden sm:inline">Sıfırla</span>
                    </button>

                    {/* CENTER: Info */}
                    <div className="hidden md:flex flex-col items-center px-4 shrink-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                        {phase === 'FINAL' ? 'BÜYÜK FİNAL' : getPhaseTitle(phase)}
                      </span>
                      <div className="flex gap-1 h-1 mt-1">
                        {['PLAYOFF', 'R16', 'QF', 'SF', 'FINAL'].map((p, i) => {
                          const active = ['PLAYOFF', 'R16', 'QF', 'SF', 'FINAL', 'COMPLETE'].indexOf(phase) >= i;
                          return (
                            <motion.div
                              key={p}
                              initial={false}
                              animate={{
                                backgroundColor: active ? '#3b82f6' : '#27272a',
                                width: phase === p ? 16 : 4
                              }}
                              className="h-1 rounded-full"
                            />
                          );
                        })}
                      </div>
                    </div>

                    <ActionButton
                      phase={phase}
                      allPlayoffsPlayed={allPlayoffsPlayed}
                      allR16Played={allR16Played}
                      allQFPlayed={allQFPlayed}
                      allSFPlayed={allSFPlayed}
                      finalMatch={finalMatch}
                      simulateAllPlayoffs={simulateAllPlayoffs}
                      initializeR16={initializeR16}
                      simulateAllR16={simulateAllR16}
                      initializeQF={initializeQF}
                      simulateAllQF={simulateAllQF}
                      initializeSF={initializeSF}
                      simulateAllSF={simulateAllSF}
                      initializeFinal={initializeFinal}
                      simulateFinal={simulateFinal}
                    />
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

// ===== ACTION BUTTON =====
const ActionButton = ({ 
  phase, allPlayoffsPlayed, allR16Played, allQFPlayed, allSFPlayed, finalMatch,
  simulateAllPlayoffs, initializeR16, simulateAllR16, initializeQF, simulateAllQF,
  initializeSF, simulateAllSF, initializeFinal, simulateFinal
}) => {
  const btnClass = "px-4 py-3 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all whitespace-nowrap text-sm";
  const primary = `${btnClass} bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/25 hover:brightness-110`;
  const secondary = `${btnClass} bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/25`;

  if (phase === 'PLAYOFF' && !allPlayoffsPlayed) {
    return <button onClick={simulateAllPlayoffs} className={primary}>Tümünü Simüle Et</button>;
  }
  if (phase === 'PLAYOFF' && allPlayoffsPlayed) {
    return <button onClick={initializeR16} className={secondary}><Shuffle size={16} /> Son 16'ya Geç</button>;
  }
  if (phase === 'R16' && !allR16Played) {
    return <button onClick={simulateAllR16} className={primary}>Simüle Et</button>;
  }
  if (phase === 'R16' && allR16Played) {
    return <button onClick={initializeQF} className={secondary}>Çeyrek Final <ChevronRight size={16} /></button>;
  }
  if (phase === 'QF' && !allQFPlayed) {
    return <button onClick={simulateAllQF} className={primary}>Simüle Et</button>;
  }
  if (phase === 'QF' && allQFPlayed) {
    return <button onClick={initializeSF} className={secondary}>Yarı Final <ChevronRight size={16} /></button>;
  }
  if (phase === 'SF' && !allSFPlayed) {
    return <button onClick={simulateAllSF} className={primary}>Simüle Et</button>;
  }
  if (phase === 'SF' && allSFPlayed) {
    return <button onClick={initializeFinal} className={secondary}>Final <ChevronRight size={16} /></button>;
  }
  if (phase === 'FINAL' && finalMatch && !finalMatch.played) {
    return <button onClick={simulateFinal} className={primary}>🏆 Finali Oyna</button>;
  }
  return null;
};

// ===== ROUND SECTION =====
const RoundSection = ({ title, matches, stage, onSelectWinner, show, sectionRef }) => {
  if (!show || matches.length === 0) return null;
  
  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>
      
      <div className={`grid gap-4 ${getGridCols(matches.length)}`}>
        {matches.map((match, idx) => (
          <CLMatchCard 
            key={match.id}
            match={match}
            stage={stage}
            onSelectWinner={onSelectWinner}
            index={idx}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ===== CL MATCH CARD =====
const CLMatchCard = ({ match, stage, onSelectWinner, isFinal, index = 0 }) => {
  const teamA = match.home || match.teamA;
  const teamB = match.away || match.teamB;
  const winnerA = match.winner?.id === teamA?.id;
  const winnerB = match.winner?.id === teamB?.id;
  const isPlayable = !match.played && teamA && teamB;
  const scoreA = match.aggScoreA ?? match.scoreA;
  const scoreB = match.aggScoreB ?? match.scoreB;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300 group
        ${isFinal 
          ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-400/30 shadow-2xl shadow-blue-900/20' 
          : 'bg-slate-900/60 border-white/5 hover:border-blue-500/30 hover:bg-blue-900/20'}
      `}
    >
      {isFinal && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />}
      {isFinal && (
        <div className="absolute top-3 left-3 right-3 flex justify-center">
          <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-[10px] font-bold tracking-widest border border-blue-500/20">
            FİNAL
          </span>
        </div>
      )}

      <div className={`p-4 ${isFinal ? 'pt-10' : ''}`}>
        {/* Team A */}
        <CLTeamRow 
          team={teamA}
          score={scoreA}
          isWinner={winnerA}
          isLoser={winnerB}
          isPlayable={isPlayable}
          onClick={() => isPlayable && onSelectWinner(match.id, teamA?.id, stage)}
          isFinal={isFinal}
        />
        
        {/* VS Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">vs</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>
        
        {/* Team B */}
        <CLTeamRow 
          team={teamB}
          score={scoreB}
          isWinner={winnerB}
          isLoser={winnerA}
          isPlayable={isPlayable}
          onClick={() => isPlayable && onSelectWinner(match.id, teamB?.id, stage)}
          isFinal={isFinal}
        />
      </div>
    </motion.div>
  );
};

// ===== CL TEAM ROW =====
const CLTeamRow = ({ team, score, isWinner, isLoser, isPlayable, onClick, isFinal }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isPlayable}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all
        ${isWinner ? 'bg-emerald-500/15 border border-emerald-500/30' : ''}
        ${isLoser ? 'opacity-40' : ''}
        ${!isWinner && !isLoser && isPlayable ? 'hover:bg-white/5 cursor-pointer' : ''}
        ${!isPlayable && !isWinner && !isLoser ? 'cursor-default' : ''}
      `}
    >
      {/* Logo */}
      <div className={`
        w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center 
        bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-400
        border border-white/20 shadow-sm shrink-0
      `}>
        <img 
          src={team?.logo}
          alt={team?.name}
          className="w-9 h-9 object-contain drop-shadow-md"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      
      {/* Name */}
      <span className={`flex-1 text-left font-semibold truncate text-sm font-bold truncate ${isWinner ? 'text-cyan-400 drop-shadow-md' : 'text-slate-400 group-hover:text-slate-200'} ${isFinal ? 'text-lg' : ''}`}>
        {team?.shortName || team?.name || 'TBD'}
      </span>
      
      {/* Score */}
      {score !== null && score !== undefined && (
        <span className={`
          min-w-[2rem] h-8 flex items-center justify-center rounded-lg font-bold tabular-nums
          flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold
          ${isWinner ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-500'}
          ${isFinal ? 'w-8 h-8 text-sm' : ''}
        `}>
          {score}
        </span>
      )}
      
      {/* Winner indicator */}
      {isWinner && (
        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <Crown size={12} className="text-white" />
        </div>
      )}
    </button>
  );
};

// ===== HELPERS =====
export default ChampionsLeagueApp;
