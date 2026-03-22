export interface LiveMatchDto {
    matchId: string;
    header: string;
    matchType: string;
    state: string;
    teamA: string;
    teamB: string;
    innings: InningsDto[];
}

export interface InningsDto {
    title: string;
    total: string; // e.g. "268-3"
    currentScore: string;
    batters: BatterDto[];
    bowlers: BowlerDto[];
    extras: string;

    currentStrikerId: number;
    currentStriker: string;
    currentNonStrikerId: number;
    currentNonStriker: string;

    currentOver: OverDto;
}

export interface BatterDto {
    id: number;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
    dismissal: string; // "not out" or text
}

export interface BowlerDto {
    id: number;
    name: string;
    overs: string; // "10.0"
    maidens: number;
    runsConceded: number;
    wickets: number;
    economy: string;
}

export interface OverDto {
    overNumber: number;
    balls: string[]; // ["1", "0", "4"]
    runs: string; // runs in this over?
    teamRuns: string; // ?
    bowlerId: number;
    bowlerName: string;
}
