import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  Users, 
  Trophy, 
  Gavel, 
  TrendingUp, 
  ArrowUpRight, 
  Download,
  Plus,
  Radio,
  Image as ImageIcon,
  PlusCircle,
  Beaker,
  Atom,
  FlaskConical,
  TestTube2,
  Zap,
  History,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    players, 
    teams, 
    history, 
    tournamentLogo, 
    setTournamentLogo,
    tournamentName,
    setTournamentName,
    isGoldenMode,
    setGoldenMode,
    notifications,
    matches
  } = useTournament();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTournamentLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: 'Total Teams', value: teams.length, icon: Users, color: 'bg-cyan-500' },
    { label: 'Total Players', value: players.length, icon: Trophy, color: 'bg-emerald-500' },
    { label: 'Total Matches', value: matches.length, icon: Beaker, color: 'bg-indigo-500' },
    { label: 'Live Now', value: matches.filter(m => m.status === 'Live').length, icon: Radio, color: 'bg-red-500' },
  ];

  const recentWorks = [
    { title: 'Chem Dept Opening Poster', time: '2 min ago', type: 'Poster' },
    { title: 'Noble Gases Squad', time: '10 min ago', type: 'Squad' },
    { title: 'Player Rahim Card', time: '25 min ago', type: 'Card' },
    { title: 'Final Reaction Poster', time: '1 hour ago', type: 'Match' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-cyan-600/10 border-2 border-dashed border-cyan-500/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-cyan-500/60">
              {tournamentLogo ? (
                <img src={tournamentLogo || null} alt="Tournament Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-cyan-500/40" />
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Change Logo</p>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Atom className="text-cyan-400 w-6 h-6 animate-spin-slow" />
              <input 
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className="bg-transparent border-none text-2xl font-black text-white uppercase italic tracking-tighter focus:ring-0 p-0 w-full max-w-md placeholder:text-white/20"
                placeholder="Enter Tournament Name"
              />
            </div>
            <p className="text-white/40 text-xs font-medium">Welcome back, Lab Admin. Your tournament reaction is stable.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Golden Mode Toggle */}
          <button 
            onClick={() => setGoldenMode(!isGoldenMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border shadow-lg",
              isGoldenMode 
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-yellow-500/10" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            )}
          >
            <Sparkles className={cn("w-4 h-4", isGoldenMode && "animate-pulse")} />
            <span className="text-[10px] uppercase tracking-widest">Golden Mode</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
            <Download className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Export</span>
          </button>
          <button 
            onClick={() => navigate('/matches')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">New Reaction</span>
          </button>
        </div>
      </div>

      {/* Hero Banner - Chemistry Themed */}
      <div className="relative overflow-hidden rounded-[3rem] bg-[#0a0b10] p-12 border border-white/10 shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 45px' }} />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 backdrop-blur-md text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-cyan-500/20">
            <FlaskConical size={12} />
            Chemistry Dept Tournament
          </span>
          <h1 className="text-7xl font-black text-white leading-[1] mb-6 italic tracking-tighter">
            CATALYZE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400">TOURNAMENT VIBE</span>
          </h1>
          <div className="flex items-center gap-6 text-white/60 mb-8">
            <div className="flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold uppercase tracking-widest">Auction</span>
            </div>
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold uppercase tracking-widest">Match</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/matches')}
            className="px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-cyan-500/40 transition-all flex items-center gap-3 group"
          >
            Start Reaction
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[150px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 text-white/5 p-12">
            <Atom size={400} strokeWidth={0.5} className="animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Quick Actions & Stats */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Quick Modules */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Auction Lab', desc: 'Bidding & Chemistry', icon: Gavel, color: 'from-cyan-500 to-blue-600', path: '/auction' },
              { label: 'Element Manager', desc: 'Manage Teams & Players', icon: Users, color: 'from-emerald-500 to-teal-600', path: '/teams' },
              { label: 'Reaction Poster', desc: 'Match Day Graphics', icon: Trophy, color: 'from-indigo-500 to-purple-600', path: '/matches' },
              { label: 'Quick Formula', desc: 'Fast Graphics Creator', icon: ImageIcon, color: 'from-pink-500 to-rose-600', path: '/graphics' },
            ].map((module, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(module.path)}
                className="group relative overflow-hidden rounded-3xl bg-[#1a1c26] p-6 border border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all shadow-xl"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-2xl", module.color)}>
                  <module.icon className="text-white w-7 h-7" />
                </div>
                <h3 className="text-white font-black uppercase tracking-tight mb-1">{module.label}</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{module.desc}</p>
                <div className="absolute top-4 right-4 text-white/10 group-hover:text-cyan-400 transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Popular Templates */}
          <div className="bg-[#1a1c26] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Lab Templates</h3>
              <button className="text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                  <img 
                    src={`https://picsum.photos/seed/chem${i}/400/600`} 
                    alt="Template" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                    <p className="text-white font-black text-xs uppercase tracking-widest">Atomic Player Card</p>
                    <p className="text-cyan-400 text-[8px] font-bold uppercase tracking-wider">Chemistry Edition</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Works & Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Quick Create Panel */}
          <div className="bg-[#1a1c26] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              Quick Synthesis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Atomic Card', icon: Users, color: 'bg-cyan-500/20 text-cyan-400', path: '/teams' },
                { label: 'Reaction Poster', icon: Trophy, color: 'bg-emerald-500/20 text-emerald-400', path: '/matches' },
                { label: 'Squad Formula', icon: ImageIcon, color: 'bg-indigo-500/20 text-indigo-400', path: '/graphics' },
                { label: 'Toss Result', icon: Gavel, color: 'bg-orange-500/20 text-orange-400', path: '/matches' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
                </button>
              ))}
            </div>
            <button className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-black uppercase tracking-widest rounded-xl shadow-2xl shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
              AI Synthesize Design <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          {/* Tournament Stats */}
          <div className="bg-[#1a1c26] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter">Lab Analytics</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-lg", stat.color)}>
                    <stat.icon className="text-white w-5 h-5" />
                  </div>
                  <p className="text-3xl font-black text-white leading-none mb-1">{stat.value}</p>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Notifications */}
          <div className="bg-[#1a1c26] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                Live Feed
              </h3>
              <button className="text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:underline">Clear All</button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                    <History className="w-6 h-6" />
                  </div>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">No recent activity detected</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div 
                    key={notif.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      notif.type === 'warning' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-cyan-500/10 text-cyan-400'
                    )}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold leading-relaxed">{notif.message}</p>
                      <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1">{notif.time}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
