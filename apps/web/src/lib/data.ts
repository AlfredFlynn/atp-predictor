import * as fs from 'fs';
import * as path from 'path';
import { loadProcessedMatches } from '@atp/data';
import { FeatureCalculator, MatchFeatures, PlayerFeatures } from '@atp/features';

let cachedFeatures: MatchFeatures[] | null = null;
let cachedPlayerStats: Map<string, PlayerFeatures> | null = null;

export async function getMatchFeatures(): Promise<MatchFeatures[]> {
  if (cachedFeatures) {
    return cachedFeatures;
  }

  const dataPath = path.join(process.cwd(), '../../data/processed/all_matches.csv');

  if (!fs.existsSync(dataPath)) {
    return [];
  }

  const matches = await loadProcessedMatches(dataPath);
  const calculator = new FeatureCalculator();

  const features: MatchFeatures[] = [];
  for (const match of matches) {
    const matchFeatures = calculator.computeMatchFeatures(match);
    features.push(matchFeatures);
  }

  cachedFeatures = features;
  cachedPlayerStats = calculator.getPlayerStats();

  return features;
}

export async function getPlayerStats(): Promise<Map<string, PlayerFeatures>> {
  if (cachedPlayerStats) {
    return cachedPlayerStats;
  }

  await getMatchFeatures();
  return cachedPlayerStats || new Map();
}

export async function getRecentMatches(limit: number = 50): Promise<MatchFeatures[]> {
  const features = await getMatchFeatures();
  return features.slice(-limit).reverse();
}

export async function searchPlayers(query: string): Promise<PlayerFeatures[]> {
  const stats = await getPlayerStats();
  const lowerQuery = query.toLowerCase();

  return Array.from(stats.values())
    .filter(p => p.playerName.toLowerCase().includes(lowerQuery))
    .sort((a, b) => b.careerWins - a.careerWins)
    .slice(0, 20);
}
