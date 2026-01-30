import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, RotateCcw, FastForward, ChevronLeft, Sparkles, Play } from 'lucide-react';

const GAME_MODES = {
  svm: {
    title: 'Güçlü vs Orta',
    subtitle: 'Bir güçlü takım ile bir orta ölçekli takımı eşleştir',
    numMatches: 11,
    strongTeams: ['Real Madrid', 'Man City', 'Arsenal', 'Bayern Münih', 'PSG', 'Liverpool', 'Barcelona', 'Inter Milan', 'Juventus', 'Chelsea', 'Man United'],
    mediumTeams: ['Dortmund', 'Bayer 04', 'Tottenham', 'Napoli', 'Aston Villa', 'A. Bilbao', 'Newcastle', 'Benfica', 'AC Milan', 'Fenerbahçe', 'Atlético Madrid'],
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

// Vibrant colors for wheels
const STRONG_COLORS = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#7c3aed', '#c026d3'];
const MEDIUM_COLORS = ['#f97316', '#fbbf24', '#a3e635', '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#fb7185', '#f43f5e'];

const SpinWheel = ({ teams, colors, onSpin, disabled, title, icon, chosenTeams }) => {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const offscreenCanvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = 500;
      offscreenCanvasRef.current.height = 500;
    }

    const offCtx = offscreenCanvasRef.current.getContext('2d');
    offCtx.clearRect(0, 0, 500, 500);

    if (teams.length === 0) {
      offCtx.fillStyle = 'rgba(39, 39, 42, 0.8)';
      offCtx.beginPath();
      offCtx.arc(250, 250, 245, 0, 2 * Math.PI);
      offCtx.fill();
      offCtx.fillStyle = '#52525b';
      offCtx.font = '600 20px Inter, system-ui, sans-serif';
      offCtx.textAlign = 'center';
      offCtx.fillText('Tamamlandı', 250, 255);
    } else {
      const anglePerSegment = (2 * Math.PI) / teams.length;
      for (let i = 0; i < teams.length; i++) {
        const angle = i * anglePerSegment;
        offCtx.save();
        offCtx.translate(250, 250);
        offCtx.beginPath();
        offCtx.fillStyle = colors[i % colors.length];
        offCtx.moveTo(0, 0);
        offCtx.arc(0, 0, 245, angle, angle + anglePerSegment);
        offCtx.closePath();
        offCtx.fill();
        offCtx.strokeStyle = '#18181b';
        offCtx.lineWidth = 2;
        offCtx.stroke();
        offCtx.rotate(angle + anglePerSegment / 2);
        offCtx.textAlign = 'right';
        offCtx.fillStyle = '#ffffff';
        offCtx.font = `700 ${teams.length > 14 ? '14px' : teams.length > 10 ? '16px' : '18px'} Inter, system-ui, sans-serif`;
        offCtx.shadowColor = 'rgba(0,0,0,0.5)';
        offCtx.shadowBlur = 4;
        offCtx.fillText(teams[i], 230, 5);
        offCtx.restore();
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(currentAngle);
    ctx.drawImage(offscreenCanvasRef.current, -250, -250);
    ctx.restore();
  }, [teams, colors, currentAngle]);

  const spin = useCallback(() => {
    if (isSpinning || teams.length === 0 || disabled) return;
    setIsSpinning(true);
    const spinTimeTotal = Math.random() * 2000 + 4000;
    const totalRotations = (Math.random() * 5 + 8) * (2 * Math.PI);
    const startAngle = currentAngle;
    const endAngle = startAngle + totalRotations;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      if (elapsed >= spinTimeTotal) {
        setCurrentAngle(endAngle);
        const numSegments = teams.length;
        const anglePerSegment = 360 / numSegments;
        const finalAngle = (endAngle * 180 / Math.PI) % 360;
        const winningAngle = (270 - finalAngle + 360) % 360;
        const winnerIndex = Math.floor(winningAngle / anglePerSegment);
        const winner = teams[winnerIndex];
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
    requestAnimationFrame(animate);
  }, [isSpinning, teams, disabled, currentAngle, onSpin]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">{icon}{title}</h2>
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10"
          style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '22px solid #fbbf24' }} />
        
        <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full bg-zinc-900 p-0.5 shadow-xl shadow-black/50">
          <canvas ref={canvasRef} width={500} height={500} className="w-full h-full rounded-full" />
        </div>
      </div>
      
      <button 
        disabled={isSpinning || teams.length === 0 || disabled} 
        onClick={spin}
        className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${isSpinning || teams.length === 0 || disabled ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
      >
        {isSpinning ? 'Dönüyor...' : 'Çevir'}
      </button>
      
      <div className="w-full bg-zinc-900 rounded-lg p-2.5 border border-zinc-800">
        <h3 className="text-xs text-zinc-500 font-medium mb-1.5 text-center">Seçilen ({chosenTeams.length})</h3>
        <div className="flex flex-wrap justify-center gap-1 min-h-[1.25rem] max-h-20 overflow-y-auto">
          {chosenTeams.map((team, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{team}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ index, team1, team2, isActive, hasMediumWheel }) => (
  <div className={`rounded-lg p-2.5 border transition-all ${
    isActive 
      ? 'bg-rose-950/40 border-rose-700/40' 
      : team1 && team2 
        ? 'bg-emerald-950/30 border-emerald-800/30' 
        : 'bg-zinc-900/50 border-zinc-800/50 opacity-40'
  }`}>
    <div className="text-center text-zinc-600 font-medium mb-1.5 text-xs">{index + 1}. Maç</div>
    <div className="flex items-center justify-between text-sm font-semibold">
      <span className="text-orange-400 w-2/5 text-center truncate">{team1 || '—'}</span>
      <span className="text-zinc-700">vs</span>
      <span className={`${hasMediumWheel ? 'text-cyan-400' : 'text-orange-400'} w-2/5 text-center truncate`}>{team2 || '—'}</span>
    </div>
  </div>
);

const ModeSelection = ({ onSelectMode }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="text-center mb-8">
      <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3" />
      <h2 className="text-2xl font-bold text-zinc-100 mb-1">Mod Seç</h2>
      <p className="text-zinc-500 text-sm">Bir oyun modu seç</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-3 max-w-xl w-full">
      <button 
        onClick={() => onSelectMode('svm')}
        className="bg-zinc-900 rounded-xl p-5 text-left border border-zinc-800 hover:border-rose-700/50 hover:bg-zinc-900/80 transition-all group"
      >
        <div className="w-9 h-9 bg-rose-950 rounded-lg flex items-center justify-center mb-3 group-hover:bg-rose-900 transition-colors">
          <Zap className="w-4 h-4 text-rose-400" />
        </div>
        <h3 className="text-base font-bold text-zinc-100 mb-0.5">Güçlü vs. Orta</h3>
        <p className="text-zinc-500 text-xs">11 maç • İki farklı çark</p>
      </button>
      
      <button 
        onClick={() => onSelectMode('svs')}
        className="bg-zinc-900 rounded-xl p-5 text-left border border-zinc-800 hover:border-amber-700/50 hover:bg-zinc-900/80 transition-all group"
      >
        <div className="w-9 h-9 bg-amber-950 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-900 transition-colors">
          <Trophy className="w-4 h-4 text-amber-400" />
        </div>
        <h3 className="text-base font-bold text-zinc-100 mb-0.5">Güçlü vs. Güçlü</h3>
        <p className="text-zinc-500 text-xs">6 maç • Tek çark</p>
      </button>
    </div>
  </div>
);

const FixtureGenerator = ({ onBack }) => {
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

  const handleStrongSpin = useCallback((winner) => {
    setChosenStrongTeams(prev => [...prev, winner]);
    setStrongTeams(prev => prev.filter(t => t !== winner));
    if (config.hasMediumWheel) {
      setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team1: winner }; return n; });
    } else {
      if (isFirstSpinOfPair) {
        setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team1: winner }; return n; });
        setIsFirstSpinOfPair(false);
      } else {
        setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team2: winner }; return n; });
        setCurrentMatchIndex(p => p + 1);
        setIsFirstSpinOfPair(true);
      }
    }
  }, [config, currentMatchIndex, isFirstSpinOfPair]);

  const handleMediumSpin = useCallback((winner) => {
    setChosenMediumTeams(prev => [...prev, winner]);
    setMediumTeams(prev => prev.filter(t => t !== winner));
    setMatches(prev => { const n = [...prev]; n[currentMatchIndex] = { ...n[currentMatchIndex], team2: winner }; return n; });
    setCurrentMatchIndex(p => p + 1);
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
  }, [config, strongTeams, mediumTeams, chosenStrongTeams, chosenMediumTeams, matches, currentMatchIndex]);

  const resetGame = useCallback(() => {
    if (!config) return;
    setStrongTeams([...config.strongTeams]);
    setMediumTeams(config.mediumTeams ? [...config.mediumTeams] : []);
    setChosenStrongTeams([]); setChosenMediumTeams([]);
    setMatches(Array.from({ length: config.numMatches }, () => ({ team1: null, team2: null })));
    setCurrentMatchIndex(0); setIsFirstSpinOfPair(true);
  }, [config]);

  // Handler for back button - goes to mode selection or main menu
  const handleBack = () => {
    if (gameMode) {
      setGameMode(null);
      setConfig(null);
    } else {
      onBack();
    }
  };

  const currentMatch = matches[currentMatchIndex];
  const isStrongDisabled = config?.hasMediumWheel ? currentMatch?.team1 !== null : false;
  const isMediumDisabled = !currentMatch?.team1;
  const isComplete = config ? currentMatchIndex >= config.numMatches : false;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 font-sans">
      {/* Consistent Header - same as WC and CL */}
      <header className="mb-6 border-b border-zinc-800 pb-4 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex justify-between items-center pt-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-950 rounded-xl flex items-center justify-center">
                <Sparkles className="text-rose-500" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100">Fikstür Oluşturucu</h1>
                <p className="text-xs text-zinc-500">{gameMode ? config?.title : 'Mod Seçimi'}</p>
              </div>
            </div>
          </div>
          
          {/* Actions in header when in game mode */}
          {gameMode && (
            <div className="flex gap-2">
              <button 
                onClick={fastComplete} 
                disabled={isComplete}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs ${isComplete ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100'}`}
              >
                <FastForward size={14} />Tamamla
              </button>
              <button 
                onClick={resetGame}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium text-xs"
              >
                <RotateCcw size={14} />Sıfırla
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto pb-12">
        {!gameMode ? (
          <ModeSelection onSelectMode={initGame} />
        ) : (
          <>
            {/* Wheels */}
            <div className={`grid ${config.hasMediumWheel ? 'lg:grid-cols-2' : 'max-w-sm mx-auto'} gap-6 mb-8`}>
              <SpinWheel 
                teams={strongTeams} 
                colors={STRONG_COLORS} 
                onSpin={handleStrongSpin} 
                disabled={isComplete || isStrongDisabled || strongTeams.length === 0} 
                title="Güçlü Takımlar" 
                icon={<Trophy className="text-amber-500" size={16} />} 
                chosenTeams={chosenStrongTeams} 
              />
              {config.hasMediumWheel && (
                <SpinWheel 
                  teams={mediumTeams} 
                  colors={MEDIUM_COLORS} 
                  onSpin={handleMediumSpin} 
                  disabled={isComplete || isMediumDisabled || mediumTeams.length === 0} 
                  title="Orta Takımlar" 
                  icon={<Zap className="text-cyan-500" size={16} />} 
                  chosenTeams={chosenMediumTeams} 
                />
              )}
            </div>
            
            {/* Fixture List */}
            <section className="max-w-xl mx-auto">
              <h2 className="text-base font-semibold text-zinc-300 text-center mb-3">Fikstür</h2>
              <div className="grid gap-1.5">
                {matches.map((m, i) => (
                  <MatchCard key={i} index={i} team1={m.team1} team2={m.team2} isActive={i === currentMatchIndex && !isComplete} hasMediumWheel={config.hasMediumWheel} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default FixtureGenerator;
