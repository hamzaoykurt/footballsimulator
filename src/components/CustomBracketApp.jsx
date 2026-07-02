// src/components/CustomBracketApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ChevronLeft, Search, Check, Play, Zap, RotateCcw, 
  Sparkles, Plus, Trash2, Home, Globe, Star, Shield, ArrowRight
} from 'lucide-react';
import { useCustomBracket } from '../context/CustomBracketContext';
import { NATIONAL_TEAMS } from '../data/allNationalTeams';
import { CLUBS } from '../data/allClubs';
import AnimatedBackground from './AnimatedBackground';

const CustomBracketApp = ({ onBack, view }) => {
  const {
    phase,
    mode,
    setMode,
    bracketSize,
    setBracketSize,
    selectedTeams,
    setSelectedTeams,
    rounds,
    champion,
    initializeBracket,
    setManualWinner,
    resetMatch,
    simulateActiveRound,
    resetTournament
  } = useCustomBracket();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const scrollRef = useRef(null);

  // Determine which data to use
  const allAvailableTeams = mode === 'national' ? NATIONAL_TEAMS : CLUBS;

  // Tabs based on mode
  const tabs = mode === 'national' 
    ? ['All', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC']
    : ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Süper Lig', 'Diğer'];

  // Filtered teams list
  const filteredTeams = allAvailableTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          team.shortName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    if (mode === 'national') return matchesSearch && team.region === activeTab;
    return matchesSearch && team.league === activeTab;
  });

  const handleToggleTeam = (team) => {
    if (selectedTeams.some(t => t.id === team.id)) {
      setSelectedTeams(selectedTeams.filter(t => t.id !== team.id));
    } else {
      if (selectedTeams.length < bracketSize) {
        setSelectedTeams([...selectedTeams, team]);
      }
    }
  };

  const handleAutoFill = () => {
    const remaining = bracketSize - selectedTeams.length;
    if (remaining <= 0) return;

    const unselected = allAvailableTeams.filter(t => !selectedTeams.some(s => s.id === t.id));
    const shuffled = [...unselected].sort(() => Math.random() - 0.5);
    const fill = shuffled.slice(0, remaining);

    setSelectedTeams([...selectedTeams, ...fill]);
  };

  const handleClearSelected = () => {
    setSelectedTeams([]);
  };

  // Scroll to active round
  useEffect(() => {
    if (phase === 'BRACKET' && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  }, [phase, rounds.length]);

  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBackground variant={mode === 'national' ? 'worldcup' : 'default'} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-6 pb-40">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-950/30 backdrop-blur-md rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-2xl shadow-purple-900/20">
                <Sparkles className="text-purple-400 drop-shadow-lg" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">
                  FİKSTÜR <span className="text-purple-400">OLUŞTURUCU</span>
                </h1>
                <p className="text-sm text-zinc-400 font-medium tracking-wide border-l-2 border-purple-600 pl-2 ml-1">
                  Kendi Özel Braketini Tasarla
                </p>
              </div>
            </div>
          </header>

          {/* SETUP STEP 1 & 2 */}
          {phase === 'SETUP' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              
              {/* Size & Mode Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mode Selector */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
                  <h2 className="text-lg font-bold text-zinc-300">1. Takım Türü</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setMode('national'); setSelectedTeams([]); }}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300
                        ${mode === 'national' 
                          ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/20' 
                          : 'bg-zinc-950/40 border-white/5 hover:border-zinc-800'}`}
                    >
                      <Globe size={28} className={mode === 'national' ? 'text-purple-400' : 'text-zinc-500'} />
                      <span className="font-bold text-sm">Milli Takımlar</span>
                    </button>
                    <button
                      onClick={() => { setMode('clubs'); setSelectedTeams([]); }}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300
                        ${mode === 'clubs' 
                          ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/20' 
                          : 'bg-zinc-950/40 border-white/5 hover:border-zinc-800'}`}
                    >
                      <Shield size={28} className={mode === 'clubs' ? 'text-purple-400' : 'text-zinc-500'} />
                      <span className="font-bold text-sm">Kulüpler</span>
                    </button>
                  </div>
                </div>

                {/* Bracket Size Selector */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
                  <h2 className="text-lg font-bold text-zinc-300">2. Braket Boyutu</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 8, 16, 32].map(size => (
                      <button
                        key={size}
                        onClick={() => { setBracketSize(size); setSelectedTeams([]); }}
                        className={`py-4 rounded-2xl border font-black text-lg transition-all duration-300
                          ${bracketSize === size 
                            ? 'bg-purple-950/40 border-purple-500/50 text-purple-400 shadow-lg' 
                            : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:border-zinc-800'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Picker Section */}
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">3. Takımları Seçin</h2>
                    <p className="text-xs text-zinc-500">Brakete eklemek için takımlara tıklayın.</p>
                  </div>
                  
                  {/* Indicators and helper buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase border
                      ${selectedTeams.length === bracketSize 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                      Seçilen: {selectedTeams.length} / {bracketSize}
                    </span>
                    <button
                      onClick={handleAutoFill}
                      disabled={selectedTeams.length === bracketSize}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-zinc-700/50 disabled:opacity-50"
                    >
                      Otomatik Doldur
                    </button>
                    <button
                      onClick={handleClearSelected}
                      disabled={selectedTeams.length === 0}
                      className="px-3 py-2 bg-zinc-800 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 rounded-xl text-xs font-bold transition-all border border-zinc-700/50 disabled:opacity-50"
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                {/* Filter and search tools */}
                <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type="text"
                      placeholder="Takım ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                  
                  {/* Category Tabs */}
                  <div className="flex gap-1.5 overflow-x-auto max-w-full pb-2 md:pb-0 custom-scrollbar whitespace-nowrap">
                    {tabs.map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border
                          ${activeTab === tab 
                            ? 'bg-purple-950/20 border-purple-500/30 text-purple-400' 
                            : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-zinc-800'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Badges */}
                {selectedTeams.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-zinc-950/60 rounded-2xl border border-white/5">
                    {selectedTeams.map(team => (
                      <button
                        key={team.id}
                        onClick={() => handleToggleTeam(team)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-950/30 hover:bg-red-950/40 hover:text-red-300 border border-purple-500/20 rounded-xl text-xs font-semibold text-purple-200 transition-all group"
                      >
                        {mode === 'national' ? (
                          <img src={`https://flagcdn.com/w40/${team.code}.png`} className="w-4 h-3 object-contain shrink-0" alt="" />
                        ) : (
                          <img src={team.logo} className="w-4 h-4 object-contain shrink-0" alt="" />
                        )}
                        <span>{team.name}</span>
                        <Trash2 size={10} className="text-purple-400 group-hover:text-red-400 ml-1.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Grid of Teams */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredTeams.map(team => {
                    const isSelected = selectedTeams.some(t => t.id === team.id);
                    return (
                      <button
                        key={team.id}
                        onClick={() => handleToggleTeam(team)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 group
                          ${isSelected 
                            ? 'bg-purple-950/20 border-purple-500/50 text-white' 
                            : 'bg-zinc-950/30 border-white/5 hover:border-zinc-800 hover:bg-zinc-900/50'}`}
                      >
                        {/* Logo or Flag */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 flex items-center justify-center p-1.5 shrink-0">
                          {mode === 'national' ? (
                            <img src={`https://flagcdn.com/w40/${team.code}.png`} className="w-full h-full object-contain" alt="" />
                          ) : (
                            <img src={team.logo} className="w-full h-full object-contain" alt="" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{team.name}</p>
                          <span className="text-[10px] text-zinc-500 font-bold">Güç: {team.strength}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredTeams.length === 0 && (
                    <div className="col-span-full py-8 text-center text-zinc-500 text-sm">Takım bulunamadı.</div>
                  )}
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    disabled={selectedTeams.length !== bracketSize}
                    onClick={() => initializeBracket(selectedTeams)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black tracking-wide transition-all shadow-xl
                      ${selectedTeams.length === bracketSize 
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:brightness-110 text-white shadow-purple-900/40 hover:scale-[1.02] active:scale-95' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                  >
                    <span>FİKSTÜRÜ OLUŞTUR</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BRACKET TOURNAMENT VIEW */}
          {phase === 'BRACKET' && rounds.length > 0 && (
            <div className="space-y-16">
              
              {/* Bracket Tree Layout */}
              <div className="space-y-12">
                {rounds.map((round, rIndex) => {
                  const isFinal = round.length === 1;
                  
                  // Group pairs for structural rendering (only if not final)
                  const pairs = [];
                  if (!isFinal) {
                    for (let i = 0; i < round.length; i += 2) {
                      pairs.push([round[i], round[i + 1]]);
                    }
                  }

                  return (
                    <motion.div
                      key={rIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="space-y-6"
                    >
                      {/* Round Header */}
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                        <div className="relative">
                          <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
                          <div className="relative px-6 py-2.5 bg-gradient-to-b from-zinc-850 to-zinc-900 rounded-full border border-purple-500/20 shadow-2xl">
                            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 uppercase tracking-widest">
                              {round.length === 16 ? 'Son 32' :
                               round.length === 8 ? 'Son 16' :
                               round.length === 4 ? 'Çeyrek Final' :
                               round.length === 2 ? 'Yarı Final' : 'Büyük Final'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                      </div>

                      {isFinal ? (
                        <div className="flex justify-center">
                          <CustomMatchCard 
                            match={round[0]} 
                            mode={mode}
                            onSelectWinner={(matchId, winnerId) => setManualWinner(matchId, winnerId)}
                            onResetMatch={resetMatch}
                            isFinal={true}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-8 max-w-[90rem] mx-auto">
                          {pairs.map((pair, pIdx) => (
                            <div key={pIdx} style={{ backfaceVisibility: 'hidden' }} className="bg-gradient-to-b from-[#1b1c24] to-[#0d0d0d] rounded-3xl p-5 ring-1 ring-inset ring-zinc-800/60 flex flex-col gap-4 relative group hover:ring-purple-500/40 transition-all duration-300 w-full md:w-[22rem] shadow-xl shadow-black/50 transform-gpu">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                <div className="px-4 py-1 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full border border-white/5 shadow-lg">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Eşleşme {pIdx + 1}</span>
                                </div>
                              </div>
                              
                              {/* Match 1 */}
                              {pair[0] && (
                                <div className="relative">
                                  <CustomMatchCard 
                                    match={pair[0]} 
                                    mode={mode}
                                    onSelectWinner={(matchId, winnerId) => setManualWinner(matchId, winnerId)}
                                    onResetMatch={resetMatch}
                                  />
                                  <div className="absolute -bottom-4 left-1/2 w-px h-4 bg-white/10" />
                                </div>
                              )}

                              {/* VS badge */}
                              <div className="flex items-center justify-center py-2 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] text-zinc-700 font-bold shadow-lg">
                                  VS
                                </div>
                              </div>

                              {/* Match 2 */}
                              {pair[1] && (
                                <div className="relative">
                                  <div className="absolute -top-4 left-1/2 w-px h-4 bg-white/10" />
                                  <CustomMatchCard 
                                    match={pair[1]} 
                                    mode={mode}
                                    onSelectWinner={(matchId, winnerId) => setManualWinner(matchId, winnerId)}
                                    onResetMatch={resetMatch}
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

              {/* Champion Reveal Screen */}
              {champion && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="relative p-12 mt-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#1b102f] via-[#0d071a] to-black border border-purple-500/30 text-center group shadow-[0_0_80px_rgba(168,85,247,0.15)]"
                >
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-purple-800/10 to-transparent" />
                  
                  <div className="relative z-10 flex flex-col items-center py-8">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0, y: -30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="relative mb-10"
                    >
                      <motion.div 
                        animate={{ 
                          scale: [1.3, 1.6, 1.3],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-radial from-purple-400/40 via-purple-500/20 to-transparent blur-3xl rounded-full"
                      />
                      
                      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-5 shadow-2xl">
                        {mode === 'national' ? (
                          <img src={`https://flagcdn.com/w160/${champion.code}.png`} alt="" className="h-24 md:h-32 object-contain rounded-lg shadow-lg" />
                        ) : (
                          <img src={champion.logo} alt="" className="h-24 md:h-32 object-contain shrink-0" />
                        )}
                      </div>
                    </motion.div>
                    
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-purple-400 font-extrabold tracking-[0.4em] uppercase mb-4 block text-xs md:text-sm"
                    >
                      ŞAMPİYON
                    </motion.span>
                    
                    <motion.span 
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-4xl md:text-6xl font-black text-white tracking-tight"
                    >
                      {champion.name}
                    </motion.span>
                  </div>
                </motion.div>
              )}

              {/* Anchor for scroll */}
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </main>

      {/* FLOATING ISLAND BAR */}
      <div className="fixed bottom-8 left-0 w-full flex justify-center z-[100] pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto flex items-center gap-2 p-2 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-w-[95vw] overflow-x-auto custom-scrollbar"
        >
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white shrink-0"
            title="Ana Menü"
          >
            <Home size={22} />
          </button>

          {phase !== 'SETUP' && (
            <>
              <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />

              <button
                onClick={resetTournament}
                className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 rounded-xl transition-all border border-zinc-700/30 font-bold text-sm shrink-0"
                title="Sıfırla"
              >
                <RotateCcw size={18} />
                <span className="hidden sm:inline">Yeniden Başlat</span>
              </button>

              <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />

              {/* Simulation Action */}
              {!champion ? (
                <button
                  onClick={simulateActiveRound}
                  className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-purple-700 to-indigo-600 hover:brightness-110 text-white rounded-xl font-bold text-sm shrink-0 shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  <span>Turu Oyna</span>
                </button>
              ) : (
                <div className="px-4 py-2 bg-purple-950/30 border border-purple-500/20 text-purple-400 text-xs font-black uppercase rounded-xl tracking-wider">
                  Tamamlandı 🏆
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Custom Match Card inside Custom Bracket
const CustomMatchCard = ({ match, mode, onSelectWinner, onResetMatch, isFinal = false }) => {
  const teamA = match.teamA;
  const teamB = match.teamB;
  const hasTeams = teamA && teamB;
  const isPlayed = match.played;
  const winnerA = match.winner?.id === teamA?.id;
  const winnerB = match.winner?.id === teamB?.id;

  return (
    <div className={`relative bg-gradient-to-b from-zinc-900 to-[#0c0c0e] ring-2 ring-inset ${isFinal ? 'ring-purple-500/60 shadow-[0_0_60px_rgba(168,85,247,0.25)]' : 'ring-zinc-800/80 hover:ring-purple-500/40'} rounded-2xl overflow-hidden transition-all duration-300 w-full ${isFinal ? 'min-w-[28rem]' : 'min-w-[18rem]'}`}>
      {isFinal && <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />}
      {isFinal && <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />}
      
      <div className={`${isFinal ? 'px-10 py-8 space-y-4' : 'p-3 space-y-2'}`}>
        
        {/* Team A button */}
        <button
          disabled={!hasTeams}
          onClick={() => hasTeams && onSelectWinner(match.id, teamA.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden text-left border border-transparent
            ${winnerA ? 'bg-purple-500/15 border-purple-500/30' : 'hover:bg-white/5'} 
            ${winnerB ? 'opacity-40' : ''}`}
        >
          {winnerA && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
          <div className="relative w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center p-1 shrink-0 shadow">
            {mode === 'national' ? (
              <img src={`https://flagcdn.com/w40/${teamA?.code}.png`} className="w-full h-full object-contain" alt="" />
            ) : (
              <img src={teamA?.logo} className="w-full h-full object-contain" alt="" />
            )}
          </div>
          <span className={`flex-1 text-xs truncate font-bold ${winnerA ? 'text-purple-400 font-extrabold' : 'text-zinc-400'}`}>
            {teamA?.name || 'TBD'}
          </span>
          {isPlayed && match.scoreA !== null && (
            <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${winnerA ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
              {match.scoreA}
            </span>
          )}
        </button>

        {/* VS / Reset */}
        {!hasTeams ? (
          <div className="text-center text-[10px] text-zinc-600 py-0.5 uppercase tracking-wide">Bekleniyor</div>
        ) : isPlayed ? (
          <div className="flex justify-center py-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); onResetMatch(match.id); }}
              className="px-3 py-1 bg-zinc-850 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 rounded-lg text-[9px] font-bold uppercase transition-all border border-zinc-700/40"
            >
              ↺ Sıfırla
            </button>
          </div>
        ) : null}

        {/* Team B button */}
        <button
          disabled={!hasTeams}
          onClick={() => hasTeams && onSelectWinner(match.id, teamB.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden text-left border border-transparent
            ${winnerB ? 'bg-purple-500/15 border-purple-500/30' : 'hover:bg-white/5'} 
            ${winnerA ? 'opacity-40' : ''}`}
        >
          {winnerB && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
          <div className="relative w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center p-1 shrink-0 shadow">
            {mode === 'national' ? (
              <img src={`https://flagcdn.com/w40/${teamB?.code}.png`} className="w-full h-full object-contain" alt="" />
            ) : (
              <img src={teamB?.logo} className="w-full h-full object-contain" alt="" />
            )}
          </div>
          <span className={`flex-1 text-xs truncate font-bold ${winnerB ? 'text-purple-400 font-extrabold' : 'text-zinc-400'}`}>
            {teamB?.name || 'TBD'}
          </span>
          {isPlayed && match.scoreB !== null && (
            <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${winnerB ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
              {match.scoreB}
            </span>
          )}
        </button>

      </div>
    </div>
  );
};

export default CustomBracketApp;
