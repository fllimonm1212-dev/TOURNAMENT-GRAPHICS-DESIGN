import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Auction from './pages/Auction';
import Teams from './pages/Teams';
import Graphics from './pages/Graphics';
import ReactionManager from './pages/ReactionManager';
import Standings from './pages/Standings';
import Statistics from './pages/Statistics';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { cn } from '@/src/lib/utils';

const Results = () => <div className="p-8 text-white">Results & Standings (Coming Soon)</div>;

function AppContent() {
  const { isGoldenMode } = useTournament();

  return (
    <Router>
      <div className={cn(
        "flex min-h-screen text-white font-sans selection:bg-indigo-500/30 transition-colors duration-700",
        isGoldenMode 
          ? "bg-[#1a1400] bg-gradient-to-br from-[#1a1400] via-[#2a2000] to-[#1a1400]" 
          : "bg-[#0a0b10]"
      )}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          {/* Golden Mode Background Effects */}
          {isGoldenMode && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
              <div className="absolute inset-0 opacity-[0.03]" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffd700' stroke-width='1' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 45px' }} />
            </div>
          )}

          {/* Top Navigation / Search Bar */}
          <div className={cn(
            "h-20 border-b flex items-center justify-between px-8 sticky top-0 backdrop-blur-xl z-50 transition-colors duration-700",
            isGoldenMode 
              ? "bg-[#1a1400]/80 border-yellow-500/10" 
              : "bg-[#0a0b10]/80 border-white/5"
          )}>
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search players, teams, matches..." 
                className={cn(
                  "w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all",
                  isGoldenMode
                    ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-100 placeholder:text-yellow-500/30 focus:border-yellow-500/50"
                    : "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500/50"
                )}
              />
              <div className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                isGoldenMode ? "text-yellow-500/40" : "text-white/30"
              )}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button className={cn(
                  "p-2 transition-colors",
                  isGoldenMode ? "text-yellow-500/40 hover:text-yellow-400" : "text-white/40 hover:text-white"
                )}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </button>
                <button className={cn(
                  "p-2 transition-colors relative",
                  isGoldenMode ? "text-yellow-500/40 hover:text-yellow-400" : "text-white/40 hover:text-white"
                )}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className={cn(
                    "absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2",
                    isGoldenMode ? "bg-yellow-500 border-[#1a1400]" : "bg-red-500 border-[#0a0b10]"
                  )} />
                </button>
              </div>
              
              <div className={cn(
                "h-8 w-[1px]",
                isGoldenMode ? "bg-yellow-500/10" : "bg-white/10"
              )} />
              
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold transition-colors",
                    isGoldenMode ? "text-yellow-100 group-hover:text-yellow-400" : "text-white group-hover:text-indigo-400"
                  )}>Admin</p>
                  <p className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    isGoldenMode ? "text-yellow-500/40" : "text-white/40"
                  )}>Super Admin</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl overflow-hidden border transition-all",
                  isGoldenMode ? "border-yellow-500/20 group-hover:border-yellow-500/50" : "border-white/10 group-hover:border-indigo-500/50"
                )}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auction" element={<Auction />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/matches" element={<ReactionManager />} />
              <Route path="/graphics" element={<Graphics />} />
              <Route path="/live" element={<ReactionManager />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/results" element={<Standings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}
