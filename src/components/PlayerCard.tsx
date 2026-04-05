import React from 'react';
import { Player } from '../types';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useTournament } from '../context/TournamentContext';
import { Atom, FlaskConical, Zap, Activity, Award } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  className?: string;
  isLarge?: boolean;
  transparent?: boolean;
  showWatermark?: boolean;
}

export default function PlayerCard({ player, className, isLarge = false, transparent = false, showWatermark = false }: PlayerCardProps) {
  const { tournamentLogo, tournamentName, teams, isGoldenMode, players, cardTemplate } = useTournament();
  const playerIndex = players.findIndex(p => p.id === player.id) + 1;
  const displayId = playerIndex < 10 ? `00${playerIndex}` : playerIndex < 100 ? `0${playerIndex}` : playerIndex;

  // Emerald Template (Based on user image)
  if (cardTemplate === 'Emerald') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className={cn(
          "relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] group flex flex-col bg-[#020617]",
          isLarge ? "w-full max-w-[600px] min-h-[460px]" : "w-full min-h-[340px]",
          className
        )}
      >
        {/* Green Energy Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-emerald-900/20" />
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_50%)]"
          />
          {/* Flowing Wisps */}
          <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none"
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 200 Q 100 150 200 200 T 400 200' stroke='rgba(16,185,129,0.3)' fill='none' stroke-width='2'/%3E%3Cpath d='M0 250 Q 150 200 300 250 T 400 250' stroke='rgba(16,185,129,0.2)' fill='none' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '200% 100%' }} />
        </div>

        {/* Tournament Logo */}
        {tournamentLogo && (
          <div className="absolute top-4 left-4 z-30 w-10 h-10">
            <img src={tournamentLogo || null} alt="Logo" className="w-full h-full object-contain opacity-60" />
          </div>
        )}

        <div className="relative flex-1 flex z-10">
          {/* Left Panel */}
          <div className="w-[45%] h-full flex flex-col justify-center p-6 bg-black/40 backdrop-blur-sm border-r border-emerald-500/20">
            {/* Number Badge */}
            <div className="relative w-20 h-24 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-lg transform rotate-45 opacity-20" />
              <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-lg transform rotate-45" />
              <span className="text-5xl font-black text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] z-10">
                {displayId.toString().slice(-2)}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white uppercase leading-none tracking-tight">
                {player.name.split(' ')[0]}<br/>
                {player.name.split(' ').slice(1).join(' ')}
              </h3>
              <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mt-2">
                {player.role}
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-emerald-500/20">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                {player.role}
              </p>
            </div>
          </div>

          {/* Right Panel - Player Image */}
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/40 z-10" />
            <motion.img 
              src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
              alt={player.name}
              className="w-full h-full object-cover object-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8 }}
              crossOrigin="anonymous"
            />
            
            {/* Category Badge */}
            {player.category && (
              <div className={cn(
                "absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                player.category === 'Iconic' ? "bg-red-500/20 border-red-500 text-red-400" :
                player.category === 'Platinum' ? "bg-slate-300/20 border-slate-300 text-slate-300" :
                player.category === 'Gold' ? "bg-yellow-500/20 border-yellow-500 text-yellow-500" :
                "bg-emerald-500/20 border-emerald-500 text-emerald-400"
              )}>
                {player.category}
              </div>
            )}

            {/* Price Tag */}
            <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-md border border-emerald-500/30 px-4 py-2 rounded-xl">
              <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest">
                {player.status === 'Sold' ? 'Sold For' : 'Base Price'}
              </p>
              <p className="text-white font-black text-lg">
                ৳{ (player.status === 'Sold' ? player.soldPrice : player.basePrice)?.toLocaleString() }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Midnight Template
  if (cardTemplate === 'Midnight') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 group",
          isLarge ? "w-full max-w-[600px] min-h-[460px]" : "w-full min-h-[340px]",
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(63,63,70,0.15)_0%,transparent_50%)]" />
        
        {tournamentLogo && (
          <div className="absolute top-4 left-4 z-30 w-8 h-8">
            <img src={tournamentLogo || null} alt="Logo" className="w-full h-full object-contain opacity-20" />
          </div>
        )}

        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-zinc-500">
              {displayId}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{player.role}</p>
              <p className="text-white font-black text-xl">{player.name}</p>
            </div>
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden mb-4 bg-zinc-900 border border-zinc-800">
            <img 
              src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
              alt={player.name} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              crossOrigin="anonymous"
            />
            {player.status === 'Sold' && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-4xl font-black text-emerald-400 rotate-[-15deg] border-4 border-emerald-400 px-4 py-1 rounded-xl">SOLD</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Category</p>
              <p className="text-zinc-400 font-bold">{player.category || 'Silver'}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Value</p>
              <p className="text-white font-black text-2xl">৳{ (player.status === 'Sold' ? player.soldPrice : player.basePrice)?.toLocaleString() }</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Neon Template
  if (cardTemplate === 'Neon') {
    return (
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 1 }}
        className={cn(
          "relative rounded-xl overflow-hidden bg-black border-2 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.3)]",
          isLarge ? "w-full max-w-[600px] min-h-[460px]" : "w-full min-h-[340px]",
          className
        )}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-fuchsia-500 animate-pulse" />
        
        {tournamentLogo && (
          <div className="absolute top-4 left-4 z-30 w-8 h-8">
            <img src={tournamentLogo || null} alt="Logo" className="w-full h-full object-contain opacity-40" />
          </div>
        )}

        <div className="relative h-full flex flex-col p-4">
          <div className="relative h-48 rounded-lg overflow-hidden border border-fuchsia-500/30 mb-4">
            <img src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} alt={player.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2">
              <span className="bg-fuchsia-500 text-black text-[10px] font-black px-2 py-0.5 rounded italic">#{displayId}</span>
            </div>
          </div>

          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 italic uppercase">
            {player.name}
          </h3>
          <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">{player.role}</p>

          <div className="mt-auto flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
            <div>
              <p className="text-[8px] text-zinc-500 uppercase font-bold">Price</p>
              <p className="text-white font-black">৳{ (player.status === 'Sold' ? player.soldPrice : player.basePrice)?.toLocaleString() }</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-zinc-500 uppercase font-bold">Status</p>
              <p className={cn(
                "font-black text-sm uppercase",
                player.status === 'Sold' ? "text-emerald-400" : "text-fuchsia-400"
              )}>{player.status}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Modern Template
  if (cardTemplate === 'Modern') {
    return (
      <motion.div 
        className={cn(
          "relative rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 group",
          isLarge ? "w-full max-w-[600px] min-h-[460px]" : "w-full min-h-[340px]",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="p-8 h-full flex flex-col relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20">
              <img src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} alt={player.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{player.name}</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{player.role}</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.5em] mb-2">Valuation</p>
              <p className="text-6xl font-black text-white tracking-tighter">
                ৳{ (player.status === 'Sold' ? player.soldPrice : player.basePrice)?.toLocaleString() }
              </p>
            </div>
          </div>

          <div className="mt-auto flex justify-between items-center pt-6 border-t border-white/5">
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                {player.category || 'Silver'}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                player.status === 'Sold' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"
              )}>
                {player.status}
              </span>
            </div>
            <p className="text-[10px] font-black text-white/20 tracking-widest uppercase">#{displayId}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default Chemistry/Golden Template (Existing logic)
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn(
        "relative rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group p-1.5 transition-all duration-500 flex flex-col",
        transparent ? "bg-transparent" : (isGoldenMode ? "bg-[#1a1400]" : "bg-[#0a0b10]"),
        isLarge ? "w-full max-w-[600px] min-h-[460px]" : "w-full min-h-[340px]",
        className
      )}
    >
      {/* Animated Chemistry Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-[3rem] opacity-0 group-hover:opacity-60 blur-[120px] transition-opacity duration-700 -z-10",
        isGoldenMode ? "bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600" : "bg-gradient-to-br from-cyan-400 via-fuchsia-500 via-indigo-500 to-emerald-400"
      )} />
      
      {/* Premium Outer Border Glow */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem]",
        isGoldenMode ? "bg-gradient-to-br from-yellow-400/40 via-transparent to-amber-600/40" : "bg-gradient-to-br from-cyan-500/30 via-fuchsia-500/20 to-emerald-500/30"
      )} />
      
      <div className={cn(
        "relative flex-1 w-full rounded-[2.8rem] overflow-hidden flex flex-col items-center p-5 border border-white/5 z-10",
        transparent ? "bg-transparent" : (isGoldenMode ? "bg-gradient-to-b from-[#2a1f00] to-[#151000]" : "bg-[#0f111a]")
      )}>
        {/* Stadium Lights Effect - More Prominent */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent z-0 flex justify-around px-8 pt-1 opacity-40">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex flex-col items-center">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full shadow-[0_0_20px_white]",
                isGoldenMode ? "bg-yellow-200 shadow-[0_0_20px_#fef08a,0_0_40px_#eab308]" : "bg-white shadow-[0_0_20px_white,0_0_40px_cyan]"
              )} />
              <div className={cn(
                "w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent",
                isGoldenMode ? "from-yellow-200/40" : "from-white/20"
              )} />
            </div>
          ))}
        </div>

        {/* Player ID Badge - Top Left */}
        <div className={cn(
          "absolute top-4 left-4 z-20 px-3 py-1 rounded-xl border font-black text-[10px] tracking-widest transition-all duration-700",
          isGoldenMode 
            ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]" 
            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        )}>
          ID: {displayId}
        </div>

        {/* Chemistry Background Elements - Hexagonal Pattern (Benzene Rings) */}
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none z-0" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='${isGoldenMode ? '%23eab308' : '%2322d3ee'}' stroke-width='2' fill='none'/%3E%3Ccircle cx='30' cy='0' r='2' fill='${isGoldenMode ? '%23eab308' : '%2322d3ee'}'/%3E%3Ccircle cx='55.98' cy='15' r='2' fill='${isGoldenMode ? '%23eab308' : '%2322d3ee'}'/%3E%3Ccircle cx='55.98' cy='45' r='2' fill='${isGoldenMode ? '%23eab308' : '%2322d3ee'}'/%3E%3Ccircle cx='30' cy='60' r='2' fill='${isGoldenMode ? '%23eab308' : '%2322d3ee'}'/%3E%3Ccircle cx='4.02' cy='45' r='2' fill='${isGoldenMode ? '%23eab308' : '%2322d3ee'}'/%3E%3Ccircle cx='4.02' cy='15' r='2' fill='${isGoldenMode ? '%23eab308' : '%2322d3ee'}'/%3E%3C/svg%3E")`, backgroundSize: '30px 34px' }} />
        
        {/* Molecular Bond Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='white'/%3E%3Ccircle cx='90' cy='90' r='1' fill='white'/%3E%3Cline x1='10' y1='10' x2='90' y2='90' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='90' cy='10' r='1' fill='white'/%3E%3Cline x1='90' y1='10' x2='10' y2='90' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 100px' }} />
        
        {/* Floating Elements for Depth */}
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [-12, -8, -12],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute top-12 right-8 z-0",
            isGoldenMode ? "text-yellow-500/30" : "text-cyan-500/20"
          )}
        >
          <Atom size={70} strokeWidth={1} />
        </motion.div>
        
        <motion.div 
          animate={{ 
            y: [0, 15, 0],
            rotate: [45, 55, 45],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute bottom-32 left-6 z-0",
            isGoldenMode ? "text-amber-500/30" : "text-emerald-500/20"
          )}
        >
          <FlaskConical size={50} strokeWidth={1} />
        </motion.div>

        {/* Cricket Elements */}
        <motion.div 
          animate={{ 
            x: [0, 10, 0],
            y: [0, -5, 0],
            rotate: [0, 15, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute top-32 left-8 z-0",
            isGoldenMode ? "text-yellow-400/30" : "text-fuchsia-500/20"
          )}
        >
          <CricketBall size={40} />
        </motion.div>

        <motion.div 
          animate={{ 
            rotate: [-15, 0, -15],
            y: [0, 10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute bottom-48 right-10 z-0",
            isGoldenMode ? "text-amber-400/30" : "text-indigo-500/20"
          )}
        >
          <CricketBat size={60} />
        </motion.div>

        {/* Energy Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute w-1 h-1 rounded-full",
                isGoldenMode ? "bg-yellow-200/60" : "bg-white/40"
              )}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0 
              }}
              animate={{ 
                y: [null, "-20%"],
                opacity: [0, 1, 0],
                scale: [0, 2, 0]
              }}
              transition={{ 
                duration: 3 + Math.random() * 4, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
            />
          ))}
        </div>

        {/* Decorative Background Gradients */}
        <div className={cn(
          "absolute top-0 left-0 w-full h-48 z-0",
          isGoldenMode 
            ? "bg-gradient-to-b from-yellow-500/20 via-amber-500/5 to-transparent" 
            : "bg-gradient-to-b from-cyan-600/15 via-fuchsia-600/5 to-transparent"
        )} />
        <div className={cn(
          "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] z-0",
          isGoldenMode ? "bg-yellow-500/20" : "bg-cyan-500/15"
        )} />
        <div className={cn(
          "absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[100px] z-0",
          isGoldenMode ? "bg-amber-500/20" : "bg-emerald-500/15"
        )} />
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-0",
          isGoldenMode 
            ? "bg-gradient-to-tr from-yellow-500/10 via-transparent to-amber-500/10" 
            : "bg-gradient-to-tr from-indigo-500/5 via-transparent to-fuchsia-500/5"
        )} />

        {/* Tournament Info - Top Center */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
          {tournamentLogo && (
            <div className="w-8 h-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 p-1 shadow-2xl shrink-0">
              <img src={tournamentLogo || null} alt="Tournament Logo" className="w-full h-full rounded-lg object-cover" />
            </div>
          )}
        </div>

        {/* Circular Player Image Container */}
        <div className="relative mt-8 mb-6 z-10 flex justify-center w-full">
          <div className="relative flex items-center">
            {/* Vertical Category Text next to image (Left Side) */}
            {player.category && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -left-20 md:-left-28 top-1/2 -translate-y-1/2 -rotate-90 z-50 pointer-events-none"
              >
                <span className={cn(
                  "font-black tracking-[0.4em] text-2xl uppercase whitespace-nowrap",
                  player.category === 'Iconic' ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" :
                  player.category === 'Platinum' ? "text-slate-300 drop-shadow-[0_0_15px_rgba(203,213,225,0.6)]" :
                  player.category === 'Gold' ? "text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" :
                  "text-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.6)]"
                )}>
                  {player.category}
                </span>
              </motion.div>
            )}

            {/* Vertical SOLD Text next to image (Right Side) */}
            {player.status === 'Sold' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -right-16 md:-right-20 top-1/2 -translate-y-1/2 rotate-90 z-50 pointer-events-none"
              >
                <span className="text-emerald-400 font-black tracking-[0.4em] text-2xl drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                  SOLD
                </span>
              </motion.div>
            )}

            <div className={cn(
              "w-36 h-36 md:w-44 md:h-44 rounded-full p-1.5 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative z-10",
              isGoldenMode 
                ? "bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.5)]" 
                : "bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
            )}>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0f111a] bg-[#1a1c26]">
                <motion.img 
                  src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
            {/* Pulsing Atomic Ring */}
            {player.status === 'Available' && (
              <div className={cn(
                "absolute inset-[-8px] rounded-full border animate-[spin_10s_linear_infinite] z-0",
                isGoldenMode ? "border-yellow-500/30" : "border-cyan-500/20"
              )}>
                <div className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                  isGoldenMode ? "bg-yellow-400 shadow-[0_0_10px_#eab308]" : "bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                )} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full text-center space-y-2 flex-1 flex flex-col justify-between">
          {/* Transparent Logo Watermark */}
          {showWatermark && tournamentLogo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.15] pointer-events-none z-0">
              <img 
                src={tournamentLogo || null} 
                alt="" 
                className="w-[100%] h-[100%] object-contain" 
                crossOrigin="anonymous" 
              />
            </div>
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={cn(
                "px-2.5 py-0.5 border text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-inner transition-all duration-700",
                isGoldenMode 
                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" 
                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
              )}>
                {player.role}
              </span>
              <span className={cn(
                "px-2.5 py-0.5 border text-[8px] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-700",
                isGoldenMode 
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500/60" 
                  : "bg-white/5 border-white/10 text-white/60"
              )}>
                Age: {player.age}
              </span>
            </div>
            
            <h3 className={cn(
              "font-black text-white leading-tight uppercase italic tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent line-clamp-2 transition-all duration-700",
              isLarge ? "text-3xl" : "text-2xl",
              isGoldenMode ? "drop-shadow-[0_5px_15px_rgba(234,179,8,0.5)]" : "drop-shadow-[0_5px_15px_rgba(6,182,212,0.5)]"
            )}>
              {player.name}
            </h3>

            {/* Team Name for Sold Players */}
            {player.status === 'Sold' && player.teamId && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-1.5 flex items-center justify-center gap-1.5 px-2.5 py-0.5 border rounded-xl backdrop-blur-sm mx-auto w-fit transition-all duration-700",
                  isGoldenMode 
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}
              >
                <TrophyIcon className={cn("w-2.5 h-2.5", isGoldenMode ? "text-yellow-400" : "text-emerald-400")} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {teams.find(t => t.id === player.teamId)?.name || 'Team'}
                </span>
              </motion.div>
            )}
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className={cn(
              "grid grid-cols-2 gap-3 pt-3 border-t transition-colors duration-700",
              isGoldenMode ? "border-yellow-500/20" : "border-white/10"
            )}>
              <div className="text-center">
                <p className={cn(
                  "text-[8px] uppercase font-bold tracking-widest mb-0.5 transition-colors duration-700",
                  isGoldenMode ? "text-yellow-500/40" : "text-white/30"
                )}>Base Price</p>
                <p className={cn("font-black text-white", isLarge ? "text-lg" : "text-base")}>৳{player.basePrice.toLocaleString()}</p>
              </div>
              <div className={cn(
                "text-center border-l transition-colors duration-700",
                isGoldenMode ? "border-yellow-500/20" : "border-white/10"
              )}>
                <p className={cn(
                  "text-[8px] uppercase font-bold tracking-widest mb-0.5 transition-colors duration-700",
                  isGoldenMode ? "text-yellow-500/40" : "text-white/30"
                )}>
                  {player.status === 'Sold' ? 'Sold For' : 'Status'}
                </p>
                <p className={cn(
                  "font-black",
                  isLarge ? "text-lg" : "text-base",
                  player.status === 'Sold' ? (isGoldenMode ? "text-yellow-400" : "text-emerald-400") : 
                  player.status === 'Available' ? (isGoldenMode ? "text-yellow-500" : "text-cyan-400") : "text-red-400"
                )}>
                  {player.status === 'Sold' ? `৳${player.soldPrice?.toLocaleString()}` : player.status}
                </p>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className={cn(
              "pt-2 border-t flex items-center justify-center gap-2 transition-colors duration-700",
              isGoldenMode ? "border-yellow-500/20" : "border-white/10"
            )}>
              <Atom size={12} className={cn("transition-colors duration-700", isGoldenMode ? "text-yellow-400" : "text-cyan-400")} />
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.5em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all duration-700"
              )}>{tournamentName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Corner Accents - Chemistry Style */}
      <div className={cn(
        "absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 rounded-tl-[3rem] pointer-events-none z-20 transition-all duration-700",
        isGoldenMode ? "border-yellow-500/30" : "border-cyan-500/30"
      )} />
      <div className={cn(
        "absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 rounded-br-[3rem] pointer-events-none z-20 transition-all duration-700",
        isGoldenMode ? "border-yellow-500/30" : "border-emerald-500/30"
      )} />
    </motion.div>
  );
}

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const CricketBall = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2C12 2 15 7 15 12C15 17 12 22 12 22" />
    <path d="M12 2C12 2 9 7 9 12C9 17 12 22 12 22" />
    <path d="M2 12H22" />
  </svg>
);

const CricketBat = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M18 2L22 6L10 18L6 14L18 2Z" />
    <path d="M6 14L2 18V22H6L10 18" />
    <path d="M14 6L18 10" />
  </svg>
);
