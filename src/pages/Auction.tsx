import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Player, Team } from '../types';
import PlayerCard from '../components/PlayerCard';
import { 
  Gavel, 
  Users, 
  History, 
  Plus, 
  Minus, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Clock,
  Search,
  Atom,
  FlaskConical,
  TestTube2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { cn } from '@/src/lib/utils';

export default function Auction() {
  const { players, teams, history, sellPlayer, unsellPlayer, updateTeamBudget, resetAuction, addNotification, isGoldenMode } = useTournament();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Available' | 'Sold' | 'Unsold'>('Available');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Iconic' | 'Platinum' | 'Gold' | 'Silver'>('All');
  const [showSoldOverlay, setShowSoldOverlay] = useState<{ player: Player; team: Team; price: number } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [budgetModalTeamId, setBudgetModalTeamId] = useState<string | null>(null);
  const [newBudgetInput, setNewBudgetInput] = useState<string>('');

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const highestBidder = teams.find(t => t.id === highestBidderId);

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

  useEffect(() => {
    if (selectedPlayer) {
      setCurrentBid(selectedPlayer.basePrice);
      setHighestBidderId(null);
    }
  }, [selectedPlayerId]);

  const getNextIncrement = () => {
    if (!selectedPlayer) return 1000000;

    const category = selectedPlayer.category;
    const currentPrice = currentBid;

    // Rule 5 & 6: Iconic & Platinum
    if (category === 'Iconic' || category === 'Platinum') {
      if (currentPrice < 10000000) return 1000000; // 1M
      if (currentPrice < 30000000) return 2000000; // 2M
      return 3000000; // 3M
    } 
    // Rule 7 & 8: Gold & Silver
    else if (category === 'Gold' || category === 'Silver') {
      if (currentPrice < 15000000) return 500000; // 0.5M
      return 1000000; // 1M
    }

    return 1000000;
  };

  const handleBid = (amount: number) => {
    setCurrentBid(prev => prev + amount);
  };

  const handleSold = () => {
    if (selectedPlayerId && highestBidderId && selectedPlayer && highestBidder) {
      const currentTeamPlayers = highestBidder.players.length;
      const needsMorePlayers = currentTeamPlayers < 12;
      
      let finalPrice = currentBid;
      
      if (highestBidder.budget < currentBid) {
        if (needsMorePlayers) {
          // Rule 2: If budget runs out, pay 100 taka fine per player to reach 12
          finalPrice = 100;
          addNotification(`${highestBidder.name} is out of budget. Buying for 100 taka fine to reach 12 players.`, 'info');
        } else {
          addNotification(`Insufficient budget for ${highestBidder.name}!`, 'warning');
          return;
        }
      }

      // Check Iconic limit (Rule 3)
      if (selectedPlayer.category === 'Iconic') {
        const hasIconic = highestBidder.players.some(pid => {
          const p = players.find(player => player.id === pid);
          return p?.category === 'Iconic';
        });
        if (hasIconic) {
          addNotification(`${highestBidder.name} already has an Iconic player!`, 'warning');
          return;
        }
      }

      const soldData = { player: selectedPlayer, team: highestBidder, price: finalPrice };
      sellPlayer(selectedPlayerId, highestBidderId, finalPrice);
      
      // Show beautiful overlay
      setShowSoldOverlay(soldData);
      
      confetti({
        particleCount: 250,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#4f46e5', '#10b981', '#ffffff', '#fbbf24', '#22d3ee']
      });
    }
  };

  const selectNewPlayer = (id: string) => {
    setShowSoldOverlay(null);
    setSelectedPlayerId(id);
  };

  const handleUnsold = () => {
    if (selectedPlayerId) {
      unsellPlayer(selectedPlayerId);
      setSelectedPlayerId(null);
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Auction Management</h2>
          <p className="text-white/50 mt-1">Live bidding and player distribution system.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={resetAuction}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Auction</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Player Selection */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#1a1c26] rounded-3xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Players List</h3>
              <span className="text-white/40 text-xs font-medium">{filteredPlayers.length} Players</span>
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="Search players..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Available', 'Sold', 'Unsold'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                    filter === f ? "bg-indigo-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-t border-white/5 pt-4">
              {['All', 'Iconic', 'Platinum', 'Gold', 'Silver'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c as any)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                    categoryFilter === c 
                      ? (isGoldenMode ? "bg-yellow-500 text-black border-yellow-400" : "bg-indigo-600 text-white border-indigo-500") 
                      : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredPlayers.map((player) => {
                const playerIndex = players.findIndex(p => p.id === player.id) + 1;
                const displayId = playerIndex < 10 ? `00${playerIndex}` : playerIndex < 100 ? `0${playerIndex}` : playerIndex;
                
                return (
                  <div 
                    key={player.id}
                    onClick={() => player.status === 'Available' && selectNewPlayer(player.id)}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group relative",
                      selectedPlayerId === player.id 
                        ? (isGoldenMode ? "bg-yellow-500/10 border-yellow-500/50" : "bg-indigo-600/10 border-indigo-500/50")
                        : "bg-white/5 border-white/5 hover:bg-white/10",
                      player.status !== 'Available' && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                        <img crossOrigin="anonymous" src={player.photoUrl || `https://picsum.photos/seed/${player.id}/100/100`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className={cn(
                        "absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md border font-black text-[7px] tracking-tighter transition-all duration-700",
                        isGoldenMode 
                          ? "bg-yellow-500 text-black border-yellow-400" 
                          : "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                      )}>
                        ID: {displayId}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-white text-sm font-bold line-clamp-2 transition-colors",
                        selectedPlayerId === player.id ? (isGoldenMode ? "text-yellow-400" : "text-indigo-400") : "group-hover:text-indigo-400"
                      )}>{player.name}</p>
                      {player.status === 'Sold' && player.teamId && (
                        <p className={cn(
                          "text-[8px] font-black uppercase tracking-widest",
                          isGoldenMode ? "text-yellow-500/60" : "text-emerald-400"
                        )}>
                          {teams.find(t => t.id === player.teamId)?.name}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[7px] font-black uppercase px-1 rounded",
                          player.category === 'Iconic' ? "bg-red-500 text-white" :
                          player.category === 'Platinum' ? "bg-slate-300 text-slate-900" :
                          player.category === 'Gold' ? "bg-yellow-500 text-black" : "bg-slate-400 text-white"
                        )}>{player.category}</span>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{player.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-xs font-black",
                        isGoldenMode ? "text-yellow-400" : "text-indigo-400"
                      )}>৳{player.basePrice.toLocaleString()}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                        player.status === 'Available' ? (isGoldenMode ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400") :
                        player.status === 'Sold' ? (isGoldenMode ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400") : "bg-red-500/20 text-red-400"
                      )}>
                        {player.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column: Live Auction Panel */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <AnimatePresence mode="wait">
            {selectedPlayer ? (
              <motion.div 
                key={selectedPlayer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Live Auction Card */}
                <div className="relative group">
                  <div id={`auction-card-${selectedPlayer.id}`} className="p-4 bg-black rounded-[3.5rem] shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                    <PlayerCard player={selectedPlayer} isLarge className="mx-auto" />
                  </div>
                  
                  {/* Floating Download Button */}
                  <button 
                    onClick={() => downloadElement(`auction-card-${selectedPlayer.id}`, `auction-card-${selectedPlayer.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    disabled={isDownloading}
                    className="absolute top-8 right-8 bg-cyan-500 hover:bg-cyan-400 text-white p-3 rounded-full shadow-2xl shadow-cyan-500/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-50 flex items-center gap-2"
                    title="Download High-Res PNG"
                  >
                    {isDownloading ? <Atom className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  </button>

                  {/* Current Price Overlay */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs bg-[#1a1c26] border border-white/10 rounded-3xl p-6 shadow-2xl z-30 text-center">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">Current Bid</p>
                    <motion.p 
                      key={currentBid}
                      initial={{ scale: 1.2, color: '#4f46e5' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-4xl font-black"
                    >
                      ৳{currentBid.toLocaleString()}
                    </motion.p>
                    {highestBidder && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{highestBidder.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Controls */}
                <div className="bg-[#1a1c26] rounded-3xl p-8 border border-white/5 space-y-8 mt-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-indigo-400" />
                      Bidding Control
                    </h3>
                    <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                      <Clock className="w-4 h-4" />
                      <span>Live Session</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 5, 10, 20].map((multiplier) => {
                      const increment = getNextIncrement() * multiplier;
                      const displayPrice = increment >= 1000000 
                        ? `${(increment / 1000000).toFixed(1)}M` 
                        : `${(increment / 1000).toFixed(0)}K`;
                      
                      return (
                        <button
                          key={multiplier}
                          onClick={() => handleBid(increment)}
                          className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white font-black text-sm transition-all active:scale-95"
                        >
                          +৳{displayPrice}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleSold}
                      disabled={!highestBidderId || (highestBidder && highestBidder.budget < currentBid && highestBidder.players.length >= 12)}
                      className={cn(
                        "py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2",
                        highestBidderId && highestBidder && (highestBidder.budget >= currentBid || highestBidder.players.length < 12)
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                      )}
                    >
                      <CheckCircle className="w-5 h-5" />
                      {highestBidder && highestBidder.budget < currentBid && highestBidder.players.length >= 12 ? 'INSUFFICIENT BUDGET' : 'SOLD'}
                    </button>
                    <button 
                      onClick={handleUnsold}
                      className="py-4 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-black text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      UNSOLD
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-6 bg-[#1a1c26] rounded-3xl border border-dashed border-white/10 p-12">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Gavel className="w-12 h-12 text-indigo-400 opacity-50" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">No Player Selected</h3>
                  <p className="text-white/40 mt-2 max-w-xs mx-auto">Select a player from the list to start the live auction session.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Teams & Bidding List */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {/* Team Bidding List */}
          <div className="bg-[#1a1c26] rounded-3xl p-6 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Teams & Budgets
            </h3>
            <div className="space-y-4">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  onClick={() => {
                    if (selectedPlayerId && selectedPlayer) {
                      // Rule 3: Max 1 Iconic player
                      if (selectedPlayer.category === 'Iconic') {
                        const hasIconic = team.players.some(pid => {
                          const p = players.find(player => player.id === pid);
                          return p?.category === 'Iconic';
                        });
                        if (hasIconic) {
                          addNotification(`${team.name} already has an Iconic player!`, 'warning');
                          return;
                        }
                      }

                      if (team.budget >= currentBid || team.players.length < 12) {
                        setHighestBidderId(team.id);
                      } else {
                        addNotification(`Insufficient budget for ${team.name}!`, 'warning');
                      }
                    }
                  }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer relative group",
                    highestBidderId === team.id 
                      ? "bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]" 
                      : "bg-white/5 border-white/5 hover:bg-white/10",
                    ((team.budget < currentBid && team.players.length >= 12) || 
                     (selectedPlayer?.category === 'Iconic' && team.players.some(pid => players.find(p => p.id === pid)?.category === 'Iconic'))) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                      <img crossOrigin="anonymous" src={team.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${team.name}`} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold line-clamp-2">{team.name}</p>
                      <p className="text-white/40 text-[10px] font-medium">{team.players.length} Players</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Remaining</p>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm font-black",
                        team.budget < currentBid ? "text-red-400" : "text-emerald-400"
                      )}>
                        ৳{team.budget.toLocaleString()}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setBudgetModalTeamId(team.id);
                          setNewBudgetInput(team.budget.toString());
                        }}
                        className="p-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/40 hover:text-white transition-all"
                        title="Update Budget"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500" 
                      style={{ width: `${(team.budget / team.initialBudget) * 100}%` }}
                    />
                  </div>
                  
                  {highestBidderId === team.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1a1c26]">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auction History */}
          <div className="bg-[#1a1c26] rounded-3xl p-6 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Recent Sales
            </h3>
            <div className="space-y-4">
              {history.slice().reverse().slice(0, 5).map((item) => {
                const p = players.find(player => player.id === item.playerId);
                const t = teams.find(team => team.id === item.teamId);
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                      <img crossOrigin="anonymous" src={p?.photoUrl || `https://picsum.photos/seed/${p?.id}/100/100`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold line-clamp-2">{p?.name}</p>
                      <p className="text-indigo-400 text-[10px] font-bold">৳{item.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[10px] font-bold uppercase line-clamp-2 max-w-[60px]">{t?.name}</p>
                    </div>
                  </div>
                );
              })}
              {history.length === 0 && (
                <p className="text-white/20 text-xs text-center py-4 italic">No sales recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SOLD OVERLAY */}
      <AnimatePresence>
        {showSoldOverlay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0b10]/95 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -50 }}
              className="relative w-full max-w-4xl"
            >
              <div id="sold-overlay-card" className="relative w-full bg-[#1a1c26] rounded-[4rem] border border-white/10 overflow-hidden shadow-[0_0_150px_rgba(79,70,229,0.4)]">
                {/* Animated Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 180, 270, 360],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,_transparent,_rgba(79,70,229,0.3),_transparent)]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
                
                {/* Chemistry Background Elements - Hexagonal Pattern (Benzene Rings) */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2322d3ee' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 44px' }} />
                
                {/* Molecular Bond Overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='white'/%3E%3Ccircle cx='90' cy='90' r='1' fill='white'/%3E%3Cline x1='10' y1='10' x2='90' y2='90' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '120px 120px' }} />

                {/* Floating Chemistry Icons */}
                <motion.div 
                  animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute top-20 left-20 text-cyan-500/10"
                >
                  <Atom size={120} strokeWidth={1} />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                  transition={{ duration: 7, repeat: Infinity }}
                  className="absolute bottom-20 right-20 text-emerald-500/10"
                >
                  <FlaskConical size={100} strokeWidth={1} />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute top-1/2 right-1/4 text-indigo-500/10"
                >
                  <TestTube2 size={80} strokeWidth={1} />
                </motion.div>
              </div>

              <div className="relative p-16 flex flex-col items-center text-center space-y-12">
                {/* SOLD Badge with Energy Pulse */}
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-500 blur-3xl rounded-full"
                  />
                  <motion.div 
                    initial={{ y: -100, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    className="relative px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-full font-black text-4xl tracking-[0.4em] shadow-[0_0_50px_rgba(16,185,129,0.6)] border-4 border-white/20 italic"
                  >
                    SOLD
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-16 w-full">
                  {/* Player Info */}
                  <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="flex-1 space-y-6"
                  >
                    <div className="relative group mx-auto w-64 h-64">
                      <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                      <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-[#0a0b10]">
                        <img crossOrigin="anonymous" src={showSoldOverlay.player.photoUrl || `https://picsum.photos/seed/${showSoldOverlay.player.id}/300/300`} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase">{showSoldOverlay.player.name}</h4>
                      <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-white/40 font-bold uppercase tracking-widest text-xs">
                        {showSoldOverlay.player.role}
                      </span>
                    </div>
                  </motion.div>

                  {/* Animated Connection */}
                  <div className="flex flex-col items-center gap-4">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative"
                    >
                      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                      <TrendingUp className="w-10 h-10 text-indigo-400 relative z-10" />
                    </motion.div>
                    <div className="h-24 w-[2px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                  </div>

                  {/* Team Info */}
                  <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="flex-1 space-y-6"
                  >
                    <div className="relative group mx-auto w-64 h-64">
                      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                      <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-white/5 flex items-center justify-center p-10 backdrop-blur-md">
                        <img crossOrigin="anonymous" src={showSoldOverlay.team.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${showSoldOverlay.team.name}`} className="w-full h-full object-contain filter drop-shadow-2xl" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black text-indigo-400 italic tracking-tighter uppercase">{showSoldOverlay.team.name}</h4>
                      <span className="px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-bold uppercase tracking-widest text-xs">
                        New Home
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Price Tag with Premium Styling */}
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="relative"
                >
                  <div className="absolute -inset-8 bg-indigo-500/10 blur-3xl rounded-full" />
                  <div className="relative space-y-3">
                    <p className="text-white/30 font-black uppercase tracking-[0.6em] text-sm">Acquisition Value</p>
                    <div className="text-8xl font-black text-white flex items-baseline justify-center gap-4 italic tracking-tighter">
                      <span className="text-indigo-500 drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]">৳</span>
                      <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        {showSoldOverlay.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Next Player Action */}
                <div className="flex items-center gap-4 mt-8">
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    onClick={() => downloadElement('sold-overlay-card', `sold-${showSoldOverlay.player.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    disabled={isDownloading}
                    className="group relative px-8 py-5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-2xl transition-all overflow-hidden"
                  >
                    <span className="relative text-cyan-400 font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3">
                      {isDownloading ? <Atom className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      Download Poster
                    </span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    onClick={() => {
                      setShowSoldOverlay(null);
                      setSelectedPlayerId(null);
                    }}
                    className="group relative px-12 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative text-white/60 group-hover:text-white font-black uppercase tracking-[0.3em] text-sm flex items-center gap-3">
                      Next Player <Search className="w-5 h-5" />
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Update Modal */}
      <AnimatePresence>
        {budgetModalTeamId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBudgetModalTeamId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#1a1c26] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Update Team Budget</h3>
                <button onClick={() => setBudgetModalTeamId(null)} className="text-white/40 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Team</p>
                  <p className="text-white font-bold">{teams.find(t => t.id === budgetModalTeamId)?.name}</p>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2 block">New Budget (৳)</label>
                  <input 
                    type="number"
                    value={newBudgetInput}
                    onChange={(e) => setNewBudgetInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="Enter amount..."
                  />
                </div>
                <button 
                  onClick={() => {
                    const amount = parseInt(newBudgetInput);
                    if (!isNaN(amount) && budgetModalTeamId) {
                      updateTeamBudget(budgetModalTeamId, amount);
                      setBudgetModalTeamId(null);
                    }
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
                >
                  Update Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
