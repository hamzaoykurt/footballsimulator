import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, Star, Sparkles, ArrowRight } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

/**
 * TOURNAMENT SELECTOR - LIQUID GLASS EDITION
 * 
 * Aesthetic: 
 * - Deep Onyx/Noise Background
 * - Solid White Typography (No Childish Gradients)
 * - Liquid Glass Cards (High Blur, Ring Borders - No Jagged Edges)
 */

const TournamentSelector = ({ onSelect }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      id: 'worldcup',
      icon: Globe,
      title: 'Dünya Kupası',
      subtitle: '2026 • USA/Canada/Mexico',
      tags: ['48 Takım', '12 Grup'],
      accent: 'group-hover:text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/20',
      ring: 'group-hover:ring-emerald-500/40',
    },
    {
      id: 'championsleague',
      icon: Star,
      title: 'Şampiyonlar Ligi',
      subtitle: '2025-26 • Knockout',
      tags: ['24 Takım', 'Playoff'],
      accent: 'group-hover:text-amber-400',
      glow: 'group-hover:shadow-amber-500/20',
      ring: 'group-hover:ring-amber-500/40',
    },
    {
      id: 'fixture',
      icon: Sparkles,
      title: 'Fikstür Oluşturucu',
      subtitle: 'FC 26 • Çark Çevir',
      tags: ['Kulüpler', '2 Mod'],
      accent: 'group-hover:text-rose-400',
      glow: 'group-hover:shadow-rose-500/20',
      ring: 'group-hover:ring-rose-500/40',
    },
  ];

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-start md:justify-center py-12 px-4 md:p-4 overflow-y-auto overflow-x-hidden">
      {/* Background Layer - Noise & Mesh */}
      <AnimatedBackground variant="default" />
      
      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="text-center mb-10 md:mb-24"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 mb-6 md:mb-8 shadow-2xl ring-1 ring-white/5">
            <Trophy className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-8xl font-black text-white tracking-tighter mb-4 md:mb-6 drop-shadow-2xl">
            Football Simulator
          </h1>
          <p className="text-lg text-zinc-500 font-medium max-w-lg mx-auto tracking-wide">
            Yeni nesil turnuva simülasyonu. Modunu seç ve başla.
          </p>
        </motion.div>

        {/* Liquid Glass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 md:px-0">
          {cards.map((card, idx) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1), duration: 0.6, type: "spring", damping: 20 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onSelect(card.id)}
              className={`
                group relative flex flex-col items-start text-left h-full
                rounded-2xl md:rounded-[2rem] p-6 md:p-8
                bg-white/[0.02] backdrop-blur-3xl
                ring-1 ring-white/[0.08]
                transition-all duration-500 ease-out
                overflow-hidden isolate
                ${card.glow} ${card.ring}
                hover:bg-white/[0.05]
              `}
            >
              {/* Liquid Shine Effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 40%)'
                }}
              />

              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-6 
                bg-white/[0.03] ring-1 ring-white/10 shadow-lg
                transition-colors duration-300
                ${card.accent} 
              `}>
                <card.icon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 w-full">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-300">{card.title}</h2>
                <p className="text-zinc-500 font-medium text-sm mb-8 group-hover:text-zinc-400 transition-colors">{card.subtitle}</p>
                
                {/* Footer / Tags */}
                <div className="flex items-center justify-between mt-auto w-full pt-6 border-t border-white/[0.05]">
                  <div className="flex gap-2">
                    {card.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 bg-white/[0.02] px-3 py-1 rounded-full border border-white/[0.02]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 duration-300" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentSelector;
