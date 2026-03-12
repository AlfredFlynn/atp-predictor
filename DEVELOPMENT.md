# Development Guide

## Architecture

### Monorepo Structure

This project uses npm workspaces to manage a monorepo with multiple packages:

```
packages/
  data/       - Data ingestion, parsing, and I/O
  features/   - Feature engineering (Elo, form, stats)
  model/      - Prediction models
apps/
  web/        - Next.js web application
```

### Data Flow

1. **Ingestion** (`packages/data/src/scripts/ingest.ts`)
   - Downloads raw CSV files from tennis_atp repository
   - Saves to `data/raw/`
   - Creates provenance metadata

2. **Processing** (`packages/data/src/scripts/process.ts`)
   - Parses raw CSVs
   - Consolidates into single file
   - Saves to `data/processed/all_matches.csv`

3. **Feature Calculation** (`packages/features/src/calculator.ts`)
   - Loads processed matches
   - Computes features chronologically
   - Updates Elo ratings, form stats, etc.

4. **Prediction** (`packages/model/src/baseline.ts`)
   - Takes match features
   - Applies weighted model
   - Returns probabilities and feature importance

5. **Web UI** (`apps/web/`)
   - Next.js 14 with App Router
   - Server-side data loading
   - Client-side prediction form
   - API route for predictions

## Key Components

### EloCalculator (`packages/features/src/elo.ts`)

Maintains Elo ratings for all players with separate tracking for each surface. Updates ratings after each match using standard Elo formulas.

**Parameters:**
- Initial Elo: 1500
- K-factor: 32

### FeatureCalculator (`packages/features/src/calculator.ts`)

Processes matches sequentially to build player statistics and compute features. Maintains:
- Player Elo ratings
- Match history for each player
- Rolling window statistics
- Surface-specific records

**Critical**: Processes matches chronologically to avoid lookahead bias.

### BaselinePredictor (`packages/model/src/baseline.ts`)

Linear weighted model with logistic transformation. Feature weights are hand-calibrated based on tennis prediction best practices.

Can be replaced with ML models trained externally (XGBoost, neural nets, etc.) using the same feature interface.

## Development Workflow

### Adding New Features

1. Define feature in `packages/features/src/types.ts` (MatchFeatures interface)
2. Compute feature in `packages/features/src/calculator.ts` (computeMatchFeatures method)
3. Update model to use feature in `packages/model/src/baseline.ts`
4. Update prediction API to include feature in synthetic match creation

### Adding New Models

1. Create new file in `packages/model/src/`
2. Implement interface:
   ```typescript
   interface Predictor {
     predict(features: MatchFeatures): Prediction
   }
   ```
3. Update API route to use new model
4. Export from `packages/model/src/index.ts`

### Testing Predictions

Use the API route directly:

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "player1": "Nadal",
    "player2": "Federer",
    "surface": "Clay",
    "tourneyLevel": "G"
  }'
```

## Performance Optimization

### Current Bottlenecks

1. **Initial data processing**: Parsing 50+ years of matches takes time
   - Solution: Process once, cache features
   - Consider: Pre-compute features in build step

2. **Web app cold start**: Computing features on first load
   - Solution: Implement proper caching layer
   - Consider: Redis or file-based cache

3. **Large dataset in memory**: Full match history loaded
   - Solution: Database (SQLite, PostgreSQL)
   - Consider: Pagination and lazy loading

### Optimization Ideas

1. **Pre-compute features**
   ```bash
   npm run process -- --with-features
   ```
   Save computed features to disk, load directly

2. **Database integration**
   - Store matches and features in SQLite
   - Query specific ranges as needed

3. **Incremental updates**
   - Download only new matches
   - Update existing features

## Testing

### Unit Tests (TODO)

```typescript
// Example test structure
describe('EloCalculator', () => {
  it('should update ratings correctly', () => {
    const elo = new EloCalculator()
    elo.updateRatings('player1', 'player2', 'Hard')
    expect(elo.getElo('player1')).toBeGreaterThan(1500)
    expect(elo.getElo('player2')).toBeLessThan(1500)
  })
})
```

### Integration Tests (TODO)

Test full prediction pipeline with sample data.

### Validation

Backtest predictions against held-out data:

```typescript
const testMatches = matches.slice(-1000)
const predictor = new BaselinePredictor()
const results = predictor.evaluate(testMatches)
console.log(`Accuracy: ${results.accuracy}`)
console.log(`Log Loss: ${results.logLoss}`)
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Important**: Pre-process data before deployment. Include `data/processed/all_matches.csv` in deployment or load from external storage.

### Docker (Alternative)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### Environment Variables

None required for basic operation. Optional:

- `DATA_PATH`: Override default data directory
- `CACHE_TTL`: Feature cache time-to-live

## Troubleshooting

### "No match data available"

Run data ingestion and processing:
```bash
npm run ingest
npm run process
```

### "Player not found"

Data may not be loaded or player name doesn't match. Try partial names:
- "Nadal" instead of "Rafael Nadal"
- "Djokovic" instead of "Novak Djokovic"

### Build fails

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Type errors

```bash
npm run type-check
```

## Contributing

1. Follow existing code style (TypeScript strict mode)
2. Add types for all functions
3. Comment complex algorithms
4. Update README for user-facing changes
5. Update this doc for developer-facing changes

## Resources

- [Jeff Sackmann's tennis_atp](https://github.com/JeffSackmann/tennis_atp)
- [Elo Rating System](https://en.wikipedia.org/wiki/Elo_rating_system)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
