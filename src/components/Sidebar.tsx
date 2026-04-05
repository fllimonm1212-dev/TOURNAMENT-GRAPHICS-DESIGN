import React from 'react';
import { 
  LayoutDashboard, 
  Gavel, 
  Users, 
  Trophy, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  PlusCircle,
  History,
  TrendingUp,
  Radio,
  Atom,
  Beaker,
  Sparkles,
  Palette
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useTournament } from '../context/TournamentContext';
import TemplateSelector from './TemplateSelector';

const menuItems = [
  { icon: LayoutDashboard, label: 'Lab Dashboard', path: '/' },
  { icon: Gavel, label: 'Auction Lab', path: '/auction' },
  { icon: Users, label: 'Elements & Teams', path: '/teams' },
  { icon: Trophy, label: 'Reaction Manager', path: '/matches' },
  { icon: ImageIcon, label: 'Formula Generator', path: '/graphics' },
  { icon: Radio, label: 'Live Reactions', path: '/live', badge: 'LIVE' },
  { icon: TrendingUp, label: 'Lab Results', path: '/results' },
  { icon: TrendingUp, label: 'Standings', path: '/standings' },
  { icon: Beaker, label: 'Statistics', path: '/statistics' },
];

export default function Sidebar() {
  const location = useLocation();
  const { isGoldenMode } = useTournament();
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = React.useState(false);

  return (
    <div className={cn(
      "w-64 border-r flex flex-col h-screen sticky top-0 shadow-2xl transition-colors duration-700 z-[60]",
      isGoldenMode ? "bg-[#1a1400] border-yellow-500/10" : "bg-[#0a0b10] border-white/5"
    )}>
      <div className="p-8 flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border transition-all duration-700",
          isGoldenMode 
            ? "bg-yellow-600 border-yellow-400/20 shadow-yellow-500/30" 
            : "bg-cyan-600 border-cyan-400/20 shadow-cyan-500/30"
        )}>
          <Atom className="text-white w-7 h-7 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-white font-black text-lg leading-tight tracking-tighter">CHEM DEPT</h1>
          <p className={cn(
            "text-[9px] uppercase tracking-[0.2em] font-black italic transition-colors duration-700",
            isGoldenMode ? "text-yellow-500/60" : "text-cyan-400/60"
          )}>Graphics Studio</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className={cn(
          "text-[9px] font-black uppercase tracking-[0.3em] px-4 mb-6 transition-colors duration-700",
          isGoldenMode ? "text-yellow-500/20" : "text-white/20"
        )}>Lab Modules</p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
              location.pathname === item.path 
                ? (isGoldenMode 
                    ? "bg-yellow-600/10 text-yellow-400 shadow-[inset_0_0_30px_rgba(234,179,8,0.05)] border border-yellow-500/20" 
                    : "bg-cyan-600/10 text-cyan-400 shadow-[inset_0_0_30px_rgba(6,182,212,0.05)] border border-cyan-500/20")
                : (isGoldenMode ? "text-yellow-500/40 hover:text-yellow-100 hover:bg-yellow-500/5" : "text-white/40 hover:text-white hover:bg-white/5")
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-all duration-300",
              location.pathname === item.path 
                ? (isGoldenMode ? "text-yellow-400 scale-110" : "text-cyan-400 scale-110") 
                : (isGoldenMode ? "group-hover:text-yellow-400 group-hover:scale-110" : "group-hover:text-cyan-400 group-hover:scale-110")
            )} />
            <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
            {item.badge && (
              <span className={cn(
                "ml-auto text-[9px] font-black px-2 py-0.5 rounded-full text-white animate-pulse shadow-lg",
                isGoldenMode ? "bg-yellow-600 shadow-yellow-500/50" : "bg-cyan-500 shadow-cyan-500/50"
              )}>
                {item.badge}
              </span>
            )}
            {location.pathname === item.path && (
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full shadow-lg",
                isGoldenMode ? "bg-yellow-500 shadow-yellow-500/80" : "bg-cyan-500 shadow-cyan-500/80"
              )} />
            )}
          </Link>
        ))}
        
        <button
          onClick={() => setIsTemplateSelectorOpen(true)}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
            isGoldenMode ? "text-yellow-500/40 hover:text-yellow-100 hover:bg-yellow-500/5" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          <Palette className={cn(
            "w-5 h-5 transition-all duration-300",
            isGoldenMode ? "group-hover:text-yellow-400 group-hover:scale-110" : "group-hover:text-cyan-400 group-hover:scale-110"
          )} />
          <span className="font-black text-[11px] uppercase tracking-widest">Card Templates</span>
        </button>
      </nav>

      <TemplateSelector 
        isOpen={isTemplateSelectorOpen} 
        onClose={() => setIsTemplateSelectorOpen(false)} 
      />

      <div className={cn(
        "p-6 mt-auto space-y-3 border-t transition-colors duration-700",
        isGoldenMode ? "bg-yellow-500/[0.02] border-yellow-500/10" : "bg-white/[0.02] border-white/5"
      )}>
        <button className={cn(
          "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group border border-transparent",
          isGoldenMode 
            ? "text-yellow-500/40 hover:text-yellow-400 hover:bg-yellow-500/5 hover:border-yellow-500/20" 
            : "text-white/40 hover:text-cyan-400 hover:bg-cyan-500/5 hover:border-cyan-500/20"
        )}>
          <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="font-black text-[11px] uppercase tracking-widest">New Reaction</span>
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400/40 hover:text-red-400 hover:bg-red-400/5 transition-all group border border-transparent hover:border-red-500/20">
          <LogOut className="w-5 h-5" />
          <span className="font-black text-[11px] uppercase tracking-widest">Abort Lab</span>
        </button>
      </div>
    </div>
  );
}
