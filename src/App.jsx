import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, Globe, Star, Sparkles } from 'lucide-react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { CLProvider } from './context/CLContext';
import GroupStage from './components/GroupStage';
import KnockoutStage from './components/KnockoutStage';
import CLKnockoutStage from './components/CLKnockoutStage';
import FixtureGenerator from './components/FixtureGenerator';

// Tournament Selection Screen - Refined Noir Design
const TournamentSelector = ({ onSelect }) => {
  const cards = [
    {
      id: 'worldcup',
      icon: Globe,
      title: 'Dünya Kupası',
      subtitle: '2026 • USA/Canada/Mexico',
      tags: ['48 Takım', '12 Grup'],
      accentColor: 'emerald',
    },
    {
      id: 'championsleague',
      icon: Star,
      title: 'Şampiyonlar Ligi',
      subtitle: '2024-25 • Knockout',
      tags: ['24 Takım', 'Playoff'],
      accentColor: 'amber',
    },
    {
      id: 'fixture',
      icon: Sparkles,
      title: 'Fikstür Oluşturucu',
      subtitle: 'FC 26 • Çark Çevir',
      tags: ['Kulüpler', '2 Mod'],
      accentColor: 'rose',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3">
            Football Simulator
          </h1>
          <p className="text-zinc-500">Bir turnuva veya mod seç</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card, idx) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(card.id)}
              className="group relative bg-zinc-900/80 rounded-2xl p-6 text-left border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-5
                ${card.accentColor === 'emerald' ? 'bg-emerald-950 text-emerald-500' : ''}
                ${card.accentColor === 'amber' ? 'bg-amber-950 text-amber-500' : ''}
                ${card.accentColor === 'rose' ? 'bg-rose-950 text-rose-500' : ''}
              `}>
                <card.icon className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl font-bold text-zinc-100 mb-1">{card.title}</h2>
              <p className="text-zinc-500 text-sm mb-4">{card.subtitle}</p>
              
              <div className="flex gap-2 flex-wrap">
                {card.tags.map((tag, i) => (
                  <span key={i} className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Subtle accent line */}
              <div className={`
                absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                ${card.accentColor === 'emerald' ? 'bg-emerald-600' : ''}
                ${card.accentColor === 'amber' ? 'bg-amber-600' : ''}
                ${card.accentColor === 'rose' ? 'bg-rose-600' : ''}
              `} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};


// World Cup App Content - Refined Noir
const WCAppContent = ({ onBack }) => {
  const { phase, setPhase, resetTournament } = useTournament();

  const goBack = () => {
    if (phase === 'KNOCKOUT') setPhase('GROUPS');
    else if (phase === 'GROUPS') setPhase('SETUP');
    else onBack();
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 font-sans">
      <header className="mb-8 border-b border-zinc-800 pb-4 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex justify-between items-center pt-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={goBack}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-950 rounded-xl flex items-center justify-center">
                <Globe className="text-emerald-500" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100">Dünya Kupası</h1>
                <p className="text-xs text-zinc-500">2026</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 text-xs font-medium">
            <span className={`px-3 py-1.5 rounded-lg transition-all ${phase === 'GROUPS' ? 'bg-emerald-900 text-emerald-400' : 'text-zinc-600'}`}>Gruplar</span>
            <span className={`px-3 py-1.5 rounded-lg transition-all ${phase === 'KNOCKOUT' ? 'bg-emerald-900 text-emerald-400' : 'text-zinc-600'}`}>Knockout</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto pb-20">
        {phase === 'SETUP' && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
            <Globe className="w-16 h-16 text-emerald-500" />
            <div className="text-center">
              <h2 className="text-3xl font-bold text-zinc-100 mb-2">FIFA Dünya Kupası</h2>
              <p className="text-zinc-500">2026 • ABD / Kanada / Meksika</p>
            </div>
            
            <button
              onClick={() => resetTournament()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg px-8 py-3 rounded-xl transition-colors"
            >
              Turnuvayı Başlat
            </button>
          </div>
        )}
        
        {phase === 'GROUPS' && <GroupStage />}
        {phase === 'KNOCKOUT' && <KnockoutStage />}
      </main>
    </div>
  );
};

// Champions League App Content - Refined Noir
const CLAppContent = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 font-sans">
      <header className="mb-8 border-b border-zinc-800 pb-4 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex justify-between items-center pt-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-950 rounded-xl flex items-center justify-center">
                <Star className="text-amber-500" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100">Şampiyonlar Ligi</h1>
                <p className="text-xs text-zinc-500">2024-25</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto pb-20">
        <CLKnockoutStage />
      </main>
    </div>
  );
};

function App() {
  const [selectedTournament, setSelectedTournament] = useState(null);

  if (!selectedTournament) {
    return <TournamentSelector onSelect={setSelectedTournament} />;
  }

  if (selectedTournament === 'worldcup') {
    return (
      <TournamentProvider>
        <WCAppContent onBack={() => setSelectedTournament(null)} />
      </TournamentProvider>
    );
  }

  if (selectedTournament === 'championsleague') {
    return (
      <CLProvider>
        <CLAppContent onBack={() => setSelectedTournament(null)} />
      </CLProvider>
    );
  }

  if (selectedTournament === 'fixture') {
    return <FixtureGenerator onBack={() => setSelectedTournament(null)} />;
  }

  return null;
}

export default App;
