import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTournament } from '../context/TournamentContext';
import { Trophy, FastForward, Users, Crown } from 'lucide-react';

/**
 * KNOCKOUT STAGE - World Cup 2026
 * 
 * Clean, defensive implementation with proper null checks
 */

// --- SUB-COMPONENTS ---

const MatchCard = React.memo(({ match, roundIndex, onSimulate, onAdvance }) => {
  if (!match || !match.teamA || !match.teamB) {
    return <div className="w-64 h-20 bg-zinc-900 rounded-lg animate-pulse" />;
  }

  const isWinnerA = match.winner?.id === match.teamA.id;
  const isWinnerB = match.winner?.id === match.teamB.id;

  return (
    <div className={`
      relative flex flex-col rounded-lg overflow-hidden border w-64 shrink-0
      ${match.winner 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
      }
    `}>
      {/* Simulate Button Overlay */}
      {!match.played && (
        <button 
          onClick={() => onSimulate(roundIndex, match.id)}
          className="absolute right-2 top-2 z-10 p-1.5 bg-zinc-800 hover:bg-emerald-500 hover:text-white text-zinc-400 rounded-md transition-all shadow-lg"
          title="Hızlı Simüle Et"
        >
          <FastForward size={14} />
        </button>
      )}

      {/* Team A */}
      <div 
        onClick={() => !match.played && onAdvance(roundIndex, match.id, match.teamA.id)}
        className={`
          flex justify-between items-center px-3 py-2.5 border-b border-zinc-800 cursor-pointer transition-colors
          ${isWinnerA ? 'bg-emerald-500/10' : 'hover:bg-zinc-800/50'}
          ${isWinnerB ? 'opacity-40' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <img 
            src={match.teamA.logo || `https://flagcdn.com/w40/${match.teamA.code || 'xx'}.png`} 
            className="w-5 h-5 object-contain rounded-sm" 
            alt={match.teamA.name}
            onError={(e) => e.target.style.display = 'none'}
          />
          <span className={`text-sm font-medium ${isWinnerA ? 'text-emerald-400' : 'text-zinc-200'}`}>
            {match.teamA.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isWinnerA && <Crown size={12} className="text-amber-400" />}
          <span className={`font-mono font-bold ${isWinnerA ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {match.scoreA ?? '-'}
          </span>
        </div>
      </div>

      {/* Team B */}
      <div 
        onClick={() => !match.played && onAdvance(roundIndex, match.id, match.teamB.id)}
        className={`
          flex justify-between items-center px-3 py-2.5 cursor-pointer transition-colors
          ${isWinnerB ? 'bg-emerald-500/10' : 'hover:bg-zinc-800/50'}
          ${isWinnerA ? 'opacity-40' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <img 
            src={match.teamB.logo || `https://flagcdn.com/w40/${match.teamB.code || 'xx'}.png`} 
            className="w-5 h-5 object-contain rounded-sm" 
            alt={match.teamB.name}
            onError={(e) => e.target.style.display = 'none'}
          />
          <span className={`text-sm font-medium ${isWinnerB ? 'text-emerald-400' : 'text-zinc-200'}`}>
            {match.teamB.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isWinnerB && <Crown size={12} className="text-amber-400" />}
          <span className={`font-mono font-bold ${isWinnerB ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {match.scoreB ?? '-'}
          </span>
        </div>
      </div>
    </div>
  );
});

// --- MAIN COMPONENT ---

const KnockoutStage = () => {
  const { knockoutMatches, simulateKnockoutMatch, manualAdvanceTeam, champion, resetTournament } = useTournament();

  const roundNames = ['Son 32', 'Son 16', 'Çeyrek Final', 'Yarı Final', 'Final'];

  // DEBUG: Log state
  console.log('[KnockoutStage] knockoutMatches:', knockoutMatches?.length, 'rounds');

  // Empty state
  if (!knockoutMatches || knockoutMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-bold text-zinc-400 mb-2">Eleme Turu Hazır Değil</h3>
        <p className="text-sm text-zinc-600">Önce grup aşamasını tamamlayın.</p>
      </div>
    );
  }

  return (
    <div className="pb-10 relative">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950/0 to-zinc-950/0" />

      {/* CHAMPION BANNER */}
      {champion && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex flex-col items-center justify-center p-8 bg-zinc-900 border border-amber-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
            <Trophy className="text-amber-400 w-16 h-16 mb-4 drop-shadow-lg" />
            <div className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2">2026 Dünya Şampiyonu</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">{champion.name}</h1>
            <img 
              src={champion.logo || `https://flagcdn.com/w160/${champion.code}.png`} 
              className="h-24 shadow-2xl rounded-lg ring-1 ring-white/10" 
              alt={champion.name}
            />
          </div>
          <button 
            onClick={() => resetTournament('SETUP')}
            className="mt-6 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all shadow-lg text-sm flex items-center gap-2 mx-auto border border-zinc-700"
          >
            Turnuvayı Sıfırla
          </button>
        </motion.div>
      )}

      {/* BRACKET SCROLL CONTAINER */}
      <div className="overflow-x-auto pb-8">
        <div className="flex gap-12 min-w-max px-4">
          
          {knockoutMatches.map((roundMatches, roundIndex) => (
            <div key={roundIndex} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                  {roundNames[roundIndex] || `Tur ${roundIndex + 1}`}
                </h3>
                <span className="text-xs text-zinc-600">({roundMatches?.length || 0} maç)</span>
              </div>
              
              <div className={`flex flex-col justify-around h-full gap-4 ${roundIndex > 0 ? 'mt-4' : ''}`}>
                {roundMatches?.map((match) => (
                  <MatchCard 
                    key={match.id}
                    match={match}
                    roundIndex={roundIndex}
                    onSimulate={simulateKnockoutMatch}
                    onAdvance={manualAdvanceTeam}
                  />
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default KnockoutStage;
