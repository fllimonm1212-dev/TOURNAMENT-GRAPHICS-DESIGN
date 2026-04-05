import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus, Zap, Target, Award, Download, Atom } from 'lucide-react';
import { toPng } from 'html-to-image';
import { cn } from '@/src/lib/utils';

export default function Statistics() {
  const { players, teams, calculatePlayerStats, tournamentName, isGoldenMode } = useTournament();
  const stats = calculatePlayerStats();
  const [isDownloading, setIsDownloading] = useState(false);

  const sortedByRuns = [...players].sort((a, b) => stats[b.id].runs - stats[a.id].runs).slice(0, 5);
  const sortedByWickets = [...players].sort((a, b) => stats[b.id].wickets - stats[a.id].wickets).slice(0, 5);
  const sortedBySixes = [...players].sort((a, b) => stats[b.id].sixes - stats[a.id].sixes).slice(0, 5);

  const downloadStatistics = async () => {
    const element = document.getElementById('statistics-dashboard');
    if (!element) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(element, { 
        cacheBust: true, 
        pixelRatio: 3,
        backgroundColor: '#0a0b10',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `statistics-${tournamentName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-8 space-y-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase">
            Tournament <span className="text-cyan-400">Statistics</span>
          </h1>
          <p className="text-white/40 font-medium mt-2 uppercase tracking-widest text-xs">Real-time player performance analysis</p>
        </div>
        <button 
          onClick={downloadStatistics}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/20 transition-all font-bold uppercase tracking-widest text-xs"
        >
          {isDownloading ? <Atom className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Stats
        </button>
      </div>

      <div id="statistics-dashboard" className="relative p-8 bg-[#0a0b10] rounded-[3rem] border border-white/5 shadow-2xl">
        {/* Chemistry Background Elements */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2322d3ee' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 44px' }} />
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{tournamentName}</h2>
            <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs mt-1">Official Player Statistics</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Run Scorers */}
        <div className="bg-[#1a1c26] rounded-[2.5rem] border border-white/5 p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              Orange Cap
            </h3>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Top Runs</span>
          </div>
          <div className="space-y-4">
            {sortedByRuns.map((player, index) => {
              const s = stats[player.id];
              const team = teams.find(t => t.id === player.teamId);
              const playerIndex = players.findIndex(p => p.id === player.id) + 1;
              const displayId = playerIndex < 10 ? `00${playerIndex}` : playerIndex < 100 ? `0${playerIndex}` : playerIndex;

              return (
                <motion.div 
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all group relative",
                    isGoldenMode ? "hover:border-yellow-500/30" : "hover:border-yellow-500/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-white/5 p-1 border border-white/10 overflow-hidden">
                        <img crossOrigin="anonymous" src={player.photoUrl || null} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className={cn(
                        "absolute -top-1.5 -left-1.5 px-1 py-0.5 rounded-md border font-black text-[6px] tracking-tighter transition-all duration-700",
                        isGoldenMode 
                          ? "bg-yellow-500 text-black border-yellow-400" 
                          : "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                      )}>
                        ID: {displayId}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[6px] font-black uppercase px-1 rounded",
                          player.category === 'Iconic' ? "bg-red-500 text-white" :
                          player.category === 'Platinum' ? "bg-slate-300 text-slate-900" :
                          player.category === 'Gold' ? "bg-yellow-500 text-black" : "bg-slate-400 text-white"
                        )}>{player.category}</span>
                        <p className="text-white font-black uppercase italic tracking-tight">{player.name}</p>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">
                        {player.role} {team && `• ${team.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-2xl font-black italic",
                      isGoldenMode ? "text-yellow-400" : "text-yellow-400"
                    )}>{s.runs}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest">Runs</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Top Wicket Takers */}
        <div className="bg-[#1a1c26] rounded-[2.5rem] border border-white/5 p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Award className="w-6 h-6 text-purple-400" />
              Purple Cap
            </h3>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Top Wickets</span>
          </div>
          <div className="space-y-4">
            {sortedByWickets.map((player, index) => {
              const s = stats[player.id];
              const team = teams.find(t => t.id === player.teamId);
              const playerIndex = players.findIndex(p => p.id === player.id) + 1;
              const displayId = playerIndex < 10 ? `00${playerIndex}` : playerIndex < 100 ? `0${playerIndex}` : playerIndex;

              return (
                <motion.div 
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all group relative",
                    isGoldenMode ? "hover:border-purple-500/30" : "hover:border-purple-500/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-white/5 p-1 border border-white/10 overflow-hidden">
                        <img crossOrigin="anonymous" src={player.photoUrl || null} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className={cn(
                        "absolute -top-1.5 -left-1.5 px-1 py-0.5 rounded-md border font-black text-[6px] tracking-tighter transition-all duration-700",
                        isGoldenMode 
                          ? "bg-yellow-500 text-black border-yellow-400" 
                          : "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                      )}>
                        ID: {displayId}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[6px] font-black uppercase px-1 rounded",
                          player.category === 'Iconic' ? "bg-red-500 text-white" :
                          player.category === 'Platinum' ? "bg-slate-300 text-slate-900" :
                          player.category === 'Gold' ? "bg-yellow-500 text-black" : "bg-slate-400 text-white"
                        )}>{player.category}</span>
                        <p className="text-white font-black uppercase italic tracking-tight">{player.name}</p>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">
                        {player.role} {team && `• ${team.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-2xl font-black italic",
                      isGoldenMode ? "text-yellow-400" : "text-purple-400"
                    )}>{s.wickets}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest">Wickets</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Most Sixes */}
        <div className="bg-[#1a1c26] rounded-[2.5rem] border border-white/5 p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Target className="w-6 h-6 text-cyan-400" />
              Maximums
            </h3>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Most Sixes</span>
          </div>
          <div className="space-y-4">
            {sortedBySixes.map((player, index) => {
              const s = stats[player.id];
              const team = teams.find(t => t.id === player.teamId);
              const playerIndex = players.findIndex(p => p.id === player.id) + 1;
              const displayId = playerIndex < 10 ? `00${playerIndex}` : playerIndex < 100 ? `0${playerIndex}` : playerIndex;

              return (
                <motion.div 
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all group relative",
                    isGoldenMode ? "hover:border-cyan-500/30" : "hover:border-cyan-500/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-white/5 p-1 border border-white/10 overflow-hidden">
                        <img crossOrigin="anonymous" src={player.photoUrl || null} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className={cn(
                        "absolute -top-1.5 -left-1.5 px-1 py-0.5 rounded-md border font-black text-[6px] tracking-tighter transition-all duration-700",
                        isGoldenMode 
                          ? "bg-yellow-500 text-black border-yellow-400" 
                          : "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                      )}>
                        ID: {displayId}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[6px] font-black uppercase px-1 rounded",
                          player.category === 'Iconic' ? "bg-red-500 text-white" :
                          player.category === 'Platinum' ? "bg-slate-300 text-slate-900" :
                          player.category === 'Gold' ? "bg-yellow-500 text-black" : "bg-slate-400 text-white"
                        )}>{player.category}</span>
                        <p className="text-white font-black uppercase italic tracking-tight">{player.name}</p>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">
                        {player.role} {team && `• ${team.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-2xl font-black italic",
                      isGoldenMode ? "text-yellow-400" : "text-cyan-400"
                    )}>{s.sixes}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest">Sixes</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
