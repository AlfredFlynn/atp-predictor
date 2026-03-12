'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PredictionResult {
  player1WinProbability: number
  player2WinProbability: number
  confidence: number
  featureImportance: {
    eloDiff: number
    surfaceEloDiff: number
    rankDiff: number
    formDiff: number
    surfaceFormDiff: number
    headToHead: number
  }
}

export default function PredictPage() {
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [surface, setSurface] = useState('Hard')
  const [tourneyLevel, setTourneyLevel] = useState('A')
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePredict = async () => {
    if (!player1 || !player2) {
      setError('Please enter both player names')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1,
          player2,
          surface,
          tourneyLevel,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Prediction failed')
      }

      const data = await response.json()
      setPrediction(data.prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Match Prediction</h1>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player 1 Name
                </label>
                <input
                  type="text"
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  placeholder="e.g., Rafael Nadal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player 2 Name
                </label>
                <input
                  type="text"
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="e.g., Roger Federer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surface</label>
                <select
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Hard">Hard</option>
                  <option value="Clay">Clay</option>
                  <option value="Grass">Grass</option>
                  <option value="Carpet">Carpet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Level
                </label>
                <select
                  value={tourneyLevel}
                  onChange={(e) => setTourneyLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="G">Grand Slam</option>
                  <option value="M">Masters 1000</option>
                  <option value="A">ATP 500</option>
                  <option value="D">ATP 250</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                {loading ? 'Predicting...' : 'Predict Winner'}
              </button>
            </div>
          </div>

          {prediction && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prediction Result</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-lg font-medium text-gray-700 mb-2">{player1}</div>
                  <div className="text-4xl font-bold text-blue-600">
                    {(prediction.player1WinProbability * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Win Probability</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-lg font-medium text-gray-700 mb-2">{player2}</div>
                  <div className="text-4xl font-bold text-gray-600">
                    {(prediction.player2WinProbability * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Win Probability</div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Confidence</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Feature Importance</h3>
                <div className="space-y-3">
                  {Object.entries(prediction.featureImportance).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Predictions are based on historical Elo ratings, recent form,
                  head-to-head records, and surface-specific performance. Use as a guide, not a
                  guarantee.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
