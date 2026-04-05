import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Team, AuctionHistory, Match, MatchEvent, TeamStats, PlayerStats, MatchPlayerStat, CardTemplate } from '../types';
import { supabase } from '../lib/supabase';

interface TournamentContextType {
  players: Player[];
  teams: Team[];
  history: AuctionHistory[];
  matches: Match[];
  tournamentLogo: string;
  tournamentName: string;
  addPlayer: (player: Omit<Player, 'id' | 'status'>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  deletePlayer: (playerId: string) => void;
  addTeam: (team: Omit<Team, 'id' | 'players' | 'initialBudget'>) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  addMatch: (match: Omit<Match, 'id'>) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  deleteMatch: (matchId: string) => void;
  sellPlayer: (playerId: string, teamId: string, price: number) => void;
  unsellPlayer: (playerId: string) => void;
  updateTeamBudget: (teamId: string, newBudget: number) => void;
  resetAuction: () => void;
  setTournamentLogo: (logo: string) => void;
  setTournamentName: (name: string) => void;
  isGoldenMode: boolean;
  setGoldenMode: (enabled: boolean) => void;
  cardTemplate: CardTemplate;
  setCardTemplate: (template: CardTemplate) => void;
  generateFixtures: (type: 'Round Robin' | 'Knockout') => void;
  calculateTeamStats: () => Record<string, TeamStats>;
  calculatePlayerStats: () => Record<string, PlayerStats>;
  addMatchEvent: (matchId: string, event: Omit<MatchEvent, 'id' | 'time'>) => void;
  notifications: { id: string; message: string; time: string; type: 'info' | 'success' | 'warning' }[];
  addNotification: (message: string, type?: 'info' | 'success' | 'warning') => void;
  isLoading: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [history, setHistory] = useState<AuctionHistory[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentLogo, setTournamentLogoState] = useState<string>('');
  const [tournamentName, setTournamentNameState] = useState<string>('Chemistry Premier League');
  const [isGoldenMode, setGoldenModeState] = useState<boolean>(false);
  const [cardTemplate, setCardTemplateState] = useState<CardTemplate>('Chemistry');
  const [notifications, setNotifications] = useState<{ id: string; message: string; time: string; type: 'info' | 'success' | 'warning' }[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('tournament_state')
          .select('data')
          .eq('id', 'main')
          .single();

        if (error) throw error;

        if (data && data.data) {
          const state = data.data;
          setPlayers(state.players || []);
          setTeams(state.teams || []);
          setHistory(state.history || []);
          setMatches(state.matches || []);
          setTournamentLogoState(state.tournamentLogo || '');
          setTournamentNameState(state.tournamentName || 'Chemistry Premier League');
          setGoldenModeState(state.isGoldenMode || false);
          setCardTemplateState(state.cardTemplate || 'Chemistry');
          setNotifications(state.notifications || []);
        }
      } catch (err) {
        console.warn('Failed to load from Supabase, falling back to localStorage:', err);
        // Fallback to localStorage
        const savedPlayers = localStorage.getItem('tp_players');
        if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
        else setPlayers([
          { id: '1', name: 'Rahim Ahmed', age: 24, role: 'Batsman', category: 'Silver', basePrice: 1000000, status: 'Available', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80' },
          { id: '2', name: 'Mustafizur Rahman', age: 26, role: 'Bowler', category: 'Gold', basePrice: 3000000, status: 'Available', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' },
          { id: '3', name: 'Shakib Al Hasan', age: 34, role: 'All-rounder', category: 'Iconic', basePrice: 7000000, status: 'Available', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80' },
          { id: '4', name: 'Tamim Iqbal', age: 32, role: 'Batsman', category: 'Platinum', basePrice: 5000000, status: 'Available', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80' },
        ]);

        const savedTeams = localStorage.getItem('tp_teams');
        if (savedTeams) setTeams(JSON.parse(savedTeams));
        else setTeams([
          { id: 't1', name: 'Team Tigers', owner: 'Mr. Khan', budget: 100000000, initialBudget: 100000000, logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=TT', players: [] },
          { id: 't2', name: 'Dhaka Dynamites', owner: 'Mr. Ahmed', budget: 100000000, initialBudget: 100000000, logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DD', players: [] },
          { id: 't3', name: 'Sylhet Strikers', owner: 'Mr. Sylhet', budget: 100000000, initialBudget: 100000000, logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SS', players: [] },
        ]);

        const savedHistory = localStorage.getItem('tp_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));

        const savedMatches = localStorage.getItem('tp_matches');
        if (savedMatches) setMatches(JSON.parse(savedMatches));

        setTournamentLogoState(localStorage.getItem('tp_logo') || '');
        setTournamentNameState(localStorage.getItem('tp_name') || 'Chemistry Premier League');
        setGoldenModeState(localStorage.getItem('tp_golden') === 'true');
        setCardTemplateState(localStorage.getItem('tp_template') as CardTemplate || 'Chemistry');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data on change
  useEffect(() => {
    if (isLoading) return; // Don't save while loading

    const saveData = async () => {
      const stateToSave = {
        players,
        teams,
        history,
        matches,
        tournamentLogo,
        tournamentName,
        isGoldenMode,
        cardTemplate,
        notifications
      };

      // Save to localStorage as backup
      localStorage.setItem('tp_players', JSON.stringify(players));
      localStorage.setItem('tp_teams', JSON.stringify(teams));
      localStorage.setItem('tp_history', JSON.stringify(history));
      localStorage.setItem('tp_matches', JSON.stringify(matches));
      localStorage.setItem('tp_logo', tournamentLogo);
      localStorage.setItem('tp_name', tournamentName);
      localStorage.setItem('tp_golden', isGoldenMode.toString());
      localStorage.setItem('tp_template', cardTemplate);
      localStorage.setItem('tp_notifications', JSON.stringify(notifications));

      // Save to Supabase
      try {
        await supabase
          .from('tournament_state')
          .upsert({ id: 'main', data: stateToSave });
      } catch (err) {
        console.error('Failed to save to Supabase:', err);
      }
    };

    saveData();
  }, [players, teams, history, matches, tournamentLogo, tournamentName, isGoldenMode, notifications, isLoading]);

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif = {
      id: crypto.randomUUID(),
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
  };

  const addPlayer = (playerData: Omit<Player, 'id' | 'status'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: crypto.randomUUID(),
      status: 'Available'
    };
    setPlayers(prev => [...prev, newPlayer]);
    addNotification(`Player ${playerData.name} added`, 'success');
  };

  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...updates } : p));
    addNotification('Player updated', 'success');
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    addNotification('Player deleted', 'warning');
  };

  const addTeam = (teamData: Omit<Team, 'id' | 'players' | 'initialBudget'>) => {
    const newTeam: Team = {
      ...teamData,
      id: crypto.randomUUID(),
      players: [],
      initialBudget: teamData.budget
    };
    setTeams(prev => [...prev, newTeam]);
    addNotification(`Team ${teamData.name} created`, 'success');
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
    addNotification('Team updated', 'success');
  };

  const deleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    addNotification('Team deleted', 'warning');
  };

  const addMatch = (matchData: Omit<Match, 'id'>) => {
    const newMatch: Match = {
      ...matchData,
      id: crypto.randomUUID()
    };
    setMatches(prev => [...prev, newMatch]);
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m));
  };

  const deleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  const sellPlayer = (playerId: string, teamId: string, price: number) => {
    const team = teams.find(t => t.id === teamId);
    const player = players.find(p => p.id === playerId);
    
    if (!team || !player) return;

    // Check budget (Allow 100 taka fine even if budget is 0)
    if (team.budget < price && price !== 100) {
      addNotification(`Insufficient budget for ${team.name}`, 'warning');
      return;
    }

    // Check Iconic limit (Rule 3: Max 1 Iconic player per team)
    if (player.category === 'Iconic') {
      const hasIconic = team.players.some(pid => {
        const p = players.find(player => player.id === pid);
        return p?.category === 'Iconic';
      });
      if (hasIconic) {
        addNotification(`${team.name} already has an Iconic player`, 'warning');
        return;
      }
    }

    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, status: 'Sold', teamId, soldPrice: price } : p
    ));

    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, budget: Math.max(0, t.budget - price), players: [...t.players, playerId] } : t
    ));

    setHistory(prev => [...prev, {
      id: crypto.randomUUID(),
      playerId,
      teamId,
      price,
      timestamp: Date.now()
    }]);
  };

  const unsellPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player && player.status === 'Sold' && player.teamId && player.soldPrice) {
      const teamId = player.teamId;
      const price = player.soldPrice;
      setTeams(prev => prev.map(t => 
        t.id === teamId ? { ...t, budget: t.budget + price, players: t.players.filter(id => id !== playerId) } : t
      ));
    }

    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, status: 'Unsold', teamId: undefined, soldPrice: undefined } : p
    ));
  };

  const updateTeamBudget = (teamId: string, newBudget: number) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, budget: newBudget, initialBudget: Math.max(t.initialBudget, newBudget) } : t
    ));
    addNotification('Team budget updated successfully', 'success');
  };

  const resetAuction = () => {
    if (confirm('Are you sure you want to reset all auction data?')) {
      setPlayers(prev => prev.map(p => ({ ...p, status: 'Available', teamId: undefined, soldPrice: undefined })));
      setTeams(prev => prev.map(t => ({ ...t, budget: t.initialBudget, players: [] })));
      setHistory([]);
    }
  };

  const setTournamentLogo = (logo: string) => {
    setTournamentLogoState(logo);
  };

  const setTournamentName = (name: string) => {
    setTournamentNameState(name);
  };
  
  const setGoldenMode = (enabled: boolean) => {
    setGoldenModeState(enabled);
    if (enabled) setCardTemplateState('Golden');
    else setCardTemplateState('Chemistry');
    addNotification(`Golden Mode ${enabled ? 'Enabled' : 'Disabled'}`, 'info');
  };

  const setCardTemplate = (template: CardTemplate) => {
    setCardTemplateState(template);
    if (template === 'Golden') setGoldenModeState(true);
    else setGoldenModeState(false);
    addNotification(`Card Template changed to ${template}`, 'info');
  };

  const generateFixtures = (type: 'Round Robin' | 'Knockout') => {
    if (teams.length < 2) return;
    
    const newMatches: Match[] = [];
    const date = new Date();
    
    if (type === 'Round Robin') {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          date.setDate(date.getDate() + 1);
          newMatches.push({
            id: crypto.randomUUID(),
            teamAId: teams[i].id,
            teamBId: teams[j].id,
            date: date.toISOString().split('T')[0],
            time: '14:00',
            venue: 'Chemistry Lab Ground',
            status: 'Upcoming',
            round: 'Group',
            scoreA: 0,
            scoreB: 0,
            wicketsA: 0,
            wicketsB: 0,
            oversA: '0.0',
            oversB: '0.0',
            events: []
          });
        }
      }
    }
    setMatches(prev => [...prev, ...newMatches]);
  };

  const calculateTeamStats = () => {
    const stats: Record<string, TeamStats> = {};
    teams.forEach(t => {
      stats[t.id] = { played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 };
    });

    matches.filter(m => m.status === 'Completed').forEach(m => {
      const sA = stats[m.teamAId];
      const sB = stats[m.teamBId];
      if (!sA || !sB) return;

      sA.played++;
      sB.played++;
      sA.runsFor += m.scoreA || 0;
      sA.runsAgainst += m.scoreB || 0;
      sB.runsFor += m.scoreB || 0;
      sB.runsAgainst += m.scoreA || 0;

      // Simplified NRR calculation (overs as decimal for now)
      sA.oversFor += parseFloat(m.oversA || '0');
      sA.oversAgainst += parseFloat(m.oversB || '0');
      sB.oversFor += parseFloat(m.oversB || '0');
      sB.oversAgainst += parseFloat(m.oversA || '0');

      if ((m.scoreA || 0) > (m.scoreB || 0)) {
        sA.won++;
        sA.points += 2;
        sB.lost++;
      } else if ((m.scoreB || 0) > (m.scoreA || 0)) {
        sB.won++;
        sB.points += 2;
        sA.lost++;
      } else {
        sA.tied++;
        sB.tied++;
        sA.points += 1;
        sB.points += 1;
      }
    });

    // Final NRR calculation
    Object.keys(stats).forEach(id => {
      const s = stats[id];
      if (s.oversFor > 0 && s.oversAgainst > 0) {
        s.nrr = (s.runsFor / s.oversFor) - (s.runsAgainst / s.oversAgainst);
      }
    });

    return stats;
  };

  const calculatePlayerStats = () => {
    const stats: Record<string, PlayerStats> = {};
    players.forEach(p => {
      stats[p.id] = { runs: 0, wickets: 0, sixes: 0, fours: 0, matches: 0, highestScore: 0, bestBowling: '0/0' };
    });

    matches.forEach(m => {
      // Add stats from manual playerStats entry
      if (m.playerStats) {
        (Object.values(m.playerStats) as MatchPlayerStat[]).forEach(ps => {
          if (stats[ps.playerId]) {
            const s = stats[ps.playerId];
            s.runs += ps.runs || 0;
            s.wickets += ps.wickets || 0;
            s.sixes += ps.sixes || 0;
            s.fours += ps.fours || 0;
            // Note: matches played could be incremented here if we assume they played if they have stats
            // But we can also just increment it if they are in the team, or if they have >0 stats.
            // Let's increment matches if they have any stats recorded for this match
            if (ps.runs > 0 || ps.wickets > 0 || ps.sixes > 0 || ps.fours > 0) {
              s.matches++;
            }
            if ((ps.runs || 0) > s.highestScore) {
              s.highestScore = ps.runs;
            }
          }
        });
      }

      // Add stats from live events
      m.events?.forEach(e => {
        if (e.playerName) {
          const p = players.find(player => player.name === e.playerName);
          if (p && stats[p.id]) {
            const s = stats[p.id];
            if (e.type === 'Six') { s.runs += 6; s.sixes++; }
            if (e.type === 'Four') { s.runs += 4; s.fours++; }
            if (e.type === 'Single') s.runs += 1;
            if (e.type === 'Double') s.runs += 2;
            if (e.type === 'Triple') s.runs += 3;
            if (e.type === 'Wicket') s.wickets++;
          }
        }
      });
    });

    return stats;
  };

  const addMatchEvent = (matchId: string, eventData: Omit<MatchEvent, 'id' | 'time'>) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = crypto.randomUUID();
    const newEvent: MatchEvent = { ...eventData, id, time };

    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      
      const updates: Partial<Match> = {
        events: [newEvent, ...(m.events || [])]
      };

      // Auto-calculate scores based on event
      if (eventData.teamId === m.teamAId) {
        if (eventData.runs) updates.scoreA = (m.scoreA || 0) + eventData.runs;
        if (eventData.isWicket) updates.wicketsA = (m.wicketsA || 0) + 1;
      } else if (eventData.teamId === m.teamBId) {
        if (eventData.runs) updates.scoreB = (m.scoreB || 0) + eventData.runs;
        if (eventData.isWicket) updates.wicketsB = (m.wicketsB || 0) + 1;
      }

      return { ...m, ...updates };
    }));
  };

  return (
    <TournamentContext.Provider value={{ 
      players, 
      teams, 
      history, 
      matches, 
      tournamentLogo,
      tournamentName,
      isGoldenMode,
      cardTemplate,
      addPlayer, 
      updatePlayer,
      deletePlayer,
      addTeam, 
      updateTeam,
      deleteTeam,
      addMatch,
      updateMatch,
      deleteMatch,
      sellPlayer, 
      unsellPlayer,
      updateTeamBudget,
      resetAuction,
      setTournamentLogo,
      setTournamentName,
      setGoldenMode,
      setCardTemplate,
      generateFixtures,
      calculateTeamStats,
      calculatePlayerStats,
      addMatchEvent,
      notifications,
      addNotification,
      isLoading
    }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}
