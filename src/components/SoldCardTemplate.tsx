import React from 'react';
import { Player, Team } from '../types';
import { Shield, Atom } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SoldCardTemplateProps {
  player: Player;
  team?: Team;
  tournamentName: string;
  tournamentLogo: string;
  themeColor: string;
}

export function SoldCardTemplate({ player, team, tournamentName, tournamentLogo, themeColor }: SoldCardTemplateProps) {
  const { isGoldenMode } = useTournament();
  const effectiveTheme = isGoldenMode ? '#eab308' : themeColor;

  return (
    <div className={cn(
      "w-[400px] h-[650px] relative flex flex-col items-center overflow-hidden select-none",
      isGoldenMode ? "bg-[#1a1400]" : "bg-[#0a0b10]"
    )}>
      {/* Background Base */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Dynamic Background Gradients */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          background: `radial-gradient(circle at 50% 30%, ${effectiveTheme}40 0%, transparent 70%)` 
        }}
      />

      {/* Chemistry Hexagonal Pattern */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='${isGoldenMode ? '%23eab308' : '%23ffffff'}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, 
             backgroundSize: '40px 44px' 
           }} 
      />

      {/* Large Background "SOLD" Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
        <h1 
          className="text-[180px] font-black italic leading-none opacity-[0.04] tracking-tighter"
          style={{ WebkitTextStroke: `2px ${effectiveTheme}` }}
        >
          SOLD
        </h1>
      </div>

      {/* Top Header Bar */}
      <div className="relative z-30 w-full px-6 pt-6 flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full p-1 shadow-lg overflow-hidden">
              <img crossOrigin="anonymous" src={tournamentLogo || `https://api.dicebear.com/7.x/initials/svg?seed=CCC`} alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">Tournament</span>
              <span className="text-xs font-black text-white uppercase italic tracking-tight">{tournamentName}</span>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div 
          className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg"
          style={{ backgroundColor: player.status === 'Sold' ? effectiveTheme : '#ef4444', color: isGoldenMode ? '#000' : '#fff' }}
        >
          {player.status === 'Sold' ? 'SOLD' : 'UNSOLD'}
        </div>
      </div>

      {/* Main Player Image (Cutout Style) */}
      <div className="relative flex-1 w-full flex items-end justify-center z-10 mt-4">
        {/* Glow behind player */}
        <div 
          className="absolute bottom-20 w-64 h-64 rounded-full blur-[80px] opacity-30"
          style={{ backgroundColor: effectiveTheme }}
        />
        
        <div className="relative w-full h-full flex items-end justify-center px-4">
          <img 
            crossOrigin="anonymous"
            src={player.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
            alt={player.name} 
            className="max-w-full max-h-[85%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-20"
          />
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="relative z-30 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-8 px-8 flex flex-col items-center">
        {/* Player Category Badge */}
        <div 
          className="mb-4 px-4 py-1 rounded-full border backdrop-blur-md"
          style={{ borderColor: `${effectiveTheme}40`, backgroundColor: `${effectiveTheme}10` }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: effectiveTheme }}>
            {player.role} • {player.category || 'PLAYER'}
          </span>
        </div>

        {/* Player Name */}
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-6 text-center drop-shadow-2xl">
          {player.name}
        </h1>

        {/* Team and Price Row */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* Team Info */}
          <div className="flex-1 flex flex-col items-start">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Purchased By</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center">
                {team?.logoUrl ? (
                  <img crossOrigin="anonymous" src={team.logoUrl || null} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-5 h-5 text-white/20" />
                )}
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[120px]">
                {team?.name || 'NO TEAM'}
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-12 bg-white/10" />

          {/* Price Info */}
          <div className="flex-1 flex flex-col items-end">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Final Price</span>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black italic leading-none" style={{ color: effectiveTheme }}>
                ৳{(player.soldPrice || player.basePrice).toLocaleString()}
              </span>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter mt-1">
                Base: ৳{player.basePrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-2 z-40 opacity-20">
        <Atom className="w-3 h-3 text-white" />
        <span className="text-[7px] font-black text-white uppercase tracking-[0.4em]">{tournamentName} OFFICIAL</span>
      </div>
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-50 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
    </div>
  );
}
