import React from 'react';
import { Player } from '../types';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface HDCardTemplateProps {
  player: Player;
  tournamentName: string;
  tournamentLogo?: string;
  themeColor?: string;
}

export const HDCardTemplate: React.FC<HDCardTemplateProps> = ({ 
  player, 
  tournamentName, 
  tournamentLogo,
  themeColor = '#ef4444' // Default red for the stripe
}) => {
  return (
    <div className="w-full h-full relative bg-[#0a0b10] overflow-hidden flex flex-col items-center select-none">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: `url("https://www.transparenttextures.com/patterns/carbon-fibre.png")`,
          backgroundSize: '100px'
        }} 
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-10" />

      {/* Red Diagonal Stripe */}
      <div 
        className="absolute w-[150%] h-32 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 z-20 opacity-90"
        style={{ backgroundColor: themeColor, boxShadow: `0 0 50px ${themeColor}40` }}
      />

      {/* Top Header Section */}
      <div className="relative z-30 mt-8 flex flex-col items-center gap-4">
        {/* Logo and Icons */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-lg">
            {tournamentLogo ? (
              <img crossOrigin="anonymous" src={tournamentLogo || null} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-black rounded-full" />
            )}
          </div>
          <span className="text-white/40 font-bold text-lg">×</span>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-lg">
            <div className="w-full h-full bg-black rounded-sm rotate-45" />
          </div>
        </div>

        {/* Cricket Carnival Box */}
        <div className="border-4 border-white px-8 py-2 bg-black/40 backdrop-blur-sm">
          <h2 className="text-white font-black text-4xl italic tracking-tighter leading-none text-center">
            CRICKET<br />CARNIVAL
          </h2>
        </div>
      </div>

      {/* Background Faded Players */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full">
          {/* Left Faded */}
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-[60%] h-[60%] opacity-20 grayscale blur-[2px]">
            <img 
              crossOrigin="anonymous"
              src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
              alt="" 
              className="w-full h-full object-contain"
            />
          </div>
          {/* Right Faded */}
          <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[60%] h-[60%] opacity-20 grayscale blur-[2px]">
            <img 
              crossOrigin="anonymous"
              src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
              alt="" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Main Player Image */}
      <div className="absolute inset-0 z-30 flex items-center justify-center mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-[85%] h-[85%] flex items-center justify-center"
        >
          <img 
            crossOrigin="anonymous"
            src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
            alt={player.name} 
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          />
          
          {/* Signature Overlay */}
          <div className="absolute bottom-[20%] right-[10%] w-32 h-32 opacity-60 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current stroke-[2]">
              <path d="M10,80 Q30,20 50,80 T90,20" />
              <path d="M20,70 Q40,30 60,70 T80,30" className="opacity-50" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Corner "X" Patterns */}
      <div className="absolute top-12 left-8 z-30 grid grid-cols-2 gap-2 opacity-40">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-white font-black text-xs">×</span>
        ))}
      </div>
      <div className="absolute top-12 right-8 z-30 grid grid-cols-2 gap-2 opacity-40">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-white font-black text-xs">×</span>
        ))}
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-12 flex flex-col items-center">
        {/* Player Name */}
        <motion.h1 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-6xl font-black text-white uppercase italic tracking-tighter text-center leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,1)]"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            WebkitTextStroke: '1px rgba(255,255,255,0.1)'
          }}
        >
          {player.name}
        </motion.h1>

        {/* Bottom Tournament Info */}
        <div className="mt-12 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4 text-white/60 font-bold text-[10px] tracking-[0.4em] uppercase">
            <span>≫≫≫</span>
            <span>{tournamentName}</span>
            <span>≪≪≪</span>
          </div>
          <span className="text-white/40 font-bold text-[10px] tracking-widest uppercase">2026</span>
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
