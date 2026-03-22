export interface InningsScore {
  teamName: string;
  runs: number;
  wickets: number;
  overs: string;
}

export interface MatchResultItem {
  matchId: number;
  result: 'W' | 'L';
  opponent: string;
  opponentFull: string;
  opponentLogo: string | null;
  format: string;
  tournament: string;
  startTime: string | null;
  endTime: string | null;
  innings: InningsScore[];
}

export interface TeamFormResponse {
  teamId: number;
  teamName: string;
  teamShortCode: string;
  teamLogoUrl: string | null;
  lastFive: MatchResultItem[];
  wins: number;
  losses: number;
  winRatio: number;
}

export interface HeadToHeadResponse {
  teamAId: number;
  teamAName: string;
  teamAShortCode: string;
  teamALogoUrl: string | null;
  teamBId: number;
  teamBName: string;
  teamBShortCode: string;
  teamBLogoUrl: string | null;
  teamAWins: number;
  teamBWins: number;
  totalMatches: number;
  matches: MatchResultItem[];
}

export interface RecentMatchItem {
  matchId: number;
  teamA: string;
  teamAFull: string;
  teamALogo: string | null;
  teamB: string;
  teamBFull: string;
  teamBLogo: string | null;
  format: string;
  tournament: string;
  winningTeam: number;
  winnerName: string;
  startTime: string | null;
  endTime: string | null;
  innings: InningsScore[];
}

export interface TeamOption {
  id: number;
  name: string;
  shortCode: string;
  logoUrl: string | null;
}
