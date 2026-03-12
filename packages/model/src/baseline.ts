import { MatchFeatures } from '@atp/features';

export interface Prediction {
  player1WinProbability: number;
  player2WinProbability: number;
  confidence: number;
  featureImportance: FeatureImportance;
}

export interface FeatureImportance {
  eloDiff: number;
  surfaceEloDiff: number;
  rankDiff: number;
  formDiff: number;
  surfaceFormDiff: number;
  headToHead: number;
}

export class BaselinePredictor {
  // Logistic function for probability
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Weighted feature combination for prediction
  // This is a simple linear model with learned weights approximating
  // what a logistic regression would learn from historical data
  predict(features: MatchFeatures): Prediction {
    // Feature weights (calibrated based on typical importance in tennis prediction)
    const weights = {
      elo: 0.0025,           // Elo difference is highly predictive
      surfaceElo: 0.0015,    // Surface-specific Elo also important
      rank: -0.015,          // Lower rank number is better (negative weight)
      form30d: 1.5,          // Recent form is very important
      form90d: 0.8,          // Medium-term form
      surfaceForm: 1.2,      // Surface-specific form
      h2h: 0.3,              // Head-to-head has moderate importance
    };

    // Calculate feature contributions
    const eloContrib = features.eloDiff * weights.elo;
    const surfaceEloContrib = features.surfaceEloDiff * weights.surfaceElo;

    const rankContrib = features.rankDiff !== null ? features.rankDiff * weights.rank : 0;

    const form30dDiff = features.p1WinRate30d - features.p2WinRate30d;
    const formContrib = form30dDiff * weights.form30d;

    const form90dDiff = features.p1WinRate90d - features.p2WinRate90d;
    const form90Contrib = form90dDiff * weights.form90d;

    const surfaceFormDiff = features.p1SurfaceWinRate - features.p2SurfaceWinRate;
    const surfaceFormContrib = surfaceFormDiff * weights.surfaceForm;

    let h2hContrib = 0;
    if (features.h2hTotal > 0) {
      const h2hDiff = (features.h2hPlayer1Wins - features.h2hPlayer2Wins) / features.h2hTotal;
      h2hContrib = h2hDiff * weights.h2h;
    }

    // Total score
    const totalScore = eloContrib + surfaceEloContrib + rankContrib + formContrib +
                       form90Contrib + surfaceFormContrib + h2hContrib;

    // Convert to probability
    const player1WinProb = this.sigmoid(totalScore);
    const player2WinProb = 1 - player1WinProb;

    // Calculate confidence based on how decisive the features are
    const confidence = Math.abs(player1WinProb - 0.5) * 2; // 0 to 1 scale

    // Calculate feature importance (relative contribution to decision)
    const absTotal = Math.abs(eloContrib) + Math.abs(surfaceEloContrib) +
                     Math.abs(rankContrib) + Math.abs(formContrib) +
                     Math.abs(surfaceFormContrib) + Math.abs(h2hContrib);

    const featureImportance: FeatureImportance = {
      eloDiff: absTotal > 0 ? Math.abs(eloContrib) / absTotal : 0,
      surfaceEloDiff: absTotal > 0 ? Math.abs(surfaceEloContrib) / absTotal : 0,
      rankDiff: absTotal > 0 ? Math.abs(rankContrib) / absTotal : 0,
      formDiff: absTotal > 0 ? (Math.abs(formContrib) + Math.abs(form90Contrib)) / absTotal : 0,
      surfaceFormDiff: absTotal > 0 ? Math.abs(surfaceFormContrib) / absTotal : 0,
      headToHead: absTotal > 0 ? Math.abs(h2hContrib) / absTotal : 0,
    };

    return {
      player1WinProbability: player1WinProb,
      player2WinProbability: player2WinProb,
      confidence,
      featureImportance,
    };
  }

  // Evaluate model accuracy on a set of matches
  evaluate(matches: MatchFeatures[]): { accuracy: number; logLoss: number } {
    let correct = 0;
    let logLoss = 0;

    for (const match of matches) {
      const prediction = this.predict(match);
      const predicted = prediction.player1WinProbability > 0.5;
      const actual = match.player1Won;

      if (predicted === actual) correct++;

      // Log loss calculation
      const prob = actual ? prediction.player1WinProbability : prediction.player2WinProbability;
      logLoss += -Math.log(Math.max(prob, 0.0001)); // Avoid log(0)
    }

    return {
      accuracy: correct / matches.length,
      logLoss: logLoss / matches.length,
    };
  }
}
