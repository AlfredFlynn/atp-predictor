# Quick Start Guide

## First Time Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Download ATP data (optional, but recommended)
npm run ingest

# 4. Process the data (optional, required if you ran step 3)
npm run process

# 5. Start the app
npm run dev
```

Open http://localhost:3000

## Without Data (Demo Mode)

If you skip steps 3-4, the app will still work but show "No data available" messages. You can still explore the UI and code structure.

## Common Commands

```bash
npm run dev         # Start development server
npm run build       # Build all packages
npm run type-check  # Check TypeScript types
npm run ingest      # Download ATP match data
npm run process     # Process downloaded data
npm run clean       # Clean build artifacts
```

## Project Structure

```
packages/
  data/       - Data download & processing
  features/   - Elo ratings, form calculation
  model/      - Prediction algorithms
apps/
  web/        - Next.js web interface
```

## Making Predictions

1. Go to http://localhost:3000/predict
2. Enter player names (e.g., "Nadal", "Federer")
3. Select surface and tournament level
4. Click "Predict Winner"
5. View probabilities and feature importance

## Exploring Data

1. Go to http://localhost:3000/explore
2. View top players by Elo rating
3. Browse recent match history
4. See dataset statistics

## Data Source

All data from: https://github.com/JeffSackmann/tennis_atp
- Coverage: 1968-2024
- Includes match results, rankings, and statistics
- Updated regularly by Jeff Sackmann

## Troubleshooting

**"No match data available"**
→ Run `npm run ingest` then `npm run process`

**Build fails**
→ Run `npm run clean`, then `npm install`, then `npm run build`

**Player not found**
→ Use partial names like "Nadal" instead of full names

**Port already in use**
→ Change port: `PORT=3001 npm run dev`

## Architecture

The system processes matches chronologically to compute:
- **Elo ratings** (overall + per surface)
- **Recent form** (30/90/365 day windows)
- **Head-to-head** records
- **Surface performance** (Hard/Clay/Grass)

Predictions use a weighted model combining these features with a logistic transformation.

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Read [DEVELOPMENT.md](DEVELOPMENT.md) for developer guide
- Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for overview

## Questions?

Check the README or DEVELOPMENT docs for more details.
