# ATP Match Predictor

A comprehensive TypeScript-based system for predicting ATP tennis matches using historical data, Elo ratings, and advanced statistical features.

## Features

- **Historical Data Ingestion**: Automated download of ATP match data from 1968-2024
- **Feature Engineering**: Sophisticated tennis-specific features including:
  - Overall and surface-specific Elo ratings (Hard, Clay, Grass)
  - ATP ranking differences
  - Age and height differentials
  - Recent form over 30, 90, and 365-day rolling windows
  - Surface-specific win rates
  - Head-to-head records
  - Tournament-level analysis
- **Baseline Prediction Model**: TypeScript-based logistic model with weighted features
- **Interactive Web Application**: Next.js-based UI for exploring data and making predictions
- **Feature Explanations**: Visual breakdown of which factors drive each prediction

## Project Structure

```
atp-predictor/
├── packages/
│   ├── data/           # Data ingestion and parsing
│   ├── features/       # Feature calculation (Elo, form, etc.)
│   └── model/          # Prediction models
├── apps/
│   └── web/            # Next.js web application
└── data/               # Downloaded and processed data (gitignored)
```

## Data Provenance

**Source**: Jeff Sackmann's tennis_atp GitHub repository
**Repository**: https://github.com/JeffSackmann/tennis_atp
**Coverage**: 1968-2024 ATP matches
**Data Description**: Comprehensive ATP match data including:
- Match results and scores
- Player rankings and biographical data
- Serve statistics (where available)
- Tournament metadata

The tennis_atp repository is the most complete and widely-used public source for ATP historical data, maintained with regular updates.

## Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Download ATP historical data (1968-2024)
# This will download ~50+ CSV files from the tennis_atp repository
npm run ingest

# Process raw data and compute features
# This may take several minutes depending on data size
npm run process
```

### Development

```bash
# Run the web app in development mode
npm run dev

# Visit http://localhost:3000
```

### Production Build

```bash
# Build all packages and the web app
npm run build

# Start production server
npm start
```

## Usage

### 1. Data Ingestion

```bash
npm run ingest
```

Downloads ATP match data files from the tennis_atp repository. Data is saved to `data/raw/`. A `data/data-provenance.json` file is created documenting the exact source and download timestamp.

### 2. Data Processing

```bash
npm run process
```

Parses raw CSV files and consolidates them into `data/processed/all_matches.csv`. Validates data and generates summary statistics.

### 3. Web Application

The web app provides three main sections:

#### Home Page
- Overview of the system
- Recent matches display
- Quick navigation to prediction and exploration

#### Predict (`/predict`)
- Enter two player names
- Select surface (Hard, Clay, Grass, Carpet)
- Choose tournament level (Grand Slam, Masters, ATP 500/250)
- Get win probability prediction for each player
- View confidence score
- See feature importance breakdown

#### Explore (`/explore`)
- Top players by Elo rating
- Recent match history
- Dataset statistics
- Player career records

## Model Details

### Baseline Predictor

The baseline model is a weighted linear model with logistic transformation, implemented entirely in TypeScript. It combines multiple features:

**Feature Weights** (calibrated based on tennis prediction best practices):
- Elo difference: 0.0025
- Surface-specific Elo: 0.0015
- Ranking difference: -0.015 (lower rank = better)
- Recent form (30 days): 1.5
- Medium-term form (90 days): 0.8
- Surface-specific form: 1.2
- Head-to-head: 0.3

**Output**:
- Win probability for each player (0-100%)
- Confidence score (how decisive the features are)
- Feature importance (relative contribution of each feature)

### Why TypeScript?

The baseline model is implemented in pure TypeScript to keep the system self-contained and easily deployable. For production use cases requiring higher accuracy, the feature engineering pipeline can export data to Python-based ML frameworks (scikit-learn, XGBoost, etc.). The architecture cleanly separates feature calculation from prediction, making hybrid approaches straightforward.

## Feature Engineering

### Elo Rating System

Elo ratings are computed dynamically as matches are processed chronologically:

- **Initial Rating**: 1500
- **K-Factor**: 32
- **Separate Ratings**: Overall + surface-specific (Hard, Clay, Grass, Carpet)
- **Updates**: After each match based on expected vs. actual outcome

### Rolling Form Windows

For each player, we track:
- Matches and wins in last 30 days
- Matches and wins in last 90 days
- Matches and wins in last 365 days
- Surface-specific career win rates

### Head-to-Head

For any matchup, we compute the historical record between the two players, considering all previous matches in chronological order.

## API Routes

### POST `/api/predict`

Request body:
```json
{
  "player1": "Rafael Nadal",
  "player2": "Roger Federer",
  "surface": "Clay",
  "tourneyLevel": "G"
}
```

Response:
```json
{
  "prediction": {
    "player1WinProbability": 0.68,
    "player2WinProbability": 0.32,
    "confidence": 0.72,
    "featureImportance": {
      "eloDiff": 0.25,
      "surfaceEloDiff": 0.35,
      "rankDiff": 0.10,
      "formDiff": 0.15,
      "surfaceFormDiff": 0.10,
      "headToHead": 0.05
    }
  },
  "player1": "Rafael Nadal",
  "player2": "Roger Federer"
}
```

## Scripts

- `npm run build`: Build all packages
- `npm run dev`: Start development server
- `npm run ingest`: Download ATP data
- `npm run process`: Process and consolidate data
- `npm run type-check`: Run TypeScript type checking
- `npm run clean`: Clean all build artifacts and dependencies

## Technology Stack

- **TypeScript**: Primary language
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Styling
- **csv-parse/stringify**: CSV processing
- **Node.js**: Runtime for data scripts

## Performance Notes

- Data processing is done once; features are computed chronologically to avoid lookahead bias
- Web app caches computed features in memory for fast prediction
- Initial page load may take time if processing large dataset
- Consider pre-computing and caching features for production deployment

## Future Enhancements

- Export features to train scikit-learn or XGBoost models
- Add player search autocomplete
- Include serve/return statistics in predictions
- Integrate live tournament data via ATP API
- Add betting odds comparison
- Historical prediction backtesting dashboard

## License

This project is for educational and research purposes. The ATP match data is sourced from Jeff Sackmann's tennis_atp repository, which is publicly available on GitHub.

## Acknowledgments

- **Jeff Sackmann** for maintaining the comprehensive tennis_atp dataset
- Tennis analytics community for Elo rating methodologies
- ATP for providing the foundation of professional tennis statistics
