import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCL } from '../context/CLContext';
import { Trophy, Play, FastForward, RotateCcw, Crown, Shuffle } from 'lucide-react';

// Team Logo with fallback
const TeamLogo = ({ src, name, size = 'md' }) => {
  const [error, setError] = useState(false);
  const sizes = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-9 h-9', xl: 'w-12 h-12' };
  
  if (error || !src) {
    return (
      <div className={`${sizes[size]} rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-xs`}>
        {name?.charAt(0)}
      </div>
    );
  }
  return <img src={src} alt={name} className={`${sizes[size]} object-contain`} onError={() => setError(true)} />;
};

// Compact Playoff Card - Two teams side by side
const PlayoffCard = ({ match, onSimulate, onSelect, side }) => {
  if (!match) return null;
  const isLeft = side === 'left';
  const winnerA = match.winner?.id === match.home?.id;
  const winnerB = match.winner?.id === match.away?.id;

  return (
    <div className={`bg-zinc-900 rounded-lg border ${isLeft ? 'border-purple-900/50' : 'border-cyan-900/50'} w-40`}>
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-1">
          <TeamLogo src={match.home?.logo} name={match.home?.name} size="sm" />
          <span className={`text-xs font-semibold ${winnerA ? 'text-emerald-400' : winnerB ? 'text-zinc-600' : 'text-zinc-300'}`}>
            {match.home?.shortName?.slice(0, 3)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold ${winnerB ? 'text-emerald-400' : winnerA ? 'text-zinc-600' : 'text-zinc-300'}`}>
            {match.away?.shortName?.slice(0, 3)}
          </span>
          <TeamLogo src={match.away?.logo} name={match.away?.name} size="sm" />
        </div>
      </div>
      <div className="px-2 pb-2">
        {match.played ? (
          <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs">
            <Crown className="w-3 h-3 text-amber-400" />
            {match.winner?.shortName}
          </div>
        ) : (
          <div className="flex gap-1">
            <button onClick={() => onSelect(match.id, match.home.id, side)} className="flex-1 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded">
              {match.home?.shortName?.slice(0, 3)}
            </button>
            <button onClick={() => onSimulate(match.id, side)} className={`px-2 ${isLeft ? 'bg-purple-900/60' : 'bg-cyan-900/60'} rounded`}>
              <Play size={10} className="text-zinc-400" />
            </button>
            <button onClick={() => onSelect(match.id, match.away.id, side)} className="flex-1 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded">
              {match.away?.shortName?.slice(0, 3)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Potential Opponent Card (before draw)
const PotentialCard = ({ pair }) => (
  <div className="bg-zinc-900/80 rounded-lg border border-zinc-700 p-2 w-32 text-center">
    <div className="flex items-center justify-center gap-1 mb-1">
      <TeamLogo src={pair?.teamA?.logo} name={pair?.teamA?.name} size="sm" />
      <span className="text-zinc-500 text-[10px]">or</span>
      <TeamLogo src={pair?.teamB?.logo} name={pair?.teamB?.name} size="sm" />
    </div>
    <div className="text-[10px] text-zinc-600">vs Playoff Kazananı</div>
  </div>
);

// Match Card for all rounds
const MatchCard = ({ match, onSimulate, onSelect, side }) => {
  if (!match) return <div className="w-32 h-16 bg-zinc-900/50 rounded-lg border border-zinc-800" />;
  
  const winnerA = match.winner?.id === match.teamA?.id;
  const winnerB = match.winner?.id === match.teamB?.id;

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-32 overflow-hidden">
      <motion.div 
        whileHover={!match.played ? { backgroundColor: 'rgba(39,39,42,0.8)' } : {}}
        onClick={() => !match.played && onSelect?.(match.id, match.teamA?.id, side)}
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-zinc-800 ${winnerA ? 'bg-emerald-950/50' : winnerB ? 'opacity-40' : ''}`}
      >
        <TeamLogo src={match.teamA?.logo} name={match.teamA?.name} size="sm" />
        <span className={`flex-1 text-xs font-medium truncate ${winnerA ? 'text-emerald-400' : 'text-zinc-300'}`}>{match.teamA?.shortName}</span>
        {match.played && <span className="text-xs font-bold text-zinc-400">{match.aggScoreA ?? match.scoreA}</span>}
        {winnerA && <Crown className="w-3 h-3 text-amber-400" />}
      </motion.div>
      <motion.div 
        whileHover={!match.played ? { backgroundColor: 'rgba(39,39,42,0.8)' } : {}}
        onClick={() => !match.played && onSelect?.(match.id, match.teamB?.id, side)}
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${winnerB ? 'bg-emerald-950/50' : winnerA ? 'opacity-40' : ''}`}
      >
        <TeamLogo src={match.teamB?.logo} name={match.teamB?.name} size="sm" />
        <span className={`flex-1 text-xs font-medium truncate ${winnerB ? 'text-emerald-400' : 'text-zinc-300'}`}>{match.teamB?.shortName}</span>
        {match.played && <span className="text-xs font-bold text-zinc-400">{match.aggScoreB ?? match.scoreB}</span>}
        {winnerB && <Crown className="w-3 h-3 text-amber-400" />}
      </motion.div>
      {!match.played && (
        <button onClick={() => onSimulate?.(match.id, side)} className="w-full py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 text-[10px] flex items-center justify-center gap-1">
          <Play size={8} /> Simüle
        </button>
      )}
    </div>
  );
};

// Final Card
const FinalCard = ({ match, onSimulate, onSelect }) => (
  <div className="flex flex-col items-center">
    <Trophy className="w-12 h-12 text-amber-500 mb-2" />
    <div className="text-amber-500 text-lg font-bold mb-3">ŞAMPİYON</div>
    
    {match?.winner && (
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center mb-3">
        <TeamLogo src={match.winner.logo} name={match.winner.name} size="xl" />
        <div className="text-amber-400 font-bold mt-2">{match.winner.name}</div>
      </motion.div>
    )}
    
    <div className="bg-amber-950/30 rounded-xl border border-amber-800/40 px-4 py-3">
      <div className="text-amber-600 text-xs font-bold text-center mb-2">FİNAL</div>
      {match ? (
        <div className="flex items-center gap-3">
          <div className="text-center cursor-pointer" onClick={() => !match.played && onSelect?.(match.teamA?.id)}>
            <TeamLogo src={match.teamA?.logo} name={match.teamA?.name} size="md" />
            <div className="text-[10px] text-zinc-400 mt-1">{match.teamA?.shortName}</div>
            {match.played && <div className="text-lg font-bold text-zinc-100">{match.scoreA}</div>}
          </div>
          <div className="text-zinc-600 text-xs">vs</div>
          <div className="text-center cursor-pointer" onClick={() => !match.played && onSelect?.(match.teamB?.id)}>
            <TeamLogo src={match.teamB?.logo} name={match.teamB?.name} size="md" />
            <div className="text-[10px] text-zinc-400 mt-1">{match.teamB?.shortName}</div>
            {match.played && <div className="text-lg font-bold text-zinc-100">{match.scoreB}</div>}
          </div>
        </div>
      ) : (
        <div className="text-zinc-600 text-xs text-center">Yarı Final Kazananları</div>
      )}
      {match && !match.played && (
        <button onClick={onSimulate} className="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-500 text-zinc-900 text-xs font-bold rounded-lg">
          🏆 Finali Oyna
        </button>
      )}
    </div>
  </div>
);

// Slot placeholder
const Slot = () => <div className="w-32 h-12 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30" />;

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

  if (phase === 'SETUP') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Trophy className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">UEFA Şampiyonlar Ligi</h2>
        <p className="text-zinc-500 mb-6">2024-25 Sezonu</p>
        <button onClick={initializeTournament} className="bg-amber-600 hover:bg-amber-500 text-zinc-900 font-bold px-8 py-3 rounded-xl">
          Turnuvaya Başla
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-zinc-100">Turnuva Ağacı</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {allPlayoffsPlayed && !drawComplete && (
            <button onClick={performR16Draw} className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <Shuffle size={12} /> Kura Çek
            </button>
          )}
          {allR16Played && leftQF.length === 0 && (
            <button onClick={initializeQF} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg">Çeyrek Final →</button>
          )}
          {allQFPlayed && !leftSF && (
            <button onClick={initializeSF} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg">Yarı Final →</button>
          )}
          {allSFPlayed && !finalMatch && (
            <button onClick={initializeFinal} className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-medium rounded-lg">Final →</button>
          )}
          <button onClick={resetTournament} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs rounded-lg flex items-center gap-1">
            <RotateCcw size={12} /> Sıfırla
          </button>
        </div>
      </div>

      {/* Bracket - Now fits on screen */}
      <div className="overflow-x-auto">
        <div className="flex justify-center items-start gap-4 min-w-[1100px] py-4">
          
          {/* LEFT SIDE */}
          <div className="flex items-start gap-3">
            {/* Playoffs */}
            <div className="space-y-3">
              <div className="text-[10px] text-purple-400 font-bold uppercase">Playoff</div>
              {leftPlayoffs.map(m => <PlayoffCard key={m.id} match={m} onSimulate={simulatePlayoff} onSelect={selectPlayoffWinner} side="left" />)}
              {leftPlayoffs.some(m => !m.played) && (
                <button onClick={simulateAllPlayoffs} className="text-[10px] text-purple-400/60 hover:text-purple-400 flex items-center gap-1">
                  <FastForward size={10} /> Tümü
                </button>
              )}
            </div>
            
            {/* R16 */}
            <div className="space-y-3 pt-2">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Son 16</div>
              {!drawComplete ? r16Potentials.map((p, i) => <PotentialCard key={i} pair={p} />) : leftR16.map(m => <MatchCard key={m.id} match={m} onSimulate={simulateR16} onSelect={selectR16Winner} side="left" />)}
              {drawComplete && leftR16.some(m => !m.played) && (
                <button onClick={simulateAllR16} className="text-[10px] text-zinc-500/60 flex items-center gap-1"><FastForward size={10} /> Tümü</button>
              )}
            </div>
            
            {/* QF */}
            <div className="space-y-6 pt-6">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Çeyrek</div>
              {leftQF.length > 0 ? leftQF.map(m => <MatchCard key={m.id} match={m} onSimulate={simulateQF} onSelect={selectQFWinner} side="left" />) : <><Slot /><Slot /></>}
            </div>
            
            {/* SF */}
            <div className="space-y-6 pt-14">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Yarı</div>
              {leftSF ? <MatchCard match={leftSF} onSimulate={() => simulateSF('left')} onSelect={(id, wid) => selectSFWinner(wid, 'left')} side="left" /> : <Slot />}
            </div>
          </div>

          {/* CENTER */}
          <div className="pt-24">
            <FinalCard match={finalMatch} onSimulate={simulateFinal} onSelect={selectFinalWinner} />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-start gap-3 flex-row-reverse">
            {/* Playoffs */}
            <div className="space-y-3">
              <div className="text-[10px] text-cyan-400 font-bold uppercase text-right">Playoff</div>
              {rightPlayoffs.map(m => <PlayoffCard key={m.id} match={m} onSimulate={simulatePlayoff} onSelect={selectPlayoffWinner} side="right" />)}
              {rightPlayoffs.some(m => !m.played) && (
                <button onClick={simulateAllPlayoffs} className="text-[10px] text-cyan-400/60 hover:text-cyan-400 flex items-center gap-1 justify-end">
                  Tümü <FastForward size={10} />
                </button>
              )}
            </div>
            
            {/* R16 */}
            <div className="space-y-3 pt-2">
              <div className="text-[10px] text-zinc-500 font-bold uppercase text-right">Son 16</div>
              {!drawComplete ? r16Potentials.map((p, i) => <PotentialCard key={`r${i}`} pair={p} />) : rightR16.map(m => <MatchCard key={m.id} match={m} onSimulate={simulateR16} onSelect={selectR16Winner} side="right" />)}
              {drawComplete && rightR16.some(m => !m.played) && (
                <button onClick={simulateAllR16} className="text-[10px] text-zinc-500/60 flex items-center gap-1 justify-end">Tümü <FastForward size={10} /></button>
              )}
            </div>
            
            {/* QF */}
            <div className="space-y-6 pt-6">
              <div className="text-[10px] text-zinc-500 font-bold uppercase text-right">Çeyrek</div>
              {rightQF.length > 0 ? rightQF.map(m => <MatchCard key={m.id} match={m} onSimulate={simulateQF} onSelect={selectQFWinner} side="right" />) : <><Slot /><Slot /></>}
            </div>
            
            {/* SF */}
            <div className="space-y-6 pt-14">
              <div className="text-[10px] text-zinc-500 font-bold uppercase text-right">Yarı</div>
              {rightSF ? <MatchCard match={rightSF} onSimulate={() => simulateSF('right')} onSelect={(id, wid) => selectSFWinner(wid, 'right')} side="right" /> : <Slot />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CLKnockoutStage;
