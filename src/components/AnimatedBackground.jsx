import React from 'react';

/**
 * ANIMATED BACKGROUND - LIQUID NOISE EDITION
 * 
 * Aesthetic: Deep Onyx, Noise Texture, Subtle Mesh Gradients.
 * No "space" or "orb" themes. Purely atmospheric and texture-based.
 */

const AnimatedBackground = ({ variant = 'default', className = '' }) => {
  // ULTRATHINK: Single Palette Discipline
  // No random blotches. One cohesive, atmospheric gradient from the deep void.
  
  const variants = {
    default: {
      bg: '#000000', // Absolute Pitch Black
      primary: '#2e1065', // Violet 900 (The "Soul")
      secondary: '#0f0518', // Violet 950 (The "Deep")
    },
    worldcup: {
      bg: '#000000', // Pure Black (User Request: Green & Black only)
      primary: '#14532d', // Green 900 (Forest Green)
      secondary: '#064e3b', // Emerald 900 (Deep Green)
    },
    championsleague: {
      bg: '#020617', // Slate 950 (Deep Navy)
      primary: '#172554', // Blue 950 (Deepest Blue)
      secondary: '#1e3a8a', // Blue 900
    },
    fixture: {
      bg: '#180408', // Rose 950+
      primary: '#4c0519', // Rose 950 (Bordeaux)
      secondary: '#450a0a', // Red 950 (Deep Red)
    },
  };

  const theme = variants[variant] || variants.default;

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ zIndex: 0, background: theme.bg }}>
      
      {/* 1. SINGLE SOURCE GRADIENT (The "Horizon" Glow) */}
      {/* Instead of random blobs, we use a structured light source from the bottom */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              140% 100% at 50% 100%, 
              ${theme.primary} 0%, 
              ${theme.secondary} 30%, 
              ${theme.bg} 85%
            )
          `
        }}
      />

      {/* 2. ATMOSPHERIC FOG (Top-Down Shadow) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />

      {/* 3. ULTRA-FINE FILM GRAIN NOISE */}
      {/* High frequency, low opacity = Premium Texture, not dirty pixels */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opaciy='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* 3. VIGNETTE (Focus Center) */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes mesh-slide {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-5%, -5%) rotate(2deg) scale(1.1); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        .animate-mesh-slide {
          animation: mesh-slide 30s ease-in-out infinite alternate;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
