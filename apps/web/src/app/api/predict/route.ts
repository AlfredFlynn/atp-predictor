import { NextRequest, NextResponse } from 'next/server'
import { getPlayerStats, getMatchFeatures } from '@/lib/data'
import { BaselinePredictor } from '@atp/model'
import { MatchFeatures } from '@atp/features'

export async function POST(request: NextRequest) {
  try {
    const { player1, player2, surface, tourneyLevel } = await request.json()

    if (!player1 || !player2) {
      return NextResponse.json({ error: 'Missing player names' }, { status: 400 })
    }

    const playerStats = await getPlayerStats()

    // Find players (case-insensitive partial match)
    const p1Lower = player1.toLowerCase()
    const p2Lower = player2.toLowerCase()

    const p1Match = Array.from(playerStats.values()).find(p =>
      p.playerName.toLowerCase().includes(p1Lower)
    )
    const p2Match = Array.from(playerStats.values()).find(p =>
      p.playerName.toLowerCase().includes(p2Lower)
    )

    if (!p1Match) {
      return NextResponse.json({ error: `Player not found: ${player1}` }, { status: 404 })
    }
    if (!p2Match) {
      return NextResponse.json({ error: `Player not found: ${player2}` }, { status: 404 })
    }

    // Get head-to-head history
    const allMatches = await getMatchFeatures()
    const h2hMatches = allMatches.filter(
      m =>
        (m.player1Id === p1Match.playerId && m.player2Id === p2Match.playerId) ||
        (m.player1Id === p2Match.playerId && m.player2Id === p1Match.playerId)
    )

    let h2hP1Wins = 0
    let h2hP2Wins = 0
    for (const match of h2hMatches) {
      if (match.player1Id === p1Match.playerId && match.player1Won) h2hP1Wins++
      if (match.player1Id === p2Match.playerId && match.player1Won) h2hP2Wins++
    }

    // Get surface-specific Elo
    let p1SurfaceElo = p1Match.elo
    let p2SurfaceElo = p2Match.elo
    if (surface === 'Hard') {
      p1SurfaceElo = p1Match.eloHard
      p2SurfaceElo = p2Match.eloHard
    } else if (surface === 'Clay') {
      p1SurfaceElo = p1Match.eloClay
      p2SurfaceElo = p2Match.eloClay
    } else if (surface === 'Grass') {
      p1SurfaceElo = p1Match.eloGrass
      p2SurfaceElo = p2Match.eloGrass
    }

    // Calculate surface win rates
    const p1SurfaceWins = p1Match.surfaceWins[surface] || 0
    const p1SurfaceLosses = p1Match.surfaceLosses[surface] || 0
    const p1SurfaceTotal = p1SurfaceWins + p1SurfaceLosses
    const p1SurfaceWinRate = p1SurfaceTotal > 0 ? p1SurfaceWins / p1SurfaceTotal : 0

    const p2SurfaceWins = p2Match.surfaceWins[surface] || 0
    const p2SurfaceLosses = p2Match.surfaceLosses[surface] || 0
    const p2SurfaceTotal = p2SurfaceWins + p2SurfaceLosses
    const p2SurfaceWinRate = p2SurfaceTotal > 0 ? p2SurfaceWins / p2SurfaceTotal : 0

    // Calculate recent form
    const p1WinRate30d = p1Match.matchesLast30Days > 0
      ? p1Match.winsLast30Days / p1Match.matchesLast30Days
      : 0
    const p2WinRate30d = p2Match.matchesLast30Days > 0
      ? p2Match.winsLast30Days / p2Match.matchesLast30Days
      : 0

    const p1WinRate90d = p1Match.matchesLast90Days > 0
      ? p1Match.winsLast90Days / p1Match.matchesLast90Days
      : 0
    const p2WinRate90d = p2Match.matchesLast90Days > 0
      ? p2Match.winsLast90Days / p2Match.matchesLast90Days
      : 0

    const p1WinRate365d = p1Match.matchesLast365Days > 0
      ? p1Match.winsLast365Days / p1Match.matchesLast365Days
      : 0
    const p2WinRate365d = p2Match.matchesLast365Days > 0
      ? p2Match.winsLast365Days / p2Match.matchesLast365Days
      : 0

    // Create synthetic match features
    const matchFeatures: MatchFeatures = {
      date: new Date(),
      player1Id: p1Match.playerId,
      player1Name: p1Match.playerName,
      player2Id: p2Match.playerId,
      player2Name: p2Match.playerName,
      surface,
      tourneyLevel,
      p1Elo: p1Match.elo,
      p2Elo: p2Match.elo,
      eloDiff: p1Match.elo - p2Match.elo,
      p1SurfaceElo,
      p2SurfaceElo,
      surfaceEloDiff: p1SurfaceElo - p2SurfaceElo,
      p1Rank: p1Match.currentRank,
      p2Rank: p2Match.currentRank,
      rankDiff:
        p1Match.currentRank !== null && p2Match.currentRank !== null
          ? p1Match.currentRank - p2Match.currentRank
          : null,
      p1Age: p1Match.age,
      p2Age: p2Match.age,
      ageDiff:
        p1Match.age !== null && p2Match.age !== null ? p1Match.age - p2Match.age : null,
      p1Height: p1Match.height,
      p2Height: p2Match.height,
      heightDiff:
        p1Match.height !== null && p2Match.height !== null
          ? p1Match.height - p2Match.height
          : null,
      p1WinRate30d,
      p2WinRate30d,
      p1WinRate90d,
      p2WinRate90d,
      p1WinRate365d,
      p2WinRate365d,
      p1SurfaceWinRate,
      p2SurfaceWinRate,
      h2hPlayer1Wins: h2hP1Wins,
      h2hPlayer2Wins: h2hP2Wins,
      h2hTotal: h2hMatches.length,
      player1Won: true,
    }

    const predictor = new BaselinePredictor()
    const prediction = predictor.predict(matchFeatures)

    return NextResponse.json({
      prediction,
      player1: p1Match.playerName,
      player2: p2Match.playerName,
    })
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
