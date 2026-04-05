export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper' | 'Striker' | 'Midfielder' | 'Defender' | 'Goalkeeper';
export type PlayerCategory = 'Iconic' | 'Platinum' | 'Gold' | 'Silver';
export type CardTemplate = 'Chemistry' | 'Golden' | 'Emerald' | 'Midnight' | 'Neon' | 'Modern';

export interface Player {
  id: string;
  name: string;
  age: number;
  role: PlayerRole;
  category?: PlayerCategory;
  basePrice: number;
  photoUrl: string;
  status: 'Available' | 'Sold' | 'Unsold';
  teamId?: string;
  soldPrice?: number;
}

export interface Team {
  id: string;
  name: string;
  owner: string;
  ownerPhotoUrl?: string;
  manager?: string;
  managerPhotoUrl?: string;
  logoUrl: string;
  budget: number;
  initialBudget: number;
  players: string[]; // Player IDs
}

export interface AuctionHistory {
  id: string;
  playerId: string;
  teamId: string;
  price: number;
  timestamp: number;
}

export interface MatchEvent {
  id: string;
  type: 'Goal' | 'Wicket' | 'Card' | 'Custom' | 'Six' | 'Four' | 'Wide' | 'No Ball' | 'Over' | 'Dot' | 'Single' | 'Double' | 'Triple';
  teamId?: string;
  playerName?: string;
  time: string;
  description: string;
  runs?: number;
  isWicket?: boolean;
  isExtra?: boolean;
}

export interface MatchPlayerStat {
  playerId: string;
  runs: number;
  wickets: number;
  sixes: number;
  fours: number;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  date: string;
  time: string;
  venue: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  round?: 'Group' | 'Semi-Final' | 'Final';
  group?: string;
  result?: string;
  scoreA?: number;
  scoreB?: number;
  wicketsA?: number;
  wicketsB?: number;
  oversA?: string;
  oversB?: string;
  target?: number;
  crr?: string;
  rrr?: string;
  streamUrl?: string;
  events?: MatchEvent[];
  playerStats?: Record<string, MatchPlayerStat>;
}

export interface TeamStats {
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  nrr: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
}

export interface PlayerStats {
  runs: number;
  wickets: number;
  sixes: number;
  fours: number;
  matches: number;
  highestScore: number;
  bestBowling: string;
}
