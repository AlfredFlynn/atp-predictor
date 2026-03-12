import Link from 'next/link'
import { getRecentMatches } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const recentMatches = await getRecentMatches(20)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">ATP Match Predictor</h1>
          <p className="text-xl text-gray-600 mb-8">
            Predict tennis matches using historical data, Elo ratings, and advanced features
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/predict"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
            >
              Make Prediction
            </Link>
            <Link
              href="/explore"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
            >
              Explore Data
            </Link>
          </div>
        </header>

        <section className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Elo Ratings</h3>
                <p className="text-gray-700">Overall and surface-specific Elo ratings updated match-by-match</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Recent Form</h3>
                <p className="text-gray-700">Win rates over 30, 90, and 365-day rolling windows</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Head-to-Head</h3>
                <p className="text-gray-700">Historical matchup statistics between players</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Surface Analysis</h3>
                <p className="text-gray-700">Performance on hard, clay, and grass courts</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Ranking & Physical</h3>
                <p className="text-gray-700">ATP rankings, age, height differences</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Feature Explanations</h3>
                <p className="text-gray-700">See which factors drive each prediction</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Matches</h2>
            {recentMatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No match data available</p>
                <p className="text-sm text-gray-500">
                  Run <code className="bg-gray-100 px-2 py-1 rounded">npm run ingest</code> and{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">npm run process</code> to load data
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMatches.slice(0, 10).map((match, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{match.player1Name}</div>
                        <div className="text-sm text-gray-600">
                          Elo: {match.p1Elo.toFixed(0)} | Rank: {match.p1Rank || 'N/A'}
                        </div>
                      </div>
                      <div className="px-4 text-gray-400">vs</div>
                      <div className="flex-1 text-right">
                        <div className="font-semibold text-gray-900">{match.player2Name}</div>
                        <div className="text-sm text-gray-600">
                          Elo: {match.p2Elo.toFixed(0)} | Rank: {match.p2Rank || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {match.date.toISOString().split('T')[0]} • {match.tourneyLevel} • {match.surface}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Data source: Jeff Sackmann&apos;s tennis_atp repository (1968-2024)
          </p>
        </footer>
      </div>
    </div>
  )
}
