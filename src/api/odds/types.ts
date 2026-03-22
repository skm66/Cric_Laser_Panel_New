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
    teamAName?: string;
    teamBName?: string;
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
    matchKey: string;
    teamA: string;
    teamAFull: string;
    teamB: string;
    teamBFull: string;
    format: string;
    tournament: string;
    startTime: string;
    matchStatus: string;
    hasOddsHistory: boolean;
    orderNumber: number;
    uniqueNumber: string;
    // Latest odds snapshot
    latestTeam1Min?: number;
    latestTeam1Max?: number;
    latestTeam2Min?: number;
    latestTeam2Max?: number;
    latestDrawMin?: number;
    latestDrawMax?: number;
    latestSessionMin?: number;
    latestSessionMax?: number;
    latestLambiMin?: number;
    latestLambiMax?: number;
    latestOverNumber?: number;
};
