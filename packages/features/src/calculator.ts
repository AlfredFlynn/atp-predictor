import { ProcessedMatch } from '@atp/data';
import { PlayerFeatures, MatchFeatures } from './types';
import { EloCalculator } from './elo';

const DAY_MS = 24 * 60 * 60 * 1000;

export class FeatureCalculator {
  private elo = new EloCalculator();
  private playerStats = new Map<string, PlayerFeatures>();
  private matchHistory = new Map<string, ProcessedMatch[]>();

  private initPlayerFeatures(playerId: string, playerName: string): PlayerFeatures {
    return {
      playerId,
      playerName,
      elo: 1500,
      eloGrass: 1500,
      eloClay: 1500,
      eloHard: 1500,
      currentRank: null,
      age: null,
      height: null,
      matchesLast30Days: 0,
      winsLast30Days: 0,
      matchesLast90Days: 0,
      winsLast90Days: 0,
      matchesLast365Days: 0,
      winsLast365Days: 0,
      careerWins: 0,
      careerLosses: 0,
      surfaceWins: {},
      surfaceLosses: {},
      lastMatchDate: null,
    };
  }

  private getPlayerFeatures(playerId: string, playerName: string): PlayerFeatures {
    if (!this.playerStats.has(playerId)) {
      this.playerStats.set(playerId, this.initPlayerFeatures(playerId, playerName));
    }
    return this.playerStats.get(playerId)!;
  }

  private getRecentMatches(playerId: string, currentDate: Date, daysBack: number): ProcessedMatch[] {
    const history = this.matchHistory.get(playerId) || [];
    const cutoffDate = new Date(currentDate.getTime() - daysBack * DAY_MS);

    return history.filter(m => m.date >= cutoffDate && m.date < currentDate);
  }

  private calculateWinRate(matches: ProcessedMatch[], playerId: string): number {
    if (matches.length === 0) return 0;
    const wins = matches.filter(m => m.winnerId === playerId).length;
    return wins / matches.length;
  }

  private getSurfaceWinRate(player: PlayerFeatures, surface: string): number {
    const wins = player.surfaceWins[surface] || 0;
    const losses = player.surfaceLosses[surface] || 0;
    const total = wins + losses;
    return total > 0 ? wins / total : 0;
  }

  private getHeadToHead(player1Id: string, player2Id: string, currentDate: Date): { p1Wins: number; p2Wins: number; total: number } {
    const p1History = this.matchHistory.get(player1Id) || [];
    const p2History = this.matchHistory.get(player2Id) || [];

    let p1Wins = 0;
    let p2Wins = 0;

    // Check player1's matches against player2
    for (const match of p1History) {
      if (match.date >= currentDate) break;
      if (match.winnerId === player1Id && match.loserId === player2Id) p1Wins++;
      if (match.winnerId === player2Id && match.loserId === player1Id) p2Wins++;
    }

    const total = p1Wins + p2Wins;
    return { p1Wins, p2Wins, total };
  }

  computeMatchFeatures(match: ProcessedMatch): MatchFeatures {
    const p1 = this.getPlayerFeatures(match.winnerId, match.winnerName);
    const p2 = this.getPlayerFeatures(match.loserId, match.loserName);

    // Update rolling window stats
    const p1Recent30 = this.getRecentMatches(match.winnerId, match.date, 30);
    const p1Recent90 = this.getRecentMatches(match.winnerId, match.date, 90);
    const p1Recent365 = this.getRecentMatches(match.winnerId, match.date, 365);
    const p2Recent30 = this.getRecentMatches(match.loserId, match.date, 30);
    const p2Recent90 = this.getRecentMatches(match.loserId, match.date, 90);
    const p2Recent365 = this.getRecentMatches(match.loserId, match.date, 365);

    p1.matchesLast30Days = p1Recent30.length;
    p1.winsLast30Days = p1Recent30.filter(m => m.winnerId === match.winnerId).length;
    p1.matchesLast90Days = p1Recent90.length;
    p1.winsLast90Days = p1Recent90.filter(m => m.winnerId === match.winnerId).length;
    p1.matchesLast365Days = p1Recent365.length;
    p1.winsLast365Days = p1Recent365.filter(m => m.winnerId === match.winnerId).length;

    p2.matchesLast30Days = p2Recent30.length;
    p2.winsLast30Days = p2Recent30.filter(m => m.winnerId === match.loserId).length;
    p2.matchesLast90Days = p2Recent90.length;
    p2.winsLast90Days = p2Recent90.filter(m => m.winnerId === match.loserId).length;
    p2.matchesLast365Days = p2Recent365.length;
    p2.winsLast365Days = p2Recent365.filter(m => m.winnerId === match.loserId).length;

    // Get Elo ratings before update
    const p1Elo = this.elo.getElo(match.winnerId);
    const p2Elo = this.elo.getElo(match.loserId);
    const p1SurfaceElo = this.elo.getSurfaceElo(match.winnerId, match.surface);
    const p2SurfaceElo = this.elo.getSurfaceElo(match.loserId, match.surface);

    // Update player rankings and physical stats
    if (match.winnerRank !== null) p1.currentRank = match.winnerRank;
    if (match.loserRank !== null) p2.currentRank = match.loserRank;
    if (match.winnerAge !== null) p1.age = match.winnerAge;
    if (match.loserAge !== null) p2.age = match.loserAge;
    if (match.winnerHeight !== null) p1.height = match.winnerHeight;
    if (match.loserHeight !== null) p2.height = match.loserHeight;

    // Get head-to-head
    const h2h = this.getHeadToHead(match.winnerId, match.loserId, match.date);

    // Compute features
    const features: MatchFeatures = {
      date: match.date,
      player1Id: match.winnerId,
      player1Name: match.winnerName,
      player2Id: match.loserId,
      player2Name: match.loserName,
      surface: match.surface,
      tourneyLevel: match.tourneyLevel,

      p1Elo,
      p2Elo,
      eloDiff: p1Elo - p2Elo,
      p1SurfaceElo,
      p2SurfaceElo,
      surfaceEloDiff: p1SurfaceElo - p2SurfaceElo,

      p1Rank: p1.currentRank,
      p2Rank: p2.currentRank,
      rankDiff: p1.currentRank !== null && p2.currentRank !== null ? p1.currentRank - p2.currentRank : null,

      p1Age: p1.age,
      p2Age: p2.age,
      ageDiff: p1.age !== null && p2.age !== null ? p1.age - p2.age : null,
      p1Height: p1.height,
      p2Height: p2.height,
      heightDiff: p1.height !== null && p2.height !== null ? p1.height - p2.height : null,

      p1WinRate30d: this.calculateWinRate(p1Recent30, match.winnerId),
      p2WinRate30d: this.calculateWinRate(p2Recent30, match.loserId),
      p1WinRate90d: this.calculateWinRate(p1Recent90, match.winnerId),
      p2WinRate90d: this.calculateWinRate(p2Recent90, match.loserId),
      p1WinRate365d: this.calculateWinRate(p1Recent365, match.winnerId),
      p2WinRate365d: this.calculateWinRate(p2Recent365, match.loserId),

      p1SurfaceWinRate: this.getSurfaceWinRate(p1, match.surface),
      p2SurfaceWinRate: this.getSurfaceWinRate(p2, match.surface),

      h2hPlayer1Wins: h2h.p1Wins,
      h2hPlayer2Wins: h2h.p2Wins,
      h2hTotal: h2h.total,

      player1Won: true, // Winner is always player1 in our setup
    };

    // Update stats after computing features
    this.updateStats(match);

    return features;
  }

  private updateStats(match: ProcessedMatch): void {
    const winner = this.getPlayerFeatures(match.winnerId, match.winnerName);
    const loser = this.getPlayerFeatures(match.loserId, match.loserName);

    // Update Elo
    this.elo.updateRatings(match.winnerId, match.loserId, match.surface);
    winner.elo = this.elo.getElo(match.winnerId);
    loser.elo = this.elo.getElo(match.loserId);
    winner.eloGrass = this.elo.getSurfaceElo(match.winnerId, 'Grass');
    winner.eloClay = this.elo.getSurfaceElo(match.winnerId, 'Clay');
    winner.eloHard = this.elo.getSurfaceElo(match.winnerId, 'Hard');
    loser.eloGrass = this.elo.getSurfaceElo(match.loserId, 'Grass');
    loser.eloClay = this.elo.getSurfaceElo(match.loserId, 'Clay');
    loser.eloHard = this.elo.getSurfaceElo(match.loserId, 'Hard');

    // Update career stats
    winner.careerWins++;
    loser.careerLosses++;
    winner.surfaceWins[match.surface] = (winner.surfaceWins[match.surface] || 0) + 1;
    loser.surfaceLosses[match.surface] = (loser.surfaceLosses[match.surface] || 0) + 1;

    winner.lastMatchDate = match.date;
    loser.lastMatchDate = match.date;

    // Update match history
    if (!this.matchHistory.has(match.winnerId)) {
      this.matchHistory.set(match.winnerId, []);
    }
    if (!this.matchHistory.has(match.loserId)) {
      this.matchHistory.set(match.loserId, []);
    }
    this.matchHistory.get(match.winnerId)!.push(match);
    this.matchHistory.get(match.loserId)!.push(match);
  }

  getPlayerStats(): Map<string, PlayerFeatures> {
    return this.playerStats;
  }
}
