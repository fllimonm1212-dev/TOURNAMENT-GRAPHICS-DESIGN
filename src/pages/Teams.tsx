import React, { useState, useRef } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Player, PlayerRole } from '../types';
import { toPng } from 'html-to-image';
import PlayerCard from '../components/PlayerCard';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Plus, 
  Trash2, 
  Edit2, 
  Search,
  Filter,
  DollarSign,
  Image as ImageIcon,
  Download,
  X,
  Sparkles,
  Atom,
  Archive,
  Presentation
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import pptxgen from 'pptxgenjs';

export default function Teams() {
  const { 
    players, 
    teams, 
    addPlayer, 
    updatePlayer, 
    deletePlayer, 
    addTeam, 
    updateTeam, 
    deleteTeam, 
    tournamentName, 
    tournamentLogo,
    isGoldenMode,
    setGoldenMode
  } = useTournament();
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [showBulkExportModal, setShowBulkExportModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number, total: number, status: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const teamCardRef = useRef<HTMLDivElement>(null);
  const hiddenBulkPlayerRef = useRef<HTMLDivElement>(null);
  const hiddenBulkTeamRef = useRef<HTMLDivElement>(null);

  // Form States
  const [playerForm, setPlayerForm] = useState({
    name: '',
    age: 20,
    role: 'Batsman' as PlayerRole,
    category: 'Silver' as import('../types').PlayerCategory,
    basePrice: 1000000,
    photoUrl: ''
  });

  const categoryPrices: Record<string, number> = {
    'Iconic': 7000000,
    'Platinum': 5000000,
    'Gold': 3000000,
    'Silver': 1000000
  };

  const handleCategoryChange = (category: any) => {
    setPlayerForm({
      ...playerForm,
      category,
      basePrice: categoryPrices[category] || 1000000
    });
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, // Higher resolution
        backgroundColor: isTransparent ? null : '#000000',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `player-card-${selectedPlayer?.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadTeamCard = async () => {
    if (!teamCardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(teamCardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        backgroundColor: '#0a0b10',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `team-squad-${selectedTeam?.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadElement = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(element, { 
        cacheBust: true, 
        pixelRatio: 3,
        backgroundColor: '#000000',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await resizeImage(file, 400, 400);
        setPlayerForm({ ...playerForm, photoUrl: compressedDataUrl });
      } catch (err) {
        console.error('Error compressing image', err);
      }
    }
  };

  const handleOwnerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await resizeImage(file, 400, 400);
        setTeamForm({ ...teamForm, ownerPhotoUrl: compressedDataUrl });
      } catch (err) {
        console.error('Error compressing image', err);
      }
    }
  };

  const handleManagerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await resizeImage(file, 400, 400);
        setTeamForm({ ...teamForm, managerPhotoUrl: compressedDataUrl });
      } catch (err) {
        console.error('Error compressing image', err);
      }
    }
  };

  const handleTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await resizeImage(file, 400, 400);
        setTeamForm({ ...teamForm, logoUrl: compressedDataUrl });
      } catch (err) {
        console.error('Error compressing image', err);
      }
    }
  };

  const [teamForm, setTeamForm] = useState({
    name: '',
    owner: '',
    ownerPhotoUrl: '',
    manager: '',
    managerPhotoUrl: '',
    logoUrl: '',
    budget: 100000000
  });

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlayerId) {
      updatePlayer(editingPlayerId, playerForm);
    } else {
      addPlayer(playerForm);
    }
    setShowPlayerModal(false);
    setEditingPlayerId(null);
    setPlayerForm({ name: '', age: 20, role: 'Batsman' as PlayerRole, category: 'Silver' as import('../types').PlayerCategory, basePrice: 1000000, photoUrl: '' });
  };

  const handleEditPlayer = (player: Player) => {
    setPlayerForm({
      name: player.name,
      age: player.age,
      role: player.role,
      category: player.category || 'Silver',
      basePrice: player.basePrice,
      photoUrl: player.photoUrl
    });
    setEditingPlayerId(player.id);
    setShowPlayerModal(true);
  };

  const handleDeletePlayer = (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      deletePlayer(id);
    }
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeamId) {
      updateTeam(editingTeamId, teamForm);
    } else {
      addTeam(teamForm);
    }
    setShowTeamModal(false);
    setEditingTeamId(null);
    setTeamForm({ name: '', owner: '', ownerPhotoUrl: '', manager: '', managerPhotoUrl: '', logoUrl: '', budget: 100000 });
  };

  const handleEditTeam = (team: any) => {
    setTeamForm({
      name: team.name,
      owner: team.owner,
      ownerPhotoUrl: team.ownerPhotoUrl || '',
      manager: team.manager || '',
      managerPhotoUrl: team.managerPhotoUrl || '',
      logoUrl: team.logoUrl || '',
      budget: team.budget
    });
    setEditingTeamId(team.id);
    setShowTeamModal(true);
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      deleteTeam(id);
    }
  };

  const handleBulkExportPlayers = async (type: 'zip' | 'pptx') => {
    setIsDownloading(true);
    setBulkProgress({ current: 0, total: players.length, status: 'Initializing...' });

    try {
      const zip = new JSZip();
      const pres = new pptxgen();
      
      pres.defineLayout({ name: 'PORTRAIT_CARD', width: 4, height: 6.5 });
      pres.layout = 'PORTRAIT_CARD';
      pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: '0a0b10' },
      });

      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        setBulkProgress({ current: i + 1, total: players.length, status: `Rendering ${player.name}...` });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const elementId = `bulk-player-card-${player.id}`;
        const element = document.getElementById(elementId);
        
        if (element) {
          const dataUrl = await toPng(element, { 
            cacheBust: true, 
            pixelRatio: 2,
            backgroundColor: '#0a0b10',
            style: { transform: 'scale(1)', transformOrigin: 'top left' }
          });
          
          if (type === 'zip') {
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            zip.file(`${player.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_card.png`, base64Data, { base64: true });
          } else if (type === 'pptx') {
            const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
            slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '0a0b10' } });
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

      setBulkProgress({ current: players.length, total: players.length, status: 'Finalizing file...' });

      if (type === 'zip') {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `All_Player_Cards.zip`);
      } else if (type === 'pptx') {
        await pres.writeFile({ fileName: `All_Player_Cards.pptx` });
      }

    } catch (err) {
      console.error('Bulk export failed:', err);
      alert('Failed to generate bulk export. Please try again.');
    } finally {
      setIsDownloading(false);
      setBulkProgress(null);
      setShowBulkExportModal(false);
    }
  };

  const handleBulkExportTeams = async (type: 'zip' | 'pptx') => {
    setIsDownloading(true);
    setBulkProgress({ current: 0, total: teams.length, status: 'Initializing...' });

    try {
      const zip = new JSZip();
      const pres = new pptxgen();
      
      pres.defineLayout({ name: 'LANDSCAPE_CARD', width: 10, height: 5.625 });
      pres.layout = 'LANDSCAPE_CARD';
      pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: '0a0b10' },
      });

      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        setBulkProgress({ current: i + 1, total: teams.length, status: `Rendering ${team.name}...` });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const elementId = `bulk-team-card-${team.id}`;
        const element = document.getElementById(elementId);
        
        if (element) {
          const dataUrl = await toPng(element, { 
            cacheBust: true, 
            pixelRatio: 2,
            backgroundColor: '#0a0b10',
            style: { transform: 'scale(1)', transformOrigin: 'top left' }
          });
          
          if (type === 'zip') {
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            zip.file(`${team.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_squad.png`, base64Data, { base64: true });
          } else if (type === 'pptx') {
            const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
            slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '0a0b10' } });
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

      setBulkProgress({ current: teams.length, total: teams.length, status: 'Finalizing file...' });

      if (type === 'zip') {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `All_Team_Squads.zip`);
      } else if (type === 'pptx') {
        await pres.writeFile({ fileName: `All_Team_Squads.pptx` });
      }

    } catch (err) {
      console.error('Bulk export failed:', err);
      alert('Failed to generate bulk export. Please try again.');
    } finally {
      setIsDownloading(false);
      setBulkProgress(null);
      setShowBulkExportModal(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Teams & Players</h2>
          <p className="text-white/50 mt-1">Manage your tournament roster and team franchises.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Golden Mode Toggle */}
          <button 
            onClick={() => setGoldenMode(!isGoldenMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border shadow-lg",
              isGoldenMode 
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-yellow-500/10" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            )}
          >
            <Sparkles className={cn("w-5 h-5", isGoldenMode && "animate-pulse")} />
            <span className="text-xs uppercase tracking-widest">Golden Mode</span>
          </button>

          <button 
            onClick={() => setShowBulkExportModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
          >
            <Archive className="w-5 h-5" />
            <span>Bulk Export</span>
          </button>
          <div className="flex bg-[#1a1c26] p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('players')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'players' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-white/40 hover:text-white"
              )}
            >
              Players
            </button>
            <button 
              onClick={() => setActiveTab('teams')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'teams' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-white/40 hover:text-white"
              )}
            >
              Teams
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'players' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search players..." 
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowWatermark(!showWatermark)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border",
                  showWatermark ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-[#1a1c26] border-white/10 text-white/40 hover:text-white"
                )}
              >
                <ImageIcon className="w-4 h-4" />
                <span>With Logo Card</span>
              </button>
              <button 
                onClick={() => setShowPlayerModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                <span>Register Player</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {players.map((player) => (
              <div key={player.id} className="flex flex-col gap-4">
                <div 
                  id={`player-card-${player.id}`}
                  onClick={() => setSelectedPlayer(player)}
                  className="cursor-pointer rounded-[3rem] bg-black shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <PlayerCard player={player} showWatermark={showWatermark} />
                </div>
                <div className="flex items-center justify-between px-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadElement(`player-card-${player.id}`, `player-card-${player.name.toLowerCase().replace(/\s+/g, '-')}`);
                    }}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                  >
                    {isDownloading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPlayer(player);
                      }}
                      className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlayer(player.id);
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search teams..." 
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            </div>
            <button 
              onClick={() => setShowTeamModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Shield className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <div 
                key={team.id} 
                onClick={() => setSelectedTeam(team)}
                className="bg-[#1a1c26] rounded-3xl border border-white/5 p-8 group hover:border-cyan-500/30 transition-all relative overflow-hidden cursor-pointer shadow-lg hover:shadow-cyan-500/10 flex flex-col"
              >
                {/* Chemistry Background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '30px 34px' }} />
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                
                <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center p-2">
                    {team.logoUrl ? (
                      <img src={team.logoUrl || null} alt={team.name} className="w-full h-full object-contain" crossOrigin="anonymous" />
                    ) : (
                      <Shield className="w-10 h-10 text-cyan-400 opacity-50" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{team.name}</h3>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-white/40 text-sm font-medium">Owner: {team.owner}</p>
                      {team.manager && <p className="text-white/40 text-xs font-medium italic">Manager: {team.manager}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Budget</p>
                    <p className="text-xl font-black text-emerald-400">৳{team.budget.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Squad Size</p>
                    <p className="text-xl font-black text-white">{team.players.length}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10 mt-auto">
                  <div className="flex -space-x-3">
                    {team.players.slice(0, 5).map((pid: string, i: number) => {
                      const p = players.find(player => player.id === pid);
                      return (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1c26] overflow-hidden bg-white/10">
                          <img src={p?.photoUrl || `https://picsum.photos/seed/${pid}/100/100`} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        </div>
                      );
                    })}
                    {team.players.length > 5 && (
                      <div className="w-10 h-10 rounded-full border-2 border-[#1a1c26] bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">
                        +{team.players.length - 5}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeam(team);
                      }}
                      className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                      title="Download Squad Poster"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTeam(team);
                      }}
                      className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team.id);
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Registration Modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1c26] w-full max-w-4xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="flex-1 border-r border-white/5">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingPlayerId ? 'Edit Player' : 'Register New Player'}</h3>
                <button 
                  onClick={() => {
                    setShowPlayerModal(false);
                    setEditingPlayerId(null);
                    setPlayerForm({ name: '', age: 20, role: 'Batsman' as PlayerRole, category: 'Silver' as import('../types').PlayerCategory, basePrice: 1000000, photoUrl: '' });
                  }} 
                  className="text-white/40 hover:text-white md:hidden"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddPlayer} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={playerForm.name}
                      onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="e.g. Rahim Ahmed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Category</label>
                      <select 
                        value={playerForm.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                      >
                        <option value="Iconic">Iconic (7M)</option>
                        <option value="Platinum">Platinum (5M)</option>
                        <option value="Gold">Gold (3M)</option>
                        <option value="Silver">Silver (1M)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Role</label>
                      <select 
                        value={playerForm.role}
                        onChange={(e) => setPlayerForm({...playerForm, role: e.target.value as PlayerRole})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                      >
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-rounder">All-rounder</option>
                        <option value="Wicket-keeper">Wicket-keeper</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Age</label>
                      <input 
                        required
                        type="number" 
                        value={playerForm.age}
                        onChange={(e) => setPlayerForm({...playerForm, age: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Base Price (৳)</label>
                      <input 
                        required
                        type="number" 
                        value={playerForm.basePrice}
                        onChange={(e) => setPlayerForm({...playerForm, basePrice: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Player Photo</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/40 group-hover:text-white group-hover:border-indigo-500/50 transition-all">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-xs font-bold">Upload Photo</span>
                        </div>
                      </div>
                      <input 
                        type="url" 
                        value={playerForm.photoUrl}
                        onChange={(e) => setPlayerForm({...playerForm, photoUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="Or paste image URL"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
                >
                  {editingPlayerId ? 'Update Player' : 'Register Player'}
                </button>
              </form>
            </div>

            {/* Live Preview */}
            <div className="hidden md:flex flex-1 bg-black/20 items-center justify-center p-8 relative">
              <button 
                onClick={() => {
                  setShowPlayerModal(false);
                  setEditingPlayerId(null);
                  setPlayerForm({ name: '', age: 20, role: 'Batsman' as PlayerRole, category: 'Silver' as import('../types').PlayerCategory, basePrice: 1000000, photoUrl: '' });
                }} 
                className="absolute top-6 right-6 text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="scale-90">
                <PlayerCard 
                  player={{
                    id: 'preview',
                    name: playerForm.name || 'Player Name',
                    age: playerForm.age,
                    role: playerForm.role,
                    category: playerForm.category,
                    basePrice: playerForm.basePrice,
                    photoUrl: playerForm.photoUrl,
                    status: 'Available'
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Creation Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1c26] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingTeamId ? 'Edit Team' : 'Create New Team'}</h3>
              <button 
                onClick={() => {
                  setShowTeamModal(false);
                  setEditingTeamId(null);
                  setTeamForm({ name: '', owner: '', ownerPhotoUrl: '', manager: '', managerPhotoUrl: '', logoUrl: '', budget: 100000 });
                }} 
                className="text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddTeam} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Team Name</label>
                  <input 
                    required
                    type="text" 
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    placeholder="e.g. Dhaka Dynamites"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Owner Name</label>
                    <input 
                      required
                      type="text" 
                      value={teamForm.owner}
                      onChange={(e) => setTeamForm({...teamForm, owner: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Manager Name</label>
                    <input 
                      type="text" 
                      value={teamForm.manager}
                      onChange={(e) => setTeamForm({...teamForm, manager: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Owner Photo</label>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleOwnerPhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/40 group-hover:text-white group-hover:border-indigo-500/50 transition-all">
                        <UserPlus className="w-4 h-4" />
                        <span className="text-[10px] font-bold">Upload Photo</span>
                      </div>
                    </div>
                    {teamForm.ownerPhotoUrl && (
                      <div className="mt-2 flex justify-center">
                        <div className="w-12 h-12 rounded-full border border-amber-500/50 overflow-hidden">
                          <img src={teamForm.ownerPhotoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Manager Photo</label>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleManagerPhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/40 group-hover:text-white group-hover:border-indigo-500/50 transition-all">
                        <UserPlus className="w-4 h-4" />
                        <span className="text-[10px] font-bold">Upload Photo</span>
                      </div>
                    </div>
                    {teamForm.managerPhotoUrl && (
                      <div className="mt-2 flex justify-center">
                        <div className="w-12 h-12 rounded-full border border-amber-500/50 overflow-hidden">
                          <img src={teamForm.managerPhotoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Initial Budget (৳)</label>
                  <input 
                    required
                    type="number" 
                    value={teamForm.budget}
                    onChange={(e) => setTeamForm({...teamForm, budget: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 block">Team Logo</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleTeamLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/40 group-hover:text-white group-hover:border-indigo-500/50 transition-all">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">Upload Logo</span>
                      </div>
                    </div>
                    <input 
                      type="url" 
                      value={teamForm.logoUrl}
                      onChange={(e) => setTeamForm({...teamForm, logoUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="Or paste image URL"
                    />
                  </div>
                  {teamForm.logoUrl && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-2xl border-2 border-indigo-500 overflow-hidden bg-white/5 flex items-center justify-center p-2">
                        <img src={teamForm.logoUrl || null} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
              >
                Create Team
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Player Card Preview Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="absolute -top-12 right-0 md:-right-12 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Card Preview */}
              <div className="flex-1 flex justify-center relative group">
                <div ref={cardRef} className={cn(
                  "p-4 rounded-[3.5rem] transition-colors duration-300",
                  isTransparent ? "bg-transparent border-2 border-dashed border-white/20" : "bg-black"
                )}>
                  <PlayerCard player={selectedPlayer} isLarge transparent={isTransparent} showWatermark={showWatermark} />
                </div>
                
                {/* Floating Download Button */}
                <button 
                  onClick={handleDownloadCard}
                  disabled={isDownloading}
                  className="absolute bottom-8 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 bg-cyan-500 hover:bg-cyan-400 text-white p-4 rounded-full shadow-2xl shadow-cyan-500/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-50 flex items-center gap-2"
                  title="Download High-Res PNG"
                >
                  {isDownloading ? <Sparkles className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                  <span className="md:hidden font-bold uppercase tracking-widest text-xs">Download</span>
                </button>
              </div>

              {/* Actions */}
              <div className="w-full md:w-80 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter italic">Player Profile</h3>
                  <p className="text-white/40 text-sm">Download this premium card for social media or tournament announcements.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isTransparent ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/40"
                      )}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Transparent BG</p>
                        <p className="text-white/40 text-[10px]">Remove black background</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsTransparent(!isTransparent)}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-300",
                        isTransparent ? "bg-cyan-500" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                        isTransparent ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  <button 
                    onClick={handleDownloadCard}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-cyan-500/20 transition-all group"
                  >
                    {isDownloading ? (
                      <Sparkles className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    )}
                    <span>{isDownloading ? 'Generating...' : 'Download HD Card'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Format</p>
                      <p className="text-white font-bold">PNG (HD)</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Size</p>
                      <p className="text-white font-bold">1080x1440</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Premium Feature</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    This card is automatically synthesized with your tournament branding and chemistry-themed elements.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Squad Preview Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full flex flex-col gap-8 items-center py-12"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedTeam(null)}
                className="absolute top-0 right-0 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Team Card Preview */}
              <div ref={teamCardRef} className="w-full bg-[#0a0b10] rounded-[3rem] border border-amber-500/20 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.1)] p-12 relative">
                {/* Chemistry Background - Enhanced Premium Golden */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {/* Base Hex Grid */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23fbbf24' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 46px' }} />
                  
                  {/* Secondary Glowing Hexagons */}
                  <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0l51.96 30v60L60 120 8.04 90V30z' fill-rule='evenodd' stroke='%23fbbf24' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '120px 138px', backgroundPosition: '20px 20px' }} />

                  {/* Floating Molecular Atoms */}
                  <motion.div 
                    animate={{ 
                      x: [0, 100, 0], 
                      y: [0, 50, 0],
                      opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_15px_#fbbf24]" 
                  />
                  <motion.div 
                    animate={{ 
                      x: [0, -80, 0], 
                      y: [0, 100, 0],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_20px_#f59e0b]" 
                  />
                  <motion.div 
                    animate={{ 
                      x: [0, 50, 0], 
                      y: [0, -120, 0],
                      opacity: [0.05, 0.15, 0.05]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 right-10 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#ffffff]" 
                  />

                  {/* Molecular Nodes (Floating Glows) */}
                  <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full animate-pulse" />
                  <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-600/10 blur-[80px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/5 blur-[100px] rounded-full" />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0a0b10]/90 to-[#0a0b10]" />
                </div>

                {/* Transparent Tournament Logo Watermark */}
                {tournamentLogo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
                    <img src={tournamentLogo || null} alt="" className="w-[60%] h-[60%] object-contain" crossOrigin="anonymous" />
                  </div>
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center gap-8 mb-12 w-full">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/30 flex items-center justify-center p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-amber-500/5 blur-xl rounded-full" />
                      {selectedTeam.logoUrl ? (
                        <img src={selectedTeam.logoUrl || null} alt="" className="w-full h-full object-contain relative z-10" />
                      ) : (
                        <Shield className="w-16 h-16 text-amber-400 relative z-10" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">Official Squad</span>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">{tournamentName}</span>
                      </div>
                      <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-400 uppercase italic tracking-tighter drop-shadow-lg">{selectedTeam.name}</h2>
                    </div>
                  </div>

                  {/* Owner & Manager Row */}
                  <div className="flex justify-center gap-12 mb-12 w-full">
                    {/* Owner */}
                    <div className="flex flex-col items-center text-center group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-4 relative z-10">
                          <img 
                            src={selectedTeam.ownerPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeam.owner}`} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                      <p className="text-white font-black text-xs uppercase tracking-widest drop-shadow-md">{selectedTeam.owner}</p>
                      <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Team Owner</p>
                    </div>

                    {/* Manager */}
                    {selectedTeam.manager && (
                      <div className="flex flex-col items-center text-center group">
                        <div className="relative">
                          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-4 relative z-10">
                            <img 
                              src={selectedTeam.managerPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeam.manager}`} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              crossOrigin="anonymous"
                            />
                          </div>
                        </div>
                        <p className="text-white font-black text-xs uppercase tracking-widest drop-shadow-md">{selectedTeam.manager}</p>
                        <p className="text-amber-400/80 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Team Manager</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
                    {selectedTeam.players.map((pid: string) => {
                      const p = players.find(player => player.id === pid);
                      if (!p) return null;
                      return (
                        <div key={pid} className="relative bg-gradient-to-b from-amber-500/10 to-black/60 border border-amber-500/20 rounded-2xl p-4 flex flex-col items-center text-center group hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all overflow-hidden">
                          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/40 mb-3 group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <img src={p.photoUrl || `https://picsum.photos/seed/${pid}/100/100`} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                          </div>
                          <p className="text-white font-black text-[10px] uppercase tracking-tight line-clamp-2 drop-shadow-md">{p.name}</p>
                          <p className="text-amber-400 text-[8px] font-bold uppercase tracking-widest mt-1">{p.role}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-12 pt-8 border-t border-amber-500/20 w-full flex justify-between items-end relative">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-amber-400/40 text-[8px] font-black uppercase tracking-widest mb-1 text-center">Total Budget</p>
                        <p className="text-xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">৳{selectedTeam.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-amber-400/40 text-[8px] font-black uppercase tracking-widest mb-1 text-center">Squad Size</p>
                        <p className="text-xl font-black text-white">{selectedTeam.players.length} <span className="text-amber-400/60 text-sm">Elements</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {tournamentLogo ? (
                        <img src={tournamentLogo || null} alt="Tournament Logo" className="w-10 h-10 rounded-lg object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                      ) : (
                        <Atom className="text-amber-500/40 w-10 h-10" />
                      )}
                      <div className="text-right">
                        <p className="text-amber-400/40 text-[8px] font-black uppercase tracking-widest">Synthesized by</p>
                        <p className="text-xs font-black text-white/80 italic tracking-tighter uppercase drop-shadow-md">{tournamentName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 w-full max-w-md">
                <button 
                  onClick={handleDownloadTeamCard}
                  disabled={isDownloading}
                  className="flex-1 flex items-center justify-center gap-3 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-cyan-500/20 transition-all group"
                >
                  {isDownloading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                  )}
                  <span>{isDownloading ? 'Synthesizing...' : 'Download Squad Poster'}</span>
                </button>
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Export Modal */}
      <AnimatePresence>
        {showBulkExportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1c26] border border-white/10 rounded-3xl p-8 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">Bulk Export</h3>
                  <p className="text-white/50 text-sm mt-1">Download all cards or team posters at once.</p>
                </div>
                <button onClick={() => setShowBulkExportModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {bulkProgress ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">{bulkProgress.status}</h4>
                    <p className="text-white/50">
                      Processing {bulkProgress.current} of {bulkProgress.total} items
                    </p>
                  </div>
                  <div className="w-full max-w-md h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Player Cards
                    </h4>
                    <button 
                      onClick={() => handleBulkExportPlayers('zip')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <Archive className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">Download ZIP</p>
                          <p className="text-white/40 text-xs">Individual PNG files</p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                    </button>
                    <button 
                      onClick={() => handleBulkExportPlayers('pptx')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Presentation className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">Download PPTX</p>
                          <p className="text-white/40 text-xs">PowerPoint presentation</p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      Team Squads
                    </h4>
                    <button 
                      onClick={() => handleBulkExportTeams('zip')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <Archive className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">Download ZIP</p>
                          <p className="text-white/40 text-xs">Individual PNG files</p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                    </button>
                    <button 
                      onClick={() => handleBulkExportTeams('pptx')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Presentation className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">Download PPTX</p>
                          <p className="text-white/40 text-xs">PowerPoint presentation</p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Containers for Bulk Export */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
        <div ref={hiddenBulkPlayerRef}>
          {players.map(player => (
            <div key={player.id} id={`bulk-player-card-${player.id}`} className="w-[400px] h-[650px] bg-black">
              <PlayerCard player={player} isLarge={true} showWatermark={showWatermark} />
            </div>
          ))}
        </div>
        <div ref={hiddenBulkTeamRef}>
          {teams.map(team => (
            <div key={team.id} id={`bulk-team-card-${team.id}`} className="w-[1000px] h-[562px] bg-[#0a0b10] rounded-[3rem] border border-amber-500/20 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.1)] p-12 relative">
              {/* Chemistry Background - Enhanced Premium Golden */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Base Hex Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23fbbf24' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 46px' }} />
                
                {/* Secondary Glowing Hexagons */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0l51.96 30v60L60 120 8.04 90V30z' fill-rule='evenodd' stroke='%23fbbf24' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '120px 138px', backgroundPosition: '20px 20px' }} />

                {/* Molecular Nodes (Floating Glows) */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-600/10 blur-[80px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/5 blur-[100px] rounded-full" />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0a0b10]/90 to-[#0a0b10]" />
              </div>

              {/* Transparent Tournament Logo Watermark */}
              {tournamentLogo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
                  <img src={tournamentLogo || null} alt="" className="w-[60%] h-[60%] object-contain" crossOrigin="anonymous" />
                </div>
              )}
              
              <div className="relative z-10 flex flex-col items-center h-full">
                <div className="flex items-center gap-8 mb-8 w-full">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/30 flex items-center justify-center p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-amber-500/5 blur-xl rounded-full" />
                    {team.logoUrl ? (
                      <img src={team.logoUrl || null} alt="" className="w-full h-full object-contain relative z-10" />
                    ) : (
                      <Shield className="w-12 h-12 text-amber-400 relative z-10" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">Official Squad</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">{tournamentName}</span>
                    </div>
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-400 uppercase italic tracking-tighter drop-shadow-lg">{team.name}</h2>
                  </div>
                </div>

                {/* Owner & Manager Row */}
                <div className="flex justify-center gap-8 mb-8 w-full">
                  {/* Owner */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-2">
                      <img 
                        src={team.ownerPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${team.owner}`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        crossOrigin="anonymous"
                      />
                    </div>
                    <p className="text-white font-black text-[10px] uppercase tracking-widest drop-shadow-md">{team.owner}</p>
                    <p className="text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Team Owner</p>
                  </div>

                  {/* Manager */}
                  {team.manager && (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] mb-2">
                        <img 
                          src={team.managerPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${team.manager}`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          crossOrigin="anonymous"
                        />
                      </div>
                      <p className="text-white font-black text-[10px] uppercase tracking-widest drop-shadow-md">{team.manager}</p>
                      <p className="text-amber-400/80 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Team Manager</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-4 w-full flex-1">
                  {team.players.map((pid: string) => {
                    const p = players.find(player => player.id === pid);
                    if (!p) return null;
                    const playerIndex = players.findIndex(player => player.id === pid) + 1;
                    const displayId = playerIndex < 10 ? `00${playerIndex}` : playerIndex < 100 ? `0${playerIndex}` : playerIndex;
                    
                    return (
                      <div key={pid} className={cn(
                        "relative border rounded-2xl p-3 flex flex-col items-center text-center overflow-hidden transition-all duration-700",
                        isGoldenMode 
                          ? "bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]" 
                          : "bg-gradient-to-b from-amber-500/10 to-black/60 border-amber-500/20"
                      )}>
                        <div className={cn(
                          "absolute top-0 inset-x-0 h-px transition-all duration-700",
                          isGoldenMode ? "bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" : "bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
                        )} />
                        
                        {/* ID Badge */}
                        <div className={cn(
                          "absolute top-1 left-1 px-1 py-0.5 rounded-md border font-black text-[6px] tracking-tighter transition-all duration-700",
                          isGoldenMode 
                            ? "bg-yellow-500 text-black border-yellow-400" 
                            : "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                        )}>
                          ID: {displayId}
                        </div>

                        <div className={cn(
                          "w-16 h-16 rounded-full overflow-hidden border-2 mb-2 transition-all duration-700",
                          isGoldenMode ? "border-yellow-400/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        )}>
                          <img src={p.photoUrl || `https://picsum.photos/seed/${pid}/100/100`} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        </div>
                        <p className="text-white font-black text-[9px] uppercase tracking-tight line-clamp-2 drop-shadow-md">{p.name}</p>
                        <p className={cn(
                          "text-[7px] font-bold uppercase tracking-widest mt-1 transition-colors duration-700",
                          isGoldenMode ? "text-yellow-400" : "text-amber-400"
                        )}>{p.role}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 w-full flex justify-between items-end">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1 text-center">Total Budget</p>
                      <p className="text-xl font-black text-white">৳{team.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1 text-center">Squad Size</p>
                      <p className="text-xl font-black text-white">{team.players.length} Elements</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {tournamentLogo ? (
                      <img src={tournamentLogo || null} alt="Tournament Logo" className="w-8 h-8 rounded-lg object-contain" />
                    ) : (
                      <Atom className="text-cyan-500/20 w-8 h-8" />
                    )}
                    <div className="text-right">
                      <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Synthesized by</p>
                      <p className="text-xs font-black text-white/40 italic tracking-tighter uppercase">{tournamentName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
