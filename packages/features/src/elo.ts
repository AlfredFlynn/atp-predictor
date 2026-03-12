const INITIAL_ELO = 1500;
const K_FACTOR = 32;

export class EloCalculator {
  private ratings: Map<string, number> = new Map();
  private surfaceRatings: Map<string, Map<string, number>> = new Map();

  constructor() {
    // Initialize surface maps
    ['Hard', 'Clay', 'Grass', 'Carpet'].forEach(surface => {
      this.surfaceRatings.set(surface, new Map());
    });
  }

  getElo(playerId: string): number {
    return this.ratings.get(playerId) || INITIAL_ELO;
  }

  getSurfaceElo(playerId: string, surface: string): number {
    const surfaceMap = this.surfaceRatings.get(surface);
    if (!surfaceMap) return INITIAL_ELO;
    return surfaceMap.get(playerId) || INITIAL_ELO;
  }

  private expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  updateRatings(winnerId: string, loserId: string, surface: string): void {
    // Update overall Elo
    const winnerElo = this.getElo(winnerId);
    const loserElo = this.getElo(loserId);

    const expectedWinner = this.expectedScore(winnerElo, loserElo);
    const expectedLoser = this.expectedScore(loserElo, winnerElo);

    const newWinnerElo = winnerElo + K_FACTOR * (1 - expectedWinner);
    const newLoserElo = loserElo + K_FACTOR * (0 - expectedLoser);

    this.ratings.set(winnerId, newWinnerElo);
    this.ratings.set(loserId, newLoserElo);

    // Update surface-specific Elo
    const surfaceMap = this.surfaceRatings.get(surface);
    if (surfaceMap) {
      const winnerSurfaceElo = surfaceMap.get(winnerId) || INITIAL_ELO;
      const loserSurfaceElo = surfaceMap.get(loserId) || INITIAL_ELO;

      const expectedWinnerSurface = this.expectedScore(winnerSurfaceElo, loserSurfaceElo);
      const expectedLoserSurface = this.expectedScore(loserSurfaceElo, winnerSurfaceElo);

      const newWinnerSurfaceElo = winnerSurfaceElo + K_FACTOR * (1 - expectedWinnerSurface);
      const newLoserSurfaceElo = loserSurfaceElo + K_FACTOR * (0 - expectedLoserSurface);

      surfaceMap.set(winnerId, newWinnerSurfaceElo);
      surfaceMap.set(loserId, newLoserSurfaceElo);
    }
  }

  reset(): void {
    this.ratings.clear();
    this.surfaceRatings.forEach(map => map.clear());
  }
}
