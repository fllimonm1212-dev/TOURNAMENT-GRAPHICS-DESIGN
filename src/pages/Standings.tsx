import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus, Download, Atom } from 'lucide-react';
import { toPng } from 'html-to-image';
import { cn } from '@/src/lib/utils';

export default function Standings() {
  const { teams, calculateTeamStats, tournamentName } = useTournament();
  const stats = calculateTeamStats();
  const [isDownloading, setIsDownloading] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => {
    const sA = stats[a.id];
    const sB = stats[b.id];
    if (sB.points !== sA.points) return sB.points - sA.points;
    return sB.nrr - sA.nrr;
  });

  const downloadStandings = async () => {
    const element = document.getElementById('standings-table');
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
      link.download = `standings-${tournamentName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">
            Tournament <span className="text-cyan-400">Standings</span>
          </h1>
          <p className="text-white/40 font-medium mt-2 uppercase tracking-widest text-xs">Real-time points table & NRR analysis</p>
        </div>
        <button 
          onClick={downloadStandings}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/20 transition-all font-bold uppercase tracking-widest text-xs"
        >
          {isDownloading ? <Atom className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Standings
        </button>
      </div>

      <div id="standings-table" className="bg-[#1a1c26] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative p-6">
        {/* Chemistry Background Elements */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2322d3ee' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 44px' }} />
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{tournamentName}</h2>
            <p className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Official Points Table</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Pos</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Team</th>
                <th className="px-6 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">P</th>
                <th className="px-6 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">W</th>
                <th className="px-6 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">L</th>
                <th className="px-6 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">T</th>
                <th className="px-6 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">NRR</th>
                <th className="px-8 py-6 text-[10px] font-black text-cyan-400 uppercase tracking-widest text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const s = stats[team.id];
                return (
                  <motion.tr 
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <span className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-black italic",
                        index === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                        index === 1 ? "bg-slate-400/20 text-slate-400 border border-slate-400/30" :
                        index === 2 ? "bg-amber-700/20 text-amber-700 border border-amber-700/30" :
                        "bg-white/5 text-white/40"
                      )}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 p-1.5 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                          <img crossOrigin="anonymous" src={team.logoUrl || null} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-white font-black uppercase italic tracking-tight">{team.name}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest">{team.owner}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center font-bold text-white/60">{s.played}</td>
                    <td className="px-6 py-6 text-center font-bold text-emerald-400">{s.won}</td>
                    <td className="px-6 py-6 text-center font-bold text-red-400">{s.lost}</td>
                    <td className="px-6 py-6 text-center font-bold text-white/40">{s.tied}</td>
                    <td className="px-6 py-6 text-center">
                      <span className={cn(
                        "font-mono text-xs font-bold",
                        s.nrr > 0 ? "text-emerald-400" : s.nrr < 0 ? "text-red-400" : "text-white/40"
                      )}>
                        {s.nrr > 0 ? '+' : ''}{s.nrr.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xl font-black text-cyan-400 italic">{s.points}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center">
        {[
          { label: 'P', desc: 'Played' },
          { label: 'W', desc: 'Won' },
          { label: 'L', desc: 'Lost' },
          { label: 'T', desc: 'Tied' },
          { label: 'NRR', desc: 'Net Run Rate' },
          { label: 'Pts', desc: 'Points' }
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{item.label}</span>
            <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
