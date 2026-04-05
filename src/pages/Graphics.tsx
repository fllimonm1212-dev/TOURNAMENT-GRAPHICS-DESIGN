import React, { useRef, useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Player, Team } from '../types';
import { toPng } from 'html-to-image';
import { 
  Download, 
  Share2, 
  ImageIcon, 
  Layout, 
  Palette, 
  Type,
  Check,
  ChevronRight,
  Sparkles,
  Shield,
  Atom,
  Archive,
  Presentation,
  Trophy,
  ListOrdered,
  Users,
  Maximize2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { SoldCardTemplate } from '../components/SoldCardTemplate';
import { HDCardTemplate } from '../components/HDCardTemplate';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import pptxgen from 'pptxgenjs';

export default function Graphics() {
  const { players, teams, history, matches, tournamentLogo, tournamentName } = useTournament();
  const [selectedType, setSelectedType] = useState<'sold' | 'match' | 'squad' | 'bulk' | 'mvp' | 'standings' | 'hd-card'>('sold');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('#06b6d4'); // Default cyan
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number, total: number, status: string } | null>(null);
  
  // MVP Stats State
  const [mvpRuns, setMvpRuns] = useState<string>('');
  const [mvpWickets, setMvpWickets] = useState<string>('');
  const [mvpImpact, setMvpImpact] = useState<string>('100%');

  const posterRef = useRef<HTMLDivElement>(null);
  const hiddenBulkRef = useRef<HTMLDivElement>(null);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  const handleDownload = async () => {
    if (posterRef.current === null) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `tournament-poster-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkExport = async (type: 'zip' | 'pptx') => {
    if (!selectedTeamId) return;
    setIsGenerating(true);
    
    let exportPlayers: Player[] = [];
    let exportName = '';
    
    if (selectedTeamId === 'all') {
      exportPlayers = players;
      exportName = 'All_Registered_Players';
    } else {
      const team = teams.find(t => t.id === selectedTeamId);
      if (!team) {
        setIsGenerating(false);
        return;
      }
      exportPlayers = team.players.map(pid => players.find(p => p.id === pid)).filter(Boolean) as Player[];
      exportName = team.name.replace(/[^a-z0-9]/gi, '_');
    }

    setBulkProgress({ current: 0, total: exportPlayers.length, status: 'Initializing...' });

    try {
      const zip = new JSZip();
      const pres = new pptxgen();
      
      // Setup PPTX
      pres.defineLayout({ name: 'PORTRAIT_CARD', width: 4, height: 6.5 });
      pres.layout = 'PORTRAIT_CARD';
      pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: '0a0b10' },
      });

      for (let i = 0; i < exportPlayers.length; i++) {
        const player = exportPlayers[i];
        setBulkProgress({ current: i + 1, total: exportPlayers.length, status: `Rendering ${player.name}...` });
        
        // Wait a tiny bit for React to render the hidden element if needed, though it should be there
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const elementId = `bulk-card-${player.id}`;
        const element = document.getElementById(elementId);
        
        if (element) {
          const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 });
          
          if (type === 'zip') {
            // Remove the data:image/png;base64, part
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            zip.file(`${player.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_sold.png`, base64Data, { base64: true });
          } else if (type === 'pptx') {
            const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
            
            // Add background effects to slide
            slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '0a0b10' } });
            
            // Add the player card image (full slide)
            slide.addImage({
              data: dataUrl,
              x: 0,
              y: 0,
              w: '100%',
              h: '100%',
              sizing: { type: 'contain', w: '100%', h: '100%' }
            });
          }
        }
      }

      setBulkProgress({ current: exportPlayers.length, total: exportPlayers.length, status: 'Finalizing file...' });

      if (type === 'zip') {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${exportName}_Cards.zip`);
      } else if (type === 'pptx') {
        await pres.writeFile({ fileName: `${exportName}_Presentation.pptx` });
      }

    } catch (err) {
      console.error('Bulk export failed:', err);
      alert('Failed to generate bulk export. Please try again.');
    } finally {
      setIsGenerating(false);
      setBulkProgress(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Graphics Generator</h2>
          <p className="text-white/50 mt-1">Automated HD poster generation for your tournament.</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={
            (selectedType === 'sold' && !selectedPlayerId) || 
            (selectedType === 'hd-card' && !selectedPlayerId) || 
            (selectedType === 'mvp' && !selectedPlayerId) || 
            (selectedType === 'squad' && !selectedTeamId) || 
            (selectedType === 'match' && !selectedMatchId) ||
            selectedType === 'bulk' ||
            isGenerating
          }
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all",
            selectedType === 'bulk' && "hidden"
          )}
        >
          {isGenerating ? <Sparkles className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          <span>{isGenerating ? 'Generating...' : 'Download HD Poster'}</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Configuration */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#1a1c26] rounded-3xl p-6 border border-white/5 space-y-8">
            {/* Template Type */}
            <div className="space-y-4">
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Layout className="w-3.5 h-3.5" />
                Select Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sold', label: 'Sold Card', icon: Sparkles },
                  { id: 'hd-card', label: 'HD Card', icon: Maximize2 },
                  { id: 'match', label: 'Match Day', icon: ImageIcon },
                  { id: 'squad', label: 'Playing 11', icon: Users },
                  { id: 'mvp', label: 'MVP', icon: Trophy },
                  { id: 'standings', label: 'Standings', icon: ListOrdered },
                  { id: 'bulk', label: 'Bulk Export', icon: Archive },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as any)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                      selectedType === type.id 
                        ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-400" 
                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                    )}
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Selection */}
            <div className="space-y-4">
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Select Data
              </label>
              
              {(selectedType === 'sold' || selectedType === 'mvp' || selectedType === 'hd-card') && (
                <select 
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                >
                  <option value="">Select Player</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                  ))}
                </select>
              )}

              {selectedType === 'mvp' && (
                <div className="space-y-4 mt-4">
                  <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5" />
                    MVP Stats
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-[10px] uppercase mb-1 block">Runs</label>
                      <input 
                        type="text" 
                        value={mvpRuns} 
                        onChange={(e) => setMvpRuns(e.target.value)}
                        placeholder="e.g. 85*"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px] uppercase mb-1 block">Wickets</label>
                      <input 
                        type="text" 
                        value={mvpWickets} 
                        onChange={(e) => setMvpWickets(e.target.value)}
                        placeholder="e.g. 3/24"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-white/40 text-[10px] uppercase mb-1 block">Impact / Other</label>
                      <input 
                        type="text" 
                        value={mvpImpact} 
                        onChange={(e) => setMvpImpact(e.target.value)}
                        placeholder="e.g. 100%"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedType === 'squad' && (
                <select 
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                >
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}

              {selectedType === 'standings' && (
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 text-sm">
                  Standings poster will be generated automatically based on current tournament data.
                </div>
              )}

              {selectedType === 'bulk' && (
                <select 
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                >
                  <option value="">Select Target to Export</option>
                  <option value="all">All Registered Players</option>
                  <optgroup label="By Team">
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                </select>
              )}

              {selectedType === 'match' && (
                <select 
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                >
                  <option value="">Select Match</option>
                  {matches.map(m => {
                    const teamA = teams.find(t => t.id === m.teamAId);
                    const teamB = teams.find(t => t.id === m.teamBId);
                    return (
                      <option key={m.id} value={m.id}>
                        {teamA?.name || 'TBD'} vs {teamB?.name || 'TBD'}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Customization */}
            <div className="space-y-4">
              <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Theme & Style
              </label>
              <div className="flex gap-3">
                {['#06b6d4', '#4f46e5', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                  <button 
                    key={color}
                    onClick={() => setSelectedTheme(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 shadow-lg transition-transform",
                      selectedTheme === color ? "border-white scale-110" : "border-[#1a1c26] hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="col-span-12 lg:col-span-8 flex flex-col items-center justify-center bg-[#0a0b10] rounded-3xl border border-white/5 p-12 min-h-[700px]">
          <div className="relative group">
            {/* The Poster Container (1:1 Aspect Ratio for Social Media) */}
            <div 
              ref={posterRef}
              className={cn(
                "bg-[#0a0b10] relative overflow-hidden shadow-2xl border border-white/10",
                (selectedType === 'sold' || selectedType === 'mvp' || selectedType === 'hd-card') ? "w-[400px] h-[650px]" : 
                (selectedType === 'match' || selectedType === 'standings') ? "w-[500px] h-[650px]" : "w-[500px] h-[500px]"
              )}
            >
              {selectedType === 'sold' && selectedPlayer ? (
                <SoldCardTemplate 
                  player={selectedPlayer} 
                  team={selectedTeam} 
                  tournamentName={tournamentName} 
                  tournamentLogo={tournamentLogo} 
                  themeColor={selectedTheme} 
                />
              ) : selectedType === 'hd-card' && selectedPlayer ? (
                <HDCardTemplate 
                  player={selectedPlayer} 
                  tournamentName={tournamentName} 
                  tournamentLogo={tournamentLogo} 
                  themeColor={selectedTheme} 
                />
              ) : selectedType === 'squad' && selectedTeam ? (
                <div className="w-full h-full relative bg-[#0a0b10] flex flex-col p-8 overflow-hidden select-none">
                  {/* Background Effects */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${selectedTheme}40 0%, transparent 70%)` }}
                  />
                  
                  {/* Chemistry Background Elements */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 44px' }} />

                  {/* Large Background Team Name Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none w-full text-center">
                    <h1 
                      className="text-[120px] font-black italic leading-none opacity-[0.02] tracking-tighter uppercase whitespace-nowrap"
                      style={{ WebkitTextStroke: `2px ${selectedTheme}` }}
                    >
                      {selectedTeam.name}
                    </h1>
                  </div>

                  {/* Transparent Logo Watermark */}
                  {tournamentLogo && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                      <img 
                        crossOrigin="anonymous" 
                        src={tournamentLogo || null} 
                        alt="" 
                        className="w-[70%] h-[70%] object-contain grayscale"
                      />
                    </div>
                  )}

                  {/* Header Section */}
                  <div className="relative z-10 flex flex-col items-center mb-10">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 p-4 flex items-center justify-center mb-4 shadow-2xl backdrop-blur-md">
                      {selectedTeam.logoUrl ? (
                        <img crossOrigin="anonymous" src={selectedTeam.logoUrl || null} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Shield className="w-12 h-12" style={{ color: selectedTheme }} />
                      )}
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 drop-shadow-lg">
                      {selectedTeam.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="h-px w-8 bg-white/20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: selectedTheme }}>OFFICIAL SQUAD</p>
                      <div className="h-px w-8 bg-white/20" />
                    </div>
                  </div>

                  {/* Players Grid */}
                  <div className="relative z-10 flex-1 grid grid-cols-2 gap-x-6 gap-y-4 content-start px-4">
                    {selectedTeam.players.slice(0, 11).map((pid: string, index: number) => {
                      const p = players.find(player => player.id === pid);
                      if (!p) return null;
                      
                      return (
                        <div key={pid} className="flex items-center gap-4 group">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-[#1a1c26] shadow-lg transition-transform group-hover:scale-110">
                              <img 
                                crossOrigin="anonymous"
                                src={p.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute -top-1 -left-1 w-5 h-5 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center text-[8px] font-black text-white italic">
                              {index + 1}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 border-b border-white/5 pb-1 group-hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-black text-sm uppercase tracking-tight truncate">{p.name}</p>
                              {index === 0 && <Trophy className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest truncate">{p.role}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Branding */}
                  <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex justify-between items-center px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center">
                        <img crossOrigin="anonymous" src={tournamentLogo || `https://api.dicebear.com/7.x/initials/svg?seed=CCC`} alt="" className="w-full h-full object-contain rounded-sm" />
                      </div>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{tournamentName}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-30">
                      <Atom className="w-3 h-3 text-white" />
                      <span className="text-[7px] font-black text-white uppercase tracking-[0.3em]">CHEMISTRY DEPT</span>
                    </div>
                  </div>
                </div>
              ) : selectedType === 'match' && selectedMatch ? (
                <div className="w-full h-full relative bg-[#0a0b10] flex flex-col items-center justify-center p-8 overflow-hidden select-none">
                  {/* Background Effects */}
                  <div 
                    className="absolute inset-0 opacity-30" 
                    style={{ background: `radial-gradient(circle at 50% 50%, ${selectedTheme}40 0%, transparent 70%)` }}
                  />
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 44px' }} />

                  {/* Large Background VS Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
                    <h1 
                      className="text-[300px] font-black italic leading-none opacity-[0.03] tracking-tighter uppercase"
                      style={{ WebkitTextStroke: `4px ${selectedTheme}` }}
                    >
                      VS
                    </h1>
                  </div>

                  {/* Top Center Tournament Branding */}
                  <div className="absolute top-10 left-0 right-0 z-10 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-2xl">
                      <img crossOrigin="anonymous" src={tournamentLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${tournamentName}`} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div className="flex flex-col items-center">
                      <h2 className="text-white font-black italic uppercase tracking-[0.3em] text-[10px] text-center opacity-60">
                        {tournamentName}
                      </h2>
                      <div className="h-0.5 w-12 bg-white/20 mt-1" />
                    </div>
                  </div>

                  {/* Match Day Title */}
                  <div className="relative z-10 mb-12 text-center">
                    <h1 
                      className="text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl"
                    >
                      MATCH DAY
                    </h1>
                    <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full mt-3 backdrop-blur-sm">
                      <p className="font-black tracking-[0.4em] uppercase text-[9px]" style={{ color: selectedTheme }}>
                        {selectedMatch.round || 'GROUP STAGE'}
                      </p>
                    </div>
                  </div>

                  {/* Teams VS Section */}
                  <div className="relative z-10 flex items-center justify-center gap-12 w-full px-12">
                    {/* Team A */}
                    {(() => {
                      const teamA = teams.find(t => t.id === selectedMatch.teamAId);
                      return (
                        <div className="flex-1 flex flex-col items-center gap-6 group">
                          <div className="w-36 h-36 rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-center shadow-2xl backdrop-blur-md transition-transform group-hover:scale-105">
                            {teamA?.logoUrl ? (
                              <img crossOrigin="anonymous" src={teamA.logoUrl || null} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
                            ) : (
                              <Shield className="w-16 h-16 text-white/10" />
                            )}
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-black text-white uppercase leading-tight tracking-tighter">
                              {teamA?.name || 'TBD'}
                            </h3>
                            <div className="h-1 w-8 bg-white/20 mx-auto mt-2 rounded-full" />
                          </div>
                        </div>
                      );
                    })()}

                    {/* VS Badge */}
                    <div className="shrink-0 relative">
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rotate-45"
                      >
                        <span className="text-2xl font-black text-white italic -rotate-45 tracking-tighter">VS</span>
                      </div>
                      <div className="absolute inset-0 blur-2xl opacity-50 -z-10" style={{ backgroundColor: selectedTheme }} />
                    </div>

                    {/* Team B */}
                    {(() => {
                      const teamB = teams.find(t => t.id === selectedMatch.teamBId);
                      return (
                        <div className="flex-1 flex flex-col items-center gap-6 group">
                          <div className="w-36 h-36 rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-center shadow-2xl backdrop-blur-md transition-transform group-hover:scale-105">
                            {teamB?.logoUrl ? (
                              <img crossOrigin="anonymous" src={teamB.logoUrl || null} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
                            ) : (
                              <Shield className="w-16 h-16 text-white/10" />
                            )}
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-black text-white uppercase leading-tight tracking-tighter">
                              {teamB?.name || 'TBD'}
                            </h3>
                            <div className="h-1 w-8 bg-white/20 mx-auto mt-2 rounded-full" />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Match Details Footer */}
                  <div className="relative z-10 mt-16 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-8 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: selectedTheme }} />
                        <span className="text-xs font-black text-white uppercase tracking-widest">{selectedMatch.date || 'TBD'}</span>
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: selectedTheme }} />
                        <span className="text-xs font-black text-white uppercase tracking-widest">{selectedMatch.time || 'TBD'}</span>
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: selectedTheme }} />
                        <span className="text-xs font-black text-white uppercase tracking-widest">{selectedMatch.venue || 'TBD'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-30">
                      <Atom className="w-3 h-3 text-white" />
                      <span className="text-[7px] font-black text-white uppercase tracking-[0.4em]">CHEMISTRY DEPARTMENT • OFFICIAL BROADCAST</span>
                    </div>
                  </div>
                </div>
              ) : selectedType === 'mvp' && selectedPlayer ? (
                <div className="w-full h-full relative bg-[#0a0b10] flex flex-col items-center justify-between p-6">
                  {/* Background Effects */}
                  <div 
                    className="absolute inset-0" 
                    style={{ background: `linear-gradient(to bottom, ${selectedTheme}40, #0a0b10, ${selectedTheme}20)` }}
                  />
                  
                  {/* Hexagon / Benzene Pattern */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2322d3ee' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 44px' }} />

                  {/* Large Background "MVP" Text */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
                    <h1 
                      className="text-[200px] font-black italic leading-none opacity-[0.03] tracking-tighter"
                      style={{ WebkitTextStroke: `2px ${selectedTheme}` }}
                    >
                      MVP
                    </h1>
                  </div>

                  {/* Transparent Logo Watermark */}
                  {tournamentLogo && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                      <img 
                        crossOrigin="anonymous" 
                        src={tournamentLogo || null} 
                        alt="" 
                        className="w-[70%] h-[70%] object-contain grayscale"
                      />
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="relative z-10 w-full flex justify-between items-start">
                    <div className="flex flex-col">
                      <h2 className="text-white/70 font-bold italic uppercase tracking-widest text-[10px]">
                        {tournamentName}
                      </h2>
                      <p className="font-black tracking-[0.2em] uppercase text-xs mt-1" style={{ color: selectedTheme }}>
                        PLAYER OF THE MATCH
                      </p>
                    </div>
                    {tournamentLogo && (
                      <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-white/5">
                        <img crossOrigin="anonymous" src={tournamentLogo || null} alt="Logo" className="w-full h-full object-contain rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Player Image (Cutout Style) */}
                  <div className="relative z-10 flex-1 w-full flex items-end justify-center mt-4">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Trophy className="w-64 h-64" style={{ color: selectedTheme }} />
                    </div>
                    <div className="relative w-full h-full flex items-end justify-center">
                      <img 
                        crossOrigin="anonymous"
                        src={selectedPlayer.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPlayer.name}`} 
                        alt="" 
                        className="max-h-full object-contain drop-shadow-2xl z-20"
                      />
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="relative z-10 w-full mt-4 flex flex-col items-center text-center">
                    <div 
                      className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-3 border border-white/20 backdrop-blur-md"
                      style={{ backgroundColor: `${selectedTheme}20`, color: selectedTheme }}
                    >
                      MATCH PERFORMANCE
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 drop-shadow-lg">
                      {selectedPlayer.name}
                    </h1>
                    <p className="text-white/60 font-bold uppercase tracking-widest text-xs">
                      {selectedTeam?.name || 'Star Player'}
                    </p>
                  </div>

                  {/* Stats Footer */}
                  <div className="relative z-10 w-full mt-6 grid grid-cols-3 gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-md">
                      <span className="text-white/40 text-[8px] uppercase font-bold tracking-widest mb-1">Runs</span>
                      <span className="text-white font-black text-xl leading-none">{mvpRuns || '--'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-md">
                      <span className="text-white/40 text-[8px] uppercase font-bold tracking-widest mb-1">Wickets</span>
                      <span className="text-white font-black text-xl leading-none">{mvpWickets || '--'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-md">
                      <span className="text-white/40 text-[8px] uppercase font-bold tracking-widest mb-1">Impact</span>
                      <span className="text-white font-black text-xl leading-none" style={{ color: selectedTheme }}>{mvpImpact || '--'}</span>
                    </div>
                  </div>
                </div>
              ) : selectedType === 'standings' ? (
                <div className="w-full h-full relative bg-[#0a0b10] flex flex-col p-8">
                  {/* Background Effects */}
                  <div 
                    className="absolute inset-0" 
                    style={{ background: `linear-gradient(to bottom right, ${selectedTheme}20, #0a0b10, ${selectedTheme}10)` }}
                  />
                  
                  {/* Hexagon / Benzene Pattern */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2322d3ee' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 44px' }} />
                  
                  {/* Transparent Logo Watermark */}
                  {tournamentLogo && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                      <img 
                        crossOrigin="anonymous" 
                        src={tournamentLogo || null} 
                        alt="" 
                        className="w-[70%] h-[70%] object-contain grayscale"
                      />
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="relative z-10 flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                    <div>
                      <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        STANDINGS
                      </h1>
                      <p className="font-bold tracking-[0.3em] uppercase text-xs mt-2" style={{ color: selectedTheme }}>
                        {tournamentName}
                      </p>
                    </div>
                    {tournamentLogo && (
                      <div className="w-16 h-16 rounded-full border border-white/20 overflow-hidden bg-white/5">
                        <img crossOrigin="anonymous" src={tournamentLogo || null} alt="Logo" className="w-full h-full object-contain rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Table Header */}
                  <div className="relative z-10 flex items-center px-4 py-2 mb-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    <div className="w-8 text-center">#</div>
                    <div className="flex-1">Team</div>
                    <div className="w-12 text-center">P</div>
                    <div className="w-12 text-center">W</div>
                    <div className="w-12 text-center">PTS</div>
                  </div>

                  {/* Teams List */}
                  <div className="relative z-10 flex flex-col gap-3">
                    {teams.slice(0, 7).map((team, index) => (
                      <div 
                        key={team.id} 
                        className="flex items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm"
                      >
                        <div className="w-8 text-center font-black text-white/50 text-sm">{index + 1}</div>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 p-1 flex items-center justify-center">
                            {team.logoUrl ? (
                              <img crossOrigin="anonymous" src={team.logoUrl || null} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Shield className="w-4 h-4 text-white/40" />
                            )}
                          </div>
                          <span className="text-white font-bold text-sm uppercase tracking-wider truncate">{team.name}</span>
                        </div>
                        <div className="w-12 text-center text-white/60 font-bold text-sm">0</div>
                        <div className="w-12 text-center text-white/60 font-bold text-sm">0</div>
                        <div className="w-12 text-center font-black text-sm" style={{ color: selectedTheme }}>0</div>
                      </div>
                    ))}
                    {teams.length === 0 && (
                      <div className="text-center text-white/40 text-sm py-8">No teams available</div>
                    )}
                  </div>
                </div>
              ) : selectedType === 'bulk' ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Archive className="w-12 h-12 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Bulk Export</h4>
                    <p className="text-white/40 text-sm mt-2 max-w-sm mx-auto">
                      Generate individual high-resolution player cards for an entire team at once.
                    </p>
                  </div>

                  {selectedTeamId ? (
                    <div className="space-y-4 w-full max-w-xs">
                      <button 
                        onClick={() => handleBulkExport('zip')}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl font-bold transition-all"
                      >
                        {isGenerating && bulkProgress ? <Sparkles className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        <span>Download ZIP Archive</span>
                      </button>
                      <button 
                        onClick={() => handleBulkExport('pptx')}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        {isGenerating && bulkProgress ? <Sparkles className="w-5 h-5 animate-spin" /> : <Presentation className="w-5 h-5" />}
                        <span>Generate PPTX</span>
                      </button>

                      {bulkProgress && (
                        <div className="mt-6 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-white/60">
                            <span>{bulkProgress.status}</span>
                            <span>{bulkProgress.current} / {bulkProgress.total}</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 transition-all duration-300"
                              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 text-sm">
                      Please select an export target from the left panel first.
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-white/20" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Preview Your Design</h4>
                    <p className="text-white/40 text-sm mt-2">Select a template and data to see the live preview here.</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Preview Controls Overlay */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                HD PREVIEW (1080x1080)
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden Container for Bulk Rendering */}
      <div 
        ref={hiddenBulkRef}
        className="fixed top-[-10000px] left-[-10000px] opacity-0 pointer-events-none"
      >
        {selectedType === 'bulk' && selectedTeamId && (selectedTeamId === 'all' ? players : (selectedTeam?.players.map(pid => players.find(p => p.id === pid)).filter(Boolean) as Player[] || [])).map(p => {
          const playerTeam = teams.find(t => t.players.includes(p.id));
          return (
            <div key={p.id} id={`bulk-card-${p.id}`}>
              <SoldCardTemplate 
                player={p} 
                team={playerTeam} 
                tournamentName={tournamentName} 
                tournamentLogo={tournamentLogo} 
                themeColor={selectedTheme} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
