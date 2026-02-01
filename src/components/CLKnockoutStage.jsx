import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCL } from '../context/CLContext';
import { Trophy, Play, FastForward, RotateCcw, Crown, Shuffle, Star, ChevronDown } from 'lucide-react';

/**
 * CLKnockoutStage - Vertical Tree Layout
 * 
 * Design: Top-to-bottom flow
 * Playoffs → R16 → Quarters → Semis → Final
 */

// Team Logo
const TeamLogo = ({ src, name, size = 'md' }) => {
  const [error, setError] = useState(false);
  const sizes = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  
  if (error || !src) {
    return (
      <div className={`${sizes[size]} rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xs`}>
        {name?.charAt(0)}
      </div>
    );
  }
  return <img src={src} alt={name} className={`${sizes[size]} object-contain`} onError={() => setError(true)} />;
};

// Compact Match Card (Playoff style)
const CompactMatch = ({ match, onSimulate, onSelect, side }) => {
  if (!match) return null;
  const winnerA = match.winner?.id === (match.home?.id || match.teamA?.id);
  const winnerB = match.winner?.id === (match.away?.id || match.teamB?.id);
  const teamA = match.home || match.teamA;
  const teamB = match.away || match.teamB;

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-all w-40">
      {/* Team A */}
      <div 
        onClick={() => !match.played && onSelect?.(match.id, teamA?.id, side)}
        className={`flex items-center gap-2 px-2.5 py-2 cursor-pointer hover:bg-zinc-800/50 border-b border-zinc-800
          ${winnerA ? 'bg-emerald-500/10' : winnerB ? 'opacity-40' : ''}`}
      >
        <TeamLogo src={teamA?.logo} name={teamA?.name} size="sm" />
        <span className={`flex-1 text-xs font-medium truncate ${winnerA ? 'text-emerald-400' : 'text-zinc-200'}`}>
          {teamA?.shortName || teamA?.name?.slice(0, 3)}
        </span>
        {match.played && <span className="text-xs font-bold text-white">{match.aggScoreA ?? match.scoreA}</span>}
        {winnerA && <Crown className="w-3 h-3 text-amber-400" />}
      </div>
      {/* Team B */}
      <div 
        onClick={() => !match.played && onSelect?.(match.id, teamB?.id, side)}
        className={`flex items-center gap-2 px-2.5 py-2 cursor-pointer hover:bg-zinc-800/50
          ${winnerB ? 'bg-emerald-500/10' : winnerA ? 'opacity-40' : ''}`}
      >
        <TeamLogo src={teamB?.logo} name={teamB?.name} size="sm" />
        <span className={`flex-1 text-xs font-medium truncate ${winnerB ? 'text-emerald-400' : 'text-zinc-200'}`}>
          {teamB?.shortName || teamB?.name?.slice(0, 3)}
        </span>
        {match.played && <span className="text-xs font-bold text-white">{match.aggScoreB ?? match.scoreB}</span>}
        {winnerB && <Crown className="w-3 h-3 text-amber-400" />}
      </div>
      {/* Simulate */}
      {!match.played && (
        <button 
          onClick={() => onSimulate?.(match.id, side)}
          className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] flex items-center justify-center gap-1 transition-all"
        >
          <Play size={8} fill="currentColor" /> Simüle
        </button>
      )}
    </div>
  );
};

// Slot placeholder
const Slot = () => (
  <div className="w-40 h-16 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50" />
);

// Round Header
const RoundHeader = ({ children, count, onSimulateAll, showSimulate }) => (
  <div className="flex items-center justify-center gap-3 mb-4">
    <div className="h-px flex-1 bg-zinc-800" />
    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{children}</span>
    {count && <span className="text-[10px] text-zinc-600">({count})</span>}
    {showSimulate && (
      <button onClick={onSimulateAll} className="text-[10px] text-amber-500/70 hover:text-amber-400 flex items-center gap-1">
        <FastForward size={10} /> Tümü
      </button>
    )}
    <div className="h-px flex-1 bg-zinc-800" />
  </div>
);

// Vertical connector
const Connector = () => (
  <div className="flex justify-center py-2">
    <ChevronDown className="w-4 h-4 text-zinc-700" />
  </div>
);

// Final Card
const FinalCard = ({ match, onSimulate, onSelect }) => (
  <div className="flex flex-col items-center py-6">
    {/* Trophy */}
    <motion.div 
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="mb-3"
    >
      <Trophy className="w-10 h-10 text-amber-400" />
    </motion.div>
    
    <div className="text-lg font-bold text-amber-400 mb-3">ŞAMPİYON</div>
    
    {/* Winner */}
    {match?.winner && (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="flex flex-col items-center mb-4"
      >
        <TeamLogo src={match.winner.logo} name={match.winner.name} size="xl" />
        <div className="text-amber-400 font-bold mt-2">{match.winner.name}</div>
      </motion.div>
    )}
    
    {/* Final box */}
    <div className="bg-zinc-900 rounded-xl border border-amber-500/30 px-5 py-4">
      <div className="text-amber-500 text-xs font-bold text-center mb-3 flex items-center justify-center gap-2">
        <Star className="w-3 h-3" fill="currentColor" /> FİNAL <Star className="w-3 h-3" fill="currentColor" />
      </div>
      {match ? (
        <div className="flex items-center gap-4">
          <div 
            className="text-center cursor-pointer hover:opacity-80" 
            onClick={() => !match.played && onSelect?.(match.teamA?.id)}
          >
            <TeamLogo src={match.teamA?.logo} name={match.teamA?.name} size="md" />
            <div className="text-xs text-zinc-400 mt-1">{match.teamA?.shortName}</div>
            {match.played && <div className="text-lg font-bold text-white">{match.scoreA}</div>}
          </div>
          <div className="text-zinc-600 text-sm font-bold">vs</div>
          <div 
            className="text-center cursor-pointer hover:opacity-80" 
            onClick={() => !match.played && onSelect?.(match.teamB?.id)}
          >
            <TeamLogo src={match.teamB?.logo} name={match.teamB?.name} size="md" />
            <div className="text-xs text-zinc-400 mt-1">{match.teamB?.shortName}</div>
            {match.played && <div className="text-lg font-bold text-white">{match.scoreB}</div>}
          </div>
        </div>
      ) : (
        <div className="text-zinc-600 text-xs text-center">Yarı Final Kazananları</div>
      )}
      {match && !match.played && (
        <button 
          onClick={onSimulate}
          className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold rounded-lg transition-all"
        >
          🏆 Finali Oyna
        </button>
      )}
    </div>
  </div>
);

// Main Component
const CLKnockoutStage = () => {
  const {
    phase, leftPlayoffs, rightPlayoffs, r16Potentials, drawComplete,
    leftR16, rightR16, leftQF, rightQF, leftSF, rightSF, finalMatch,
    initializeTournament, simulatePlayoff, selectPlayoffWinner, simulateAllPlayoffs,
    performR16Draw, simulateR16, selectR16Winner, simulateAllR16,
    initializeQF, simulateQF, selectQFWinner, simulateAllQF,
    initializeSF, simulateSF, selectSFWinner, simulateAllSF,
    initializeFinal, simulateFinal, selectFinalWinner, resetTournament,
    allPlayoffsPlayed, allR16Played, allQFPlayed, allSFPlayed,
  } = useCL();

  // Setup screen
  if (phase === 'SETUP') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">UEFA Şampiyonlar Ligi</h2>
        <p className="text-zinc-500 text-sm mb-6">2025-26 Sezonu</p>
        <button 
          onClick={initializeTournament} 
          className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-8 py-3 rounded-xl transition-all"
        >
          Turnuvaya Başla
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-white">Turnuva Ağacı</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {allPlayoffsPlayed && !drawComplete && (
            <button onClick={performR16Draw} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-xs font-bold rounded-lg flex items-center gap-1">
              <Shuffle size={12} /> Kura Çek
            </button>
          )}
          {allR16Played && leftQF.length === 0 && (
            <button onClick={initializeQF} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg">
              Çeyrek Final
            </button>
          )}
          {allQFPlayed && !leftSF && (
            <button onClick={initializeSF} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg">
              Yarı Final
            </button>
          )}
          {allSFPlayed && !finalMatch && (
            <button onClick={initializeFinal} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-xs font-bold rounded-lg">
              Final
            </button>
          )}
          <button onClick={resetTournament} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs rounded-lg flex items-center gap-1 border border-zinc-700">
            <RotateCcw size={10} /> Sıfırla
          </button>
        </div>
      </div>

      {/* VERTICAL BRACKET */}
      <div className="max-w-5xl mx-auto">
        
        {/* PLAYOFFS */}
        <RoundHeader 
          count={leftPlayoffs.length + rightPlayoffs.length}
          showSimulate={[...leftPlayoffs, ...rightPlayoffs].some(m => !m.played)}
          onSimulateAll={simulateAllPlayoffs}
        >
          Playoffs
        </RoundHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 justify-items-center mb-2">
          {leftPlayoffs.map(m => <CompactMatch key={m.id} match={m} onSimulate={simulatePlayoff} onSelect={selectPlayoffWinner} side="left" />)}
          {rightPlayoffs.map(m => <CompactMatch key={m.id} match={m} onSimulate={simulatePlayoff} onSelect={selectPlayoffWinner} side="right" />)}
        </div>
        
        <Connector />
        
        {/* ROUND OF 16 */}
        <RoundHeader 
          count={8}
          showSimulate={drawComplete && [...leftR16, ...rightR16].some(m => !m.played)}
          onSimulateAll={simulateAllR16}
        >
          Son 16
        </RoundHeader>
        {!drawComplete ? (
          <div className="text-center py-6">
            <p className="text-zinc-500 text-sm mb-3">Playoff'lar tamamlandığında kura çekilecek</p>
            {allPlayoffsPlayed && (
              <button onClick={performR16Draw} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold rounded-lg flex items-center gap-2 mx-auto">
                <Shuffle size={14} /> Kura Çek
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 justify-items-center mb-2">
            {leftR16.map(m => <CompactMatch key={m.id} match={m} onSimulate={simulateR16} onSelect={selectR16Winner} side="left" />)}
            {rightR16.map(m => <CompactMatch key={m.id} match={m} onSimulate={simulateR16} onSelect={selectR16Winner} side="right" />)}
          </div>
        )}
        
        <Connector />
        
        {/* QUARTER FINALS */}
        <RoundHeader 
          count={4}
          showSimulate={[...leftQF, ...rightQF].some(m => !m.played)}
          onSimulateAll={simulateAllQF}
        >
          Çeyrek Final
        </RoundHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center mb-2">
          {leftQF.length > 0 ? (
            leftQF.map(m => <CompactMatch key={m.id} match={m} onSimulate={simulateQF} onSelect={selectQFWinner} side="left" />)
          ) : <><Slot /><Slot /></>}
          {rightQF.length > 0 ? (
            rightQF.map(m => <CompactMatch key={m.id} match={m} onSimulate={simulateQF} onSelect={selectQFWinner} side="right" />)
          ) : <><Slot /><Slot /></>}
        </div>
        
        <Connector />
        
        {/* SEMI FINALS */}
        <RoundHeader count={2}>Yarı Final</RoundHeader>
        <div className="grid grid-cols-2 gap-8 justify-items-center mb-2 max-w-lg mx-auto">
          {leftSF ? (
            <CompactMatch match={leftSF} onSimulate={() => simulateSF('left')} onSelect={(id, wid) => selectSFWinner(wid, 'left')} side="left" />
          ) : <Slot />}
          {rightSF ? (
            <CompactMatch match={rightSF} onSimulate={() => simulateSF('right')} onSelect={(id, wid) => selectSFWinner(wid, 'right')} side="right" />
          ) : <Slot />}
        </div>
        
        <Connector />
        
        {/* FINAL */}
        <FinalCard match={finalMatch} onSimulate={simulateFinal} onSelect={selectFinalWinner} />
        
      </div>
    </div>
  );
};

export default CLKnockoutStage;
