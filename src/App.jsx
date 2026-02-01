import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TournamentProvider } from './context/TournamentContext';
import { CLProvider } from './context/CLContext';
import TournamentSelector from './components/TournamentSelector';
import WorldCupApp from './components/WorldCupApp';
import ChampionsLeagueApp from './components/ChampionsLeagueApp';
import FixtureGenerator from './components/FixtureGenerator';

/**
 * Football Simulator 2026 - Main App
 * 
 * Updated: Re-added smooth transitions with AnimatePresence
 */

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } }
};

const App = () => {
  const [view, setView] = useState('selector');

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans overflow-x-hidden">
      <TournamentProvider>
        <CLProvider>
            {/* SIMPLIFIED RENDERING - NO ANIMATE PRESENCE TO PREVENT LOCKS */}
            {view === 'selector' && (
              <div className="w-full h-full">
                <TournamentSelector onSelect={setView} />
              </div>
            )}
            
            {view === 'worldcup' && (
              <div className="w-full h-full">
                <WorldCupApp onBack={() => setView('selector')} view={view} />
              </div>
            )}
            
            {view === 'championsleague' && (
              <div className="w-full h-full">
                <ChampionsLeagueApp onBack={() => setView('selector')} view={view} />
              </div>
            )}
            
            {view === 'fixture' && (
              <div className="w-full h-full">
                <FixtureGenerator onBack={() => setView('selector')} view={view} />
              </div>
            )}
        </CLProvider>
      </TournamentProvider>
    </div>
  );
};

export default App;
