import Link from 'next/link'
import { getRecentMatches, getPlayerStats } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const recentMatches = await getRecentMatches(100)
  const playerStats = await getPlayerStats()

  const topPlayers = Array.from(playerStats.values())
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 20)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Explore Data</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Players by Elo</h2>
              {topPlayers.length === 0 ? (
                <p className="text-gray-600">No player data available</p>
              ) : (
                <div className="space-y-4">
                  {topPlayers.map((player, idx) => (
                    <div key={player.playerId} className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400 w-6">{idx + 1}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{player.playerName}</div>
                            <div className="text-sm text-gray-600">
                              {player.careerWins}W - {player.careerLosses}L
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{player.elo.toFixed(0)}</div>
                        <div className="text-xs text-gray-500">Elo Rating</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Matches</h2>
              {recentMatches.length === 0 ? (
                <p className="text-gray-600">No match data available</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {recentMatches.slice(0, 50).map((match, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">{match.player1Name}</div>
                          <div className="text-xs text-gray-600">Elo: {match.p1Elo.toFixed(0)}</div>
                        </div>
                        <div className="px-2 text-xs text-gray-400">def.</div>
                        <div className="flex-1 text-right">
                          <div className="font-medium text-gray-700 text-sm">{match.player2Name}</div>
                          <div className="text-xs text-gray-600">Elo: {match.p2Elo.toFixed(0)}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {match.date.toISOString().split('T')[0]} • {match.surface}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dataset Statistics</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{recentMatches.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Matches</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{playerStats.size}</div>
                <div className="text-sm text-gray-600 mt-1">Players</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {recentMatches.length > 0 ? recentMatches[0].date.getFullYear() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Most Recent Year</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {recentMatches.length > 0
                    ? recentMatches[recentMatches.length - 1].date.getFullYear()
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Earliest Year</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
