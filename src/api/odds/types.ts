export type OddsHistoryRequest = {
    matchNumber: string;
    team1Min: number;
    team1Max: number;
    team2Min: number;
    team2Max: number;
    drawMin?: number;
    drawMax?: number;
    overNumber?: number;
    sessionMin?: number;
    sessionMax?: number;
    lambiMin?: number;
    lambiMax?: number;
};

export type OddsHistoryResponse = {
    id: number;
    matchId: number;
    matchNumber: string;
    team1Min: number;
    team1Max: number;
    team2Min: number;
    team2Max: number;
    drawMin?: number;
    drawMax?: number;
    overNumber?: number;
    sessionMin?: number;
    sessionMax?: number;
    lambiMin?: number;
    lambiMax?: number;
    createdAt: string;
    updatedAt: string;
};

export type MatchWithOddsResponse = {
    matchId: number;
    teamA: string;
    teamB: string;
    tournament: string;
    startTime: string;
    matchStatus: string;
    hasOddsHistory: boolean;
};
