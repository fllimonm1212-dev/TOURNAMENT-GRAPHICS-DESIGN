import React, { useState, useRef } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Match, Team } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Zap, 
  Users, 
  Download, 
  ImageIcon,
  Atom,
  FlaskConical,
  Beaker,
  Trash2,
  Edit2,
  CheckCircle2,
  Play,
  Radio,
  Minus,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { toPng } from 'html-to-image';
import { GoogleGenAI } from "@google/genai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MatchStatsModal from '../components/MatchStatsModal';

export default function ReactionManager() {
  const { teams, players, matches, addMatch, updateMatch, deleteMatch, tournamentLogo, tournamentName, generateFixtures, addMatchEvent } = useTournament();
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [posterType, setPosterType] = useState<'match' | 'toss' | 'xi' | 'live' | 'result' | null>(null);
  const [showStatsModalFor, setShowStatsModalFor] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  const [newMatch, setNewMatch] = useState({
    teamAId: '',
    teamBId: '',
    date: '',
    time: '',
    venue: '',
    status: 'Upcoming' as const
  });

  const [activeLiveMatchId, setActiveLiveMatchId] = useState<string | null>(null);
  const liveMatch = matches.find(m => m.id === activeLiveMatchId);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateAICommentary = async (match: Match) => {
    if (!match) return;
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const teamA = getTeam(match.teamAId);
      const teamB = getTeam(match.teamBId);
      
      const prompt = `
        You are a high-energy, professional cricket commentator. 
        Synthesize a short, punchy, and exciting live update (max 15 words) for this match state:
        Match: ${teamA?.name} vs ${teamB?.name}
        Score: ${teamA?.name} ${match.scoreA}/${match.wicketsA} (${match.oversA} ov) vs ${teamB?.name} ${match.scoreB}/${match.wicketsB} (${match.oversB} ov)
        Recent Events: ${match.events?.map(e => e.description).join(', ')}
        
        Make it sound like a "Breaking News" or "Critical Synthesis" update. Use emojis if appropriate.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const commentary = response.text || "Match is heating up! Stay tuned for more updates.";
      handleAddEvent(match.id, 'Custom', `🤖 AI: ${commentary}`);
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleUpdateScore = (matchId: string, team: 'A' | 'B', delta: number, type: 'runs' | 'wickets' = 'runs') => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    if (team === 'A') {
      if (type === 'runs') {
        updateMatch(matchId, { scoreA: Math.max(0, (match.scoreA || 0) + delta) });
      } else {
        updateMatch(matchId, { wicketsA: Math.max(0, (match.wicketsA || 0) + delta) });
      }
    } else {
      if (type === 'runs') {
        updateMatch(matchId, { scoreB: Math.max(0, (match.scoreB || 0) + delta) });
      } else {
        updateMatch(matchId, { wicketsB: Math.max(0, (match.wicketsB || 0) + delta) });
      }
    }
  };

  const handleUpdateCricket = (matchId: string, data: Partial<Match>) => {
    updateMatch(matchId, data);
  };

  const handleAddEvent = (matchId: string, type: any, description: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const newEvent = {
      id: crypto.randomUUID(),
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description
    };

    updateMatch(matchId, { 
      events: [newEvent, ...(match.events || [])].slice(0, 5) 
    });
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.teamAId || !newMatch.teamBId || !newMatch.date || !newMatch.time || !newMatch.venue) return;
    
    if (editingMatchId) {
      updateMatch(editingMatchId, newMatch);
    } else {
      addMatch(newMatch);
    }
    
    setIsAddingMatch(false);
    setEditingMatchId(null);
    setNewMatch({ teamAId: '', teamBId: '', date: '', time: '', venue: '', status: 'Upcoming' });
  };

  const handleEditMatch = (match: Match) => {
    setNewMatch({
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      date: match.date,
      time: match.time,
      venue: match.venue,
      status: match.status
    });
    setEditingMatchId(match.id);
    setIsAddingMatch(true);
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `reaction-${posterType}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating poster:', err);
    }
  };

  const getTeam = (id: string) => teams.find(t => t.id === id);

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
            <Atom className="w-8 h-8 text-cyan-400 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Reaction Manager</h2>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Synthesize Match Graphics & Live Updates</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => generateFixtures('Round Robin')}
            className="px-6 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/20 transition-all flex items-center gap-3 group"
          >
            <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Auto Fixtures</span>
          </button>
          <button 
            onClick={() => setIsAddingMatch(true)}
            className="flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Reaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Match List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <Zap className="w-3 h-3 text-cyan-400" />
              Active Reactions
            </h3>
            <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20 uppercase tracking-widest">
              {matches.length} Total
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {matches.length === 0 ? (
              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <FlaskConical className="w-8 h-8 text-white/20" />
                </div>
                <div>
                  <p className="text-white/60 font-bold uppercase tracking-widest">No Reactions Scheduled</p>
                  <p className="text-white/30 text-xs mt-1">Start a new match to generate graphics.</p>
                </div>
              </div>
            ) : (
              matches.map((match) => {
                const teamA = getTeam(match.teamAId);
                const teamB = getTeam(match.teamBId);
                return (
                  <motion.div 
                    key={match.id}
                    layoutId={match.id}
                    className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                  >
                    {/* Background Chemistry Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2322d3ee' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '30px 34px' }} />
                    
                    <div className="relative z-10 flex flex-col gap-8">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-12 flex-1 justify-center md:justify-start">
                          <div className="text-center space-y-3">
                            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 p-3 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-cyan-500/30 transition-colors">
                              {teamA?.logoUrl ? <img src={teamA.logoUrl || null} className="w-full h-full object-contain p-2" /> : <Users className="text-white/20 w-10 h-10" />}
                            </div>
                            <p className="text-xs font-black text-white uppercase tracking-widest line-clamp-2 w-32">{teamA?.name}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                              <span className="text-3xl font-black text-cyan-400 italic">VS</span>
                            </div>
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Reaction</span>
                          </div>
                          <div className="text-center space-y-3">
                            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 p-3 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-cyan-500/30 transition-colors">
                              {teamB?.logoUrl ? <img src={teamB.logoUrl || null} className="w-full h-full object-contain p-2" /> : <Users className="text-white/20 w-10 h-10" />}
                            </div>
                            <p className="text-xs font-black text-white uppercase tracking-widest line-clamp-2 w-32">{teamB?.name}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-3 px-10 border-x border-white/5 min-w-[200px]">
                          <div className="flex items-center gap-3 text-white/80 text-sm font-black italic">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                            {match.date}
                          </div>
                          <div className="flex items-center gap-3 text-white/80 text-sm font-black italic">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            {match.time}
                          </div>
                          <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-widest">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            {match.venue}
                          </div>
                          <div className={cn(
                            "mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                            match.status === 'Live' 
                              ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" 
                              : "bg-white/5 text-white/40 border-white/10"
                          )}>
                            {match.status}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {match.status === 'Live' && (
                            <button 
                              onClick={() => { setSelectedMatchId(match.id); setPosterType('live'); }}
                              className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all shadow-lg animate-pulse"
                              title="Live Dashboard"
                            >
                              <Zap className="w-6 h-6" />
                            </button>
                          )}
                          <button 
                            onClick={() => { setSelectedMatchId(match.id); setPosterType('match'); }}
                            className="p-4 bg-white/5 hover:bg-cyan-600/20 text-white/40 hover:text-cyan-400 rounded-2xl border border-white/10 transition-all shadow-lg"
                            title="Generate Graphics"
                          >
                            <ImageIcon className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => updateMatch(match.id, { 
                              status: match.status === 'Live' ? 'Completed' : 'Live',
                              scoreA: match.status === 'Live' ? match.scoreA : 0,
                              scoreB: match.status === 'Live' ? match.scoreB : 0,
                              wicketsA: match.status === 'Live' ? match.wicketsA : 0,
                              wicketsB: match.status === 'Live' ? match.wicketsB : 0,
                              oversA: match.status === 'Live' ? match.oversA : '0.0',
                              oversB: match.status === 'Live' ? match.oversB : '0.0',
                              events: match.status === 'Live' ? match.events : []
                            })}
                            className={cn(
                              "p-4 rounded-2xl border transition-all shadow-lg",
                              match.status === 'Live' 
                                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" 
                                : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                            )}
                            title={match.status === 'Live' ? 'End Match' : 'Start Live'}
                          >
                            {match.status === 'Live' ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                          </button>
                          {match.status === 'Completed' && (
                            <button 
                              onClick={() => setShowStatsModalFor(match.id)}
                              className="p-4 bg-white/5 hover:bg-purple-600/20 text-white/40 hover:text-purple-400 rounded-2xl border border-white/10 transition-all shadow-lg"
                              title="Edit Player Stats"
                            >
                              <Edit2 className="w-6 h-6" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditMatch(match)}
                            className="p-4 bg-white/5 hover:bg-cyan-600/20 text-white/40 hover:text-cyan-400 rounded-2xl border border-white/10 transition-all shadow-lg"
                            title="Edit Match"
                          >
                            <Edit2 className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this match?')) {
                                deleteMatch(match.id);
                              }
                            }}
                            className="p-4 bg-white/5 hover:bg-red-600/20 text-white/40 hover:text-red-400 rounded-2xl border border-white/10 transition-all shadow-lg"
                            title="Delete Match"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>

                      {/* Tournament Name Footer */}
                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Atom className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                          <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 uppercase tracking-[0.3em] italic">
                            {tournamentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Reaction ID:</span>
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{match.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Stats / Info */}
        <div className="space-y-6">
          {/* Live Dashboard (Only if Live Match Selected) */}
          <AnimatePresence>
            {selectedMatch?.status === 'Live' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1c26] rounded-[2.5rem] p-8 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                    <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
                    Live Dashboard
                  </h3>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse border border-red-500/30">
                    Live
                  </span>
                </div>

                {/* Score Controls */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { id: selectedMatch.teamAId, score: selectedMatch.scoreA || 0, wickets: selectedMatch.wicketsA || 0, overs: selectedMatch.oversA || '0.0', team: 'A' as const },
                    { id: selectedMatch.teamBId, score: selectedMatch.scoreB || 0, wickets: selectedMatch.wicketsB || 0, overs: selectedMatch.oversB || '0.0', team: 'B' as const }
                  ].map((t) => {
                    const team = getTeam(t.id);
                    return (
                      <div key={t.id} className="space-y-4 text-center p-4 bg-white/[0.02] rounded-3xl border border-white/5">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 p-2 border border-white/10">
                          <img src={team?.logoUrl || null} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-3xl font-black text-white italic">{t.score}/{t.wickets}</div>
                          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Overs: {t.overs}</div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleUpdateScore(selectedMatch.id, t.team, -1)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-black text-white/40 uppercase">Runs</span>
                            <button 
                              onClick={() => handleUpdateScore(selectedMatch.id, t.team, 1)}
                              className="w-8 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 border border-cyan-500/30 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleUpdateScore(selectedMatch.id, t.team, -1, 'wickets')}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-black text-white/40 uppercase">Wkts</span>
                            <button 
                              onClick={() => handleUpdateScore(selectedMatch.id, t.team, 1, 'wickets')}
                              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 border border-red-500/30 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <input 
                            type="text"
                            placeholder="Overs"
                            value={t.overs}
                            onChange={(e) => handleUpdateCricket(selectedMatch.id, t.team === 'A' ? { oversA: e.target.value } : { oversB: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-[10px] text-center text-white focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cricket Quick Actions */}
                <div className="space-y-4">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Ball-by-Ball Synthesis</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: '0', type: 'Dot', runs: 0 },
                      { label: '1', type: 'Single', runs: 1 },
                      { label: '2', type: 'Double', runs: 2 },
                      { label: '3', type: 'Triple', runs: 3 },
                      { label: '4', type: 'Four', runs: 4 },
                      { label: '6', type: 'Six', runs: 6 },
                      { label: 'W', type: 'Wicket', isWicket: true },
                      { label: 'WD', type: 'Wide', runs: 1, isExtra: true },
                      { label: 'NB', type: 'No Ball', runs: 1, isExtra: true },
                      { label: 'OV', type: 'Over' },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => addMatchEvent(selectedMatch.id, { 
                          type: btn.type as any, 
                          description: `${btn.label} recorded!`,
                          runs: btn.runs,
                          isWicket: btn.isWicket,
                          isExtra: btn.isExtra,
                          teamId: selectedMatch.scoreA !== undefined ? selectedMatch.teamAId : selectedMatch.teamBId // Simple logic for now
                        })}
                        className="py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[10px] font-black transition-all"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Streaming Integration */}
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Live Stream Link</p>
                    <input 
                      type="text"
                      placeholder="YouTube/Facebook Embed URL..."
                      value={selectedMatch.streamUrl || ''}
                      onChange={(e) => updateMatch(selectedMatch.id, { streamUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    {selectedMatch.streamUrl && (
                      <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                        <iframe 
                          src={selectedMatch.streamUrl}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Custom Update Input */}
                  <div className="pt-2 space-y-3">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Type live update..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            handleAddEvent(selectedMatch.id, 'Custom', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Zap size={12} className="text-cyan-400 opacity-50" />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => generateAICommentary(selectedMatch)}
                      disabled={isGeneratingAI}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                      )}
                      {isGeneratingAI ? 'Synthesizing...' : 'AI Synthesis Update'}
                    </button>
                    
                    <p className="text-[8px] text-white/20 ml-1 uppercase tracking-widest italic">AI will analyze match state and broadcast update</p>
                  </div>

                  {/* Run Chart */}
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Run Progression</p>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={(selectedMatch.events || []).filter(e => e.runs !== undefined).map((e, i) => ({ ball: i + 1, runs: e.runs }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="ball" stroke="#ffffff40" fontSize={10} />
                          <YAxis stroke="#ffffff40" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1c26', border: '1px solid #ffffff10', borderRadius: '8px' }}
                            itemStyle={{ color: '#22d3ee', fontSize: '10px' }}
                          />
                          <Line type="monotone" dataKey="runs" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Event History */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Recent Events</p>
                  <div className="space-y-3">
                    {selectedMatch.events?.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                          <span className="text-white text-xs font-bold">{event.type}</span>
                        </div>
                        <span className="text-white/30 text-[10px] font-medium">{event.time}</span>
                      </div>
                    ))}
                    {(!selectedMatch.events || selectedMatch.events.length === 0) && (
                      <p className="text-white/20 text-[10px] italic text-center py-2">No events recorded yet.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[#1a1c26] rounded-[2.5rem] border border-white/5 p-8 space-y-8">
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <Beaker className="w-3 h-3 text-emerald-400" />
              Lab Insights
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Live Reactions</p>
                  <p className="text-xl font-black text-white italic">{matches.filter(m => m.status === 'Live').length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Upcoming Synthesis</p>
                  <p className="text-xl font-black text-white italic">{matches.filter(m => m.status === 'Upcoming').length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Recent Graphics Generated</p>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white/20" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/60">Match Day Poster #{i}</p>
                      <p className="text-[8px] text-white/20 uppercase">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Match Modal */}
      <AnimatePresence>
        {isAddingMatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMatch(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#0f111a] rounded-[3rem] border border-white/10 p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500" />
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                  {editingMatchId ? 'Edit Reaction' : 'Setup New Reaction'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddingMatch(false);
                    setEditingMatchId(null);
                    setNewMatch({ teamAId: '', teamBId: '', date: '', time: '', venue: '', status: 'Upcoming' });
                  }} 
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddMatch} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Catalyst A (Team A)</label>
                    <select 
                      value={newMatch.teamAId}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, teamAId: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                    >
                      <option value="">Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Catalyst B (Team B)</label>
                    <select 
                      value={newMatch.teamBId}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, teamBId: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                    >
                      <option value="">Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Reaction Date</label>
                    <input 
                      type="date"
                      value={newMatch.date}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Reaction Time</label>
                    <input 
                      type="time"
                      value={newMatch.time}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Laboratory (Venue)</label>
                  <input 
                    type="text"
                    value={newMatch.venue}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="Enter Venue Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 transition-all active:scale-95 mt-4"
                >
                  {editingMatchId ? 'Update Reaction' : 'Synthesize Reaction'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Poster Preview Modal */}
      <AnimatePresence>
        {selectedMatch && posterType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedMatchId(null); setPosterType(null); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative flex flex-col lg:flex-row gap-8 max-w-6xl w-full"
            >
              {/* Poster Preview */}
              <div className="flex-1 flex items-center justify-center">
                <div 
                  ref={posterRef}
                  className="w-[600px] h-[600px] bg-[#0a0b10] relative overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
                >
                  {/* Chemistry Background Elements */}
                  <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0" 
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2322d3ee' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '50px 56px' }} />
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-transparent to-indigo-900/30 z-0" />
                  
                  {/* Animated Glows */}
                  <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                  <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />

                  {/* Tournament Logo */}
                  {tournamentLogo && (
                    <div className="absolute top-10 left-10 z-20">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-2 shadow-2xl">
                        <img src={tournamentLogo || null} className="w-full h-full object-cover rounded-xl" />
                      </div>
                    </div>
                  )}

                  {/* Poster Content based on Type */}
                  <div className="relative h-full w-full flex flex-col items-center justify-between p-12 z-10">
                    {posterType === 'match' && (
                      <>
                        <div className="flex flex-col items-center gap-4 w-full">
                          <div className="flex items-center gap-3">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
                            <span className="px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full backdrop-blur-md">
                              Match Day Synthesis
                            </span>
                            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
                          </div>
                          
                          <div className="relative group text-center max-w-[500px] mx-auto">
                            {/* Multi-layered Glow */}
                            <div className="absolute -inset-6 bg-cyan-500/10 rounded-full blur-3xl opacity-40 animate-pulse" />
                            
                            <h2 className="relative text-4xl font-black italic tracking-tighter uppercase leading-tight text-center break-words">
                              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30 drop-shadow-[0_15px_30px_rgba(6,182,212,0.5)]">
                                {tournamentName}
                              </span>
                            </h2>
                            
                            {/* Decorative Line */}
                            <div className="mt-2 flex items-center justify-center gap-2">
                              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-cyan-500" />
                              <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                              <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-cyan-500" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full gap-8 relative py-4">
                          {/* Central VS Glow */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/15 rounded-full blur-[50px] z-0 animate-pulse" />
                          
                          <div className="flex-1 text-center space-y-4 relative z-10">
                            <div className="w-36 h-36 rounded-[2.5rem] bg-white/5 border border-white/10 p-4 mx-auto flex items-center justify-center shadow-[0_25px_50px_rgba(0,0,0,0.6)] group overflow-hidden backdrop-blur-sm">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              {getTeam(selectedMatch.teamAId)?.logoUrl ? <img src={getTeam(selectedMatch.teamAId)?.logoUrl || null} className="w-full h-full object-contain p-2" /> : <Users className="w-12 h-12 text-white/20" />}
                            </div>
                            <p className="text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg line-clamp-2 px-2">{getTeam(selectedMatch.teamAId)?.name}</p>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className="w-20 h-20 rounded-full bg-[#0a0b10] border-4 border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] relative overflow-hidden group">
                              <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                              <span className="relative text-4xl font-black text-cyan-400 italic z-10">VS</span>
                            </div>
                          </div>

                          <div className="flex-1 text-center space-y-4 relative z-10">
                            <div className="w-36 h-36 rounded-[2.5rem] bg-white/5 border border-white/10 p-4 mx-auto flex items-center justify-center shadow-[0_25px_50px_rgba(0,0,0,0.6)] group overflow-hidden backdrop-blur-sm">
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              {getTeam(selectedMatch.teamBId)?.logoUrl ? <img src={getTeam(selectedMatch.teamBId)?.logoUrl || null} className="w-full h-full object-contain p-2" /> : <Users className="w-12 h-12 text-white/20" />}
                            </div>
                            <p className="text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg line-clamp-2 px-2">{getTeam(selectedMatch.teamBId)?.name}</p>
                          </div>
                        </div>

                        <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 grid grid-cols-3 gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                          <div className="text-center space-y-1">
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Reaction Date</p>
                            <p className="text-base font-black text-white italic tracking-tight">{selectedMatch.date}</p>
                          </div>
                          <div className="text-center border-x border-white/10 space-y-1">
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Reaction Time</p>
                            <p className="text-base font-black text-white italic tracking-tight">{selectedMatch.time}</p>
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Laboratory</p>
                            <p className="text-base font-black text-white italic tracking-tight line-clamp-2 px-2">{selectedMatch.venue}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {posterType === 'live' && (
                      <div className="w-full h-full flex flex-col items-center justify-between py-4">
                        {/* Header */}
                        <div className="flex flex-col items-center gap-4">
                          <div className="px-6 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-[0.5em] rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                            Live Synthesis
                          </div>
                          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase opacity-40">{tournamentName}</h2>
                        </div>

                        {/* Score Section */}
                        <div className="flex items-center justify-between w-full gap-4 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] z-0" />
                          
                          {/* Team A */}
                          <div className="flex-1 flex flex-col items-center gap-4 relative z-10">
                            <div className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 p-4 shadow-2xl backdrop-blur-md">
                              <img src={getTeam(selectedMatch.teamAId)?.logoUrl || null} className="w-full h-full object-contain" />
                            </div>
                            <p className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-2 w-full text-center">{getTeam(selectedMatch.teamAId)?.name}</p>
                            <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Overs: {selectedMatch.oversA || '0.0'}</span>
                            </div>
                          </div>

                          {/* Live Score */}
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className="flex items-center gap-6">
                              <motion.div 
                                key={`scoreA-${selectedMatch.scoreA}-${selectedMatch.wicketsA}`}
                                initial={{ scale: 1.5, color: '#22d3ee' }}
                                animate={{ scale: 1, color: '#ffffff' }}
                                className="flex items-baseline gap-1"
                              >
                                <span className="text-8xl font-black italic tracking-tighter drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                                  {selectedMatch.scoreA || 0}
                                </span>
                                <span className="text-4xl font-black text-cyan-400 italic">/{selectedMatch.wicketsA || 0}</span>
                              </motion.div>
                              <span className="text-4xl font-black text-white/20 italic">-</span>
                              <motion.div 
                                key={`scoreB-${selectedMatch.scoreB}-${selectedMatch.wicketsB}`}
                                initial={{ scale: 1.5, color: '#22d3ee' }}
                                animate={{ scale: 1, color: '#ffffff' }}
                                className="flex items-baseline gap-1"
                              >
                                <span className="text-8xl font-black italic tracking-tighter drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                                  {selectedMatch.scoreB || 0}
                                </span>
                                <span className="text-4xl font-black text-cyan-400 italic">/{selectedMatch.wicketsB || 0}</span>
                              </motion.div>
                            </div>
                          </div>

                          {/* Team B */}
                          <div className="flex-1 flex flex-col items-center gap-4 relative z-10">
                            <div className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 p-4 shadow-2xl backdrop-blur-md">
                              <img src={getTeam(selectedMatch.teamBId)?.logoUrl || null} className="w-full h-full object-contain" />
                            </div>
                            <p className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-2 w-full text-center">{getTeam(selectedMatch.teamBId)?.name}</p>
                            <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Overs: {selectedMatch.oversB || '0.0'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Latest Update Banner */}
                        {selectedMatch.events && selectedMatch.events.length > 0 && (
                          <motion.div 
                            key={selectedMatch.events[0].id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                          >
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                            </div>
                            <div className="text-left">
                              <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1">Latest Update — {selectedMatch.events[0].time}</p>
                              <p className="text-sm font-black text-white uppercase italic tracking-tight">{selectedMatch.events[0].description}</p>
                            </div>
                          </motion.div>
                        )}

                        {/* Recent Events List */}
                        <div className="w-full space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Recent Events</span>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedMatch.events?.slice(1, 4).map((event, idx) => (
                              <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={event.id} 
                                className="flex items-center justify-between px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                  <span className="text-sm font-black text-white uppercase italic tracking-tight">{event.type}</span>
                                  <span className="text-white/40 text-xs font-medium">— {event.description}</span>
                                </div>
                                <span className="text-cyan-400/60 text-[10px] font-black">{event.time}</span>
                              </motion.div>
                            ))}
                            {(!selectedMatch.events || selectedMatch.events.length <= 1) && (
                              <div className="text-center py-4 text-white/20 text-[10px] uppercase tracking-widest italic">
                                {selectedMatch.events?.length === 1 ? 'No previous events...' : 'Waiting for match events...'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Add other poster types here (toss, xi, result) */}
                    {posterType === 'toss' && (
                      <div className="w-full h-full flex flex-col items-center justify-center py-8 space-y-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="px-6 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-[0.5em] rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            Reaction Update
                          </div>
                          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{tournamentName}</h2>
                        </div>

                        <div className="relative group">
                          <div className="absolute -inset-8 bg-cyan-500/10 blur-[60px] rounded-full animate-pulse" />
                          <div className="relative w-48 h-48 rounded-[3rem] bg-white/5 border border-white/10 p-6 shadow-2xl backdrop-blur-md flex items-center justify-center">
                            <img src={getTeam(selectedMatch.teamAId)?.logoUrl || null} className="w-full h-full object-contain" />
                          </div>
                        </div>

                        <div className="text-center space-y-6 relative z-10">
                          <div className="space-y-2">
                            <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">Toss Synthesis</p>
                            <h3 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                              {getTeam(selectedMatch.teamAId)?.name} <br />
                              <span className="text-cyan-400">Won the Toss</span>
                            </h3>
                          </div>
                          <div className="inline-block px-10 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                            <p className="text-2xl font-black text-white uppercase italic tracking-widest">
                              Elected to <span className="text-emerald-400">Bat First</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {posterType === 'xi' && (
                      <div className="w-full h-full flex flex-col items-center py-6 space-y-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="px-4 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full">
                            Molecular Structure
                          </div>
                          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase opacity-40">{tournamentName}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-12 w-full px-4">
                          {/* Team A XI */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2">
                                <img src={getTeam(selectedMatch.teamAId)?.logoUrl || null} className="w-full h-full object-contain" />
                              </div>
                              <p className="text-lg font-black text-white uppercase italic tracking-tighter line-clamp-1">{getTeam(selectedMatch.teamAId)?.name}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {getTeam(selectedMatch.teamAId)?.players.slice(0, 11).map((pid, idx) => {
                                const p = players.find(player => player.id === pid);
                                return (
                                  <div key={pid} className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl">
                                    <span className="text-[10px] font-black text-cyan-500/40 italic">{idx + 1}</span>
                                    <p className="text-[11px] font-black text-white uppercase italic tracking-tight line-clamp-1">{p?.name}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Team B XI */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2">
                                <img src={getTeam(selectedMatch.teamBId)?.logoUrl || null} className="w-full h-full object-contain" />
                              </div>
                              <p className="text-lg font-black text-white uppercase italic tracking-tighter line-clamp-1">{getTeam(selectedMatch.teamBId)?.name}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {getTeam(selectedMatch.teamBId)?.players.slice(0, 11).map((pid, idx) => {
                                const p = players.find(player => player.id === pid);
                                return (
                                  <div key={pid} className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl">
                                    <span className="text-[10px] font-black text-cyan-500/40 italic">{idx + 1}</span>
                                    <p className="text-[11px] font-black text-white uppercase italic tracking-tight line-clamp-1">{p?.name}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {posterType === 'result' && (
                      <div className="w-full h-full flex flex-col items-center justify-center py-8 space-y-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="px-6 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-[0.5em] rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            Final Synthesis
                          </div>
                          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{tournamentName}</h2>
                        </div>

                        <div className="relative group">
                          <div className="absolute -inset-12 bg-emerald-500/20 blur-[80px] rounded-full animate-pulse" />
                          <div className="relative w-56 h-56 rounded-[3.5rem] bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-md flex items-center justify-center">
                            <img src={getTeam(selectedMatch.scoreA > selectedMatch.scoreB ? selectedMatch.teamAId : selectedMatch.teamBId)?.logoUrl || null} className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                          </div>
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-emerald-500 text-white font-black italic tracking-widest rounded-full shadow-2xl">
                            WINNER
                          </div>
                        </div>

                        <div className="text-center space-y-8 relative z-10">
                          <div className="space-y-2">
                            <h3 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none line-clamp-2 px-4">
                              {getTeam(selectedMatch.scoreA > selectedMatch.scoreB ? selectedMatch.teamAId : selectedMatch.teamBId)?.name}
                            </h3>
                            <p className="text-2xl font-black text-emerald-400 uppercase italic tracking-[0.2em] line-clamp-2 px-4">
                              {selectedMatch.scoreA > selectedMatch.scoreB 
                                ? `Won by ${selectedMatch.scoreA - selectedMatch.scoreB} Runs`
                                : `Won by ${10 - selectedMatch.wicketsB} Wickets`}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-center gap-6">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20" />
                            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                              <Trophy className="w-5 h-5 text-yellow-400" />
                              <div className="text-left">
                                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Man of the Match</p>
                                <p className="text-sm font-black text-white uppercase italic">Synthesis Pending</p>
                              </div>
                            </div>
                            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20" />
                          </div>
                        </div>
                      </div>
                    )}

                    {posterType !== 'match' && posterType !== 'live' && posterType !== 'toss' && posterType !== 'xi' && posterType !== 'result' && (
                      <div className="text-center space-y-4">
                        <Beaker className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
                        <h3 className="text-2xl font-black text-white uppercase italic">Synthesizing {posterType}...</h3>
                        <p className="text-white/40 text-xs uppercase tracking-widest">Template coming soon in next reaction</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Branding */}
                  <div className="absolute bottom-8 left-0 w-full px-12 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                      <Atom className="w-4 h-4 text-cyan-400" />
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">{tournamentName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest italic">Reaction HD</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full lg:w-80 space-y-6">
                <div className="bg-[#1a1c26] rounded-[2.5rem] border border-white/10 p-8 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Select Template</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'match', label: 'Match Day', icon: ImageIcon },
                        { id: 'toss', label: 'Toss Result', icon: Zap },
                        { id: 'xi', label: 'Playing XI', icon: Users },
                        { id: 'live', label: 'Live Score', icon: Radio },
                        { id: 'result', label: 'Final Result', icon: Trophy },
                      ].map(type => (
                        <button 
                          key={type.id}
                          onClick={() => setPosterType(type.id as any)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                            posterType === type.id 
                              ? "bg-cyan-600/10 border-cyan-500/50 text-cyan-400" 
                              : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                          )}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-[8px] font-bold uppercase">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Actions</h4>
                    <button 
                      onClick={handleDownload}
                      className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      Download HD
                    </button>
                    <button 
                      onClick={() => { setSelectedMatchId(null); setPosterType(null); }}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-2xl font-black uppercase tracking-widest transition-all"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Match Stats Modal */}
      <AnimatePresence>
        {showStatsModalFor && matches.find(m => m.id === showStatsModalFor) && (
          <MatchStatsModal 
            match={matches.find(m => m.id === showStatsModalFor)!} 
            onClose={() => setShowStatsModalFor(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
