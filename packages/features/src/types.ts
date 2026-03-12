export interface PlayerFeatures {
  playerId: string;
  playerName: string;
  elo: number;
  eloGrass: number;
  eloClay: number;
  eloHard: number;
  currentRank: number | null;
  age: number | null;
  height: number | null;
  matchesLast30Days: number;
  winsLast30Days: number;
  matchesLast90Days: number;
  winsLast90Days: number;
  matchesLast365Days: number;
  winsLast365Days: number;
  careerWins: number;
  careerLosses: number;
  surfaceWins: Record<string, number>;
  surfaceLosses: Record<string, number>;
  lastMatchDate: Date | null;
}

export interface MatchFeatures {
  date: Date;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  surface: string;
  tourneyLevel: string;

  // Elo features
  p1Elo: number;
  p2Elo: number;
  eloDiff: number;
  p1SurfaceElo: number;
  p2SurfaceElo: number;
  surfaceEloDiff: number;

  // Ranking features
  p1Rank: number | null;
  p2Rank: number | null;
  rankDiff: number | null;

  // Physical features
  p1Age: number | null;
  p2Age: number | null;
  ageDiff: number | null;
  p1Height: number | null;
  p2Height: number | null;
  heightDiff: number | null;

  // Form features (rolling windows)
  p1WinRate30d: number;
  p2WinRate30d: number;
  p1WinRate90d: number;
  p2WinRate90d: number;
  p1WinRate365d: number;
  p2WinRate365d: number;

  // Surface-specific form
  p1SurfaceWinRate: number;
  p2SurfaceWinRate: number;

  // Head-to-head
  h2hPlayer1Wins: number;
  h2hPlayer2Wins: number;
  h2hTotal: number;

  // Actual outcome (for training)
  player1Won: boolean;
}
