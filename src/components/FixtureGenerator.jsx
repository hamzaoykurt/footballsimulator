import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import { Trophy, Zap, RotateCcw, FastForward, ChevronLeft, Sparkles, Play, Shield, Users, ListFilter, Home, ArrowRight } from 'lucide-react';

const adjustColorBrightness = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
};

const GAME_MODES = {
  svm: {
    title: 'Güçlü vs Orta',
    subtitle: 'Bir güçlü takım ile bir orta ölçekli takımı eşleştir',
    numMatches: 12,
    strongTeams: ['Real Madrid', 'Man City', 'Arsenal', 'Bayern Münih', 'PSG', 'Liverpool', 'Barcelona', 'Inter Milan', 'Juventus', 'Chelsea', 'Man United', 'Atlético Madrid'],
    mediumTeams: ['Dortmund', 'Bayer 04', 'Tottenham', 'Napoli', 'Aston Villa', 'A. Bilbao', 'Newcastle', 'Benfica', 'AC Milan', 'Fenerbahçe', 'Galatasaray', 'Sporting CP'],
    hasMediumWheel: true,
  },
  svs: {
    title: 'Güçlü vs Güçlü',
    subtitle: 'Sadece en iyilerin kapıştığı devler ligi',
    numMatches: 6,
    strongTeams: ['Real Madrid', 'Man City', 'Arsenal', 'Bayern Münih', 'PSG', 'Liverpool', 'Barcelona', 'Inter Milan', 'Juventus', 'Chelsea', 'Man United', 'Atlético Madrid'],
    mediumTeams: null,
    hasMediumWheel: false,
  },
};

// VIVID COLORS
const STRONG_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#84cc16', '#d946ef', '#f43f5e'];
const MEDIUM_COLORS = ['#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#fb7185', '#f472b6'];

const TEAM_LOGOS = {
  'Real Madrid': 'https://tmssl.akamaized.net//images/wappen/head/418.png',
  'Man City': 'https://tmssl.akamaized.net//images/wappen/head/281.png',
  'Arsenal': 'https://tmssl.akamaized.net//images/wappen/head/11.png',
  'Bayern Münih': 'https://tmssl.akamaized.net//images/wappen/head/27.png',
  'PSG': 'https://tmssl.akamaized.net//images/wappen/head/583.png',
  'Liverpool': 'https://tmssl.akamaized.net//images/wappen/head/31.png',
  'Barcelona': 'https://tmssl.akamaized.net//images/wappen/head/131.png',
  'Inter Milan': 'https://tmssl.akamaized.net//images/wappen/head/46.png',
  'Juventus': 'https://tmssl.akamaized.net//images/wappen/head/506.png',
  'Chelsea': 'https://tmssl.akamaized.net//images/wappen/head/631.png',
  'Man United': 'https://tmssl.akamaized.net//images/wappen/head/985.png',
  'Atlético Madrid': 'https://tmssl.akamaized.net//images/wappen/head/13.png',
  'Dortmund': 'https://tmssl.akamaized.net//images/wappen/head/16.png',
  'Bayer 04': 'https://tmssl.akamaized.net//images/wappen/head/15.png',
  'Tottenham': 'https://tmssl.akamaized.net//images/wappen/head/148.png',
  'Napoli': 'https://tmssl.akamaized.net//images/wappen/head/6195.png',
  'Aston Villa': 'https://tmssl.akamaized.net//images/wappen/head/405.png',
  'A. Bilbao': 'https://tmssl.akamaized.net//images/wappen/head/621.png',
  'Newcastle': 'https://tmssl.akamaized.net//images/wappen/head/762.png',
  'Benfica': 'https://tmssl.akamaized.net//images/wappen/head/294.png',
  'AC Milan': 'https://tmssl.akamaized.net//images/wappen/head/5.png',
  'Fenerbahçe': 'https://tmssl.akamaized.net//images/wappen/head/36.png',
  'Galatasaray': 'https://tmssl.akamaized.net//images/wappen/head/141.png',
  'Sporting CP': 'https://tmssl.akamaized.net//images/wappen/head/336.png',
};

const SpinWheel = ({ items, onSpin, disabled, title, icon, chosenTeams, glowColor = 'rose' }) => {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const offscreenCanvasRef = useRef(null);

  const colors = glowColor === 'cyan' ? MEDIUM_COLORS : STRONG_COLORS;

  const glowClasses = {
    amber: 'shadow-[0_0_80px_rgba(245,158,11,0.3)] border-amber-500/50',
    cyan: 'shadow-[0_0_80px_rgba(6,182,212,0.3)] border-cyan-500/50',
    rose: 'shadow-[0_0_80px_rgba(244,63,94,0.3)] border-rose-500/50',
    indigo: 'shadow-[0_0_80px_rgba(99,102,241,0.3)] border-indigo-500/50',
  }[glowColor] || 'shadow-[0_0_50px_rgba(244,63,94,0.3)] border-rose-500/50';

  const buttonClasses = {
    amber: 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/40',
    cyan: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/40',
    rose: 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/40',
    indigo: 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/40',
  }[glowColor] || 'bg-rose-600';

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    canvas.width = 1000;
    canvas.height = 1000;

    const ctx = canvas.getContext('2d');

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = 1000;
      offscreenCanvasRef.current.height = 1000;
    }

    const offCtx = offscreenCanvasRef.current.getContext('2d');
    offCtx.clearRect(0, 0, 1000, 1000);

    if (items.length === 0) {
      offCtx.fillStyle = 'rgba(24, 24, 27, 0.9)';
      offCtx.beginPath();
      offCtx.arc(500, 500, 495, 0, 2 * Math.PI);
      offCtx.fill();
      offCtx.fillStyle = '#71717a';
      offCtx.font = '700 48px Outfit, sans-serif';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText('Tükendi', 500, 500);
    } else {
      const anglePerSegment = (2 * Math.PI) / items.length;
      const displayColors = items.length === 0 ? ['#3f3f46'] : colors;
      
      for (let i = 0; i < items.length; i++) {
        const angle = i * anglePerSegment;
        offCtx.save();
        offCtx.translate(500, 500);
        offCtx.beginPath();
        
        // VIVID GRADIENT
        const gradient = offCtx.createRadialGradient(0, 0, 100, 0, 0, 500);
        gradient.addColorStop(0, displayColors[i % displayColors.length]);
        gradient.addColorStop(0.8, displayColors[i % displayColors.length]); // Keep it vivid longer
        gradient.addColorStop(1, adjustColorBrightness(displayColors[i % displayColors.length], -30));
        
        offCtx.fillStyle = gradient;
        offCtx.moveTo(0, 0);
        offCtx.arc(0, 0, 495, angle, angle + anglePerSegment);
        offCtx.closePath();
        offCtx.fill();
        
        offCtx.strokeStyle = 'rgba(255,255,255,0.4)';
        offCtx.lineWidth = 6;
        offCtx.stroke();
        
        offCtx.rotate(angle + anglePerSegment / 2);
        offCtx.textAlign = 'right';
        offCtx.textBaseline = 'middle';
        
        const baseSize = items.length > 14 ? 36 : items.length > 10 ? 48 : 64;
        offCtx.font = `900 ${baseSize}px Outfit, sans-serif`;
        
        offCtx.shadowColor = 'rgba(0,0,0,0.5)';
        offCtx.shadowBlur = 4;
        offCtx.shadowOffsetX = 2;
        offCtx.shadowOffsetY = 2;
        
        offCtx.fillStyle = '#ffffff';
        offCtx.fillText(items[i], 450, 0);
        
        offCtx.restore();
      }
    }
    
    offCtx.save();
    offCtx.translate(500, 500);
    offCtx.beginPath();
    offCtx.arc(0, 0, 40, 0, 2 * Math.PI);
    offCtx.fillStyle = '#18181b';
    offCtx.fill();
    offCtx.strokeStyle = 'rgba(255,255,255,0.5)';
    offCtx.lineWidth = 6;
    offCtx.stroke();
    offCtx.restore();

    ctx.clearRect(0, 0, 1000, 1000);
    ctx.save();
    ctx.translate(500, 500);
    ctx.rotate(currentAngle);
    ctx.drawImage(offscreenCanvasRef.current, -500, -500);
    ctx.restore();
  }, [items, colors, currentAngle]);

  const spin = useCallback(() => {
    if (isSpinning || items.length === 0 || disabled) return;
    setIsSpinning(true);
    const spinTimeTotal = Math.random() * 2000 + 3000;
    const totalRotations = (Math.random() * 5 + 8) * (2 * Math.PI);
    const startAngle = currentAngle;
    const endAngle = startAngle + totalRotations;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      if (elapsed >= spinTimeTotal) {
        setCurrentAngle(endAngle);
        const numSegments = items.length;
        const anglePerSegment = 360 / numSegments;
        const finalAngle = (endAngle * 180 / Math.PI) % 360;
        const winningAngle = (270 - finalAngle + 360) % 360;
        const winnerIndex = Math.floor(winningAngle / anglePerSegment);
        const winner = items[winnerIndex];
        setIsSpinning(false);
        onSpin(winner);
        return;
      }
      const progress = elapsed / spinTimeTotal;
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const newAngle = startAngle + (endAngle - startAngle) * easeOut;
      setCurrentAngle(newAngle);
      requestAnimationFrame(animate);
    };
    const reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [isSpinning, items, disabled, currentAngle, onSpin]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
        <div className={`p-1.5 rounded-lg bg-${glowColor}-500/20`}>
          {icon}
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">{title}</h2>
      </div>

      <div className="relative group">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 filter drop-shadow-lg">
          <div className="w-10 h-12 bg-white clip-path-polygon absolute top-0 left-1/2 -translate-x-1/2" 
               style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          <div className={`w-8 h-10 bg-${glowColor === 'cyan' ? 'cyan-400' : 'rose-500'} clip-path-polygon absolute top-1 left-1/2 -translate-x-1/2`} 
               style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
        </div>
        
        <div className={`
          relative w-80 h-80 md:w-[30rem] md:h-[30rem] lg:w-[32rem] lg:h-[32rem] rounded-full 
          bg-zinc-900 p-3 border-4 transition-all duration-500
          ${glowClasses}
        `}>
          <div className="absolute inset-0 rounded-full bg-black/20 z-10 pointer-events-none shadow-inner" />
          <canvas ref={canvasRef} className="w-full h-full rounded-full relative z-0" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-2xl flex items-center justify-center z-20">
            <div className={`w-10 h-10 rounded-full bg-${glowColor}-500/50 animate-pulse`} />
          </div>
        </div>
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isSpinning || items.length === 0 || disabled} 
        onClick={spin}
        className={`
          px-10 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 uppercase tracking-wider
          ${isSpinning || items.length === 0 || disabled 
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' 
            : buttonClasses
          }
        `}
      >
        <Play size={20} fill="currentColor" />
        {isSpinning ? '...' : 'ÇEVİR'}
      </motion.button>
      
      <div className="w-full max-w-sm bg-black/40 rounded-2xl p-4 border border-white/10 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider font-bold text-zinc-400 border-b border-white/5 pb-2">
          <span>Seçilenler</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-white">{chosenTeams.length}</span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {chosenTeams.map((team, i) => (
              <motion.span 
                key={i} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 bg-zinc-800/80 rounded-lg text-xs font-bold text-zinc-200 border border-white/5 flex items-center gap-1.5 shadow-sm hover:bg-zinc-700 transition-colors"
              >
                {TEAM_LOGOS[team] && <img src={TEAM_LOGOS[team]} alt="" className="w-4 h-4 object-contain" />}
                {team}
              </motion.span>
            ))}
            {chosenTeams.length === 0 && (
              <span className="text-zinc-500 text-xs italic w-full text-center py-4">Henüz takımlar seçilmedi</span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ id, index, team1, team2, isActive, hasMediumWheel }) => (
  <motion.div 
    id={id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className={`
      relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 group
      ${isActive 
        ? 'bg-gradient-to-r from-rose-950/40 to-red-950/40 border-rose-900/50 shadow-[0_0_30px_rgba(136,19,55,0.2)]' 
        : team1 && team2 
          ? 'bg-zinc-900/40 border-white/5 hover:border-rose-900/20 hover:bg-zinc-900/60' 
          : 'bg-black/20 border-white/5 opacity-60'}
    `}
  >
    {isActive && (
       <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-rose-900 to-transparent animate-pulse" />
    )}
    
    <div className="relative grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
      <div className={`flex justify-end items-center gap-4 font-bold min-w-0 ${team1 ? 'text-white' : 'text-zinc-600'}`}>
        <span className="truncate text-lg">{team1 || 'Dönüyor...'}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${team1 ? 'bg-white/10 shadow-lg' : 'bg-white/5'}`}>
             {team1 && TEAM_LOGOS[team1] ? (
              <img src={TEAM_LOGOS[team1]} alt={team1} className="w-7 h-7 object-contain" />
            ) : (
                <div className="w-6 h-6 rounded-full bg-white/5" />
            )}
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">MAÇ {index + 1}</span>
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-zinc-800 text-xs text-zinc-500 font-bold shadow-inner">VS</div>
      </div>

      <div className={`flex justify-start items-center gap-4 font-bold min-w-0 ${team2 ? (hasMediumWheel ? 'text-cyan-300' : 'text-white') : 'text-zinc-600'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${team2 ? 'bg-white/10 shadow-lg' : 'bg-white/5'}`}>
            {team2 && TEAM_LOGOS[team2] ? (
              <img src={TEAM_LOGOS[team2]} alt={team2} className="w-7 h-7 object-contain" />
            ) : (
                <div className="w-6 h-6 rounded-full bg-white/5" />
            )}
        </div>
        <span className="truncate text-lg">{team2 || 'Bekleniyor...'}</span>
      </div>
    </div>
  </motion.div>
);

const ModeSelection = ({ onSelectMode }) => (
  // Adjusted container for better mobile fit and scrolling
  <div className="flex flex-col items-center justify-center min-h-full w-full max-w-5xl mx-auto px-4 z-20 relative py-10 pb-40">
    <div className="text-center mb-8 md:mb-16">
      <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
         <Sparkles className="text-amber-400" size={32} />
      </div>
      <h2 className="text-4xl md:text-7xl font-black text-white mb-4 md:mb-6 tracking-tighter drop-shadow-2xl">
        MODUNU SEÇ
      </h2>
      <p className="text-zinc-400 text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto px-4">
        Kura çekimi için bir turnuva formatı belirle.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
      <button 
        onClick={() => onSelectMode('svm')}
        className="group relative h-64 md:h-80 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 shadow-2xl shadow-black/50 bg-zinc-900 border border-white/10 hover:border-rose-500/40"
      >
        <div className="absolute inset-0 bg-rose-900/20 group-hover:bg-rose-900/30 transition-colors" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop')] opacity-30 bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-between">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
            <Zap size={24} className="md:w-8 md:h-8" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight">Güçlü vs. Orta</h3>
            <p className="text-sm md:text-base text-zinc-300 font-medium">Dengeli bir mücadele. Devler ile sürprizciler karşı karşıya.</p>
          </div>
        </div>
      </button>
      
      <button 
        onClick={() => onSelectMode('svs')}
        className="group relative h-64 md:h-80 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 shadow-2xl shadow-black/50 bg-zinc-900 border border-white/10 hover:border-amber-500/40"
      >
        <div className="absolute inset-0 bg-amber-900/20 group-hover:bg-amber-900/30 transition-colors" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop')] opacity-30 bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-between">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-500 text-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
            <Trophy size={24} className="md:w-8 md:h-8" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight">Güçlü vs. Güçlü</h3>
            <p className="text-sm md:text-base text-zinc-300 font-medium">Şampiyonlar ligi seviyesinde kapışmalar. En iyiler birbirine karşı.</p>
          </div>
        </div>
      </button>
    </div>
  </div>
);

const FixtureGenerator = ({ onBack, view }) => {
  const [activeTab, setActiveTab] = useState('generator');
  const [gameMode, setGameMode] = useState(null);
  const [config, setConfig] = useState(null);
  const [strongTeams, setStrongTeams] = useState([]);
  const [mediumTeams, setMediumTeams] = useState([]);
  const [chosenStrongTeams, setChosenStrongTeams] = useState([]);
  const [chosenMediumTeams, setChosenMediumTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isFirstSpinOfPair, setIsFirstSpinOfPair] = useState(true);

  const initGame = useCallback((mode) => {
    const modeConfig = GAME_MODES[mode];
    setConfig(modeConfig);
    setGameMode(mode);
    setStrongTeams([...modeConfig.strongTeams]);
    setMediumTeams(modeConfig.mediumTeams ? [...modeConfig.mediumTeams] : []);
    setChosenStrongTeams([]);
    setChosenMediumTeams([]);
    setMatches(Array.from({ length: modeConfig.numMatches }, () => ({ team1: null, team2: null })));
    setCurrentMatchIndex(0);
    setIsFirstSpinOfPair(true);
  }, []);
  const strongWheelRef = useRef(null);
  const mediumWheelRef = useRef(null);
  const matchListRef = useRef(null);

  const scrollToRef = (ref, childId = null) => {
    if (window.innerWidth < 1024) { // Only scroll on mobile/tablet
      setTimeout(() => {
        if (childId) {
          const element = document.getElementById(childId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleStrongSpin = useCallback((winner) => {
    setChosenStrongTeams(prev => [...prev, winner]);
    setStrongTeams(prev => prev.filter(t => t !== winner));
    
    // Scroll to match list to show result
    scrollToRef(matchListRef, `match-card-${currentMatchIndex}`);

    if (config.hasMediumWheel) {
      setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team1: winner }; return n; });
      // After a short delay, scroll to medium wheel for next step
      setTimeout(() => scrollToRef(mediumWheelRef), 1500);
    } else {
      if (isFirstSpinOfPair) {
        setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team1: winner }; return n; });
        setIsFirstSpinOfPair(false);
        // Spin again on strong wheel (same wheel), so scroll back to it
        setTimeout(() => scrollToRef(strongWheelRef), 1500);
      } else {
        setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team2: winner }; return n; });
        setCurrentMatchIndex(p => p + 1);
        setIsFirstSpinOfPair(true);
        // New match start, scroll back to strong wheel
        setTimeout(() => scrollToRef(strongWheelRef), 1500);
      }
    }
  }, [config, currentMatchIndex, isFirstSpinOfPair]);

  const handleMediumSpin = useCallback((winner) => {
    setChosenMediumTeams(prev => [...prev, winner]);
    setMediumTeams(prev => prev.filter(t => t !== winner));
    setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team2: winner }; return n; });
    setCurrentMatchIndex(p => p + 1);
    
    // Scroll to match list to show result
    scrollToRef(matchListRef, `match-card-${currentMatchIndex}`);
    
    // After delay, scroll back to strong wheel for next match
    setTimeout(() => scrollToRef(strongWheelRef), 1500);
  }, [currentMatchIndex]);

  const fastComplete = useCallback(() => {
    if (!config) return;
    let tS = [...strongTeams], tM = [...mediumTeams], cS = [...chosenStrongTeams], cM = [...chosenMediumTeams];
    const nm = [...matches];
    let idx = currentMatchIndex;
    while (idx < config.numMatches) {
      if (config.hasMediumWheel) {
        if (tS.length === 0 || tM.length === 0) break;
        const si = Math.floor(Math.random() * tS.length); nm[idx].team1 = tS[si]; cS.push(tS[si]); tS.splice(si, 1);
        const mi = Math.floor(Math.random() * tM.length); nm[idx].team2 = tM[mi]; cM.push(tM[mi]); tM.splice(mi, 1);
      } else {
        if (tS.length < 2) break;
        const r1 = Math.floor(Math.random() * tS.length); nm[idx].team1 = tS[r1]; cS.push(tS[r1]); tS.splice(r1, 1);
        const r2 = Math.floor(Math.random() * tS.length); nm[idx].team2 = tS[r2]; cS.push(tS[r2]); tS.splice(r2, 1);
      }
      idx++;
    }
    setStrongTeams(tS); setMediumTeams(tM); setChosenStrongTeams(cS); setChosenMediumTeams(cM); setMatches(nm); setCurrentMatchIndex(idx);
    // Scroll to the last match card
    scrollToRef(matchListRef, `match-card-${config.numMatches - 1}`);
  }, [config, strongTeams, mediumTeams, chosenStrongTeams, chosenMediumTeams, matches, currentMatchIndex]);

  const resetGame = useCallback(() => {
    if (!config) return;
    setStrongTeams([...config.strongTeams]);
    setMediumTeams(config.mediumTeams ? [...config.mediumTeams] : []);
    setChosenStrongTeams([]); setChosenMediumTeams([]);
    setMatches(Array.from({ length: config.numMatches }, () => ({ team1: null, team2: null })));
    setCurrentMatchIndex(0); setIsFirstSpinOfPair(true);
    scrollToRef(strongWheelRef);
  }, [config]);

  const handleBack = () => {
    if (gameMode) {
      setGameMode(null);
      setMatches([]); 
    } else {
      onBack();
    }
  };

  const isComplete = config ? currentMatchIndex >= config.numMatches : false;

  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBackground variant="fixture" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative z-10 flex flex-col overflow-hidden">
        
        {!gameMode ? (
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             <ModeSelection onSelectMode={initGame} />
           </div>
        ) : (
          <div className="flex-1 flex flex-col h-full py-6">
            
            {/* 1. CENTERED HEADER */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center mb-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-rose-950/50 rounded-lg border border-rose-900/50 backdrop-blur-md">
                     <Zap className="text-rose-800 animate-pulse" size={20} />
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white drop-shadow-lg">
                    Fikstür <span className="text-rose-900">Oluşturucu</span>
                  </h1>
                </div>
               <div className="px-4 py-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                 <span className="text-xs font-bold text-zinc-400 tracking-[0.2em] uppercase">
                    {gameMode === 'svs' ? 'Güçlü vs. Güçlü' : 'Güçlü vs. Orta'}
                 </span>
               </div>
            </div>

            {/* 2. THREE COLUMN LAYOUT - CENTERED */}
            {/* Added overflow-y-auto to allow scrolling on mobile when stacked */}
            <div className="flex-1 flex items-start lg:items-center justify-center px-4 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0 scroll-smooth">
               <div className="w-full max-w-[95rem] flex flex-col lg:grid lg:grid-cols-[1fr_34rem_1fr] gap-8 items-center justify-items-center h-full lg:max-h-[80vh]">
                  
                  {/* LEFT WHEEL */}
                  <div ref={strongWheelRef} className="flex items-center justify-center w-full h-auto lg:h-full transform scale-100 lg:scale-100 order-1 lg:order-1 pt-4 lg:pt-0">
                     <SpinWheel 
                       items={strongTeams} 
                       onSpin={handleStrongSpin} 
                       disabled={config.hasMediumWheel ? (matches[currentMatchIndex]?.team1 !== null) : false}
                       title="Güçlü Takımlar"
                       icon={<Shield size={20} className="text-indigo-400" />}
                       glowColor="indigo"
                       chosenTeams={chosenStrongTeams}
                     />
                  </div>

                  {/* RIGHT WHEEL (If applicable, showing it next for better flow in SVS mode or SVM mode) */}
                  {/* For mobile flow, usually we want Wheel -> Match List -> Wheel. But user asked for wheels at top. */}
                  {/* Let's put both wheels at top if config has medium wheel, or standard flow. */}
                  
                  <div ref={mediumWheelRef} className={`flex items-center justify-center w-full h-auto lg:h-full transform scale-100 lg:scale-100 order-2 lg:order-3 pt-4 lg:pt-0 ${!config.hasMediumWheel ? 'hidden lg:flex' : ''}`}>
                    {config.hasMediumWheel ? (
                       <SpinWheel 
                         items={mediumTeams} 
                         onSpin={handleMediumSpin} 
                         disabled={matches[currentMatchIndex]?.team1 === null}
                         title="Orta Takımlar"
                         icon={<Users size={20} className="text-cyan-400" />}
                         glowColor="cyan"
                         chosenTeams={chosenMediumTeams}
                       />
                    ) : (
                       <div className="opacity-0 pointer-events-none hidden lg:block">Placeholder</div>
                    )}
                  </div>

                  {/* MIDDLE MATCH LIST (Wider & Glassmorphism) */}
                  <div ref={matchListRef} className="w-full lg:w-full h-auto min-h-[400px] lg:h-full lg:max-h-[70vh] flex flex-col bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative order-3 lg:order-2 shrink-0 mt-4 lg:mt-0 lg:mb-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    
                    <div className="flex-shrink-0 p-5 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between z-10">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ListFilter size={18} className="text-rose-400" />
                        Maç Listesi
                      </h3>
                      <span className="px-3 py-1 rounded-lg bg-black/40 text-xs font-bold text-zinc-400 border border-white/5">
                          {matches.filter(m => m.team1 && m.team2).length} / {matches.length}
                      </span>
                    </div>

                    <div className="lg:flex-1 lg:overflow-y-auto lg:custom-scrollbar p-4 space-y-3">
                       <AnimatePresence mode="popLayout">
                        {matches.map((match, idx) => (
                           <MatchCard 
                             key={idx} 
                             id={`match-card-${idx}`}
                             index={idx}
                             team1={match.team1} 
                             team2={match.team2}
                             isActive={idx === currentMatchIndex && !(match.team1 && match.team2)}
                             hasMediumWheel={config.hasMediumWheel}
                           />
                         ))}
                      </AnimatePresence>
                    </div>
                  </div>


                  {/* Mobile Spacer to ensure scroll clears navbar */}
                  <div className="w-full h-16 lg:hidden order-4 shrink-0" />

               </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. FLOATING BOTTOM CONTROL ISLAND */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto flex items-center gap-2 p-2 bg-rose-950/90 backdrop-blur-2xl border border-rose-900/50 rounded-2xl shadow-2xl shadow-rose-900/40 ring-1 ring-rose-500/10 max-w-[95vw] overflow-x-auto custom-scrollbar"
        >
             {/* HOME */}
            <button 
              onClick={handleBack}
              className="p-3 hover:bg-rose-500/20 rounded-xl transition-all text-rose-300 hover:text-white group relative shrink-0"
              title="Ana Menü / Geri"
            >
              <Home size={22} />
            </button>

            {gameMode && (
              <>
                <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />

                {/* RESET */}
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-2 px-4 py-3 bg-rose-900/30 hover:bg-rose-800/50 text-rose-200 hover:text-white rounded-xl transition-all border border-rose-500/10 hover:border-rose-400/30 font-medium text-sm shrink-0"
                  title="Sıfırla"
                >
                  <RotateCcw size={18} />
                  <span className="hidden sm:inline">Sıfırla</span>
                </button>

                {/* CENTER: Progress Info */}
                <div className="hidden md:flex flex-col items-center px-4 shrink-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                     {isComplete ? 'TAMAMLANDI' : 'FİKSTÜR OLUŞTURULUYOR'}
                  </span>
                  <div className="flex items-center gap-2 mt-1 w-32">
                     <span className="text-[10px] font-bold text-rose-400 tabular-nums">
                        {currentMatchIndex} / {config.numMatches}
                     </span>
                     <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                           initial={false}
                           animate={{ width: `${(currentMatchIndex / config.numMatches) * 100}%` }}
                           className="h-full bg-rose-600 rounded-full"
                        />
                     </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />

                {/* QUICK FINISH */}
                <button 
                  onClick={fastComplete}
                  disabled={matches.every(m => m.team1 && m.team2)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-800 hover:to-rose-700 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/30 border border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap text-sm"
                >
                   <FastForward size={18} fill="currentColor" />
                   <span>HIZLI BİTİR</span>
                </button>
              </>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default FixtureGenerator;
