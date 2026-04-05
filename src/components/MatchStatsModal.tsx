import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Plus, Minus } from 'lucide-react';
import { Match, Player, Team, MatchPlayerStat } from '../types';
import { useTournament } from '../context/TournamentContext';

interface MatchStatsModalProps {
  match: Match;
  onClose: () => void;
}

export default function MatchStatsModal({ match, onClose }: MatchStatsModalProps) {
  const { teams, players, updateMatch } = useTournament();
  
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  
  const teamAPlayers = players.filter(p => p.teamId === match.teamAId);
  const teamBPlayers = players.filter(p => p.teamId === match.teamBId);

  const [stats, setStats] = useState<Record<string, MatchPlayerStat>>(match.playerStats || {});
  const [matchScores, setMatchScores] = useState({
    scoreA: match.scoreA || 0,
    wicketsA: match.wicketsA || 0,
    oversA: match.oversA || '0.0',
    scoreB: match.scoreB || 0,
    wicketsB: match.wicketsB || 0,
    oversB: match.oversB || '0.0',
  });

  const handleStatChange = (playerId: string, field: keyof MatchPlayerStat, value: number) => {
    setStats(prev => {
      const current = prev[playerId] || { playerId, runs: 0, wickets: 0, sixes: 0, fours: 0 };
      return {
        ...prev,
        [playerId]: { ...current, [field]: Math.max(0, value) }
      };
    });
  };

  const handleSave = () => {
    updateMatch(match.id, { 
      playerStats: stats,
      ...matchScores
    });
    onClose();
  };

  const renderTeamScoreInput = (team: Team | undefined, teamKey: 'A' | 'B') => (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex-1">
      <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4">{team?.name || `Team ${teamKey}`} Score</h4>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] text-white/40 uppercase block mb-1">Runs</label>
          <input 
            type="number" 
            min="0"
            value={matchScores[`score${teamKey}` as keyof typeof matchScores]}
            onChange={(e) => setMatchScores(prev => ({ ...prev, [`score${teamKey}`]: parseInt(e.target.value) || 0 }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg text-center text-white py-2 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-white/40 uppercase block mb-1">Wickets</label>
          <input 
            type="number" 
            min="0" max="10"
            value={matchScores[`wickets${teamKey}` as keyof typeof matchScores]}
            onChange={(e) => setMatchScores(prev => ({ ...prev, [`wickets${teamKey}`]: parseInt(e.target.value) || 0 }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg text-center text-white py-2 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-white/40 uppercase block mb-1">Overs</label>
          <input 
            type="text" 
            value={matchScores[`overs${teamKey}` as keyof typeof matchScores]}
            onChange={(e) => setMatchScores(prev => ({ ...prev, [`overs${teamKey}`]: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg text-center text-white py-2 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>
    </div>
  );

  const renderPlayerStats = (teamPlayers: Player[], teamName: string) => (
    <div className="space-y-4">
      <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-2">{teamName} Players</h4>
      <div className="space-y-2">
        {teamPlayers.map(p => {
          const pStats = stats[p.id] || { runs: 0, wickets: 0, sixes: 0, fours: 0 };
          return (
            <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="w-1/3">
                <p className="text-white font-bold text-sm truncate">{p.name}</p>
                <p className="text-white/40 text-[10px] uppercase">{p.role}</p>
              </div>
              
              <div className="flex gap-4 w-2/3 justify-end">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-white/40 uppercase mb-1">Runs</span>
                  <input 
                    type="number" 
                    min="0"
                    value={pStats.runs}
                    onChange={(e) => handleStatChange(p.id, 'runs', parseInt(e.target.value) || 0)}
                    className="w-16 bg-white/10 border border-white/20 rounded-lg text-center text-white py-1 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-white/40 uppercase mb-1">Wickets</span>
                  <input 
                    type="number" 
                    min="0"
                    value={pStats.wickets}
                    onChange={(e) => handleStatChange(p.id, 'wickets', parseInt(e.target.value) || 0)}
                    className="w-16 bg-white/10 border border-white/20 rounded-lg text-center text-white py-1 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-white/40 uppercase mb-1">Sixes</span>
                  <input 
                    type="number" 
                    min="0"
                    value={pStats.sixes}
                    onChange={(e) => handleStatChange(p.id, 'sixes', parseInt(e.target.value) || 0)}
                    className="w-16 bg-white/10 border border-white/20 rounded-lg text-center text-white py-1 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-white/40 uppercase mb-1">Fours</span>
                  <input 
                    type="number" 
                    min="0"
                    value={pStats.fours}
                    onChange={(e) => handleStatChange(p.id, 'fours', parseInt(e.target.value) || 0)}
                    className="w-16 bg-white/10 border border-white/20 rounded-lg text-center text-white py-1 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f111a] rounded-[3rem] border border-white/10 p-8 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500" />
        
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Post-Match Statistics</h3>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
              {teamA?.name} vs {teamB?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 space-y-8 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-6">
            {renderTeamScoreInput(teamA, 'A')}
            {renderTeamScoreInput(teamB, 'B')}
          </div>
          
          {renderPlayerStats(teamAPlayers, teamA?.name || 'Team A')}
          {renderPlayerStats(teamBPlayers, teamB?.name || 'Team B')}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 shrink-0">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Save className="w-5 h-5" />
            Save Player Statistics
          </button>
        </div>
      </motion.div>
    </div>
  );
}
